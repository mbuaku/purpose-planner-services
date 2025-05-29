#!/bin/bash

# Create properly formatted manifests with resources

# Create a template function
create_service_manifest() {
    local service_name=$1
    local port=$2
    local image_tag=$3
    local extra_env=$4
    
    cat > services/${service_name}.yaml << EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${service_name}
  namespace: development
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${service_name}
  template:
    metadata:
      labels:
        app: ${service_name}
    spec:
      containers:
      - name: ${service_name}
        image: mbuaku/purpose-planner-services:${image_tag}
        ports:
        - containerPort: ${port}
        env:
        - name: PORT
          value: "${port}"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret${extra_env}
        livenessProbe:
          httpGet:
            path: /health
            port: ${port}
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: ${port}
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 2
          successThreshold: 1
          failureThreshold: 3
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "250m"
            memory: "256Mi"
---
apiVersion: v1
kind: Service
metadata:
  name: ${service_name}
  namespace: development
spec:
  selector:
    app: ${service_name}
  ports:
  - port: ${port}
    targetPort: ${port}
  type: ClusterIP
EOF
}

# Create auth-service
create_service_manifest "auth-service" "3001" "auth-service-latest" ""

# Create financial-service
create_service_manifest "financial-service" "3002" "financial-service-latest" ""

# Create spiritual-service
create_service_manifest "spiritual-service" "3003" "spiritual-service-latest" ""

# Create profile-service
create_service_manifest "profile-service" "3004" "profile-service-latest" ""

# Create schedule-service
create_service_manifest "schedule-service" "3005" "schedule-service-latest" ""

# Create dashboard-service with extra env vars
dashboard_extra_env='
        - name: FINANCIAL_SERVICE_URL
          value: "http://financial-service:3002"
        - name: SPIRITUAL_SERVICE_URL
          value: "http://spiritual-service:3003"
        - name: SCHEDULE_SERVICE_URL
          value: "http://schedule-service:3005"'

create_service_manifest "dashboard-service" "3006" "dashboard-service-latest" "$dashboard_extra_env"

# Create gateway-service with more resources
cat > services/gateway-service.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gateway-service
  namespace: development
spec:
  replicas: 2
  selector:
    matchLabels:
      app: gateway-service
  template:
    metadata:
      labels:
        app: gateway-service
    spec:
      containers:
      - name: gateway-service
        image: mbuaku/purpose-planner-services:gateway-service-latest
        ports:
        - containerPort: 3000
        env:
        - name: PORT
          value: "3000"
        - name: AUTH_SERVICE_URL
          value: "http://auth-service:3001"
        - name: FINANCIAL_SERVICE_URL
          value: "http://financial-service:3002"
        - name: SPIRITUAL_SERVICE_URL
          value: "http://spiritual-service:3003"
        - name: PROFILE_SERVICE_URL
          value: "http://profile-service:3004"
        - name: SCHEDULE_SERVICE_URL
          value: "http://schedule-service:3005"
        - name: DASHBOARD_SERVICE_URL
          value: "http://dashboard-service:3006"
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        - name: REDIS_HOST
          value: redis
        - name: REDIS_PORT
          value: "6379"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 2
          successThreshold: 1
          failureThreshold: 3
        resources:
          requests:
            cpu: "200m"
            memory: "256Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
---
apiVersion: v1
kind: Service
metadata:
  name: gateway-service
  namespace: development
spec:
  selector:
    app: gateway-service
  ports:
  - port: 3000
    targetPort: 3000
    nodePort: 30000
  type: NodePort
EOF

echo "All service manifests created with resources"