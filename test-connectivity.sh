#!/bin/bash

echo "Purpose Planner Connectivity Test"
echo "================================="
echo

# Test direct access to NodePort
echo "1. Testing direct access to NodePort (192.168.100.10:30000):"
if curl -s http://192.168.100.10:30000/health | grep -q "API Gateway is healthy"; then
    echo "   ✓ SUCCESS: Direct access works"
else
    echo "   ✗ FAILED: Direct access not working"
fi

echo

# Test access via host IP on port 8080
echo "2. Testing access via host IP (192.168.254.181:8080):"
if curl -s http://192.168.254.181:8080/health | grep -q "API Gateway is healthy"; then
    echo "   ✓ SUCCESS: Port forwarding is working"
else
    echo "   ✗ FAILED: Port forwarding not configured"
    echo "   Run: sudo ./setup-port-forward.sh"
fi

echo

# Check what's listening on port 8080
echo "3. Checking what's listening on port 8080:"
sudo netstat -tlnp | grep 8080 || echo "   Nothing listening on port 8080"

echo

# Check iptables rules
echo "4. Current iptables PREROUTING rules for port 8080:"
sudo iptables -t nat -L PREROUTING -n -v | grep 8080 || echo "   No iptables rules for port 8080"

echo

# Show network interfaces
echo "5. Network interfaces:"
ip addr show | grep "inet " | grep -E "192.168.254|192.168.100"

echo
echo "Test complete!"