const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');
const authMiddleware = require('../middleware/auth');
const cacheMiddleware = require('../middleware/cache');
const rateLimiter = require('../middleware/rate-limiter');
const { standardLimiter } = rateLimiter;

// Profile service proxy options
const profileServiceProxy = createProxyMiddleware({
  target: services.profile.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/profile': '/api/profile' // No rewrite needed, keeping path as is
  },
  timeout: services.profile.timeout,
  proxyTimeout: services.profile.timeout,
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
});

// All profile routes require authentication
router.use(authMiddleware.verifyToken);

// Apply rate limiting
router.use(standardLimiter);

// Routes that can be cached
router.get('/', cacheMiddleware(60), profileServiceProxy); // Cache for 1 minute
router.get('/preferences', cacheMiddleware(60), profileServiceProxy); // Cache for 1 minute
router.get('/modules', cacheMiddleware(300), profileServiceProxy); // Cache for 5 minutes

// Routes that don't need caching
router.put('/', profileServiceProxy);
router.put('/preferences', profileServiceProxy);
router.post('/upload-avatar', profileServiceProxy);
router.put('/modules', profileServiceProxy);

// Default route handler for any other profile routes
router.use('/', profileServiceProxy);

module.exports = router;