const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authenticate);

// Regular event routes
router.post('/', eventController.createEvent);
router.get('/', eventController.getEvents);
router.get('/today', eventController.getTodayEvents);
router.get('/week', eventController.getWeekEvents);
router.get('/month', eventController.getMonthEvents);
router.get('/:id', eventController.getEventById);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
router.put('/:id/complete', eventController.completeEvent);

// Recurring event routes
router.post('/recurring', eventController.createRecurringEvent);
router.get('/recurring', eventController.getRecurringEvents);
router.get('/recurring/:id', eventController.getRecurringEventById);
router.put('/recurring/:id', eventController.updateRecurringEvent);
router.delete('/recurring/:id', eventController.deleteRecurringEvent);

module.exports = router;