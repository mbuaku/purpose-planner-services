#!/bin/bash

# This script will manually fix each service file with proper health checks

# Fix spiritual-service
cat > services/spiritual-service.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spiritual-service
  namespace: development
spec:
  replicas: 1
  selector:
    matchLabels:
      app: spiritual-service
  template:
    metadata:
      labels:
        app: spiritual-service
    spec:
      containers:
      - name: spiritual-service
        image: mbuaku/purpose-planner-services/spiritual-service:latest
        ports:
        - containerPort: 3003
        env:
        - name: PORT
          value: "3003"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        livenessProbe:
          httpGet:
            path: /health
            port: 3003
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 3003
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 2
          successThreshold: 1
          failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata:
  name: spiritual-service
  namespace: development
spec:
  selector:
    app: spiritual-service
  ports:
  - port: 3003
    targetPort: 3003
  type: ClusterIP
EOF

# Fix profile-service
cat > services/profile-service.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: profile-service
  namespace: development
spec:
  replicas: 1
  selector:
    matchLabels:
      app: profile-service
  template:
    metadata:
      labels:
        app: profile-service
    spec:
      containers:
      - name: profile-service
        image: mbuaku/purpose-planner-services/profile-service:latest
        ports:
        - containerPort: 3004
        env:
        - name: PORT
          value: "3004"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        livenessProbe:
          httpGet:
            path: /health
            port: 3004
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 3004
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 2
          successThreshold: 1
          failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata:
  name: profile-service
  namespace: development
spec:
  selector:
    app: profile-service
  ports:
  - port: 3004
    targetPort: 3004
  type: ClusterIP
EOF

# Fix schedule-service
cat > services/schedule-service.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: schedule-service
  namespace: development
spec:
  replicas: 1
  selector:
    matchLabels:
      app: schedule-service
  template:
    metadata:
      labels:
        app: schedule-service
    spec:
      containers:
      - name: schedule-service
        image: mbuaku/purpose-planner-services/schedule-service:latest
        ports:
        - containerPort: 3005
        env:
        - name: PORT
          value: "3005"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        livenessProbe:
          httpGet:
            path: /health
            port: 3005
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 3005
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 2
          successThreshold: 1
          failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata:
  name: schedule-service
  namespace: development
spec:
  selector:
    app: schedule-service
  ports:
  - port: 3005
    targetPort: 3005
  type: ClusterIP
EOF

# Fix dashboard-service
cat > services/dashboard-service.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dashboard-service
  namespace: development
spec:
  replicas: 1
  selector:
    matchLabels:
      app: dashboard-service
  template:
    metadata:
      labels:
        app: dashboard-service
    spec:
      containers:
      - name: dashboard-service
        image: mbuaku/purpose-planner-services/dashboard-service:latest
        ports:
        - containerPort: 3006
        env:
        - name: PORT
          value: "3006"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        - name: FINANCIAL_SERVICE_URL
          value: "http://financial-service:3002"
        - name: SPIRITUAL_SERVICE_URL
          value: "http://spiritual-service:3003"
        - name: SCHEDULE_SERVICE_URL
          value: "http://schedule-service:3005"
        livenessProbe:
          httpGet:
            path: /health
            port: 3006
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 3006
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 2
          successThreshold: 1
          failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata:
  name: dashboard-service
  namespace: development
spec:
  selector:
    app: dashboard-service
  ports:
  - port: 3006
    targetPort: 3006
  type: ClusterIP
EOF

echo "All services fixed with proper health checks"