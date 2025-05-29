#!/bin/bash

echo "Direct Port Forwarding Setup for Purpose Planner"
echo "=============================================="
echo ""

# Get current IPs
PUBLIC_IP=$(curl -s ifconfig.me)
LOCAL_IP="192.168.254.181"
echo "Your Public IP: $PUBLIC_IP"
echo "Your Local IP: $LOCAL_IP"
echo ""

# Step 1: Set up local forwarding
echo "Step 1: Setting up local port forwarding..."
sudo pkill -f "socat.*80"
sudo pkill -f "nginx.*80"

# Set up nginx for HTTP (port 80)
echo "Configuring nginx..."
sudo tee /etc/nginx/sites-available/purpose-planner-direct << EOF
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://192.168.100.10:30000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # API documentation
    location /api-docs {
        proxy_pass http://192.168.100.10:30000/api-docs;
        proxy_set_header Host \$host;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/purpose-planner-direct /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart nginx
sudo nginx -t
sudo systemctl restart nginx

# Set up firewall rules
echo "Configuring firewall..."
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload

# Enable IP forwarding
sudo sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf

# Test local access
echo ""
echo "Testing local access..."
if curl -s http://localhost/health | grep -q "API Gateway is healthy"; then
    echo "✓ Local nginx setup successful!"
else
    echo "✗ Local setup failed"
    exit 1
fi

echo ""
echo "===================================="
echo "ROUTER CONFIGURATION REQUIRED"
echo "===================================="
echo ""
echo "Log into your router's admin panel and configure port forwarding:"
echo ""
echo "1. ACCESS YOUR ROUTER:"
echo "   - Open browser and go to: http://192.168.254.1"
echo "   - Common alternatives: http://192.168.1.1 or http://192.168.0.1"
echo "   - Login with admin credentials (check router label)"
echo ""
echo "2. FIND PORT FORWARDING SECTION:"
echo "   - Look for: 'Port Forwarding', 'Virtual Servers', 'NAT', or 'Applications'"
echo "   - Usually under: Advanced Settings > Port Forwarding"
echo ""
echo "3. ADD PORT FORWARDING RULE:"
echo "   ┌─────────────────────────────────────────┐"
echo "   │ Service Name: Purpose Planner           │"
echo "   │ Protocol: TCP                           │"
echo "   │ External Port: 80                       │"
echo "   │ Internal IP: $LOCAL_IP                  │"
echo "   │ Internal Port: 80                       │"
echo "   │ Enable: Yes/Check                       │"
echo "   └─────────────────────────────────────────┘"
echo ""
echo "4. SAVE AND APPLY CHANGES"
echo ""
echo "5. OPTIONAL - ADD HTTPS (Port 443):"
echo "   ┌─────────────────────────────────────────┐"
echo "   │ Service Name: Purpose Planner HTTPS     │"
echo "   │ Protocol: TCP                           │"
echo "   │ External Port: 443                      │"
echo "   │ Internal IP: $LOCAL_IP                  │"
echo "   │ Internal Port: 443                      │"
echo "   │ Enable: Yes/Check                       │"
echo "   └─────────────────────────────────────────┘"
echo ""
echo "6. DYNAMIC DNS (if no static IP):"
echo "   - Use a service like: No-IP, DuckDNS, or DynDNS"
echo "   - Configure in router's DDNS section"
echo ""
echo "===================================="
echo "AFTER ROUTER CONFIGURATION"
echo "===================================="
echo ""
echo "1. Test external access:"
echo "   curl http://$PUBLIC_IP/health"
echo ""
echo "2. Set up domain (optional):"
echo "   - Point your domain to: $PUBLIC_IP"
echo "   - Update nginx server_name"
echo ""
echo "3. Add SSL certificate (recommended):"
echo "   sudo apt-get install certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d yourdomain.com"
echo ""
echo "Your application will be accessible at:"
echo "   http://$PUBLIC_IP"
echo "   http://yourdomain.com (after DNS setup)"
echo ""

# Save router config info
cat > router-config-info.txt << EOF
Router Configuration for Purpose Planner
======================================

Date: $(date)
Public IP: $PUBLIC_IP
Internal IP: $LOCAL_IP

Port Forwarding Rules:
---------------------
1. HTTP Access:
   - External Port: 80
   - Internal IP: $LOCAL_IP
   - Internal Port: 80
   - Protocol: TCP

2. HTTPS Access (optional):
   - External Port: 443
   - Internal IP: $LOCAL_IP
   - Internal Port: 443
   - Protocol: TCP

Router Access:
-------------
- URL: http://192.168.254.1 (or check your default gateway)
- Default Gateway: $(ip route | grep default | awk '{print $3}')

Common Router Locations for Port Forwarding:
------------------------------------------
- Linksys: Apps & Gaming > Single Port Forwarding
- ASUS: WAN > Virtual Server/Port Forwarding
- Netgear: Dynamic DNS/Port Forwarding
- TP-Link: Advanced > NAT Forwarding > Virtual Servers
- D-Link: Advanced > Port Forwarding Rules

Testing Commands:
----------------
# From external network:
curl http://$PUBLIC_IP/health

# From internal network:
curl http://$LOCAL_IP/health
curl http://localhost/health
EOF

echo "Router configuration saved to: router-config-info.txt"