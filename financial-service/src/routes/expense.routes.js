const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate } = require('../middleware/auth.middleware');
const expenseController = require('../controllers/expense.controller');

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

// Create a new expense entry
router.post('/', expenseController.createExpense);

// Get all expense entries for the user
router.get('/', expenseController.getExpenses);

// Get expense statistics
router.get('/stats', expenseController.getExpenseStats);

// Get cash flow analysis
router.get('/cash-flow', expenseController.getCashFlowAnalysis);

// Get a specific expense entry by ID
router.get('/:id', expenseController.getExpenseById);

// Update an expense entry
router.put('/:id', expenseController.updateExpense);

// Add attachment to expense entry
router.post('/:id/attachments', upload.single('file'), expenseController.addAttachment);

// Delete an expense entry
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;