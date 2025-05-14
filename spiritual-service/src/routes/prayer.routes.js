const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const prayerController = require('../controllers/prayer.controller');

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new prayer
router.post('/', prayerController.createPrayer);

// Get all prayers for the user
router.get('/', prayerController.getPrayers);

// Get prayer statistics
router.get('/stats', prayerController.getPrayerStats);

// Get a specific prayer by ID
router.get('/:id', prayerController.getPrayerById);

// Update a prayer
router.put('/:id', prayerController.updatePrayer);

// Mark a prayer as answered
router.patch('/:id/answered', prayerController.markPrayerAsAnswered);

// Toggle favorite status
router.patch('/:id/favorite', prayerController.toggleFavorite);

// Archive a prayer
router.patch('/:id/archive', prayerController.archivePrayer);

// Delete a prayer
router.delete('/:id', prayerController.deletePrayer);

module.exports = router;