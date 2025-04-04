#!/bin/bash

# Setup WP Engine Deployment Key
# This script helps set up SSH keys for WP Engine deployment via GitHub Actions
# It will:
# 1. Generate a new SSH key pair if needed
# 2. Display the public key to add to WP Engine
# 3. Provide instructions to add the private key to GitHub Secrets

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SSH_KEY_FILE="$HOME/.ssh/wpengine_deploy_key"
GITHUB_REPO_URL=$(git config --get remote.origin.url)

echo -e "${BLUE}Setting up WP Engine deployment key for GitHub Actions${NC}"
echo -e "${BLUE}===================================================${NC}"

# Check if SSH key already exists
if [ -f "$SSH_KEY_FILE" ]; then
  echo -e "${YELLOW}SSH key already exists at $SSH_KEY_FILE${NC}"
  read -p "Do you want to use the existing key? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo -e "${YELLOW}Generating a new SSH key...${NC}"
    ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_FILE" -N "" -C "github-actions-wpengine"
  fi
else
  echo -e "${YELLOW}No SSH key found. Generating a new one...${NC}"
  ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_FILE" -N "" -C "github-actions-wpengine"
fi

# Display the public key
echo -e "\n${GREEN}Public SSH Key (add this to WP Engine):${NC}"
echo -e "${YELLOW}-----------------------------------------------------------${NC}"
cat "${SSH_KEY_FILE}.pub"
echo -e "${YELLOW}-----------------------------------------------------------${NC}"

# Get the private key
PRIVATE_KEY=$(cat "$SSH_KEY_FILE")

echo -e "\n${BLUE}Instructions:${NC}"
echo -e "${GREEN}1. Add the public key above to WP Engine:${NC}"
echo "   - Log in to WP Engine dashboard"
echo "   - Go to your site > SFTP/SSH Gateway"
echo "   - Click 'Add New' and paste the public key"
echo -e "\n${GREEN}2. Add the private key as a GitHub secret:${NC}"
echo "   - Go to your GitHub repository Settings > Secrets > Actions"
echo "   - Create a new repository secret named 'WPE_SSHG_KEY_PRIVATE'"
echo "   - Paste the private key content"
echo -e "\n${GREEN}3. Update your GitHub workflow file:${NC}"
echo "   - Make sure your workflow file references the secret: \${{ secrets.WPE_SSHG_KEY_PRIVATE }}"
echo -e "\n${GREEN}4. Test the deployment${NC}"
echo "   - Push a change to trigger the workflow"
echo "   - Check GitHub Actions to verify the deployment succeeded"

# Provide option to copy private key to clipboard
if [ "$(uname)" == "Darwin" ]; then  # macOS
  echo -e "\n${YELLOW}Would you like to copy the private key to your clipboard? (y/n)${NC}"
  read -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    cat "$SSH_KEY_FILE" | pbcopy
    echo -e "${GREEN}Private key copied to clipboard!${NC}"
  fi
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
  if command -v xclip &> /dev/null; then
    echo -e "\n${YELLOW}Would you like to copy the private key to your clipboard? (y/n)${NC}"
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      cat "$SSH_KEY_FILE" | xclip -selection clipboard
      echo -e "${GREEN}Private key copied to clipboard!${NC}"
    fi
  fi
fi

echo -e "\n${GREEN}Setup complete!${NC}" 