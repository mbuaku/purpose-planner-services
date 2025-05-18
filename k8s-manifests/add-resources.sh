#!/bin/bash

# Add resource limits and requests to all services

# Gateway service - gets more resources
cat >> services/gateway-service.yaml << 'EOF'
        resources:
          requests:
            cpu: "200m"
            memory: "256Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
EOF

# Auth service
services=("auth-service" "financial-service" "spiritual-service" "profile-service" "schedule-service" "dashboard-service")

for service in ${services[@]}; do
    # Add standard resources for all other services
    cat >> services/${service}.yaml << 'EOF'
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "250m"
            memory: "256Mi"
EOF
done

# MongoDB - needs more resources
cat >> infrastructure.yaml << 'EOF'
        resources:
          requests:
            cpu: "500m"
            memory: "1Gi"
          limits:
            cpu: "1000m"
            memory: "2Gi"
EOF

# Redis
cat >> infrastructure.yaml << 'EOF'
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "250m"
            memory: "256Mi"
EOF

echo "Resource limits and requests added to all services"