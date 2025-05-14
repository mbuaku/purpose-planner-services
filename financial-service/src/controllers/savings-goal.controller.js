const savingsGoalService = require('../services/savings-goal.service');
const multer = require('multer');
const path = require('path');

// Configure file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedFileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedFileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
}).single('image');

// Create a new savings goal
async function createSavingsGoal(req, res) {
  try {
    const userId = req.user.id;
    const goalData = req.body;

    const savingsGoal = await savingsGoalService.createSavingsGoal(userId, goalData);

    return res.status(201).json({
      success: true,
      data: savingsGoal
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Get all savings goals with filtering
async function getSavingsGoals(req, res) {
  try {
    const userId = req.user.id;
    const {
      completed, category, priority, startDate, targetDate,
      sortBy, sortOrder, page, limit
    } = req.query;

    const filters = {
      completed: completed === 'true' ? true : completed === 'false' ? false : undefined,
      category,
      priority,
      startDate,
      targetDate,
      sortBy,
      sortOrder,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined
    };

    const savingsGoals = await savingsGoalService.getSavingsGoals(userId, filters);

    return res.status(200).json({
      success: true,
      data: savingsGoals
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Get a single savings goal by ID
async function getSavingsGoalById(req, res) {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;

    const savingsGoal = await savingsGoalService.getSavingsGoalById(userId, goalId);

    if (!savingsGoal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: savingsGoal
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Update a savings goal
async function updateSavingsGoal(req, res) {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;
    const updateData = req.body;

    const updatedGoal = await savingsGoalService.updateSavingsGoal(
      userId,
      goalId,
      updateData
    );

    if (!updatedGoal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedGoal
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Delete a savings goal
async function deleteSavingsGoal(req, res) {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;

    const deleted = await savingsGoalService.deleteSavingsGoal(userId, goalId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Savings goal deleted successfully'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Add a contribution to a savings goal
async function addContribution(req, res) {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;
    const contributionData = req.body;

    // Ensure amount is a number
    if (contributionData.amount) {
      contributionData.amount = parseFloat(contributionData.amount);
    }

    const updatedGoal = await savingsGoalService.addContribution(
      userId,
      goalId,
      contributionData
    );

    if (!updatedGoal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedGoal
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Add a withdrawal from a savings goal
async function addWithdrawal(req, res) {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;
    const withdrawalData = req.body;

    // Ensure amount is a number
    if (withdrawalData.amount) {
      withdrawalData.amount = parseFloat(withdrawalData.amount);
    }

    const updatedGoal = await savingsGoalService.addWithdrawal(
      userId,
      goalId,
      withdrawalData
    );

    if (!updatedGoal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedGoal
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Get contribution history for a savings goal
async function getContributionHistory(req, res) {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;

    const contributions = await savingsGoalService.getContributionHistory(userId, goalId);

    if (contributions === null) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: contributions
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Get withdrawal history for a savings goal
async function getWithdrawalHistory(req, res) {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;

    const withdrawals = await savingsGoalService.getWithdrawalHistory(userId, goalId);

    if (withdrawals === null) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: withdrawals
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Mark a savings goal as complete
async function completeGoal(req, res) {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;

    const updatedGoal = await savingsGoalService.completeGoal(userId, goalId);

    if (!updatedGoal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedGoal
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Get savings goal progress
async function getGoalProgress(req, res) {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;

    const progress = await savingsGoalService.getGoalProgress(userId, goalId);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Get savings goals summary
async function getSavingsGoalsSummary(req, res) {
  try {
    const userId = req.user.id;

    const summary = await savingsGoalService.getSavingsGoalsSummary(userId);

    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Get savings forecast
async function getSavingsForecast(req, res) {
  try {
    const userId = req.user.id;
    const { goalId } = req.params;
    const { monthsAhead } = req.query;

    const forecast = await savingsGoalService.getSavingsForecast(
      userId,
      goalId,
      monthsAhead ? parseInt(monthsAhead) : 12
    );

    if (!forecast) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: forecast
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// Add or update an image for a savings goal
async function addOrUpdateImage(req, res) {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload an image file'
        });
      }

      const userId = req.user.id;
      const { goalId } = req.params;

      const updatedGoal = await savingsGoalService.addOrUpdateImage(
        userId,
        goalId,
        req.file
      );

      if (!updatedGoal) {
        return res.status(404).json({
          success: false,
          message: 'Savings goal not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: updatedGoal
      });
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  createSavingsGoal,
  getSavingsGoals,
  getSavingsGoalById,
  updateSavingsGoal,
  deleteSavingsGoal,
  addContribution,
  addWithdrawal,
  getContributionHistory,
  getWithdrawalHistory,
  completeGoal,
  getGoalProgress,
  getSavingsGoalsSummary,
  getSavingsForecast,
  addOrUpdateImage
};