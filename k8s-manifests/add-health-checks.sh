#!/bin/bash

# Add health checks to all remaining services

services=("financial-service" "spiritual-service" "profile-service" "schedule-service" "dashboard-service")
ports=("3002" "3003" "3004" "3005" "3006")

for i in ${!services[@]}; do
    service=${services[$i]}
    port=${ports[$i]}
    file="services/${service}.yaml"
    
    echo "Adding health checks to $service..."
    
    # Find the last env var line and add health checks after it
    # This sed command adds the health checks after the last environment variable
    sed -i '/env:/,/^[[:space:]]*[^[:space:]]/{
        /^[[:space:]]*[^[:space:]]/!b
        /^[[:space:]]*[^[:space:]]/i\
        livenessProbe:\
          httpGet:\
            path: /health\
            port: '"$port"'\
          initialDelaySeconds: 30\
          periodSeconds: 10\
          timeoutSeconds: 5\
          failureThreshold: 3\
        readinessProbe:\
          httpGet:\
            path: /health\
            port: '"$port"'\
          initialDelaySeconds: 5\
          periodSeconds: 5\
          timeoutSeconds: 2\
          successThreshold: 1\
          failureThreshold: 3
    }' "$file"
done

echo "Health checks added to all services"