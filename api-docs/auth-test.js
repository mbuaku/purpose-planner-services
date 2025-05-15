const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = 3010;
const JWT_SECRET = 'test_secret_key';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory user database
const users = [
  {
    id: '1',
    username: 'test',
    email: 'test@example.com',
    password: 'password123', // In a real app, this would be hashed
    role: 'user'
  }
];

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token'
      }
    });
  }
};

// Routes

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  
  // Check if user already exists
  if (users.some(u => u.email === email)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'USER_EXISTS',
        message: 'User with this email already exists'
      }
    });
  }
  
  // Create new user
  const newUser = {
    id: (users.length + 1).toString(),
    username,
    email,
    password, // In a real app, this would be hashed
    role: 'user'
  };
  
  users.push(newUser);
  
  // Generate token
  const token = generateToken(newUser);
  
  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    },
    message: 'User registered successfully'
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Find user
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials'
      }
    });
  }
  
  // Generate token
  const token = generateToken(user);
  
  res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    },
    message: 'Login successful'
  });
});

// Verify endpoint
app.get('/api/auth/verify', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      }
    });
  }
  
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    },
    message: 'Token valid'
  });
});

// Profile endpoint
app.get('/api/auth/profile', authenticate, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found'
      }
    });
  }
  
  res.status(200).json({
    success: true,
    data: {
      profile: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    },
    message: 'Profile retrieved successfully'
  });
});

// Logout endpoint
app.post('/api/auth/logout', authenticate, (req, res) => {
  // In a real implementation, you'd add the token to a blacklist or similar
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Auth test server running on port ${PORT}`);
});