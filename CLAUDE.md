# Purpose Planner Services - Project Guide

## 🏗️ Project Overview

Purpose Planner is a comprehensive life management platform for the Christian community, built with modern microservices architecture. The application helps users manage their spiritual growth, finances, schedules, and personal goals through a unified platform.

### Key Features
- **Spiritual Growth Tracking**: Bible reading, prayer sessions, journaling
- **Financial Management**: Budgets, expenses, income tracking, savings goals
- **Schedule Management**: Time-block scheduling with recurring events
- **Personal Dashboard**: Unified view with customizable widgets
- **Authentication**: JWT-based auth with Google OAuth integration
- **API Gateway**: Centralized routing with rate limiting and caching

## 🚀 Infrastructure as Code

The project implements modern Infrastructure as Code practices with automated provisioning:

### Automated Components
1. **Kubernetes Cluster** (v1.30.13)
   - 1 master node + 3 worker nodes
   - Calico CNI for networking
   - Automated via Vagrant provisioning

2. **Metrics Server**
   - Enables resource monitoring
   - Powers Horizontal Pod Autoscaler
   - Auto-installed during cluster setup

3. **NGINX Ingress Controller**
   - External traffic routing
   - SSL/TLS termination
   - Domain-based routing support

4. **Horizontal Pod Autoscaler (HPA)**
   - Development: 1-3 replicas (70% CPU threshold)
   - Production: 2-10 replicas (60% CPU threshold)
   - Memory and CPU-based scaling

### Domain Configuration
- **Frontend**: elitessystems.com
- **API Gateway**: api.elitessystems.com
- **SSL/TLS**: Automated via cert-manager with Let's Encrypt

## 🎯 Current Status

### ✅ Completed Infrastructure
- Kubernetes manifests for all 7 microservices
- Persistent storage for MongoDB (10Gi) and Redis (1Gi)
- ConfigMaps and Secrets management
- Health checks and readiness probes
- Resource limits and requests
- Jenkins CI/CD pipeline
- Namespace isolation with resource quotas
- Network policies and RBAC

### 📋 Pending Tasks
**Medium Priority:**
- Prometheus & Grafana monitoring setup
- ELK stack for log aggregation
- Database backup strategy

**Low Priority:**
- Deployment runbooks documentation

## 🛠️ Development Workflow

### Local Development
```bash
# Clone and setup
git clone git@github.com:mbuaku/purpose-planner.git
cd purpose-planner-services
npm install

# Start with Docker Compose
docker-compose up -d

# Access at http://localhost:3000
```

### Testing & Quality
```bash
# Run all tests
npm test

# Lint code
npm run lint

# Type checking
npm run typecheck
```

## 🚢 Deployment Guide

### Quick Kubernetes Deployment
```bash
# 1. Create namespaces
kubectl apply -f k8s-manifests/namespaces.yaml

# 2. Deploy infrastructure
kubectl apply -f k8s-manifests/storage.yaml
kubectl apply -f k8s-manifests/infrastructure.yaml

# 3. Create secrets
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret="your-secret-key" \
  --from-literal=mongodb-uri="mongodb://admin:password123@mongodb:27017/purpose-planner?authSource=admin" \
  -n development

# 4. Deploy services
kubectl apply -f k8s-manifests/services/

# 5. Setup ingress and TLS
kubectl apply -f k8s-manifests/ingress-elitessystems.yaml
kubectl apply -f k8s-manifests/tls-config.yaml

# 6. Enable auto-scaling
kubectl apply -f k8s-manifests/hpa.yaml
```

### Verification Commands
```bash
kubectl get pods -n development        # Check pods
kubectl get hpa -n development         # Verify auto-scaling
kubectl get ingress -n development     # Check routing
kubectl get certificates -n development # Verify SSL
kubectl top pods -n development        # Monitor resources
```

## 📊 Service Architecture

| Service | Port | Internal Port | Description |
|---------|------|---------------|-------------|
| Gateway | 30000 | 3000 | API Gateway - Main entry point |
| Auth | - | 3001 | Authentication & Authorization |
| Financial | - | 3002 | Budget & Expense Management |
| Spiritual | - | 3003 | Prayer & Bible Study Tracking |
| Profile | - | 3004 | User Profile Management |
| Schedule | - | 3005 | Calendar & Event Management |
| Dashboard | - | 3006 | Unified Dashboard & Widgets |

### Infrastructure Services
- **MongoDB**: Primary database with persistent storage
- **Redis**: Caching and session management
- **NGINX**: Ingress controller for routing
- **cert-manager**: SSL/TLS certificate automation

## 🔐 Security Features
- JWT-based authentication across all services
- Google OAuth integration
- Rate limiting at API Gateway
- CORS configuration
- Network policies for pod isolation
- Kubernetes secrets for sensitive data
- RBAC for cluster access control

## 🔧 CI/CD Pipeline

Jenkins automates the complete deployment lifecycle:
1. Code checkout from GitHub
2. Dependency installation
3. Unit and integration testing
4. Docker image building
5. Push to DockerHub registry
6. Kubernetes deployment
7. Health check verification

### Docker Images
All images follow the naming convention:
```
mbuaku/purpose-planner-services:service-name-latest
```

## 📝 Important Notes

### Environment Variables
Each service requires:
- `PORT`: Service port number
- `MONGODB_URI`: Database connection string
- `JWT_SECRET`: Token signing key
- `REDIS_URL`: Cache connection
- `GOOGLE_CLIENT_ID`: OAuth client ID
- `GOOGLE_CLIENT_SECRET`: OAuth secret

### Development Tips
- Development namespace includes in-memory fallback for MongoDB
- All services expose `/health` endpoints
- Use `kubectl logs` for debugging
- Check events with `kubectl get events --sort-by='.lastTimestamp'`

### Production Considerations
- Enable monitoring before going live
- Configure backup strategies
- Set up alerting rules
- Review resource limits
- Test auto-scaling under load
- Verify SSL certificates

## 📋 Quick Reference Commands

### Local Testing
```bash
# Run all tests
npm test

# Lint and typecheck
npm run lint
npm run typecheck
```

### Troubleshooting
```bash
# Check pod logs
kubectl logs <pod-name> -n development

# Describe pod for issues
kubectl describe pod <pod-name> -n development

# Check events
kubectl get events -n development --sort-by='.lastTimestamp'

# Test service connectivity
kubectl exec -it <pod-name> -n development -- curl http://<service-name>:<port>/health

# Port forward for debugging
kubectl port-forward svc/gateway-service 3000:3000 -n development
```

### Monitoring
```bash
# Resource usage
kubectl top nodes
kubectl top pods -n development

# Check HPA status
kubectl get hpa -n development -w

# View ingress logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

## 🌐 Access Points

- **Local Development**: http://localhost:3000
- **Kubernetes NodePort**: http://<node-ip>:30000
- **Production Frontend**: https://elitessystems.com
- **Production API**: https://api.elitessystems.com
- **API Documentation**: https://api.elitessystems.com/api-docs

## 📁 Repository Structure

```
purpose-planner-services/
├── */               # Microservices (auth, financial, spiritual, etc.)
├── k8s-manifests/   # Kubernetes deployment configurations
├── scripts/         # Utility and deployment scripts
├── docs/            # Consolidated documentation
├── api-docs/        # API documentation
└── jenkins/         # CI/CD pipeline configurations
```

## 🆘 Common Issues & Solutions

1. **Pods not starting**: Check resource limits and node capacity
2. **MongoDB connection issues**: Verify PVC is bound and credentials are correct
3. **Ingress not working**: Ensure NGINX controller is running and DNS is configured
4. **HPA not scaling**: Verify Metrics Server is installed and running
5. **Authentication failures**: Check JWT secret and service URLs

## 📞 Support

For issues or questions:
- Check the [Troubleshooting Guide](./docs/TROUBLESHOOTING.md)
- Review [Architecture Documentation](./docs/ARCHITECTURE.md)
- Consult [Setup Guides](./docs/SETUP-GUIDES.md)

Remember: Always test in development before deploying to production!