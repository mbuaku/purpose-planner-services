# Purpose Planner Services - Troubleshooting Guide

## Table of Contents

1. [Overview](#overview)
2. [Quick Reference](#quick-reference)
3. [Authentication & API Issues](#authentication--api-issues)
4. [Ingress & Networking Problems](#ingress--networking-problems)
5. [Database Connectivity Issues](#database-connectivity-issues)
6. [Performance Problems](#performance-problems)
7. [Service Communication Issues](#service-communication-issues)
8. [Kubernetes Deployment Issues](#kubernetes-deployment-issues)
9. [Debugging Commands](#debugging-commands)
10. [Prevention Strategies](#prevention-strategies)
11. [Emergency Procedures](#emergency-procedures)

## Overview

This guide provides comprehensive troubleshooting procedures for the Purpose Planner Services microservices application. It covers common issues, their diagnosis, and solutions across all deployment environments.

### When to Use This Guide

- Application not responding or behaving unexpectedly
- Services failing to start or crashing
- Authentication or authorization failures
- Database connectivity problems
- Performance degradation
- Deployment or configuration issues

## Quick Reference

### Service Information
| Service | Port | Health Check | Purpose |
|---------|------|--------------|---------|
| Gateway | 3000 | `/health` | API Gateway & Routing |
| Auth | 3001 | `/health` | Authentication & Authorization |
| Financial | 3002 | `/health` | Budget & Expense Management |
| Spiritual | 3003 | `/health` | Prayer & Bible Study |
| Profile | 3004 | `/health` | User Profile Management |
| Schedule | 3005 | `/health` | Calendar & Events |
| Dashboard | 3006 | `/health` | Data Aggregation |

### Key URLs
- **Local**: http://localhost:3000
- **Kubernetes**: http://cluster-ip:30000
- **Production**: https://api.elitessystems.com
- **Documentation**: https://api.elitessystems.com/api-docs

### Emergency Commands
```bash
# Check all services status
kubectl get pods -n development

# View system events
kubectl get events -n development --sort-by='.lastTimestamp'

# Emergency restart all services
kubectl rollout restart deployment --all -n development

# Check resource usage
kubectl top pods -n development
```

## Authentication & API Issues

### 1. Duplicate API Path Issue (Gateway Service)

**Problem**: The gateway service was incorrectly rewriting paths by removing the `/api` prefix from incoming requests and then forwarding them to services that also expect `/api` in their paths.

**Symptoms**:
- 404 errors when accessing API endpoints
- Routes not found errors
- Gateway cannot reach backend services

**Root Cause**: Gateway configuration was removing `/api` prefix but services expected it.

**Solution**:
```javascript
// In gateway-service route configuration
// BEFORE (incorrect):
app.use('/api/auth', authRoutes); // This was rewriting to remove /api

// AFTER (correct):
app.use('/auth', authRoutes); // Route directly without /api prefix

// Or ensure target service URLs include /api
const authServiceUrl = process.env.AUTH_SERVICE_URL + '/api';
```

**Verification**:
```bash
# Test gateway routing
curl http://localhost:3000/health
curl http://localhost:3000/api/auth/health

# Check gateway logs
kubectl logs -f gateway-service-pod -n development
```

### 2. Frontend API Configuration Issues

**Problem**: Frontend making requests to URLs that result in duplicate `/api` segments.

**Symptoms**:
- Frontend receives 404 errors
- API calls failing in browser console
- URLs appearing as `/api/api/endpoint`

**Root Cause**: Frontend API configuration not matching backend path structure.

**Solutions**:

#### Option A: Fix Backend (Recommended)
```javascript
// Ensure consistent API path handling in gateway
app.use('/api/auth', proxy({
  target: 'http://auth-service:3001',
  pathRewrite: {'^/api/auth': '/api/auth'} // Keep /api prefix
}));
```

#### Option B: Fix Frontend
```javascript
// In frontend API configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.elitessystems.com'
  : 'http://localhost:3000';

// Ensure consistent path construction
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  // Don't add /api here if gateway already handles it
});
```

**Verification**:
```bash
# Test from frontend
curl http://localhost:3000/api/auth/health
curl http://localhost:3000/api/profile/health

# Check network tab in browser developer tools
```

### 3. JWT Token Validation Failures

**Problem**: Services rejecting valid JWT tokens.

**Symptoms**:
- 401 Unauthorized errors
- "Invalid token" messages
- Authentication randomly failing

**Diagnosis**:
```bash
# Check JWT secret consistency
kubectl get secret app-secrets -o yaml -n development
kubectl exec -it auth-service-pod -- env | grep JWT_SECRET
kubectl exec -it gateway-service-pod -- env | grep JWT_SECRET
```

**Solutions**:
```bash
# Ensure consistent JWT secret across all services
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret="your-consistent-secret" \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart services to pick up new secret
kubectl rollout restart deployment auth-service -n development
kubectl rollout restart deployment gateway-service -n development
```

### 4. Google OAuth Configuration Issues

**Problem**: Google authentication not working.

**Symptoms**:
- "OAuth error" messages
- Redirect failures after Google login
- Missing user information

**Diagnosis**:
```bash
# Check OAuth configuration
kubectl exec -it auth-service-pod -- env | grep GOOGLE
kubectl logs auth-service-pod | grep -i oauth
```

**Solutions**:
1. **Verify Google Cloud Console Setup**:
   ```bash
   # Ensure correct redirect URIs are configured:
   # Local: http://localhost:3001/api/auth/google/callback
   # Production: https://api.elitessystems.com/api/auth/google/callback
   ```

2. **Update Kubernetes Secrets**:
   ```bash
   kubectl create secret generic app-secrets \
     --from-literal=google-client-id="your-google-client-id" \
     --from-literal=google-client-secret="your-google-client-secret" \
     --dry-run=client -o yaml | kubectl apply -f -
   ```

3. **Verify Environment Variables**:
   ```javascript
   // In auth-service configuration
   GOOGLE_CLIENT_ID=process.env.GOOGLE_CLIENT_ID
   GOOGLE_CLIENT_SECRET=process.env.GOOGLE_CLIENT_SECRET
   GOOGLE_CALLBACK_URL=process.env.GOOGLE_CALLBACK_URL
   ```

## Ingress & Networking Problems

### 1. Namespace Mismatch Issue

**Problem**: Ingress configuration targeting services in wrong namespace.

**Symptoms**:
- External access not working
- 503 Service Unavailable errors
- Ingress showing no backends

**Root Cause**: Ingress configured for production namespace but services deployed in development namespace.

**Diagnosis**:
```bash
# Check ingress configuration
kubectl get ingress -n development
kubectl describe ingress purpose-planner-ingress -n development

# Check service locations
kubectl get services --all-namespaces | grep -E "(auth|gateway|profile)"
```

**Solution**:
```bash
# Update ingress to correct namespace
kubectl patch ingress purpose-planner-ingress -n development \
  --patch '{"spec":{"rules":[{"host":"api.elitessystems.com","http":{"paths":[{"path":"/","pathType":"Prefix","backend":{"service":{"name":"gateway-service","port":{"number":3000}}}}]}}]}}'

# Or apply corrected ingress manifest
kubectl apply -f k8s-manifests/ingress-elitessystems.yaml
```

**Verification**:
```bash
# Check ingress backends
kubectl describe ingress purpose-planner-ingress -n development

# Test external access
curl -H "Host: api.elitessystems.com" http://cluster-ip/health
```

### 2. SSL/TLS Certificate Issues

**Problem**: HTTPS not working or certificate errors.

**Symptoms**:
- Browser security warnings
- Certificate not found errors
- Mixed content warnings

**Diagnosis**:
```bash
# Check certificate status
kubectl get certificates -n development
kubectl describe certificate purpose-planner-tls -n development

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager
```

**Solutions**:
```bash
# Force certificate renewal
kubectl delete certificate purpose-planner-tls -n development
kubectl apply -f k8s-manifests/tls-config.yaml

# Check certificate issuer
kubectl get clusterissuer
kubectl describe clusterissuer letsencrypt-prod
```

### 3. Load Balancer Configuration Problems

**Problem**: External load balancer not working correctly.

**Symptoms**:
- Intermittent connectivity
- Some services unreachable
- Load balancing not distributing requests

**Diagnosis**:
```bash
# Check load balancer status
kubectl get services -n development
kubectl describe service gateway-service -n development

# Check endpoint distribution
kubectl get endpoints -n development
```

**Solutions**:
```bash
# Restart ingress controller
kubectl rollout restart deployment ingress-nginx-controller -n ingress-nginx

# Check ingress controller configuration
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

## Database Connectivity Issues

### 1. MongoDB Connection Failures

**Problem**: Services cannot connect to MongoDB.

**Symptoms**:
- Database connection errors in logs
- Services failing health checks
- "Connection refused" errors

**Diagnosis**:
```bash
# Check MongoDB pod status
kubectl get pods -l app=mongodb -n development
kubectl logs mongodb-0 -n development

# Test connection from service pod
kubectl exec -it auth-service-pod -n development -- nc -zv mongodb 27017
```

**Solutions**:
```bash
# Check MongoDB service
kubectl get service mongodb -n development
kubectl describe service mongodb -n development

# Verify MongoDB credentials
kubectl get secret app-secrets -o yaml -n development

# Test MongoDB directly
kubectl exec -it mongodb-0 -n development -- mongo --eval "db.adminCommand('ismaster')"

# Check persistent volume
kubectl get pvc mongodb-pvc -n development
kubectl describe pvc mongodb-pvc -n development
```

### 2. Redis Connectivity Issues

**Problem**: Services cannot connect to Redis cache.

**Symptoms**:
- Caching not working
- Session management failures
- Redis connection errors

**Diagnosis**:
```bash
# Check Redis status
kubectl get pods -l app=redis -n development
kubectl logs redis-0 -n development

# Test Redis connectivity
kubectl exec -it gateway-service-pod -n development -- nc -zv redis 6379
```

**Solutions**:
```bash
# Test Redis commands
kubectl exec -it redis-0 -n development -- redis-cli ping

# Check Redis configuration
kubectl exec -it redis-0 -n development -- redis-cli config get "*"

# Verify Redis service
kubectl describe service redis -n development
```

### 3. Persistent Volume Issues

**Problem**: Database data not persisting or PV not mounting.

**Symptoms**:
- Data loss after pod restarts
- Pods stuck in pending state
- Volume mounting errors

**Diagnosis**:
```bash
# Check persistent volumes
kubectl get pv
kubectl get pvc -n development

# Check volume status
kubectl describe pvc mongodb-pvc -n development
kubectl describe pvc redis-pvc -n development
```

**Solutions**:
```bash
# Check storage class
kubectl get storageclass

# Force PVC recreation if needed
kubectl delete pvc mongodb-pvc -n development
kubectl apply -f k8s-manifests/storage.yaml

# Check node storage capacity
kubectl describe nodes | grep -A 5 "Capacity:"
```

## Performance Problems

### 1. High Memory Usage

**Problem**: Pods consuming excessive memory.

**Symptoms**:
- Pods being killed (OOMKilled)
- Slow response times
- Memory warnings in logs

**Diagnosis**:
```bash
# Check memory usage
kubectl top pods -n development
kubectl describe pod auth-service-pod -n development | grep -A 5 "Limits"

# Check historical resource usage
kubectl logs auth-service-pod -n development | grep -i memory
```

**Solutions**:
```bash
# Increase memory limits
kubectl patch deployment auth-service -p '{"spec":{"template":{"spec":{"containers":[{"name":"auth-service","resources":{"limits":{"memory":"512Mi"}}}]}}}}' -n development

# Check for memory leaks in application
kubectl exec -it auth-service-pod -n development -- node --inspect-brk server.js

# Restart high-memory pods
kubectl delete pod auth-service-pod -n development
```

### 2. CPU Performance Issues

**Problem**: High CPU usage causing slow responses.

**Symptoms**:
- Slow API responses
- High CPU utilization
- Request timeouts

**Diagnosis**:
```bash
# Check CPU usage
kubectl top pods -n development
kubectl top nodes

# Monitor CPU over time
kubectl top pods -n development --sort-by=cpu
```

**Solutions**:
```bash
# Increase CPU limits
kubectl patch deployment gateway-service -p '{"spec":{"template":{"spec":{"containers":[{"name":"gateway","resources":{"limits":{"cpu":"500m"}}}]}}}}' -n development

# Scale up replicas
kubectl scale deployment gateway-service --replicas=3 -n development

# Check HPA configuration
kubectl get hpa -n development
kubectl describe hpa gateway-service-hpa -n development
```

### 3. Database Performance Issues

**Problem**: Slow database queries affecting application performance.

**Symptoms**:
- Slow API responses
- Database timeout errors
- High database CPU usage

**Diagnosis**:
```bash
# Check MongoDB performance
kubectl exec -it mongodb-0 -n development -- mongo --eval "db.stats()"
kubectl exec -it mongodb-0 -n development -- mongo --eval "db.runCommand({profile: 2})"

# Check slow queries
kubectl exec -it mongodb-0 -n development -- mongo --eval "db.system.profile.find().limit(5).sort({time:-1}).pretty()"
```

**Solutions**:
```bash
# Add database indexes
kubectl exec -it mongodb-0 -n development -- mongo purpose-planner --eval "db.users.createIndex({email: 1})"

# Increase MongoDB resources
kubectl patch statefulset mongodb -p '{"spec":{"template":{"spec":{"containers":[{"name":"mongodb","resources":{"limits":{"memory":"2Gi","cpu":"1000m"}}}]}}}}' -n development

# Optimize queries in application code
# Review and optimize database queries
```

## Service Communication Issues

### 1. Service Discovery Problems

**Problem**: Services cannot find each other.

**Symptoms**:
- "Service not found" errors
- DNS resolution failures
- Inter-service communication failing

**Diagnosis**:
```bash
# Check service DNS resolution
kubectl exec -it gateway-service-pod -n development -- nslookup auth-service
kubectl exec -it gateway-service-pod -n development -- nslookup auth-service.development.svc.cluster.local

# Check service definitions
kubectl get services -n development
kubectl describe service auth-service -n development
```

**Solutions**:
```bash
# Verify service selectors match pod labels
kubectl describe service auth-service -n development
kubectl get pods -l app=auth-service -n development

# Check endpoints
kubectl get endpoints auth-service -n development

# Update service URLs in environment variables
kubectl set env deployment/gateway-service AUTH_SERVICE_URL=http://auth-service:3001 -n development
```

### 2. Network Policy Conflicts

**Problem**: Network policies blocking service communication.

**Symptoms**:
- Intermittent connection failures
- Some services reachable, others not
- Connection timeouts

**Diagnosis**:
```bash
# Check network policies
kubectl get networkpolicies -n development
kubectl describe networkpolicy -n development

# Test connectivity between pods
kubectl exec -it gateway-service-pod -n development -- nc -zv auth-service 3001
```

**Solutions**:
```bash
# Temporarily disable network policies for debugging
kubectl delete networkpolicy --all -n development

# Update network policies to allow required traffic
kubectl apply -f k8s-manifests/namespaces.yaml

# Test specific port connectivity
kubectl exec -it gateway-service-pod -n development -- telnet auth-service 3001
```

### 3. Load Balancing Issues

**Problem**: Requests not being distributed evenly across service replicas.

**Symptoms**:
- Some pods overloaded
- Uneven response times
- Session affinity problems

**Diagnosis**:
```bash
# Check replica distribution
kubectl get pods -l app=auth-service -o wide -n development

# Check service endpoints
kubectl describe endpoints auth-service -n development

# Monitor request distribution
kubectl logs -f gateway-service-pod -n development | grep auth-service
```

**Solutions**:
```bash
# Ensure multiple replicas are running
kubectl scale deployment auth-service --replicas=3 -n development

# Check service configuration
kubectl get service auth-service -o yaml -n development

# Verify pod readiness
kubectl describe pod auth-service-pod -n development | grep -A 5 "Ready"
```

## Kubernetes Deployment Issues

### 1. Image Pull Errors

**Problem**: Cannot pull Docker images.

**Symptoms**:
- ImagePullBackOff status
- ErrImagePull errors
- Pods stuck in pending state

**Diagnosis**:
```bash
# Check image pull status
kubectl describe pod auth-service-pod -n development
kubectl get events -n development | grep -i image

# Verify image exists
docker pull mbuaku/purpose-planner-services:auth-latest
```

**Solutions**:
```bash
# Check image registry credentials
kubectl get secrets -n development | grep regcred

# Update image with correct tag
kubectl set image deployment/auth-service auth-service=mbuaku/purpose-planner-services:auth-latest -n development

# Pull image manually on nodes
# SSH to each node and run: docker pull mbuaku/purpose-planner-services:auth-latest
```

### 2. Pod Scheduling Failures

**Problem**: Pods cannot be scheduled on nodes.

**Symptoms**:
- Pods stuck in pending state
- "Insufficient resources" errors
- Node selector conflicts

**Diagnosis**:
```bash
# Check node resources
kubectl describe nodes
kubectl top nodes

# Check pod scheduling events
kubectl describe pod auth-service-pod -n development
kubectl get events -n development | grep -i schedule
```

**Solutions**:
```bash
# Check resource requests vs available resources
kubectl describe nodes | grep -A 5 "Allocated resources"

# Reduce resource requests temporarily
kubectl patch deployment auth-service -p '{"spec":{"template":{"spec":{"containers":[{"name":"auth-service","resources":{"requests":{"memory":"64Mi","cpu":"50m"}}}]}}}}' -n development

# Add more nodes to cluster if needed
# Scale cluster or remove resource constraints
```

### 3. Health Check Configuration

**Problem**: Health checks failing incorrectly.

**Symptoms**:
- Pods marked as unhealthy
- Frequent pod restarts
- Services removing healthy pods

**Diagnosis**:
```bash
# Check health check configuration
kubectl describe pod auth-service-pod -n development | grep -A 10 "Liveness\|Readiness"

# Test health endpoint manually
kubectl exec -it auth-service-pod -n development -- curl http://localhost:3001/health
```

**Solutions**:
```bash
# Update health check configuration
kubectl patch deployment auth-service -p '{"spec":{"template":{"spec":{"containers":[{"name":"auth-service","livenessProbe":{"initialDelaySeconds":60,"periodSeconds":30}}]}}}}' -n development

# Check application health endpoint
kubectl logs auth-service-pod -n development | grep health

# Ensure health endpoint is working
kubectl port-forward auth-service-pod 3001:3001 -n development
# Then test: curl http://localhost:3001/health
```

## Debugging Commands

### Essential Kubectl Commands

```bash
# Get overall cluster status
kubectl cluster-info
kubectl get nodes
kubectl get namespaces

# Check pod status and details
kubectl get pods -n development
kubectl describe pod <pod-name> -n development
kubectl logs <pod-name> -n development
kubectl logs -f <pod-name> -n development --tail=100

# Check services and networking
kubectl get services -n development
kubectl get endpoints -n development
kubectl describe service <service-name> -n development

# Check deployments and scaling
kubectl get deployments -n development
kubectl describe deployment <deployment-name> -n development
kubectl rollout status deployment/<deployment-name> -n development

# Check resource usage
kubectl top nodes
kubectl top pods -n development
kubectl get hpa -n development

# Check events and troubleshooting
kubectl get events -n development --sort-by='.lastTimestamp'
kubectl describe pod <pod-name> -n development | grep -A 10 Events
```

### Service-Specific Debugging

```bash
# Test service connectivity
kubectl exec -it <pod-name> -n development -- curl http://<service-name>:<port>/health
kubectl exec -it <pod-name> -n development -- nc -zv <service-name> <port>

# Check environment variables
kubectl exec -it <pod-name> -n development -- env | sort
kubectl exec -it <pod-name> -n development -- printenv | grep -i mongodb

# Access pod shell for debugging
kubectl exec -it <pod-name> -n development -- /bin/sh
kubectl exec -it <pod-name> -n development -- bash

# Port forwarding for local testing
kubectl port-forward <pod-name> <local-port>:<pod-port> -n development
kubectl port-forward service/<service-name> <local-port>:<service-port> -n development
```

### Log Analysis

```bash
# Search logs for specific errors
kubectl logs <pod-name> -n development | grep -i error
kubectl logs <pod-name> -n development | grep -i mongodb
kubectl logs <pod-name> -n development | grep -i authentication

# Get logs from all pods in deployment
kubectl logs deployment/<deployment-name> -n development

# Get previous pod logs (after restart)
kubectl logs <pod-name> -n development --previous

# Stream logs from multiple pods
kubectl logs -f -l app=auth-service -n development
```

### Network Debugging

```bash
# Test DNS resolution
kubectl exec -it <pod-name> -n development -- nslookup <service-name>
kubectl exec -it <pod-name> -n development -- dig <service-name>.development.svc.cluster.local

# Test network connectivity
kubectl run debug-pod --image=busybox -it --rm -- /bin/sh
# Inside pod: wget -qO- http://<service-name>:<port>/health

# Check network policies
kubectl get networkpolicies -n development
kubectl describe networkpolicy <policy-name> -n development

# Check ingress configuration
kubectl get ingress -n development
kubectl describe ingress <ingress-name> -n development
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

## Prevention Strategies

### 1. Monitoring and Alerting

**Set up comprehensive monitoring**:
```bash
# Deploy Prometheus and Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack -n monitoring --create-namespace

# Set up custom alerts for application metrics
kubectl apply -f k8s-manifests/monitoring.yaml
```

**Key metrics to monitor**:
- Pod CPU and memory usage
- Application response times
- Error rates (4xx, 5xx responses)
- Database connection pool status
- Service availability

### 2. Health Checks Implementation

**Implement robust health checks**:
```javascript
// In each service server.js
app.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    await mongoose.connection.db.admin().ping();
    
    // Check Redis connectivity (if applicable)
    await redisClient.ping();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date(),
      service: 'auth-service',
      database: 'connected',
      cache: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### 3. Resource Management

**Set appropriate resource limits**:
```yaml
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "250m"
```

**Implement HPA for auto-scaling**:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 4. Security Best Practices

**Implement security measures**:
```bash
# Use secrets for sensitive data
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret="$(openssl rand -base64 32)"

# Implement network policies
kubectl apply -f k8s-manifests/network-policies.yaml

# Regular security scanning
docker scan mbuaku/purpose-planner-services:auth-latest
```

### 5. CI/CD Pipeline Health

**Ensure robust deployment pipeline**:
```yaml
# In Jenkinsfile
pipeline {
  stages {
    stage('Test') {
      steps {
        sh 'npm test'
        sh 'npm run lint'
      }
    }
    stage('Security Scan') {
      steps {
        sh 'docker scan $IMAGE_NAME'
      }
    }
    stage('Deploy') {
      steps {
        sh 'kubectl apply -f k8s-manifests/'
        sh 'kubectl rollout status deployment/auth-service'
      }
    }
    stage('Health Check') {
      steps {
        sh 'curl -f http://api.elitessystems.com/health'
      }
    }
  }
}
```

### 6. Documentation and Runbooks

**Maintain up-to-date documentation**:
- API documentation
- Deployment procedures
- Troubleshooting runbooks
- Architecture diagrams
- Contact information for escalation

## Emergency Procedures

### 1. Service Down Emergency

**Immediate Actions**:
```bash
# Check service status
kubectl get pods -l app=<service-name> -n development

# Restart service
kubectl rollout restart deployment/<service-name> -n development

# Scale up replicas
kubectl scale deployment/<service-name> --replicas=5 -n development

# Check logs for root cause
kubectl logs -f deployment/<service-name> -n development
```

### 2. Database Emergency

**MongoDB Issues**:
```bash
# Check MongoDB status
kubectl exec -it mongodb-0 -n development -- mongo --eval "db.adminCommand('ismaster')"

# Restart MongoDB (use with caution)
kubectl delete pod mongodb-0 -n development

# Restore from backup if needed
kubectl cp ./backup/mongodb mongodb-0:/tmp/restore -n development
kubectl exec -it mongodb-0 -n development -- mongorestore /tmp/restore
```

### 3. Complete System Outage

**Recovery Steps**:
```bash
# Check cluster status
kubectl cluster-info
kubectl get nodes

# Restart all services
kubectl rollout restart deployment --all -n development

# Check ingress controller
kubectl rollout restart deployment ingress-nginx-controller -n ingress-nginx

# Verify external access
curl -I https://api.elitessystems.com/health
```

### 4. Security Incident Response

**Immediate Actions**:
```bash
# Scale down affected services
kubectl scale deployment/<compromised-service> --replicas=0 -n development

# Check logs for suspicious activity
kubectl logs deployment/<service-name> -n development | grep -i "suspicious_pattern"

# Rotate secrets
kubectl delete secret app-secrets -n development
kubectl create secret generic app-secrets --from-literal=jwt-secret="$(openssl rand -base64 32)"

# Update and redeploy
kubectl rollout restart deployment --all -n development
```

### Emergency Contacts

- **Development Team**: dev-team@elitessystems.com
- **DevOps Team**: devops@elitessystems.com
- **On-call Engineer**: +1-XXX-XXX-XXXX
- **Escalation Manager**: manager@elitessystems.com

---

Remember: Always check logs first, verify resource usage, and test connectivity when troubleshooting. Most issues can be resolved by restarting services or checking configuration.