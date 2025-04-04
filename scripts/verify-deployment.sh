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

# Map environment to domain and WP Engine installation name
case "$ENVIRONMENT" in
  "dev")
    DOMAIN="mbnycd.wpengine.com"
    WPE_INSTALL="mbnycd"
    ;;
  "staging")
    DOMAIN="mbnycs.wpengine.com"
    WPE_INSTALL="mbnycs"
    ;;
  "production")
    DOMAIN="mbnyc.com"
    WPE_INSTALL="mbnyc"
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
  
  # Check if jq is available
  if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠ WARNING:${NC} jq not installed, skipping GitHub Actions status parsing"
    return
  fi
  
  # Check workflow status - filter to the most recent run of the deploy workflow for the current environment
  local workflow_file="wpe-deploy-${ENVIRONMENT}.yml"
  local run_json=$(gh run list --workflow="$workflow_file" --limit=1 --json status,conclusion,headBranch 2>/dev/null || echo '[]')
  
  if [ "$run_json" = "[]" ]; then
    echo -e "${YELLOW}⚠ WARNING:${NC} No GitHub Actions runs found for this workflow"
    return
  fi
  
  local run_status=$(echo "$run_json" | jq -r '.[0].conclusion // "running"')
  
  if [ "$run_status" == "success" ]; then
    report_check "PASS" "GitHub Actions deployment workflow succeeded"
  elif [ "$run_status" == "null" ] || [ "$run_status" == "running" ]; then
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

# Check if WP Engine sees the deployment using API
check_wpengine_status() {
  echo -e "\n${BLUE}Checking WP Engine deployment status...${NC}"
  
  # Check if we have the WP Engine API credentials
  if [[ -z "$WPE_API_USER" || -z "$WPE_API_PASS" ]]; then
    echo -e "${YELLOW}WP Engine API credentials not found. Skipping API checks.${NC}"
    echo -e "${YELLOW}To enable API checks, set WPE_API_USER and WPE_API_PASS environment variables.${NC}"
  else
    echo -e "${BLUE}Checking WP Engine installation status...${NC}"
    
    # Create Basic Auth header
    AUTH_HEADER="Authorization: Basic $(echo -n "$WPE_API_USER:$WPE_API_PASS" | base64)"
    
    # Make API request to get installation details
    INSTALLATION_DATA=$(curl -s -H "$AUTH_HEADER" \
      "https://api.wpengineapi.com/v1/installs/$WPE_INSTALL")
    
    if [[ "$INSTALLATION_DATA" == *"error"* ]]; then
      echo -e "${RED}Error retrieving installation data: $INSTALLATION_DATA${NC}"
    else
      # Extract and display installation information using jq if available
      if command -v jq &> /dev/null; then
        INSTALL_NAME=$(echo $INSTALLATION_DATA | jq -r '.name')
        INSTALL_ENV=$(echo $INSTALLATION_DATA | jq -r '.environment')
        INSTALL_STATUS=$(echo $INSTALLATION_DATA | jq -r '.status')
        WP_VERSION=$(echo $INSTALLATION_DATA | jq -r '.wordpress.version')
        PHP_VERSION=$(echo $INSTALLATION_DATA | jq -r '.php_version')
        
        echo -e "${GREEN}Installation Name: $INSTALL_NAME${NC}"
        echo -e "${GREEN}Environment Type: $INSTALL_ENV${NC}"
        echo -e "${GREEN}Status: $INSTALL_STATUS${NC}"
        echo -e "${GREEN}WordPress Version: $WP_VERSION${NC}"
        echo -e "${GREEN}PHP Version: $PHP_VERSION${NC}"
      else
        echo -e "${YELLOW}jq not installed, showing raw API response:${NC}"
        echo -e "${GREEN}$INSTALLATION_DATA${NC}"
      fi
      
      # Purge WP Engine cache
      echo -e "${BLUE}Purging WP Engine cache...${NC}"
      PURGE_RESULT=$(curl -s -X POST -H "$AUTH_HEADER" \
        "https://api.wpengineapi.com/v1/installs/$WPE_INSTALL/cache_purge")
      
      if [[ "$PURGE_RESULT" == *"error"* ]]; then
        echo -e "${RED}Error purging cache: $PURGE_RESULT${NC}"
      else
        echo -e "${GREEN}Cache purged successfully.${NC}"
      fi
    fi
  fi
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