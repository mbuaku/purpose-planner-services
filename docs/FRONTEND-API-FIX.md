# Frontend API URL Fix Guide

## Issue
The frontend application is incorrectly constructing API URLs with duplicate `/api` path segments:
- Incorrect: `https://api.elitessystems.com/api/api/auth/google`
- Correct: `https://api.elitessystems.com/api/auth/google`

This is causing "Endpoint not found" errors when trying to use authentication features.

## Frontend Fix Options

### Option 1: Update API Base URL Configuration

Look for an API configuration file that defines the base URL. This is typically in:
- `src/config/api.js`
- `src/services/api.js`
- `src/utils/api.js`
- `.env` or `.env.production`

You might find code like this:
```javascript
// Before (incorrect)
const API_BASE_URL = 'https://api.elitessystems.com/api/api';

// After (correct)
const API_BASE_URL = 'https://api.elitessystems.com/api';
```

### Option 2: Fix API Service Implementation

If your app uses a service pattern for API calls, find the auth service implementation:

```javascript
// Before (incorrect)
class AuthService {
  login(credentials) {
    return axios.post(`${API_BASE_URL}/api/auth/login`, credentials);
  }
  
  register(userData) {
    return axios.post(`${API_BASE_URL}/api/auth/register`, userData);
  }
  
  // ...other methods
}

// After (correct)
class AuthService {
  login(credentials) {
    return axios.post(`${API_BASE_URL}/auth/login`, credentials);
  }
  
  register(userData) {
    return axios.post(`${API_BASE_URL}/auth/register`, userData);
  }
  
  // ...other methods
}
```

### Option 3: Fix Axios (or Fetch) Configuration

If using Axios with an instance, check the baseURL configuration:

```javascript
// Before (incorrect)
const api = axios.create({
  baseURL: 'https://api.elitessystems.com/api/api',
  timeout: 10000,
  headers: {...}
});

// After (correct)
const api = axios.create({
  baseURL: 'https://api.elitessystems.com/api',
  timeout: 10000,
  headers: {...}
});
```

## Finding the Issue

Use the browser developer tools to help identify where the issue is:

1. Open your application in Chrome/Firefox/Edge
2. Open Developer Tools (F12)
3. Go to the Network tab
4. Try to login or register
5. Look for the failed API requests
6. Right-click on the request > Copy > Copy as fetch/cURL
7. This will show you the exact URL being used

## Common Files to Check

In a React application, check these files:
- `.env` or `.env.production` (environment variables)
- `src/api/index.js` or `src/services/api.js`
- `src/features/auth/authSlice.js` (if using Redux Toolkit)
- `src/contexts/AuthContext.js` (if using Context API)
- Any file with "auth", "api", or "service" in the name

## Deployment After Fix

After making the changes:

1. Rebuild the frontend application:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Deploy the updated build to your hosting service or container

## Testing the Fix

After deployment, verify these endpoints work correctly:
- Login page
- Registration page
- Google OAuth login (if implemented)
- Any other authentication features

Ensure no more "Endpoint not found" errors appear in the browser console.