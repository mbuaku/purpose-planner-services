const jwt = require('jsonwebtoken');

// Use User model if available, otherwise use in-memory database
let User;
try {
  User = require('../models/user.model');
} catch (error) {
  console.log('Using in-memory database for authentication');
}

/**
 * Middleware to authenticate users
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
async function authenticate(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'purpose_planner_secret_key_development_only');

    let user;
    
    if (global.inMemoryDB) {
      // Using in-memory database
      user = global.inMemoryDB.findUserById(decoded.id);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token or user does not exist',
        });
      }
    } else {
      // Using MongoDB
      // Find user
      user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token or user does not exist',
        });
      }
    }

    // Add user to request object
    req.user = {
      id: user._id || user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
    });
  }
}

/**
 * Middleware to authorize admin users
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
function authorizeAdmin(req, res, next) {
  // Check if user exists and has admin role
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }

  next();
}

module.exports = {
  authenticate,
  authorizeAdmin,
};