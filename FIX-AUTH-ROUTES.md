# Auth Route Fix for Purpose Planner Services

## Issue
The frontend is experiencing "Endpoint not found" errors when accessing URLs like:
- https://api.elitessystems.com/api/api/auth
- https://api.elitessystems.com/api/api/auth/google
- https://api.elitessystems.com/api/api/auth/login
- https://api.elitessystems.com/api/api/auth/register

The issue is caused by incorrect path rewriting in the gateway service's auth routes configuration.

## Changes Made

1. Modified the path rewrite rule in `gateway-service/src/routes/auth.routes.js`:
   - Changed from: `'^/api/auth': '/api/auth'`
   - Changed to: `'^/auth': '/api/auth'`

This change fixes the duplicate `/api` prefix issue when routing auth requests.

## Deployment Instructions

1. **Build and push the updated gateway service image**:
   ```bash
   # Navigate to the gateway service directory
   cd gateway-service

   # Build the image
   docker build -t mbuaku/purpose-planner-services:gateway-service-latest .

   # Push to Docker Hub
   docker push mbuaku/purpose-planner-services:gateway-service-latest
   ```

2. **Apply the updated Kubernetes deployment**:
   ```bash
   # Apply the updated gateway service deployment
   kubectl apply -f k8s-manifests/services/gateway-service-update.yaml
   ```

3. **Force rollout if needed**:
   ```bash
   # Restart the gateway service pods to pick up the new configuration
   kubectl rollout restart deployment gateway-service -n production
   ```

## Testing

After deployment, test the following endpoints to verify they work correctly:
- https://api.elitessystems.com/api/auth
- https://api.elitessystems.com/api/auth/google
- https://api.elitessystems.com/api/auth/login
- https://api.elitessystems.com/api/auth/register

You should no longer see "Endpoint not found" errors.

## Note

This change only affects the path routing in the gateway service. The auth service itself has not been modified and still expects requests at the `/api/auth/*` path.