const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const savingsGoalController = require('../controllers/savings-goal.controller');

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new savings goal
router.post('/', savingsGoalController.createSavingsGoal);

// Get all savings goals for the user (with filtering)
router.get('/', savingsGoalController.getSavingsGoals);

// Get savings goals summary statistics
router.get('/summary', savingsGoalController.getSavingsGoalsSummary);

// Get a specific savings goal by ID
router.get('/:goalId', savingsGoalController.getSavingsGoalById);

// Update a savings goal
router.put('/:goalId', savingsGoalController.updateSavingsGoal);

// Delete a savings goal
router.delete('/:goalId', savingsGoalController.deleteSavingsGoal);

// Add a contribution to a savings goal
router.post('/:goalId/contributions', savingsGoalController.addContribution);

// Get contribution history for a savings goal
router.get('/:goalId/contributions', savingsGoalController.getContributionHistory);

// Add a withdrawal from a savings goal
router.post('/:goalId/withdrawals', savingsGoalController.addWithdrawal);

// Get withdrawal history for a savings goal
router.get('/:goalId/withdrawals', savingsGoalController.getWithdrawalHistory);

// Mark a savings goal as complete
router.post('/:goalId/complete', savingsGoalController.completeGoal);

// Get savings goal progress details
router.get('/:goalId/progress', savingsGoalController.getGoalProgress);

// Get savings goal forecast
router.get('/:goalId/forecast', savingsGoalController.getSavingsForecast);

// Add or update an image for a savings goal
router.post('/:goalId/image', savingsGoalController.addOrUpdateImage);

module.exports = router;