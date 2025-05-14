# Purpose Planner Microservices

This repository contains the backend microservices for the Purpose Planner application, a comprehensive life management tool for the Christian community.

## Project Structure

```
purpose-planner-services/
├── auth-service/         # Authentication and authorization service
├── profile-service/      # User profile management service
├── spiritual-service/    # Spiritual growth tracking service
├── financial-service/    # Financial management service
├── schedule-service/     # Schedule and time management service
├── dashboard-service/    # Dashboard aggregation service
├── notification-service/ # Notification management service
├── shared/               # Shared code and utilities
└── docker-compose.yml    # Docker configuration for local development
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- Docker and Docker Compose
- MongoDB (provided via Docker)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
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

### Auth Service (Port 3001)
Handles user authentication, registration, and authorization.

### Profile Service (Port 3002)
Manages user profiles, preferences, and settings.

### Spiritual Service (Port 3003)
Tracks Bible reading, prayer, journaling, and spiritual growth.

### Financial Service (Port 3004)
Manages income tracking, savings goals, and expense management.

### Schedule Service (Port 3005)
Handles time-block scheduling and event management.

### Dashboard Service (Port 3006)
Aggregates data from other services for the main dashboard.

### Notification Service (Port 3007)
Manages notifications across all services.

## Development

Each service can be developed and run independently:

```
# To run a specific service:
npm run auth     # Runs auth service
npm run profile  # Runs profile service
# etc.
```

## Testing

Each service has its own test suite:

```
# Run tests for all services
npm test

# Run tests for a specific service
cd auth-service && npm test
```

## Deployment

See the [Deployment Guide](./DEPLOYMENT.md) for information on deploying the services to production.

## API Documentation

API documentation for each service is available at `/api-docs` when running the service locally.

## License

This project is licensed under the ISC License.