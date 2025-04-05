#!/bin/bash

# Script to set up SFTP credentials for WP Engine deployment
# This will securely store the credentials in the macOS keychain

set -e

# Function to store password in keychain
store_in_keychain() {
  local env=$1
  local username=$2
  local password=$3
  local keychain_name="wp_engine_sftp_${env}"
  
  # Delete existing entry if it exists
  security delete-generic-password -a "$username" -s "$keychain_name" 2>/dev/null || true
  
  # Add new entry
  echo "Storing credentials for $env environment in keychain..."
  security add-generic-password -a "$username" -s "$keychain_name" -w "$password"
  
  echo "Credentials stored successfully for $env environment."
}

# Function to retrieve password from keychain
get_from_keychain() {
  local env=$1
  local username=$2
  local keychain_name="wp_engine_sftp_${env}"
  
  security find-generic-password -a "$username" -s "$keychain_name" -w 2>/dev/null
}

# Set up credentials for specified environment or all environments
setup_env_credentials() {
  local env=$1
  
  if [ "$env" = "dev" ]; then
    WPE_ENV="mbnycd"
  elif [ "$env" = "stage" ]; then
    WPE_ENV="mbnycs"
  elif [ "$env" = "prod" ]; then
    WPE_ENV="mbnyc"
  else
    echo "Invalid environment: $env. Use dev, stage, or prod"
    return 1
  fi
  
  echo "Setting up credentials for $env environment ($WPE_ENV)..."
  echo -n "Enter SFTP username [$WPE_ENV]: "
  read -r username
  username=${username:-$WPE_ENV}
  
  echo -n "Enter SFTP password: "
  read -rs password
  echo
  
  if [ -z "$password" ]; then
    echo "Password cannot be empty"
    return 1
  fi
  
  store_in_keychain "$env" "$username" "$password"
}

# Main script
if [ $# -eq 0 ]; then
  echo "Please specify environment(s) to set up: dev, stage, prod, or all"
  exit 1
fi

if [ "$1" = "all" ]; then
  setup_env_credentials "dev"
  setup_env_credentials "stage"
  setup_env_credentials "prod"
else
  for env in "$@"; do
    setup_env_credentials "$env"
  done
fi

echo "SFTP credential setup complete."
echo "You can now use ./scripts/deploy-sftp.sh [env] for password-less deployment." 