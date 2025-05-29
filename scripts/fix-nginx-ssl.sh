#!/bin/bash

echo "Fixing nginx SSL configuration issue..."
echo "====================================="

# Remove problematic SSL configuration
echo "Removing SSL configuration..."
sudo rm -f /etc/nginx/sites-enabled/purpose-planner-ssl

# Ensure only the non-SSL config is enabled
sudo ln -sf /etc/nginx/sites-available/purpose-planner-direct /etc/nginx/sites-enabled/

# Test nginx configuration
echo "Testing nginx configuration..."
if sudo nginx -t; then
    echo "✓ Nginx configuration is valid"
else
    echo "✗ Nginx configuration has errors"
    exit 1
fi

# Restart nginx
echo "Restarting nginx..."
sudo systemctl restart nginx

# Check nginx status
echo "Checking nginx status..."
sudo systemctl status nginx --no-pager

# Test local access
echo ""
echo "Testing local access..."
if curl -s http://localhost/health | grep -q "API Gateway is healthy"; then
    echo "✓ Local access working!"
    echo ""
    echo "SUCCESS! Your application is now accessible."
    echo ""
    echo "Internal access: http://192.168.254.181"
    echo "External access: http://47.145.163.208 (after router configuration)"
else
    echo "✗ Local access failed"
    echo "Checking for issues..."
    
    # Check if port 80 is in use
    echo "Processes using port 80:"
    sudo lsof -i :80
    
    # Check nginx error log
    echo "Recent nginx errors:"
    sudo tail -n 10 /var/log/nginx/error.log
fi