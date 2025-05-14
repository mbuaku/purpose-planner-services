require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3002;

// Import routes
const profileRoutes = require('./src/routes/profile.routes');

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup in-memory database if MongoDB is not available
global.inMemoryDB = {
  profiles: [],
};

// Try to connect to MongoDB, fall back to in-memory if not available
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/purpose-planner-profile', {
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

// Setup uploads directory
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const setupUploads = async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log(`Upload directory created at ${uploadDir}`);
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
};
setupUploads();

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, uploadDir)));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Profile Service is healthy',
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
      <title>Purpose Planner Profile Service</title>
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
        input[type="email"],
        input[type="password"],
        textarea {
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
      <h1>Purpose Planner Profile Service</h1>
      <div class="api-info">
        <p><strong>Version:</strong> 1.0.0</p>
        <p><strong>Description:</strong> User profile management service for Purpose Planner</p>
      </div>
      
      <h2>Test API Endpoints</h2>
      
      <div class="test-panel">
        <h3>Get Profile</h3>
        <form id="getProfileForm">
          <div class="form-group">
            <label for="token">JWT Token</label>
            <input type="text" id="token" required>
          </div>
          <button type="submit">Get Profile</button>
        </form>
        <div id="getProfileResponse" class="response"></div>
      </div>
      
      <div class="test-panel">
        <h3>Update Profile</h3>
        <form id="updateProfileForm">
          <div class="form-group">
            <label for="updateToken">JWT Token</label>
            <input type="text" id="updateToken" required>
          </div>
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input type="text" id="firstName">
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input type="text" id="lastName">
          </div>
          <div class="form-group">
            <label for="bio">Bio</label>
            <textarea id="bio" rows="3"></textarea>
          </div>
          <button type="submit">Update Profile</button>
        </form>
        <div id="updateProfileResponse" class="response"></div>
      </div>
      
      <div class="test-panel">
        <h3>Update Preferences</h3>
        <form id="preferencesForm">
          <div class="form-group">
            <label for="preferencesToken">JWT Token</label>
            <input type="text" id="preferencesToken" required>
          </div>
          <div class="form-group">
            <label for="theme">Theme</label>
            <select id="theme">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <div class="form-group">
            <label>Notification Preferences</label>
            <div>
              <input type="checkbox" id="emailNotifications" checked>
              <label for="emailNotifications">Email Notifications</label>
            </div>
            <div>
              <input type="checkbox" id="browserNotifications" checked>
              <label for="browserNotifications">Browser Notifications</label>
            </div>
          </div>
          <button type="submit">Update Preferences</button>
        </form>
        <div id="preferencesResponse" class="response"></div>
      </div>
      
      <script>
        // Get Profile Form
        document.getElementById('getProfileForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('getProfileResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('token').value;
          
          try {
            const res = await fetch('/api/profile', {
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + token,
              },
            });
            
            const data = await res.json();
            response.textContent = JSON.stringify(data, null, 2);
            
            // Populate update form if profile exists
            if (data.success && data.data && data.data.profile) {
              const profile = data.data.profile;
              document.getElementById('updateToken').value = token;
              document.getElementById('preferencesToken').value = token;
              
              if (profile.firstName) document.getElementById('firstName').value = profile.firstName;
              if (profile.lastName) document.getElementById('lastName').value = profile.lastName;
              if (profile.bio) document.getElementById('bio').value = profile.bio;
              
              if (profile.preferences && profile.preferences.theme) {
                document.getElementById('theme').value = profile.preferences.theme;
              }
              
              if (profile.preferences && profile.preferences.notifications) {
                document.getElementById('emailNotifications').checked = 
                  profile.preferences.notifications.email !== undefined ? 
                  profile.preferences.notifications.email : true;
                  
                document.getElementById('browserNotifications').checked = 
                  profile.preferences.notifications.browser !== undefined ? 
                  profile.preferences.notifications.browser : true;
              }
            }
          } catch (error) {
            response.textContent = 'Error: ' + error.message;
          }
        });
        
        // Update Profile Form
        document.getElementById('updateProfileForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('updateProfileResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('updateToken').value;
          
          try {
            const res = await fetch('/api/profile', {
              method: 'PUT',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                bio: document.getElementById('bio').value,
              }),
            });
            
            const data = await res.json();
            response.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            response.textContent = 'Error: ' + error.message;
          }
        });
        
        // Update Preferences Form
        document.getElementById('preferencesForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('preferencesResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('preferencesToken').value;
          
          try {
            const res = await fetch('/api/profile/preferences', {
              method: 'PUT',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                theme: document.getElementById('theme').value,
                notifications: {
                  email: document.getElementById('emailNotifications').checked,
                  browser: document.getElementById('browserNotifications').checked,
                },
              }),
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
            document.getElementById('token').value = token;
            
            // Call profile endpoint to get user profile
            document.getElementById('getProfileForm').dispatchEvent(new Event('submit'));
            
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
app.use('/api/profile', profileRoutes);

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
  console.log(`Profile Service running on port ${PORT}`);
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