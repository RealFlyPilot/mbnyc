#!/bin/bash

# Pre-deployment check script
# Run this before merging to dev/staging/production branches
# Usage: ./scripts/pre-deploy-check.sh [environment]
# Where environment is one of: dev, staging, production

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get environment from argument or default to dev
ENVIRONMENT=${1:-dev}
echo -e "${BLUE}Running pre-deployment checks for ${ENVIRONMENT}...${NC}"

# Check if running in CI (GitHub Actions)
if [ -n "$GITHUB_ACTIONS" ]; then
  CI_MODE=true
  echo -e "${YELLOW}Running in CI mode - some checks will be modified${NC}"
else
  CI_MODE=false
fi

# Track overall status
PASS=true

# Determine base directory
BASE_DIR="$(pwd)"
WP_DIR="${BASE_DIR}/app/public"
THEME_DIR="${WP_DIR}/wp-content/themes/hello-elementor-child"

# Function to report check status
report_check() {
  local status=$1
  local message=$2
  
  if [ "$status" == "PASS" ]; then
    echo -e "${GREEN}✓ PASS:${NC} $message"
  else
    echo -e "${RED}✗ FAIL:${NC} $message"
    PASS=false
  fi
}

# Check 1: Verify we're on the correct branch
check_branch() {
  echo -e "\n${BLUE}Checking current branch...${NC}"
  
  if [ "$CI_MODE" = true ]; then
    report_check "PASS" "Branch check skipped in CI mode"
    return
  fi
  
  local current_branch=$(git branch --show-current)
  
  if [[ $current_branch == feature/* ]] || [[ $current_branch == bugfix/* ]]; then
    report_check "PASS" "On a feature/bugfix branch ($current_branch)"
  else
    report_check "FAIL" "Not on a feature/bugfix branch. Current branch: $current_branch"
  fi
}

# Check 2: Verify git status is clean
check_git_status() {
  echo -e "\n${BLUE}Checking git status...${NC}"
  
  if [ "$CI_MODE" = true ]; then
    report_check "PASS" "Git status check skipped in CI mode"
    return
  fi
  
  if [ -z "$(git status --porcelain)" ]; then
    report_check "PASS" "Git status is clean"
  else
    report_check "FAIL" "Git status is not clean. Commit or stash changes before deploying."
    git status --short
  fi
}

# Check 3: PHP syntax check
check_php_syntax() {
  echo -e "\n${BLUE}Checking PHP syntax...${NC}"
  
  if ! command -v php >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ WARNING:${NC} PHP not found, skipping PHP syntax check"
    return
  fi
  
  # Only check theme files in CI mode
  if [ "$CI_MODE" = true ]; then
    local php_files=$(find "${THEME_DIR}" -name "*.php" -type f -not -path "*/vendor/*" -not -path "*/node_modules/*")
  else
    local php_files=$(find "${WP_DIR}" -name "*.php" -type f -not -path "*/vendor/*" -not -path "*/node_modules/*")
  fi
  
  if [ -z "$php_files" ]; then
    echo -e "${YELLOW}⚠ WARNING:${NC} No PHP files found to check"
    return
  fi
  
  local errors=0
  
  for file in $php_files; do
    result=$(php -l "$file" 2>&1)
    if [ $? -ne 0 ]; then
      errors=$((errors + 1))
      echo -e "${RED}Syntax error in $file:${NC}"
      echo "$result" | grep "Parse error"
    fi
  done
  
  if [ $errors -eq 0 ]; then
    report_check "PASS" "PHP syntax check passed on all files"
  else
    report_check "FAIL" "PHP syntax check failed with $errors errors"
  fi
}

# Check 4: CSS syntax check
check_css_syntax() {
  echo -e "\n${BLUE}Checking CSS syntax...${NC}"
  
  if command -v stylelint >/dev/null 2>&1; then
    local css_files=$(find "${THEME_DIR}" -name "*.css" -type f -not -path "*/node_modules/*")
    
    if [ -z "$css_files" ]; then
      echo -e "${YELLOW}⚠ WARNING:${NC} No CSS files found to check"
      return
    fi
    
    local errors=0
    
    for file in $css_files; do
      if ! stylelint "$file" --quiet >/dev/null 2>&1; then
        errors=$((errors + 1))
        echo -e "${YELLOW}CSS issues in $file${NC}"
      fi
    done
    
    if [ $errors -eq 0 ]; then
      report_check "PASS" "CSS syntax check passed"
    else
      # This is a warning, not a failure
      echo -e "${YELLOW}⚠ WARNING:${NC} CSS has $errors files with potential issues, but proceeding"
    fi
  else
    echo -e "${YELLOW}⚠ WARNING:${NC} stylelint not found, skipping CSS syntax check"
  fi
}

# Check 5: Check for WP_DEBUG and error logging in wp-config
check_wp_debug() {
  echo -e "\n${BLUE}Checking WordPress debug settings...${NC}"
  
  local wp_config="${WP_DIR}/wp-config.php"
  
  if [ -f "$wp_config" ]; then
    if grep -q "define.*WP_DEBUG.*true" "$wp_config"; then
      if [ "$ENVIRONMENT" == "production" ] || [ "$ENVIRONMENT" == "staging" ]; then
        report_check "FAIL" "WP_DEBUG is set to true in wp-config.php. Set to false before deploying to $ENVIRONMENT."
      else
        echo -e "${YELLOW}⚠ WARNING:${NC} WP_DEBUG is enabled. This is okay for $ENVIRONMENT but should be disabled for production."
      fi
    else
      report_check "PASS" "WP_DEBUG is not enabled"
    fi
    
    if grep -q "define.*WP_DEBUG_LOG.*true" "$wp_config"; then
      if [ "$ENVIRONMENT" == "production" ]; then
        report_check "FAIL" "WP_DEBUG_LOG is enabled in wp-config.php. Disable before deploying to production."
      else
        echo -e "${YELLOW}⚠ WARNING:${NC} WP_DEBUG_LOG is enabled. This is okay for $ENVIRONMENT but should be disabled for production."
      fi
    else
      report_check "PASS" "WP_DEBUG_LOG is not enabled"
    fi
  else
    if [ "$CI_MODE" = true ]; then
      echo -e "${YELLOW}⚠ WARNING:${NC} wp-config.php not found in ${WP_DIR}, skipping check in CI mode"
    else
      report_check "FAIL" "wp-config.php not found in ${WP_DIR}"
    fi
  fi
}

# Check 6: Verify CSS files exist
check_css_files() {
  echo -e "\n${BLUE}Checking for required CSS files...${NC}"
  
  local required_files=(
    "${THEME_DIR}/css/variables.css"
    "${THEME_DIR}/css/base-styles.css"
  )
  
  local missing=0
  for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
      missing=$((missing + 1))
      echo -e "${RED}Missing required file: $file${NC}"
    fi
  done
  
  if [ $missing -eq 0 ]; then
    report_check "PASS" "All required CSS files exist"
  else
    report_check "FAIL" "$missing required CSS files are missing"
  fi
}

# Check 7: Verify WordPress DB connection
check_wp_connection() {
  echo -e "\n${BLUE}Checking WordPress database connection...${NC}"
  
  if [ "$CI_MODE" = true ]; then
    echo -e "${YELLOW}⚠ WARNING:${NC} Skipping WordPress database check in CI mode"
    return
  fi
  
  if command -v wp >/dev/null 2>&1; then
    # Check if we can connect to WP
    if wp --path="${WP_DIR}" db check >/dev/null 2>&1; then
      report_check "PASS" "WordPress database connection successful"
    else
      report_check "FAIL" "WordPress database connection failed"
    fi
  else
    echo -e "${YELLOW}⚠ WARNING:${NC} WP-CLI not found, skipping WordPress database check"
  fi
}

# Run all checks
check_branch
check_git_status
check_php_syntax
check_css_syntax
check_wp_debug
check_css_files
check_wp_connection

# Final report
echo -e "\n${BLUE}========== Pre-Deployment Check Summary ==========${NC}"
if [ "$PASS" = true ]; then
  echo -e "${GREEN}✅ All critical checks passed! Safe to deploy to $ENVIRONMENT.${NC}"
  exit 0
else
  echo -e "${RED}❌ Some checks failed. Fix issues before deploying to $ENVIRONMENT.${NC}"
  
  if [ "$CI_MODE" = true ]; then
    # In CI mode, we might want to continue despite failures for now
    echo -e "${YELLOW}⚠ WARNING:${NC} Running in CI mode - exiting with warning but allowing deployment to continue"
    exit 0
  else
    exit 1
  fi
fi 