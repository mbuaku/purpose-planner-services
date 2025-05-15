# Gateway Service API

The Gateway Service acts as the entry point for all client requests and routes them to the appropriate microservices. It provides a unified API interface and handles cross-cutting concerns such as authentication, rate limiting, and request caching.

Base URL: `http://localhost:3000`

## Common Headers

For all authenticated endpoints, include:

```
Authorization: Bearer <jwt-token>
```

## Routes

The Gateway routes requests to the appropriate microservices based on the path prefix:

- `/api/auth/*` → Auth Service
- `/api/financial/*` → Financial Service
- `/api/spiritual/*` → Spiritual Service
- `/api/profile/*` → Profile Service
- `/api/schedule/*` → Schedule Service
- `/api/dashboard/*` → Dashboard Service

## Gateway-Specific Endpoints

### Health Check

Check if all services are available.

- **URL**: `/health`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "services": {
        "auth": "up",
        "financial": "up",
        "spiritual": "up",
        "profile": "up",
        "schedule": "up",
        "dashboard": "up"
      }
    },
    "message": "All services are operational"
  }
  ```

### Service Documentation

Get a list of available services and their documentation links.

- **URL**: `/api-docs`
- **Method**: `GET`
- **Auth Required**: No
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "services": [
        {
          "name": "Auth Service",
          "description": "Authentication and user management",
          "documentation": "/api-docs/auth"
        },
        {
          "name": "Financial Service",
          "description": "Financial management and budgeting",
          "documentation": "/api-docs/financial"
        },
        {
          "name": "Spiritual Service",
          "description": "Spiritual growth tracking",
          "documentation": "/api-docs/spiritual"
        },
        {
          "name": "Profile Service",
          "description": "User profile management",
          "documentation": "/api-docs/profile"
        },
        {
          "name": "Schedule Service",
          "description": "Calendar and event management",
          "documentation": "/api-docs/schedule"
        },
        {
          "name": "Dashboard Service",
          "description": "Aggregated dashboard data",
          "documentation": "/api-docs/dashboard"
        }
      ]
    },
    "message": "Service documentation retrieved successfully"
  }
  ```

## Error Handling

The Gateway provides consistent error handling for all services:

### 400 Bad Request

```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid request parameters"
  }
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource"
  }
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested resource was not found"
  }
}
```

### 429 Too Many Requests

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in {retry-after} seconds",
    "retryAfter": 30
  }
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

### 503 Service Unavailable

```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "The service is currently unavailable",
    "unavailableService": "auth-service"
  }
}
```

## Rate Limiting

The Gateway enforces rate limiting to protect services from abuse:

- Anonymous requests: 60 requests per minute
- Authenticated requests: 300 requests per minute

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1619881200
```

## Caching

The Gateway caches certain responses to improve performance. Cached endpoints include:

- GET `/api/profile/:userId` (2 minutes)
- GET `/api/dashboard/:userId` (5 minutes)
- GET `/api/spiritual/bible-reading/plans` (1 hour)

Cache-Control headers are included in cacheable responses.