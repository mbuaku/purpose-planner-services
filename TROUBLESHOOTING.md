# Purpose Planner Services - Troubleshooting Guide

This guide provides comprehensive troubleshooting information for the Purpose Planner microservices application. It consolidates solutions from known issues and provides guidance for common problems.

## Table of Contents

1. [Authentication and API Problems](#authentication-and-api-problems)
2. [Ingress and Networking Issues](#ingress-and-networking-issues)
3. [Database Connectivity Problems](#database-connectivity-problems)
4. [Performance Issues](#performance-issues)
5. [Service Communication Issues](#service-communication-issues)
6. [Kubernetes Deployment Issues](#kubernetes-deployment-issues)
7. [Debugging Commands and Techniques](#debugging-commands-and-techniques)
8. [Prevention Strategies](#prevention-strategies)

## Authentication and API Problems

### Issue: Endpoint Not Found Errors for Auth Routes

**Symptoms:**
- Frontend shows "Endpoint not found" errors when accessing authentication URLs
- URLs like `https://api.elitessystems.com/api/api/auth/login` return 404
- Duplicate `/api` segments in API URLs

**Root Causes:**
1. Incorrect path rewriting in gateway service
2. Frontend API configuration with duplicate path segments
3. Namespace mismatch between ingress and services

**Solutions:**

#### Fix 1: Gateway Service Path Rewriting
```bash
# Check current gateway service routing configuration
kubectl logs -n development deployment/gateway-service

# Update gateway-service/src/routes/auth.routes.js
# Change: '^/api/auth': '/api/auth'
# To: '^/auth': '/api/auth'

# Rebuild and redeploy gateway service
cd gateway-service
docker build -t mbuaku/purpose-planner-services:gateway-service-latest .
docker push mbuaku/purpose-planner-services:gateway-service-latest
kubectl rollout restart deployment gateway-service -n development
```

#### Fix 2: Frontend API Configuration
Check these common frontend files for incorrect API URLs:

```javascript
// Files to check:
// - src/config/api.js
// - src/services/api.js
// - .env or .env.production

// Incorrect configuration:
const API_BASE_URL = 'https://api.elitessystems.com/api/api';

// Correct configuration:
const API_BASE_URL = 'https://api.elitessystems.com/api';
```

#### Fix 3: Axios Configuration
```javascript
// Incorrect Axios setup:
const api = axios.create({
  baseURL: 'https://api.elitessystems.com/api/api'
});

// Correct Axios setup:
const api = axios.create({
  baseURL: 'https://api.elitessystems.com/api'
});
```

### Issue: JWT Token Validation Failures

**Symptoms:**
- 401 Unauthorized errors on protected routes
- Token expired messages
- Authentication middleware rejecting valid tokens

**Debugging Steps:**
```bash
# Check auth service logs
kubectl logs -n development deployment/auth-service

# Verify JWT secret consistency across services
kubectl get secret app-secrets -n development -o yaml

# Test token validation endpoint
curl -H "Authorization: Bearer <token>" https://api.elitessystems.com/api/auth/verify
```

**Solutions:**
1. Ensure all services use the same JWT secret
2. Check token expiration times
3. Verify middleware configuration in each service

### Issue: Google OAuth Not Working

**Symptoms:**
- "Google authentication not configured" message
- OAuth callback failures
- Missing Google client credentials

**Solutions:**
```bash
# Check if Google OAuth credentials are configured
kubectl get secret app-secrets -n development -o jsonpath='{.data.google-client-id}' | base64 -d

# Update secrets with Google OAuth credentials
kubectl create secret generic app-secrets \
  --from-literal=google-client-id="your-client-id" \
  --from-literal=google-client-secret="your-client-secret" \
  --dry-run=client -o yaml | kubectl apply -f -
```

## Ingress and Networking Issues

### Issue: Ingress Namespace Mismatch

**Symptoms:**
- Services accessible via NodePort but not through ingress
- DNS resolution failures for service names
- 502 Bad Gateway errors

**Solution:**
```bash
# Check current ingress configuration
kubectl get ingress -A

# Ensure ingress is in the same namespace as services
kubectl get services -n development
kubectl get ingress -n development

# Apply correct ingress configuration
kubectl apply -f k8s-manifests/ingress-elitessystems-fix.yaml
```

### Issue: SSL/TLS Certificate Problems

**Symptoms:**
- Browser security warnings
- Certificate not found errors
- HTTPS redirects failing

**Debugging:**
```bash
# Check certificate status
kubectl get certificates -A
kubectl describe certificate api-tls -n development

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager

# Force certificate renewal
kubectl delete certificate api-tls -n development
kubectl apply -f k8s-manifests/tls-config.yaml
```

### Issue: Load Balancer Not Responding

**Symptoms:**
- External IP showing as `<pending>`
- No response from load balancer IP
- Connection timeouts

**Solutions:**
```bash
# Check load balancer status
kubectl get svc -n development

# For cloud providers, check node security groups
# For local development, use NodePort instead
kubectl patch svc gateway-service -p '{"spec":{"type":"NodePort"}}'

# Check if NGINX ingress controller is running
kubectl get pods -n ingress-nginx
```

## Database Connectivity Problems

### Issue: MongoDB Connection Failures

**Symptoms:**
- Services can't connect to MongoDB
- "Connection refused" errors
- Database authentication failures

**Debugging:**
```bash
# Check MongoDB pod status
kubectl get pods -n development | grep mongodb
kubectl logs -n development deployment/mongodb

# Test database connectivity from a service pod
kubectl exec -it deployment/auth-service -n development -- \
  curl mongodb:27017

# Check MongoDB authentication
kubectl exec -it deployment/mongodb -n development -- \
  mongo --eval "db.adminCommand('ismaster')"
```

**Solutions:**
1. Verify MongoDB credentials in secrets
2. Check persistent volume claims
3. Ensure MongoDB service is accessible

### Issue: Redis Connection Problems

**Symptoms:**
- Session storage not working
- Cache misses
- Redis connection timeouts

**Debugging:**
```bash
# Check Redis pod and service
kubectl get pods,svc -n development | grep redis
kubectl logs -n development deployment/redis

# Test Redis connectivity
kubectl exec -it deployment/redis -n development -- redis-cli ping
```

### Issue: Persistent Volume Issues

**Symptoms:**
- Data loss after pod restarts
- PVC stuck in pending state
- Storage capacity errors

**Solutions:**
```bash
# Check PV and PVC status
kubectl get pv,pvc -n development

# Check storage class
kubectl get storageclass

# Recreate persistent volumes if needed
kubectl delete pvc mongodb-pvc redis-pvc -n development
kubectl apply -f k8s-manifests/storage.yaml
```

## Performance Issues

### Issue: High Memory Usage

**Symptoms:**
- Pods being killed due to OOMKilled
- High memory usage in monitoring
- Application slowness

**Debugging:**
```bash
# Check resource usage
kubectl top pods -n development
kubectl describe pod <pod-name> -n development

# Check resource limits
kubectl get deployment -n development -o yaml | grep -A 5 resources
```

**Solutions:**
1. Increase memory limits in deployment manifests
2. Optimize application memory usage
3. Enable horizontal pod autoscaling

### Issue: CPU Throttling

**Symptoms:**
- Slow response times
- High CPU usage alerts
- Request timeouts

**Solutions:**
```bash
# Check CPU usage and limits
kubectl top pods -n development
kubectl describe hpa -n development

# Scale up pods manually if needed
kubectl scale deployment gateway-service --replicas=3 -n development
```

### Issue: Database Performance Problems

**Symptoms:**
- Slow database queries
- Connection pool exhaustion
- Timeout errors

**Solutions:**
1. Add database indexes
2. Optimize queries
3. Increase connection pool size
4. Scale MongoDB with replica sets

## Service Communication Issues

### Issue: Service Discovery Problems

**Symptoms:**
- Services can't reach each other
- DNS resolution failures
- Connection refused errors between services

**Debugging:**
```bash
# Test service discovery
kubectl exec -it deployment/gateway-service -n development -- \
  nslookup auth-service

# Check service endpoints
kubectl get endpoints -n development

# Test connectivity between services
kubectl exec -it deployment/gateway-service -n development -- \
  curl http://auth-service:3001/health
```

### Issue: Network Policies Blocking Traffic

**Symptoms:**
- Intermittent connection failures
- Services can't communicate despite correct configuration

**Solutions:**
```bash
# Check network policies
kubectl get networkpolicy -n development

# Temporarily disable network policies for testing
kubectl delete networkpolicy --all -n development
```

## Kubernetes Deployment Issues

### Issue: Image Pull Errors

**Symptoms:**
- Pods stuck in `ImagePullBackOff` state
- "Image not found" errors
- Authentication failures to registry

**Solutions:**
```bash
# Check pod events
kubectl describe pod <pod-name> -n development

# Verify image exists
docker pull mbuaku/purpose-planner-services:auth-service-latest

# Check image pull secrets
kubectl get secrets -n development
```

### Issue: Pod Scheduling Failures

**Symptoms:**
- Pods stuck in `Pending` state
- Insufficient resources errors
- Node selector conflicts

**Solutions:**
```bash
# Check pod events and node capacity
kubectl describe pod <pod-name> -n development
kubectl describe nodes

# Check resource quotas
kubectl describe resourcequota -n development
```

### Issue: Health Check Failures

**Symptoms:**
- Pods restarting frequently
- Readiness probe failures
- Services marked as unhealthy

**Debugging:**
```bash
# Check pod logs for health check endpoints
kubectl logs <pod-name> -n development

# Test health endpoints manually
kubectl exec -it <pod-name> -n development -- curl localhost:3001/health

# Check probe configuration
kubectl describe deployment <service-name> -n development
```

## Debugging Commands and Techniques

### Essential Kubernetes Commands

```bash
# Check overall cluster health
kubectl get nodes
kubectl get pods -A
kubectl top nodes

# Debug specific service
kubectl get all -n development
kubectl describe deployment <service-name> -n development
kubectl logs -f deployment/<service-name> -n development

# Debug networking
kubectl get svc,endpoints,ingress -n development
kubectl describe ingress <ingress-name> -n development

# Debug storage
kubectl get pv,pvc -n development
kubectl describe pvc <pvc-name> -n development

# Debug autoscaling
kubectl get hpa -n development
kubectl describe hpa <hpa-name> -n development
```

### Service-Specific Debugging

```bash
# Gateway Service (Entry point)
kubectl logs -f deployment/gateway-service -n development
kubectl exec -it deployment/gateway-service -n development -- ps aux

# Auth Service
kubectl logs -f deployment/auth-service -n development
curl -X POST https://api.elitessystems.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Database Services
kubectl exec -it deployment/mongodb -n development -- mongo
kubectl exec -it deployment/redis -n development -- redis-cli
```

### Log Analysis

```bash
# Search for specific errors
kubectl logs deployment/gateway-service -n development | grep -i error

# Follow logs with timestamps
kubectl logs -f --timestamps deployment/auth-service -n development

# Get logs from previous container (if crashed)
kubectl logs deployment/auth-service -n development --previous
```

### Network Debugging

```bash
# Test external connectivity
kubectl run debug --image=busybox --rm -it -- /bin/sh
# Inside the debug pod:
nslookup api.elitessystems.com
wget -qO- http://gateway-service:3000/health

# Check DNS resolution
kubectl exec -it deployment/gateway-service -n development -- \
  nslookup auth-service.development.svc.cluster.local
```

## Prevention Strategies

### 1. Monitoring and Alerting

```bash
# Set up resource monitoring
kubectl apply -f k8s-manifests/monitoring.yaml

# Check metrics server
kubectl top pods -n development
kubectl top nodes
```

### 2. Health Checks and Probes

Ensure all services have proper health endpoints:
```javascript
// Example health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### 3. Proper Resource Management

```yaml
# Example resource configuration
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "250m"
```

### 4. Configuration Management

```bash
# Use ConfigMaps for non-sensitive configuration
kubectl create configmap app-config \
  --from-literal=node-env=production \
  --from-literal=log-level=info

# Use Secrets for sensitive data
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret="secure-random-string" \
  --from-literal=mongodb-uri="mongodb://..."
```

### 5. Backup and Recovery

```bash
# Regular database backups
kubectl create cronjob mongodb-backup \
  --image=mongo:4.4 \
  --schedule="0 2 * * *" \
  -- mongodump --host mongodb --out /backup

# Test disaster recovery procedures regularly
```

### 6. Security Best Practices

```bash
# Use network policies to restrict traffic
kubectl apply -f k8s-manifests/network-policies.yaml

# Regularly update base images
docker pull node:18-alpine
docker pull mongo:4.4
docker pull redis:alpine

# Scan images for vulnerabilities
docker scout cves mbuaku/purpose-planner-services:gateway-service-latest
```

### 7. CI/CD Pipeline Health

```bash
# Regular pipeline testing
npm test
npm run lint

# Automated deployment validation
kubectl rollout status deployment/gateway-service -n development
kubectl get pods -n development | grep -v Running && echo "Some pods not running"
```

### 8. Documentation and Runbooks

- Keep this troubleshooting guide updated with new issues
- Document all manual procedures
- Create runbooks for common operations
- Maintain an incident response plan

---

## Quick Reference

### Service Ports
- Gateway Service: 3000 (NodePort: 30000)
- Auth Service: 3001
- Financial Service: 3002
- Spiritual Service: 3003
- Profile Service: 4004
- Schedule Service: 3005
- Dashboard Service: 3006

### Key URLs
- Frontend: https://elitessystems.com
- API Gateway: https://api.elitessystems.com
- Health Check: https://api.elitessystems.com/health

### Emergency Contacts
- Infrastructure Team: [Add contact information]
- On-call Engineer: [Add contact information]
- Escalation Path: [Define escalation procedures]

---

*Last updated: [Current Date]*
*For additional support, consult the development team or create an issue in the project repository.*