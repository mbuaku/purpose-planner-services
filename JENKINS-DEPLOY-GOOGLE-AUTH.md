# Deploying Google Authentication via Jenkins

Since we don't have direct kubectl access from our local environment, we need to deploy the Google OAuth configuration through the Jenkins pipeline. Follow these steps:

## 1. Update Kubernetes Secrets in the Jenkins Pipeline

Add the following section to your Jenkinsfile right after creating the existing app-secrets:

```groovy
// In the "Deploy to Kubernetes" stage
stage('Deploy to Kubernetes') {
  steps {
    script {
      // Create namespaces...
      
      // Create or update secrets
      sh '''
        ${KUBECTL_CMD} create secret generic app-secrets \
          --from-literal=jwt-secret="your-secret-key" \
          --from-literal=mongodb-uri="mongodb://admin:password123@mongodb:27017/purpose-planner?authSource=admin" \
          --from-literal=google-client-id="617064959975-asctora26rrhr2e2qplqvar8hkauck5m.apps.googleusercontent.com" \
          --from-literal=google-client-secret="YOUR_GOOGLE_CLIENT_SECRET" \
          -n development --dry-run=client -o yaml | ${KUBECTL_CMD} apply -f -
      '''
      
      // Apply configurations...
    }
  }
}
```

> **IMPORTANT SECURITY NOTE**: Replace `YOUR_GOOGLE_CLIENT_SECRET` with the actual client secret value. Consider using Jenkins credentials for sensitive values rather than hardcoding them in the Jenkinsfile.

## 2. Move the Auth Service Update File

Move the `auth-service-update.yaml` file to the k8s-manifests/services directory:

```bash
mv auth-service-update.yaml k8s-manifests/services/auth-service.yaml
```

This will replace the existing auth-service.yaml with the updated version that includes Google OAuth environment variables.

## 3. Trigger a Jenkins Build

Once you've committed and pushed these changes, trigger a new Jenkins build to:
1. Update the app-secrets with Google OAuth credentials
2. Deploy the updated auth service with the Google OAuth environment variables

## 4. Verify Google Authentication

After the deployment completes:

1. Visit your application at https://elitessystems.com
2. Navigate to the login page
3. You should see the "Sign in with Google" option
4. Test the Google login flow
5. Verify that users can successfully log in with their Google accounts

## Troubleshooting

### If Google Authentication Still Shows "Not Configured":

1. Check Jenkins logs to ensure the secrets were properly created
2. Verify the auth service pods were restarted after the configuration change:
   ```bash
   kubectl get pods -n development
   ```
3. Check auth service logs for any errors:
   ```bash
   kubectl logs deployment/auth-service -n development
   ```

### If Redirect URI Mismatch Errors Occur:

Verify in the Google Cloud Console that the authorized redirect URI exactly matches:
```
https://api.elitessystems.com/api/auth/google/callback
```

## Security Reminder

It's recommended to:

1. Reset your Google client secret since it was shared in plain text
2. Use Jenkins credentials system or a dedicated secrets management solution for storing sensitive information
3. Avoid committing secrets to your Git repository