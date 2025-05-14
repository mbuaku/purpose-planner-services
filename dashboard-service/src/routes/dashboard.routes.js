const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate, checkCacheStatus } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Dashboard routes
router.get('/', dashboardController.getUserDashboard);
router.post('/', dashboardController.createOrUpdateDashboard);
router.put('/', dashboardController.createOrUpdateDashboard); // Allow PUT as alternative
router.post('/refresh', dashboardController.refreshAllWidgets);
router.post('/cache/clear', dashboardController.clearDashboardCache);

// Widget routes
router.get('/widget/:id', checkCacheStatus, dashboardController.getWidgetData);
router.put('/widget/:id', dashboardController.updateWidget);
router.delete('/widget/:id', dashboardController.deleteWidget);

module.exports = router;