# Purpose Planner API Documentation

This directory contains comprehensive documentation for all Purpose Planner microservices.

## Service Documentation

- [Auth Service](auth-service.md) - Authentication and user management
- [Dashboard Service](dashboard-service.md) - Dashboard and widgets
- [Financial Service](financial-service.md) - Budget, expenses, income, and savings goals
- [Gateway Service](gateway-service.md) - API Gateway and routing
- [Profile Service](profile-service.md) - User profiles
- [Schedule Service](schedule-service.md) - Events and scheduling
- [Spiritual Service](spiritual-service.md) - Bible reading, prayers, and journaling

## API Standards

All APIs follow REST principles with consistent response formats:

```json
{
  "success": true,
  "data": {}, 
  "message": "Operation successful"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are obtained through the Auth Service authentication endpoints.