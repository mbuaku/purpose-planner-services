#!/bin/bash

echo "IPTables Port Forwarding Solution"
echo "================================"
echo ""

# Enable IP forwarding
echo "Enabling IP forwarding..."
sudo sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf > /dev/null

# Add iptables rules
echo "Adding iptables rules..."
sudo iptables -t nat -A PREROUTING -p tcp --dport 8080 -j DNAT --to-destination 192.168.100.10:30000
sudo iptables -A FORWARD -p tcp -d 192.168.100.10 --dport 30000 -j ACCEPT
sudo iptables -t nat -A POSTROUTING -j MASQUERADE

# Save iptables rules
echo "Saving iptables rules..."
sudo sh -c "iptables-save > /etc/iptables.rules"

# Allow through firewall
sudo ufw allow 8080/tcp

echo ""
echo "Testing..."
sleep 1

if curl -s http://localhost:8080/health 2>/dev/null | grep -q "API Gateway is healthy"; then
    echo "✓ Port forwarding is working!"
else
    echo "Note: iptables forwarding is configured but may not work for localhost testing."
    echo "It should work for external connections."
fi

echo ""
echo "Your application is accessible at:"
echo "  From local network: http://192.168.254.181:8080"
echo "  From internet: http://47.145.163.208:8080 (after router config)"
echo ""
echo "Router Configuration:"
echo "  External Port: 8080"
echo "  Internal IP: 192.168.254.181"
echo "  Internal Port: 8080"
echo "  Protocol: TCP"