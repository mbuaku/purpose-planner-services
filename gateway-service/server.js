require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const responseTime = require('response-time');
const compression = require('compression');
const winston = require('winston');
const fs = require('fs');
const path = require('path');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set up logging
const logsDir = path.join(__dirname, 'logs');

// Create logs directory if it doesn't exist (not in test environment)
if (process.env.NODE_ENV !== 'test' && !fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Configure winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: process.env.NODE_ENV === 'test' ? [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ] : [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log') 
    })
  ]
});

// Add logger to request object
app.use((req, res, next) => {
  req.logger = logger;
  next();
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(compression()); // Compress responses
app.use(responseTime()); // Add X-Response-Time header

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Request logging (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Load routes
const routes = require('./src/routes');
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API Gateway is healthy',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint with basic HTML
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Purpose Planner API Gateway</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2, h3 {
          color: #4F46E5;
        }
        .header {
          background-color: #f9f9f9;
          border-left: 4px solid #4F46E5;
          padding: 15px;
          margin-bottom: 20px;
        }
        .endpoints {
          background-color: #f0f0f0;
          border-radius: 5px;
          padding: 20px;
          margin-top: 20px;
        }
        .endpoint {
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid #ddd;
        }
        .endpoint:last-child {
          border-bottom: none;
        }
        .method {
          display: inline-block;
          padding: 3px 6px;
          border-radius: 3px;
          color: white;
          font-size: 0.8em;
          margin-right: 8px;
        }
        .get { background-color: #61affe; }
        .post { background-color: #49cc90; }
        .put { background-color: #fca130; }
        .delete { background-color: #f93e3e; }
        code {
          background-color: #e0e0e0;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Purpose Planner API Gateway</h1>
        <p>Welcome to the API Gateway for Purpose Planner microservices</p>
      </div>
      
      <div class="endpoints">
        <h2>Available Endpoints</h2>
        
        <h3>Authentication</h3>
        <div class="endpoint">
          <span class="method post">POST</span>
          <code>/api/auth/register</code>
          <p>Register a new user account</p>
        </div>
        <div class="endpoint">
          <span class="method post">POST</span>
          <code>/api/auth/login</code>
          <p>Login to an existing account</p>
        </div>
        <div class="endpoint">
          <span class="method get">GET</span>
          <code>/api/auth/profile</code>
          <p>Get current user profile</p>
        </div>
        
        <h3>Dashboard</h3>
        <div class="endpoint">
          <span class="method get">GET</span>
          <code>/api/dashboard</code>
          <p>Get user dashboard</p>
        </div>
        <div class="endpoint">
          <span class="method post">POST</span>
          <code>/api/dashboard</code>
          <p>Create or update dashboard</p>
        </div>
        
        <h3>Spiritual</h3>
        <div class="endpoint">
          <span class="method get">GET</span>
          <code>/api/spiritual/prayers</code>
          <p>Get user prayer requests</p>
        </div>
        <div class="endpoint">
          <span class="method get">GET</span>
          <code>/api/spiritual/journal</code>
          <p>Get journal entries</p>
        </div>
        
        <h3>Financial</h3>
        <div class="endpoint">
          <span class="method get">GET</span>
          <code>/api/financial/budget</code>
          <p>Get user budget</p>
        </div>
        <div class="endpoint">
          <span class="method get">GET</span>
          <code>/api/financial/expenses</code>
          <p>Get expenses</p>
        </div>
        
        <h3>Schedule</h3>
        <div class="endpoint">
          <span class="method get">GET</span>
          <code>/api/schedule/events</code>
          <p>Get calendar events</p>
        </div>
        <div class="endpoint">
          <span class="method post">POST</span>
          <code>/api/schedule/events</code>
          <p>Create a new event</p>
        </div>
        
        <h3>Health Check</h3>
        <div class="endpoint">
          <span class="method get">GET</span>
          <code>/health</code>
          <p>API Gateway health check</p>
        </div>
      </div>
      
      <div class="footer">
        <p>For full API documentation, see the <a href="/api-docs">API Docs</a>.</p>
      </div>
    </body>
    </html>
  `);
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong!',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start the server only if not in test environment
let server;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    logger.info(`API Gateway running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! Shutting down...', { 
      name: err.name, 
      message: err.message,
      stack: err.stack
    });
    
    server.close(() => {
      process.exit(1);
    });
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...', { 
      name: err.name, 
      message: err.message,
      stack: err.stack
    });
    
    server.close(() => {
      process.exit(1);
    });
  });
}

// Export app for testing
module.exports = app;