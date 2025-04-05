#!/bin/bash

# Set variables
SSH_KEY_PATH="$HOME/.ssh/wpengine_deploy_key"
SSH_KEY_PUB_PATH="$HOME/.ssh/wpengine_deploy_key.pub"
SSH_CONFIG_PATH="$HOME/.ssh/config"
WPE_DEVELOPER_NAME="mbnycd-github-actions-deploy"

# Check if key exists
if [ ! -f "$SSH_KEY_PATH" ]; then
  echo "SSH key not found at $SSH_KEY_PATH"
  echo "Would you like to generate a new key? (y/n)"
  read -r GENERATE_KEY
  
  if [[ "$GENERATE_KEY" == "y" || "$GENERATE_KEY" == "Y" ]]; then
    # Generate new SSH key
    ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_PATH" -N "" -C "WP Engine Deploy Key"
    echo "SSH key generated successfully."
  else
    echo "Please generate an SSH key and place it at $SSH_KEY_PATH before running this script."
    exit 1
  fi
fi

# Copy the public key to clipboard
if [ -f "$SSH_KEY_PUB_PATH" ]; then
  cat "$SSH_KEY_PUB_PATH" | pbcopy
  
  echo "✅ Public SSH key copied to clipboard!"
  echo
  echo "===== IMPORTANT INSTRUCTIONS ====="
  echo "1. Log in to your WP Engine User Portal: https://my.wpengine.com/"
  echo "2. Select the 'mbnycd' environment"
  echo "3. Navigate to the Git Push section"
  echo "4. Click 'Add SSH Key'"
  echo "5. Enter Developer Name: $WPE_DEVELOPER_NAME"
  echo "6. Paste the public key from your clipboard"
  echo "7. Click 'Add SSH Key'"
  echo "===== END INSTRUCTIONS ====="
  echo
  echo "Your public key is:"
  echo "$(cat "$SSH_KEY_PUB_PATH" | head -c 50)..."
else
  echo "Public SSH key not found at $SSH_KEY_PUB_PATH"
  exit 1
fi

# Suggest updating GitHub secret
echo
echo "Then, update your GitHub secret with the private key by running:"
echo "gh secret set WPE_SSHG_KEY_PRIVATE -b\"\$(cat ~/.ssh/wpengine_deploy_key)\" --repo USERNAME/REPO"

# Copy the private key to clipboard
echo
echo "Private key has been copied to clipboard for convenience."
cat "$SSH_KEY_PATH" | pbcopy 