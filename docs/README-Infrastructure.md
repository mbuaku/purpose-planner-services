# Purpose Planner Infrastructure as Code

This directory contains the Kubernetes manifests and infrastructure setup for the Purpose Planner application.

## Infrastructure Components

### Automated Installation (via Vagrant)
The following components are automatically installed when you run `vagrant up`:

1. **Kubernetes Cluster** (v1.30.13)
   - 1 Master node (k8s-master)
   - 3 Worker nodes (k8s-worker1, k8s-worker2, k8s-worker3)
   - Calico CNI networking

2. **Metrics Server**
   - Enables `kubectl top` commands
   - Required for Horizontal Pod Autoscaler (HPA)
   - Configured with `--kubelet-insecure-tls` for lab environment

3. **NGINX Ingress Controller**
   - Provides external access to services
   - Supports SSL termination
   - Routes traffic based on hostnames

### Application Components

4. **Microservices Architecture**
   - Auth Service (authentication/authorization)
   - Gateway Service (API gateway/proxy)
   - Dashboard Service (user dashboard)
   - Financial Service (budget/expenses)
   - Profile Service (user profiles)
   - Schedule Service (calendar/events)
   - Spiritual Service (prayers/journal)

5. **Data Layer**
   - MongoDB (document database)
   - Redis (caching/sessions)

6. **Horizontal Pod Autoscaler (HPA)**
   - Auto-scales services based on CPU usage
   - Configured thresholds: 70-80% CPU
   - Min/max replica ranges per service

## File Structure

```
k8s-manifests/
├── infrastructure/
│   ├── ingress-controller/
│   │   └── nginx-ingress-controller.yaml
│   └── metrics-server/
│       └── metrics-server.yaml
├── services/
│   ├── auth-service.yaml
│   ├── gateway-service.yaml
│   ├── dashboard-service.yaml
│   ├── financial-service.yaml
│   ├── profile-service.yaml
│   ├── schedule-service.yaml
│   └── spiritual-service.yaml
├── infrastructure.yaml          # MongoDB, Redis
├── hpa.yaml                    # Horizontal Pod Autoscaler configs
├── ingress-production.yaml     # Production ingress routing
├── monitoring.yaml             # Prometheus/Grafana
└── namespaces.yaml            # Kubernetes namespaces
```

## Deployment

### Automated (Recommended)
```bash
cd vagrant-labs/my-lab/k8s-cluster
vagrant up
```

### Manual Deployment
If you need to deploy manually:

```bash
# 1. Install infrastructure components
kubectl apply -f infrastructure/

# 2. Create namespaces
kubectl apply -f namespaces.yaml

# 3. Deploy data layer
kubectl apply -f infrastructure.yaml

# 4. Deploy microservices
kubectl apply -f services/

# 5. Configure ingress
kubectl apply -f ingress-production.yaml

# 6. Setup HPA
kubectl apply -f hpa.yaml
```

## Access

- **Frontend:** https://elitessystems.com (via cloudflare tunnel)
- **API:** https://api.elitessystems.com (via cloudflare tunnel)
- **Direct Access:** http://192.168.100.10:31989 (ingress controller)

## Monitoring

```bash
# Check cluster resources
kubectl top nodes
kubectl top pods --all-namespaces

# Check HPA status
kubectl get hpa -n development

# Check ingress
kubectl get ingress -n development
```

## Scaling

The application automatically scales based on CPU usage:
- Most services: 1-3 replicas (70% CPU threshold)
- Frontend: 2-6 replicas (80% CPU threshold)  
- Gateway: 2-8 replicas (75% CPU threshold)

## Infrastructure Updates

To update infrastructure components:

1. **Update Vagrant script:** `vagrant-labs/my-lab/common/scripts/setup-k8s.sh`
2. **Update manifests:** This directory
3. **Recreate cluster:** `vagrant destroy && vagrant up`

## Security Notes

- TLS certificates managed by cloudflare
- Services use ClusterIP (internal only)
- External access only through ingress controller
- Authentication required for all API endpoints