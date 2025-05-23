#!/bin/bash

echo "Testing Current Setup and Configuring Port 30000"
echo "=============================================="
echo ""

# Test 1: Direct Kubernetes access
echo "Test 1: Direct Kubernetes Service Access"
echo -n "Testing http://192.168.100.10:30000/health... "
if curl -s --connect-timeout 3 http://192.168.100.10:30000/health | grep -q "API Gateway is healthy"; then
    echo "✓ WORKING"
else
    echo "✗ FAILED"
    exit 1
fi

# Test 2: Check what's listening on port 30000
echo ""
echo "Test 2: Port 30000 Status"
echo "Checking what's using port 30000..."
sudo netstat -tlnp | grep :30000 || echo "Nothing listening on port 30000 locally"

# Test 3: Check current iptables rules
echo ""
echo "Test 3: Current IPTables Rules"
sudo iptables -t nat -L PREROUTING -n -v | grep 30000 || echo "No existing rules for port 30000"

# Test 4: Test from different interfaces
echo ""
echo "Test 4: Network Interface Tests"
echo -n "Testing localhost:30000... "
curl -s --connect-timeout 3 http://localhost:30000/health 2>/dev/null && echo "✓ WORKING" || echo "✗ NOT ACCESSIBLE"

echo -n "Testing 192.168.254.181:30000... "
curl -s --connect-timeout 3 http://192.168.254.181:30000/health 2>/dev/null && echo "✓ WORKING" || echo "✗ NOT ACCESSIBLE"

# Setup forwarding if not working
echo ""
echo "Setting up port forwarding..."

# Method 1: Try socat first
echo "Attempting socat method..."
sudo pkill -f "socat.*30000" 2>/dev/null
sudo socat TCP-LISTEN:30000,fork,reuseaddr,bind=0.0.0.0 TCP:192.168.100.10:30000 &
SOCAT_PID=$!
sleep 2

# Test if socat is working
echo -n "Testing socat forwarding... "
if curl -s --connect-timeout 3 http://192.168.254.181:30000/health | grep -q "API Gateway is healthy"; then
    echo "✓ WORKING"
    FORWARD_METHOD="socat"
else
    echo "✗ FAILED"
    sudo kill $SOCAT_PID 2>/dev/null
    
    # Method 2: Try iptables
    echo "Attempting iptables method..."
    sudo iptables -t nat -A PREROUTING -p tcp -d 192.168.254.181 --dport 30000 -j DNAT --to-destination 192.168.100.10:30000
    sudo iptables -A FORWARD -p tcp -d 192.168.100.10 --dport 30000 -j ACCEPT
    sudo sysctl -w net.ipv4.ip_forward=1
    FORWARD_METHOD="iptables"
fi

# Configure firewall
echo ""
echo "Configuring firewall..."
sudo ufw allow 30000/tcp 2>/dev/null

# Final test
echo ""
echo "Final Tests:"
echo "==========="
echo -n "1. Direct access (192.168.100.10:30000): "
curl -s --connect-timeout 3 http://192.168.100.10:30000/health | grep -q "API Gateway is healthy" && echo "✓ WORKING" || echo "✗ FAILED"

echo -n "2. Local network access (192.168.254.181:30000): "
curl -s --connect-timeout 3 http://192.168.254.181:30000/health | grep -q "API Gateway is healthy" && echo "✓ WORKING" || echo "✗ FAILED"

echo -n "3. Method used: "
echo "$FORWARD_METHOD"

# Get public IP
PUBLIC_IP=$(curl -s ifconfig.me)

echo ""
echo "Setup Summary:"
echo "============="
echo "Your Public IP: $PUBLIC_IP"
echo "Local Network IP: 192.168.254.181"
echo "Service accessible at:"
echo "  - From this machine: http://192.168.100.10:30000"
echo "  - From local network: http://192.168.254.181:30000"
echo "  - From internet: http://$PUBLIC_IP:30000 (requires router config)"
echo ""
echo "Router Configuration Required:"
echo "============================"
echo "Log into your router and add this port forwarding rule:"
echo ""
echo "  Service Name: Purpose Planner"
echo "  External Port: 30000"
echo "  Internal IP: 192.168.254.181"
echo "  Internal Port: 30000"
echo "  Protocol: TCP"
echo ""
echo "Router typically at: http://192.168.254.1"
echo ""
echo "After router configuration, test from external network:"
echo "curl http://$PUBLIC_IP:30000/health"