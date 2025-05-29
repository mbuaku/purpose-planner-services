#!/bin/bash

# Add resource limits and requests to gateway-service
sed -i '/readinessProbe:/,/failureThreshold: 3/a\
        resources:\
          requests:\
            cpu: "200m"\
            memory: "256Mi"\
          limits:\
            cpu: "500m"\
            memory: "512Mi"' services/gateway-service.yaml

# Add to other services
services=("auth-service" "financial-service" "spiritual-service" "profile-service" "schedule-service" "dashboard-service")

for service in ${services[@]}; do
    sed -i '/readinessProbe:/,/failureThreshold: 3/a\
        resources:\
          requests:\
            cpu: "100m"\
            memory: "128Mi"\
          limits:\
            cpu: "250m"\
            memory: "256Mi"' services/${service}.yaml
done

# Add to MongoDB in infrastructure.yaml
sed -i '/image: mongo:6/a\
        resources:\
          requests:\
            cpu: "500m"\
            memory: "1Gi"\
          limits:\
            cpu: "1000m"\
            memory: "2Gi"' infrastructure.yaml

# Add to Redis in infrastructure.yaml
sed -i '/image: redis:7-alpine/a\
        resources:\
          requests:\
            cpu: "100m"\
            memory: "128Mi"\
          limits:\
            cpu: "250m"\
            memory: "256Mi"' infrastructure.yaml

echo "Resource limits and requests added properly to all services"