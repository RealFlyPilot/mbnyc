#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up necessary directories for style sync automation...${NC}"

# Create directories
mkdir -p temp-scripts
mkdir -p env-comparison
mkdir -p test-screenshots

# Add .gitkeep files to track empty directories
touch temp-scripts/.gitkeep
touch env-comparison/.gitkeep
touch test-screenshots/.gitkeep

echo -e "${GREEN}Directories created successfully!${NC}"
echo -e "${BLUE}Run 'npm install' to install dependencies.${NC}" 