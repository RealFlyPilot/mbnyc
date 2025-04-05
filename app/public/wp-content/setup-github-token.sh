#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TOKEN_FILE=".github_token"

echo -e "${BLUE}GitHub Token Setup${NC}"
echo -e "${BLUE}===================${NC}"
echo -e "${YELLOW}This script will help you set up a GitHub token for authenticated API requests.${NC}\n"

# Check if token already exists
if [ -f "$TOKEN_FILE" ]; then
  echo -e "${GREEN}GitHub token already exists.${NC}"
  echo -e "${YELLOW}What would you like to do?${NC}"
  echo -e "  ${YELLOW}1) Use existing token${NC}"
  echo -e "  ${YELLOW}2) Update token${NC}"
  echo -e "  ${YELLOW}3) View current token${NC}"
  echo -e "  ${YELLOW}4) Exit${NC}"
  
  read -p "Enter your choice (1-4): " choice
  
  case $choice in
    1)
      echo -e "${GREEN}Using existing token.${NC}"
      ;;
    2)
      echo -e "${YELLOW}Enter your GitHub Personal Access Token (classic)${NC}"
      echo -e "${YELLOW}Create one at: https://github.com/settings/tokens${NC}"
      echo -e "${YELLOW}Required scopes: repo, workflow${NC}"
      read -p "Token: " token
      echo "$token" > "$TOKEN_FILE"
      chmod 600 "$TOKEN_FILE"
      echo -e "${GREEN}Token updated successfully.${NC}"
      ;;
    3)
      echo -e "${YELLOW}Current token:${NC} $(cat $TOKEN_FILE)"
      ;;
    *)
      echo -e "${YELLOW}Exiting.${NC}"
      exit 0
      ;;
  esac
else
  echo -e "${YELLOW}No GitHub token found.${NC}"
  echo -e "${YELLOW}You need to create a Personal Access Token (classic) with 'repo' and 'workflow' scopes.${NC}"
  echo -e "${YELLOW}Create one at: https://github.com/settings/tokens${NC}\n"
  
  read -p "Enter your GitHub token: " token
  
  if [ -z "$token" ]; then
    echo -e "${RED}No token provided. Exiting.${NC}"
    exit 1
  fi
  
  echo "$token" > "$TOKEN_FILE"
  chmod 600 "$TOKEN_FILE"
  echo -e "${GREEN}Token saved successfully.${NC}"
fi

# Create a helper script to run commands with the token
cat > run-with-token.sh << 'EOF'
#!/bin/bash

if [ -f ".github_token" ]; then
  export GITHUB_TOKEN=$(cat .github_token)
  "$@"
else
  echo "No GitHub token found. Run ./setup-github-token.sh first."
  exit 1
fi
EOF

chmod +x run-with-token.sh

echo -e "\n${GREEN}Setup complete!${NC}"
echo -e "${YELLOW}To run the monitor with authentication, use:${NC}"
echo -e "${BLUE}./run-with-token.sh node monitor-workflow.js${NC}"
echo -e "\n${YELLOW}To check status with authentication, use:${NC}"
echo -e "${BLUE}./run-with-token.sh node monitor-workflow.js check${NC}" 