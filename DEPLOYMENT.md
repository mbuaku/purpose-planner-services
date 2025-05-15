# Purpose Planner Deployment Guide

This document provides instructions for deploying the Purpose Planner application in various environments.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16.x or higher)
- [Docker](https://www.docker.com/products/docker-desktop/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [MongoDB](https://www.mongodb.com/) instance or MongoDB Atlas account
- [Git](https://git-scm.com/)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone git@github.com:mbuaku/purpose-planner.git
cd purpose-planner
```

### 2. Environment Configuration

Create `.env` files for each service in their respective directories. Examples:

**Auth Service (.env in auth-service directory)**
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/purpose-planner-auth
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=7d
```

**Financial Service (.env in financial-service directory)**
```
PORT=3002
MONGODB_URI=mongodb://localhost:27017/purpose-planner-financial
```

**Gateway Service (.env in gateway-service directory)**
```
PORT=3000
AUTH_SERVICE_URL=http://auth-service:3001
FINANCIAL_SERVICE_URL=http://financial-service:3002
SPIRITUAL_SERVICE_URL=http://spiritual-service:3003
PROFILE_SERVICE_URL=http://profile-service:3004
SCHEDULE_SERVICE_URL=http://schedule-service:3005
DASHBOARD_SERVICE_URL=http://dashboard-service:3006
JWT_SECRET=your_jwt_secret_here
```

### 3. Start Services with Docker Compose

For development with all services:

```bash
docker-compose up
```

This will start all microservices and set up the network between them.

To rebuild containers after changes:

```bash
docker-compose up --build
```

To run in detached mode:

```bash
docker-compose up -d
```

### 4. Start Individual Services for Development

To run a specific service for development:

```bash
cd <service-name>
npm install
npm run dev
```

## Production Deployment

### Option 1: Docker Compose (Single Server)

1. Clone the repository on your production server:
   ```bash
   git clone git@github.com:mbuaku/purpose-planner.git
   cd purpose-planner
   ```

2. Create production `.env` files for each service with proper configuration

3. Build and start services:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Option 2: Kubernetes Deployment

Prerequisites:
- Kubernetes cluster (e.g., EKS, GKE, or AKS)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Helm](https://helm.sh/docs/intro/install/) (optional, for managing deployments)

1. Apply Kubernetes manifests:
   ```bash
   kubectl apply -f k8s/
   ```

2. Verify deployments:
   ```bash
   kubectl get deployments
   kubectl get services
   ```

3. Set up Ingress or Load Balancer as needed for your cluster

### Option 3: Platform-as-a-Service (Heroku, Render, etc.)

1. Create a new project on your PaaS provider
2. Configure the Git repository as the source
3. Set environment variables for each service
4. Deploy the application according to the platform's instructions

## Database Setup

### MongoDB Atlas

1. Create a MongoDB Atlas account and set up a new cluster
2. Create a database user with appropriate permissions
3. Whitelist IP addresses to allow connections
4. Get the connection string and update it in each service's .env file

### Self-hosted MongoDB

1. Install MongoDB on your server
2. Create necessary databases and users
3. Configure MongoDB for security (authentication, network access, etc.)
4. Update the connection strings in each service's .env file

## SSL Configuration

For production environments, configure SSL:

1. Obtain SSL certificates (e.g., from Let's Encrypt)
2. Configure your reverse proxy (Nginx, Apache, etc.) to use SSL
3. Update service configurations to use HTTPS if required

## Monitoring and Logging

Set up monitoring and logging for production:

1. Configure logging in each service (e.g., Winston or Morgan)
2. Set up centralized logging (e.g., ELK Stack, Datadog)
3. Configure application monitoring (e.g., Prometheus, Grafana)

## Backup and Disaster Recovery

1. Set up regular database backups
2. Create a disaster recovery plan
3. Test restoration procedures periodically

## Scaling

### Horizontal Scaling

1. Add more instances of services to handle increased load
2. Configure load balancing between instances
3. Use container orchestration (Kubernetes, Docker Swarm) for automating scaling

### Vertical Scaling

1. Increase resources (CPU, memory) for individual services
2. Monitor resource usage and adjust as needed

## Troubleshooting

### Common Issues

1. **Connection Issues Between Services**
   - Check network configuration
   - Verify service URLs in gateway service
   - Ensure containers are on the same network

2. **Database Connection Problems**
   - Check MongoDB connection strings
   - Verify network access to the database
   - Ensure database credentials are correct

3. **Authentication Failures**
   - Verify JWT secret configuration across services
   - Check token expiration settings
   - Ensure auth middleware is properly configured

For more detailed troubleshooting, check the logs of individual services:

```bash
docker-compose logs <service-name>
```

## Maintenance

### Updates and Upgrades

1. Pull latest changes from the repository
2. Build new containers if needed
3. Apply database migrations if any
4. Restart services

```bash
git pull
docker-compose down
docker-compose up -d --build
```

### Database Maintenance

1. Run regular database maintenance tasks
2. Monitor database performance
3. Optimize queries as needed