# Purpose Planner Microservices

A comprehensive life management platform for the Christian community, built with modern microservices architecture. This application helps users manage their spiritual growth, finances, schedules, and personal goals in a unified platform.

## 🚀 Features

- **Spiritual Growth**: Track Bible reading, prayer sessions, and journal entries
- **Financial Management**: Budget tracking, expense management, and savings goals
- **Schedule Management**: Time-block scheduling with recurring events
- **Personal Dashboard**: Unified view of all life areas with customizable widgets
- **Authentication**: Secure JWT-based auth with Google OAuth integration
- **API Gateway**: Centralized routing with rate limiting and caching

## 🏗️ Architecture Overview

The application follows a microservices architecture with the following services:

| Service | Port | Description |
|---------|------|-------------|
| Gateway Service | 3000 | API Gateway - Single entry point for all client requests |
| Auth Service | 3001 | Authentication & authorization with JWT and OAuth |
| Financial Service | 3002 | Budget, expense, income, and savings management |
| Spiritual Service | 3003 | Prayer tracking, Bible reading, and journaling |
| Profile Service | 3004 | User profile and preferences management |
| Schedule Service | 3005 | Calendar and event scheduling |
| Dashboard Service | 3006 | Data aggregation and unified dashboard |

## Project Structure

```
purpose-planner-services/
├── auth-service/         # Authentication and authorization
├── dashboard-service/    # Dashboard aggregation service
├── financial-service/    # Financial management
├── gateway-service/      # API Gateway (main entry point)
├── profile-service/      # User profile management
├── schedule-service/     # Schedule and calendar
├── spiritual-service/    # Spiritual growth tracking
├── k8s-manifests/       # Kubernetes deployment configs
├── scripts/             # Deployment and utility scripts
├── docs/                # Documentation
└── docker-compose.yml   # Local development setup
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- Docker and Docker Compose
- MongoDB 4.4+ (provided via Docker)
- Redis (provided via Docker)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone git@github.com:mbuaku/purpose-planner.git
   cd purpose-planner-services
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Copy example env files for each service
   for service in auth financial spiritual profile schedule dashboard gateway; do
     cp ${service}-service/.env.example ${service}-service/.env
   done
   ```

4. **Start all services:**
   ```bash
   docker-compose up -d
   ```

5. **Access the application:**
   - API Gateway: http://localhost:3000
   - API Documentation: http://localhost:3000/api-docs

### Running Individual Services

```bash
# Run a specific service in development mode
cd auth-service && npm run dev
```

## 🛠️ Development

### Testing

```bash
# Run all tests
npm test

# Run tests for a specific service
cd auth-service && npm test

# Run tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Type checking (if available)
npm run typecheck
```

### Environment Variables

Each service requires specific environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Service port | `3001` |
| `MONGODB_URI` | MongoDB connection | `mongodb://localhost:27017/purpose-planner` |
| `JWT_SECRET` | JWT signing key | `your-secret-key` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `GOOGLE_CLIENT_ID` | Google OAuth ID | `your-google-client-id` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | `your-google-secret` |

## 🚢 Deployment

### Kubernetes Deployment (Production)

The application is production-ready with full Kubernetes support:

#### Features
- **Auto-scaling**: HPA configured for 2-10 replicas based on CPU/memory
- **Load Balancing**: NGINX Ingress Controller for traffic distribution
- **SSL/TLS**: Automatic certificate management with cert-manager
- **Health Monitoring**: Liveness and readiness probes for all services
- **Resource Management**: Optimized CPU/memory limits

#### Quick Deploy
```bash
# Deploy infrastructure components
kubectl apply -f k8s-manifests/infrastructure.yaml
kubectl apply -f k8s-manifests/storage.yaml

# Deploy all services
kubectl apply -f k8s-manifests/services/

# Deploy ingress and TLS
kubectl apply -f k8s-manifests/ingress-elitessystems.yaml
kubectl apply -f k8s-manifests/tls-config.yaml

# Enable auto-scaling
kubectl apply -f k8s-manifests/hpa.yaml
```

#### Verify Deployment
```bash
kubectl get pods         # Check all pods are running
kubectl get hpa          # Verify auto-scaling
kubectl get ingress      # Check domain routing
kubectl get certificates # Verify SSL certificates
```

### CI/CD Pipeline

Jenkins pipeline automates the entire deployment process:
- Automated testing
- Docker image building
- Push to DockerHub
- Kubernetes deployment
- Health checks

## 📚 Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md) - Detailed system architecture
- [Deployment Guide](./docs/DEPLOYMENT-GUIDE.md) - Comprehensive deployment instructions
- [Setup Guides](./docs/SETUP-GUIDES.md) - Router configuration, port forwarding
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues and fixes
- [CI/CD Guide](./docs/CI-CD-GUIDE.md) - Jenkins pipeline documentation

## 🔒 Security

- **JWT Authentication**: Secure token-based authentication
- **Google OAuth**: Social login integration
- **Rate Limiting**: API Gateway protection against abuse
- **CORS**: Properly configured cross-origin policies
- **HTTPS**: Enforced SSL/TLS in production
- **Secrets Management**: Kubernetes secrets for sensitive data

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙏 Acknowledgments

Built with love for the Christian community to help manage life with purpose and intention.