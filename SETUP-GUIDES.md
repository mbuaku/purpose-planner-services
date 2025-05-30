# Purpose Planner - Comprehensive Setup Guide

This guide consolidates all setup procedures for the Purpose Planner application, covering manual setup, network configuration, router setup, Google OAuth, and both local development and production environments.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Local Development Setup](#local-development-setup)
3. [Network Configuration & Port Forwarding](#network-configuration--port-forwarding)
4. [Router Configuration by Brand](#router-configuration-by-brand)
5. [Google OAuth Setup](#google-oauth-setup)
6. [Production Environment Setup](#production-environment-setup)
7. [Security Considerations](#security-considerations)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- Ubuntu/Linux system with sudo access
- Kubernetes cluster running
- Docker and kubectl installed
- Internet connection

### Initial Setup Commands
```bash
# Navigate to project directory
cd /home/master/vagrant-labs/my-apps/purpose-planner-app/purpose-planner-services

# Apply Kubernetes manifests
kubectl apply -f k8s-manifests/storage.yaml
kubectl apply -f k8s-manifests/infrastructure.yaml
kubectl apply -f k8s-manifests/services/
kubectl apply -f k8s-manifests/namespaces.yaml
kubectl apply -f k8s-manifests/ingress-elitessystems.yaml
kubectl apply -f k8s-manifests/tls-config.yaml
kubectl apply -f k8s-manifests/hpa.yaml

# Create application secrets
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret="your-secret-key" \
  --from-literal=mongodb-uri="mongodb://admin:password123@mongodb:27017/purpose-planner?authSource=admin" \
  -n development
```

---

## Local Development Setup

### 1. Environment Setup

Create `.env` files for each service:

#### Auth Service (.env)
```bash
cd auth-service
cat > .env << EOF
PORT=3001
JWT_SECRET=your-local-jwt-secret
MONGODB_URI=mongodb://localhost:27017/purpose-planner-dev
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
CLIENT_REDIRECT_URL=http://localhost:5173/login?token=
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
EOF
```

#### Gateway Service (.env)
```bash
cd gateway-service
cat > .env << EOF
PORT=3000
AUTH_SERVICE_URL=http://localhost:3001
FINANCIAL_SERVICE_URL=http://localhost:3002
SPIRITUAL_SERVICE_URL=http://localhost:3003
PROFILE_SERVICE_URL=http://localhost:3004
SCHEDULE_SERVICE_URL=http://localhost:3005
DASHBOARD_SERVICE_URL=http://localhost:3006
REDIS_URL=redis://localhost:6379
ALLOWED_ORIGINS=http://localhost:5173
EOF
```

### 2. Install Dependencies

```bash
# Install all service dependencies
npm install

# Install individual service dependencies
cd auth-service && npm install && cd ..
cd gateway-service && npm install && cd ..
cd financial-service && npm install && cd ..
cd spiritual-service && npm install && cd ..
cd profile-service && npm install && cd ..
cd schedule-service && npm install && cd ..
cd dashboard-service && npm install && cd ..
```

### 3. Start Local Services

```bash
# Start MongoDB (if not using Docker)
sudo systemctl start mongod

# Start Redis (if not using Docker)
sudo systemctl start redis

# Start all services in development mode
npm run dev

# Or start individual services
cd auth-service && npm run dev &
cd gateway-service && npm run dev &
# ... continue for other services
```

### 4. Verify Local Setup

```bash
# Test services
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
curl http://localhost:3005/health
curl http://localhost:3006/health
```

---

## Network Configuration & Port Forwarding

### Option 1: Using socat (Recommended)

```bash
# Install socat
sudo apt-get update
sudo apt-get install -y socat

# Start port forwarding from host to VM
sudo socat TCP-LISTEN:30000,fork,reuseaddr,bind=0.0.0.0 TCP:192.168.100.10:30000 &

# Allow through firewall
sudo ufw allow 30000/tcp
```

#### Make socat Permanent
```bash
# Create systemd service
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

# Enable and start service
sudo systemctl enable purpose-planner-forward
sudo systemctl start purpose-planner-forward
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

#### Make iptables Permanent
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

### Network Access URLs

After setup, your application will be accessible at:
- **VM Internal**: http://192.168.100.10:30000
- **Host Machine**: http://localhost:30000
- **Local Network**: http://192.168.254.181:30000
- **Internet**: http://YOUR_PUBLIC_IP:30000

---

## Router Configuration by Brand

### Prerequisites
1. Get your network information:
   ```bash
   # Find your public IP
   curl ifconfig.me
   
   # Find your internal IP
   hostname -I
   
   # Find your gateway
   ip route | grep default
   ```

2. Access your router admin panel (typically http://192.168.254.1 or http://192.168.1.1)

### Standard Port Forwarding Rule

For **HTTP Access (Port 80)**:
```
Service Name:    Purpose Planner
Protocol:        TCP
External Port:   80
Internal IP:     192.168.254.181
Internal Port:   80
Status:          Enabled
```

For **HTTPS Access (Port 443)** (Optional):
```
Service Name:    Purpose Planner HTTPS
Protocol:        TCP
External Port:   443
Internal IP:     192.168.254.181
Internal Port:   443
Status:          Enabled
```

### Linksys Routers

1. Navigate to: **Apps & Gaming** > **Single Port Forwarding**
2. Fill in:
   - Application Name: `Purpose Planner`
   - External Port: `80`
   - Internal Port: `80`
   - Protocol: `TCP`
   - Device IP: `192.168.254.181`
   - Enabled: `✓ Check`
3. Click **Save Settings**

### ASUS Routers

1. Navigate to: **WAN** > **Virtual Server / Port Forwarding**
2. Click **Add profile**
3. Fill in:
   - Service Name: `Purpose Planner`
   - Protocol: `TCP`
   - External Port: `80`
   - Internal IP: `192.168.254.181`
   - Internal Port: `80`
   - Source IP: `Leave blank`
4. Click **Add** then **Apply**

### Netgear Routers

1. Navigate to: **Dynamic DNS** > **Port Forwarding**
2. Click **Add Custom Service**
3. Fill in:
   - Service Name: `Purpose Planner`
   - Protocol: `TCP`
   - Starting Port: `80`
   - Ending Port: `80`
   - Server IP Address: `192.168.254.181`
4. Click **Apply**

### TP-Link Routers

1. Navigate to: **Advanced** > **NAT Forwarding** > **Virtual Servers**
2. Click **Add**
3. Fill in:
   - Service Type: `HTTP`
   - External Port: `80`
   - Internal IP: `192.168.254.181`
   - Internal Port: `80`
   - Protocol: `TCP`
   - Status: `Enabled`
4. Click **Save**

### D-Link Routers

1. Navigate to: **Advanced** > **Port Forwarding Rules**
2. Fill in:
   - Name: `Purpose Planner`
   - IP Address: `192.168.254.181`
   - TCP: `80`
   - UDP: `Leave blank`
   - Schedule: `Always`
3. Click **Save Settings**

### Testing Router Configuration

From a device on cellular or different network:
```bash
# Test with your public IP
curl http://YOUR_PUBLIC_IP/health

# Or test in browser
http://YOUR_PUBLIC_IP
```

---

## Google OAuth Setup

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Select **Web application** as the application type
6. Add a name (e.g., "Purpose Planner Auth")

#### Authorized JavaScript Origins
```
https://elitessystems.com
https://api.elitessystems.com
http://localhost:3000 (for development)
http://localhost:5173 (for frontend development)
```

#### Authorized Redirect URIs
```
https://api.elitessystems.com/api/auth/google/callback
http://localhost:3001/api/auth/google/callback (for development)
```

7. Click **Create**
8. Note the **Client ID** and **Client Secret**

### 2. Update Kubernetes Secrets

#### For Development Environment
```bash
kubectl -n development create secret generic app-secrets \
  --from-literal=jwt-secret="your-secret-key" \
  --from-literal=mongodb-uri="mongodb://admin:password123@mongodb:27017/purpose-planner?authSource=admin" \
  --from-literal=google-client-id="YOUR_GOOGLE_CLIENT_ID" \
  --from-literal=google-client-secret="YOUR_GOOGLE_CLIENT_SECRET" \
  --dry-run=client -o yaml | kubectl apply -f -
```

#### For Production Environment
```bash
kubectl -n production create secret generic app-secrets \
  --from-literal=jwt-secret="your-production-secret-key" \
  --from-literal=mongodb-uri="mongodb://admin:production-password@mongodb:27017/purpose-planner?authSource=admin" \
  --from-literal=google-client-id="YOUR_GOOGLE_CLIENT_ID" \
  --from-literal=google-client-secret="YOUR_GOOGLE_CLIENT_SECRET" \
  --dry-run=client -o yaml | kubectl apply -f -
```

#### Patch Existing Secrets
```bash
kubectl -n development patch secret app-secrets --type=json -p='[
  {"op": "add", "path": "/data/google-client-id", "value": "'$(echo -n YOUR_GOOGLE_CLIENT_ID | base64)'"},
  {"op": "add", "path": "/data/google-client-secret", "value": "'$(echo -n YOUR_GOOGLE_CLIENT_SECRET | base64)'"}
]'
```

### 3. Restart Auth Service

```bash
# Restart auth service to pick up new environment variables
kubectl -n development rollout restart deployment auth-service
kubectl -n production rollout restart deployment auth-service
```

### 4. Test Google Authentication

1. Navigate to your application login page
2. Click the "Login with Google" button
3. You should be redirected to Google's sign-in page
4. After signing in, you should be redirected back to your application

---

## Production Environment Setup

### 1. SSL/TLS Certificate Setup

#### Using Let's Encrypt with Certbot
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate for your domain
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

#### Using cert-manager in Kubernetes
```bash
# Apply TLS configuration
kubectl apply -f k8s-manifests/tls-config.yaml

# Check certificate status
kubectl get certificates
kubectl describe certificate purpose-planner-tls
```

### 2. Domain Configuration

1. Purchase domain from registrar
2. Point A records to your public IP:
   ```
   @ (root)         → YOUR_PUBLIC_IP
   api              → YOUR_PUBLIC_IP
   www              → YOUR_PUBLIC_IP
   ```

### 3. Production Secrets Management

```bash
# Create production secrets with strong values
kubectl -n production create secret generic app-secrets \
  --from-literal=jwt-secret="$(openssl rand -base64 32)" \
  --from-literal=mongodb-uri="mongodb://admin:$(openssl rand -base64 32)@mongodb:27017/purpose-planner?authSource=admin" \
  --from-literal=google-client-id="YOUR_GOOGLE_CLIENT_ID" \
  --from-literal=google-client-secret="YOUR_GOOGLE_CLIENT_SECRET" \
  --from-literal=redis-password="$(openssl rand -base64 32)"
```

### 4. Resource Monitoring

```bash
# Check pod status
kubectl get pods -n production

# Check resource usage
kubectl top pods -n production
kubectl top nodes

# Check HPA status
kubectl get hpa -n production
```

### 5. Backup Strategy

#### Database Backup
```bash
# Create MongoDB backup script
cat > /home/master/backup-mongodb.sh << 'EOF'
#!/bin/bash
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/home/master/backups"
mkdir -p $BACKUP_DIR

kubectl exec -n production deployment/mongodb -- mongodump \
  --host localhost:27017 \
  --authenticationDatabase admin \
  --username admin \
  --password password123 \
  --db purpose-planner \
  --out /tmp/backup_$DATE

kubectl cp production/mongodb-pod:/tmp/backup_$DATE $BACKUP_DIR/mongodb_backup_$DATE
echo "Backup completed: $BACKUP_DIR/mongodb_backup_$DATE"
EOF

chmod +x /home/master/backup-mongodb.sh

# Add to cron for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /home/master/backup-mongodb.sh") | crontab -
```

---

## Security Considerations

### 1. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 30000/tcp  # For direct Kubernetes access
sudo ufw enable
```

### 2. Application Security

#### Environment Variables Protection
- Never commit secrets to version control
- Use Kubernetes secrets for sensitive data
- Rotate secrets regularly

#### Authentication Security
```bash
# Generate strong JWT secrets
openssl rand -base64 32

# Use secure session configuration
# Add to application configuration:
SESSION_SECURE=true
SESSION_HTTPONLY=true
SESSION_SAMESITE=strict
```

#### CORS Configuration
```javascript
// In gateway service
const corsOptions = {
  origin: [
    'https://yourdomain.com',
    'https://api.yourdomain.com',
    process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : ''
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 3. Network Security

#### Rate Limiting
```bash
# Configure rate limiting in gateway
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # max 100 requests per window
```

#### HTTPS Enforcement
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 4. Database Security

```bash
# MongoDB security
# Create application-specific user with limited permissions
kubectl exec -n production deployment/mongodb -- mongo admin -u admin -p password123 --eval "
db.createUser({
  user: 'purpose-planner-app',
  pwd: 'app-specific-password',
  roles: [
    { role: 'readWrite', db: 'purpose-planner' }
  ]
});
"
```

### 5. Monitoring and Logging

```bash
# Set up log rotation
sudo tee /etc/logrotate.d/purpose-planner << EOF
/var/log/purpose-planner/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 purpose-planner purpose-planner
}
EOF
```

---

## Troubleshooting

### Common Network Issues

#### Port Already in Use
```bash
# Find process using port
sudo lsof -i :30000

# Kill process if needed
sudo kill <PID>

# Check if forwarding is working
sudo netstat -tlnp | grep 30000
```

#### Firewall Issues
```bash
# Check firewall status
sudo ufw status verbose

# Check iptables rules
sudo iptables -t nat -L -n -v

# Reset iptables if needed
sudo iptables -t nat -F
sudo iptables -F
```

#### Router Configuration Issues
```bash
# Test port forwarding from external network
curl http://YOUR_PUBLIC_IP/health

# Use online port checker tools:
# - https://canyouseeme.org/
# - https://www.portchecker.co/
```

### Application Issues

#### Google OAuth Errors

**Error: redirect_uri_mismatch**
- Verify redirect URI in Google Cloud Console matches exactly
- Should be: `https://api.elitessystems.com/api/auth/google/callback`

**Google authentication not configured**
```bash
# Check if secrets are properly set
kubectl -n development get secret app-secrets -o yaml

# Check auth service logs
kubectl -n development logs deployment/auth-service

# Restart auth service
kubectl -n development rollout restart deployment/auth-service
```

#### Database Connection Issues
```bash
# Check MongoDB status
kubectl -n development get pods | grep mongodb

# Check MongoDB logs
kubectl -n development logs deployment/mongodb

# Test MongoDB connection
kubectl -n development exec deployment/mongodb -- mongo --eval "db.adminCommand('ismaster')"
```

#### Service Communication Issues
```bash
# Check all services are running
kubectl -n development get pods

# Check service endpoints
kubectl -n development get endpoints

# Test service connectivity
kubectl -n development exec deployment/gateway-service -- curl http://auth-service:3001/health
```

### ISP and Network Provider Issues

#### Common ISP Restrictions
- Some ISPs block ports 80 and 443
- Residential connections may have different restrictions
- Contact ISP to request port unblocking

#### Alternative Port Solutions
```bash
# Use alternative ports if 80/443 are blocked
# Update router forwarding to use ports 8080/8443
External Port: 8080 → Internal Port: 80
External Port: 8443 → Internal Port: 443
```

#### Dynamic IP Solutions
If your ISP changes your public IP frequently:

1. **No-IP (Free)**:
   - Sign up at https://www.noip.com/
   - Configure DDNS in router
   - Use hostname instead of IP

2. **DuckDNS (Free)**:
   - Sign up at https://www.duckdns.org/
   - Configure with router or script

### Kubernetes Issues

#### Pod Restart Loops
```bash
# Check pod status
kubectl -n development get pods

# Check pod logs
kubectl -n development logs pod-name --previous

# Describe pod for events
kubectl -n development describe pod pod-name
```

#### Resource Issues
```bash
# Check resource usage
kubectl top nodes
kubectl top pods -n development

# Check resource quotas
kubectl -n development describe resourcequota
```

#### Storage Issues
```bash
# Check persistent volumes
kubectl get pv
kubectl get pvc -n development

# Check storage class
kubectl get storageclass
```

### Performance Issues

#### High CPU/Memory Usage
```bash
# Check resource usage
kubectl top pods -n development

# Scale deployment if needed
kubectl -n development scale deployment gateway-service --replicas=3

# Check HPA status
kubectl -n development get hpa
```

#### Slow Response Times
```bash
# Check service logs for errors
kubectl -n development logs deployment/gateway-service

# Test direct service connectivity
kubectl -n development port-forward deployment/gateway-service 3000:3000
curl http://localhost:3000/health
```

### Emergency Recovery

#### Complete System Reset
```bash
# Delete all resources and recreate
kubectl delete namespace development
kubectl delete namespace production

# Recreate from manifests
kubectl apply -f k8s-manifests/namespaces.yaml
kubectl apply -f k8s-manifests/storage.yaml
kubectl apply -f k8s-manifests/infrastructure.yaml
kubectl apply -f k8s-manifests/services/

# Recreate secrets
kubectl -n development create secret generic app-secrets \
  --from-literal=jwt-secret="your-secret-key" \
  --from-literal=mongodb-uri="mongodb://admin:password123@mongodb:27017/purpose-planner?authSource=admin"
```

#### Backup Restoration
```bash
# Restore MongoDB from backup
kubectl cp /home/master/backups/mongodb_backup_latest production/mongodb-pod:/tmp/restore

kubectl exec -n production deployment/mongodb -- mongorestore \
  --host localhost:27017 \
  --authenticationDatabase admin \
  --username admin \
  --password password123 \
  --db purpose-planner \
  /tmp/restore/purpose-planner
```

---

## Final Verification

After completing setup, verify everything is working:

### 1. Internal Access
```bash
curl http://192.168.100.10:30000/health
curl http://localhost:30000/health
```

### 2. Local Network Access
```bash
curl http://192.168.254.181/health
```

### 3. External Access
```bash
# From mobile phone on cellular data
curl http://YOUR_PUBLIC_IP/health
```

### 4. Web Browser Testing
- Internal: http://192.168.254.181
- External: http://YOUR_PUBLIC_IP
- Domain: https://yourdomain.com (if configured)

### 5. Google OAuth Testing
1. Navigate to login page
2. Click "Login with Google"
3. Complete OAuth flow
4. Verify successful authentication

Your Purpose Planner application should now be fully accessible from anywhere on the internet with proper security measures in place!