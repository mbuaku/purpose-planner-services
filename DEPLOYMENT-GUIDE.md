# Purpose Planner Services - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Deployment Steps](#detailed-deployment-steps)
4. [Service Architecture](#service-architecture)
5. [Monitoring and Logging](#monitoring-and-logging)
6. [Backup and Recovery](#backup-and-recovery)
7. [Troubleshooting](#troubleshooting)
8. [Production Deployment](#production-deployment)

## Prerequisites

- Kubernetes cluster (1.24+)
- kubectl configured
- Helm 3 (for cert-manager)
- Docker Hub access
- Domain names configured

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/purpose-planner-services.git
cd purpose-planner-services

# Create namespaces
kubectl apply -f k8s-manifests/namespaces.yaml

# Apply all manifests
kubectl apply -f k8s-manifests/storage.yaml
kubectl apply -f k8s-manifests/infrastructure.yaml
kubectl apply -f k8s-manifests/services/
kubectl apply -f k8s-manifests/ingress.yaml
kubectl apply -f k8s-manifests/hpa.yaml
kubectl apply -f k8s-manifests/monitoring.yaml
kubectl apply -f k8s-manifests/logging.yaml
kubectl apply -f k8s-manifests/backup.yaml

# Create secrets
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret="your-secret-key" \
  --from-literal=mongodb-uri="mongodb://admin:password123@mongodb:27017/purpose-planner?authSource=admin" \
  -n development

# Verify deployment
kubectl get pods -n development
kubectl get svc -n development
```

## Detailed Deployment Steps

### 1. Install Cert-Manager (for TLS)

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Wait for cert-manager to be ready
kubectl wait --for=condition=ready pod -l app.kubernetes.io/instance=cert-manager -n cert-manager

# Apply TLS configuration
kubectl apply -f k8s-manifests/tls-config.yaml
```

### 2. Deploy Infrastructure Services

```bash
# Create storage
kubectl apply -f k8s-manifests/storage.yaml

# Deploy MongoDB and Redis
kubectl apply -f k8s-manifests/infrastructure.yaml

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=mongodb -n development
kubectl wait --for=condition=ready pod -l app=redis -n development
```

### 3. Deploy Microservices

```bash
# Deploy all services
kubectl apply -f k8s-manifests/services/

# Check deployment status
kubectl rollout status deployment/gateway-service -n development
kubectl rollout status deployment/auth-service -n development
kubectl rollout status deployment/financial-service -n development
kubectl rollout status deployment/spiritual-service -n development
kubectl rollout status deployment/profile-service -n development
kubectl rollout status deployment/schedule-service -n development
kubectl rollout status deployment/dashboard-service -n development
```

### 4. Configure Ingress and HPA

```bash
# Apply Ingress rules
kubectl apply -f k8s-manifests/ingress.yaml

# Apply Horizontal Pod Autoscaling
kubectl apply -f k8s-manifests/hpa.yaml

# Check HPA status
kubectl get hpa -n development
```

### 5. Set Up Monitoring

```bash
# Deploy Prometheus and Grafana
kubectl apply -f k8s-manifests/monitoring.yaml

# Access Grafana (default: admin/admin123)
kubectl port-forward -n monitoring svc/grafana 3000:3000

# Access Prometheus
kubectl port-forward -n monitoring svc/prometheus 9090:9090
```

### 6. Set Up Logging

```bash
# Deploy ELK Stack
kubectl apply -f k8s-manifests/logging.yaml

# Access Kibana
kubectl port-forward -n logging svc/kibana 5601:5601
```

## Service Architecture

| Service | Port | Description |
|---------|------|-------------|
| gateway-service | 3000 | API Gateway (NodePort: 30000) |
| auth-service | 3001 | Authentication & Authorization |
| financial-service | 3002 | Budget & Expense Management |
| spiritual-service | 3003 | Prayer & Bible Study |
| profile-service | 3004 | User Profile Management |
| schedule-service | 3005 | Calendar & Events |
| dashboard-service | 3006 | Unified Dashboard |
| mongodb | 27017 | Primary Database |
| redis | 6379 | Cache & Session Store |

## Monitoring and Logging

### Grafana Dashboards

1. Import Kubernetes dashboards:
   - Kubernetes Cluster Monitoring (ID: 8588)
   - Kubernetes Deployment Statefulset Daemonset (ID: 8589)

2. Create custom dashboards for:
   - API request rates
   - Response times
   - Error rates
   - Service health

### Prometheus Alerts

Create alerts for:
- High CPU/Memory usage
- Pod restarts
- Service unavailability
- Database connection issues

### Kibana Index Patterns

1. Create index pattern: `logs-*`
2. Set timestamp field: `@timestamp`
3. Create visualizations for:
   - Error logs
   - Request logs
   - Service logs

## Backup and Recovery

### Automated Backups

Backups run automatically:
- MongoDB: Daily at 2 AM
- Redis: Daily at 3 AM
- Retention: 7 days

### Manual Backup

```bash
# MongoDB backup
kubectl create job --from=cronjob/mongodb-backup mongodb-backup-manual -n development

# Redis backup
kubectl create job --from=cronjob/redis-backup redis-backup-manual -n development
```

### Restore from Backup

```bash
# MongoDB restore
kubectl exec -it deployment/mongodb -n development -- mongorestore \
  --host localhost:27017 \
  --username admin \
  --password password123 \
  --authenticationDatabase admin \
  --db purpose-planner \
  --drop \
  /backup/mongodb-backup-YYYYMMDD_HHMMSS

# Redis restore
kubectl exec -it deployment/redis -n development -- sh -c \
  'redis-cli SHUTDOWN NOSAVE && cp /backup/redis-backup-YYYYMMDD_HHMMSS.rdb /data/dump.rdb'
```

## Troubleshooting

### Common Issues

1. **Pods not starting**
   ```bash
   kubectl describe pod <pod-name> -n development
   kubectl logs <pod-name> -n development
   ```

2. **Service connectivity issues**
   ```bash
   kubectl exec -it <pod-name> -n development -- nslookup <service-name>
   kubectl exec -it <pod-name> -n development -- curl http://<service-name>:<port>/health
   ```

3. **Database connection issues**
   ```bash
   kubectl exec -it deployment/mongodb -n development -- mongo --eval "db.adminCommand('ping')"
   kubectl exec -it deployment/redis -n development -- redis-cli ping
   ```

4. **Ingress not working**
   ```bash
   kubectl get ingress -n development
   kubectl describe ingress api-gateway-ingress -n development
   ```

### Debug Commands

```bash
# Check resource usage
kubectl top nodes
kubectl top pods -n development

# Check events
kubectl get events -n development --sort-by='.lastTimestamp'

# Check HPA status
kubectl describe hpa -n development

# Check PVC status
kubectl get pvc -n development
```

## Production Deployment

### Pre-Production Checklist

- [ ] Update secrets with production values
- [ ] Configure production domains
- [ ] Set up production SSL certificates
- [ ] Configure backup retention policies
- [ ] Set up monitoring alerts
- [ ] Configure log retention
- [ ] Review resource limits
- [ ] Test disaster recovery procedures

### Production-Specific Configuration

1. **Namespaces**
   ```bash
   kubectl apply -f k8s-manifests/namespaces.yaml
   ```

2. **TLS Certificates**
   - Update email in cert-manager
   - Use production Let's Encrypt issuer

3. **Resource Limits**
   - Increase limits for production workloads
   - Adjust HPA thresholds

4. **Monitoring**
   - Set up PagerDuty/AlertManager
   - Configure SLOs and SLIs

5. **Security**
   - Enable network policies
   - Configure RBAC
   - Scan images for vulnerabilities

### Deployment Pipeline

The Jenkins pipeline handles:
1. Code checkout
2. Dependency installation
3. Testing
4. Docker image building
5. Image pushing to registry
6. Kubernetes deployment
7. Deployment verification

## Maintenance

### Rolling Updates

```bash
# Update a service
kubectl set image deployment/auth-service auth-service=mbuaku/purpose-planner-services:auth-service-v2.0 -n development

# Check rollout status
kubectl rollout status deployment/auth-service -n development

# Rollback if needed
kubectl rollout undo deployment/auth-service -n development
```

### Scaling

```bash
# Manual scaling
kubectl scale deployment/gateway-service --replicas=5 -n development

# Check HPA metrics
kubectl get hpa gateway-service-hpa -n development
```

### Database Maintenance

```bash
# MongoDB maintenance
kubectl exec -it deployment/mongodb -n development -- mongo admin -u admin -p password123 --eval "db.runCommand({compact:'collection_name'})"

# Redis maintenance
kubectl exec -it deployment/redis -n development -- redis-cli BGREWRITEAOF
```

## Support

For issues or questions:
1. Check logs in Kibana
2. Review metrics in Grafana
3. Check Jenkins build logs
4. Create GitHub issue with:
   - Error messages
   - Steps to reproduce
   - Environment details