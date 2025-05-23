#!/bin/bash

echo "Simple Port Forwarding Solution"
echo "=============================="
echo ""

# Kill any existing forwarding on port 8080
sudo pkill -f "socat.*8080"

echo "Setting up port forwarding..."
echo "From: 0.0.0.0:8080 (all interfaces)"
echo "To: 192.168.100.10:30000 (your service)"
echo ""

# Use socat for simple port forwarding
sudo socat TCP-LISTEN:8080,fork,reuseaddr,bind=0.0.0.0 TCP:192.168.100.10:30000 &
SOCAT_PID=$!

sleep 2

# Test the forwarding
echo "Testing port forwarding..."
if curl -s http://localhost:8080/health | grep -q "API Gateway is healthy"; then
    echo "✓ Port forwarding is working!"
    echo ""
    echo "SUCCESS! Your application is now accessible:"
    echo "  From this host: http://localhost:8080"
    echo "  From local network: http://192.168.254.181:8080"
    echo "  From internet: http://47.145.163.208:8080 (after router config)"
    echo ""
    echo "Socat process ID: $SOCAT_PID"
else
    echo "✗ Port forwarding failed"
    exit 1
fi

# Allow through firewall
sudo ufw allow 8080/tcp
sudo ufw reload

echo ""
echo "Router Configuration:"
echo "===================="
echo "Add this port forwarding rule:"
echo "  External Port: 8080"
echo "  Internal IP: 192.168.254.181"
echo "  Internal Port: 8080"
echo "  Protocol: TCP"
echo ""
echo "That's it! After router configuration, access from anywhere:"
echo "http://47.145.163.208:8080"