const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const prayerSessionController = require('../controllers/prayer-session.controller');

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new prayer session
router.post('/', prayerSessionController.createPrayerSession);

// Get all prayer sessions for the user
router.get('/', prayerSessionController.getPrayerSessions);

// Get prayer session statistics
router.get('/stats', prayerSessionController.getPrayerSessionStats);

// Get a specific prayer session by ID
router.get('/:id', prayerSessionController.getPrayerSessionById);

// Update a prayer session
router.put('/:id', prayerSessionController.updatePrayerSession);

// End an active prayer session
router.patch('/:id/end', prayerSessionController.endPrayerSession);

// Delete a prayer session
router.delete('/:id', prayerSessionController.deletePrayerSession);

module.exports = router;