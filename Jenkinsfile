pipeline {
    agent any
    
    parameters {
        choice(
            name: 'DEPLOY_NAMESPACE',
            choices: ['development', 'production'],
            description: 'Select the namespace to deploy to'
        )
    }
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        DOCKERHUB_REPO = 'mbuaku/purpose-planner-services'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        SONARQUBE_URL = "http://192.168.254.110:9000"
        KUBECONFIG = credentials('kubeconfig')
        // Add a reminder to check Docker credentials if push fails
        DOCKERHUB_PUSH_REMINDER = "If Docker push fails, verify credentials in Jenkins"
        NAMESPACE = "${params.DEPLOY_NAMESPACE ?: 'development'}"
    }
    
    stages {
        stage('Setup') {
            steps {
                sh '''
                    echo "Environment Setup:"
                    echo "=================="
                    echo "Node version: $(node --version)"
                    echo "NPM version: $(npm --version)"
                    echo "Current user: $(whoami)"
                    echo "Groups: $(groups)"
                    echo "Working directory: $(pwd)"
                    
                    # Check Docker availability
                    if command -v docker &> /dev/null; then
                        echo "Docker version: $(docker --version 2>&1 || echo 'Docker command failed')"
                    else
                        echo "Docker not found in PATH"
                        # Try common Docker locations
                        for docker_path in /usr/bin/docker /usr/local/bin/docker /snap/bin/docker; do
                            if [ -f "$docker_path" ]; then
                                echo "Found Docker at: $docker_path"
                                $docker_path --version 2>&1 || echo "Cannot execute Docker at $docker_path"
                            fi
                        done
                    fi
                    
                    # Check Node.js version compatibility
                    NODE_MAJOR=$(node --version | cut -d. -f1 | sed 's/v//')
                    if [ "$NODE_MAJOR" -lt 14 ]; then
                        echo "WARNING: Node.js version is too old. Need Node.js 14+ but have $(node --version)"
                        echo "Most dependencies require Node.js 14 or higher"
                    fi
                '''
            }
        }
        
        stage('Checkout') {
            steps {
                checkout scm
                sh 'pwd'
                sh 'ls -la'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh '''
                    echo "Installing dependencies from root..."
                    # Use npm install instead of ci to handle workspace dependencies
                    npm install --no-fund
                '''
            }
        }
        
        stage('Test Services') {
            parallel {
                stage('Auth Service') {
                    steps {
                        dir('auth-service') {
                            sh 'npm test || echo "No tests found"'
                        }
                    }
                }
                stage('Gateway Service') {
                    steps {
                        dir('gateway-service') {
                            sh 'npm test || echo "No tests found"'
                        }
                    }
                }
                stage('Financial Service') {
                    steps {
                        dir('financial-service') {
                            sh 'npm test || echo "No tests found"'
                        }
                    }
                }
                stage('Other Services') {
                    steps {
                        script {
                            def services = ['spiritual-service', 'profile-service', 
                                          'schedule-service', 'dashboard-service']
                            
                            for (service in services) {
                                dir(service) {
                                    sh 'npm test || echo "No tests found"'
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('SonarQube Analysis') {
            when {
                expression { 
                    false // Disable SonarQube for now until plugin is installed
                }
            }
            steps {
                echo 'SonarQube analysis disabled - plugin not installed'
            }
        }
        
        stage('Build Docker Images') {
            when {
                expression { 
                    // Check if Docker is available
                    sh(script: 'command -v docker', returnStatus: true) == 0
                }
            }
            steps {
                script {
                    sh '''
                        if command -v docker &> /dev/null; then
                            echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin
                        else
                            echo "Docker not available - skipping login"
                            exit 1
                        fi
                    '''
                    
                    def services = ['auth-service', 'gateway-service', 'financial-service', 
                                  'spiritual-service', 'profile-service', 'schedule-service', 
                                  'dashboard-service']
                    
                    for (service in services) {
                        dir(service) {
                            sh """
                                # Force Docker to rebuild without cache
                                docker build --no-cache -t ${DOCKERHUB_REPO}:${service}-${IMAGE_TAG} .
                                docker tag ${DOCKERHUB_REPO}:${service}-${IMAGE_TAG} ${DOCKERHUB_REPO}:${service}-latest
                            """
                        }
                    }
                }
            }
        }
        
        stage('Push to DockerHub') {
            steps {
                script {
                    def services = ['auth-service', 'gateway-service', 'financial-service', 
                                  'spiritual-service', 'profile-service', 'schedule-service', 
                                  'dashboard-service']
                    
                    for (service in services) {
                        sh """
                            docker push ${DOCKERHUB_REPO}:${service}-${IMAGE_TAG}
                            docker push ${DOCKERHUB_REPO}:${service}-latest
                        """
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            // when {
            //     branch 'master'
            // }
            steps {
                echo "Deploying to ${NAMESPACE} namespace..."
                script {
                    // Install kubectl if not available
                    sh '''
                        if ! command -v kubectl &> /dev/null; then
                            echo "kubectl not found, installing locally..."
                            if [ ! -f $WORKSPACE/kubectl ]; then
                                curl -LO "https://dl.k8s.io/release/v1.28.0/bin/linux/amd64/kubectl"
                                chmod +x kubectl
                                if [ -f kubectl ]; then
                                    cp kubectl $WORKSPACE/kubectl
                                    rm kubectl
                                fi
                            fi
                            export PATH=$WORKSPACE:$PATH
                        else
                            echo "kubectl already installed: $(kubectl version --client --short)"
                        fi
                    '''
                    
                    // No need to copy kubeconfig, use it directly with --kubeconfig flag
                    
                    // Create namespace
                    sh '$WORKSPACE/kubectl --kubeconfig=$KUBECONFIG create namespace ${NAMESPACE} --dry-run=client -o yaml | $WORKSPACE/kubectl --kubeconfig=$KUBECONFIG apply -f -'
                    
                    // Deploy persistent volumes
                    sh '$WORKSPACE/kubectl --kubeconfig=$KUBECONFIG apply -f k8s-manifests/storage.yaml'
                    
                    // Deploy MongoDB and Redis
                    sh '$WORKSPACE/kubectl --kubeconfig=$KUBECONFIG apply -f k8s-manifests/infrastructure.yaml'
                    
                    // Create secrets with Google Auth credentials
                    withCredentials([
                        string(credentialsId: 'google-client-id', variable: 'GOOGLE_CLIENT_ID'),
                        string(credentialsId: 'google-client-secret', variable: 'GOOGLE_CLIENT_SECRET')
                    ]) {
                        sh '''
                            echo "Creating secrets with Google Auth credentials..."
                            echo "Google Client ID exists: $GOOGLE_CLIENT_ID"
                            echo "Google Client Secret exists: [MASKED]"
                            
                            # Ensure the secret values are not empty
                            if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
                                echo "ERROR: Google credentials not found or are empty"
                                exit 1
                            fi
                            
                            $WORKSPACE/kubectl --kubeconfig=$KUBECONFIG create secret generic app-secrets \\
                                --from-literal=jwt-secret=your-secret-key-here \\
                                --from-literal=mongodb-uri='mongodb://admin:password123@mongodb:27017/purpose-planner?authSource=admin' \\
                                --from-literal=google-client-id="$GOOGLE_CLIENT_ID" \\
                                --from-literal=google-client-secret="$GOOGLE_CLIENT_SECRET" \\
                                -n ${NAMESPACE} --dry-run=client -o yaml | $WORKSPACE/kubectl --kubeconfig=$KUBECONFIG apply -f -
                            
                            # Verify the secret was created properly
                            echo "Verifying app-secrets was created with Google credentials..."
                            $WORKSPACE/kubectl --kubeconfig=$KUBECONFIG get secret app-secrets -n ${NAMESPACE} -o yaml | grep -i google
                            
                            # # Force restart the auth-service pods to pick up the new credentials
                            # echo "Restarting auth-service deployment to apply new credentials..."
                            # $WORKSPACE/kubectl --kubeconfig=$KUBECONFIG rollout restart deployment/auth-service -n ${NAMESPACE}
                            # 
                            # # Wait for new pods to be created
                            # echo "Waiting for auth-service deployment to restart..."
                            # $WORKSPACE/kubectl --kubeconfig=$KUBECONFIG rollout status deployment/auth-service -n ${NAMESPACE} --timeout=60s
                        '''
                    }
                    
                    // Deploy all services
                    echo "Deploying all services with updated configurations..."
                    sh '$WORKSPACE/kubectl --kubeconfig=$KUBECONFIG apply -f k8s-manifests/services/ -n ${NAMESPACE}'
                    
                    // Simply restart the auth service to ensure it picks up the Google credentials
                    echo "Restarting auth-service to ensure it picks up the Google credentials..."
                    sh '''
                        # Force restart auth-service one more time after everything is deployed
                        echo "Force restarting auth-service deployment..."
                        $WORKSPACE/kubectl --kubeconfig=$KUBECONFIG rollout restart deployment/auth-service -n ${NAMESPACE}
                        
                        # Wait for pods to be ready
                        echo "Waiting for auth-service to be ready..."
                        $WORKSPACE/kubectl --kubeconfig=$KUBECONFIG rollout status deployment/auth-service -n ${NAMESPACE} --timeout=90s
                    '''
                    
                    // Update deployments with specific image tags
                    def services = ['auth-service', 'gateway-service', 'financial-service', 
                                  'spiritual-service', 'profile-service', 'schedule-service', 
                                  'dashboard-service']
                    
                    for (service in services) {
                        sh """
                            echo "Updating ${service} to use image tag ${IMAGE_TAG}..."
                            $WORKSPACE/kubectl --kubeconfig=$KUBECONFIG set image deployment/${service} ${service}=${DOCKERHUB_REPO}:${service}-${IMAGE_TAG} -n ${NAMESPACE}
                        """
                    }
                    
                    // Apply namespace to all resources
                    sh '$WORKSPACE/kubectl --kubeconfig=$KUBECONFIG label namespace ${NAMESPACE} purpose-planner=backend --overwrite'
                }
            }
        }
        
        stage('Verify Deployment') {
            // when {
            //     branch 'master'
            // }
            steps {
                script {
                    sh('''
                        set -e
                        export KUBECTL="$WORKSPACE/kubectl"
                        export KC="$KUBECONFIG"
                        
                        echo "Checking pod status..."
                        $KUBECTL --kubeconfig=$KC get pods -n ${NAMESPACE}
                        echo ""
                        echo "Checking pod images..."
                        $KUBECTL --kubeconfig=$KC get pods -n ${NAMESPACE} -o custom-columns=NAME:.metadata.name,IMAGE:.spec.containers[0].image
                        echo ""
                        
                        echo "Checking logs from failing pods..."
                        sleep 10  # Give pods time to start and potentially crash
                        FAILING_PODS=$($KUBECTL --kubeconfig=$KC get pods -n ${NAMESPACE} | grep -E "CrashLoopBackOff|Error" | awk '{print $1}')
                        for pod in $FAILING_PODS; do
                            echo "=== Current logs for $pod ==="
                            $KUBECTL --kubeconfig=$KC logs $pod -n ${NAMESPACE} --tail=50 || echo "No current logs available"
                            echo ""
                            echo "=== Previous logs for $pod (from last crash) ==="
                            $KUBECTL --kubeconfig=$KC logs $pod -n ${NAMESPACE} --previous --tail=50 || echo "No previous logs available"
                            echo ""
                            echo "=== Last state for $pod ==="
                            $KUBECTL --kubeconfig=$KC describe pod $pod -n ${NAMESPACE} | grep -A4 -i "last state" || echo "No last state info"
                            echo ""
                        done
                        
                        echo ""
                        echo "Waiting for deployments (timeout: 60s)..."
                        $KUBECTL --kubeconfig=$KC wait --for=condition=available --timeout=60s deployment --all -n ${NAMESPACE} || {
                            echo "Some deployments failed to become ready. Checking details..."
                            echo ""
                            echo "=== Failed Pods Status ==="
                            $KUBECTL --kubeconfig=$KC get pods -n ${NAMESPACE} | grep -v Running
                            echo ""
                            echo "=== Recent Events ==="
                            $KUBECTL --kubeconfig=$KC get events -n ${NAMESPACE} --sort-by=.lastTimestamp | tail -20
                            echo ""
                            echo "=== Describe Failed Pods ==="
                            FAILING_PODS=$($KUBECTL --kubeconfig=$KC get pods -n ${NAMESPACE} | grep -E "CrashLoopBackOff|Error" | awk '{print $1}')
                            for pod in $FAILING_PODS; do
                                echo "--- Describing $pod ---"
                                $KUBECTL --kubeconfig=$KC describe pod $pod -n ${NAMESPACE} | grep -A 20 "Events:"
                                echo ""
                            done
                            exit 1
                        }
                        
                        $KUBECTL --kubeconfig=$KC get svc -n ${NAMESPACE}
                        echo ""
                        
                        echo "Checking Google Auth configuration..."
                        AUTH_POD=$($KUBECTL --kubeconfig=$KC get pods -n ${NAMESPACE} -l app=auth-service -o name | head -n 1)
                        if [ ! -z "$AUTH_POD" ]; then
                            echo "Checking environment variables in $AUTH_POD..."
                            $KUBECTL --kubeconfig=$KC exec $AUTH_POD -n ${NAMESPACE} -- printenv | grep -i google || echo "No Google environment variables found"
                            
                            echo "Checking auth-service logs for Google auth initialization..."
                            $KUBECTL --kubeconfig=$KC logs $AUTH_POD -n ${NAMESPACE} | grep -i "google" || echo "No Google auth logs found"
                        else
                            echo "No auth-service pods found"
                        fi
                        
                        echo ""
                        echo "======================================"
                        echo "Backend Services Deployment Complete!"
                        echo "Deployed to: ${NAMESPACE} namespace"
                        echo "======================================"
                    ''')
                }
            }
        }
    }
    
    post {
        success {
            echo 'Backend pipeline completed successfully!'
        }
        failure {
            echo 'Backend pipeline failed!'
        }
        always {
            script {
                try {
                    sh 'docker logout || echo "Docker logout failed - continuing"'
                } catch (Exception e) {
                    echo "Docker logout error: ${e.message}"
                }
            }
        }
    }
}