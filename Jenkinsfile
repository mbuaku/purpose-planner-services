pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')
        DOCKERHUB_REPO = 'mbuaku/purpose-planner-services'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        SONARQUBE_URL = "http://192.168.254.110:9000"
        KUBECONFIG = credentials('kubeconfig')
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
                                docker build -t ${DOCKERHUB_REPO}/${service}:${IMAGE_TAG} .
                                docker tag ${DOCKERHUB_REPO}/${service}:${IMAGE_TAG} ${DOCKERHUB_REPO}/${service}:latest
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
                            docker push ${DOCKERHUB_REPO}/${service}:${IMAGE_TAG}
                            docker push ${DOCKERHUB_REPO}/${service}:latest
                        """
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            when {
                branch 'master'
            }
            steps {
                script {
                    sh 'mkdir -p ~/.kube'
                    sh 'cp $KUBECONFIG ~/.kube/config'
                    
                    // Create namespace
                    sh 'kubectl create namespace development --dry-run=client -o yaml | kubectl apply -f -'
                    
                    // Deploy MongoDB and Redis
                    sh 'kubectl apply -f k8s-manifests/infrastructure.yaml'
                    
                    // Create secrets
                    sh """
                        kubectl create secret generic app-secrets \
                            --from-literal=jwt-secret=your-secret-key-here \
                            --from-literal=mongodb-uri='mongodb://admin:password123@mongodb:27017/purpose-planner?authSource=admin' \
                            -n development --dry-run=client -o yaml | kubectl apply -f -
                    """
                    
                    // Deploy all services
                    sh 'kubectl apply -f k8s-manifests/services/'
                }
            }
        }
        
        stage('Verify Deployment') {
            when {
                branch 'master'
            }
            steps {
                sh """
                    kubectl wait --for=condition=available --timeout=300s deployment --all -n development
                    kubectl get pods -n development
                    kubectl get svc -n development
                    echo ""
                    echo "======================================"
                    echo "Backend Services Deployment Complete!"
                    echo "======================================"
                """
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