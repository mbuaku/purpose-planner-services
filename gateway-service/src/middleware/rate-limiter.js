const rateLimit = require('express-rate-limit');

/**
 * Rate limiting middleware for different types of routes
 */
const rateLimiter = {
  /**
   * General API rate limiter
   * Default: 100 requests per minute
   */
  apiLimiter: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      success: false,
      message: 'Too many requests, please try again later'
    },
    keyGenerator: (req) => {
      // Use IP and user ID (if available) as key
      return req.user ? `${req.ip}:${req.user.id}` : req.ip;
    }
  }),

  /**
   * Authentication routes rate limiter
   * Stricter limits for auth routes to prevent brute force
   */
  authLimiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again after 15 minutes'
    },
    keyGenerator: (req) => {
      // Use IP as key for auth routes
      return req.ip;
    }
  }),

  /**
   * Standard API routes rate limiter
   * Default: 60 requests per minute
   */
  standardLimiter: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later'
    },
    keyGenerator: (req) => {
      // Use IP and user ID as key
      return req.user ? `${req.ip}:${req.user.id}` : req.ip;
    }
  }),

  /**
   * Create custom rate limiter
   * @param {Object} options - Rate limiter options
   * @returns {Function} Express middleware
   */
  createCustomLimiter: (options) => {
    return rateLimit({
      windowMs: options.windowMs || 60 * 1000, // Default: 1 minute
      max: options.max || 60, // Default: 60 requests per minute
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: options.message || 'Too many requests, please try again later'
      },
      keyGenerator: options.keyGenerator || ((req) => {
        // Default key generator
        return req.user ? `${req.ip}:${req.user.id}` : req.ip;
      }),
      skip: options.skip || (() => false) // Default: don't skip any requests
    });
  }
};

module.exports = rateLimiter;