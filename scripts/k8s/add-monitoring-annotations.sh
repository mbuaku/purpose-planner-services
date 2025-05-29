#!/bin/bash

# Add monitoring annotations to all services

services=("gateway-service" "auth-service" "financial-service" "spiritual-service" "profile-service" "schedule-service" "dashboard-service")

for service in ${services[@]}; do
    echo "Adding monitoring annotations to $service..."
    
    # Add annotations to the service
    sed -i '/metadata:/,/spec:/{
        /name: '"$service"'$/a\
  labels:\
    monitoring: "true"\
  annotations:\
    prometheus.io/scrape: "true"\
    prometheus.io/port: "metrics"\
    prometheus.io/path: "/metrics"
    }' services/${service}.yaml
    
    # Add metrics port to deployment
    port=$(grep -A1 "containerPort:" services/${service}.yaml | grep -oE '[0-9]+' | head -1)
    
    sed -i '/ports:/,/env:/{
        /containerPort: '"$port"'$/a\
        - name: metrics\
          containerPort: 9090
    }' services/${service}.yaml
done

echo "Monitoring annotations added to all services"