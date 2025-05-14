const express = require('express');
const router = express.Router();

// Import service routes
const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes');
const financialRoutes = require('./financial.routes');
const profileRoutes = require('./profile.routes');
const scheduleRoutes = require('./schedule.routes');
const spiritualRoutes = require('./spiritual.routes');

// Mount routes for each service
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/financial', financialRoutes);
router.use('/profile', profileRoutes);
router.use('/schedule', scheduleRoutes);
router.use('/spiritual', spiritualRoutes);

// API documentation route
router.get('/api-docs', (req, res) => {
  res.redirect('/swagger-ui');
});

// Service discovery endpoint
router.get('/services', (req, res) => {
  const services = [
    { 
      name: 'auth-service', 
      status: 'active', 
      version: '1.0.0',
      endpoints: ['/api/auth/register', '/api/auth/login', '/api/auth/profile'] 
    },
    { 
      name: 'dashboard-service', 
      status: 'active', 
      version: '1.0.0',
      endpoints: ['/api/dashboard', '/api/dashboard/widget/:id'] 
    },
    { 
      name: 'financial-service', 
      status: 'active', 
      version: '1.0.0',
      endpoints: ['/api/financial/budget', '/api/financial/expenses'] 
    },
    { 
      name: 'profile-service', 
      status: 'active', 
      version: '1.0.0',
      endpoints: ['/api/profile', '/api/profile/preferences'] 
    },
    { 
      name: 'schedule-service', 
      status: 'active', 
      version: '1.0.0',
      endpoints: ['/api/schedule/events', '/api/schedule/events/:id'] 
    },
    { 
      name: 'spiritual-service', 
      status: 'active', 
      version: '1.0.0',
      endpoints: ['/api/spiritual/prayers', '/api/spiritual/journal'] 
    }
  ];

  res.status(200).json({
    success: true,
    message: 'Services discovery',
    data: {
      services
    }
  });
});

module.exports = router;