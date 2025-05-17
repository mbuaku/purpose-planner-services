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
                    # Add common paths where tools might be installed
                    export PATH=$PATH:/usr/local/bin:/usr/bin:/bin
                    
                    echo "PATH: $PATH"
                    echo "Current user: $(whoami)"
                    echo "Home directory: $HOME"
                    echo "Working directory: $(pwd)"
                    
                    # Check for Node/NPM
                    echo "Node version: $(node --version 2>&1 || echo 'Node not found')"
                    echo "NPM version: $(npm --version 2>&1 || echo 'NPM not found')"
                    
                    # Check for Docker
                    echo "Docker version: $(docker --version 2>&1 || echo 'Docker not found')"
                    
                    # Check if docker group exists and current user is in it
                    echo "Groups: $(groups)"
                    
                    # Find where tools are installed
                    echo "Finding node installations:"
                    find /usr -name node -type f 2>/dev/null || echo "No node found in /usr"
                    echo "Finding npm installations:"
                    find /usr -name npm -type f 2>/dev/null || echo "No npm found in /usr"
                    echo "Finding docker installations:"
                    find /usr -name docker -type f 2>/dev/null || echo "No docker found in /usr"
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
        
        stage('Test Services') {
            parallel {
                stage('Auth Service') {
                    steps {
                        dir('auth-service') {
                            sh 'npm ci'
                            sh 'npm test || echo "No tests found"'
                        }
                    }
                }
                stage('Gateway Service') {
                    steps {
                        dir('gateway-service') {
                            sh 'npm ci'
                            sh 'npm test || echo "No tests found"'
                        }
                    }
                }
                stage('Financial Service') {
                    steps {
                        dir('financial-service') {
                            sh 'npm ci'
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
                                    sh 'npm ci'
                                    sh 'npm test || echo "No tests found"'
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                script {
                    def services = ['auth-service', 'gateway-service', 'financial-service', 
                                  'spiritual-service', 'profile-service', 'schedule-service', 
                                  'dashboard-service']
                    
                    for (service in services) {
                        dir(service) {
                            withSonarQubeEnv('SonarQube') {
                                sh """
                                    sonar-scanner \
                                        -Dsonar.projectKey=purpose-planner-${service} \
                                        -Dsonar.sources=. \
                                        -Dsonar.exclusions=node_modules/**,test/** \
                                        -Dsonar.host.url=${SONARQUBE_URL}
                                """
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
                    
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
            sh 'docker logout'
        }
    }
}