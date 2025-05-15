# Auth Service API

Base URL: `/api/auth` (via Gateway) or directly at `http://localhost:3001`

## Endpoints

### Register User

Creates a new user account.

- **URL**: `/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "token": "jwt-token-here",
      "user": {
        "id": "user-id",
        "username": "johndoe",
        "email": "john@example.com"
      }
    },
    "message": "User registered successfully"
  }
  ```

### Login

Authenticates a user and returns a JWT token.

- **URL**: `/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "token": "jwt-token-here",
      "user": {
        "id": "user-id",
        "username": "johndoe",
        "email": "john@example.com"
      }
    },
    "message": "Login successful"
  }
  ```

### Verify Token

Verifies if the provided JWT token is valid.

- **URL**: `/verify`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "user-id",
        "username": "johndoe",
        "email": "john@example.com"
      }
    },
    "message": "Token valid"
  }
  ```

### Logout

Invalidates the current JWT token.

- **URL**: `/logout`
- **Method**: `POST`
- **Auth Required**: Yes
- **Success Response**: 
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

### Password Reset Request

Requests a password reset link to be sent to user's email.

- **URL**: `/reset-password`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "john@example.com"
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "message": "Password reset email sent"
  }
  ```

### Change Password

Changes user's password.

- **URL**: `/change-password`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "currentPassword": "oldpassword",
    "newPassword": "newpassword"
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "message": "Password changed successfully"
  }
  ```