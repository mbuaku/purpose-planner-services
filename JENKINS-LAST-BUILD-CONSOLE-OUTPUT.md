Started by user Cloud Masters Hub
Obtained Jenkinsfile from git https://github.com/mbuaku/purpose-planner-services.git
[Pipeline] Start of Pipeline
[Pipeline] node
Running on Jenkins in /var/lib/jenkins/workspace/purpose-planner-services-backend
[Pipeline] {
[Pipeline] stage
[Pipeline] { (Declarative: Checkout SCM)
[Pipeline] checkout
Selected Git installation does not exist. Using Default
The recommended git tool is: NONE
using credential github-purpose-key
 > git rev-parse --resolve-git-dir /var/lib/jenkins/workspace/purpose-planner-services-backend/.git # timeout=10
Fetching changes from the remote Git repository
 > git config remote.origin.url https://github.com/mbuaku/purpose-planner-services.git # timeout=10
Fetching upstream changes from https://github.com/mbuaku/purpose-planner-services.git
 > git --version # timeout=10
 > git --version # 'git version 2.34.1'
using GIT_ASKPASS to set credentials github purpose key
 > git fetch --tags --force --progress -- https://github.com/mbuaku/purpose-planner-services.git +refs/heads/*:refs/remotes/origin/* # timeout=10
 > git rev-parse refs/remotes/origin/master^{commit} # timeout=10
Checking out Revision ba5d0df88b4d441d4abcd2ab65f7143ff0634d2e (refs/remotes/origin/master)
 > git config core.sparsecheckout # timeout=10
 > git checkout -f ba5d0df88b4d441d4abcd2ab65f7143ff0634d2e # timeout=10
Commit message: "Fix financial service template literal syntax error"
 > git rev-list --no-walk 894ad2a9f232094946a5a7da35709db781fd9416 # timeout=10
[Pipeline] }
[Pipeline] // stage
[Pipeline] withEnv
[Pipeline] {
[Pipeline] withCredentials
Masking supported pattern matches of $DOCKERHUB_CREDENTIALS or $DOCKERHUB_CREDENTIALS_PSW or $KUBECONFIG
[Pipeline] {
[Pipeline] withEnv
[Pipeline] {
[Pipeline] stage
[Pipeline] { (Setup)
[Pipeline] sh
+ echo Environment Setup:
Environment Setup:
+ echo ==================
==================
+ node --version
+ echo Node version: v18.20.8
Node version: v18.20.8
+ npm --version
+ echo NPM version: 10.8.2
NPM version: 10.8.2
+ whoami
+ echo Current user: jenkins
Current user: jenkins
+ groups
+ echo Groups: jenkins docker
Groups: jenkins docker
+ pwd
+ echo Working directory: /var/lib/jenkins/workspace/purpose-planner-services-backend
Working directory: /var/lib/jenkins/workspace/purpose-planner-services-backend
+ 
+ command -v docker
/usr/bin/docker
+ docker --version
+ echo Docker version: Docker version 28.1.1, build 4eba377
Docker version: Docker version 28.1.1, build 4eba377
+ node --version
+ sed s/v//
+ cut -d. -f1
+ NODE_MAJOR=18
+ [ 18 -lt 14 ]
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (Checkout)
[Pipeline] checkout
Selected Git installation does not exist. Using Default
The recommended git tool is: NONE
using credential github-purpose-key
 > git rev-parse --resolve-git-dir /var/lib/jenkins/workspace/purpose-planner-services-backend/.git # timeout=10
Fetching changes from the remote Git repository
 > git config remote.origin.url https://github.com/mbuaku/purpose-planner-services.git # timeout=10
Fetching upstream changes from https://github.com/mbuaku/purpose-planner-services.git
 > git --version # timeout=10
 > git --version # 'git version 2.34.1'
using GIT_ASKPASS to set credentials github purpose key
 > git fetch --tags --force --progress -- https://github.com/mbuaku/purpose-planner-services.git +refs/heads/*:refs/remotes/origin/* # timeout=10
 > git rev-parse refs/remotes/origin/master^{commit} # timeout=10
Checking out Revision ba5d0df88b4d441d4abcd2ab65f7143ff0634d2e (refs/remotes/origin/master)
 > git config core.sparsecheckout # timeout=10
 > git checkout -f ba5d0df88b4d441d4abcd2ab65f7143ff0634d2e # timeout=10
Commit message: "Fix financial service template literal syntax error"
[Pipeline] sh
+ pwd
/var/lib/jenkins/workspace/purpose-planner-services-backend
[Pipeline] sh
+ ls -la
total 49180
drwxr-xr-x  20 jenkins jenkins     4096 May 18 16:30 .
drwxr-xr-x   4 jenkins jenkins     4096 May 17 22:19 ..
drwxr-xr-x   2 jenkins jenkins     4096 May 17 22:28 api-docs
drwxr-xr-x   4 jenkins jenkins     4096 May 18 04:20 auth-service
drwxr-xr-x   2 jenkins jenkins     4096 May 18 16:18 auth-service@tmp
-rw-r--r--   1 jenkins jenkins    12620 May 17 22:28 BACKEND-SPECS.md
-rw-r--r--   1 jenkins jenkins     4386 May 18 14:06 CLAUDE.md
drwxr-xr-x   4 jenkins jenkins     4096 May 18 13:31 dashboard-service
drwxr-xr-x   2 jenkins jenkins     4096 May 18 16:22 dashboard-service@tmp
-rw-r--r--   1 jenkins jenkins     8752 May 18 14:06 DEPLOYMENT-GUIDE.md
-rw-r--r--   1 jenkins jenkins     5588 May 17 22:28 DEPLOYMENT.md
-rw-r--r--   1 jenkins jenkins     2407 May 17 22:28 docker-compose.yml
-rw-r--r--   1 jenkins jenkins      305 May 18 03:43 Dockerfile.jenkins
-rw-r--r--   1 jenkins jenkins      518 May 18 03:43 Dockerfile.template
-rw-r--r--   1 jenkins jenkins      127 May 18 03:43 .dockerignore
drwxr-xr-x   4 jenkins jenkins     4096 May 18 16:30 financial-service
drwxr-xr-x   2 jenkins jenkins     4096 May 18 16:19 financial-service@tmp
-rw-r--r--   1 jenkins jenkins      340 May 17 23:08 fix-jenkins-nodejs.sh
drwxr-xr-x   5 jenkins jenkins     4096 May 18 13:31 gateway-service
drwxr-xr-x   2 jenkins jenkins     4096 May 18 16:19 gateway-service@tmp
drwxr-xr-x   8 jenkins jenkins     4096 May 18 16:30 .git
-rw-r--r--   1 jenkins jenkins      539 May 17 22:28 .gitignore
-rw-r--r--   1 jenkins jenkins      514 May 17 23:04 jenkins-docker-fix.sh
-rw-r--r--   1 jenkins jenkins    14126 May 18 16:17 Jenkinsfile
-rw-r--r--   1 jenkins jenkins     6186 May 18 03:43 Jenkinsfile.docker
-rw-r--r--   1 jenkins jenkins     3202 May 17 23:12 Jenkinsfile.simplified
-rw-r--r--   1 jenkins jenkins      977 May 17 23:00 Jenkinsfile.test
drwxr-xr-x   3 jenkins jenkins     4096 May 18 14:06 k8s-manifests
-rwxr-xr-x   1 jenkins jenkins 49864704 May 18 14:30 kubectl
-rw-r--r--   1 jenkins jenkins     1149 May 17 22:28 Makefile
drwxr-xr-x 460 jenkins jenkins    20480 May 18 16:17 node_modules
-rw-r--r--   1 jenkins jenkins      968 May 17 22:28 package.json
-rw-r--r--   1 jenkins jenkins   272244 May 18 16:30 package-lock.json
drwxr-xr-x   4 jenkins jenkins     4096 May 18 04:20 profile-service
drwxr-xr-x   2 jenkins jenkins     4096 May 18 16:21 profile-service@tmp
-rw-r--r--   1 jenkins jenkins     3845 May 17 22:28 README.md
drwxr-xr-x   4 jenkins jenkins     4096 May 18 13:31 schedule-service
drwxr-xr-x   2 jenkins jenkins     4096 May 18 16:21 schedule-service@tmp
drwxr-xr-x   4 jenkins jenkins     4096 May 18 15:34 spiritual-service
drwxr-xr-x   2 jenkins jenkins     4096 May 18 16:20 spiritual-service@tmp
-rw-r--r--   1 jenkins jenkins     3217 May 17 22:28 WHATS_NEXT.md
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (Install Dependencies)
[Pipeline] sh
+ echo Installing dependencies from root...
Installing dependencies from root...
+ npm install --no-fund

up to date, audited 606 packages in 1s

3 high severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (Test Services)
[Pipeline] parallel
[Pipeline] { (Branch: Auth Service)
[Pipeline] { (Branch: Gateway Service)
[Pipeline] { (Branch: Financial Service)
[Pipeline] { (Branch: Other Services)
[Pipeline] stage
[Pipeline] { (Auth Service)
[Pipeline] stage
[Pipeline] { (Gateway Service)
[Pipeline] stage
[Pipeline] { (Financial Service)
[Pipeline] stage
[Pipeline] { (Other Services)
[Pipeline] dir
Running in /var/lib/jenkins/workspace/purpose-planner-services-backend/auth-service
[Pipeline] {
[Pipeline] dir
Running in /var/lib/jenkins/workspace/purpose-planner-services-backend/gateway-service
[Pipeline] {
[Pipeline] dir
Running in /var/lib/jenkins/workspace/purpose-planner-services-backend/financial-service
[Pipeline] {
[Pipeline] script
[Pipeline] {
[Pipeline] sh
[Pipeline] sh
[Pipeline] sh
[Pipeline] dir
Running in /var/lib/jenkins/workspace/purpose-planner-services-backend/spiritual-service
[Pipeline] {
[Pipeline] sh
+ npm test

> auth-service@1.0.0 test
> jest

+ npm test

> gateway-service@1.0.0 test
> jest

+ npm test

> financial-service@1.0.0 test
> jest

+ npm test

> spiritual-service@1.0.0 test
> jest

PASS tests/unit/auth.service.test.js
  Auth Service
    ✓ placeholder test (1 ms)

PASS tests/integration/auth.api.test.js
  Auth API
    ✓ placeholder test (4 ms)

Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        0.333 s, estimated 1 s
Ran all test suites.
PASS tests/unit/financial.service.test.js
  Financial Service
    ✓ placeholder test (3 ms)

PASS tests/integration/financial.api.test.js
  Financial API
    ✓ placeholder test (2 ms)

Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        0.315 s, estimated 1 s
Ran all test suites.
PASS tests/unit/spiritual.service.test.js
  Spiritual Service
    ✓ placeholder test (1 ms)

PASS tests/integration/spiritual.api.test.js
  Spiritual API
    ✓ placeholder test (1 ms)

Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        0.286 s, estimated 1 s
Ran all test suites.
[Pipeline] }
[Pipeline] // dir
[Pipeline] }
[Pipeline] // stage
[Pipeline] }
[Pipeline] }
[Pipeline] // dir
[Pipeline] }
[Pipeline] // stage
[Pipeline] }
[Pipeline] }
[Pipeline] // dir
PASS tests/unit/auth.middleware.test.js
  Auth Middleware
    verifyToken
      ✓ should return 401 if no token is provided (3 ms)
      ✓ should call next() if token is valid (1 ms)
    isAdmin
      ✓ should call next() if user is admin
      ✓ should return 403 if user is not admin
    hasRole
      ✓ should call next() if user has required role (1 ms)
      ✓ should return 403 if user does not have required role (1 ms)

FAIL tests/integration/gateway.test.js
  ● Test suite failed to run

    Cannot find module 'helmet' from 'tests/integration/gateway.test.js'

    [0m [90m  7 |[39m
     [90m  8 |[39m [90m// Mock helmet to avoid issues in test environment[39m
    [31m[1m>[22m[39m[90m  9 |[39m jest[33m.[39mmock([32m'helmet'[39m[33m,[39m () [33m=>[39m {
     [90m    |[39m      [31m[1m^[22m[39m
     [90m 10 |[39m   [36mreturn[39m jest[33m.[39mfn()[33m.[39mmockImplementation(() [33m=>[39m (req[33m,[39m res[33m,[39m next) [33m=>[39m next())[33m;[39m
     [90m 11 |[39m })[33m;[39m
     [90m 12 |[39m[0m

      at Resolver._throwModNotFoundError (../node_modules/jest-resolve/build/resolver.js:427:11)
      at Object.mock (tests/integration/gateway.test.js:9:6)

Test Suites: 1 failed, 1 passed, 2 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        0.513 s, estimated 1 s
Ran all test suites.
Force exiting Jest: Have you considered using `--detectOpenHandles` to detect async operations that kept running after all tests finished?
+ echo No tests found
No tests found
[Pipeline] }
[Pipeline] dir
Running in /var/lib/jenkins/workspace/purpose-planner-services-backend/profile-service
[Pipeline] {
[Pipeline] // dir
[Pipeline] }
[Pipeline] sh
[Pipeline] // stage
[Pipeline] }
+ npm test

> profile-service@1.0.0 test
> jest

PASS tests/unit/profile.service.test.js
  Profile Service
    ✓ placeholder test (1 ms)

PASS tests/integration/profile.api.test.js
  Profile API
    ✓ placeholder test

Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total
Snapshots:   0 total
Time:        0.165 s, estimated 1 s
Ran all test suites.
[Pipeline] }
[Pipeline] // dir
[Pipeline] dir
Running in /var/lib/jenkins/workspace/purpose-planner-services-backend/schedule-service
[Pipeline] {
[Pipeline] sh
+ npm test

> schedule-service@1.0.0 test
> jest

  console.log
    MongoDB Connection Error: Error: Mock connection failed
        at /var/lib/jenkins/workspace/purpose-planner-services-backend/schedule-service/tests/integration/event.api.test.js:18:42
        at Runtime.requireMock (/var/lib/jenkins/workspace/purpose-planner-services-backend/node_modules/jest-runtime/build/index.js:940:55)
        at Runtime.requireModuleOrMock (/var/lib/jenkins/workspace/purpose-planner-services-backend/node_modules/jest-runtime/build/index.js:1046:21)
        at Object.require (/var/lib/jenkins/workspace/purpose-planner-services-backend/schedule-service/server.js:4:18)
        at Runtime._execModule (/var/lib/jenkins/workspace/purpose-planner-services-backend/node_modules/jest-runtime/build/index.js:1439:24)
        at Runtime._loadModule (/var/lib/jenkins/workspace/purpose-planner-services-backend/node_modules/jest-runtime/build/index.js:1022:12)
        at Runtime.requireModule (/var/lib/jenkins/workspace/purpose-planner-services-backend/node_modules/jest-runtime/build/index.js:882:12)
        at Runtime.requireModuleOrMock (/var/lib/jenkins/workspace/purpose-planner-services-backend/node_modules/jest-runtime/build/index.js:1048:21)
        at Object.require (/var/lib/jenkins/workspace/purpose-planner-services-backend/schedule-service/tests/integration/event.api.test.js:92:13)
        at Runtime._execModule (/var/lib/jenkins/workspace/purpose-planner-services-backend/node_modules/jest-runtime/build/index.js:1439:24)
        at Runtime._loadModule (/var/lib/jenkins/workspace/purpose-planner-services-backend/node_modules/jest-runtime/build/index.js:1022:12)
        at Runtime.requireModule (/var/lib/jenkins/workspace/purpose-planner-services-backend/node_modules/jest-runtime/build/index.js:882:12)
        at jestAdapter (/var/lib/jenkins/workspace/purpose-planner-services-backend/node_modules/jest-circus/build/legacy-code-todo-rewrite/jestAdapter.js:77:13)
        at runTestInternal (/var/lib/jenkins/workspace/purpose-planner-services-backend/node_modules/jest-runner/build/runTest.js:367:16)
        at runTest (/var/lib/jenkins/workspace/purpose-planner-services-backend/node_modules/jest-runner/build/runTest.js:444:34)

      at log (server.js:36:11)

  console.log
    Using in-memory database instead

      at log (server.js:37:11)

PASS tests/integration/event.api.test.js
  Event API
    POST /api/events
      ✓ should create a new event when authenticated (21 ms)
      ✓ should return 401 when not authenticated (5 ms)
    GET /api/events
      ✓ should get all events for the authenticated user (2 ms)
      ✓ should filter events by date range (3 ms)
    GET /api/events/today
      ✓ should get events for the current day (2 ms)

PASS tests/unit/event.service.test.js
  Event Service
    createEvent
      ✓ should create a new event
      ✓ should throw an error if event data is invalid (19 ms)
    getEvents
      ✓ should get all events for a user (1 ms)
      ✓ should filter events by date range
      ✓ should filter events by category (1 ms)
      ✓ should filter events by completion status

Test Suites: 2 passed, 2 total
Tests:       11 passed, 11 total
Snapshots:   0 total
Time:        0.429 s, estimated 1 s
Ran all test suites.
[Pipeline] }
[Pipeline] // dir
[Pipeline] dir
Running in /var/lib/jenkins/workspace/purpose-planner-services-backend/dashboard-service
[Pipeline] {
[Pipeline] sh
+ npm test

> dashboard-service@1.0.0 test
> jest

PASS tests/unit/dashboard.service.test.js
  Dashboard Service
    getUserDashboard
      ✓ should create a default dashboard if none exists (1 ms)
      ✓ should return existing dashboard (1 ms)
    createOrUpdateDashboard
      ✓ should create a new dashboard with widgets (1 ms)
      ✓ should update an existing dashboard

[32minfo[39m: GET /api/dashboard {"ip":"::ffff:127.0.0.1","timestamp":"2025-05-18T16:30:59.440Z","userId":"unauthenticated"}
[32minfo[39m: GET /api/dashboard {"ip":"::ffff:127.0.0.1","timestamp":"2025-05-18T16:30:59.449Z","userId":"unauthenticated"}
[32minfo[39m: POST /api/dashboard {"ip":"::ffff:127.0.0.1","timestamp":"2025-05-18T16:30:59.457Z","userId":"unauthenticated"}
[32minfo[39m: GET /api/dashboard {"ip":"::ffff:127.0.0.1","timestamp":"2025-05-18T16:30:59.462Z","userId":"unauthenticated"}
[32minfo[39m: GET /api/dashboard/widget/widget_1747585859458_0 {"ip":"::ffff:127.0.0.1","timestamp":"2025-05-18T16:30:59.464Z","userId":"unauthenticated"}
error: Spiritual service error: Cannot read properties of undefined (reading 'data') {"timestamp":"2025-05-18T16:30:59.466Z"}
[32minfo[39m: POST /api/dashboard/refresh {"ip":"::ffff:127.0.0.1","timestamp":"2025-05-18T16:30:59.468Z","userId":"unauthenticated"}
info: Retrieved dashboard from cache for user user123 {"timestamp":"2025-05-18T16:30:59.469Z"}
info: Retrieved widget data from cache for spiritual-summary {"timestamp":"2025-05-18T16:30:59.469Z"}
error: Schedule service error: Cannot read properties of undefined (reading 'data') {"timestamp":"2025-05-18T16:30:59.470Z"}
info: Cleared dashboard cache for user user123 {"timestamp":"2025-05-18T16:30:59.470Z"}
PASS tests/integration/dashboard.api.test.js
  Dashboard API
    GET /api/dashboard
      ✓ should get or create a user dashboard when authenticated (21 ms)
      ✓ should return 401 when not authenticated (3 ms)
    POST /api/dashboard
      ✓ should create or update a dashboard when authenticated (11 ms)
    GET /api/dashboard/widget/:id
      ✓ should get widget data when authenticated (6 ms)
    POST /api/dashboard/refresh
      ✓ should refresh all widgets when authenticated (4 ms)

Test Suites: 2 passed, 2 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        1.005 s
Ran all test suites.
[Pipeline] }
[Pipeline] // dir
[Pipeline] }
[Pipeline] // script
[Pipeline] }
[Pipeline] // stage
[Pipeline] }
[Pipeline] // parallel
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (SonarQube Analysis)
Stage "SonarQube Analysis" skipped due to when conditional
[Pipeline] getContext
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (Build Docker Images)
[Pipeline] sh
+ command -v docker
/usr/bin/docker
[Pipeline] script
[Pipeline] {
[Pipeline] sh
+ 
+ command -v docker
/usr/bin/docker
+ docker login -u mbuaku --password-stdin
+ echo ****

WARNING! Your credentials are stored unencrypted in '/var/lib/jenkins/.docker/config.json'.
Configure a credential helper to remove this warning. See
https://docs.docker.com/go/credential-store/

Login Succeeded
[Pipeline] dir
Running in /var/lib/jenkins/workspace/purpose-planner-services-backend/auth-service
[Pipeline] {
[Pipeline] sh
+ docker build --no-cache -t mbuaku/purpose-planner-services:auth-service-34 .
#0 building with "default" instance using docker driver

#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 503B done
#1 DONE 0.0s

#2 [auth] library/node:pull token for registry-1.docker.io
#2 DONE 0.0s

#3 [internal] load metadata for docker.io/library/node:18-alpine
#3 DONE 0.6s

#4 [internal] load .dockerignore
#4 transferring context: 167B done
#4 DONE 0.0s

#5 [1/9] FROM docker.io/library/node:18-alpine@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e
#5 DONE 0.0s

#6 [2/9] WORKDIR /app
#6 CACHED

#7 [internal] load build context
#7 transferring context: 931B done
#7 DONE 0.0s

#8 [3/9] COPY package.json ./
#8 DONE 0.0s

#9 [4/9] COPY package-lock.json* ./
#9 DONE 0.1s

#10 [5/9] RUN npm install --only=production
#10 0.381 npm warn config only Use `--omit=dev` to omit dev dependencies from the install.
#10 27.39 npm warn deprecated are-we-there-yet@2.0.0: This package is no longer supported.
#10 27.42 npm warn deprecated gauge@3.0.2: This package is no longer supported.
#10 27.44 npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
#10 27.44 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
#10 27.58 npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
#10 27.61 npm warn deprecated npmlog@5.0.1: This package is no longer supported.
#10 28.73 
#10 28.73 added 180 packages, and audited 181 packages in 28s
#10 28.73 
#10 28.73 21 packages are looking for funding
#10 28.73   run `npm fund` for details
#10 28.73 
#10 28.73 found 0 vulnerabilities
#10 28.73 npm notice
#10 28.73 npm notice New major version of npm available! 10.8.2 -> 11.4.0
#10 28.73 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.4.0
#10 28.73 npm notice To update run: npm install -g npm@11.4.0
#10 28.73 npm notice
#10 DONE 28.8s

#11 [6/9] COPY . .
#11 DONE 0.1s

#12 [7/9] RUN addgroup -g 1001 -S nodejs
#12 DONE 0.2s

#13 [8/9] RUN adduser -S nodejs -u 1001
#13 DONE 0.2s

#14 [9/9] RUN chown -R nodejs:nodejs /app
#14 DONE 11.8s

#15 exporting to image
#15 exporting layers
#15 exporting layers 0.5s done
#15 writing image sha256:cd0ea6529f7401cca004704e3057a051e675b7b3b351163b5e40d7e9061b15c3 done
#15 naming to docker.io/mbuaku/purpose-planner-services:auth-service-34 done
#15 DONE 0.5s
+ docker tag mbuaku/purpose-planner-services:auth-service-34 mbuaku/purpose-planner-services:auth-service-latest
[Pipeline] }
[Pipeline] // dir
[Pipeline] dir
Running in /var/lib/jenkins/workspace/purpose-planner-services-backend/gateway-service
[Pipeline] {
[Pipeline] sh
+ docker build --no-cache -t mbuaku/purpose-planner-services:gateway-service-34 .
#0 building with "default" instance using docker driver

#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 503B done
#1 DONE 0.0s

#2 [internal] load metadata for docker.io/library/node:18-alpine
#2 DONE 0.3s

#3 [internal] load .dockerignore
#3 transferring context: 167B done
#3 DONE 0.0s

#4 [1/9] FROM docker.io/library/node:18-alpine@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e
#4 DONE 0.0s

#5 [2/9] WORKDIR /app
#5 CACHED

#6 [internal] load build context
#6 transferring context: 1.59kB done
#6 DONE 0.0s

#7 [3/9] COPY package.json ./
#7 DONE 0.1s

#8 [4/9] COPY package-lock.json* ./
#8 DONE 0.1s

#9 [5/9] RUN npm install --only=production
#9 0.246 npm warn config only Use `--omit=dev` to omit dev dependencies from the install.
#9 1.900 
#9 1.900 added 157 packages, and audited 158 packages in 2s
#9 1.900 
#9 1.900 20 packages are looking for funding
#9 1.900   run `npm fund` for details
#9 1.901 
#9 1.901 found 0 vulnerabilities
#9 1.901 npm notice
#9 1.901 npm notice New major version of npm available! 10.8.2 -> 11.4.0
#9 1.901 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.4.0
#9 1.901 npm notice To update run: npm install -g npm@11.4.0
#9 1.901 npm notice
#9 DONE 2.0s

#10 [6/9] COPY . .
#10 DONE 0.1s

#11 [7/9] RUN addgroup -g 1001 -S nodejs
#11 DONE 0.2s

#12 [8/9] RUN adduser -S nodejs -u 1001
#12 DONE 0.2s

#13 [9/9] RUN chown -R nodejs:nodejs /app
#13 DONE 15.1s

#14 exporting to image
#14 exporting layers
#14 exporting layers 0.3s done
#14 writing image sha256:e433b5685f7b123b1c6f67d2b2ae6cf1daa3d44bea8d6973089db74a846e56b4 done
#14 naming to docker.io/mbuaku/purpose-planner-services:gateway-service-34 0.0s done
#14 DONE 0.4s
+ docker tag mbuaku/purpose-planner-services:gateway-service-34 mbuaku/purpose-planner-services:gateway-service-latest
[Pipeline] }
[Pipeline] // dir
[Pipeline] dir
Running in /var/lib/jenkins/workspace/purpose-planner-services-backend/financial-service
[Pipeline] {
[Pipeline] sh
+ docker build --no-cache -t mbuaku/purpose-planner-services:financial-service-34 .
#0 building with "default" instance using docker driver

#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 503B done
#1 DONE 0.0s

#2 [internal] load metadata for docker.io/library/node:18-alpine
#2 DONE 0.4s

#3 [internal] load .dockerignore
#3 transferring context: 167B done
#3 DONE 0.0s

#4 [1/9] FROM docker.io/library/node:18-alpine@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e
#4 DONE 0.0s

#5 [2/9] WORKDIR /app
#5 CACHED

#6 [internal] load build context
#6 transferring context: 32.42kB done
#6 DONE 0.0s

#7 [3/9] COPY package.json ./
#7 DONE 0.0s

#8 [4/9] COPY package-lock.json* ./
#8 DONE 0.0s

#9 [5/9] RUN npm install --only=production
#9 0.227 npm warn config only Use `--omit=dev` to omit dev dependencies from the install.
#9 29.13 
#9 29.13 added 140 packages, and audited 141 packages in 29s
#9 29.13 
#9 29.13 19 packages are looking for funding
#9 29.13   run `npm fund` for details
#9 29.13 
#9 29.13 found 0 vulnerabilities
#9 29.13 npm notice
#9 29.13 npm notice New major version of npm available! 10.8.2 -> 11.4.0
#9 29.13 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.4.0
#9 29.13 npm notice To update run: npm install -g npm@11.4.0
#9 29.13 npm notice
#9 DONE 29.2s

#10 [6/9] COPY . .
#10 DONE 0.1s

#11 [7/9] RUN addgroup -g 1001 -S nodejs
#11 DONE 0.2s

#12 [8/9] RUN adduser -S nodejs -u 1001
#12 DONE 0.2s

#13 [9/9] RUN chown -R nodejs:nodejs /app
#13 DONE 11.1s

#14 exporting to image
#14 exporting layers
#14 exporting layers 0.6s done
#14 writing image sha256:1fbb932ac1571c2d9f7b8bf671f8379dcfba807ea9b96cf1c643640bfb58dd89 done
#14 naming to docker.io/mbuaku/purpose-planner-services:financial-service-34 done
#14 DONE 0.6s
+ docker tag mbuaku/purpose-planner-services:financial-service-34 mbuaku/purpose-planner-services:financial-service-latest
[Pipeline] }
[Pipeline] // dir
[Pipeline] dir
Running in /var/lib/jenkins/workspace/purpose-planner-services-backend/spiritual-service
[Pipeline] {
[Pipeline] sh
+ docker build --no-cache -t mbuaku/purpose-planner-services:spiritual-service-34 .
#0 building with "default" instance using docker driver

#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 503B done
#1 DONE 0.0s

#2 [internal] load metadata for docker.io/library/node:18-alpine
#2 DONE 0.4s

#3 [internal] load .dockerignore
#3 transferring context: 167B done
#3 DONE 0.0s

#4 [1/9] FROM docker.io/library/node:18-alpine@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e
#4 DONE 0.0s

#5 [2/9] WORKDIR /app
#5 CACHED

#6 [internal] load build context
#6 transferring context: 1.52kB done
#6 DONE 0.0s

#7 [3/9] COPY package.json ./
#7 DONE 0.1s

#8 [4/9] COPY package-lock.json* ./
#8 DONE 0.0s

#9 [5/9] RUN npm install --only=production
#9 0.223 npm warn config only Use `--omit=dev` to omit dev dependencies from the install.
#9 26.28 
#9 26.28 added 140 packages, and audited 141 packages in 26s
#9 26.28 
#9 26.28 19 packages are looking for funding
#9 26.28   run `npm fund` for details
#9 26.29 
#9 26.29 found 0 vulnerabilities
#9 26.29 npm notice
#9 26.29 npm notice New major version of npm available! 10.8.2 -> 11.4.0
#9 26.29 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.4.0
#9 26.29 npm notice To update run: npm install -g npm@11.4.0
#9 26.29 npm notice
#9 DONE 26.4s

#10 [6/9] COPY . .
#10 DONE 0.1s

#11 [7/9] RUN addgroup -g 1001 -S nodejs
#11 DONE 0.2s

#12 [8/9] RUN adduser -S nodejs -u 1001
#12 DONE 0.2s

#13 [9/9] RUN chown -R nodejs:nodejs /app
#13 DONE 10.5s

#14 exporting to image
#14 exporting layers
#14 exporting layers 0.5s done
#14 writing image sha256:04eafdcc058767b2e1707674353223dcbe876caa8595416cdd36379af738b023
#14 writing image sha256:04eafdcc058767b2e1707674353223dcbe876caa8595416cdd36379af738b023 done
#14 naming to docker.io/mbuaku/purpose-planner-services:spiritual-service-34 done
#14 DONE 0.6s
+ docker tag mbuaku/purpose-planner-services:spiritual-service-34 mbuaku/purpose-planner-services:spiritual-service-latest
[Pipeline] }
[Pipeline] // dir
[Pipeline] dir
Running in /var/lib/jenkins/workspace/purpose-planner-services-backend/profile-service
[Pipeline] {
[Pipeline] sh
+ docker build --no-cache -t mbuaku/purpose-planner-services:profile-service-34 .
#0 building with "default" instance using docker driver

#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 503B done
#1 DONE 0.0s

#2 [internal] load metadata for docker.io/library/node:18-alpine
#2 DONE 0.4s

#3 [internal] load .dockerignore
#3 transferring context: 167B done
#3 DONE 0.0s

#4 [1/9] FROM docker.io/library/node:18-alpine@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e
#4 DONE 0.0s

#5 [2/9] WORKDIR /app
#5 CACHED

#6 [internal] load build context
#6 transferring context: 801B done
#6 DONE 0.0s

#7 [3/9] COPY package.json ./
#7 DONE 0.0s

#8 [4/9] COPY package-lock.json* ./
#8 DONE 0.0s

#9 [5/9] RUN npm install --only=production
#9 0.242 npm warn config only Use `--omit=dev` to omit dev dependencies from the install.
#9 25.85 
#9 25.85 added 154 packages, and audited 155 packages in 26s
#9 25.85 
#9 25.85 21 packages are looking for funding
#9 25.85   run `npm fund` for details
#9 25.85 
#9 25.85 found 0 vulnerabilities
#9 25.85 npm notice
#9 25.85 npm notice New major version of npm available! 10.8.2 -> 11.4.0
#9 25.85 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.4.0
#9 25.85 npm notice To update run: npm install -g npm@11.4.0
#9 25.85 npm notice
#9 DONE 25.9s

#10 [6/9] COPY . .
#10 DONE 0.1s

#11 [7/9] RUN addgroup -g 1001 -S nodejs
#11 DONE 0.2s

#12 [8/9] RUN adduser -S nodejs -u 1001
#12 DONE 0.2s

#13 [9/9] RUN chown -R nodejs:nodejs /app
#13 DONE 11.6s

#14 exporting to image
#14 exporting layers
#14 exporting layers 0.6s done
#14 writing image sha256:735cff2cf6865868d931bc2d9ea5404f5bf4d9aefd681c928aecc0cae3c756b0 done
#14 naming to docker.io/mbuaku/purpose-planner-services:profile-service-34 0.0s done
#14 DONE 0.6s
+ docker tag mbuaku/purpose-planner-services:profile-service-34 mbuaku/purpose-planner-services:profile-service-latest
[Pipeline] }
[Pipeline] // dir
[Pipeline] dir
Running in /var/lib/jenkins/workspace/purpose-planner-services-backend/schedule-service
[Pipeline] {
[Pipeline] sh
+ docker build --no-cache -t mbuaku/purpose-planner-services:schedule-service-34 .
#0 building with "default" instance using docker driver

#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 503B done
#1 DONE 0.0s

#2 [internal] load metadata for docker.io/library/node:18-alpine
#2 DONE 0.3s

#3 [internal] load .dockerignore
#3 transferring context: 167B done
#3 DONE 0.0s

#4 [1/9] FROM docker.io/library/node:18-alpine@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e
#4 DONE 0.0s

#5 [2/9] WORKDIR /app
#5 CACHED

#6 [internal] load build context
#6 transferring context: 878B done
#6 DONE 0.0s

#7 [3/9] COPY package.json ./
#7 DONE 0.0s

#8 [4/9] COPY package-lock.json* ./
#8 DONE 0.0s

#9 [5/9] RUN npm install --only=production
#9 0.232 npm warn config only Use `--omit=dev` to omit dev dependencies from the install.
#9 21.99 
#9 21.99 added 125 packages, and audited 126 packages in 22s
#9 21.99 
#9 21.99 18 packages are looking for funding
#9 21.99   run `npm fund` for details
#9 21.99 
#9 21.99 found 0 vulnerabilities
#9 21.99 npm notice
#9 21.99 npm notice New major version of npm available! 10.8.2 -> 11.4.0
#9 21.99 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.4.0
#9 21.99 npm notice To update run: npm install -g npm@11.4.0
#9 21.99 npm notice
#9 DONE 22.1s

#10 [6/9] COPY . .
#10 DONE 0.1s

#11 [7/9] RUN addgroup -g 1001 -S nodejs
#11 DONE 0.2s

#12 [8/9] RUN adduser -S nodejs -u 1001
#12 DONE 0.2s

#13 [9/9] RUN chown -R nodejs:nodejs /app
#13 DONE 13.5s

#14 exporting to image
#14 exporting layers
#14 exporting layers 0.6s done
#14 writing image sha256:50b153ddde42640ee08bf613652aff2ab570192fa644a67a77280edaafaca473 done
#14 naming to docker.io/mbuaku/purpose-planner-services:schedule-service-34 0.0s done
#14 DONE 0.6s
+ docker tag mbuaku/purpose-planner-services:schedule-service-34 mbuaku/purpose-planner-services:schedule-service-latest
[Pipeline] }
[Pipeline] // dir
[Pipeline] dir
Running in /var/lib/jenkins/workspace/purpose-planner-services-backend/dashboard-service
[Pipeline] {
[Pipeline] sh
+ docker build --no-cache -t mbuaku/purpose-planner-services:dashboard-service-34 .
#0 building with "default" instance using docker driver

#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 503B done
#1 DONE 0.0s

#2 [internal] load metadata for docker.io/library/node:18-alpine
#2 DONE 0.3s

#3 [internal] load .dockerignore
#3 transferring context: 167B done
#3 DONE 0.0s

#4 [1/9] FROM docker.io/library/node:18-alpine@sha256:8d6421d663b4c28fd3ebc498332f249011d118945588d0a35cb9bc4b8ca09d9e
#4 DONE 0.0s

#5 [2/9] WORKDIR /app
#5 CACHED

#6 [internal] load build context
#6 transferring context: 949B done
#6 DONE 0.0s

#7 [3/9] COPY package.json ./
#7 DONE 0.0s

#8 [4/9] COPY package-lock.json* ./
#8 DONE 0.0s

#9 [5/9] RUN npm install --only=production
#9 0.244 npm warn config only Use `--omit=dev` to omit dev dependencies from the install.
#9 25.85 
#9 25.85 added 164 packages, and audited 165 packages in 26s
#9 25.85 
#9 25.85 19 packages are looking for funding
#9 25.85   run `npm fund` for details
#9 25.85 
#9 25.85 found 0 vulnerabilities
#9 25.85 npm notice
#9 25.85 npm notice New major version of npm available! 10.8.2 -> 11.4.0
#9 25.85 npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.4.0
#9 25.85 npm notice To update run: npm install -g npm@11.4.0
#9 25.85 npm notice
#9 DONE 26.0s

#10 [6/9] COPY . .
#10 DONE 0.1s

#11 [7/9] RUN addgroup -g 1001 -S nodejs
#11 DONE 0.2s

#12 [8/9] RUN adduser -S nodejs -u 1001
#12 DONE 0.2s

#13 [9/9] RUN chown -R nodejs:nodejs /app
#13 DONE 18.2s

#14 exporting to image
#14 exporting layers
#14 exporting layers 0.7s done
#14 writing image sha256:29899648e82366662ef6ba3bd54df97fd2d659913f7160fcb45af149a225fd3b done
#14 naming to docker.io/mbuaku/purpose-planner-services:dashboard-service-34 done
#14 DONE 0.7s
+ docker tag mbuaku/purpose-planner-services:dashboard-service-34 mbuaku/purpose-planner-services:dashboard-service-latest
[Pipeline] }
[Pipeline] // dir
[Pipeline] }
[Pipeline] // script
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (Push to DockerHub)
[Pipeline] script
[Pipeline] {
[Pipeline] sh
+ docker push mbuaku/purpose-planner-services:auth-service-34
The push refers to repository [docker.io/mbuaku/purpose-planner-services]
218e0abeb631: Preparing
d9676cc65256: Preparing
af96b1ba98a9: Preparing
e93f554c7b4a: Preparing
9a535e978f9b: Preparing
5f70bf18a086: Preparing
d5e484217808: Preparing
5cc355a88ecc: Preparing
82140d9a70a7: Preparing
f3b40b0cdb1c: Preparing
0b1f26057bd0: Preparing
08000c18d16d: Preparing
d5e484217808: Waiting
5cc355a88ecc: Waiting
82140d9a70a7: Waiting
f3b40b0cdb1c: Waiting
0b1f26057bd0: Waiting
08000c18d16d: Waiting
5f70bf18a086: Waiting
e93f554c7b4a: Layer already exists
5f70bf18a086: Layer already exists
af96b1ba98a9: Pushed
d9676cc65256: Pushed
5cc355a88ecc: Layer already exists
82140d9a70a7: Layer already exists
f3b40b0cdb1c: Layer already exists
0b1f26057bd0: Layer already exists
218e0abeb631: Pushed
d5e484217808: Pushed
08000c18d16d: Layer already exists
9a535e978f9b: Pushed
auth-service-34: digest: sha256:6588bce86dc67de87600c7fb5fd915b13463e7e375d91fc5798b293d30cea109 size: 2823
+ docker push mbuaku/purpose-planner-services:auth-service-latest
The push refers to repository [docker.io/mbuaku/purpose-planner-services]
218e0abeb631: Preparing
d9676cc65256: Preparing
af96b1ba98a9: Preparing
e93f554c7b4a: Preparing
9a535e978f9b: Preparing
5f70bf18a086: Preparing
d5e484217808: Preparing
5cc355a88ecc: Preparing
82140d9a70a7: Preparing
f3b40b0cdb1c: Preparing
0b1f26057bd0: Preparing
08000c18d16d: Preparing
d5e484217808: Waiting
5cc355a88ecc: Waiting
82140d9a70a7: Waiting
f3b40b0cdb1c: Waiting
0b1f26057bd0: Waiting
08000c18d16d: Waiting
5f70bf18a086: Waiting
e93f554c7b4a: Layer already exists
218e0abeb631: Layer already exists
af96b1ba98a9: Layer already exists
9a535e978f9b: Layer already exists
d9676cc65256: Layer already exists
5f70bf18a086: Layer already exists
5cc355a88ecc: Layer already exists
82140d9a70a7: Layer already exists
d5e484217808: Layer already exists
f3b40b0cdb1c: Layer already exists
0b1f26057bd0: Layer already exists
08000c18d16d: Layer already exists
auth-service-latest: digest: sha256:6588bce86dc67de87600c7fb5fd915b13463e7e375d91fc5798b293d30cea109 size: 2823
[Pipeline] sh
+ docker push mbuaku/purpose-planner-services:gateway-service-34
The push refers to repository [docker.io/mbuaku/purpose-planner-services]
f84050b3c4bc: Preparing
04536dbd9d51: Preparing
9042d47f418a: Preparing
7750ffdb990a: Preparing
615bd3845757: Preparing
1563612d95f8: Preparing
0bd222105749: Preparing
5cc355a88ecc: Preparing
82140d9a70a7: Preparing
f3b40b0cdb1c: Preparing
0b1f26057bd0: Preparing
08000c18d16d: Preparing
1563612d95f8: Waiting
0bd222105749: Waiting
5cc355a88ecc: Waiting
82140d9a70a7: Waiting
f3b40b0cdb1c: Waiting
0b1f26057bd0: Waiting
08000c18d16d: Waiting
7750ffdb990a: Layer already exists
04536dbd9d51: Pushed
9042d47f418a: Pushed
1563612d95f8: Pushed
5cc355a88ecc: Layer already exists
82140d9a70a7: Layer already exists
f84050b3c4bc: Pushed
f3b40b0cdb1c: Layer already exists
615bd3845757: Pushed
0b1f26057bd0: Layer already exists
08000c18d16d: Layer already exists
0bd222105749: Pushed
gateway-service-34: digest: sha256:a39722bac257fa6d873c00169de880dc6b9e7cf18cb3a415f6b5dbc74adf93a3 size: 2825
+ docker push mbuaku/purpose-planner-services:gateway-service-latest
The push refers to repository [docker.io/mbuaku/purpose-planner-services]
f84050b3c4bc: Preparing
04536dbd9d51: Preparing
9042d47f418a: Preparing
7750ffdb990a: Preparing
615bd3845757: Preparing
1563612d95f8: Preparing
0bd222105749: Preparing
5cc355a88ecc: Preparing
82140d9a70a7: Preparing
f3b40b0cdb1c: Preparing
0b1f26057bd0: Preparing
08000c18d16d: Preparing
0bd222105749: Waiting
5cc355a88ecc: Waiting
82140d9a70a7: Waiting
f3b40b0cdb1c: Waiting
0b1f26057bd0: Waiting
08000c18d16d: Waiting
1563612d95f8: Waiting
7750ffdb990a: Layer already exists
f84050b3c4bc: Layer already exists
615bd3845757: Layer already exists
04536dbd9d51: Layer already exists
9042d47f418a: Layer already exists
5cc355a88ecc: Layer already exists
82140d9a70a7: Layer already exists
f3b40b0cdb1c: Layer already exists
1563612d95f8: Layer already exists
0bd222105749: Layer already exists
0b1f26057bd0: Layer already exists
08000c18d16d: Layer already exists
gateway-service-latest: digest: sha256:a39722bac257fa6d873c00169de880dc6b9e7cf18cb3a415f6b5dbc74adf93a3 size: 2825
[Pipeline] sh
+ docker push mbuaku/purpose-planner-services:financial-service-34
The push refers to repository [docker.io/mbuaku/purpose-planner-services]
b3af70d5b78b: Preparing
d0921c867f83: Preparing
53e97699106e: Preparing
78ae50940b9a: Preparing
3eb2b8fc1d90: Preparing
5f70bf18a086: Preparing
62bc192afb40: Preparing
5cc355a88ecc: Preparing
82140d9a70a7: Preparing
5f70bf18a086: Waiting
62bc192afb40: Waiting
5cc355a88ecc: Waiting
f3b40b0cdb1c: Preparing
0b1f26057bd0: Preparing
08000c18d16d: Preparing
82140d9a70a7: Waiting
f3b40b0cdb1c: Waiting
0b1f26057bd0: Waiting
08000c18d16d: Waiting
53e97699106e: Pushed
78ae50940b9a: Pushed
d0921c867f83: Pushed
5f70bf18a086: Layer already exists
5cc355a88ecc: Layer already exists
82140d9a70a7: Layer already exists
f3b40b0cdb1c: Layer already exists
0b1f26057bd0: Layer already exists
b3af70d5b78b: Pushed
08000c18d16d: Layer already exists
62bc192afb40: Pushed
3eb2b8fc1d90: Pushed
financial-service-34: digest: sha256:624dd95b55a77a6723be6788662b0def0d304f19ad56df9d492ae896bb3a0533 size: 2823
+ docker push mbuaku/purpose-planner-services:financial-service-latest
The push refers to repository [docker.io/mbuaku/purpose-planner-services]
b3af70d5b78b: Preparing
d0921c867f83: Preparing
53e97699106e: Preparing
78ae50940b9a: Preparing
3eb2b8fc1d90: Preparing
5f70bf18a086: Preparing
62bc192afb40: Preparing
5cc355a88ecc: Preparing
82140d9a70a7: Preparing
f3b40b0cdb1c: Preparing
0b1f26057bd0: Preparing
08000c18d16d: Preparing
5f70bf18a086: Waiting
62bc192afb40: Waiting
5cc355a88ecc: Waiting
82140d9a70a7: Waiting
f3b40b0cdb1c: Waiting
0b1f26057bd0: Waiting
08000c18d16d: Waiting
b3af70d5b78b: Layer already exists
d0921c867f83: Layer already exists
53e97699106e: Layer already exists
78ae50940b9a: Layer already exists
3eb2b8fc1d90: Layer already exists
5f70bf18a086: Layer already exists
5cc355a88ecc: Layer already exists
82140d9a70a7: Layer already exists
f3b40b0cdb1c: Layer already exists
62bc192afb40: Layer already exists
0b1f26057bd0: Layer already exists
08000c18d16d: Layer already exists
financial-service-latest: digest: sha256:624dd95b55a77a6723be6788662b0def0d304f19ad56df9d492ae896bb3a0533 size: 2823
[Pipeline] sh
+ docker push mbuaku/purpose-planner-services:spiritual-service-34
The push refers to repository [docker.io/mbuaku/purpose-planner-services]
0c4f964169fd: Preparing
80d478c34082: Preparing
c3e9e3b07cfa: Preparing
a2ffae1d88ad: Preparing
16d038362405: Preparing
5f70bf18a086: Preparing
c7bb5275c77f: Preparing
5cc355a88ecc: Preparing
82140d9a70a7: Preparing
f3b40b0cdb1c: Preparing
0b1f26057bd0: Preparing
08000c18d16d: Preparing
5cc355a88ecc: Waiting
82140d9a70a7: Waiting
f3b40b0cdb1c: Waiting
0b1f26057bd0: Waiting
08000c18d16d: Waiting
5f70bf18a086: Waiting
c7bb5275c77f: Waiting
a2ffae1d88ad: Layer already exists
5f70bf18a086: Layer already exists
80d478c34082: Pushed
c3e9e3b07cfa: Pushed
5cc355a88ecc: Layer already exists
82140d9a70a7: Layer already exists
f3b40b0cdb1c: Layer already exists
0b1f26057bd0: Layer already exists
0c4f964169fd: Pushed
c7bb5275c77f: Pushed
08000c18d16d: Layer already exists
16d038362405: Pushed
spiritual-service-34: digest: sha256:24065c7b4e9355bf39e2df5fc236907c8ee7494e6f299c3d37b86ca9642c8304 size: 2823
+ docker push mbuaku/purpose-planner-services:spiritual-service-latest
The push refers to repository [docker.io/mbuaku/purpose-planner-services]
0c4f964169fd: Preparing
80d478c34082: Preparing
c3e9e3b07cfa: Preparing
a2ffae1d88ad: Preparing
16d038362405: Preparing
5f70bf18a086: Preparing
c7bb5275c77f: Preparing
5cc355a88ecc: Preparing
82140d9a70a7: Preparing
f3b40b0cdb1c: Preparing
0b1f26057bd0: Preparing
08000c18d16d: Preparing
5f70bf18a086: Waiting
c7bb5275c77f: Waiting
5cc355a88ecc: Waiting
82140d9a70a7: Waiting
f3b40b0cdb1c: Waiting
0b1f26057bd0: Waiting
08000c18d16d: Waiting
a2ffae1d88ad: Layer already exists
c3e9e3b07cfa: Layer already exists
80d478c34082: Layer already exists
16d038362405: Layer already exists
0c4f964169fd: Layer already exists
5f70bf18a086: Layer already exists
5cc355a88ecc: Layer already exists
82140d9a70a7: Layer already exists
f3b40b0cdb1c: Layer already exists
c7bb5275c77f: Layer already exists
08000c18d16d: Layer already exists
0b1f26057bd0: Layer already exists
spiritual-service-latest: digest: sha256:24065c7b4e9355bf39e2df5fc236907c8ee7494e6f299c3d37b86ca9642c8304 size: 2823
[Pipeline] sh
+ docker push mbuaku/purpose-planner-services:profile-service-34
The push refers to repository [docker.io/mbuaku/purpose-planner-services]
3bf71621080b: Preparing
17d81f0b4bce: Preparing
c5b70bfb6729: Preparing
a5c38abcbd09: Preparing
94cd80ac5701: Preparing
5f70bf18a086: Preparing
a4025bf6d4b0: Preparing
5cc355a88ecc: Preparing
82140d9a70a7: Preparing
f3b40b0cdb1c: Preparing
0b1f26057bd0: Preparing
08000c18d16d: Preparing
a4025bf6d4b0: Waiting
5cc355a88ecc: Waiting
82140d9a70a7: Waiting
f3b40b0cdb1c: Waiting
0b1f26057bd0: Waiting
08000c18d16d: Waiting
5f70bf18a086: Waiting
a5c38abcbd09: Layer already exists
5f70bf18a086: Layer already exists
c5b70bfb6729: Pushed
17d81f0b4bce: Pushed
5cc355a88ecc: Layer already exists
82140d9a70a7: Layer already exists
a4025bf6d4b0: Pushed
f3b40b0cdb1c: Layer already exists
0b1f26057bd0: Layer already exists
08000c18d16d: Layer already exists
3bf71621080b: Pushed
94cd80ac5701: Pushed
profile-service-34: digest: sha256:21bdc5e8aca8d916b6759ddd6392e76ad9fd4be7a493cdb23d23ac1dd1794a07 size: 2822
+ docker push mbuaku/purpose-planner-services:profile-service-latest
The push refers to repository [docker.io/mbuaku/purpose-planner-services]
3bf71621080b: Preparing
17d81f0b4bce: Preparing
c5b70bfb6729: Preparing
a5c38abcbd09: Preparing
94cd80ac5701: Preparing
5f70bf18a086: Preparing
a4025bf6d4b0: Preparing
5cc355a88ecc: Preparing
82140d9a70a7: Preparing
f3b40b0cdb1c: Preparing
0b1f26057bd0: Preparing
08000c18d16d: Preparing
a4025bf6d4b0: Waiting
5cc355a88ecc: Waiting
82140d9a70a7: Waiting
f3b40b0cdb1c: Waiting
0b1f26057bd0: Waiting
08000c18d16d: Waiting
5f70bf18a086: Waiting
a5c38abcbd09: Layer already exists
c5b70bfb6729: Layer already exists
3bf71621080b: Layer already exists
94cd80ac5701: Layer already exists
17d81f0b4bce: Layer already exists
5f70bf18a086: Layer already exists
5cc355a88ecc: Layer already exists
82140d9a70a7: Layer already exists
f3b40b0cdb1c: Layer already exists
a4025bf6d4b0: Layer already exists
0b1f26057bd0: Layer already exists
08000c18d16d: Layer already exists
profile-service-latest: digest: sha256:21bdc5e8aca8d916b6759ddd6392e76ad9fd4be7a493cdb23d23ac1dd1794a07 size: 2822
[Pipeline] sh
+ docker push mbuaku/purpose-planner-services:schedule-service-34
The push refers to repository [docker.io/mbuaku/purpose-planner-services]
69ff200ca877: Preparing
22f1ef4952fe: Preparing
8ae57e0d764a: Preparing
009d119b568f: Preparing
18ea915f095a: Preparing
5f70bf18a086: Preparing
d7fb50bfe1e6: Preparing
5cc355a88ecc: Preparing
82140d9a70a7: Preparing
f3b40b0cdb1c: Preparing
0b1f26057bd0: Preparing
08000c18d16d: Preparing
d7fb50bfe1e6: Waiting
5cc355a88ecc: Waiting
82140d9a70a7: Waiting
f3b40b0cdb1c: Waiting
0b1f26057bd0: Waiting
08000c18d16d: Waiting
5f70bf18a086: Waiting
009d119b568f: Layer already exists
5f70bf18a086: Layer already exists
8ae57e0d764a: Pushed
22f1ef4952fe: Pushed
5cc355a88ecc: Layer already exists
82140d9a70a7: Layer already exists
0b1f26057bd0: Layer already exists
f3b40b0cdb1c: Layer already exists
d7fb50bfe1e6: Pushed
08000c18d16d: Layer already exists
69ff200ca877: Pushed
18ea915f095a: Pushed
schedule-service-34: digest: sha256:b546a18f687abc46e14ad8e050ff9910e07369e3684ed24dee6ffb03a7629748 size: 2823
+ docker push mbuaku/purpose-planner-services:schedule-service-latest
The push refers to repository [docker.io/mbuaku/purpose-planner-services]
69ff200ca877: Preparing
22f1ef4952fe: Preparing
8ae57e0d764a: Preparing
009d119b568f: Preparing
18ea915f095a: Preparing
5f70bf18a086: Preparing
d7fb50bfe1e6: Preparing
5cc355a88ecc: Preparing
82140d9a70a7: Preparing
f3b40b0cdb1c: Preparing
0b1f26057bd0: Preparing
08000c18d16d: Preparing
5cc355a88ecc: Waiting
82140d9a70a7: Waiting
f3b40b0cdb1c: Waiting
0b1f26057bd0: Waiting
08000c18d16d: Waiting
5f70bf18a086: Waiting
d7fb50bfe1e6: Waiting
009d119b568f: Layer already exists
8ae57e0d764a: Layer already exists
18ea915f095a: Layer already exists
69ff200ca877: Layer already exists
22f1ef4952fe: Layer already exists
5f70bf18a086: Layer already exists
5cc355a88ecc: Layer already exists
82140d9a70a7: Layer already exists
f3b40b0cdb1c: Layer already exists
0b1f26057bd0: Layer already exists
d7fb50bfe1e6: Layer already exists
08000c18d16d: Layer already exists
schedule-service-latest: digest: sha256:b546a18f687abc46e14ad8e050ff9910e07369e3684ed24dee6ffb03a7629748 size: 2823
[Pipeline] sh
+ docker push mbuaku/purpose-planner-services:dashboard-service-34
The push refers to repository [docker.io/mbuaku/purpose-planner-services]
350d8738fa11: Preparing
268ea4a92ce0: Preparing
54c5a4fa7a07: Preparing
54125eb693ba: Preparing
3f6db658b27c: Preparing
5f70bf18a086: Preparing
ccc629897334: Preparing
5cc355a88ecc: Preparing
82140d9a70a7: Preparing
f3b40b0cdb1c: Preparing
0b1f26057bd0: Preparing
08000c18d16d: Preparing
5f70bf18a086: Waiting
ccc629897334: Waiting
5cc355a88ecc: Waiting
82140d9a70a7: Waiting
f3b40b0cdb1c: Waiting
0b1f26057bd0: Waiting
08000c18d16d: Waiting
54125eb693ba: Layer already exists
5f70bf18a086: Layer already exists
268ea4a92ce0: Pushed
54c5a4fa7a07: Pushed
5cc355a88ecc: Layer already exists
82140d9a70a7: Layer already exists
0b1f26057bd0: Layer already exists
f3b40b0cdb1c: Layer already exists
ccc629897334: Pushed
08000c18d16d: Layer already exists
350d8738fa11: Pushed
3f6db658b27c: Pushed
dashboard-service-34: digest: sha256:f0a8071628277015f5d0a235e4ccc5552b6040827280d6133b5bc0bcc64e8896 size: 2823
+ docker push mbuaku/purpose-planner-services:dashboard-service-latest
The push refers to repository [docker.io/mbuaku/purpose-planner-services]
350d8738fa11: Preparing
268ea4a92ce0: Preparing
54c5a4fa7a07: Preparing
54125eb693ba: Preparing
3f6db658b27c: Preparing
5f70bf18a086: Preparing
ccc629897334: Preparing
5cc355a88ecc: Preparing
82140d9a70a7: Preparing
f3b40b0cdb1c: Preparing
0b1f26057bd0: Preparing
08000c18d16d: Preparing
5f70bf18a086: Waiting
ccc629897334: Waiting
5cc355a88ecc: Waiting
82140d9a70a7: Waiting
f3b40b0cdb1c: Waiting
0b1f26057bd0: Waiting
08000c18d16d: Waiting
54125eb693ba: Layer already exists
54c5a4fa7a07: Layer already exists
350d8738fa11: Layer already exists
268ea4a92ce0: Layer already exists
3f6db658b27c: Layer already exists
5f70bf18a086: Layer already exists
5cc355a88ecc: Layer already exists
82140d9a70a7: Layer already exists
f3b40b0cdb1c: Layer already exists
0b1f26057bd0: Layer already exists
ccc629897334: Layer already exists
08000c18d16d: Layer already exists
dashboard-service-latest: digest: sha256:f0a8071628277015f5d0a235e4ccc5552b6040827280d6133b5bc0bcc64e8896 size: 2823
[Pipeline] }
[Pipeline] // script
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (Deploy to Kubernetes)
[Pipeline] script
[Pipeline] {
[Pipeline] sh
+ 
+ echo kubectl not found, installing locally...
kubectl not found, installing locally...
+ [ ! -f /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl ]
+ export PATH=/var/lib/jenkins/workspace/purpose-planner-services-backend:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin
+ command -v kubectl
[Pipeline] sh
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** create namespace development --dry-run=client -o yaml
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** apply -f -
namespace/development configured
[Pipeline] sh
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** apply -f k8s-manifests/storage.yaml
persistentvolume/mongodb-pv unchanged
persistentvolumeclaim/mongodb-pvc unchanged
persistentvolume/redis-pv unchanged
persistentvolumeclaim/redis-pvc unchanged
[Pipeline] sh
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** apply -f k8s-manifests/infrastructure.yaml
namespace/development configured
deployment.apps/mongodb configured
service/mongodb unchanged
deployment.apps/redis unchanged
service/redis unchanged
[Pipeline] sh
Warning: A secret was passed to "sh" using Groovy String interpolation, which is insecure.
		 Affected argument(s) used the following variable(s): [KUBECONFIG]
		 See https://jenkins.io/redirect/groovy-string-interpolation for details.
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** create secret generic app-secrets --from-literal=jwt-secret=your-secret-key-here --from-literal=mongodb-uri=mongodb://admin:password123@mongodb:27017/purpose-planner?authSource=admin -n development --dry-run=client -o yaml
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** apply -f -
secret/app-secrets configured
[Pipeline] sh
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** apply -f k8s-manifests/services/
deployment.apps/auth-service configured
service/auth-service unchanged
deployment.apps/dashboard-service configured
service/dashboard-service unchanged
deployment.apps/financial-service configured
service/financial-service unchanged
deployment.apps/gateway-service configured
service/gateway-service unchanged
deployment.apps/profile-service configured
service/profile-service unchanged
deployment.apps/schedule-service configured
service/schedule-service unchanged
deployment.apps/spiritual-service configured
service/spiritual-service unchanged
[Pipeline] sh
Warning: A secret was passed to "sh" using Groovy String interpolation, which is insecure.
		 Affected argument(s) used the following variable(s): [KUBECONFIG]
		 See https://jenkins.io/redirect/groovy-string-interpolation for details.
+ echo Updating auth-service to use image tag 34...
Updating auth-service to use image tag 34...
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** set image deployment/auth-service auth-service=mbuaku/purpose-planner-services:auth-service-34 -n development
deployment.apps/auth-service image updated
[Pipeline] sh
Warning: A secret was passed to "sh" using Groovy String interpolation, which is insecure.
		 Affected argument(s) used the following variable(s): [KUBECONFIG]
		 See https://jenkins.io/redirect/groovy-string-interpolation for details.
+ echo Updating gateway-service to use image tag 34...
Updating gateway-service to use image tag 34...
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** set image deployment/gateway-service gateway-service=mbuaku/purpose-planner-services:gateway-service-34 -n development
deployment.apps/gateway-service image updated
[Pipeline] sh
Warning: A secret was passed to "sh" using Groovy String interpolation, which is insecure.
		 Affected argument(s) used the following variable(s): [KUBECONFIG]
		 See https://jenkins.io/redirect/groovy-string-interpolation for details.
+ echo Updating financial-service to use image tag 34...
Updating financial-service to use image tag 34...
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** set image deployment/financial-service financial-service=mbuaku/purpose-planner-services:financial-service-34 -n development
deployment.apps/financial-service image updated
[Pipeline] sh
Warning: A secret was passed to "sh" using Groovy String interpolation, which is insecure.
		 Affected argument(s) used the following variable(s): [KUBECONFIG]
		 See https://jenkins.io/redirect/groovy-string-interpolation for details.
+ echo Updating spiritual-service to use image tag 34...
Updating spiritual-service to use image tag 34...
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** set image deployment/spiritual-service spiritual-service=mbuaku/purpose-planner-services:spiritual-service-34 -n development
deployment.apps/spiritual-service image updated
[Pipeline] sh
Warning: A secret was passed to "sh" using Groovy String interpolation, which is insecure.
		 Affected argument(s) used the following variable(s): [KUBECONFIG]
		 See https://jenkins.io/redirect/groovy-string-interpolation for details.
+ echo Updating profile-service to use image tag 34...
Updating profile-service to use image tag 34...
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** set image deployment/profile-service profile-service=mbuaku/purpose-planner-services:profile-service-34 -n development
deployment.apps/profile-service image updated
[Pipeline] sh
Warning: A secret was passed to "sh" using Groovy String interpolation, which is insecure.
		 Affected argument(s) used the following variable(s): [KUBECONFIG]
		 See https://jenkins.io/redirect/groovy-string-interpolation for details.
+ echo Updating schedule-service to use image tag 34...
Updating schedule-service to use image tag 34...
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** set image deployment/schedule-service schedule-service=mbuaku/purpose-planner-services:schedule-service-34 -n development
deployment.apps/schedule-service image updated
[Pipeline] sh
Warning: A secret was passed to "sh" using Groovy String interpolation, which is insecure.
		 Affected argument(s) used the following variable(s): [KUBECONFIG]
		 See https://jenkins.io/redirect/groovy-string-interpolation for details.
+ echo Updating dashboard-service to use image tag 34...
Updating dashboard-service to use image tag 34...
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** set image deployment/dashboard-service dashboard-service=mbuaku/purpose-planner-services:dashboard-service-34 -n development
deployment.apps/dashboard-service image updated
[Pipeline] sh
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** label namespace development purpose-planner=backend --overwrite
namespace/development not labeled
[Pipeline] }
[Pipeline] // script
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (Verify Deployment)
[Pipeline] script
[Pipeline] {
[Pipeline] sh
+ set -e
+ export KUBECTL=/var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl
+ export KC=****
+ echo Checking pod status...
Checking pod status...
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** get pods -n development
NAME                                 READY   STATUS              RESTARTS      AGE
auth-service-5587cd9c74-jqpb6        1/1     Running             0             13m
auth-service-747fdd467c-g7tzk        0/1     Terminating         0             3s
auth-service-9c657bc57-59gzj         0/1     ContainerCreating   0             1s
dashboard-service-64667dc8df-679z5   0/1     Running             0             3s
dashboard-service-744bdc4856-t2bn6   1/1     Running             0             13m
financial-service-97f5dc584-8cskw    0/1     Terminating         0             3s
financial-service-d5b675db7-6drn8    0/1     CrashLoopBackOff    7 (29s ago)   13m
gateway-service-56d6fb7886-f95fp     0/1     ContainerCreating   0             1s
gateway-service-78cdc7cdb9-4rglb     1/1     Running             0             13m
gateway-service-78cdc7cdb9-z6b9d     1/1     Running             0             11m
gateway-service-b875fdf94-5nm67      0/1     Terminating         0             3s
mongodb-66f577fbcc-vsr47             1/1     Running             0             107m
profile-service-76c8875b75-zl5wd     1/1     Running             0             13m
profile-service-7b7b9bd57b-rqt7f     0/1     Terminating         0             2s
redis-588dcc7856-rc7tc               1/1     Running             0             107m
schedule-service-65b4f49fb4-67pw7    0/1     ContainerCreating   0             2s
schedule-service-78695967bc-jhxvm    1/1     Running             0             13m
spiritual-service-9c577b4d5-zjvhd    1/1     Running             0             13m
spiritual-service-db87cc85d-tbjgd    0/1     Terminating         0             2s
+ echo 

+ echo Checking pod images...
Checking pod images...
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** get pods -n development -o custom-columns=NAME:.metadata.name,IMAGE:.spec.containers[0].image
NAME                                 IMAGE
auth-service-5587cd9c74-jqpb6        mbuaku/purpose-planner-services:auth-service-33
auth-service-747fdd467c-g7tzk        mbuaku/purpose-planner-services:auth-service-latest
auth-service-9c657bc57-59gzj         mbuaku/purpose-planner-services:auth-service-34
dashboard-service-64667dc8df-679z5   mbuaku/purpose-planner-services:dashboard-service-latest
dashboard-service-744bdc4856-t2bn6   mbuaku/purpose-planner-services:dashboard-service-33
financial-service-97f5dc584-8cskw    mbuaku/purpose-planner-services:financial-service-latest
financial-service-d5b675db7-6drn8    mbuaku/purpose-planner-services:financial-service-33
gateway-service-56d6fb7886-f95fp     mbuaku/purpose-planner-services:gateway-service-34
gateway-service-78cdc7cdb9-4rglb     mbuaku/purpose-planner-services:gateway-service-33
gateway-service-78cdc7cdb9-z6b9d     mbuaku/purpose-planner-services:gateway-service-33
gateway-service-b875fdf94-5nm67      mbuaku/purpose-planner-services:gateway-service-latest
mongodb-66f577fbcc-vsr47             mongo:6
profile-service-76c8875b75-zl5wd     mbuaku/purpose-planner-services:profile-service-33
profile-service-7b7b9bd57b-rqt7f     mbuaku/purpose-planner-services:profile-service-latest
redis-588dcc7856-rc7tc               redis:7-alpine
schedule-service-65b4f49fb4-67pw7    mbuaku/purpose-planner-services:schedule-service-latest
schedule-service-78695967bc-jhxvm    mbuaku/purpose-planner-services:schedule-service-33
spiritual-service-9c577b4d5-zjvhd    mbuaku/purpose-planner-services:spiritual-service-33
spiritual-service-db87cc85d-tbjgd    mbuaku/purpose-planner-services:spiritual-service-latest
+ echo 

+ echo Checking logs from failing pods...
Checking logs from failing pods...
+ sleep 10
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** get pods -n development
+ grep -E CrashLoopBackOff|Error
+ awk {print $1}
+ FAILING_PODS=financial-service-d5b675db7-6drn8
+ echo === Current logs for financial-service-d5b675db7-6drn8 ===
=== Current logs for financial-service-d5b675db7-6drn8 ===
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** logs financial-service-d5b675db7-6drn8 -n development --tail=50

> financial-service@1.0.0 start
> node server.js

/app/server.js:746
            const res = await fetch(`/api/savings-goals/${goalId}/contributions`, {
                                                        ^

SyntaxError: missing ) after argument list
    at internalCompileFunction (node:internal/vm:76:18)
    at wrapSafe (node:internal/modules/cjs/loader:1283:20)
    at Module._compile (node:internal/modules/cjs/loader:1328:27)
    at Module._extensions..js (node:internal/modules/cjs/loader:1422:10)
    at Module.load (node:internal/modules/cjs/loader:1203:32)
    at Module._load (node:internal/modules/cjs/loader:1019:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:128:12)
    at node:internal/main/run_main_module:28:49

Node.js v18.20.8
npm notice
npm notice New major version of npm available! 10.8.2 -> 11.4.0
npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.4.0
npm notice To update run: npm install -g npm@11.4.0
npm notice
+ echo 

+ echo === Previous logs for financial-service-d5b675db7-6drn8 (from last crash) ===
=== Previous logs for financial-service-d5b675db7-6drn8 (from last crash) ===
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** logs financial-service-d5b675db7-6drn8 -n development --previous --tail=50

> financial-service@1.0.0 start
> node server.js

/app/server.js:746
            const res = await fetch(`/api/savings-goals/${goalId}/contributions`, {
                                                        ^

SyntaxError: missing ) after argument list
    at internalCompileFunction (node:internal/vm:76:18)
    at wrapSafe (node:internal/modules/cjs/loader:1283:20)
    at Module._compile (node:internal/modules/cjs/loader:1328:27)
    at Module._extensions..js (node:internal/modules/cjs/loader:1422:10)
    at Module.load (node:internal/modules/cjs/loader:1203:32)
    at Module._load (node:internal/modules/cjs/loader:1019:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:128:12)
    at node:internal/main/run_main_module:28:49

Node.js v18.20.8
npm notice
npm notice New major version of npm available! 10.8.2 -> 11.4.0
npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.4.0
npm notice To update run: npm install -g npm@11.4.0
npm notice
+ echo 

+ echo === Last state for financial-service-d5b675db7-6drn8 ===
=== Last state for financial-service-d5b675db7-6drn8 ===
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** describe pod financial-service-d5b675db7-6drn8 -n development
+ grep -A4 -i last state
    Last State:     Terminated
      Reason:       Error
      Exit Code:    1
      Started:      Sun, 18 May 2025 16:36:36 +0000
      Finished:     Sun, 18 May 2025 16:36:38 +0000
+ echo 

+ echo 

+ echo Waiting for deployments (timeout: 60s)...
Waiting for deployments (timeout: 60s)...
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** wait --for=condition=available --timeout=60s deployment --all -n development
deployment.apps/auth-service condition met
deployment.apps/dashboard-service condition met
deployment.apps/financial-service condition met
deployment.apps/gateway-service condition met
deployment.apps/mongodb condition met
deployment.apps/profile-service condition met
deployment.apps/redis condition met
deployment.apps/schedule-service condition met
deployment.apps/spiritual-service condition met
+ /var/lib/jenkins/workspace/purpose-planner-services-backend/kubectl --kubeconfig=**** get svc -n development
NAME                TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)          AGE
auth-service        ClusterIP   10.97.211.95     <none>        3001/TCP         107m
dashboard-service   ClusterIP   10.109.4.224     <none>        3006/TCP         107m
financial-service   ClusterIP   10.106.227.61    <none>        3002/TCP         107m
gateway-service     NodePort    10.110.230.151   <none>        3000:30000/TCP   107m
mongodb             ClusterIP   10.106.223.83    <none>        27017/TCP        107m
profile-service     ClusterIP   10.99.163.25     <none>        3004/TCP         107m
redis               ClusterIP   10.101.35.207    <none>        6379/TCP         107m
schedule-service    ClusterIP   10.102.66.205    <none>        3005/TCP         107m
spiritual-service   ClusterIP   10.108.26.185    <none>        3003/TCP         107m
+ echo 

+ echo ======================================
======================================
+ echo Backend Services Deployment Complete!
Backend Services Deployment Complete!
+ echo ======================================
======================================
[Pipeline] }
[Pipeline] // script
[Pipeline] }
[Pipeline] // stage
[Pipeline] stage
[Pipeline] { (Declarative: Post Actions)
[Pipeline] script
[Pipeline] {
[Pipeline] sh
+ docker logout
Removing login credentials for https://index.docker.io/v1/
[Pipeline] }
[Pipeline] // script
[Pipeline] echo
Backend pipeline completed successfully!
[Pipeline] }
[Pipeline] // stage
[Pipeline] }
[Pipeline] // withEnv
[Pipeline] }
[Pipeline] // withCredentials
[Pipeline] }
[Pipeline] // withEnv
[Pipeline] }
[Pipeline] // node
[Pipeline] End of Pipeline
Finished: SUCCESS
