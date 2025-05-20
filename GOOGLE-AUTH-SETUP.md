# Setting up Google OAuth Authentication

This guide provides instructions on how to set up Google OAuth authentication for the Purpose Planner application.

## 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add a name (e.g., "Purpose Planner Auth")
7. Add authorized JavaScript origins:
   - https://elitessystems.com
   - https://api.elitessystems.com

8. Add authorized redirect URIs:
   - https://api.elitessystems.com/api/auth/google/callback

9. Click "Create"
10. Note the Client ID and Client Secret

## 2. Update Kubernetes Secrets

Add Google OAuth credentials to your Kubernetes secrets:

```bash
kubectl -n development patch secret app-secrets --type=json -p='[
  {"op": "add", "path": "/data/google-client-id", "value": "'$(echo -n YOUR_GOOGLE_CLIENT_ID | base64)'"},
  {"op": "add", "path": "/data/google-client-secret", "value": "'$(echo -n YOUR_GOOGLE_CLIENT_SECRET | base64)'"}
]'
```

Alternatively, recreate the secrets with all values:

```bash
kubectl -n development create secret generic app-secrets \
  --from-literal=jwt-secret="your-secret-key" \
  --from-literal=mongodb-uri="mongodb://admin:password123@mongodb:27017/purpose-planner?authSource=admin" \
  --from-literal=google-client-id="YOUR_GOOGLE_CLIENT_ID" \
  --from-literal=google-client-secret="YOUR_GOOGLE_CLIENT_SECRET" \
  --dry-run=client -o yaml | kubectl apply -f -
```

## 3. Update Auth Service Deployment

Apply the updated auth service configuration with Google OAuth environment variables:

```bash
kubectl apply -f auth-service-update.yaml
```

## 4. Test the Google Authentication Flow

1. Navigate to your application login page
2. Click the "Login with Google" button
3. You should be redirected to Google's sign-in page
4. After signing in, you should be redirected back to your application and logged in

## Troubleshooting

### Common Issues:

1. **"Error: redirect_uri_mismatch"**
   - Make sure the redirect URI in your Google Cloud Console exactly matches the callback URL
   - It should be: https://api.elitessystems.com/api/auth/google/callback

2. **"Google authentication not configured"**
   - Check if the Google Client ID and Secret are correctly set in the Kubernetes secrets
   - Verify the auth service has restarted and picked up the new environment variables

3. **"The page cannot be found"**
   - Check if the frontend is constructing the correct URL (without duplicate /api segments)
   - Verify the ingress is correctly routing to the auth service

4. **CORS Issues**
   - Ensure the ALLOWED_ORIGINS environment variable includes your frontend domain

## Local Development Setup

For local development, create a `.env` file in the auth-service directory with:

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
CLIENT_REDIRECT_URL=http://localhost:5173/login?token=
```

## Security Considerations

1. Never commit your Google Client Secret to version control
2. Use Kubernetes secrets for sensitive information
3. Implement CSRF protection for the OAuth callback
4. Validate that the email from Google is verified before creating user accounts