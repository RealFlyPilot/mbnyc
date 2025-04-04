#!/bin/bash

# WP Engine SFTP Deployment Script
# This script deploys the site to WP Engine using SFTP credentials

set -e

# Environment: dev, stage, or prod
ENV=${1:-dev}

# Set variables based on environment
if [ "$ENV" = "dev" ]; then
  WPE_ENV="mbnycd"
  echo "Deploying to Development environment (mbnycd)"
elif [ "$ENV" = "stage" ]; then
  WPE_ENV="mbnycs"
  echo "Deploying to Staging environment (mbnycs)"
elif [ "$ENV" = "prod" ]; then
  WPE_ENV="mbnyc"
  echo "Deploying to Production environment (mbnyc)"
else
  echo "Invalid environment. Use dev, stage, or prod"
  exit 1
fi

# SFTP credentials (these should be set in environment variables or provided interactively)
SFTP_USER=${SFTP_USER:-"$WPE_ENV"}

# Try to get password from keychain
get_keychain_password() {
  local env=$1
  local username=$2
  local keychain_name="wp_engine_sftp_${env}"
  
  security find-generic-password -a "$username" -s "$keychain_name" -w 2>/dev/null
}

SFTP_PASS=${SFTP_PASS:-"$(get_keychain_password "$ENV" "$SFTP_USER")"}

# If password is not set, prompt for it
if [ -z "$SFTP_PASS" ]; then
  echo "No stored credentials found in keychain."
  echo -n "Enter SFTP password for $SFTP_USER@$WPE_ENV.sftp.wpengine.com: "
  read -s SFTP_PASS
  echo ""
  if [ -z "$SFTP_PASS" ]; then
    echo "Password cannot be empty"
    exit 1
  fi
  
  # Ask if user wants to save the password
  echo -n "Would you like to save this password in the keychain for future deployments? (y/n): "
  read -r save_password
  if [[ "$save_password" =~ ^[Yy] ]]; then
    # Store in keychain
    keychain_name="wp_engine_sftp_${ENV}"
    security delete-generic-password -a "$SFTP_USER" -s "$keychain_name" 2>/dev/null || true
    security add-generic-password -a "$SFTP_USER" -s "$keychain_name" -w "$SFTP_PASS"
    echo "Password saved to keychain."
  fi
else
  echo "Using stored credentials for $SFTP_USER."
fi

# Source directory
SRC_DIR="app/public/wp-content"

# Create a batch file for SFTP commands
SFTP_BATCH_FILE=$(mktemp)

# Write SFTP commands to batch file
cat > "$SFTP_BATCH_FILE" << EOF
cd wp-content
mkdir -p themes
mkdir -p plugins
mkdir -p uploads
mkdir -p mu-plugins
mkdir -p languages

# Upload themes directory
lcd $SRC_DIR/themes
cd themes
put -r *

# Upload plugins directory
lcd $SRC_DIR/plugins
cd ../plugins
put -r *
EOF

# Add mu-plugins commands if the directory exists
if [ -d "$SRC_DIR/mu-plugins" ]; then
  cat >> "$SFTP_BATCH_FILE" << EOF
lcd $SRC_DIR/mu-plugins
cd ../mu-plugins
put -r *
EOF
fi

# Add languages commands if the directory exists
if [ -d "$SRC_DIR/languages" ]; then
  cat >> "$SFTP_BATCH_FILE" << EOF
lcd $SRC_DIR/languages
cd ../languages
put -r *
EOF
fi

echo "Starting SFTP deployment to $WPE_ENV..."

# Execute SFTP batch file
sshpass -p "$SFTP_PASS" sftp -o StrictHostKeyChecking=no -b "$SFTP_BATCH_FILE" "$SFTP_USER@$WPE_ENV.sftp.wpengine.com"

# Clean up batch file
rm "$SFTP_BATCH_FILE"

echo "Deployment to $WPE_ENV completed!" 