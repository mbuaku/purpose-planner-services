const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const SavingsGoal = require('../models/savings-goal.model');

// In-memory database for use when MongoDB is not available
let inMemoryDB = {
  savingsGoals: []
};

// Utility function to get the in-memory savings goals for a user
function getInMemorySavingsGoals() {
  return inMemoryDB.savingsGoals;
}

// Check if we're using in-memory storage
function isUsingInMemory() {
  return mongoose.connection.readyState !== 1;
}

/**
 * Create a new savings goal
 */
async function createSavingsGoal(userId, goalData) {
  try {
    if (isUsingInMemory()) {
      const newGoal = {
        _id: Date.now().toString(),
        userId,
        ...goalData,
        currentAmount: goalData.currentAmount || 0,
        contributions: goalData.contributions || [],
        withdrawals: goalData.withdrawals || [],
        completed: goalData.completed || false,
        startDate: goalData.startDate || new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryDB.savingsGoals.push(newGoal);
      return newGoal;
    } else {
      const savingsGoal = new SavingsGoal({
        userId,
        ...goalData
      });
      await savingsGoal.save();
      return savingsGoal;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get all savings goals for a user with optional filtering
 */
async function getSavingsGoals(userId, filters = {}) {
  try {
    const query = { userId };
    
    // Add filters if provided
    if (filters.completed !== undefined) {
      query.completed = filters.completed;
    }
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.priority) {
      query.priority = filters.priority;
    }
    
    // Add date range filters if provided
    if (filters.startDate) {
      query.startDate = { $gte: new Date(filters.startDate) };
    }
    
    if (filters.targetDate) {
      query.targetDate = { $lte: new Date(filters.targetDate) };
    }
    
    // Sorting options
    const sortOptions = {};
    if (filters.sortBy) {
      sortOptions[filters.sortBy] = filters.sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions.createdAt = -1; // Default sort by creation date (newest first)
    }
    
    // Handle pagination
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;
    
    if (isUsingInMemory()) {
      let results = getInMemorySavingsGoals().filter(goal => {
        if (goal.userId !== userId) return false;
        
        if (query.completed !== undefined && goal.completed !== query.completed) return false;
        
        if (query.category && goal.category !== query.category) return false;
        
        if (query.priority && goal.priority !== query.priority) return false;
        
        if (query.startDate && new Date(goal.startDate) < query.startDate.$gte) return false;
        
        if (query.targetDate && new Date(goal.targetDate) > query.targetDate.$lte) return false;
        
        return true;
      });
      
      // Apply sorting
      if (sortOptions.createdAt) {
        results.sort((a, b) => {
          return sortOptions.createdAt === 1 
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt);
        });
      } else if (sortOptions.targetDate) {
        results.sort((a, b) => {
          // Handle when targetDate might be undefined
          if (!a.targetDate) return sortOptions.targetDate === 1 ? 1 : -1;
          if (!b.targetDate) return sortOptions.targetDate === 1 ? -1 : 1;
          
          return sortOptions.targetDate === 1 
            ? new Date(a.targetDate) - new Date(b.targetDate)
            : new Date(b.targetDate) - new Date(a.targetDate);
        });
      } else if (sortOptions.currentAmount) {
        results.sort((a, b) => {
          return sortOptions.currentAmount === 1 
            ? a.currentAmount - b.currentAmount
            : b.currentAmount - a.currentAmount;
        });
      } else if (sortOptions.targetAmount) {
        results.sort((a, b) => {
          return sortOptions.targetAmount === 1 
            ? a.targetAmount - b.targetAmount
            : b.targetAmount - a.targetAmount;
        });
      }
      
      // Apply pagination
      const paginatedResults = results.slice(skip, skip + limit);
      
      return {
        goals: paginatedResults,
        total: results.length,
        page,
        limit,
        totalPages: Math.ceil(results.length / limit)
      };
    } else {
      const goals = await SavingsGoal.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);
      
      const total = await SavingsGoal.countDocuments(query);
      
      return {
        goals,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get a single savings goal by ID
 */
async function getSavingsGoalById(userId, goalId) {
  try {
    if (isUsingInMemory()) {
      return getInMemorySavingsGoals().find(goal => 
        goal._id === goalId && goal.userId === userId);
    } else {
      return await SavingsGoal.findOne({ _id: goalId, userId });
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Update a savings goal
 */
async function updateSavingsGoal(userId, goalId, updateData) {
  try {
    if (isUsingInMemory()) {
      const goalIndex = getInMemorySavingsGoals().findIndex(g => 
        g._id === goalId && g.userId === userId);
      
      if (goalIndex === -1) {
        return null;
      }
      
      const updatedGoal = {
        ...inMemoryDB.savingsGoals[goalIndex],
        ...updateData,
        updatedAt: new Date()
      };
      
      inMemoryDB.savingsGoals[goalIndex] = updatedGoal;
      return updatedGoal;
    } else {
      return await SavingsGoal.findOneAndUpdate(
        { _id: goalId, userId },
        { $set: updateData },
        { new: true, runValidators: true }
      );
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a savings goal
 */
async function deleteSavingsGoal(userId, goalId) {
  try {
    if (isUsingInMemory()) {
      const goalIndex = getInMemorySavingsGoals().findIndex(g => 
        g._id === goalId && g.userId === userId);
      
      if (goalIndex === -1) {
        return false;
      }
      
      inMemoryDB.savingsGoals.splice(goalIndex, 1);
      return true;
    } else {
      const result = await SavingsGoal.deleteOne({ _id: goalId, userId });
      return result.deletedCount > 0;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Add a contribution to a savings goal
 */
async function addContribution(userId, goalId, contributionData) {
  try {
    const contribution = {
      _id: mongoose.Types.ObjectId().toString(),
      date: contributionData.date || new Date(),
      amount: contributionData.amount,
      description: contributionData.description || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (isUsingInMemory()) {
      const goalIndex = getInMemorySavingsGoals().findIndex(g => 
        g._id === goalId && g.userId === userId);
      
      if (goalIndex === -1) {
        return null;
      }
      
      const goal = inMemoryDB.savingsGoals[goalIndex];
      
      if (!goal.contributions) {
        goal.contributions = [];
      }
      
      goal.contributions.push(contribution);
      goal.currentAmount = (goal.currentAmount || 0) + contributionData.amount;
      
      // Check if the goal is now complete
      if (goal.currentAmount >= goal.targetAmount && !goal.completed) {
        goal.completed = true;
        goal.completedDate = new Date();
      }
      
      goal.updatedAt = new Date();
      return goal;
    } else {
      const goal = await SavingsGoal.findOne({ _id: goalId, userId });
      
      if (!goal) {
        return null;
      }
      
      goal.contributions.push(contribution);
      goal.currentAmount = (goal.currentAmount || 0) + contributionData.amount;
      
      // Check if the goal is now complete
      if (goal.currentAmount >= goal.targetAmount && !goal.completed) {
        goal.completed = true;
        goal.completedDate = new Date();
      }
      
      await goal.save();
      return goal;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Add a withdrawal from a savings goal
 */
async function addWithdrawal(userId, goalId, withdrawalData) {
  try {
    const withdrawal = {
      _id: mongoose.Types.ObjectId().toString(),
      date: withdrawalData.date || new Date(),
      amount: withdrawalData.amount,
      reason: withdrawalData.reason || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (isUsingInMemory()) {
      const goalIndex = getInMemorySavingsGoals().findIndex(g => 
        g._id === goalId && g.userId === userId);
      
      if (goalIndex === -1) {
        return null;
      }
      
      const goal = inMemoryDB.savingsGoals[goalIndex];
      
      if (!goal.withdrawals) {
        goal.withdrawals = [];
      }
      
      // Ensure we don't go below zero
      const newAmount = Math.max(0, (goal.currentAmount || 0) - withdrawalData.amount);
      
      goal.withdrawals.push(withdrawal);
      goal.currentAmount = newAmount;
      
      // Update completion status
      if (goal.completed && goal.currentAmount < goal.targetAmount) {
        goal.completed = false;
        goal.completedDate = null;
      }
      
      goal.updatedAt = new Date();
      return goal;
    } else {
      const goal = await SavingsGoal.findOne({ _id: goalId, userId });
      
      if (!goal) {
        return null;
      }
      
      goal.withdrawals.push(withdrawal);
      
      // Ensure we don't go below zero
      goal.currentAmount = Math.max(0, (goal.currentAmount || 0) - withdrawalData.amount);
      
      // Update completion status
      if (goal.completed && goal.currentAmount < goal.targetAmount) {
        goal.completed = false;
        goal.completedDate = null;
      }
      
      await goal.save();
      return goal;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get contribution history for a savings goal
 */
async function getContributionHistory(userId, goalId) {
  try {
    if (isUsingInMemory()) {
      const goal = getInMemorySavingsGoals().find(g => 
        g._id === goalId && g.userId === userId);
      
      if (!goal) {
        return null;
      }
      
      return goal.contributions || [];
    } else {
      const goal = await SavingsGoal.findOne(
        { _id: goalId, userId },
        'contributions'
      );
      
      if (!goal) {
        return null;
      }
      
      return goal.contributions;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get withdrawal history for a savings goal
 */
async function getWithdrawalHistory(userId, goalId) {
  try {
    if (isUsingInMemory()) {
      const goal = getInMemorySavingsGoals().find(g => 
        g._id === goalId && g.userId === userId);
      
      if (!goal) {
        return null;
      }
      
      return goal.withdrawals || [];
    } else {
      const goal = await SavingsGoal.findOne(
        { _id: goalId, userId },
        'withdrawals'
      );
      
      if (!goal) {
        return null;
      }
      
      return goal.withdrawals;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Mark a savings goal as complete
 */
async function completeGoal(userId, goalId) {
  try {
    if (isUsingInMemory()) {
      const goalIndex = getInMemorySavingsGoals().findIndex(g => 
        g._id === goalId && g.userId === userId);
      
      if (goalIndex === -1) {
        return null;
      }
      
      const goal = inMemoryDB.savingsGoals[goalIndex];
      goal.completed = true;
      goal.completedDate = new Date();
      goal.updatedAt = new Date();
      
      return goal;
    } else {
      return await SavingsGoal.findOneAndUpdate(
        { _id: goalId, userId },
        { 
          $set: { 
            completed: true, 
            completedDate: new Date() 
          } 
        },
        { new: true }
      );
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get savings goal progress details
 */
async function getGoalProgress(userId, goalId) {
  try {
    const goal = await getSavingsGoalById(userId, goalId);
    
    if (!goal) {
      return null;
    }
    
    const currentAmount = goal.currentAmount || 0;
    const targetAmount = goal.targetAmount;
    const progressPercentage = Math.min(100, (currentAmount / targetAmount) * 100);
    
    // Calculate time-based metrics if target date exists
    let timeBasedMetrics = null;
    if (goal.targetDate) {
      const startDate = new Date(goal.startDate);
      const targetDate = new Date(goal.targetDate);
      const currentDate = new Date();
      
      // Total duration in days
      const totalDuration = Math.ceil((targetDate - startDate) / (1000 * 60 * 60 * 24));
      
      // Elapsed duration in days
      const elapsedDuration = Math.ceil((currentDate - startDate) / (1000 * 60 * 60 * 24));
      
      // Time percentage elapsed
      const timeElapsedPercentage = Math.min(100, (elapsedDuration / totalDuration) * 100);
      
      // Remaining days
      const remainingDays = Math.max(0, Math.ceil((targetDate - currentDate) / (1000 * 60 * 60 * 24)));
      
      // Check if on track (progress percentage >= time elapsed percentage)
      const onTrack = progressPercentage >= timeElapsedPercentage;
      
      // Required daily contribution to reach goal
      const requiredDaily = (targetAmount - currentAmount) / remainingDays;
      
      // Weekly contribution
      const requiredWeekly = requiredDaily * 7;
      
      // Monthly contribution
      const requiredMonthly = requiredDaily * 30;
      
      timeBasedMetrics = {
        totalDuration,
        elapsedDuration,
        remainingDays,
        timeElapsedPercentage,
        onTrack,
        requiredDaily: remainingDays > 0 ? requiredDaily : 0,
        requiredWeekly: remainingDays > 0 ? requiredWeekly : 0,
        requiredMonthly: remainingDays > 0 ? requiredMonthly : 0
      };
    }
    
    // Calculate contribution metrics
    const totalContributions = goal.contributions ? goal.contributions.reduce((sum, contrib) => sum + contrib.amount, 0) : 0;
    const totalWithdrawals = goal.withdrawals ? goal.withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0) : 0;
    
    // Get last contribution date
    const lastContribution = goal.contributions && goal.contributions.length > 0 
      ? goal.contributions.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      : null;
    
    return {
      goalId: goal._id,
      title: goal.title,
      category: goal.category,
      currentAmount,
      targetAmount,
      progressPercentage,
      isComplete: goal.completed,
      completedDate: goal.completedDate,
      contributionStats: {
        totalContributions,
        totalWithdrawals,
        lastContributionDate: lastContribution ? lastContribution.date : null,
        lastContributionAmount: lastContribution ? lastContribution.amount : null,
        contributionCount: goal.contributions ? goal.contributions.length : 0,
        withdrawalCount: goal.withdrawals ? goal.withdrawals.length : 0
      },
      timeBasedMetrics
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get savings goals summary statistics for a user
 */
async function getSavingsGoalsSummary(userId) {
  try {
    let goals;
    
    if (isUsingInMemory()) {
      goals = getInMemorySavingsGoals().filter(goal => goal.userId === userId);
    } else {
      goals = await SavingsGoal.find({ userId });
    }
    
    if (!goals || goals.length === 0) {
      return {
        totalGoals: 0,
        activeGoals: 0,
        completedGoals: 0,
        totalSaved: 0,
        totalTargeted: 0,
        overallProgress: 0,
        categoryBreakdown: {},
        topPriorities: []
      };
    }
    
    // Calculate summary metrics
    const totalGoals = goals.length;
    const activeGoals = goals.filter(g => !g.completed).length;
    const completedGoals = goals.filter(g => g.completed).length;
    
    const totalSaved = goals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0);
    const totalTargeted = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    
    const overallProgress = (totalSaved / totalTargeted) * 100;
    
    // Category breakdown
    const categoryBreakdown = {};
    goals.forEach(goal => {
      const category = goal.category || 'other';
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = {
          count: 0,
          saved: 0,
          targeted: 0,
          progress: 0
        };
      }
      
      categoryBreakdown[category].count++;
      categoryBreakdown[category].saved += goal.currentAmount || 0;
      categoryBreakdown[category].targeted += goal.targetAmount;
    });
    
    // Calculate progress for each category
    Object.keys(categoryBreakdown).forEach(category => {
      const { saved, targeted } = categoryBreakdown[category];
      categoryBreakdown[category].progress = (saved / targeted) * 100;
    });
    
    // Top priority goals
    const activeGoalsList = goals.filter(g => !g.completed);
    const topPriorities = activeGoalsList
      .sort((a, b) => {
        // First by priority (high > medium > low)
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        
        // Then by target date if available (sooner dates first)
        if (a.targetDate && b.targetDate) {
          return new Date(a.targetDate) - new Date(b.targetDate);
        } else if (a.targetDate) {
          return -1;
        } else if (b.targetDate) {
          return 1;
        }
        
        // Finally by creation date (newer first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
      .slice(0, 5)
      .map(goal => ({
        goalId: goal._id,
        title: goal.title,
        category: goal.category,
        currentAmount: goal.currentAmount || 0,
        targetAmount: goal.targetAmount,
        progressPercentage: ((goal.currentAmount || 0) / goal.targetAmount) * 100,
        priority: goal.priority,
        targetDate: goal.targetDate
      }));
    
    return {
      totalGoals,
      activeGoals,
      completedGoals,
      totalSaved,
      totalTargeted,
      overallProgress,
      categoryBreakdown,
      topPriorities
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get monthly savings forecast based on planned contributions
 */
async function getSavingsForecast(userId, goalId, monthsAhead = 12) {
  try {
    const goal = await getSavingsGoalById(userId, goalId);
    
    if (!goal) {
      return null;
    }
    
    const currentAmount = goal.currentAmount || 0;
    const targetAmount = goal.targetAmount;
    
    // Get planned contribution settings
    const frequency = goal.plannedContributions?.frequency || 'monthly';
    const plannedAmount = goal.plannedContributions?.amount || 0;
    
    // Calculate contribution per month based on frequency
    let contributionPerMonth = 0;
    switch (frequency) {
      case 'weekly':
        contributionPerMonth = plannedAmount * 4.33; // Average weeks per month
        break;
      case 'bi-weekly':
        contributionPerMonth = plannedAmount * 2.17; // Average bi-weeks per month
        break;
      case 'monthly':
        contributionPerMonth = plannedAmount;
        break;
      case 'quarterly':
        contributionPerMonth = plannedAmount / 3;
        break;
      case 'annually':
        contributionPerMonth = plannedAmount / 12;
        break;
      case 'one-time':
        contributionPerMonth = 0; // One-time already included in currentAmount
        break;
      default:
        contributionPerMonth = 0;
    }
    
    // Project future savings
    const forecast = [];
    let projectedAmount = currentAmount;
    const currentDate = new Date();
    
    for (let i = 1; i <= monthsAhead; i++) {
      // Calculate date for this forecast point
      const forecastDate = new Date(currentDate);
      forecastDate.setMonth(currentDate.getMonth() + i);
      
      // Add planned contribution for this month
      projectedAmount += contributionPerMonth;
      
      // Calculate progress percentage (cap at 100%)
      const progressPercentage = Math.min(100, (projectedAmount / targetAmount) * 100);
      
      // Determine if the goal will be reached in this month
      const goalReached = projectedAmount >= targetAmount;
      
      forecast.push({
        month: i,
        date: forecastDate,
        projectedAmount,
        progressPercentage,
        goalReached
      });
      
      // If we've reached the target, we can optionally break early
      // but let's continue to show the full timeline
    }
    
    // Calculate time to reach goal
    const monthsToGoal = forecast.findIndex(f => f.goalReached) + 1;
    const estimatedCompletionDate = monthsToGoal > 0 && monthsToGoal <= monthsAhead
      ? forecast[monthsToGoal - 1].date
      : null;
    
    return {
      goalId: goal._id,
      title: goal.title,
      currentAmount,
      targetAmount,
      plannedContributionFrequency: frequency,
      plannedContributionAmount: plannedAmount,
      monthlyContribution: contributionPerMonth,
      estimatedCompletionDate,
      monthsToGoal: monthsToGoal > 0 ? monthsToGoal : monthsToGoal === 0 ? 0 : null,
      willReachGoal: monthsToGoal > 0 && monthsToGoal <= monthsAhead,
      forecast
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Add or update an image for a savings goal
 */
async function addOrUpdateImage(userId, goalId, imageFile) {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads/savings-goals');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Generate a unique filename
    const fileExt = path.extname(imageFile.originalname);
    const fileName = `${goalId}-${Date.now()}${fileExt}`;
    const filePath = path.join(uploadsDir, fileName);
    
    // Save the file
    await fs.promises.writeFile(filePath, imageFile.buffer);
    
    // Generate URL for the file
    const baseUrl = process.env.BASE_URL || 'http://localhost:3004';
    const imageUrl = `${baseUrl}/uploads/savings-goals/${fileName}`;
    
    // Update the goal with the new image URL
    if (isUsingInMemory()) {
      const goalIndex = getInMemorySavingsGoals().findIndex(g => 
        g._id === goalId && g.userId === userId);
      
      if (goalIndex === -1) {
        return null;
      }
      
      inMemoryDB.savingsGoals[goalIndex].image = imageUrl;
      return inMemoryDB.savingsGoals[goalIndex];
    } else {
      return await SavingsGoal.findOneAndUpdate(
        { _id: goalId, userId },
        { $set: { image: imageUrl } },
        { new: true }
      );
    }
  } catch (error) {
    throw error;
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