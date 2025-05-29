#!/bin/bash

# Remove duplicate health checks and add them properly

services=("financial-service" "spiritual-service" "profile-service" "schedule-service" "dashboard-service")
ports=("3002" "3003" "3004" "3005" "3006")

for i in ${!services[@]}; do
    service=${services[$i]}
    port=${ports[$i]}
    file="services/${service}.yaml"
    
    echo "Fixing health checks in $service..."
    
    # Create a temporary file
    temp_file="temp_${service}.yaml"
    
    # Read the file and remove duplicate health checks
    awk '
    BEGIN { in_container = 0; health_added = 0; }
    /containers:/ { in_container = 1; }
    /livenessProbe:/ { 
        if (in_container && !health_added) {
            health_added = 1;
            print
        } else if (in_container && health_added) {
            # Skip duplicate health checks
            next
        }
    }
    /readinessProbe:/ {
        if (in_container && health_added == 1) {
            health_added = 2;
            print
        } else if (in_container && health_added == 2) {
            # Skip duplicate health checks
            next
        }
    }
    /env:/ {
        if (in_container && health_added == 0) {
            # Add health checks before env
            print "        livenessProbe:"
            print "          httpGet:"
            print "            path: /health"
            print "            port: '"$port"'"
            print "          initialDelaySeconds: 30"
            print "          periodSeconds: 10"
            print "          timeoutSeconds: 5"
            print "          failureThreshold: 3"
            print "        readinessProbe:"
            print "          httpGet:"
            print "            path: /health"
            print "            port: '"$port"'"
            print "          initialDelaySeconds: 5"
            print "          periodSeconds: 5"
            print "          timeoutSeconds: 2"
            print "          successThreshold: 1"
            print "          failureThreshold: 3"
            health_added = 2
        }
        print
    }
    !/livenessProbe:/ && !/readinessProbe:/ && !/httpGet:/ && !/path:/ && !/port:/ && !/initialDelaySeconds:/ && !/periodSeconds:/ && !/timeoutSeconds:/ && !/failureThreshold:/ && !/successThreshold:/ {
        if (!/env:/) print
    }
    ' "$file" > "$temp_file"
    
    # Replace the original file
    mv "$temp_file" "$file"
done

echo "Health checks fixed in all services"