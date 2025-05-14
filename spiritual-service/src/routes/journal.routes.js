const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate } = require('../middleware/auth.middleware');
const journalController = require('../controllers/journal.controller');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024 // 5MB default
  }
});

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new journal entry
router.post('/', journalController.createJournalEntry);

// Get all journal entries for the user
router.get('/', journalController.getJournalEntries);

// Get journal statistics
router.get('/stats', journalController.getJournalStats);

// Get a specific journal entry by ID
router.get('/:id', journalController.getJournalEntryById);

// Update a journal entry
router.put('/:id', journalController.updateJournalEntry);

// Toggle favorite status
router.patch('/:id/favorite', journalController.toggleFavorite);

// Add attachment to journal entry
router.post('/:id/attachments', upload.single('file'), journalController.addAttachment);

// Delete a journal entry
router.delete('/:id', journalController.deleteJournalEntry);

module.exports = router;