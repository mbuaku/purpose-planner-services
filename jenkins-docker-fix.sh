#!/bin/bash
# Script to fix Docker installation for Jenkins

echo "Fixing Docker installation for Jenkins..."

# Remove snap docker if it exists
sudo snap remove docker

# Install Docker from official repository
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add jenkins user to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins
sudo systemctl restart jenkins

echo "Docker installation fixed. Jenkins restarted."
echo "Please wait a minute for Jenkins to fully restart."