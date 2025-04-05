#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAX_ATTEMPTS=60
SLEEP_INTERVAL=30 # seconds
GITHUB_REPO="RealFlyPilot/mbnyc"
BRANCH="dev"
LOCAL_SCRIPTS_DIR="app/public"

echo -e "${BLUE}Automated Deployment Monitor${NC}"
echo -e "${BLUE}==============================${NC}"
echo -e "${YELLOW}This script will check the GitHub repo for successful deployments and run local scripts.${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop at any time.${NC}\n"

# Function to check deployment status
check_deployment_status() {
  echo -e "${BLUE}Checking deployment status...${NC}"
  
  # Get the latest commit hash on the dev branch
  local latest_commit=$(git rev-parse $BRANCH)
  echo -e "${YELLOW}Latest commit on $BRANCH: ${latest_commit}${NC}"
  
  # Check if this commit has been successfully deployed
  # Since we can't easily check the GitHub Actions API without auth,
  # we'll use a local tracking file
  local deploy_status_file=".last_deploy_status"
  
  if [ -f "$deploy_status_file" ]; then
    local last_deployed_commit=$(cat $deploy_status_file | grep "commit:" | cut -d':' -f2 | tr -d '[:space:]')
    local status=$(cat $deploy_status_file | grep "status:" | cut -d':' -f2 | tr -d '[:space:]')
    
    echo -e "${YELLOW}Last tracked deployment: ${last_deployed_commit} (${status})${NC}"
    
    if [ "$last_deployed_commit" == "$latest_commit" ] && [ "$status" == "success" ]; then
      echo -e "${GREEN}✓ Deployment already successful for this commit.${NC}"
      return 0
    fi
  fi
  
  # Mark as pending while we wait for confirmation
  echo "commit:${latest_commit}" > $deploy_status_file
  echo "status:pending" >> $deploy_status_file
  echo "timestamp:$(date '+%Y-%m-%d %H:%M:%S')" >> $deploy_status_file
  
  echo -e "${YELLOW}Waiting for deployment to complete...${NC}"
  echo -e "${YELLOW}(This process can take several minutes)${NC}"
  
  # Since we can't check the API easily without auth, we'll prompt the user
  local attempts=0
  while [ $attempts -lt $MAX_ATTEMPTS ]; do
    attempts=$((attempts+1))
    
    echo -e "\n${YELLOW}Attempt $attempts of $MAX_ATTEMPTS${NC}"
    echo -e "${YELLOW}Has the deployment completed? (y/n/s/q)${NC}"
    echo -e "${YELLOW}y = Yes, deployment successful${NC}"
    echo -e "${YELLOW}n = No, still waiting${NC}"
    echo -e "${YELLOW}s = Skip, assume success and continue${NC}"
    echo -e "${YELLOW}q = Quit monitoring${NC}"
    
    read -t $SLEEP_INTERVAL deploy_complete || true
    
    if [ "$deploy_complete" == "y" ] || [ "$deploy_complete" == "s" ]; then
      echo "status:success" > $deploy_status_file
      echo "commit:${latest_commit}" >> $deploy_status_file
      echo "timestamp:$(date '+%Y-%m-%d %H:%M:%S')" >> $deploy_status_file
      echo -e "${GREEN}✓ Deployment marked as successful.${NC}"
      return 0
    elif [ "$deploy_complete" == "q" ]; then
      echo -e "${RED}✗ Monitoring stopped by user.${NC}"
      exit 0
    else
      echo -e "${YELLOW}Waiting for deployment to complete...${NC}"
    fi
  done
  
  echo -e "${RED}✗ Maximum monitoring time reached.${NC}"
  return 1
}

# Function to run local reset scripts
run_local_scripts() {
  echo -e "\n${BLUE}Running local reset scripts...${NC}"
  
  local scripts=("reset-elementor.php" "reset-customizer.php" "reset-styles.php")
  
  for script in "${scripts[@]}"; do
    local script_path="${LOCAL_SCRIPTS_DIR}/${script}"
    
    if [ -f "$script_path" ]; then
      echo -e "${YELLOW}Running ${script}...${NC}"
      
      # Check if php is available
      if command -v php &> /dev/null; then
        php $script_path
        echo -e "${GREEN}✓ ${script} executed successfully.${NC}"
      else
        echo -e "${RED}✗ PHP not found. Cannot execute ${script}.${NC}"
      fi
    else
      echo -e "${RED}✗ Script not found: ${script_path}${NC}"
    fi
  done
  
  echo -e "\n${GREEN}✓ All local scripts executed.${NC}"
}

# Main function
main() {
  # Check deployment status
  if check_deployment_status; then
    # If deployment was successful, run the local scripts
    run_local_scripts
  else
    echo -e "${RED}✗ Deployment not confirmed as successful. Scripts not run.${NC}"
  fi
  
  echo -e "\n${BLUE}Deployment monitor completed.${NC}"
}

# Run the main function
main 