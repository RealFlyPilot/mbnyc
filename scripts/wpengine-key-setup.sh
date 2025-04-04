#!/bin/bash

# Script to help set up SSH key for WP Engine

# Check if public key exists
if [ ! -f ~/.ssh/wpengine_deploy_key.pub ]; then
  echo "Error: WP Engine deploy key not found at ~/.ssh/wpengine_deploy_key.pub"
  exit 1
fi

# Print instructions
echo "=== WP Engine SSH Key Setup ==="
echo ""
echo "I'll copy your WP Engine public key to the clipboard."
echo "You'll need to add this key to your WP Engine account:"
echo ""
echo "1. Login to your WP Engine account at https://my.wpengine.com/"
echo "2. Go to Sites > [Your Site] > Git Push"
echo "3. Click 'Add SSH Key'"
echo "4. Paste the key from your clipboard"
echo "5. Name it 'GitHub Actions Deploy'"
echo ""
echo "Ready? Press Enter to copy the key to your clipboard..."
read

# Copy key to clipboard
cat ~/.ssh/wpengine_deploy_key.pub | pbcopy

echo "Public key copied to clipboard!"
echo "Public key: $(cat ~/.ssh/wpengine_deploy_key.pub | cut -c1-40)..."
echo ""
echo "Now follow the instructions above to add it to WP Engine." 