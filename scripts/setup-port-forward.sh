#!/bin/bash

# Purpose Planner Port Forwarding Setup Script

echo "Setting up port forwarding for Purpose Planner application..."

# Function to check if command succeeded
check_result() {
    if [ $? -eq 0 ]; then
        echo "✓ $1"
    else
        echo "✗ $1 failed"
        exit 1
    fi
}

# Method 1: Using socat
setup_socat() {
    echo "Method 1: Setting up socat port forwarding..."
    
    # Install socat if not present
    if ! command -v socat &> /dev/null; then
        echo "Installing socat..."
        sudo apt-get update
        sudo apt-get install -y socat
        check_result "Socat installation"
    fi
    
    # Kill any existing socat process on port 8080
    sudo pkill -f "socat.*8080"
    
    # Start socat in background
    echo "Starting socat on 192.168.254.181:8080..."
    sudo socat TCP-LISTEN:8080,fork,reuseaddr,bind=192.168.254.181 TCP:192.168.100.10:30000 &
    SOCAT_PID=$!
    sleep 2
    
    # Test the connection
    echo "Testing connection..."
    if curl -s http://192.168.254.181:8080/health | grep -q "API Gateway is healthy"; then
        echo "✓ Success! Application is accessible at http://192.168.254.181:8080"
        echo "  Socat PID: $SOCAT_PID"
        return 0
    else
        echo "✗ Connection test failed"
        return 1
    fi
}

# Method 2: Using iptables
setup_iptables() {
    echo "Method 2: Setting up iptables port forwarding..."
    
    # Remove any existing incorrect rules
    echo "Cleaning up existing rules..."
    sudo iptables -t nat -L PREROUTING --line-numbers -n | grep "8080.*192.168.100.20" | awk '{print $1}' | sort -rn | while read line; do
        sudo iptables -t nat -D PREROUTING $line
    done
    
    # Add correct PREROUTING rule
    echo "Adding PREROUTING rule..."
    sudo iptables -t nat -A PREROUTING -p tcp -d 192.168.254.181 --dport 8080 -j DNAT --to-destination 192.168.100.10:30000
    check_result "PREROUTING rule"
    
    # Add FORWARD rule
    echo "Adding FORWARD rule..."
    sudo iptables -A FORWARD -p tcp -d 192.168.100.10 --dport 30000 -j ACCEPT
    check_result "FORWARD rule"
    
    # Ensure MASQUERADE is set
    sudo iptables -t nat -A POSTROUTING -j MASQUERADE
    
    # Enable IP forwarding
    echo "Enabling IP forwarding..."
    sudo sysctl -w net.ipv4.ip_forward=1
    echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf > /dev/null
    
    # Test the connection
    echo "Testing connection..."
    if curl -s http://192.168.254.181:8080/health | grep -q "API Gateway is healthy"; then
        echo "✓ Success! Application is accessible at http://192.168.254.181:8080"
        return 0
    else
        echo "✗ Connection test failed"
        return 1
    fi
}

# Method 3: Using nginx
setup_nginx() {
    echo "Method 3: Setting up nginx reverse proxy..."
    
    # Install nginx if not present
    if ! command -v nginx &> /dev/null; then
        echo "Installing nginx..."
        sudo apt-get update
        sudo apt-get install -y nginx
        check_result "Nginx installation"
    fi
    
    # Create nginx configuration
    echo "Creating nginx configuration..."
    sudo tee /etc/nginx/sites-available/purpose-planner << 'EOF'
server {
    listen 192.168.254.181:8080;
    server_name _;
    
    location / {
        proxy_pass http://192.168.100.10:30000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout       60s;
        proxy_send_timeout          60s;
        proxy_read_timeout          60s;
    }
}
EOF
    
    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/purpose-planner /etc/nginx/sites-enabled/
    
    # Test configuration
    sudo nginx -t
    check_result "Nginx configuration test"
    
    # Restart nginx
    sudo systemctl restart nginx
    check_result "Nginx restart"
    
    # Test the connection
    echo "Testing connection..."
    if curl -s http://192.168.254.181:8080/health | grep -q "API Gateway is healthy"; then
        echo "✓ Success! Application is accessible at http://192.168.254.181:8080"
        return 0
    else
        echo "✗ Connection test failed"
        return 1
    fi
}

# Main execution
echo "Purpose Planner Port Forwarding Setup"
echo "===================================="
echo

# First verify the source is accessible
echo "Verifying source service..."
if curl -s http://192.168.100.10:30000/health | grep -q "API Gateway is healthy"; then
    echo "✓ Source service is accessible"
else
    echo "✗ Source service is not accessible at http://192.168.100.10:30000"
    exit 1
fi

# Check current network configuration
echo
echo "Current network configuration:"
ip addr show | grep "inet " | grep -E "192.168.254|192.168.100"

# Try methods in order
echo
echo "Attempting setup methods..."

# Try socat first (simplest)
if setup_socat; then
    echo
    echo "✓ Setup successful using socat!"
else
    echo "Socat method failed, trying iptables..."
    
    # Try iptables
    if setup_iptables; then
        echo
        echo "✓ Setup successful using iptables!"
    else
        echo "Iptables method failed, trying nginx..."
        
        # Try nginx
        if setup_nginx; then
            echo
            echo "✓ Setup successful using nginx!"
        else
            echo
            echo "✗ All methods failed. Please check your configuration."
            exit 1
        fi
    fi
fi

echo
echo "Setup completed successfully!"
echo "Your application is now accessible from any device on your network at:"
echo "  http://192.168.254.181:8080"
echo
echo "Test from another device with:"
echo "  curl http://192.168.254.181:8080/health"
echo
echo "To make this persistent across reboots, run:"
echo "  sudo crontab -e"
echo "  Add: @reboot /home/master/vagrant-labs/my-apps/purpose-planner-app/purpose-planner-services/setup-port-forward.sh"