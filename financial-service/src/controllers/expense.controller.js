const Expense = require('../models/expense.model');
const expenseService = require('../services/expense.service');

/**
 * Create a new expense entry
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function createExpense(req, res) {
  try {
    const userId = req.user.id;
    const expenseData = {
      ...req.body,
      userId
    };

    const expense = await expenseService.createExpense(expenseData);

    res.status(201).json({
      success: true,
      message: 'Expense entry created successfully',
      data: {
        expense
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
 * Get all expense entries for a user with filtering and pagination
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getExpenses(req, res) {
  try {
    const userId = req.user.id;
    const { 
      limit = 20, 
      page = 1, 
      startDate, 
      endDate, 
      category,
      minAmount,
      maxAmount,
      paymentMethod,
      isTaxDeductible,
      isPlanned,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const expenses = await expenseService.getExpenses(
      userId,
      {
        limit: parseInt(limit),
        page: parseInt(page),
        startDate,
        endDate,
        category,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
        paymentMethod,
        isTaxDeductible: isTaxDeductible === 'true',
        isPlanned: isPlanned === 'true',
        sortBy,
        sortOrder
      }
    );

    res.status(200).json({
      success: true,
      data: {
        expenses,
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
 * Get a specific expense entry by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getExpenseById(req, res) {
  try {
    const userId = req.user.id;
    const expenseId = req.params.id;

    const expense = await expenseService.getExpenseById(userId, expenseId);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense entry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        expense
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
 * Update an expense entry
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function updateExpense(req, res) {
  try {
    const userId = req.user.id;
    const expenseId = req.params.id;
    const updateData = req.body;

    const expense = await expenseService.updateExpense(userId, expenseId, updateData);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense entry updated successfully',
      data: {
        expense
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
 * Delete an expense entry
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function deleteExpense(req, res) {
  try {
    const userId = req.user.id;
    const expenseId = req.params.id;

    const result = await expenseService.deleteExpense(userId, expenseId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Expense entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense entry deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Add an attachment to an expense entry
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function addAttachment(req, res) {
  try {
    const userId = req.user.id;
    const expenseId = req.params.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const attachment = {
      name: req.file.originalname,
      type: req.file.mimetype,
      file: req.file
    };

    const expense = await expenseService.addAttachment(userId, expenseId, attachment);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Attachment added successfully',
      data: {
        expense
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
 * Get expense statistics
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getExpenseStats(req, res) {
  try {
    const userId = req.user.id;
    const { period = 'month', category } = req.query;

    const stats = await expenseService.getExpenseStats(userId, period, category);

    res.status(200).json({
      success: true,
      data: {
        stats
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
 * Get cash flow analysis (comparing income vs expenses)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getCashFlowAnalysis(req, res) {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;

    const cashFlowAnalysis = await expenseService.getCashFlowAnalysis(userId, period);

    res.status(200).json({
      success: true,
      data: {
        cashFlowAnalysis
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
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  addAttachment,
  getExpenseStats,
  getCashFlowAnalysis
};