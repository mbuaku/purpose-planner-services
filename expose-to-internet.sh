#!/bin/bash

echo "Exposing Purpose Planner to the Internet"
echo "======================================="
echo ""

# Get your public IP
PUBLIC_IP=$(curl -s ifconfig.me)
echo "Your public IP: $PUBLIC_IP"
echo ""

echo "Choose your exposure method:"
echo "1. Using ngrok (easiest, no router config needed)"
echo "2. Using Cloudflare Tunnel (more permanent)"
echo "3. Direct port forwarding (requires router access)"
echo "4. Using a cloud VPS as reverse proxy"
echo ""

# Method 1: ngrok (easiest)
setup_ngrok() {
    echo "Setting up ngrok..."
    
    # Check if ngrok is installed
    if ! command -v ngrok &> /dev/null; then
        echo "Installing ngrok..."
        curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
        echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
        sudo apt update && sudo apt install ngrok
    fi
    
    echo "Starting ngrok tunnel..."
    ngrok http 192.168.100.10:30000
    # This will give you a URL like: https://abc123.ngrok.io
}

# Method 2: Cloudflare Tunnel
setup_cloudflare() {
    echo "Setting up Cloudflare Tunnel..."
    
    # Install cloudflared
    wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared-linux-amd64.deb
    
    echo "Login to Cloudflare:"
    cloudflared tunnel login
    
    echo "Create tunnel:"
    cloudflared tunnel create purpose-planner
    
    echo "Configure tunnel:"
    cat > ~/.cloudflared/config.yml << EOF
url: http://192.168.100.10:30000
tunnel: <TUNNEL_ID>
credentials-file: /home/$USER/.cloudflared/<TUNNEL_ID>.json
EOF
    
    echo "Run tunnel:"
    cloudflared tunnel run purpose-planner
}

# Method 3: Direct Port Forwarding
setup_direct() {
    echo "Direct Port Forwarding Setup"
    echo "==========================="
    echo ""
    echo "1. Configure your router to forward port 443/80 to your host machine:"
    echo "   - External Port: 443 (HTTPS) or 80 (HTTP)"
    echo "   - Internal IP: 192.168.254.181"
    echo "   - Internal Port: 9090"
    echo ""
    echo "2. Set up nginx with SSL:"
    
    # Install certbot for Let's Encrypt
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
    
    # Configure nginx
    sudo tee /etc/nginx/sites-available/purpose-planner-ssl << 'EOF'
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    # SSL will be configured by certbot
    
    location / {
        proxy_pass http://192.168.100.10:30000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
    
    sudo ln -sf /etc/nginx/sites-available/purpose-planner-ssl /etc/nginx/sites-enabled/
    
    echo "3. Get SSL certificate:"
    echo "   sudo certbot --nginx -d your-domain.com"
    echo ""
    echo "4. Update your domain's DNS to point to: $PUBLIC_IP"
}

# Method 4: VPS Reverse Proxy
setup_vps() {
    echo "VPS Reverse Proxy Setup"
    echo "======================"
    echo ""
    echo "1. Get a small VPS (DigitalOcean, Linode, etc.)"
    echo "2. Install WireGuard on both VPS and your host"
    echo "3. Create a secure tunnel"
    echo "4. Set up nginx on VPS to reverse proxy through the tunnel"
    echo ""
    echo "Example WireGuard config for your host:"
    cat << 'EOF'
[Interface]
PrivateKey = <your-private-key>
Address = 10.0.0.2/24

[Peer]
PublicKey = <vps-public-key>
Endpoint = <vps-ip>:51820
AllowedIPs = 10.0.0.1/32
PersistentKeepalive = 25
EOF
}

# Main menu
echo "Select method (1-4):"
read -p "Choice: " choice

case $choice in
    1) setup_ngrok ;;
    2) setup_cloudflare ;;
    3) setup_direct ;;
    4) setup_vps ;;
    *) echo "Invalid choice" ;;
esac