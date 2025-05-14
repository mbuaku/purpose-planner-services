require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3005;

// Import routes
const eventRoutes = require('./src/routes/event.routes');

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup in-memory database if MongoDB is not available
global.inMemoryDB = {
  events: [],
  recurringEvents: []
};

// Try to connect to MongoDB, fall back to in-memory if not available
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/purpose-planner-schedule', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB Connected');
  global.inMemoryDB = undefined; // Disable in-memory DB if MongoDB connects
})
.catch(err => {
  console.log('MongoDB Connection Error:', err);
  console.log('Using in-memory database instead');
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Schedule Service is healthy',
    timestamp: new Date().toISOString()
  });
});

// Welcome route with HTML test form
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Purpose Planner Schedule Service</title>
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
        input[type="datetime-local"],
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
      </style>
    </head>
    <body>
      <h1>Purpose Planner Schedule Service</h1>
      <div class="api-info">
        <p><strong>Version:</strong> 1.0.0</p>
        <p><strong>Description:</strong> Schedule and event management service for Purpose Planner</p>
      </div>
      
      <h2>Test API Endpoints</h2>
      
      <div class="test-panel">
        <h3>Create Event</h3>
        <form id="createEventForm">
          <div class="form-group">
            <label for="createToken">JWT Token</label>
            <input type="text" id="createToken" required>
          </div>
          <div class="form-group">
            <label for="title">Title</label>
            <input type="text" id="title" required>
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label for="startTime">Start Time</label>
            <input type="datetime-local" id="startTime" required>
          </div>
          <div class="form-group">
            <label for="endTime">End Time</label>
            <input type="datetime-local" id="endTime" required>
          </div>
          <div class="form-group">
            <label for="category">Category</label>
            <select id="category">
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="spiritual">Spiritual</option>
              <option value="financial">Financial</option>
            </select>
          </div>
          <div class="form-group">
            <label for="priority">Priority</label>
            <select id="priority">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button type="submit">Create Event</button>
        </form>
        <div id="createEventResponse" class="response"></div>
      </div>
      
      <div class="test-panel">
        <h3>Get Events</h3>
        <form id="getEventsForm">
          <div class="form-group">
            <label for="getToken">JWT Token</label>
            <input type="text" id="getToken" required>
          </div>
          <div class="form-group">
            <label for="startDate">Start Date</label>
            <input type="date" id="startDate">
          </div>
          <div class="form-group">
            <label for="endDate">End Date</label>
            <input type="date" id="endDate">
          </div>
          <button type="submit">Get Events</button>
        </form>
        <div id="getEventsResponse" class="response"></div>
      </div>
      
      <script>
        // Create Event Form
        document.getElementById('createEventForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('createEventResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('createToken').value;
          
          try {
            const res = await fetch('/api/events', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                startTime: document.getElementById('startTime').value,
                endTime: document.getElementById('endTime').value,
                category: document.getElementById('category').value,
                priority: document.getElementById('priority').value,
              }),
            });
            
            const data = await res.json();
            response.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            response.textContent = 'Error: ' + error.message;
          }
        });
        
        // Get Events Form
        document.getElementById('getEventsForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('getEventsResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('getToken').value;
          const startDate = document.getElementById('startDate').value;
          const endDate = document.getElementById('endDate').value;
          
          let url = '/api/events';
          const params = new URLSearchParams();
          if (startDate) params.append('startDate', startDate);
          if (endDate) params.append('endDate', endDate);
          if (params.toString()) url += '?' + params.toString();
          
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
        
        // Check for token in URL param (from auth service)
        function getTokenFromUrl() {
          const urlParams = new URLSearchParams(window.location.search);
          const token = urlParams.get('token');
          if (token) {
            // Store token in form fields
            document.getElementById('createToken').value = token;
            document.getElementById('getToken').value = token;
            
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
app.use('/api/events', eventRoutes);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong!',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Schedule Service running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Export for testing
module.exports = app;