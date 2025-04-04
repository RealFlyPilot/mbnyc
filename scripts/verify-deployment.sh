#!/bin/bash

# Post-deployment verification script
# Usage: ./scripts/verify-deployment.sh [environment]
# Where environment is one of: dev, staging, production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get environment from argument or default to dev
ENVIRONMENT=${1:-dev}
echo -e "${BLUE}Verifying deployment for ${ENVIRONMENT}...${NC}"

# Map environment to domain
case "$ENVIRONMENT" in
  "dev")
    DOMAIN="mbnycd.wpengine.com"
    ;;
  "staging")
    DOMAIN="mbnycs.wpengine.com"
    ;;
  "production")
    DOMAIN="mbnyc.com"
    ;;
  *)
    echo -e "${RED}Invalid environment: $ENVIRONMENT${NC}"
    exit 1
    ;;
esac

# Track overall status
PASS=true

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

# Check GitHub Actions deployment status
check_github_actions() {
  echo -e "\n${BLUE}Checking GitHub Actions deployment status...${NC}"
  
  if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠ WARNING:${NC} GitHub CLI not installed, skipping GitHub Actions check"
    return
  fi
  
  # Check if we're authenticated with GitHub CLI
  if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠ WARNING:${NC} Not authenticated with GitHub CLI, skipping GitHub Actions check"
    return
  fi
  
  # Get the repo details
  local repo_url=$(git config --get remote.origin.url)
  local repo_owner=$(echo "$repo_url" | sed -n 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\1/p')
  local repo_name=$(echo "$repo_url" | sed -n 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\2/p')
  
  if [ -z "$repo_owner" ] || [ -z "$repo_name" ]; then
    echo -e "${YELLOW}⚠ WARNING:${NC} Could not determine GitHub repository details, skipping GitHub Actions check"
    return
  fi
  
  # Check workflow status - filter to the most recent run of the deploy workflow for the current environment
  local workflow_file="wpe-deploy-${ENVIRONMENT}.yml"
  local run_status=$(gh run list --workflow="$workflow_file" --limit=1 --json status,conclusion,headBranch | jq -r '.[0].conclusion')
  
  if [ "$run_status" == "success" ]; then
    report_check "PASS" "GitHub Actions deployment workflow succeeded"
  elif [ "$run_status" == "null" ]; then
    echo -e "${YELLOW}⚠ WARNING:${NC} GitHub Actions deployment workflow is still running"
  elif [ -z "$run_status" ]; then
    echo -e "${YELLOW}⚠ WARNING:${NC} No recent GitHub Actions deployment workflow found"
  else
    report_check "FAIL" "GitHub Actions deployment workflow failed with status: $run_status"
  fi
}

# Check if the site is responsive
check_site_availability() {
  echo -e "\n${BLUE}Checking if site is accessible...${NC}"
  
  local http_code=$(curl -s -o /dev/null -w "%{http_code}" "https://${DOMAIN}")
  
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 400 ]; then
    report_check "PASS" "Site is accessible (HTTP $http_code)"
  else
    report_check "FAIL" "Site is not accessible (HTTP $http_code)"
  fi
}

# Check for PHP fatal errors
check_php_errors() {
  echo -e "\n${BLUE}Checking for PHP fatal errors...${NC}"
  
  local error_page=$(curl -s "https://${DOMAIN}")
  
  if echo "$error_page" | grep -q "Fatal error"; then
    report_check "FAIL" "PHP fatal errors detected on the homepage"
    echo "$error_page" | grep -A 5 "Fatal error"
  elif echo "$error_page" | grep -q "Parse error"; then
    report_check "FAIL" "PHP parse errors detected on the homepage"
    echo "$error_page" | grep -A 5 "Parse error"
  elif echo "$error_page" | grep -q "Warning:"; then
    echo -e "${YELLOW}⚠ WARNING:${NC} PHP warnings detected on the homepage, but not fatal"
  else
    report_check "PASS" "No PHP errors detected on the homepage"
  fi
}

# Check for our CSS variables
check_css_variables() {
  echo -e "\n${BLUE}Checking for CSS variables...${NC}"
  
  local css_url="https://${DOMAIN}/wp-content/themes/hello-elementor-child/css/variables.css"
  local css_content=$(curl -s "$css_url")
  
  if [ -z "$css_content" ]; then
    report_check "FAIL" "CSS variables file not accessible"
  elif echo "$css_content" | grep -q ":root"; then
    report_check "PASS" "CSS variables file contains :root declaration"
  else
    report_check "FAIL" "CSS variables file exists but doesn't contain expected content"
  fi
}

# Check if WP Engine sees the deployment
check_wpengine_status() {
  echo -e "\n${BLUE}Checking WP Engine deployment status...${NC}"
  
  echo -e "${YELLOW}⚠ NOTE:${NC} Automated verification of WP Engine deployment status requires API access"
  echo -e "${YELLOW}⚠ NOTE:${NC} Check the WP Engine dashboard for detailed deployment status"
  
  # You would need to use the WP Engine API to automate this check
  # This is a placeholder for future implementation
}

# Run all checks
check_github_actions
check_site_availability
check_php_errors
check_css_variables
check_wpengine_status

# Final report
echo -e "\n${BLUE}========== Deployment Verification Summary ==========${NC}"
if [ "$PASS" = true ]; then
  echo -e "${GREEN}✅ All critical checks passed! Deployment to $ENVIRONMENT appears successful.${NC}"
  exit 0
else
  echo -e "${RED}❌ Some checks failed. Deployment to $ENVIRONMENT may have issues.${NC}"
  exit 1
fi 