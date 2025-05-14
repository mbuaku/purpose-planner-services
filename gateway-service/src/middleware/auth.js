const jwt = require('jsonwebtoken');
const axios = require('axios');
const services = require('../config/services');

/**
 * Authentication middleware module for API Gateway
 */
const authMiddleware = {
  /**
   * Middleware to verify JWT token
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  verifyToken: async (req, res, next) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required. No token provided.'
        });
      }

      // Extract token
      const token = authHeader.split(' ')[1];

      try {
        // Verify token locally first
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user info to request
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role
        };
        
        next();
      } catch (tokenError) {
        // If local validation fails, check with auth service
        try {
          const response = await axios.get(`${services.auth.url}/api/auth/check`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            timeout: services.auth.timeout
          });

          if (response.data && response.data.success) {
            // Token is valid according to auth service
            req.user = response.data.user;
            next();
          } else {
            return res.status(401).json({
              success: false,
              message: 'Invalid token'
            });
          }
        } catch (authServiceError) {
          req.logger && req.logger.error('Auth service check failed:', authServiceError);
          
          return res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: 'Token validation failed'
          });
        }
      }
    } catch (error) {
      req.logger && req.logger.error('Authentication error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Authentication failed',
        error: error.message
      });
    }
  },

  /**
   * Middleware to check if user has admin role
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware function
   */
  isAdmin: (req, res, next) => {
    // Check if user exists and has admin role
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    next();
  },

  /**
   * Middleware to check if user has required role
   * @param {Array} roles - Array of allowed roles
   * @returns {Function} Middleware function
   */
  hasRole: (roles) => {
    return (req, res, next) => {
      // Check if user exists and has required role
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${roles.join(' or ')}.`
        });
      }

      next();
    };
  }
};

module.exports = authMiddleware;