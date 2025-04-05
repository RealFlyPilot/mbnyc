#!/bin/bash

# Test SSH connectivity to WP Engine
# Usage: ./scripts/test-deploy.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# WP Engine environment
WPE_ENV="mbnycd"
WPE_SSH_HOST="${WPE_ENV}.ssh.wpengine.net"
WPE_SSH_USER="mbnycd" # Regular SFTP username

echo -e "${BLUE}Testing SSH connectivity to WP Engine (${WPE_ENV})...${NC}"

# Check if SSH key exists
if [ ! -f ~/.ssh/wpengine_deploy_key ]; then
  echo -e "${RED}SSH private key not found at ~/.ssh/wpengine_deploy_key${NC}"
  exit 1
fi

echo -e "${BLUE}Using SSH key from ~/.ssh/wpengine_deploy_key${NC}"

# Test SSH connectivity with verbose output
echo -e "${BLUE}Attempting to connect to ${WPE_SSH_HOST} as ${WPE_SSH_USER}...${NC}"
ssh -v -o BatchMode=yes -o StrictHostKeyChecking=accept-new -i ~/.ssh/wpengine_deploy_key ${WPE_SSH_USER}@${WPE_SSH_HOST} "echo 'SSH connection successful!'"

# Create a small test file
echo -e "${BLUE}Creating test file for deployment...${NC}"
echo "Test file for WP Engine deployment $(date)" > wp-engine-test.txt

# Try to sync the test file using rsync
echo -e "${BLUE}Attempting to sync test file to ${WPE_ENV}...${NC}"
rsync -avz -e "ssh -i ~/.ssh/wpengine_deploy_key" wp-engine-test.txt ${WPE_SSH_USER}@${WPE_SSH_HOST}:sites/${WPE_ENV}/wp-content/

# Cleanup
rm wp-engine-test.txt

echo -e "${GREEN}Test completed!${NC}" 