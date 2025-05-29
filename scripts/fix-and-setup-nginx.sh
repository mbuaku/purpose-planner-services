#!/bin/bash

echo "Fixing and Setting Up Nginx for Port Forwarding"
echo "=============================================="
echo ""

# Step 1: Clean up any problematic configs
echo "Step 1: Cleaning up nginx configurations..."
sudo rm -f /etc/nginx/sites-enabled/purpose-planner-ssl
sudo rm -f /etc/nginx/sites-enabled/purpose-planner-direct
sudo rm -f /etc/nginx/sites-enabled/default

# Step 2: Create a simple working configuration
echo "Step 2: Creating nginx configuration..."
sudo tee /etc/nginx/sites-available/purpose-planner-simple > /dev/null << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    
    location / {
        proxy_pass http://192.168.100.10:30000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location /health {
        proxy_pass http://192.168.100.10:30000/health;
    }
}
EOF

# Step 3: Enable the configuration
echo "Step 3: Enabling configuration..."
sudo ln -sf /etc/nginx/sites-available/purpose-planner-simple /etc/nginx/sites-enabled/

# Step 4: Test configuration
echo "Step 4: Testing nginx configuration..."
if sudo nginx -t; then
    echo "✓ Configuration is valid"
else
    echo "✗ Configuration has errors"
    exit 1
fi

# Step 5: Restart nginx
echo "Step 5: Restarting nginx..."
sudo systemctl restart nginx

# Step 6: Check status
echo "Step 6: Checking nginx status..."
sudo systemctl status nginx --no-pager | grep Active

# Step 7: Test access
echo ""
echo "Step 7: Testing access..."
sleep 2

echo "Testing localhost..."
if curl -s http://localhost/health | grep -q "API Gateway is healthy"; then
    echo "✓ Localhost access working!"
else
    echo "✗ Localhost access failed"
fi

echo ""
echo "Testing 192.168.254.181..."
if curl -s http://192.168.254.181/health | grep -q "API Gateway is healthy"; then
    echo "✓ Local network access working!"
else
    echo "✗ Local network access failed"
fi

echo ""
echo "Step 8: Firewall configuration..."
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload

echo ""
echo "========================================"
echo "SETUP COMPLETE"
echo "========================================"
echo ""
echo "Your application is now accessible at:"
echo "  Internal: http://192.168.254.181"
echo "  External: http://47.145.163.208 (after router config)"
echo ""
echo "Router Configuration Required:"
echo "  External Port: 80"
echo "  Internal IP: 192.168.254.181"
echo "  Internal Port: 80"
echo "  Protocol: TCP"
echo ""

# Save the configuration details
cat > setup-complete.txt << EOF
Purpose Planner Setup Complete
=============================
Date: $(date)

Access URLs:
- Internal: http://192.168.254.181/health
- External: http://47.145.163.208/health (requires router config)

Nginx Status: $(systemctl is-active nginx)
Kubernetes Service: http://192.168.100.10:30000/health

Router Port Forwarding Required:
- External Port: 80
- Internal IP: 192.168.254.181
- Internal Port: 80
- Protocol: TCP

Test Commands:
curl http://192.168.254.181/health
curl http://47.145.163.208/health (from external network)
EOF

echo "Configuration saved to: setup-complete.txt"