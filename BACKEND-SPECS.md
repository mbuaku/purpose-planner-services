# Purpose Planner - Backend Specifications

This document provides detailed specifications for the Purpose Planner microservices architecture, including deployment considerations, service interactions, and technical details.

## Architecture Overview

Purpose Planner uses a microservices architecture with the following components:

```
Client Application (React) → API Gateway → Microservices → MongoDB
```

### Service Responsibilities

- **API Gateway**: Routes requests, handles authentication, rate limiting, caching
- **Auth Service**: User authentication, registration, authorization
- **Profile Service**: User profile data and preferences
- **Spiritual Service**: Bible readings, prayers, journals
- **Financial Service**: Budgets, expenses, incomes, savings goals
- **Schedule Service**: Events, recurring events, calendar management
- **Dashboard Service**: Data aggregation, widgets, UI configuration

## Service Specifications

### API Gateway (Port 3000)

**Description**: The central entry point for all client requests.

**Key Features**:
- Request routing to appropriate microservices
- Authentication and authorization
- Rate limiting
- Response caching
- Request/response logging
- Error handling standardization

**Dependencies**:
- Express
- http-proxy-middleware
- express-rate-limit
- apicache
- JWT authentication
- Winston logger

**Environment Variables**:
```
PORT=3000
NODE_ENV=development|production
JWT_SECRET=your_jwt_secret
LOG_LEVEL=info|debug|error
AUTH_SERVICE_URL=http://auth-service:3001
PROFILE_SERVICE_URL=http://profile-service:3004
SPIRITUAL_SERVICE_URL=http://spiritual-service:3003
FINANCIAL_SERVICE_URL=http://financial-service:3002
SCHEDULE_SERVICE_URL=http://schedule-service:3005
DASHBOARD_SERVICE_URL=http://dashboard-service:3006
ALLOWED_ORIGINS=http://localhost:3000,https://purpose-planner.com
```

### Auth Service (Port 3001)

**Description**: Handles user authentication and authorization.

**Key Features**:
- User registration and login
- JWT token generation and validation
- Password hashing using bcrypt
- Google OAuth integration
- Role-based authorization

**Data Models**:
- User: Basic user information and credentials

**APIs**:
- POST /api/auth/register - Register new user
- POST /api/auth/login - Authenticate user
- GET /api/auth/profile - Get user profile
- POST /api/auth/refresh-token - Refresh JWT token
- GET /api/auth/google - Google OAuth authentication
- GET /api/auth/check - Verify token validity

**Environment Variables**:
```
PORT=3001
MONGODB_URI=mongodb://mongodb:27017/purpose-planner-auth
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=24h
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

### Profile Service (Port 3004)

**Description**: Manages user profile information and preferences.

**Key Features**:
- Profile data management
- Preferences and settings
- Module activation/deactivation
- Profile image upload

**Data Models**:
- Profile: Extended user information
- Preferences: User UI and notification preferences

**APIs**:
- GET /api/profile - Get user profile
- PUT /api/profile - Update profile information
- PUT /api/profile/preferences - Update user preferences
- POST /api/profile/upload-avatar - Upload profile image
- GET /api/profile/modules - Get active modules
- PUT /api/profile/modules - Update active modules

**Environment Variables**:
```
PORT=3004
MONGODB_URI=mongodb://mongodb:27017/purpose-planner-profile
JWT_SECRET=your_jwt_secret
AUTH_SERVICE_URL=http://auth-service:3001
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5000000
```

### Spiritual Service (Port 3003)

**Description**: Manages spiritual growth tracking features.

**Key Features**:
- Prayer requests and answers
- Bible reading plans and tracking
- Journal entries
- Prayer session tracking

**Data Models**:
- Prayer: Prayer requests and their status
- JournalEntry: Spiritual journal entries
- BibleReading: Bible reading records
- PrayerSession: Prayer session time tracking
- ReadingPlan: Bible reading plans

**APIs**:
- GET/POST/PUT/DELETE /api/prayers - Prayer CRUD operations
- GET/POST/PUT/DELETE /api/journal - Journal CRUD operations
- GET/POST/PUT/DELETE /api/bible-reading - Bible reading CRUD operations
- GET/POST/PUT/DELETE /api/prayer-session - Prayer session CRUD operations
- GET /api/spiritual/summary - Get spiritual growth summary

**Environment Variables**:
```
PORT=3003
MONGODB_URI=mongodb://mongodb:27017/purpose-planner-spiritual
JWT_SECRET=your_jwt_secret
AUTH_SERVICE_URL=http://auth-service:3001
```

### Financial Service (Port 3002)

**Description**: Manages financial planning and tracking.

**Key Features**:
- Budget creation and tracking
- Expense management
- Income recording
- Savings goals
- Financial reports

**Data Models**:
- Budget: Budget categories and limits
- Expense: Individual expenses
- Income: Income records
- SavingsGoal: Savings objectives and progress

**APIs**:
- GET/POST/PUT/DELETE /api/budget - Budget CRUD operations
- GET/POST/PUT/DELETE /api/expenses - Expense CRUD operations
- GET/POST/PUT/DELETE /api/income - Income CRUD operations
- GET/POST/PUT/DELETE /api/savings-goals - Savings goals CRUD operations
- GET /api/financial/summary - Get financial summary

**Environment Variables**:
```
PORT=3002
MONGODB_URI=mongodb://mongodb:27017/purpose-planner-financial
JWT_SECRET=your_jwt_secret
AUTH_SERVICE_URL=http://auth-service:3001
```

### Schedule Service (Port 3005)

**Description**: Manages time-block scheduling and events.

**Key Features**:
- Event creation and management
- Recurring events using RRule
- Calendar views (day, week, month)
- Event categorization and prioritization

**Data Models**:
- Event: Calendar events
- RecurringEvent: Template for recurring events

**APIs**:
- GET/POST/PUT/DELETE /api/events - Event CRUD operations
- GET /api/events/today - Get today's events
- GET /api/events/week - Get this week's events
- GET /api/events/month - Get this month's events
- GET/POST/PUT/DELETE /api/events/recurring - Recurring event CRUD operations

**Environment Variables**:
```
PORT=3005
MONGODB_URI=mongodb://mongodb:27017/purpose-planner-schedule
JWT_SECRET=your_jwt_secret
AUTH_SERVICE_URL=http://auth-service:3001
```

### Dashboard Service (Port 3006)

**Description**: Aggregates data for dashboard display.

**Key Features**:
- Dashboard configuration 
- Widget management
- Cross-service data aggregation
- Data caching

**Data Models**:
- Dashboard: Dashboard configuration
- Widget: Widget settings and configuration

**APIs**:
- GET/POST/PUT /api/dashboard - Dashboard CRUD operations
- GET/PUT/DELETE /api/dashboard/widget/:id - Widget operations
- POST /api/dashboard/refresh - Refresh all widgets
- POST /api/dashboard/cache/clear - Clear dashboard cache

**Environment Variables**:
```
PORT=3006
MONGODB_URI=mongodb://mongodb:27017/purpose-planner-dashboard
JWT_SECRET=your_jwt_secret
AUTH_SERVICE_URL=http://auth-service:3001
PROFILE_SERVICE_URL=http://profile-service:3004
SPIRITUAL_SERVICE_URL=http://spiritual-service:3003
FINANCIAL_SERVICE_URL=http://financial-service:3002
SCHEDULE_SERVICE_URL=http://schedule-service:3005
CACHE_TTL=300
```

## Database Schema Design

### User Collection
```javascript
{
  _id: ObjectId,
  email: String,
  password: String, // Hashed
  firstName: String,
  lastName: String,
  role: String,
  googleId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Profile Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  bio: String,
  avatar: String,
  preferences: {
    theme: String,
    notifications: {
      email: Boolean,
      browser: Boolean
    }
  },
  activeModules: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Prayer Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  title: String,
  description: String,
  category: String,
  people: [String],
  isAnswered: Boolean,
  answeredDate: Date,
  answerNotes: String,
  isFavorite: Boolean,
  reminderFrequency: String,
  reminderTime: Date,
  tags: [String],
  isArchived: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Event Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  title: String,
  description: String,
  startTime: Date,
  endTime: Date,
  category: String,
  location: String,
  priority: String,
  isCompleted: Boolean,
  isRecurring: Boolean,
  recurringEventId: ObjectId,
  reminders: [{
    time: Date,
    method: String,
    isSent: Boolean
  }],
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  color: String,
  notes: String,
  isArchived: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Dashboard Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  name: String,
  description: String,
  isDefault: Boolean,
  layout: {
    columns: Number,
    rows: Number
  },
  theme: String,
  widgets: [ObjectId],
  lastAccessed: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## API Response Format

All services maintain a consistent response format:

**Success Response**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Operation-specific data
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information (development mode only)"
}
```

## Deployment Considerations

### Container Orchestration

The services are containerized with Docker and can be deployed using:
- Docker Compose (development)
- Kubernetes (production)
- AWS ECS or Azure Container Instances

### Database Deployment Options

- MongoDB Atlas (managed service)
- Self-hosted MongoDB with replicas
- MongoDB running in containers (development only)

### Scaling Strategies

- Horizontal scaling of stateless services
- Vertical scaling for database
- API Gateway should be horizontally scalable
- Consider Redis for shared caching in production

### Environment-Specific Configuration

**Development**:
- In-memory fallbacks for services
- Local MongoDB instance
- Detailed error messages
- Debug logging

**Production**:
- Proper MongoDB connection with authentication
- Minimal error disclosure
- Info-level logging
- Appropriate rate limits
- SSL/TLS encryption
- Proper CORS configuration

### Monitoring and Logging

- Centralized logging using Winston/ELK Stack
- Application monitoring using Prometheus/Grafana
- Health check endpoints for each service
- API usage metrics

## Security Considerations

### Authentication

- JWTs for authentication between client and API Gateway
- Short JWT expiry with refresh token mechanism
- Secure storage of JWT secret
- Password hashing with bcrypt (min 10 rounds)

### Authorization

- Role-based access control
- Resource ownership validation
- API Gateway handles token validation

### Data Protection

- Input validation using Joi/Express-validator
- NoSQL injection prevention
- XSS protection
- Rate limiting on sensitive endpoints
- HTTPS for all communications in production

### API Security Best Practices

- Hide error details in production
- Use HTTP security headers
- Implement proper CORS configuration
- Validate all client input
- Output sanitization

## Testing Strategy

### Unit Testing

- Service-specific unit tests for business logic
- Repository layer testing with mocked database
- Controller testing with mocked services

### Integration Testing

- API endpoint testing with supertest
- Service-to-service communication testing
- Database integration testing

### Performance Testing

- API throughput testing
- Rate limiting effectiveness
- Caching performance

## Disaster Recovery

### Backup Strategy

- Regular MongoDB backups
- Transaction logs for point-in-time recovery
- Configuration backup

### Failover Procedures

- Service health monitoring
- Automatic container restarts
- Database replica failover

## Maintenance Procedures

### Service Updates

- Blue-green deployment
- Rolling updates for zero downtime
- Version compatibility verification

### Database Maintenance

- Index optimization
- Schema migrations
- Performance monitoring

## Infrastructure as Code

All infrastructure should be defined as code using:
- Docker Compose for local development
- Terraform or CloudFormation for cloud infrastructure
- Kubernetes manifests for container orchestration

## Conclusion

This specification document provides a comprehensive overview of the Purpose Planner microservices architecture. Developers and operators should use this as a reference for understanding the system design, deployment requirements, and operational considerations.