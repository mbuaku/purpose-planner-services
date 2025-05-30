# Purpose Planner Services - System Architecture

## Overview

Purpose Planner is a comprehensive life management platform built using microservices architecture. The system helps users manage their spiritual growth, finances, schedules, and personal goals through a unified, scalable platform.

### Architecture Principles

- **Microservices Design**: Loosely coupled services with clear boundaries
- **Domain-Driven Design**: Services organized around business domains
- **API-First Approach**: Well-defined REST APIs for all service interactions
- **Cloud-Native**: Built for containerized deployment and auto-scaling
- **Security-First**: JWT authentication and authorization across all services

## System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Load Balancer  │    │   API Gateway   │
│   Application   │◄──►│   (NGINX)        │◄──►│   (Port 3000)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                        ┌────────────────────────────────┼────────────────────────────────┐
                        │                                │                                │
                        ▼                                ▼                                ▼
               ┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
               │  Auth Service   │              │ Profile Service │              │Financial Service│
               │   (Port 3001)   │              │   (Port 3004)   │              │   (Port 3002)   │
               └─────────────────┘              └─────────────────┘              └─────────────────┘
                        │                                │                                │
                        ▼                                ▼                                ▼
               ┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
               │Spiritual Service│              │Schedule Service │              │Dashboard Service│
               │   (Port 3003)   │              │   (Port 3005)   │              │   (Port 3006)   │
               └─────────────────┘              └─────────────────┘              └─────────────────┘
                        │                                │                                │
                        └────────────────────────────────┼────────────────────────────────┘
                                                         │
                        ┌────────────────────────────────┼────────────────────────────────┐
                        │                                │                                │
                        ▼                                ▼                                ▼
               ┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
               │    MongoDB      │              │     Redis       │              │   File Storage  │
               │  (Primary DB)   │              │    (Cache)      │              │   (Future)      │
               └─────────────────┘              └─────────────────┘              └─────────────────┘
```

## Service Specifications

### 1. Gateway Service (Port 3000)
**Role**: API Gateway and single entry point for all client requests

**Responsibilities**:
- Request routing to appropriate microservices
- Authentication and authorization
- Rate limiting and throttling
- Request/response transformation
- API documentation aggregation
- CORS handling

**Key Features**:
- JWT token validation
- Service discovery
- Circuit breaker pattern
- Request caching
- API versioning support

### 2. Auth Service (Port 3001)
**Role**: Authentication and authorization management

**Responsibilities**:
- User registration and login
- JWT token generation and validation
- Google OAuth integration
- Password security (hashing, validation)
- User session management
- Role-based access control

**Key Features**:
- bcrypt password hashing
- JWT with configurable expiration
- Google OAuth 2.0 flow
- Refresh token support
- Account verification

### 3. Profile Service (Port 3004)
**Role**: User profile and preferences management

**Responsibilities**:
- User profile CRUD operations
- Personal information management
- Application preferences
- Module-specific settings
- Profile picture management
- Privacy settings

**Key Features**:
- Comprehensive user profiles
- Flexible preferences system
- Profile validation
- Settings synchronization

### 4. Financial Service (Port 3002)
**Role**: Financial management and budgeting

**Responsibilities**:
- Budget creation and management
- Income and expense tracking
- Savings goals management
- Financial reporting
- Category management
- Transaction history

**Key Features**:
- Multiple budget types
- Recurring transaction support
- Savings goals with targets
- Financial analytics
- Export capabilities

### 5. Spiritual Service (Port 3003)
**Role**: Spiritual growth and faith tracking

**Responsibilities**:
- Prayer request management
- Bible reading tracking
- Spiritual journaling
- Prayer session logging
- Reading plan management
- Spiritual milestone tracking

**Key Features**:
- Prayer categories and priorities
- Bible reading plans
- Journal entries with mood tracking
- Prayer session timers
- Spiritual progress analytics

### 6. Schedule Service (Port 3005)
**Role**: Calendar and event management

**Responsibilities**:
- Event creation and management
- Calendar integration
- Recurring event support
- Time-block scheduling
- Reminder management
- Availability tracking

**Key Features**:
- Event types and categories
- Recurring patterns
- Conflict detection
- Integration with other services
- Calendar synchronization

### 7. Dashboard Service (Port 3006)
**Role**: Data aggregation and dashboard management

**Responsibilities**:
- Cross-service data aggregation
- Dashboard widget management
- Personalized insights
- Performance metrics
- Data visualization
- Report generation

**Key Features**:
- Customizable widgets
- Real-time data updates
- Cross-service analytics
- Personalized recommendations
- Export and sharing

## Data Architecture

### Database Strategy
- **Primary Database**: MongoDB 4.4+ for document storage
- **Caching Layer**: Redis for session management and performance
- **Search Engine**: Future integration with Elasticsearch
- **File Storage**: Future integration with cloud storage

### Core Data Models

#### User Schema (Auth Service)
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  googleId: String (optional),
  firstName: String (required),
  lastName: String (required),
  isVerified: Boolean (default: false),
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date
}
```

#### Profile Schema (Profile Service)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (reference to User),
  phoneNumber: String,
  dateOfBirth: Date,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  preferences: {
    theme: String (enum: ['light', 'dark']),
    language: String (default: 'en'),
    notifications: {
      email: Boolean,
      push: Boolean,
      sms: Boolean
    },
    modules: {
      financial: Boolean,
      spiritual: Boolean,
      schedule: Boolean,
      dashboard: Boolean
    }
  },
  profilePicture: String (URL),
  bio: String,
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Budget Schema (Financial Service)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  name: String (required),
  description: String,
  totalAmount: Number (required),
  spentAmount: Number (default: 0),
  remainingAmount: Number (calculated),
  categories: [{
    name: String,
    budgetedAmount: Number,
    spentAmount: Number,
    color: String
  }],
  period: String (enum: ['weekly', 'monthly', 'yearly']),
  startDate: Date,
  endDate: Date,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

#### Prayer Schema (Spiritual Service)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String (required),
  description: String,
  category: String (enum: ['personal', 'family', 'church', 'world', 'thanksgiving']),
  priority: String (enum: ['low', 'medium', 'high']),
  status: String (enum: ['active', 'answered', 'ongoing']),
  isPrivate: Boolean (default: true),
  tags: [String],
  reminderFrequency: String,
  answeredAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Event Schema (Schedule Service)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String (required),
  description: String,
  startTime: Date (required),
  endTime: Date (required),
  location: String,
  type: String (enum: ['personal', 'work', 'spiritual', 'social']),
  category: String,
  isAllDay: Boolean (default: false),
  recurrence: {
    pattern: String (enum: ['none', 'daily', 'weekly', 'monthly', 'yearly']),
    interval: Number,
    endDate: Date,
    daysOfWeek: [Number]
  },
  reminders: [{
    time: Number (minutes before),
    method: String (enum: ['notification', 'email'])
  }],
  attendees: [String],
  status: String (enum: ['scheduled', 'completed', 'cancelled']),
  createdAt: Date,
  updatedAt: Date
}
```

## API Contracts

### Standard Response Format
```javascript
{
  success: Boolean,
  message: String,
  data: Object | Array,
  pagination: {
    page: Number,
    limit: Number,
    total: Number,
    pages: Number
  },
  timestamp: Date
}
```

### Authentication Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/verify/:token
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/google
GET  /api/auth/google/callback
```

### Profile Management
```
GET    /api/profile
PUT    /api/profile
DELETE /api/profile
POST   /api/profile/avatar
GET    /api/profile/preferences
PUT    /api/profile/preferences
```

### Financial Management
```
GET    /api/budgets
POST   /api/budgets
GET    /api/budgets/:id
PUT    /api/budgets/:id
DELETE /api/budgets/:id
GET    /api/expenses
POST   /api/expenses
GET    /api/income
POST   /api/income
GET    /api/savings-goals
POST   /api/savings-goals
```

### Spiritual Management
```
GET    /api/prayers
POST   /api/prayers
PUT    /api/prayers/:id
DELETE /api/prayers/:id
GET    /api/bible-readings
POST   /api/bible-readings
GET    /api/journal-entries
POST   /api/journal-entries
GET    /api/prayer-sessions
POST   /api/prayer-sessions
```

### Schedule Management
```
GET    /api/events
POST   /api/events
GET    /api/events/:id
PUT    /api/events/:id
DELETE /api/events/:id
GET    /api/events/calendar/:year/:month
GET    /api/events/recurring
POST   /api/events/recurring
```

### Dashboard & Analytics
```
GET    /api/dashboard
GET    /api/dashboard/widgets
POST   /api/dashboard/widgets
PUT    /api/dashboard/widgets/:id
DELETE /api/dashboard/widgets/:id
GET    /api/dashboard/analytics/:service
GET    /api/dashboard/reports
```

## Communication Patterns

### Service-to-Service Communication
- **Protocol**: HTTP/REST over internal network
- **Service Discovery**: Environment variables and DNS
- **Timeout Handling**: 30-second timeouts with retries
- **Circuit Breaker**: Implemented in Gateway service
- **Load Balancing**: Round-robin via Kubernetes services

### Authentication Flow
1. Client authenticates with Auth Service
2. Auth Service returns JWT token
3. Client includes JWT in all subsequent requests
4. Gateway validates JWT with Auth Service
5. Valid requests forwarded to target services

### Data Consistency
- **Eventual Consistency**: Accepted for cross-service data
- **Strong Consistency**: Required within individual services
- **Event-Driven Updates**: Future implementation planned
- **Data Synchronization**: Manual triggers for critical operations

## Infrastructure Architecture

### Container Strategy
- **Base Images**: Node.js 16+ Alpine Linux
- **Container Registry**: DockerHub (mbuaku/purpose-planner-services)
- **Resource Limits**: CPU and memory limits defined per service
- **Health Checks**: HTTP endpoints at `/health`

### Kubernetes Deployment
- **Namespaces**: Development and Production isolation
- **Services**: ClusterIP for internal, NodePort for Gateway
- **Ingress**: NGINX controller with SSL termination
- **Persistent Volumes**: StatefulSets for databases
- **Horizontal Pod Autoscaler**: CPU-based scaling

### Networking
- **Service Mesh**: Future consideration for Istio
- **Network Policies**: Pod-to-pod communication rules
- **DNS Resolution**: Kubernetes internal DNS
- **Load Balancing**: Kubernetes service load balancing

### Storage
- **Database Storage**: Persistent volumes for MongoDB
- **Cache Storage**: Persistent volumes for Redis
- **Log Storage**: Future ELK stack integration
- **File Storage**: Future cloud storage integration

## Security Architecture

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with configurable expiration
- **Password Security**: bcrypt hashing with salt rounds
- **OAuth Integration**: Google OAuth 2.0 for social login
- **Role-Based Access**: User and admin roles
- **Session Management**: Redis-based session storage

### API Security
- **HTTPS Enforcement**: SSL/TLS termination at ingress
- **Rate Limiting**: Per-client request throttling
- **CORS Configuration**: Restricted origin policies
- **Input Validation**: Schema validation for all inputs
- **SQL Injection Prevention**: NoSQL with parameterized queries

### Infrastructure Security
- **Network Policies**: Kubernetes network isolation
- **Secrets Management**: Kubernetes secrets for sensitive data
- **RBAC**: Role-based access control for cluster resources
- **Container Security**: Minimal base images, security scanning
- **Monitoring**: Security event logging and alerting

## Monitoring & Observability

### Health Monitoring
- **Health Endpoints**: `/health` for all services
- **Kubernetes Probes**: Liveness and readiness checks
- **Service Status**: Centralized monitoring dashboard
- **Dependency Checks**: Database connectivity verification

### Performance Monitoring
- **Resource Metrics**: CPU, memory, disk usage
- **Response Times**: API endpoint performance tracking
- **Throughput**: Request per second metrics
- **Error Rates**: 4xx and 5xx response monitoring

### Logging Strategy
- **Structured Logging**: JSON format for all services
- **Log Levels**: Debug, Info, Warn, Error
- **Centralized Logging**: Future ELK stack implementation
- **Request Tracing**: Correlation IDs for request tracking

### Alerting
- **Critical Alerts**: Service downtime, high error rates
- **Warning Alerts**: High resource usage, slow responses
- **Notification Channels**: Email, Slack integration
- **Escalation Policies**: Tiered response procedures

## Development & Deployment

### Development Workflow
- **Local Development**: Docker Compose for full stack
- **Testing**: Unit, integration, and end-to-end tests
- **Code Quality**: ESLint, Prettier, SonarQube integration
- **Git Workflow**: Feature branches with pull requests

### CI/CD Pipeline
- **Source Control**: GitHub with webhook triggers
- **Build System**: Jenkins with Docker integration
- **Testing Pipeline**: Automated test execution
- **Deployment**: Blue-green deployment strategy
- **Rollback**: Automated rollback on deployment failures

### Environment Management
- **Development**: Local and staging environments
- **Production**: High-availability production cluster
- **Configuration**: Environment-specific variables
- **Secrets**: Secure secret management across environments

## Performance Considerations

### Caching Strategy
- **Application Cache**: Redis for session and frequently accessed data
- **Database Cache**: MongoDB query result caching
- **HTTP Cache**: Response caching at Gateway level
- **CDN**: Future implementation for static assets

### Database Optimization
- **Indexing**: Strategic indexes for query optimization
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Aggregation pipelines for complex queries
- **Sharding**: Future horizontal scaling strategy

### Resource Management
- **CPU Allocation**: Right-sized containers with limits
- **Memory Management**: Efficient memory usage monitoring
- **Disk I/O**: SSD storage for database performance
- **Network Optimization**: Service mesh for traffic management

## Disaster Recovery

### Backup Strategy
- **Database Backups**: Daily automated MongoDB backups
- **Configuration Backups**: Kubernetes manifest versioning
- **Code Backups**: Git repository with multiple remotes
- **Recovery Testing**: Regular disaster recovery drills

### High Availability
- **Multi-Node Deployment**: Kubernetes cluster resilience
- **Service Redundancy**: Multiple replicas per service
- **Database Clustering**: MongoDB replica sets
- **Load Distribution**: Geographic load balancing

### Business Continuity
- **RTO (Recovery Time Objective)**: 4 hours maximum downtime
- **RPO (Recovery Point Objective)**: 1 hour maximum data loss
- **Failover Procedures**: Automated failover mechanisms
- **Communication Plans**: Stakeholder notification procedures

## Future Considerations

### Scalability Enhancements
- **Microservice Decomposition**: Further service breakdown
- **Event-Driven Architecture**: Asynchronous communication
- **CQRS Implementation**: Command Query Responsibility Segregation
- **Database Sharding**: Horizontal database scaling

### Technology Evolution
- **GraphQL API**: Alternative to REST endpoints
- **Service Mesh**: Istio for advanced traffic management
- **Serverless Functions**: Event-driven compute workloads
- **Machine Learning**: AI-powered insights and recommendations

### Operational Improvements
- **GitOps**: Infrastructure as Code with Git workflows
- **Chaos Engineering**: Resilience testing and improvement
- **Observability**: Distributed tracing and metrics
- **Security Automation**: Automated security scanning and remediation