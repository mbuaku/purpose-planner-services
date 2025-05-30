# Purpose Planner Services - Complete Setup Guides

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Local Development Setup](#local-development-setup)
5. [Network Configuration](#network-configuration)
6. [Router Port Forwarding](#router-port-forwarding)
7. [Google OAuth Setup](#google-oauth-setup)
8. [Production Environment Setup](#production-environment-setup)
9. [Security Configuration](#security-configuration)
10. [Troubleshooting](#troubleshooting)
11. [Verification & Testing](#verification--testing)

## Overview

This comprehensive guide covers all setup procedures for the Purpose Planner Services application, from local development to production deployment. It includes network configuration, authentication setup, and security considerations.

### Setup Types Covered

1. **Local Development**: Quick setup for development work
2. **Network Access**: Port forwarding and router configuration
3. **Authentication**: Google OAuth integration
4. **Production**: Full production environment setup
5. **Security**: Security hardening and best practices

## Prerequisites

### System Requirements

- **Operating System**: Linux (Ubuntu 18.04+), macOS, or Windows with WSL2
- **Node.js**: Version 16 or higher
- **Docker**: Version 20.10+ with Docker Compose
- **Kubernetes**: Version 1.24+ (for production)
- **kubectl**: Configured and authenticated

### Network Requirements

- **Internet Connection**: Stable broadband connection
- **Router Access**: Administrative access to your router
- **Domain Names**: (Production only) elitessystems.com and api.elitessystems.com
- **SSL Certificates**: (Production only) Let's Encrypt or custom certificates

### Development Tools

```bash
# Essential tools installation (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y curl git wget unzip socat

# Node.js installation
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Docker installation
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose installation
sudo curl -L "https://github.com/docker/compose/releases/download/v2.17.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Quick Start

### 1. Initial Setup

```bash
# Clone the repository
git clone https://github.com/mbuaku/purpose-planner.git
cd purpose-planner-services

# Install dependencies
npm install
```

### 2. Kubernetes Deployment (if using K8s)

```bash
# Apply all Kubernetes manifests
kubectl apply -f k8s-manifests/namespaces.yaml
kubectl apply -f k8s-manifests/storage.yaml
kubectl apply -f k8s-manifests/infrastructure.yaml
kubectl apply -f k8s-manifests/services/

# Create secrets
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret="your-secret-key" \
  --from-literal=mongodb-uri="mongodb://admin:password123@mongodb:27017/purpose-planner?authSource=admin" \
  -n development
```

### 3. Setup Port Forwarding

```bash
# Method 1: Using socat (recommended)
sudo socat TCP-LISTEN:30000,fork TCP:192.168.100.10:30000 &

# Method 2: Using iptables
sudo iptables -t nat -A PREROUTING -p tcp --dport 30000 -j DNAT --to-destination 192.168.100.10:30000
sudo iptables -t nat -A POSTROUTING -j MASQUERADE
```

## Local Development Setup

### 1. Environment Configuration

Create environment files for each service:

```bash
# Create environment files for all services
for service in auth financial spiritual profile schedule dashboard gateway; do
  cp ${service}-service/.env.example ${service}-service/.env
done
```

### 2. Service-Specific Configuration

#### Auth Service (.env)
```bash
# auth-service/.env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/purpose-planner
JWT_SECRET=your-local-jwt-secret-key
JWT_EXPIRES_IN=24h

# Google OAuth (see Google OAuth Setup section)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

#### Gateway Service (.env)
```bash
# gateway-service/.env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-local-jwt-secret-key

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
PROFILE_SERVICE_URL=http://localhost:3004
FINANCIAL_SERVICE_URL=http://localhost:3002
SPIRITUAL_SERVICE_URL=http://localhost:3003
SCHEDULE_SERVICE_URL=http://localhost:3005
DASHBOARD_SERVICE_URL=http://localhost:3006

# Redis for caching
REDIS_URL=redis://localhost:6379
```

#### Database Services (.env)
```bash
# Common database configuration for all services
MONGODB_URI=mongodb://localhost:27017/purpose-planner
REDIS_URL=redis://localhost:6379

# MongoDB Authentication (if enabled)
MONGODB_USERNAME=admin
MONGODB_PASSWORD=password123
MONGODB_AUTH_SOURCE=admin
```

### 3. Dependencies Installation

```bash
# Install dependencies for each service
services=("auth-service" "financial-service" "spiritual-service" "profile-service" "schedule-service" "dashboard-service" "gateway-service")

for service in "${services[@]}"; do
  echo "Installing dependencies for $service..."
  cd $service
  npm install
  cd ..
done
```

### 4. Database Setup

```bash
# Start MongoDB and Redis using Docker
docker-compose up -d mongodb redis

# Wait for services to be ready
sleep 10

# Initialize MongoDB (if needed)
docker exec -it mongodb mongo --eval "
db.adminCommand({ setDefaultRWConcern: { w: 'majority' } });
db.createUser({
  user: 'admin',
  pwd: 'password123',
  roles: [{ role: 'root', db: 'admin' }]
});
"
```

### 5. Service Startup

```bash
# Option 1: Start all services with Docker Compose
docker-compose up -d

# Option 2: Start services individually for development
# Terminal 1: Gateway Service
cd gateway-service && npm run dev

# Terminal 2: Auth Service
cd auth-service && npm run dev

# Terminal 3: Financial Service
cd financial-service && npm run dev

# Continue for other services...
```

### 6. Local Testing

```bash
# Test all services are running
curl http://localhost:3000/health  # Gateway
curl http://localhost:3001/health  # Auth
curl http://localhost:3002/health  # Financial
curl http://localhost:3003/health  # Spiritual
curl http://localhost:3004/health  # Profile
curl http://localhost:3005/health  # Schedule
curl http://localhost:3006/health  # Dashboard

# Test API endpoints
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

## Network Configuration

### Port Forwarding Setup

#### Method 1: Using socat (Recommended)

**Advantages**: Simple, reliable, doesn't modify system iptables

```bash
# Install socat
sudo apt-get update
sudo apt-get install -y socat

# Forward port 30000 to Kubernetes service
sudo socat TCP-LISTEN:30000,fork TCP:192.168.100.10:30000 &

# For multiple ports (if needed)
sudo socat TCP-LISTEN:80,fork TCP:192.168.100.10:31989 &  # HTTP
sudo socat TCP-LISTEN:443,fork TCP:192.168.100.10:31990 & # HTTPS
```

**Make socat persistent**:
```bash
# Create systemd service
sudo tee /etc/systemd/system/port-forward-30000.service > /dev/null <<EOF
[Unit]
Description=Port Forward 30000 to Kubernetes
After=network.target

[Service]
ExecStart=/usr/bin/socat TCP-LISTEN:30000,fork TCP:192.168.100.10:30000
Restart=always
User=root

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl enable port-forward-30000.service
sudo systemctl start port-forward-30000.service
sudo systemctl status port-forward-30000.service
```

#### Method 2: Using iptables

**Advantages**: Built into Linux kernel, very efficient

```bash
# Add iptables rules
sudo iptables -t nat -A PREROUTING -p tcp --dport 30000 -j DNAT --to-destination 192.168.100.10:30000
sudo iptables -t nat -A POSTROUTING -j MASQUERADE
sudo iptables -A FORWARD -p tcp -d 192.168.100.10 --dport 30000 -j ACCEPT

# Make iptables rules persistent
sudo apt-get install -y iptables-persistent
sudo netfilter-persistent save
```

### Verification

```bash
# Test local access
curl http://localhost:30000/health

# Test external access (from another machine)
curl http://YOUR_HOST_IP:30000/health

# Check port forwarding
sudo netstat -tulpn | grep :30000
sudo ss -tulpn | grep :30000
```

## Router Port Forwarding

### General Configuration Steps

1. **Access Router Admin Panel**:
   - Open web browser
   - Navigate to router IP (usually 192.168.1.1 or 192.168.0.1)
   - Login with admin credentials

2. **Find Port Forwarding Section**:
   - Look for "Port Forwarding", "Virtual Servers", or "NAT"
   - Usually under "Advanced" or "Security" settings

3. **Configure Port Forwarding Rule**:
   - **Service Name**: Purpose Planner API
   - **External Port**: 30000
   - **Internal IP**: Your host machine IP
   - **Internal Port**: 30000
   - **Protocol**: TCP

### Brand-Specific Instructions

#### Linksys Routers

1. **Access Admin Panel**: http://192.168.1.1
2. **Navigate**: Smart Wi-Fi Tools → Port Forwarding
3. **Add Rule**:
   - Device: Select your host computer
   - External Port: 30000
   - Internal Port: 30000
   - Protocol: TCP
4. **Save**: Click "OK" and restart router

#### ASUS Routers

1. **Access Admin Panel**: http://192.168.1.1
2. **Navigate**: Advanced Settings → WAN → Virtual Server/Port Forwarding
3. **Add Rule**:
   - Service Name: Purpose-Planner
   - Port Range: 30000
   - Local IP: Your host IP
   - Local Port: 30000
   - Protocol: TCP
4. **Apply**: Click "Apply"

#### Netgear Routers

1. **Access Admin Panel**: http://192.168.1.1
2. **Navigate**: Advanced → Dynamic DNS/Port Forwarding → Port Forwarding
3. **Add Service**:
   - Service Name: Purpose-Planner-API
   - Service Type: TCP
   - External Starting Port: 30000
   - External Ending Port: 30000
   - Internal Starting Port: 30000
   - Internal Ending Port: 30000
   - Server IP Address: Your host IP
4. **Apply**: Click "Apply"

#### TP-Link Routers

1. **Access Admin Panel**: http://192.168.0.1
2. **Navigate**: Advanced → NAT Forwarding → Virtual Servers
3. **Add Rule**:
   - Service Type: Custom
   - External Port: 30000
   - Internal IP: Your host IP
   - Internal Port: 30000
   - Protocol: TCP
4. **Save**: Click "Save"

#### D-Link Routers

1. **Access Admin Panel**: http://192.168.0.1
2. **Navigate**: Advanced → Port Forwarding
3. **Add Rule**:
   - Name: Purpose-Planner
   - Public Port: 30000
   - Private Port: 30000
   - Traffic Type: TCP
   - Schedule: Always
   - Computer Name: Select your computer
4. **Save Settings**: Click "Save Settings"

### Testing Router Configuration

```bash
# Test from external network (use mobile hotspot or ask friend)
curl http://YOUR_PUBLIC_IP:30000/health

# Check public IP
curl ifconfig.me
curl ipinfo.io/ip

# Use online port checker
# Visit: https://www.yougetsignal.com/tools/open-ports/
# Enter your public IP and port 30000
```

## Google OAuth Setup

### 1. Google Cloud Console Configuration

#### Create New Project

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create New Project**:
   - Click "Select a project" → "New Project"
   - Project name: "Purpose Planner"
   - Click "Create"

#### Enable Google+ API

1. **Navigate to APIs & Services**: Left sidebar → "APIs & Services" → "Library"
2. **Search for Google+ API**: Search "Google+ API"
3. **Enable API**: Click "Google+ API" → "Enable"

#### Create OAuth 2.0 Credentials

1. **Go to Credentials**: APIs & Services → Credentials
2. **Create Credentials**: Click "Create Credentials" → "OAuth client ID"
3. **Configure OAuth Consent Screen** (if first time):
   - Application name: "Purpose Planner"
   - User support email: Your email
   - Developer contact: Your email
   - Save and continue through all steps

4. **Create OAuth Client ID**:
   - Application type: "Web application"
   - Name: "Purpose Planner Auth"
   
5. **Configure Authorized Redirect URIs**:
   ```
   # Development
   http://localhost:3001/api/auth/google/callback
   
   # Local Network
   http://YOUR_LOCAL_IP:3001/api/auth/google/callback
   http://YOUR_LOCAL_IP:30000/api/auth/google/callback
   
   # Production
   https://api.elitessystems.com/api/auth/google/callback
   ```

6. **Save Credentials**: Note down Client ID and Client Secret

### 2. Kubernetes Secrets Configuration

#### Development Environment

```bash
# Create secrets for development namespace
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret="$(openssl rand -base64 32)" \
  --from-literal=mongodb-uri="mongodb://admin:password123@mongodb:27017/purpose-planner?authSource=admin" \
  --from-literal=google-client-id="YOUR_GOOGLE_CLIENT_ID" \
  --from-literal=google-client-secret="YOUR_GOOGLE_CLIENT_SECRET" \
  -n development

# Verify secrets creation
kubectl get secrets -n development
kubectl describe secret app-secrets -n development
```

#### Production Environment

```bash
# Create secrets for production namespace
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret="$(openssl rand -base64 32)" \
  --from-literal=mongodb-uri="mongodb://admin:$(openssl rand -base64 16)@mongodb:27017/purpose-planner?authSource=admin" \
  --from-literal=google-client-id="YOUR_PRODUCTION_GOOGLE_CLIENT_ID" \
  --from-literal=google-client-secret="YOUR_PRODUCTION_GOOGLE_CLIENT_SECRET" \
  -n production
```

### 3. Environment Variable Configuration

#### Local Development (.env files)

```bash
# auth-service/.env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# gateway-service/.env (if handling OAuth)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

#### Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'
services:
  auth-service:
    environment:
      - GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
      - GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

### 4. Application Code Configuration

#### Passport.js Setup (auth-service)

```javascript
// src/config/passport.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      return done(null, user);
    }
    
    // Create new user
    user = new User({
      googleId: profile.id,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails[0].value,
      isVerified: true
    });
    
    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));
```

#### Auth Routes Setup

```javascript
// src/routes/auth.routes.js
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login?error=oauth_failed',
    session: false 
  }),
  async (req, res) => {
    // Generate JWT token
    const token = jwt.sign(
      { userId: req.user._id }, 
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
  }
);
```

### 5. Testing Google OAuth

```bash
# Test OAuth flow
curl http://localhost:3001/api/auth/google

# Check auth service logs
kubectl logs -f auth-service-pod -n development

# Test callback URL
curl http://localhost:3001/api/auth/google/callback
```

## Production Environment Setup

### 1. Domain Configuration

#### DNS Setup

```bash
# Configure DNS records (at your domain registrar)
# A Record: elitessystems.com → YOUR_PUBLIC_IP
# A Record: api.elitessystems.com → YOUR_PUBLIC_IP
# CNAME Record: www.elitessystems.com → elitessystems.com
```

#### SSL/TLS Certificates

```bash
# Option 1: Let's Encrypt with cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Deploy TLS configuration
kubectl apply -f k8s-manifests/tls-config.yaml

# Option 2: Manual certificate installation
kubectl create secret tls purpose-planner-tls \
  --cert=path/to/certificate.crt \
  --key=path/to/private.key \
  -n production
```

### 2. Production Secrets

```bash
# Generate strong secrets for production
JWT_SECRET=$(openssl rand -base64 32)
MONGODB_PASSWORD=$(openssl rand -base64 16)

# Create production secrets
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret="$JWT_SECRET" \
  --from-literal=mongodb-uri="mongodb://admin:$MONGODB_PASSWORD@mongodb:27017/purpose-planner?authSource=admin" \
  --from-literal=google-client-id="YOUR_PRODUCTION_GOOGLE_CLIENT_ID" \
  --from-literal=google-client-secret="YOUR_PRODUCTION_GOOGLE_CLIENT_SECRET" \
  -n production
```

### 3. Resource Configuration

```bash
# Apply production manifests with proper resource limits
kubectl apply -f k8s-manifests/services/ -n production

# Configure HPA for production
kubectl apply -f k8s-manifests/hpa.yaml -n production

# Setup monitoring
kubectl apply -f k8s-manifests/monitoring.yaml
```

### 4. Backup Configuration

```bash
# Setup automated backups
kubectl apply -f k8s-manifests/backup.yaml

# Test backup creation
kubectl create job --from=cronjob/mongodb-backup mongodb-backup-test -n production
```

## Security Configuration

### 1. Firewall Configuration

```bash
# Configure UFW (Ubuntu Firewall)
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH
sudo ufw allow ssh

# Allow application ports
sudo ufw allow 30000/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Kubernetes ports (if external access needed)
sudo ufw allow 6443/tcp  # Kubernetes API
sudo ufw allow 10250/tcp # Kubelet API

# Check status
sudo ufw status verbose
```

### 2. Application Security

#### Environment Variables Security

```bash
# Never commit secrets to version control
echo "*.env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore

# Use strong secrets
JWT_SECRET=$(openssl rand -base64 32)
MONGODB_PASSWORD=$(openssl rand -base64 24)
```

#### API Security Configuration

```javascript
// In gateway-service/src/middleware/security.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit each IP to 5 auth requests per windowMs
  skipSuccessfulRequests: true
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

### 3. Network Security

```bash
# Apply network policies
kubectl apply -f k8s-manifests/namespaces.yaml

# Verify network policies
kubectl get networkpolicies -n development
kubectl describe networkpolicy default-deny-all -n development
```

### 4. Database Security

```bash
# MongoDB security configuration
kubectl exec -it mongodb-0 -n production -- mongo admin --eval "
db.createUser({
  user: 'admin',
  pwd: '$(openssl rand -base64 16)',
  roles: [
    { role: 'userAdminAnyDatabase', db: 'admin' },
    { role: 'readWriteAnyDatabase', db: 'admin' }
  ]
});
db.auth('admin', 'password');
db.adminCommand({ shutdown: 1 });
"

# Enable MongoDB authentication
kubectl patch statefulset mongodb -p '{"spec":{"template":{"spec":{"containers":[{"name":"mongodb","args":["--auth"]}]}}}}' -n production
```

### 5. Monitoring and Logging

```bash
# Deploy monitoring stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack -n monitoring --create-namespace

# Setup log aggregation
kubectl apply -f k8s-manifests/logging.yaml

# Configure alerting
kubectl apply -f k8s-manifests/alerting.yaml
```

## Troubleshooting

### Network Issues

#### Port Forwarding Not Working

**Problem**: Cannot access application externally

**Solutions**:
```bash
# Check if port forwarding process is running
ps aux | grep socat
ps aux | grep 30000

# Restart port forwarding
sudo killall socat
sudo socat TCP-LISTEN:30000,fork TCP:192.168.100.10:30000 &

# Check iptables rules
sudo iptables -t nat -L PREROUTING -n --line-numbers
sudo iptables -L FORWARD -n

# Test internal connectivity
curl http://192.168.100.10:30000/health
```

#### Router Configuration Issues

**Problem**: Router port forwarding not working

**Solutions**:
```bash
# Check router status
ping 192.168.1.1  # or your router IP

# Verify internal IP hasn't changed
ip addr show
hostname -I

# Test from inside network first
curl http://INTERNAL_IP:30000/health

# Check router logs (if accessible)
# Look for blocked connections or firewall rules
```

### Application Issues

#### Services Not Starting

**Problem**: Kubernetes pods not starting

**Solutions**:
```bash
# Check pod status
kubectl get pods -n development
kubectl describe pod auth-service-pod -n development

# Check resource usage
kubectl top nodes
kubectl describe nodes

# Check secrets
kubectl get secrets -n development
kubectl describe secret app-secrets -n development
```

#### Database Connection Issues

**Problem**: Cannot connect to MongoDB

**Solutions**:
```bash
# Check MongoDB pod
kubectl get pods -l app=mongodb -n development
kubectl logs mongodb-0 -n development

# Test connection
kubectl exec -it auth-service-pod -n development -- nc -zv mongodb 27017

# Check MongoDB credentials
kubectl exec -it mongodb-0 -n development -- mongo --eval "db.adminCommand('ismaster')"
```

### Google OAuth Issues

#### OAuth Redirect Errors

**Problem**: OAuth callback failing

**Solutions**:
```bash
# Check OAuth configuration
kubectl exec -it auth-service-pod -n development -- env | grep GOOGLE

# Verify redirect URIs in Google Console match exactly
# Check auth service logs
kubectl logs -f auth-service-pod -n development

# Test OAuth flow manually
curl http://localhost:3001/api/auth/google
```

#### Invalid Client Errors

**Problem**: Google returns "invalid client" error

**Solutions**:
1. **Verify Client ID and Secret**: Check Google Cloud Console
2. **Check Redirect URIs**: Must match exactly including protocol
3. **Verify Domain**: Ensure domain is authorized in Google Console
4. **Check Environment Variables**: Ensure secrets are properly loaded

### ISP and Network Provider Issues

#### ISP Blocking Ports

**Problem**: ISP blocking non-standard ports

**Solutions**:
```bash
# Test if port is blocked
telnet YOUR_PUBLIC_IP 30000

# Use standard ports instead
# Configure router to forward port 80 → 30000
# Configure router to forward port 443 → 30000

# Contact ISP if ports are blocked
# Some ISPs block ports 80, 443, 25, etc. on residential connections
```

#### Double NAT Issues

**Problem**: Router behind another router/modem

**Solutions**:
1. **Check Network Topology**: Identify all network devices
2. **Configure Bridge Mode**: Set modem to bridge mode
3. **Port Forward on All Devices**: Configure port forwarding on each router
4. **Use DMZ**: Place your router in DMZ of upstream device

### Kubernetes Issues

#### Resource Constraints

**Problem**: Pods can't schedule due to resource limits

**Solutions**:
```bash
# Check node resources
kubectl describe nodes | grep -A 5 "Allocated resources"

# Reduce resource requests
kubectl patch deployment auth-service -p '{"spec":{"template":{"spec":{"containers":[{"name":"auth-service","resources":{"requests":{"memory":"64Mi","cpu":"50m"}}}]}}}}' -n development

# Add more worker nodes
# Or increase node resources
```

#### Image Pull Issues

**Problem**: Cannot pull Docker images

**Solutions**:
```bash
# Check image exists
docker pull mbuaku/purpose-planner-services:auth-latest

# Check image pull policy
kubectl get deployment auth-service -o yaml | grep imagePullPolicy

# Update deployment with correct image
kubectl set image deployment/auth-service auth-service=mbuaku/purpose-planner-services:auth-latest -n development
```

### Performance Issues

#### Slow Response Times

**Problem**: Application responding slowly

**Solutions**:
```bash
# Check resource usage
kubectl top pods -n development
kubectl top nodes

# Check database performance
kubectl exec -it mongodb-0 -n development -- mongo --eval "db.stats()"

# Scale up replicas
kubectl scale deployment auth-service --replicas=3 -n development

# Check HPA status
kubectl get hpa -n development
```

#### Memory Issues

**Problem**: High memory usage or OOM kills

**Solutions**:
```bash
# Check memory usage
kubectl top pods -n development --sort-by=memory

# Increase memory limits
kubectl patch deployment auth-service -p '{"spec":{"template":{"spec":{"containers":[{"name":"auth-service","resources":{"limits":{"memory":"512Mi"}}}]}}}}' -n development

# Check for memory leaks
kubectl logs auth-service-pod -n development | grep -i memory
```

### Emergency Recovery

#### Complete Service Outage

**Emergency Steps**:
```bash
# 1. Check cluster status
kubectl cluster-info
kubectl get nodes

# 2. Restart all services
kubectl rollout restart deployment --all -n development

# 3. Check critical services first
kubectl get pods -l app=mongodb -n development
kubectl get pods -l app=gateway-service -n development

# 4. Verify external access
curl -I https://api.elitessystems.com/health

# 5. Check monitoring alerts
kubectl get pods -n monitoring
```

#### Database Recovery

**Emergency Database Restore**:
```bash
# 1. Stop application services
kubectl scale deployment --replicas=0 --all -n development

# 2. Restore MongoDB backup
kubectl cp ./backup/mongodb mongodb-0:/tmp/restore -n development
kubectl exec -it mongodb-0 -n development -- mongorestore --drop /tmp/restore

# 3. Restart services
kubectl scale deployment --replicas=1 --all -n development
```

## Verification & Testing

### Health Check Verification

```bash
# Test all service endpoints
services=("gateway:3000" "auth:3001" "financial:3002" "spiritual:3003" "profile:3004" "schedule:3005" "dashboard:3006")

for service in "${services[@]}"; do
  name=$(echo $service | cut -d: -f1)
  port=$(echo $service | cut -d: -f2)
  echo "Testing $name service..."
  curl -f http://localhost:$port/health || echo "$name service failed"
done
```

### End-to-End Testing

```bash
# Test user registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Test user login
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }' | jq -r '.data.token')

# Test authenticated endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/profile
```

### External Access Testing

```bash
# Test from external network
curl http://YOUR_PUBLIC_IP:30000/health

# Test domain access (production)
curl https://api.elitessystems.com/health

# Test Google OAuth flow
curl http://YOUR_PUBLIC_IP:30000/api/auth/google
```

### Performance Testing

```bash
# Install Apache Bench (ab)
sudo apt-get install apache2-utils

# Basic load test
ab -n 100 -c 10 http://localhost:3000/health

# Authenticated endpoint test
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/profile
```

---

This comprehensive setup guide should help you configure the Purpose Planner Services in any environment. For additional support, refer to the [Troubleshooting Guide](./TROUBLESHOOTING.md) and [Architecture Documentation](./ARCHITECTURE.md).