require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');

// Debug environment variables
console.log('DEBUG: Environment Variables Check:');
console.log('GOOGLE_CLIENT_ID exists:', Boolean(process.env.GOOGLE_CLIENT_ID));
console.log('GOOGLE_CLIENT_SECRET exists:', Boolean(process.env.GOOGLE_CLIENT_SECRET));
console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);

const app = express();
const PORT = process.env.PORT || 3001;

// Import routes
const authRoutes = require('./src/routes/auth.routes');

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Required for OAuth

// Connect to MongoDB
// Temporarily disabled for development without MongoDB
console.log('MongoDB connection disabled for development');

// Mock database for development without MongoDB
const inMemoryUsers = [];
global.inMemoryDB = {
  users: inMemoryUsers,
  addUser: (user) => {
    // Check for duplicate email
    const existingUser = inMemoryUsers.find(u => u.email === user.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }
    const newUser = { ...user, _id: Date.now().toString() };
    inMemoryUsers.push(newUser);
    return newUser;
  },
  findUserByEmail: (email) => {
    return inMemoryUsers.find(u => u.email === email) || null;
  },
  findUserById: (id) => {
    return inMemoryUsers.find(u => u._id === id) || null;
  }
};

// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/purpose-planner-auth', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB Connected'))
// .catch(err => console.log('MongoDB Connection Error:', err));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Auth Service is healthy',
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
      <title>Purpose Planner Auth Service</title>
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
        input[type="password"] {
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
      <h1>Purpose Planner Auth Service</h1>
      <div class="api-info">
        <p><strong>Version:</strong> 1.0.0</p>
        <p><strong>Description:</strong> Authentication and authorization service for Purpose Planner</p>
      </div>
      
      <h2>Test API Endpoints</h2>
      
      <div class="test-panel">
        <h3>Register</h3>
        <form id="registerForm">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input type="text" id="firstName" required>
          </div>
          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input type="text" id="lastName" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" required>
          </div>
          <button type="submit">Register</button>
        </form>
        <div id="registerResponse" class="response"></div>
      </div>
      
      <div class="test-panel">
        <h3>Login</h3>
        <form id="loginForm">
          <div class="form-group">
            <label for="loginEmail">Email</label>
            <input type="email" id="loginEmail" required>
          </div>
          <div class="form-group">
            <label for="loginPassword">Password</label>
            <input type="password" id="loginPassword" required>
          </div>
          <button type="submit">Login</button>
        </form>
        <div class="social-login" style="margin-top: 20px; text-align: center;">
          <p style="margin-bottom: 10px;">-- OR --</p>
          <a href="/api/auth/google" style="display: inline-block; background-color: #DB4437; color: white; padding: 10px 15px; border-radius: 4px; text-decoration: none; font-weight: bold;">
            <div style="display: flex; align-items: center; justify-content: center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" style="margin-right: 8px;">
                <path fill="#ffffff" d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z"></path>
                <path fill="#ffffff" d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z"></path>
                <path fill="#ffffff" d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z"></path>
                <path fill="#ffffff" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.97 13.04C2.45 15.98 5.48 18 9 18z"></path>
              </svg>
              Login with Google
            </div>
          </a>
        </div>
        <div id="loginResponse" class="response"></div>
      </div>
      
      <div class="test-panel">
        <h3>Get Profile</h3>
        <form id="profileForm">
          <div class="form-group">
            <label for="token">JWT Token</label>
            <input type="text" id="token" required>
          </div>
          <button type="submit">Get Profile</button>
        </form>
        <div id="profileResponse" class="response"></div>
      </div>
      
      <script>
        // Check for token in URL param (for social login callback)
        function getTokenFromUrl() {
          const urlParams = new URLSearchParams(window.location.search);
          const token = urlParams.get('token');
          if (token) {
            // Store token in local storage or input field
            document.getElementById('token').value = token;
            
            // Call profile endpoint to get user info
            document.getElementById('profileForm').dispatchEvent(new Event('submit'));
            
            // Remove token from URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
        
        // Run on page load
        window.addEventListener('load', getTokenFromUrl);
        
        // Register Form
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('registerResponse');
          response.textContent = 'Sending request...';
          
          try {
            const res = await fetch('/api/auth/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
              }),
            });
            
            const data = await res.json();
            response.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            response.textContent = 'Error: ' + error.message;
          }
        });
        
        // Login Form
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('loginResponse');
          response.textContent = 'Sending request...';
          
          try {
            const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: document.getElementById('loginEmail').value,
                password: document.getElementById('loginPassword').value,
              }),
            });
            
            const data = await res.json();
            response.textContent = JSON.stringify(data, null, 2);
            
            // If login successful, populate the token field
            if (data.success && data.data && data.data.token) {
              document.getElementById('token').value = data.data.token;
            }
          } catch (error) {
            response.textContent = 'Error: ' + error.message;
          }
        });
        
        // Profile Form
        document.getElementById('profileForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('profileResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('token').value;
          
          try {
            const res = await fetch('/api/auth/profile', {
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
      </script>
    </body>
    </html>
  `);
});

// API routes
app.use('/api/auth', authRoutes);

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
  console.log(`Auth Service running on port ${PORT}`);
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