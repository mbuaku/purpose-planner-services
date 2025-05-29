#!/bin/bash
# Script to update Node.js for Jenkins

echo "Updating Node.js for Jenkins..."

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
echo "Node.js version:"
node --version
echo "NPM version:"
npm --version

echo "Node.js update complete!"