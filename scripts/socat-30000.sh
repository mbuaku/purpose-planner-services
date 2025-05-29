#!/bin/bash

echo "Simple Socat Forwarding for Port 30000"
echo "====================================="
echo ""

# Kill any existing socat on port 30000
sudo pkill -f "socat.*30000"

# Forward from all interfaces to the Kubernetes service
echo "Starting port forwarding..."
sudo socat TCP-LISTEN:30000,fork,reuseaddr,bind=0.0.0.0 TCP:192.168.100.10:30000 &
SOCAT_PID=$!

sleep 2

# Test
echo "Testing..."
if curl -s http://localhost:30000/health | grep -q "API Gateway is healthy"; then
    echo "✓ Port forwarding working!"
    echo ""
    echo "Access your application:"
    echo "  From anywhere on local network: http://192.168.254.181:30000"
    echo "  From internet (after router config): http://47.145.163.208:30000"
    echo ""
    echo "Socat PID: $SOCAT_PID"
else
    echo "✗ Port forwarding failed"
fi

# Firewall
sudo ufw allow 30000/tcp

echo ""
echo "Router Configuration:"
echo "===================="
echo "External Port: 30000"
echo "Internal IP:   192.168.254.181"
echo "Internal Port: 30000"
echo "Protocol:      TCP"
echo ""
echo "No conflicts with Jenkins on port 8080!"