# Purpose Planner Services - CI/CD Guide

## Table of Contents

1. [Overview](#overview)
2. [Pipeline Architecture](#pipeline-architecture)
3. [Jenkins Setup](#jenkins-setup)
4. [GitHub Integration](#github-integration)
5. [Docker Management](#docker-management)
6. [Kubernetes Deployment](#kubernetes-deployment)
7. [Testing Strategy](#testing-strategy)
8. [Environment Management](#environment-management)
9. [Security Practices](#security-practices)
10. [Monitoring & Verification](#monitoring--verification)
11. [Rollback Procedures](#rollback-procedures)
12. [Troubleshooting](#troubleshooting)
13. [Best Practices](#best-practices)

## Overview

The Purpose Planner Services uses a comprehensive CI/CD pipeline built with Jenkins to automate the entire software delivery process. The pipeline covers code checkout, testing, building, security scanning, deployment, and verification across multiple environments.

### Pipeline Benefits

- **Automated Deployment**: Zero-downtime deployments to Kubernetes
- **Quality Assurance**: Automated testing and code quality checks
- **Security Integration**: Credential management and secure deployments
- **Infrastructure as Code**: Automated infrastructure provisioning
- **Monitoring**: Real-time deployment verification and health checks
- **Rollback Capability**: Automated and manual rollback procedures

### Deployment Flow

```
GitHub Push → Jenkins Webhook → Build & Test → Docker Build → Push to Registry → Deploy to K8s → Health Check → Notification
```

## Pipeline Architecture

### Microservices Pipeline Structure

The CI/CD pipeline handles 7 microservices independently:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Source Code   │    │   Jenkins       │    │   Docker Hub    │
│   (GitHub)      │───▶│   Pipeline      │───▶│   Registry      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        │
┌─────────────────┐    ┌─────────────────┐               │
│   Kubernetes    │◄───│   Deployment   │◄──────────────┘
│   Cluster       │    │   Automation    │
└─────────────────┘    └─────────────────┘
```

### Service Deployment Matrix

| Service | Port | Image Tag | Deployment Order |
|---------|------|-----------|------------------|
| MongoDB | 27017 | mongo:4.4 | 1 (Infrastructure) |
| Redis | 6379 | redis:alpine | 1 (Infrastructure) |
| Auth Service | 3001 | auth-latest | 2 (Core Services) |
| Gateway Service | 3000 | gateway-latest | 3 (API Gateway) |
| Profile Service | 3004 | profile-latest | 4 (Business Services) |
| Financial Service | 3002 | financial-latest | 4 (Business Services) |
| Spiritual Service | 3003 | spiritual-latest | 4 (Business Services) |
| Schedule Service | 3005 | schedule-latest | 4 (Business Services) |
| Dashboard Service | 3006 | dashboard-latest | 5 (Aggregation) |

### Pipeline Stages

1. **Checkout**: Source code retrieval from GitHub
2. **Install Dependencies**: npm install for all services
3. **Testing**: Unit and integration tests
4. **Code Quality**: Linting and security checks
5. **Build Images**: Docker image creation
6. **Push to Registry**: DockerHub image storage
7. **Deploy Infrastructure**: Database and supporting services
8. **Deploy Services**: Application microservices
9. **Health Verification**: Deployment validation
10. **Notification**: Slack/email notifications

## Jenkins Setup

### Prerequisites

```bash
# Jenkins server requirements
- Java 11 or higher
- Docker Engine
- kubectl configured for Kubernetes cluster
- Sufficient disk space for builds (10GB+)
- Network access to GitHub and DockerHub
```

### Jenkins Installation

```bash
# Install Jenkins on Ubuntu
sudo apt update
sudo apt install openjdk-11-jdk
wget -q -O - https://pkg.jenkins.io/debian-stable/jenkins.io.key | sudo apt-key add -
sudo sh -c 'echo deb https://pkg.jenkins.io/debian-stable binary/ > /etc/apt/sources.list.d/jenkins.list'
sudo apt update
sudo apt install jenkins

# Start Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Get initial admin password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### Required Plugins

Install the following plugins via Jenkins Plugin Manager:

```bash
# Essential Plugins
- Pipeline
- Git
- GitHub Integration
- Docker Pipeline
- Kubernetes
- Credentials Binding
- Slack Notification (optional)
- Email Extension
- Build Timeout
- Timestamper
```

### Global Configuration

#### Docker Integration

```bash
# Configure Docker in Jenkins
Manage Jenkins → Global Tool Configuration → Docker
Name: docker
Installation root: /usr/bin/docker
```

#### Kubernetes Configuration

```bash
# Configure Kubernetes plugin
Manage Jenkins → Configure System → Cloud → Kubernetes

Kubernetes URL: https://your-k8s-api-server:6443
Kubernetes Namespace: default
Credentials: Add kubeconfig file or service account token
```

### Credentials Setup

#### GitHub Access

```bash
# Add GitHub credentials
Manage Jenkins → Credentials → System → Global credentials

Kind: Username with password
Username: your-github-username
Password: your-github-personal-access-token (with repo access)
ID: github-credentials
```

#### DockerHub Registry

```bash
# Add DockerHub credentials
Kind: Username with password
Username: mbuaku
Password: your-dockerhub-password
ID: dockerhub-credentials
```

#### Kubernetes Secrets

```bash
# Add Kubernetes secrets for deployment
Kind: Secret text
Secret: your-jwt-secret
ID: jwt-secret

Kind: Secret text
Secret: your-mongodb-uri
ID: mongodb-uri

Kind: Secret text
Secret: your-google-client-id
ID: google-client-id

Kind: Secret text
Secret: your-google-client-secret
ID: google-client-secret
```

### Pipeline Configuration

#### Jenkinsfile (Root Directory)

```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'mbuaku'
        DOCKER_REPO = 'purpose-planner-services'
        KUBECONFIG = credentials('kubeconfig')
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Checked out code from ${env.GIT_BRANCH}"
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Auth Service') {
                    steps {
                        dir('auth-service') {
                            sh 'npm ci --only=production'
                        }
                    }
                }
                stage('Gateway Service') {
                    steps {
                        dir('gateway-service') {
                            sh 'npm ci --only=production'
                        }
                    }
                }
                // Additional services...
            }
        }
        
        stage('Testing') {
            parallel {
                stage('Auth Tests') {
                    steps {
                        dir('auth-service') {
                            sh 'npm test'
                            publishTestResults testResultsPattern: 'test-results.xml'
                        }
                    }
                }
                stage('Gateway Tests') {
                    steps {
                        dir('gateway-service') {
                            sh 'npm test'
                            publishTestResults testResultsPattern: 'test-results.xml'
                        }
                    }
                }
                // Additional test stages...
            }
        }
        
        stage('Build Images') {
            parallel {
                stage('Auth Image') {
                    steps {
                        script {
                            def authImage = docker.build("${DOCKER_REGISTRY}/${DOCKER_REPO}:auth-${env.BUILD_NUMBER}", "./auth-service")
                            docker.withRegistry('', 'dockerhub-credentials') {
                                authImage.push()
                                authImage.push("auth-latest")
                            }
                        }
                    }
                }
                // Additional image builds...
            }
        }
        
        stage('Deploy to Development') {
            steps {
                script {
                    // Create secrets
                    sh '''
                        kubectl create secret generic app-secrets \
                            --from-literal=jwt-secret="$JWT_SECRET" \
                            --from-literal=mongodb-uri="$MONGODB_URI" \
                            --from-literal=google-client-id="$GOOGLE_CLIENT_ID" \
                            --from-literal=google-client-secret="$GOOGLE_CLIENT_SECRET" \
                            -n development \
                            --dry-run=client -o yaml | kubectl apply -f -
                    '''
                    
                    // Deploy infrastructure
                    sh 'kubectl apply -f k8s-manifests/storage.yaml'
                    sh 'kubectl apply -f k8s-manifests/infrastructure.yaml'
                    
                    // Deploy services
                    sh 'kubectl apply -f k8s-manifests/services/'
                    
                    // Setup ingress and HPA
                    sh 'kubectl apply -f k8s-manifests/ingress-elitessystems.yaml'
                    sh 'kubectl apply -f k8s-manifests/hpa.yaml'
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    // Wait for pods to be ready
                    sh 'kubectl wait --for=condition=ready pod -l app=gateway-service --timeout=300s -n development'
                    sh 'kubectl wait --for=condition=ready pod -l app=auth-service --timeout=300s -n development'
                    
                    // Health check verification
                    sh '''
                        # Test health endpoints
                        kubectl exec -n development deployment/gateway-service -- curl -f http://localhost:3000/health
                        kubectl exec -n development deployment/auth-service -- curl -f http://localhost:3001/health
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful!'
            // slackSend(message: "✅ Deployment successful for ${env.JOB_NAME} #${env.BUILD_NUMBER}")
        }
        failure {
            echo 'Deployment failed!'
            // slackSend(message: "❌ Deployment failed for ${env.JOB_NAME} #${env.BUILD_NUMBER}")
        }
        always {
            cleanWs()
        }
    }
}
```

## GitHub Integration

### Webhook Configuration

#### GitHub Repository Settings

1. **Navigate to Repository Settings**: GitHub → Your Repository → Settings → Webhooks
2. **Add Webhook**:
   - Payload URL: `http://your-jenkins-server:8080/github-webhook/`
   - Content type: `application/json`
   - Secret: Optional security token
   - Events: `Push events`, `Pull request events`

#### Branch Protection Rules

```bash
# Configure branch protection
- Branch name pattern: main
- Require pull request reviews before merging: ✓
- Require status checks to pass before merging: ✓
- Required status checks: Jenkins CI/CD Pipeline
- Require branches to be up to date before merging: ✓
- Include administrators: ✓
```

### Multi-branch Pipeline

#### Jenkinsfile for Feature Branches

```groovy
pipeline {
    agent any
    
    when {
        not { branch 'main' }
    }
    
    stages {
        stage('Feature Branch Testing') {
            steps {
                echo "Testing feature branch: ${env.BRANCH_NAME}"
                // Run tests but don't deploy
            }
        }
    }
}
```

#### Main Branch Deployment

```groovy
pipeline {
    agent any
    
    when {
        branch 'main'
    }
    
    stages {
        stage('Production Deployment') {
            steps {
                input message: 'Deploy to production?', ok: 'Deploy'
                // Deploy to production namespace
            }
        }
    }
}
```

## Docker Management

### Image Naming Convention

```bash
# Registry structure
mbuaku/purpose-planner-services:auth-latest
mbuaku/purpose-planner-services:auth-{build-number}
mbuaku/purpose-planner-services:gateway-latest
mbuaku/purpose-planner-services:gateway-{build-number}
```

### Dockerfile Standards

#### Base Dockerfile Template

```dockerfile
# auth-service/Dockerfile
FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001
USER nodeuser

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Registry Management

#### Image Cleanup

```bash
# Jenkins Pipeline for image cleanup
stage('Cleanup Old Images') {
    steps {
        script {
            // Keep last 5 builds
            sh '''
                # Local cleanup
                docker image prune -f
                docker images --format "table {{.Repository}}\\t{{.Tag}}\\t{{.CreatedAt}}" | grep purpose-planner-services | sort -k3 -r | tail -n +6 | awk '{print $1":"$2}' | xargs -r docker rmi
            '''
        }
    }
}
```

#### Security Scanning

```bash
# Add to Jenkinsfile
stage('Security Scan') {
    steps {
        script {
            sh 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v $PWD:/tmp/.trivy-cache/ aquasec/trivy image mbuaku/purpose-planner-services:auth-latest'
        }
    }
}
```

## Kubernetes Deployment

### Infrastructure as Code

#### Deployment Strategy

```yaml
# k8s-manifests/services/auth-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: development
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
        version: latest
    spec:
      containers:
      - name: auth-service
        image: mbuaku/purpose-planner-services:auth-latest
        ports:
        - containerPort: 3001
        env:
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongodb-uri
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "250m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Deployment Automation

#### Jenkins Deployment Script

```groovy
stage('Deploy to Kubernetes') {
    steps {
        script {
            // Update image tags in deployment files
            sh """
                sed -i 's|image: mbuaku/purpose-planner-services:auth-latest|image: mbuaku/purpose-planner-services:auth-${env.BUILD_NUMBER}|g' k8s-manifests/services/auth-service.yaml
                sed -i 's|image: mbuaku/purpose-planner-services:gateway-latest|image: mbuaku/purpose-planner-services:gateway-${env.BUILD_NUMBER}|g' k8s-manifests/services/gateway-service.yaml
            """
            
            // Apply configurations
            sh '''
                # Create namespace if it doesn't exist
                kubectl create namespace development --dry-run=client -o yaml | kubectl apply -f -
                
                # Apply secrets
                kubectl create secret generic app-secrets \
                    --from-literal=jwt-secret="${JWT_SECRET}" \
                    --from-literal=mongodb-uri="${MONGODB_URI}" \
                    --from-literal=google-client-id="${GOOGLE_CLIENT_ID}" \
                    --from-literal=google-client-secret="${GOOGLE_CLIENT_SECRET}" \
                    -n development \
                    --dry-run=client -o yaml | kubectl apply -f -
                
                # Deploy in order
                kubectl apply -f k8s-manifests/storage.yaml
                kubectl apply -f k8s-manifests/infrastructure.yaml
                sleep 30
                kubectl apply -f k8s-manifests/services/
                kubectl apply -f k8s-manifests/ingress-elitessystems.yaml
                kubectl apply -f k8s-manifests/hpa.yaml
                
                # Wait for rollout
                kubectl rollout status deployment/auth-service -n development --timeout=300s
                kubectl rollout status deployment/gateway-service -n development --timeout=300s
            '''
        }
    }
}
```

## Testing Strategy

### Jest Configuration

#### Unit Testing Setup

```javascript
// jest.config.js (shared configuration)
module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.js',
    '!src/**/index.js',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/src/**/*.test.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 10000,
};
```

#### Integration Testing

```javascript
// tests/integration/auth.api.test.js
const request = require('supertest');
const app = require('../../server');
const User = require('../../src/models/user.model');

describe('Auth API Integration Tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });
  });
});
```

### Pipeline Testing Integration

```groovy
stage('Run Tests') {
    parallel {
        stage('Unit Tests') {
            steps {
                script {
                    sh '''
                        for service in auth-service gateway-service financial-service spiritual-service profile-service schedule-service dashboard-service; do
                            echo "Running unit tests for $service"
                            cd $service
                            npm test -- --coverage --testResultsProcessor=jest-junit
                            cd ..
                        done
                    '''
                }
            }
            post {
                always {
                    publishTestResults testResultsPattern: '*/junit.xml'
                    publishCoverageReports([
                        sourceFileResolver: sourceFiles('STORE_ALL_BUILD'),
                        coverageReports: [[path: '*/coverage/cobertura-coverage.xml', type: 'COBERTURA']]
                    ])
                }
            }
        }
        
        stage('Integration Tests') {
            steps {
                script {
                    // Start test environment
                    sh 'docker-compose -f docker-compose.test.yml up -d'
                    
                    // Wait for services
                    sh 'sleep 30'
                    
                    // Run integration tests
                    sh '''
                        for service in auth-service gateway-service; do
                            echo "Running integration tests for $service"
                            cd $service
                            npm run test:integration
                            cd ..
                        done
                    '''
                }
            }
            post {
                always {
                    sh 'docker-compose -f docker-compose.test.yml down'
                }
            }
        }
    }
}
```

### Quality Gates

```groovy
stage('Quality Gate') {
    steps {
        script {
            // Check test coverage
            def coverage = sh(
                script: "grep -o 'All files.*[0-9]*\\.[0-9]*' */coverage/lcov-report/index.html | grep -o '[0-9]*\\.[0-9]*' | head -1",
                returnStdout: true
            ).trim()
            
            if (coverage.toFloat() < 70) {
                error("Code coverage ${coverage}% is below required 70%")
            }
            
            // Check for critical security vulnerabilities
            sh 'npm audit --audit-level=critical'
            
            // Lint check
            sh '''
                for service in auth-service gateway-service financial-service spiritual-service profile-service schedule-service dashboard-service; do
                    cd $service
                    npm run lint
                    cd ..
                done
            '''
        }
    }
}
```

## Environment Management

### Development Environment

```groovy
stage('Deploy to Development') {
    when {
        anyOf {
            branch 'develop'
            branch 'feature/*'
        }
    }
    steps {
        script {
            def namespace = 'development'
            deployToEnvironment(namespace, 'development')
        }
    }
}

def deployToEnvironment(namespace, environment) {
    sh """
        # Update image tags for environment
        for service in auth gateway financial spiritual profile schedule dashboard; do
            sed -i 's|image: mbuaku/purpose-planner-services:\\${service}-latest|image: mbuaku/purpose-planner-services:\\${service}-${env.BUILD_NUMBER}|g' k8s-manifests/services/\\${service}-service.yaml
        done
        
        # Deploy to specific namespace
        kubectl apply -f k8s-manifests/namespaces.yaml
        kubectl apply -f k8s-manifests/storage.yaml
        kubectl apply -f k8s-manifests/infrastructure.yaml
        kubectl apply -f k8s-manifests/services/ -n ${namespace}
        
        # Environment-specific configurations
        if [ "${environment}" = "production" ]; then
            kubectl apply -f k8s-manifests/ingress-production.yaml
            kubectl apply -f k8s-manifests/tls-config.yaml
        else
            kubectl apply -f k8s-manifests/ingress-elitessystems.yaml
        fi
        
        kubectl apply -f k8s-manifests/hpa.yaml -n ${namespace}
    """
}
```

### Production Deployment

```groovy
stage('Deploy to Production') {
    when {
        branch 'main'
    }
    steps {
        timeout(time: 10, unit: 'MINUTES') {
            input message: 'Deploy to production?', 
                  ok: 'Deploy',
                  submitterParameter: 'DEPLOYER'
        }
        
        script {
            echo "Deploying to production, approved by: ${env.DEPLOYER}"
            
            // Backup current production state
            sh '''
                kubectl get deployment -n production -o yaml > production-backup-${BUILD_NUMBER}.yaml
                kubectl get configmap -n production -o yaml >> production-backup-${BUILD_NUMBER}.yaml
                kubectl get secret -n production -o yaml >> production-backup-${BUILD_NUMBER}.yaml
            '''
            
            // Deploy to production
            deployToEnvironment('production', 'production')
            
            // Verify deployment
            sh '''
                kubectl wait --for=condition=available deployment --all -n production --timeout=600s
                kubectl get pods -n production
                
                # Health check all services
                for service in auth gateway financial spiritual profile schedule dashboard; do
                    kubectl exec -n production deployment/${service}-service -- curl -f http://localhost:300X/health
                done
            '''
        }
    }
}
```

## Security Practices

### Credential Management

#### Jenkins Credentials

```bash
# Secure credential storage
Manage Jenkins → Credentials → System → Global credentials

# Required credentials:
1. github-credentials (Username/Password)
2. dockerhub-credentials (Username/Password)
3. kubeconfig (Secret file)
4. jwt-secret (Secret text)
5. mongodb-uri (Secret text)
6. google-client-id (Secret text)
7. google-client-secret (Secret text)
```

#### Kubernetes Secrets

```groovy
stage('Manage Secrets') {
    steps {
        withCredentials([
            string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
            string(credentialsId: 'mongodb-uri', variable: 'MONGODB_URI'),
            string(credentialsId: 'google-client-id', variable: 'GOOGLE_CLIENT_ID'),
            string(credentialsId: 'google-client-secret', variable: 'GOOGLE_CLIENT_SECRET')
        ]) {
            sh '''
                kubectl create secret generic app-secrets \
                    --from-literal=jwt-secret="$JWT_SECRET" \
                    --from-literal=mongodb-uri="$MONGODB_URI" \
                    --from-literal=google-client-id="$GOOGLE_CLIENT_ID" \
                    --from-literal=google-client-secret="$GOOGLE_CLIENT_SECRET" \
                    -n development \
                    --dry-run=client -o yaml | kubectl apply -f -
            '''
        }
    }
}
```

### Security Scanning

#### Container Security

```groovy
stage('Security Scan') {
    parallel {
        stage('Container Scan') {
            steps {
                script {
                    sh '''
                        # Scan all service images
                        for service in auth gateway financial spiritual profile schedule dashboard; do
                            echo "Scanning $service image for vulnerabilities"
                            docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                                aquasec/trivy image \
                                --severity HIGH,CRITICAL \
                                --exit-code 1 \
                                mbuaku/purpose-planner-services:${service}-${BUILD_NUMBER}
                        done
                    '''
                }
            }
        }
        
        stage('Dependency Scan') {
            steps {
                script {
                    sh '''
                        for service in auth-service gateway-service financial-service spiritual-service profile-service schedule-service dashboard-service; do
                            cd $service
                            npm audit --audit-level=high
                            cd ..
                        done
                    '''
                }
            }
        }
    }
}
```

### RBAC Configuration

```yaml
# k8s-manifests/rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: jenkins-deployer
  namespace: development
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: development
  name: jenkins-deployer-role
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps", "secrets"]
  verbs: ["get", "list", "create", "update", "patch", "delete"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets"]
  verbs: ["get", "list", "create", "update", "patch", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: jenkins-deployer-binding
  namespace: development
subjects:
- kind: ServiceAccount
  name: jenkins-deployer
  namespace: development
roleRef:
  kind: Role
  name: jenkins-deployer-role
  apiGroup: rbac.authorization.k8s.io
```

## Monitoring & Verification

### Health Check Implementation

```groovy
stage('Health Verification') {
    steps {
        script {
            // Wait for pods to be ready
            sh '''
                services="auth gateway financial spiritual profile schedule dashboard"
                for service in $services; do
                    echo "Waiting for $service to be ready..."
                    kubectl wait --for=condition=ready pod -l app=${service}-service --timeout=300s -n development
                done
            '''
            
            // Verify health endpoints
            sh '''
                services="auth:3001 gateway:3000 financial:3002 spiritual:3003 profile:3004 schedule:3005 dashboard:3006"
                for service_port in $services; do
                    service=$(echo $service_port | cut -d: -f1)
                    port=$(echo $service_port | cut -d: -f2)
                    echo "Testing $service health endpoint..."
                    kubectl exec -n development deployment/${service}-service -- curl -f http://localhost:${port}/health
                done
            '''
            
            // Test critical API endpoints
            sh '''
                # Test gateway routing
                kubectl exec -n development deployment/gateway-service -- curl -f http://localhost:3000/api/auth/health
                
                # Test database connectivity
                kubectl exec -n development deployment/auth-service -- node -e "
                    const mongoose = require('mongoose');
                    mongoose.connect(process.env.MONGODB_URI)
                        .then(() => { console.log('Database connected'); process.exit(0); })
                        .catch(err => { console.error('Database connection failed:', err); process.exit(1); });
                "
            '''
        }
    }
}
```

### Performance Monitoring

```groovy
stage('Performance Check') {
    steps {
        script {
            // Load test critical endpoints
            sh '''
                # Install Apache Bench if not present
                kubectl run load-test --image=httpd:alpine --rm -i --restart=Never -- sh -c "
                    apk add --no-cache apache2-utils
                    ab -n 100 -c 10 http://gateway-service:3000/health
                    ab -n 50 -c 5 http://auth-service:3001/health
                "
            '''
            
            // Check resource usage
            sh '''
                echo "Resource usage after deployment:"
                kubectl top pods -n development
                kubectl top nodes
            '''
        }
    }
}
```

### Deployment Verification

```groovy
stage('Deployment Verification') {
    steps {
        script {
            // Verify all deployments are successful
            def services = ['auth-service', 'gateway-service', 'financial-service', 'spiritual-service', 'profile-service', 'schedule-service', 'dashboard-service']
            
            services.each { service ->
                sh "kubectl rollout status deployment/${service} -n development --timeout=300s"
            }
            
            // Check HPA status
            sh 'kubectl get hpa -n development'
            
            // Verify ingress configuration
            sh 'kubectl get ingress -n development'
            
            // Check service endpoints
            sh 'kubectl get endpoints -n development'
        }
    }
}
```

## Rollback Procedures

### Automated Rollback

```groovy
stage('Deploy with Rollback') {
    steps {
        script {
            try {
                // Attempt deployment
                deployToEnvironment('development', 'development')
                
                // Verify deployment
                sh '''
                    kubectl wait --for=condition=available deployment --all -n development --timeout=300s
                    
                    # Health check all services
                    for service in auth gateway financial spiritual profile schedule dashboard; do
                        kubectl exec -n development deployment/${service}-service -- curl -f http://localhost:300X/health || exit 1
                    done
                '''
                
            } catch (Exception e) {
                echo "Deployment failed: ${e.getMessage()}"
                echo "Initiating automatic rollback..."
                
                // Automatic rollback
                sh '''
                    services="auth-service gateway-service financial-service spiritual-service profile-service schedule-service dashboard-service"
                    for service in $services; do
                        echo "Rolling back $service..."
                        kubectl rollout undo deployment/$service -n development
                        kubectl rollout status deployment/$service -n development --timeout=300s
                    done
                '''
                
                // Verify rollback
                sh '''
                    echo "Verifying rollback..."
                    for service in auth gateway financial spiritual profile schedule dashboard; do
                        kubectl exec -n development deployment/${service}-service -- curl -f http://localhost:300X/health
                    done
                '''
                
                error("Deployment failed and was rolled back")
            }
        }
    }
}
```

### Manual Rollback Procedures

```bash
# Manual rollback commands
# 1. Check deployment history
kubectl rollout history deployment/auth-service -n development

# 2. Rollback to previous version
kubectl rollout undo deployment/auth-service -n development

# 3. Rollback to specific revision
kubectl rollout undo deployment/auth-service --to-revision=2 -n development

# 4. Verify rollback
kubectl rollout status deployment/auth-service -n development

# 5. Rollback all services
services="auth-service gateway-service financial-service spiritual-service profile-service schedule-service dashboard-service"
for service in $services; do
    kubectl rollout undo deployment/$service -n development
    kubectl rollout status deployment/$service -n development
done
```

### Database Rollback

```groovy
stage('Database Rollback') {
    when {
        environment name: 'ROLLBACK_DB', value: 'true'
    }
    steps {
        script {
            // Stop all application services
            sh '''
                kubectl scale deployment --replicas=0 --all -n development
                sleep 30
            '''
            
            // Restore database backup
            sh '''
                # Restore MongoDB from backup
                kubectl exec -it mongodb-0 -n development -- mongorestore \
                    --uri="mongodb://admin:password123@localhost:27017/purpose-planner?authSource=admin" \
                    --drop /backup/mongodb-backup-previous
                
                # Restore Redis from backup
                kubectl exec -it redis-0 -n development -- redis-cli FLUSHALL
                kubectl cp redis-backup-previous.rdb development/redis-0:/data/dump.rdb
                kubectl delete pod redis-0 -n development
            '''
            
            // Restart services with previous version
            sh '''
                kubectl scale deployment --replicas=1 --all -n development
            '''
        }
    }
}
```

## Troubleshooting

### Common Pipeline Issues

#### Build Failures

**Problem**: npm install failures or dependency issues

**Diagnosis**:
```bash
# Check build logs
Jenkins Console Output → Search for "npm ERR!"

# Common issues:
- Node version mismatch
- Network connectivity to npm registry
- Package-lock.json conflicts
- Insufficient disk space
```

**Solutions**:
```groovy
stage('Debug Dependencies') {
    steps {
        sh '''
            # Check Node version
            node --version
            npm --version
            
            # Clear npm cache
            npm cache clean --force
            
            # Check disk space
            df -h
            
            # Install with verbose logging
            npm install --verbose
        '''
    }
}
```

#### Docker Build Issues

**Problem**: Docker image build failures

**Diagnosis**:
```bash
# Check Docker logs
docker system df
docker system prune -f

# Common issues:
- Insufficient disk space
- Network issues downloading base images
- Dockerfile syntax errors
- Missing build context files
```

**Solutions**:
```groovy
stage('Docker Troubleshooting') {
    steps {
        sh '''
            # System cleanup
            docker system prune -f
            
            # Check available space
            df -h /var/lib/docker
            
            # Build with debug output
            docker build --no-cache --progress=plain -t test-image ./auth-service
        '''
    }
}
```

#### Kubernetes Deployment Issues

**Problem**: Deployment failures or pods not starting

**Diagnosis**:
```bash
# Check pod status
kubectl get pods -n development
kubectl describe pod auth-service-xxx -n development

# Check events
kubectl get events -n development --sort-by='.lastTimestamp'

# Check logs
kubectl logs deployment/auth-service -n development
```

**Solutions**:
```groovy
stage('Kubernetes Debugging') {
    steps {
        sh '''
            # Check cluster resources
            kubectl top nodes
            kubectl describe nodes
            
            # Check resource quotas
            kubectl describe resourcequota -n development
            
            # Check persistent volumes
            kubectl get pv,pvc -n development
            
            # Check service endpoints
            kubectl get endpoints -n development
        '''
    }
}
```

### Performance Issues

#### Slow Build Times

**Problem**: Pipeline taking too long to complete

**Solutions**:
```groovy
pipeline {
    options {
        // Parallel execution
        parallelsAlwaysFailFast()
        
        // Build timeout
        timeout(time: 30, unit: 'MINUTES')
        
        // Skip default checkout
        skipDefaultCheckout(true)
    }
    
    stages {
        stage('Optimized Checkout') {
            steps {
                // Shallow clone
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: "*/${env.BRANCH_NAME}"]],
                    extensions: [
                        [$class: 'CloneOption', depth: 1, noTags: false, reference: '', shallow: true]
                    ],
                    userRemoteConfigs: [[
                        credentialsId: 'github-credentials',
                        url: 'https://github.com/mbuaku/purpose-planner.git'
                    ]]
                ])
            }
        }
        
        stage('Cached Dependencies') {
            steps {
                // Use dependency caching
                sh '''
                    # Cache node_modules
                    if [ -d "/var/cache/jenkins/node_modules" ]; then
                        cp -r /var/cache/jenkins/node_modules/* ./
                    fi
                    
                    npm ci --cache /var/cache/jenkins/npm
                    
                    # Update cache
                    mkdir -p /var/cache/jenkins/node_modules
                    cp -r ./node_modules/* /var/cache/jenkins/node_modules/
                '''
            }
        }
    }
}
```

#### Resource Constraints

**Problem**: Jenkins agent running out of resources

**Solutions**:
```bash
# Monitor Jenkins system
# System Information → Manage Jenkins

# Increase Jenkins heap size
# /etc/default/jenkins
JENKINS_JAVA_OPTIONS="-Djava.awt.headless=true -Xmx2048m"

# Clean up workspace regularly
pipeline {
    post {
        always {
            cleanWs(
                deleteDirs: true,
                patterns: [[pattern: 'node_modules/**', type: 'INCLUDE']]
            )
        }
    }
}

# Use external agents for builds
agent {
    kubernetes {
        yaml '''
        apiVersion: v1
        kind: Pod
        spec:
          containers:
          - name: docker
            image: docker:dind
            securityContext:
              privileged: true
          - name: kubectl
            image: bitnami/kubectl
        '''
    }
}
```

### Security Issues

#### Credential Exposure

**Problem**: Secrets appearing in build logs

**Solutions**:
```groovy
stage('Secure Deployment') {
    steps {
        withCredentials([
            string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET')
        ]) {
            // Use mask to hide secrets in logs
            sh '''
                set +x  # Disable command echoing
                echo "Deploying with JWT secret: ${JWT_SECRET:0:4}****"
                # Actual deployment commands
                set -x  # Re-enable command echoing
            '''
        }
    }
}
```

#### Container Security

**Problem**: Vulnerable container images

**Solutions**:
```groovy
stage('Security Compliance') {
    steps {
        // Scan for vulnerabilities
        sh '''
            docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                aquasec/trivy image \
                --severity HIGH,CRITICAL \
                --exit-code 1 \
                mbuaku/purpose-planner-services:auth-latest
        '''
        
        // Check for secrets in images
        sh '''
            docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                aquasec/trivy fs \
                --security-checks secret \
                ./auth-service
        '''
    }
}
```

## Best Practices

### Pipeline Design

1. **Fail Fast**: Put quick tests first
2. **Parallel Execution**: Run independent stages in parallel
3. **Stage Naming**: Use descriptive stage names
4. **Error Handling**: Implement proper error handling and cleanup
5. **Resource Management**: Clean up resources after builds

### Code Quality

1. **Test Coverage**: Maintain minimum 70% code coverage
2. **Linting**: Enforce code style consistently
3. **Security Scanning**: Regular vulnerability scanning
4. **Dependency Management**: Keep dependencies updated

### Deployment Strategy

1. **Rolling Updates**: Use rolling deployments for zero downtime
2. **Health Checks**: Implement comprehensive health checks
3. **Monitoring**: Monitor deployments in real-time
4. **Rollback Plan**: Always have a rollback strategy

### Security

1. **Credential Management**: Use Jenkins credentials store
2. **Least Privilege**: Apply minimal required permissions
3. **Regular Updates**: Keep all tools and dependencies updated
4. **Audit Logs**: Maintain detailed audit logs

### Documentation

1. **Pipeline Documentation**: Document all pipeline stages
2. **Runbooks**: Create operational runbooks
3. **Troubleshooting Guides**: Maintain troubleshooting documentation
4. **Change Management**: Document all changes and their impact

---

This CI/CD guide provides comprehensive coverage for managing the Purpose Planner Services pipeline. For additional support, refer to the [Troubleshooting Guide](./TROUBLESHOOTING.md) and [Architecture Documentation](./ARCHITECTURE.md).