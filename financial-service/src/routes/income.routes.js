const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate } = require('../middleware/auth.middleware');
const incomeController = require('../controllers/income.controller');

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

// Create a new income entry
router.post('/', incomeController.createIncome);

// Get all income entries for the user
router.get('/', incomeController.getIncomes);

// Get income statistics
router.get('/stats', incomeController.getIncomeStats);

// Get a specific income entry by ID
router.get('/:id', incomeController.getIncomeById);

// Update an income entry
router.put('/:id', incomeController.updateIncome);

// Add attachment to income entry
router.post('/:id/attachments', upload.single('file'), incomeController.addAttachment);

// Delete an income entry
router.delete('/:id', incomeController.deleteIncome);

module.exports = router;