# Purpose Planner Microservices

This repository contains the backend microservices for the Purpose Planner application, a comprehensive life management tool for the Christian community.

## Project Structure

```
purpose-planner-services/
├── api-gateway/          # API Gateway for all microservices
├── auth-service/         # Authentication and authorization service
├── profile-service/      # User profile management service
├── spiritual-service/    # Spiritual growth tracking service
├── financial-service/    # Financial management service
├── schedule-service/     # Schedule and time management service
├── dashboard-service/    # Dashboard aggregation service
├── notification-service/ # Notification management service (future)
├── shared/               # Shared code and utilities
└── docker-compose.yml    # Docker configuration for local development
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- Docker and Docker Compose
- MongoDB (provided via Docker)
- **Kubernetes cluster with**:
  - Metrics Server (for HPA functionality)
  - NGINX Ingress Controller (for external routing)
  - cert-manager (for SSL/TLS certificates)

### Installation

1. Clone the repository:
   ```
   git clone git@github.com:mbuaku/purpose-planner.git
   cd purpose-planner-services
   ```

2. Install dependencies for all services:
   ```
   npm install
   ```

3. Create `.env` files in each service directory using the provided `.env.example` files.

4. Start the development environment using Docker:
   ```
   docker-compose up
   ```

## Services Overview

### API Gateway (Port 3000)
Single entry point for all client requests, handling routing, authentication, rate limiting, and caching.

### Auth Service (Port 3001)
Handles user authentication, registration, and authorization using JWT tokens and Google OAuth.

### Profile Service (Port 3004)
Manages user profiles, preferences, and settings including personal information and module preferences.

### Spiritual Service (Port 3003)
Tracks Bible reading, prayer, journaling, and spiritual growth with features like prayer tracking and journal entries.

### Financial Service (Port 3002)
Manages budgets, income tracking, savings goals, and expense management with comprehensive reporting.

### Schedule Service (Port 3005)
Handles time-block scheduling, recurring events, and calendar management with support for different event types.

### Dashboard Service (Port 3006)
Aggregates data from other services for a unified dashboard view with customizable widgets.

## Development

Each service can be developed and run independently:

```
# To run a specific service:
cd api-gateway && npm run dev
cd auth-service && npm run dev
# etc.
```

### Interservice Communication

Services communicate with each other through HTTP/REST APIs. The API Gateway handles routing requests to the appropriate service.

### Environment Variables

Key environment variables for each service:

- `PORT`: Port number for the service to listen on
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation/validation
- `AUTH_SERVICE_URL`, etc.: URLs for interservice communication

## Testing

Each service has its own test suite:

```
# Run tests for all services
npm test

# Run tests for a specific service
cd auth-service && npm test
```

## Deployment

### Infrastructure as Code Deployment

This application uses modern Infrastructure as Code practices:

- **HPA (Horizontal Pod Autoscaler)**: Automatic scaling based on CPU/memory usage
- **Ingress Routing**: 
  - `api.elitessystems.com` → API Gateway
  - `elitessystems.com` → Frontend application
- **SSL/TLS**: Automatic certificate management with Let's Encrypt
- **Resource Management**: CPU and memory requests/limits for all services
- **Health Checks**: Liveness and readiness probes for all services

### Quick Deployment
```bash
# Deploy all services to Kubernetes
kubectl apply -f k8s-manifests/

# Verify HPA is working
kubectl get hpa

# Check ingress status
kubectl get ingress
```

See the [Deployment Guide](./docs/DEPLOYMENT.md) for detailed information on deploying the services to production.

## API Documentation

API documentation for each service is available at `/api-docs` when running the service locally.
The API Gateway provides a unified endpoint at `http://localhost:3000/api-docs`.

## Security

- All API endpoints are secured using JWT authentication
- The API Gateway implements rate limiting to prevent abuse
- CORS is properly configured to allow only specific origins
- Password hashing is implemented in the Auth Service

## License

This project is licensed under the ISC License.