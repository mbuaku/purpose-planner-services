# Manual Setup Guide for Port 30000 Forwarding

## Quick Setup Commands

Run these commands on your host machine with sudo:

### Option 1: Using socat (Simplest)
```bash
# Install socat if not already installed
sudo apt-get update
sudo apt-get install -y socat

# Start port forwarding
sudo socat TCP-LISTEN:30000,fork,reuseaddr,bind=0.0.0.0 TCP:192.168.100.10:30000 &

# Allow through firewall
sudo ufw allow 30000/tcp
```

### Option 2: Using iptables
```bash
# Enable IP forwarding
sudo sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf

# Add iptables rules
sudo iptables -t nat -A PREROUTING -p tcp -d 192.168.254.181 --dport 30000 -j DNAT --to-destination 192.168.100.10:30000
sudo iptables -A FORWARD -p tcp -d 192.168.100.10 --dport 30000 -j ACCEPT
sudo iptables -t nat -A POSTROUTING -j MASQUERADE

# Save iptables rules
sudo sh -c "iptables-save > /etc/iptables.rules"

# Allow through firewall
sudo ufw allow 30000/tcp
```

## Router Configuration

1. **Access your router admin panel**: http://192.168.254.1

2. **Add this port forwarding rule**:
   ```
   Service Name:  Purpose Planner
   External Port: 30000
   Internal IP:   192.168.254.181
   Internal Port: 30000
   Protocol:      TCP
   ```

## Testing

### 1. Test local access (after running setup):
```bash
curl http://192.168.254.181:30000/health
```

### 2. Test external access (after router config):
```bash
# From a device on cellular or different network
curl http://47.145.163.208:30000/health
```

## Access URLs

After setup:
- **From your host**: http://192.168.100.10:30000
- **From local network**: http://192.168.254.181:30000
- **From internet**: http://47.145.163.208:30000

## Making it Permanent

### For socat (create systemd service):
```bash
sudo tee /etc/systemd/system/purpose-planner-forward.service << EOF
[Unit]
Description=Purpose Planner Port Forwarding
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/socat TCP-LISTEN:30000,fork,reuseaddr,bind=0.0.0.0 TCP:192.168.100.10:30000
Restart=always
User=root

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable purpose-planner-forward
sudo systemctl start purpose-planner-forward
```

### For iptables (add to startup):
```bash
# Create startup script
sudo tee /etc/network/if-up.d/purpose-planner-iptables << 'EOF'
#!/bin/bash
iptables -t nat -A PREROUTING -p tcp -d 192.168.254.181 --dport 30000 -j DNAT --to-destination 192.168.100.10:30000
iptables -A FORWARD -p tcp -d 192.168.100.10 --dport 30000 -j ACCEPT
iptables -t nat -A POSTROUTING -j MASQUERADE
EOF

sudo chmod +x /etc/network/if-up.d/purpose-planner-iptables
```

## Troubleshooting

1. **Port already in use**:
   ```bash
   sudo lsof -i :30000
   sudo kill <PID>
   ```

2. **Check if forwarding is working**:
   ```bash
   sudo netstat -tlnp | grep 30000
   ```

3. **Check iptables rules**:
   ```bash
   sudo iptables -t nat -L -n -v
   ```

4. **Check firewall**:
   ```bash
   sudo ufw status
   ```

That's it! After following these steps, your Purpose Planner application will be accessible from anywhere on the internet.