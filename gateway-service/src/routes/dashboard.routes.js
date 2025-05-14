const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');
const authMiddleware = require('../middleware/auth');
const cacheMiddleware = require('../middleware/cache');
const rateLimiter = require('../middleware/rate-limiter');
const { standardLimiter } = rateLimiter;

// Dashboard service proxy options
const dashboardServiceProxy = createProxyMiddleware({
  target: services.dashboard.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/dashboard': '/api/dashboard' // No rewrite needed, keeping path as is
  },
  timeout: services.dashboard.timeout,
  proxyTimeout: services.dashboard.timeout,
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
});

// All dashboard routes require authentication
router.use(authMiddleware.verifyToken);

// Apply rate limiting
router.use(standardLimiter);

// Routes that can be cached
router.get('/', cacheMiddleware(60), dashboardServiceProxy); // Cache for 1 minute
router.get('/widget/:id', cacheMiddleware(30), dashboardServiceProxy); // Cache for 30 seconds

// Routes that don't need caching
router.post('/', dashboardServiceProxy);
router.put('/', dashboardServiceProxy);
router.post('/refresh', dashboardServiceProxy);
router.post('/cache/clear', dashboardServiceProxy);
router.put('/widget/:id', dashboardServiceProxy);
router.delete('/widget/:id', dashboardServiceProxy);

// Default route handler for any other dashboard routes
router.use('/', dashboardServiceProxy);

module.exports = router;