const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');
const authMiddleware = require('../middleware/auth');
const cacheMiddleware = require('../middleware/cache');
const rateLimiter = require('../middleware/rate-limiter');
const { standardLimiter } = rateLimiter;

// Spiritual service proxy options
const spiritualServiceProxy = createProxyMiddleware({
  target: services.spiritual.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/spiritual': '/api' // Rewrite path to match spiritual service API structure
  },
  timeout: services.spiritual.timeout,
  proxyTimeout: services.spiritual.timeout,
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
});

// All spiritual routes require authentication
router.use(authMiddleware.verifyToken);

// Apply rate limiting
router.use(standardLimiter);

// Prayer routes
router.get('/prayers', cacheMiddleware(60), spiritualServiceProxy); // Cache for 1 minute
router.get('/prayers/:id', cacheMiddleware(60), spiritualServiceProxy); // Cache for 1 minute
router.post('/prayers', spiritualServiceProxy);
router.put('/prayers/:id', spiritualServiceProxy);
router.delete('/prayers/:id', spiritualServiceProxy);
router.put('/prayers/:id/answered', spiritualServiceProxy);

// Journal routes
router.get('/journal', cacheMiddleware(60), spiritualServiceProxy); // Cache for 1 minute
router.get('/journal/:id', cacheMiddleware(60), spiritualServiceProxy); // Cache for 1 minute
router.post('/journal', spiritualServiceProxy);
router.put('/journal/:id', spiritualServiceProxy);
router.delete('/journal/:id', spiritualServiceProxy);

// Bible reading routes
router.get('/bible-reading', cacheMiddleware(60), spiritualServiceProxy); // Cache for 1 minute
router.get('/bible-reading/:id', cacheMiddleware(60), spiritualServiceProxy); // Cache for 1 minute
router.post('/bible-reading', spiritualServiceProxy);
router.put('/bible-reading/:id', spiritualServiceProxy);
router.delete('/bible-reading/:id', spiritualServiceProxy);

// Prayer session routes
router.get('/prayer-session', cacheMiddleware(60), spiritualServiceProxy); // Cache for 1 minute
router.get('/prayer-session/:id', cacheMiddleware(60), spiritualServiceProxy); // Cache for 1 minute
router.post('/prayer-session', spiritualServiceProxy);
router.put('/prayer-session/:id', spiritualServiceProxy);
router.delete('/prayer-session/:id', spiritualServiceProxy);

// Summary endpoint
router.get('/summary', cacheMiddleware(300), spiritualServiceProxy); // Cache for 5 minutes

// Default route handler for any other spiritual routes
router.use('/', spiritualServiceProxy);

module.exports = router;