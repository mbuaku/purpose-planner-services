const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');
const authMiddleware = require('../middleware/auth');
const cacheMiddleware = require('../middleware/cache');
const rateLimiter = require('../middleware/rate-limiter');
const { standardLimiter } = rateLimiter;

// Schedule service proxy options
const scheduleServiceProxy = createProxyMiddleware({
  target: services.schedule.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/schedule': '/api' // Rewrite path to match schedule service API structure
  },
  timeout: services.schedule.timeout,
  proxyTimeout: services.schedule.timeout,
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
});

// All schedule routes require authentication
router.use(authMiddleware.verifyToken);

// Apply rate limiting
router.use(standardLimiter);

// Event routes
router.get('/events', cacheMiddleware(60), scheduleServiceProxy); // Cache for 1 minute
router.get('/events/:id', cacheMiddleware(60), scheduleServiceProxy); // Cache for 1 minute
router.post('/events', scheduleServiceProxy);
router.put('/events/:id', scheduleServiceProxy);
router.delete('/events/:id', scheduleServiceProxy);
router.put('/events/:id/complete', scheduleServiceProxy);

// Time-specific event endpoints
router.get('/events/today', cacheMiddleware(60), scheduleServiceProxy); // Cache for 1 minute
router.get('/events/week', cacheMiddleware(300), scheduleServiceProxy); // Cache for 5 minutes
router.get('/events/month', cacheMiddleware(600), scheduleServiceProxy); // Cache for 10 minutes

// Recurring event routes
router.get('/events/recurring', cacheMiddleware(300), scheduleServiceProxy); // Cache for 5 minutes
router.get('/events/recurring/:id', cacheMiddleware(60), scheduleServiceProxy); // Cache for 1 minute
router.post('/events/recurring', scheduleServiceProxy);
router.put('/events/recurring/:id', scheduleServiceProxy);
router.delete('/events/recurring/:id', scheduleServiceProxy);

// Default route handler for any other schedule routes
router.use('/', scheduleServiceProxy);

module.exports = router;