const express = require('express');
const router = express.Router();
const { createProxyMiddleware } = require('http-proxy-middleware');
const services = require('../config/services');
const authMiddleware = require('../middleware/auth');
const cacheMiddleware = require('../middleware/cache');
const rateLimiter = require('../middleware/rate-limiter');
const { standardLimiter } = rateLimiter;

// Financial service proxy options
const financialServiceProxy = createProxyMiddleware({
  target: services.financial.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/financial': '/api' // Rewrite path to match financial service API structure
  },
  timeout: services.financial.timeout,
  proxyTimeout: services.financial.timeout,
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
});

// All financial routes require authentication
router.use(authMiddleware.verifyToken);

// Apply rate limiting
router.use(standardLimiter);

// Budget routes
router.get('/budget', cacheMiddleware(300), financialServiceProxy); // Cache for 5 minutes
router.post('/budget', financialServiceProxy);
router.put('/budget', financialServiceProxy);
router.delete('/budget', financialServiceProxy);

// Expenses routes
router.get('/expenses', cacheMiddleware(180), financialServiceProxy); // Cache for 3 minutes
router.post('/expenses', financialServiceProxy);
router.put('/expenses/:id', financialServiceProxy);
router.delete('/expenses/:id', financialServiceProxy);

// Income routes
router.get('/income', cacheMiddleware(180), financialServiceProxy); // Cache for 3 minutes
router.post('/income', financialServiceProxy);
router.put('/income/:id', financialServiceProxy);
router.delete('/income/:id', financialServiceProxy);

// Savings goals routes
router.get('/savings-goals', cacheMiddleware(300), financialServiceProxy); // Cache for 5 minutes
router.post('/savings-goals', financialServiceProxy);
router.put('/savings-goals/:id', financialServiceProxy);
router.delete('/savings-goals/:id', financialServiceProxy);

// Summary endpoints
router.get('/summary', cacheMiddleware(600), financialServiceProxy); // Cache for 10 minutes
router.get('/summary/monthly', cacheMiddleware(600), financialServiceProxy); // Cache for 10 minutes
router.get('/summary/yearly', cacheMiddleware(600), financialServiceProxy); // Cache for 10 minutes

// Default route handler for any other financial routes
router.use('/', financialServiceProxy);

module.exports = router;