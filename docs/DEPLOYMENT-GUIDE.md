# Purpose Planner Services - Comprehensive Deployment Guide

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Local Development](#local-development)
4. [Production Deployment](#production-deployment)
5. [Infrastructure as Code](#infrastructure-as-code)
6. [Monitoring & Verification](#monitoring--verification)
7. [Security](#security)
8. [Backup & Recovery](#backup--recovery)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

## Overview

This guide provides comprehensive instructions for deploying the Purpose Planner Services across different environments, from local development to production Kubernetes clusters. The system is designed with Infrastructure as Code principles, enabling automated provisioning and management.

### Deployment Options

1. **Local Development**: Docker Compose for rapid development
2. **Individual Services**: Run specific services for focused development
3. **Kubernetes Production**: Full production deployment with auto-scaling
4. **PaaS Options**: Heroku, DigitalOcean App Platform, AWS EKS

## Prerequisites

### General Requirements

- **Node.js**: Version 16 or higher
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: Latest version for source control

### Kubernetes Requirements

- **Kubernetes**: Version 1.24 or higher
- **kubectl**: Configured and authenticated
- **Helm**: Version 3.x (for certain dependencies)
- **Storage**: Persistent volume support
- **Networking**: LoadBalancer or Ingress controller support

### Infrastructure Components (Auto-installed with Vagrant)

- **Metrics Server**: For resource monitoring and HPA
- **NGINX Ingress Controller**: For external routing and SSL termination
- **Calico CNI**: For container networking
- **cert-manager**: For SSL/TLS certificate management (optional)

### Domain Requirements (Production)

- **Primary Domain**: elitessystems.com (for frontend)
- **API Domain**: api.elitessystems.com (for backend)
- **DNS Management**: Access to domain DNS settings
- **SSL Certificates**: Let's Encrypt or custom certificates

## Local Development

### Quick Start with Docker Compose

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mbuaku/purpose-planner.git
   cd purpose-planner-services
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   # Copy example environment files
   for service in auth financial spiritual profile schedule dashboard gateway; do
     cp ${service}-service/.env.example ${service}-service/.env
   done
   ```

4. **Configure environment variables** (edit each .env file):
   ```bash
   # Common environment variables
   MONGODB_URI=mongodb://mongodb:27017/purpose-planner
   REDIS_URL=redis://redis:6379
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   
   # Google OAuth (optional for development)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

5. **Start all services**:
   ```bash
   docker-compose up -d
   ```

6. **Verify deployment**:
   ```bash
   # Check all containers are running
   docker-compose ps
   
   # Access the application
   curl http://localhost:3000/health
   ```

### Individual Service Development

For focused development on specific services:

```bash
# Start only required infrastructure
docker-compose up -d mongodb redis

# Run a specific service in development mode
cd auth-service
npm install
npm run dev

# Or run multiple services
cd gateway-service && npm run dev &
cd auth-service && npm run dev &
```

### Local Testing

```bash
# Run all tests
npm test

# Run tests for a specific service
cd auth-service && npm test

# Run with coverage
npm run test:coverage

# Lint code
npm run lint
```

## Production Deployment

### Infrastructure as Code Deployment

The recommended production deployment uses Kubernetes with automated infrastructure provisioning.

#### Option 1: Automated Setup with Vagrant (Recommended)

1. **Prerequisites**:
   ```bash
   # Install required tools
   sudo apt-get update
   sudo apt-get install -y vagrant virtualbox
   ```

2. **Deploy infrastructure**:
   ```bash
   # Clone infrastructure repository
   git clone https://github.com/mbuaku/kubernetes-vagrant.git
   cd kubernetes-vagrant
   
   # Start Kubernetes cluster (automatically installs components)
   vagrant up
   
   # Configure kubectl
   vagrant ssh master
   mkdir -p ~/.kube
   sudo cp /etc/kubernetes/admin.conf ~/.kube/config
   sudo chown $(id -u):$(id -g) ~/.kube/config
   ```

#### Option 2: Manual Kubernetes Setup

1. **Prepare cluster**:
   ```bash
   # Install Metrics Server (required for HPA)
   kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
   
   # Install NGINX Ingress Controller
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
   
   # Wait for ingress controller
   kubectl wait --namespace ingress-nginx \
     --for=condition=ready pod \
     --selector=app.kubernetes.io/component=controller \
     --timeout=120s
   ```

2. **Deploy cert-manager (for SSL)**:
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
   ```

### Application Deployment

1. **Create namespaces**:
   ```bash
   kubectl apply -f k8s-manifests/namespaces.yaml
   ```

2. **Deploy storage components**:
   ```bash
   kubectl apply -f k8s-manifests/storage.yaml
   ```

3. **Deploy infrastructure services**:
   ```bash
   kubectl apply -f k8s-manifests/infrastructure.yaml
   ```

4. **Create application secrets**:
   ```bash
   # Create secrets for development namespace
   kubectl create secret generic app-secrets \
     --from-literal=jwt-secret="$(openssl rand -base64 32)" \
     --from-literal=mongodb-uri="mongodb://admin:password123@mongodb:27017/purpose-planner?authSource=admin" \
     --from-literal=google-client-id="your-google-client-id" \
     --from-literal=google-client-secret="your-google-client-secret" \
     -n development
   
   # Create secrets for production namespace
   kubectl create secret generic app-secrets \
     --from-literal=jwt-secret="$(openssl rand -base64 32)" \
     --from-literal=mongodb-uri="mongodb://admin:$(openssl rand -base64 16)@mongodb:27017/purpose-planner?authSource=admin" \
     --from-literal=google-client-id="your-production-google-client-id" \
     --from-literal=google-client-secret="your-production-google-client-secret" \
     -n production
   ```

5. **Deploy microservices**:
   ```bash
   kubectl apply -f k8s-manifests/services/
   ```

6. **Setup ingress and TLS**:
   ```bash
   # Deploy ingress configuration
   kubectl apply -f k8s-manifests/ingress-elitessystems.yaml
   
   # Deploy TLS configuration (if using cert-manager)
   kubectl apply -f k8s-manifests/tls-config.yaml
   ```

7. **Enable auto-scaling**:
   ```bash
   kubectl apply -f k8s-manifests/hpa.yaml
   ```

### CI/CD Pipeline Deployment

If using Jenkins for automated deployment:

```bash
# Jenkins will handle these steps automatically
1. Code checkout from GitHub
2. Dependency installation and testing
3. Docker image building and pushing
4. Kubernetes deployment
5. Health verification
```

## Infrastructure as Code

### Automated Components

When using the Vagrant-based setup, the following components are automatically provisioned:

1. **Kubernetes Cluster**:
   - Version: 1.30.13
   - Configuration: 1 master + 3 worker nodes
   - Networking: Calico CNI
   - Resource: 2 CPU, 4GB RAM per node

2. **Metrics Server**:
   - Purpose: Resource monitoring for HPA
   - Configuration: Automatic installation
   - Dependencies: None

3. **NGINX Ingress Controller**:
   - Purpose: External traffic routing
   - Features: SSL termination, load balancing
   - Configuration: NodePort 31989 for external access

4. **Container Runtime**:
   - Engine: containerd
   - Version: Latest stable
   - Configuration: Production-ready settings

### Horizontal Pod Autoscaler (HPA)

HPA automatically scales services based on resource usage:

```yaml
# Development Environment
minReplicas: 1
maxReplicas: 3
targetCPUUtilizationPercentage: 70
targetMemoryUtilizationPercentage: 70

# Production Environment
minReplicas: 2
maxReplicas: 10
targetCPUUtilizationPercentage: 60
targetMemoryUtilizationPercentage: 60
```

### Service Configuration

Each microservice is configured with:

```yaml
# Resource Limits
resources:
  requests:
    cpu: 100m      # Gateway: 200m
    memory: 128Mi  # Gateway: 256Mi
  limits:
    cpu: 250m      # Gateway: 500m
    memory: 256Mi  # Gateway: 512Mi

# Health Checks
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

## Monitoring & Verification

### Basic Verification

After deployment, verify all components are working:

```bash
# Check all pods are running
kubectl get pods -n development

# Check services
kubectl get services -n development

# Check ingress
kubectl get ingress -n development

# Test application health
curl http://localhost:30000/health
```

### Resource Monitoring

```bash
# Check resource usage (requires Metrics Server)
kubectl top nodes
kubectl top pods -n development

# Check HPA status
kubectl get hpa -n development

# Watch HPA scaling in action
kubectl get hpa -n development -w
```

### Advanced Monitoring Setup

#### Prometheus and Grafana

```bash
# Add Prometheus Helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace

# Access Grafana (default: admin/prom-operator)
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
```

#### ELK Stack for Logging

```bash
# Deploy ELK stack
kubectl apply -f k8s-manifests/logging.yaml

# Access Kibana
kubectl port-forward -n logging svc/kibana 5601:5601
```

### Application Metrics

Monitor key application metrics:

- **Response Times**: API endpoint performance
- **Error Rates**: 4xx and 5xx responses
- **Throughput**: Requests per second
- **Resource Usage**: CPU, memory, disk I/O
- **Database Performance**: Query times, connection pool

## Security

### Network Security

```bash
# Apply network policies
kubectl apply -f k8s-manifests/namespaces.yaml

# Verify network policies
kubectl get networkpolicies -n development
```

### Authentication and Authorization

1. **JWT Configuration**:
   ```bash
   # Generate secure JWT secret
   JWT_SECRET=$(openssl rand -base64 32)
   ```

2. **Google OAuth Setup**:
   - Create project in Google Cloud Console
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Configure authorized redirect URIs

3. **Database Security**:
   ```bash
   # MongoDB with authentication
   MONGODB_URI="mongodb://username:password@mongodb:27017/database?authSource=admin"
   ```

### Secrets Management

```bash
# View secrets (without revealing values)
kubectl get secrets -n development

# Update secrets
kubectl create secret generic app-secrets \
  --from-literal=key=value \
  --dry-run=client -o yaml | kubectl apply -f -
```

### Image Security

```bash
# Scan images for vulnerabilities
docker scan mbuaku/purpose-planner-services:auth-latest

# Use minimal base images
FROM node:16-alpine
```

## Backup & Recovery

### Automated Backup

```bash
# Deploy backup configuration
kubectl apply -f k8s-manifests/backup.yaml
```

### Manual Backup Procedures

#### MongoDB Backup

```bash
# Create backup
kubectl exec -it mongodb-0 -n development -- mongodump \
  --uri="mongodb://admin:password123@localhost:27017/purpose-planner?authSource=admin" \
  --out=/tmp/backup

# Copy backup to local machine
kubectl cp development/mongodb-0:/tmp/backup ./mongodb-backup-$(date +%Y%m%d)
```

#### Redis Backup

```bash
# Create Redis snapshot
kubectl exec -it redis-0 -n development -- redis-cli BGSAVE

# Copy snapshot
kubectl cp development/redis-0:/data/dump.rdb ./redis-backup-$(date +%Y%m%d).rdb
```

### Restore Procedures

#### MongoDB Restore

```bash
# Copy backup to pod
kubectl cp ./mongodb-backup mongodb-0:/tmp/restore -n development

# Restore database
kubectl exec -it mongodb-0 -n development -- mongorestore \
  --uri="mongodb://admin:password123@localhost:27017/purpose-planner?authSource=admin" \
  --drop /tmp/restore
```

#### Redis Restore

```bash
# Stop Redis service
kubectl scale statefulset redis --replicas=0 -n development

# Copy backup file
kubectl cp ./redis-backup.rdb redis-0:/data/dump.rdb -n development

# Start Redis service
kubectl scale statefulset redis --replicas=1 -n development
```

## Troubleshooting

### Common Issues

#### 1. Pods Not Starting

**Symptoms**: Pods stuck in Pending, CrashLoopBackOff, or ImagePullBackOff state

**Diagnosis**:
```bash
kubectl describe pod <pod-name> -n development
kubectl logs <pod-name> -n development
kubectl get events -n development --sort-by='.lastTimestamp'
```

**Solutions**:
- Check resource limits and node capacity
- Verify image names and registry access
- Ensure secrets and configmaps exist
- Check persistent volume claims

#### 2. Service Connectivity Issues

**Symptoms**: Services cannot communicate with each other

**Diagnosis**:
```bash
kubectl exec -it <pod-name> -n development -- nslookup <service-name>
kubectl exec -it <pod-name> -n development -- curl http://<service-name>:<port>/health
```

**Solutions**:
- Verify service definitions and selectors
- Check network policies
- Ensure correct port configurations
- Validate DNS resolution

#### 3. Database Connection Issues

**Symptoms**: Applications cannot connect to MongoDB or Redis

**Diagnosis**:
```bash
kubectl logs <app-pod> -n development | grep -i mongo
kubectl exec -it mongodb-0 -n development -- mongo --eval "db.adminCommand('ismaster')"
```

**Solutions**:
- Verify database credentials in secrets
- Check database service availability
- Ensure persistent volumes are bound
- Validate connection strings

#### 4. Ingress and External Access Issues

**Symptoms**: Cannot access application from outside cluster

**Diagnosis**:
```bash
kubectl get ingress -n development
kubectl describe ingress <ingress-name> -n development
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

**Solutions**:
- Verify ingress controller is running
- Check DNS configuration
- Ensure proper annotations on ingress
- Validate SSL certificate status

#### 5. HPA Not Scaling

**Symptoms**: Horizontal Pod Autoscaler not scaling pods

**Diagnosis**:
```bash
kubectl describe hpa <hpa-name> -n development
kubectl top pods -n development
kubectl get --raw /apis/metrics.k8s.io/v1beta1/nodes
```

**Solutions**:
- Ensure Metrics Server is installed and running
- Verify resource requests are set on pods
- Check HPA configuration and thresholds
- Monitor resource usage patterns

#### 6. Authentication Failures

**Symptoms**: Users cannot login or receive authentication errors

**Diagnosis**:
```bash
kubectl logs <auth-service-pod> -n development
kubectl exec -it <auth-service-pod> -n development -- env | grep JWT
```

**Solutions**:
- Verify JWT secret consistency across services
- Check Google OAuth configuration
- Validate user credentials and database
- Ensure auth service is reachable

### Performance Issues

#### Slow Response Times

```bash
# Monitor resource usage
kubectl top pods -n development

# Check database performance
kubectl exec -it mongodb-0 -n development -- mongo --eval "db.stats()"

# Analyze logs for slow queries
kubectl logs <service-pod> -n development | grep -i slow
```

#### High Memory Usage

```bash
# Check memory limits
kubectl describe pod <pod-name> -n development | grep -A 5 "Limits"

# Monitor memory usage over time
kubectl top pods -n development --containers

# Adjust resource limits if needed
kubectl patch deployment <deployment-name> -p '{"spec":{"template":{"spec":{"containers":[{"name":"<container-name>","resources":{"limits":{"memory":"512Mi"}}}]}}}}'
```

### Debugging Commands

```bash
# Get detailed pod information
kubectl describe pod <pod-name> -n development

# Access pod shell for debugging
kubectl exec -it <pod-name> -n development -- /bin/sh

# View recent events
kubectl get events -n development --sort-by='.lastTimestamp' | tail -20

# Check resource quotas
kubectl describe resourcequota -n development

# Monitor real-time logs
kubectl logs -f <pod-name> -n development

# Test service connectivity
kubectl run test-pod --image=busybox -it --rm -- wget -qO- http://<service-name>:<port>/health
```

## Maintenance

### Rolling Updates

```bash
# Update deployment image
kubectl set image deployment/<deployment-name> <container-name>=<new-image> -n development

# Check rollout status
kubectl rollout status deployment/<deployment-name> -n development

# Rollback if needed
kubectl rollout undo deployment/<deployment-name> -n development
```

### Scaling Operations

```bash
# Manual scaling
kubectl scale deployment <deployment-name> --replicas=5 -n development

# Update HPA settings
kubectl patch hpa <hpa-name> -p '{"spec":{"maxReplicas":15}}' -n development
```

### Database Maintenance

```bash
# MongoDB maintenance
kubectl exec -it mongodb-0 -n development -- mongo --eval "db.runCommand({compact: 'collection-name'})"

# Redis maintenance
kubectl exec -it redis-0 -n development -- redis-cli FLUSHDB
```

### Log Management

```bash
# Rotate logs (if not using ELK stack)
kubectl exec -it <pod-name> -n development -- logrotate /etc/logrotate.conf

# Clear old logs
kubectl exec -it <pod-name> -n development -- find /var/log -name "*.log" -mtime +7 -delete
```

### Certificate Renewal

```bash
# Check certificate status
kubectl get certificates -n development

# Force certificate renewal (cert-manager)
kubectl delete certificate <certificate-name> -n development
kubectl apply -f k8s-manifests/tls-config.yaml
```

## Best Practices

### Security Best Practices

1. **Always use secrets for sensitive data**
2. **Enable network policies for pod isolation**
3. **Use non-root containers when possible**
4. **Regularly update base images**
5. **Implement proper RBAC**
6. **Monitor for security vulnerabilities**

### Performance Best Practices

1. **Set appropriate resource requests and limits**
2. **Use HPA for automatic scaling**
3. **Implement caching strategies**
4. **Monitor and optimize database queries**
5. **Use persistent volumes for data**
6. **Implement health checks**

### Operational Best Practices

1. **Use Infrastructure as Code**
2. **Implement comprehensive monitoring**
3. **Maintain regular backups**
4. **Test disaster recovery procedures**
5. **Document all procedures**
6. **Use GitOps for deployments**

## Next Steps

After successful deployment:

1. **Set up monitoring and alerting**
2. **Configure backup schedules**
3. **Implement log aggregation**
4. **Set up CI/CD pipelines**
5. **Plan capacity and scaling**
6. **Create runbooks for operations**

For additional help, refer to:
- [Architecture Guide](./ARCHITECTURE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Setup Guides](./SETUP-GUIDES.md)
- [CI/CD Guide](./CI-CD-GUIDE.md)