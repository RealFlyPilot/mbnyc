#!/bin/bash

# deploy.sh - Safe deployment script with checks
# Usage: ./deploy.sh [feature-branch] [target-branch]
# Example: ./deploy.sh feature/css-variables-system dev

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if required parameters are provided
if [ "$#" -lt 2 ]; then
  echo -e "${RED}Error: Missing required parameters${NC}"
  echo -e "Usage: $0 [feature-branch] [target-branch]"
  echo -e "Example: $0 feature/css-variables-system dev"
  exit 1
fi

FEATURE_BRANCH=$1
TARGET_BRANCH=$2

# Validate target branch
if [[ ! "$TARGET_BRANCH" =~ ^(dev|staging|production)$ ]]; then
  echo -e "${RED}Error: Target branch must be one of: dev, staging, production${NC}"
  exit 1
fi

# Check if scripts exist
if [ ! -f "./scripts/pre-deploy-check.sh" ] || [ ! -f "./scripts/verify-deployment.sh" ]; then
  echo -e "${RED}Error: Required scripts not found in ./scripts/ directory${NC}"
  exit 1
fi

# Ensure scripts are executable
chmod +x ./scripts/pre-deploy-check.sh
chmod +x ./scripts/verify-deployment.sh

echo -e "${BLUE}=== Starting Safe Deployment Process ===${NC}"
echo -e "${BLUE}Feature branch:${NC} $FEATURE_BRANCH"
echo -e "${BLUE}Target branch:${NC} $TARGET_BRANCH"

# Make sure we're up to date
echo -e "\n${BLUE}Fetching latest changes...${NC}"
git fetch --all

# Check if branches exist
if ! git show-ref --verify --quiet refs/heads/$FEATURE_BRANCH; then
  echo -e "${RED}Error: Feature branch $FEATURE_BRANCH doesn't exist locally${NC}"
  exit 1
fi

if ! git show-ref --verify --quiet refs/heads/$TARGET_BRANCH; then
  echo -e "${RED}Error: Target branch $TARGET_BRANCH doesn't exist locally${NC}"
  exit 1
fi

# Switch to feature branch and check for errors
echo -e "\n${BLUE}Switching to feature branch and running pre-deployment checks...${NC}"
git checkout $FEATURE_BRANCH || { echo -e "${RED}Failed to switch to $FEATURE_BRANCH${NC}"; exit 1; }

# Run pre-deployment checks on feature branch
./scripts/pre-deploy-check.sh $TARGET_BRANCH || { 
  echo -e "${RED}Pre-deployment checks failed on feature branch. Fix issues before deploying.${NC}"
  exit 1
}

# Switch to target branch
echo -e "\n${BLUE}Switching to target branch $TARGET_BRANCH...${NC}"
git checkout $TARGET_BRANCH || { echo -e "${RED}Failed to switch to $TARGET_BRANCH${NC}"; exit 1; }

# Pull latest changes to target branch
echo -e "\n${BLUE}Pulling latest changes for $TARGET_BRANCH...${NC}"
git pull origin $TARGET_BRANCH || { echo -e "${YELLOW}Warning: Could not pull latest changes for $TARGET_BRANCH${NC}"; }

# Merge feature branch into target
echo -e "\n${BLUE}Merging $FEATURE_BRANCH into $TARGET_BRANCH...${NC}"
git merge $FEATURE_BRANCH --no-ff -m "Merge $FEATURE_BRANCH into $TARGET_BRANCH" || {
  echo -e "${RED}Merge conflicts detected. Please resolve conflicts and then continue manually.${NC}"
  exit 1
}

# Run pre-deployment checks again on merged result
echo -e "\n${BLUE}Running pre-deployment checks on merged result...${NC}"
./scripts/pre-deploy-check.sh $TARGET_BRANCH || { 
  echo -e "${RED}Pre-deployment checks failed after merge. You should fix issues and try again.${NC}"
  echo -e "${YELLOW}To revert the merge, run: git reset --hard HEAD@{1}${NC}"
  exit 1
}

# Push changes
echo -e "\n${BLUE}Pushing changes to remote $TARGET_BRANCH...${NC}"
git push origin $TARGET_BRANCH || { 
  echo -e "${RED}Failed to push changes to remote. Please check your permissions and try again.${NC}"
  exit 1
}

echo -e "\n${GREEN}✅ Changes successfully pushed to $TARGET_BRANCH${NC}"
echo -e "${BLUE}Deployment in progress through GitHub Actions...${NC}"

# Wait for deployment to complete (approximate)
echo -e "\n${BLUE}Waiting for deployment to complete...${NC}"
echo -e "${YELLOW}This may take a few minutes.${NC}"
sleep 30

# Verify deployment
echo -e "\n${BLUE}Verifying deployment...${NC}"
./scripts/verify-deployment.sh $TARGET_BRANCH

echo -e "\n${BLUE}=== Deployment Process Complete ===${NC}"
echo -e "${GREEN}You can now visit your deployed site at:${NC}"

case "$TARGET_BRANCH" in
  "dev")
    echo -e "https://mbnycd.wpengine.com"
    ;;
  "staging")
    echo -e "https://mbnycs.wpengine.com"
    ;;
  "production")
    echo -e "https://mbnyc.com"
    ;;
esac

echo -e "\n${YELLOW}Note: You can check deployment status in the GitHub Actions tab of your repository${NC}" 