#!/bin/bash

echo "Direct Port 30000 Forwarding Solution"
echo "===================================="
echo ""

# No need for socat or nginx - just configure iptables to forward external traffic

# Enable IP forwarding
echo "Enabling IP forwarding..."
sudo sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf > /dev/null

# Add iptables rules to forward port 30000
echo "Adding iptables rules for port 30000..."
sudo iptables -t nat -A PREROUTING -i br0 -p tcp --dport 30000 -j DNAT --to-destination 192.168.100.10:30000
sudo iptables -A FORWARD -p tcp -d 192.168.100.10 --dport 30000 -j ACCEPT
sudo iptables -t nat -A POSTROUTING -j MASQUERADE

# Allow through firewall
echo "Configuring firewall..."
sudo ufw allow 30000/tcp
sudo ufw reload

# Save iptables rules
echo "Saving iptables rules..."
sudo sh -c "iptables-save > /etc/iptables.rules"

# Test access
echo ""
echo "Testing..."
if curl -s http://192.168.100.10:30000/health | grep -q "API Gateway is healthy"; then
    echo "✓ Service is accessible!"
fi

echo ""
echo "Setup Complete!"
echo "=============="
echo ""
echo "Your application is now accessible:"
echo "  From this host: http://192.168.100.10:30000"
echo "  From local network: http://192.168.254.181:30000"
echo "  From internet: http://47.145.163.208:30000 (after router config)"
echo ""
echo "Router Configuration Required:"
echo "=============================="
echo "Add this port forwarding rule in your router:"
echo ""
echo "  External Port: 30000"
echo "  Internal IP:   192.168.254.181"
echo "  Internal Port: 30000"
echo "  Protocol:      TCP"
echo ""
echo "That's it! No port conflicts with Jenkins."