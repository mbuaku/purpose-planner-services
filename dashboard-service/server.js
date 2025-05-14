require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const winston = require('winston');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3006;

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Import routes
const dashboardRoutes = require('./src/routes/dashboard.routes');

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userId: req.user ? req.user.id : 'unauthenticated'
  });
  next();
});

// Setup in-memory database if MongoDB is not available
global.inMemoryDB = {
  dashboards: [],
  widgets: []
};

// Try to connect to MongoDB, fall back to in-memory if not available
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/purpose-planner-dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logger.info('MongoDB Connected');
  global.inMemoryDB = undefined; // Disable in-memory DB if MongoDB connects
})
.catch(err => {
  logger.error('MongoDB Connection Error:', err);
  logger.info('Using in-memory database instead');
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Dashboard Service is healthy',
    timestamp: new Date().toISOString()
  });
});

// Welcome route with HTML test interface
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Purpose Planner Dashboard Service</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2 {
          color: #4F46E5;
        }
        .api-info {
          background-color: #f9f9f9;
          border-left: 4px solid #4F46E5;
          padding: 15px;
          margin-bottom: 20px;
        }
        .test-panel {
          background-color: #f0f0f0;
          border-radius: 5px;
          padding: 20px;
          margin-top: 20px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        input[type="text"],
        textarea,
        select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        button {
          background-color: #4F46E5;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
        .response {
          margin-top: 20px;
          padding: 15px;
          background-color: #f0f0f0;
          border-radius: 4px;
          white-space: pre-wrap;
        }
        .widget-config {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 10px;
          margin-bottom: 10px;
        }
        .widget-config h4 {
          margin-top: 0;
        }
        .add-widget-btn {
          margin-bottom: 15px;
          background-color: #10B981;
        }
      </style>
    </head>
    <body>
      <h1>Purpose Planner Dashboard Service</h1>
      <div class="api-info">
        <p><strong>Version:</strong> 1.0.0</p>
        <p><strong>Description:</strong> Dashboard aggregation service for Purpose Planner</p>
      </div>
      
      <h2>Test API Endpoints</h2>
      
      <div class="test-panel">
        <h3>Get User Dashboard</h3>
        <form id="getDashboardForm">
          <div class="form-group">
            <label for="getToken">JWT Token</label>
            <input type="text" id="getToken" required>
          </div>
          <button type="submit">Get Dashboard</button>
        </form>
        <div id="getDashboardResponse" class="response"></div>
      </div>
      
      <div class="test-panel">
        <h3>Create or Update Dashboard</h3>
        <form id="createDashboardForm">
          <div class="form-group">
            <label for="createToken">JWT Token</label>
            <input type="text" id="createToken" required>
          </div>
          <div class="form-group">
            <label for="dashboardName">Dashboard Name</label>
            <input type="text" id="dashboardName" value="Main Dashboard" required>
          </div>
          <div class="form-group">
            <label>Dashboard Widgets</label>
            <div id="widgetsContainer">
              <!-- Widget configs will be added here -->
            </div>
            <button type="button" class="add-widget-btn" id="addWidgetBtn">+ Add Widget</button>
          </div>
          <button type="submit">Save Dashboard</button>
        </form>
        <div id="createDashboardResponse" class="response"></div>
      </div>
      
      <div class="test-panel">
        <h3>Get Widget Data</h3>
        <form id="getWidgetDataForm">
          <div class="form-group">
            <label for="widgetToken">JWT Token</label>
            <input type="text" id="widgetToken" required>
          </div>
          <div class="form-group">
            <label for="widgetId">Widget ID</label>
            <input type="text" id="widgetId" required>
          </div>
          <div class="form-group">
            <label for="dateRange">Date Range (optional)</label>
            <select id="dateRange">
              <option value="">No Range</option>
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <button type="submit">Get Widget Data</button>
        </form>
        <div id="getWidgetDataResponse" class="response"></div>
      </div>
      
      <script>
        // Widget types and their configurations
        const widgetTypes = {
          'spiritual-summary': { title: 'Spiritual Summary', icon: 'pray', source: 'spiritual-service' },
          'prayer-list': { title: 'Prayer Requests', icon: 'list', source: 'spiritual-service' },
          'journal-entries': { title: 'Recent Journal Entries', icon: 'book', source: 'spiritual-service' },
          'upcoming-events': { title: 'Upcoming Events', icon: 'calendar', source: 'schedule-service' },
          'habits-tracker': { title: 'Habits Tracker', icon: 'check-square', source: 'schedule-service' },
          'budget-overview': { title: 'Budget Overview', icon: 'dollar-sign', source: 'financial-service' },
          'savings-goals': { title: 'Savings Goals', icon: 'target', source: 'financial-service' },
          'recent-expenses': { title: 'Recent Expenses', icon: 'credit-card', source: 'financial-service' }
        };
        
        // Add widget template
        function addWidgetTemplate() {
          const container = document.getElementById('widgetsContainer');
          const widgetIndex = container.children.length;
          
          const widgetDiv = document.createElement('div');
          widgetDiv.className = 'widget-config';
          
          // Create type dropdown
          let typeOptions = '';
          for (const [key, widget] of Object.entries(widgetTypes)) {
            typeOptions += `<option value="${key}">${widget.title}</option>`;
          }
          
          widgetDiv.innerHTML = `
            <h4>Widget ${widgetIndex + 1}</h4>
            <div class="form-group">
              <label for="widgetType${widgetIndex}">Widget Type</label>
              <select id="widgetType${widgetIndex}" class="widget-type" data-index="${widgetIndex}">
                ${typeOptions}
              </select>
            </div>
            <div class="form-group">
              <label for="widgetTitle${widgetIndex}">Title</label>
              <input type="text" id="widgetTitle${widgetIndex}" class="widget-title" value="${widgetTypes[Object.keys(widgetTypes)[0]].title}">
            </div>
            <div class="form-group">
              <label for="widgetRefreshInterval${widgetIndex}">Refresh Interval (minutes)</label>
              <input type="number" id="widgetRefreshInterval${widgetIndex}" class="widget-refresh" value="15" min="5">
            </div>
            <div class="form-group">
              <label for="widgetPosition${widgetIndex}">Position</label>
              <select id="widgetPosition${widgetIndex}" class="widget-position">
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
              </select>
            </div>
            <button type="button" class="remove-widget-btn" data-index="${widgetIndex}" style="background-color: #EF4444;">Remove</button>
          `;
          
          container.appendChild(widgetDiv);
          
          // Add event listener to update title when type changes
          const typeSelect = widgetDiv.querySelector('.widget-type');
          typeSelect.addEventListener('change', function() {
            const index = this.getAttribute('data-index');
            const titleInput = document.getElementById(`widgetTitle${index}`);
            titleInput.value = widgetTypes[this.value].title;
          });
          
          // Add event listener to remove button
          const removeBtn = widgetDiv.querySelector('.remove-widget-btn');
          removeBtn.addEventListener('click', function() {
            container.removeChild(widgetDiv);
          });
        }
        
        // Add initial widget
        document.addEventListener('DOMContentLoaded', function() {
          addWidgetTemplate();
          
          // Add event listener to add widget button
          document.getElementById('addWidgetBtn').addEventListener('click', addWidgetTemplate);
        });
        
        // Get Dashboard Form
        document.getElementById('getDashboardForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('getDashboardResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('getToken').value;
          
          try {
            const res = await fetch('/api/dashboard', {
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + token,
              },
            });
            
            const data = await res.json();
            response.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            response.textContent = 'Error: ' + error.message;
          }
        });
        
        // Create/Update Dashboard Form
        document.getElementById('createDashboardForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('createDashboardResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('createToken').value;
          const name = document.getElementById('dashboardName').value;
          
          // Get widget configurations
          const widgetsContainer = document.getElementById('widgetsContainer');
          const widgets = [];
          
          for (let i = 0; i < widgetsContainer.children.length; i++) {
            const widgetDiv = widgetsContainer.children[i];
            const typeSelect = widgetDiv.querySelector('.widget-type');
            const type = typeSelect.value;
            
            widgets.push({
              type: type,
              title: widgetDiv.querySelector('.widget-title').value,
              source: widgetTypes[type].source,
              icon: widgetTypes[type].icon,
              refreshInterval: parseInt(widgetDiv.querySelector('.widget-refresh').value, 10),
              position: widgetDiv.querySelector('.widget-position').value,
              config: {} // Additional config options would be added here
            });
          }
          
          try {
            const res = await fetch('/api/dashboard', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: name,
                widgets: widgets
              }),
            });
            
            const data = await res.json();
            response.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            response.textContent = 'Error: ' + error.message;
          }
        });
        
        // Get Widget Data Form
        document.getElementById('getWidgetDataForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('getWidgetDataResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('widgetToken').value;
          const widgetId = document.getElementById('widgetId').value;
          const dateRange = document.getElementById('dateRange').value;
          
          let url = `/api/dashboard/widget/${widgetId}`;
          if (dateRange) {
            url += `?range=${dateRange}`;
          }
          
          try {
            const res = await fetch(url, {
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + token,
              },
            });
            
            const data = await res.json();
            response.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            response.textContent = 'Error: ' + error.message;
          }
        });
        
        // Check for token in URL param
        function getTokenFromUrl() {
          const urlParams = new URLSearchParams(window.location.search);
          const token = urlParams.get('token');
          if (token) {
            // Store token in form fields
            document.getElementById('getToken').value = token;
            document.getElementById('createToken').value = token;
            document.getElementById('widgetToken').value = token;
            
            // Call dashboard endpoint to get user dashboard
            document.getElementById('getDashboardForm').dispatchEvent(new Event('submit'));
            
            // Remove token from URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
        
        // Run on page load
        window.addEventListener('load', getTokenFromUrl);
      </script>
    </body>
    </html>
  `);
});

// API routes
app.use('/api/dashboard', dashboardRoutes);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
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

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`Dashboard Service running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', { name: err.name, message: err.message });
  server.close(() => {
    process.exit(1);
  });
});

// Export for testing
module.exports = app;