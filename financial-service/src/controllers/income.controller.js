const Income = require('../models/income.model');
const incomeService = require('../services/income.service');

/**
 * Create a new income entry
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function createIncome(req, res) {
  try {
    const userId = req.user.id;
    const incomeData = {
      ...req.body,
      userId
    };

    const income = await incomeService.createIncome(incomeData);

    res.status(201).json({
      success: true,
      message: 'Income entry created successfully',
      data: {
        income
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
 * Get all income entries for a user with filtering and pagination
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getIncomes(req, res) {
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
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const incomes = await incomeService.getIncomes(
      userId,
      {
        limit: parseInt(limit),
        page: parseInt(page),
        startDate,
        endDate,
        category,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
        sortBy,
        sortOrder
      }
    );

    res.status(200).json({
      success: true,
      data: {
        incomes,
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
 * Get a specific income entry by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getIncomeById(req, res) {
  try {
    const userId = req.user.id;
    const incomeId = req.params.id;

    const income = await incomeService.getIncomeById(userId, incomeId);

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income entry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        income
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
 * Update an income entry
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function updateIncome(req, res) {
  try {
    const userId = req.user.id;
    const incomeId = req.params.id;
    const updateData = req.body;

    const income = await incomeService.updateIncome(userId, incomeId, updateData);

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Income entry updated successfully',
      data: {
        income
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
 * Delete an income entry
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function deleteIncome(req, res) {
  try {
    const userId = req.user.id;
    const incomeId = req.params.id;

    const result = await incomeService.deleteIncome(userId, incomeId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Income entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Income entry deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Add an attachment to an income entry
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function addAttachment(req, res) {
  try {
    const userId = req.user.id;
    const incomeId = req.params.id;
    
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

    const income = await incomeService.addAttachment(userId, incomeId, attachment);

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Attachment added successfully',
      data: {
        income
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
 * Get income statistics
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getIncomeStats(req, res) {
  try {
    const userId = req.user.id;
    const { period = 'month', category } = req.query;

    const stats = await incomeService.getIncomeStats(userId, period, category);

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

module.exports = {
  createIncome,
  getIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
  addAttachment,
  getIncomeStats
};