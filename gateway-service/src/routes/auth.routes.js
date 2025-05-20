const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');
const rateLimiter = require('../middleware/rate-limiter');
const cacheMiddleware = require('../middleware/cache');
const { authLimiter } = rateLimiter;

// Auth service proxy options
const authServiceProxy = createProxyMiddleware({
  target: services.auth.url,
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '/api/auth' // Rewrite from /auth to /api/auth
  },
  timeout: services.auth.timeout,
  proxyTimeout: services.auth.timeout,
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
});

// Apply rate limiter to auth routes
router.use(authLimiter);

// Routes that don't need caching
router.post('/register', authServiceProxy);
router.post('/login', authServiceProxy);
router.post('/logout', authServiceProxy);
router.post('/refresh-token', authServiceProxy);
router.post('/reset-password', authServiceProxy);
router.post('/forgot-password', authServiceProxy);

// Routes that can be cached
router.get('/profile', cacheMiddleware(60), authServiceProxy); // Cache for 1 minute
router.get('/check', cacheMiddleware(5), authServiceProxy); // Cache for 5 seconds

// OAuth routes
router.get('/google', authServiceProxy);
router.get('/google/callback', authServiceProxy);

// Default route handler for any other auth routes
router.use('/', authServiceProxy);

module.exports = router;