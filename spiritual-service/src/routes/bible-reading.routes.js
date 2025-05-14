const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const bibleReadingController = require('../controllers/bible-reading.controller');

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new Bible reading
router.post('/', bibleReadingController.createBibleReading);

// Get all Bible readings for the user
router.get('/', bibleReadingController.getBibleReadings);

// Get Bible reading statistics
router.get('/stats', bibleReadingController.getBibleReadingStats);

// Get a specific Bible reading by ID
router.get('/:id', bibleReadingController.getBibleReadingById);

// Update a Bible reading
router.put('/:id', bibleReadingController.updateBibleReading);

// Delete a Bible reading
router.delete('/:id', bibleReadingController.deleteBibleReading);

module.exports = router;