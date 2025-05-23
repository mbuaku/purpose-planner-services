#!/bin/bash

echo "Quick Internet Access for Purpose Planner"
echo "========================================"

# First ensure local access is working
echo "Setting up local access on port 9090..."
sudo pkill -f "socat.*9090"
sudo socat TCP-LISTEN:9090,fork,reuseaddr,bind=0.0.0.0 TCP:192.168.100.10:30000 &
sleep 2

# Test local access
echo "Testing local access..."
if curl -s http://localhost:9090/health | grep -q "API Gateway is healthy"; then
    echo "✓ Local access working!"
else
    echo "✗ Local access failed"
    exit 1
fi

# Install ngrok if needed
if ! command -v ngrok &> /dev/null; then
    echo "Installing ngrok..."
    curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
    echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
    sudo apt update && sudo apt install -y ngrok
fi

echo ""
echo "To expose to internet:"
echo "1. Create free account at https://ngrok.com"
echo "2. Get your auth token from the dashboard"
echo "3. Run: ngrok authtoken YOUR_TOKEN"
echo "4. Run: ngrok http 9090"
echo ""
echo "You'll get a public URL like: https://abc123.ngrok.io"
echo ""
echo "For now, you can access locally at:"
echo "  http://192.168.254.181:9090"