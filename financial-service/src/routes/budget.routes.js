const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const budgetController = require('../controllers/budget.controller');

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new budget
router.post('/', budgetController.createBudget);

// Get all budgets for the user
router.get('/', budgetController.getBudgets);

// Get active budgets for the user
router.get('/active', budgetController.getActiveBudgets);

// Get a specific budget by ID
router.get('/:id', budgetController.getBudgetById);

// Update a budget
router.put('/:id', budgetController.updateBudget);

// Update a budget category
router.patch('/:id/category', budgetController.updateBudgetCategory);

// Mark a budget as completed
router.patch('/:id/complete', budgetController.completeBudget);

// Archive a budget
router.patch('/:id/archive', budgetController.archiveBudget);

// Get budget performance statistics
router.get('/:id/performance', budgetController.getBudgetPerformance);

// Create a recurring budget based on an existing budget
router.post('/:id/recurring', budgetController.createRecurringBudget);

// Delete a budget
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;