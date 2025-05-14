const Budget = require('../models/budget.model');
const budgetService = require('../services/budget.service');

/**
 * Create a new budget
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function createBudget(req, res) {
  try {
    const userId = req.user.id;
    const budgetData = {
      ...req.body,
      userId
    };

    const budget = await budgetService.createBudget(budgetData);

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: {
        budget
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Get all budgets for a user with filtering and pagination
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getBudgets(req, res) {
  try {
    const userId = req.user.id;
    const { 
      limit = 10, 
      page = 1, 
      startDate, 
      endDate, 
      status,
      type,
      sortBy = 'startDate',
      sortOrder = 'desc'
    } = req.query;

    const budgets = await budgetService.getBudgets(
      userId,
      {
        limit: parseInt(limit),
        page: parseInt(page),
        startDate,
        endDate,
        status,
        type,
        sortBy,
        sortOrder
      }
    );

    res.status(200).json({
      success: true,
      data: {
        budgets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Get active budgets for a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getActiveBudgets(req, res) {
  try {
    const userId = req.user.id;

    const budgets = await budgetService.getActiveBudgets(userId);

    res.status(200).json({
      success: true,
      data: {
        budgets
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Get a specific budget by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getBudgetById(req, res) {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;

    const budget = await budgetService.getBudgetById(userId, budgetId);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        budget
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Update a budget
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function updateBudget(req, res) {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;
    const updateData = req.body;

    const budget = await budgetService.updateBudget(userId, budgetId, updateData);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully',
      data: {
        budget
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Update a budget category
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function updateBudgetCategory(req, res) {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;
    const { category, plannedAmount, actualAmount, notes } = req.body;

    if (!category || plannedAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Category and plannedAmount are required'
      });
    }

    const budget = await budgetService.updateBudgetCategory(
      userId, 
      budgetId, 
      category, 
      plannedAmount, 
      actualAmount, 
      notes
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Budget category updated successfully',
      data: {
        budget
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Mark a budget as completed
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function completeBudget(req, res) {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;

    const budget = await budgetService.completeBudget(userId, budgetId);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Budget marked as completed',
      data: {
        budget
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Archive a budget
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function archiveBudget(req, res) {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;

    const budget = await budgetService.archiveBudget(userId, budgetId);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Budget archived successfully',
      data: {
        budget
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Delete a budget
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function deleteBudget(req, res) {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;

    const result = await budgetService.deleteBudget(userId, budgetId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Get budget performance statistics
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getBudgetPerformance(req, res) {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;

    const performance = await budgetService.getBudgetPerformance(userId, budgetId);

    if (!performance) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        performance
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Create a recurring budget based on an existing budget
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function createRecurringBudget(req, res) {
  try {
    const userId = req.user.id;
    const budgetId = req.params.id;
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const budget = await budgetService.createRecurringBudget(userId, budgetId, startDate, endDate);

    res.status(201).json({
      success: true,
      message: 'Recurring budget created successfully',
      data: {
        budget
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  createBudget,
  getBudgets,
  getActiveBudgets,
  getBudgetById,
  updateBudget,
  updateBudgetCategory,
  completeBudget,
  archiveBudget,
  deleteBudget,
  getBudgetPerformance,
  createRecurringBudget
};