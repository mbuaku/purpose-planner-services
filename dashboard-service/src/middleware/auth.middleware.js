const jwt = require('jsonwebtoken');
const axios = require('axios');
const winston = require('winston');

// Create logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

/**
 * Middleware to authenticate users by verifying the JWT token
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

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Add user to request object
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      next();
    } catch (tokenError) {
      // If local validation fails, check with auth service
      try {
        const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
        const response = await axios.get(`${authServiceUrl}/api/auth/check`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data && response.data.success) {
          // Token is valid according to auth service
          req.user = response.data.user;
          next();
        } else {
          return res.status(401).json({
            success: false,
            message: 'Invalid token',
          });
        }
      } catch (authServiceError) {
        logger.error('Auth service validation error:', authServiceError);
        
        return res.status(401).json({
          success: false,
          message: 'Authentication failed',
          error: 'Token validation failed',
        });
      }
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    
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

/**
 * Middleware to check if cache is enabled
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
function checkCacheStatus(req, res, next) {
  // Add cache check to request object
  req.useCache = req.query.noCache !== 'true';
  next();
}

module.exports = {
  authenticate,
  authorizeAdmin,
  checkCacheStatus
};