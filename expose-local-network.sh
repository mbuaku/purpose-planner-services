#!/bin/bash

echo "Setting up local network access for Purpose Planner"
echo "=================================================="

# Kill any existing processes on ports we'll use
sudo pkill -f "socat.*9090"
sudo pkill -f "nginx.*9090"

# Method 1: Using socat (simplest for local network)
echo "Setting up socat on port 9090..."
sudo socat TCP-LISTEN:9090,fork,reuseaddr,bind=0.0.0.0 TCP:192.168.100.10:30000 &
sleep 2

# Method 2: Using iptables for port forwarding
echo "Setting up iptables rules..."
sudo iptables -t nat -A PREROUTING -p tcp --dport 9090 -j DNAT --to-destination 192.168.100.10:30000
sudo iptables -A FORWARD -p tcp -d 192.168.100.10 --dport 30000 -j ACCEPT
sudo iptables -t nat -A POSTROUTING -j MASQUERADE

# Enable IP forwarding
sudo sysctl -w net.ipv4.ip_forward=1

# Allow through firewall
echo "Configuring firewall..."
sudo ufw allow 9090/tcp
sudo ufw allow from 192.168.254.0/24 to any port 9090

echo "Testing local access..."
curl -s http://localhost:9090/health

echo ""
echo "✓ Setup complete!"
echo "Access your application from any device on your network:"
echo "  http://192.168.254.181:9090"
echo ""
echo "Test from another device with:"
echo "  curl http://192.168.254.181:9090/health"