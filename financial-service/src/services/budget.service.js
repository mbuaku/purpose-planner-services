const Budget = require('../models/budget.model');
const Expense = require('../models/expense.model');
const Income = require('../models/income.model');

// In-memory store accessor function
function getInMemoryBudgets() {
  return global.inMemoryDB ? global.inMemoryDB.budgets : null;
}

function getInMemoryExpenses() {
  return global.inMemoryDB ? global.inMemoryDB.expenses : null;
}

function getInMemoryIncomes() {
  return global.inMemoryDB ? global.inMemoryDB.incomes : null;
}

/**
 * Check if we're using MongoDB or in-memory storage
 * @returns {boolean} - Whether in-memory storage is being used
 */
function isUsingInMemory() {
  return global.inMemoryDB !== undefined;
}

/**
 * Create a new budget
 * @param {Object} budgetData - Budget data
 * @returns {Object} - Created budget
 */
async function createBudget(budgetData) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryBudgets = getInMemoryBudgets();
      
      const newBudget = {
        ...budgetData,
        _id: Date.now().toString(),
        tags: budgetData.tags || [],
        totalActualIncome: 0,
        totalActualExpenses: 0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Ensure categories have default actual amounts
      if (newBudget.categories) {
        newBudget.categories = newBudget.categories.map(category => ({
          ...category,
          actualAmount: category.actualAmount || 0
        }));
      } else {
        newBudget.categories = [];
      }
      
      inMemoryBudgets.push(newBudget);
      return newBudget;
    } else {
      // Using MongoDB
      const budget = new Budget(budgetData);
      await budget.save();
      return budget;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get all budgets for a user with filtering and pagination
 * @param {string} userId - User ID
 * @param {Object} options - Filter and pagination options
 * @returns {Array} - Budgets
 */
async function getBudgets(userId, options = {}) {
  try {
    const { 
      limit = 10, 
      page = 1, 
      startDate, 
      endDate, 
      status,
      type,
      sortBy = 'startDate',
      sortOrder = 'desc'
    } = options;
    
    const skip = (page - 1) * limit;
    
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryBudgets = getInMemoryBudgets();
      
      // Filter budgets by user
      let filteredBudgets = inMemoryBudgets.filter(budget => budget.userId === userId);
      
      // Apply date filters if provided
      if (startDate) {
        const startDateObj = new Date(startDate);
        filteredBudgets = filteredBudgets.filter(budget => 
          new Date(budget.startDate) >= startDateObj
        );
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        filteredBudgets = filteredBudgets.filter(budget => 
          new Date(budget.endDate) <= endDateObj
        );
      }
      
      // Apply status filter if provided
      if (status) {
        filteredBudgets = filteredBudgets.filter(budget => budget.status === status);
      }
      
      // Apply type filter if provided
      if (type) {
        filteredBudgets = filteredBudgets.filter(budget => budget.type === type);
      }
      
      // Sort budgets
      filteredBudgets.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      // Apply pagination
      return filteredBudgets.slice(skip, skip + limit);
    } else {
      // Using MongoDB
      let query = { userId };
      
      // Apply date filters if provided
      if (startDate) {
        query.startDate = { $gte: new Date(startDate) };
      }
      
      if (endDate) {
        query.endDate = { $lte: new Date(endDate) };
      }
      
      // Apply status filter if provided
      if (status) {
        query.status = status;
      }
      
      // Apply type filter if provided
      if (type) {
        query.type = type;
      }
      
      // Determine sort option
      const sortOption = {};
      sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;
      
      // Execute query with pagination
      const budgets = await Budget.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit);
      
      return budgets;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get active budgets for a user
 * @param {string} userId - User ID
 * @returns {Array} - Active budgets
 */
async function getActiveBudgets(userId) {
  try {
    const now = new Date();
    
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryBudgets = getInMemoryBudgets();
      
      // Filter active budgets that include the current date
      const activeBudgets = inMemoryBudgets.filter(budget => 
        budget.userId === userId &&
        budget.status === 'active' &&
        new Date(budget.startDate) <= now &&
        new Date(budget.endDate) >= now
      );
      
      return activeBudgets;
    } else {
      // Using MongoDB
      const activeBudgets = await Budget.find({
        userId,
        status: 'active',
        startDate: { $lte: now },
        endDate: { $gte: now }
      }).sort({ startDate: -1 });
      
      return activeBudgets;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get a specific budget by ID
 * @param {string} userId - User ID
 * @param {string} budgetId - Budget ID
 * @returns {Object} - Budget
 */
async function getBudgetById(userId, budgetId) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryBudgets = getInMemoryBudgets();
      
      const budget = inMemoryBudgets.find(
        budget => budget._id === budgetId && budget.userId === userId
      );
      
      return budget || null;
    } else {
      // Using MongoDB
      const budget = await Budget.findOne({
        _id: budgetId,
        userId
      });
      
      return budget;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Update a budget
 * @param {string} userId - User ID
 * @param {string} budgetId - Budget ID
 * @param {Object} updateData - Updated budget data
 * @returns {Object} - Updated budget
 */
async function updateBudget(userId, budgetId, updateData) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryBudgets = getInMemoryBudgets();
      
      const index = inMemoryBudgets.findIndex(
        budget => budget._id === budgetId && budget.userId === userId
      );
      
      if (index === -1) {
        return null;
      }
      
      // Update the budget
      inMemoryBudgets[index] = {
        ...inMemoryBudgets[index],
        ...updateData,
        updatedAt: new Date()
      };
      
      return inMemoryBudgets[index];
    } else {
      // Using MongoDB
      const budget = await Budget.findOneAndUpdate(
        { _id: budgetId, userId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      return budget;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Update a budget category
 * @param {string} userId - User ID
 * @param {string} budgetId - Budget ID
 * @param {string} category - Category name
 * @param {number} plannedAmount - Planned amount for the category
 * @param {number} actualAmount - Actual amount for the category
 * @param {string} notes - Optional notes for the category
 * @returns {Object} - Updated budget
 */
async function updateBudgetCategory(userId, budgetId, category, plannedAmount, actualAmount, notes) {
  try {
    // Get the budget first
    const budget = await getBudgetById(userId, budgetId);
    
    if (!budget) {
      return null;
    }
    
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryBudgets = getInMemoryBudgets();
      
      const index = inMemoryBudgets.findIndex(
        budget => budget._id === budgetId && budget.userId === userId
      );
      
      if (index === -1) {
        return null;
      }
      
      // Check if the category already exists
      const categoryIndex = inMemoryBudgets[index].categories.findIndex(
        cat => cat.category === category
      );
      
      if (categoryIndex !== -1) {
        // Update existing category
        const oldPlannedAmount = inMemoryBudgets[index].categories[categoryIndex].plannedAmount;
        const oldActualAmount = inMemoryBudgets[index].categories[categoryIndex].actualAmount || 0;
        
        inMemoryBudgets[index].categories[categoryIndex] = {
          category,
          plannedAmount,
          actualAmount: actualAmount !== undefined ? actualAmount : oldActualAmount,
          notes: notes !== undefined ? notes : inMemoryBudgets[index].categories[categoryIndex].notes
        };
        
        // Update total planned expenses
        inMemoryBudgets[index].totalPlannedExpenses = 
          inMemoryBudgets[index].totalPlannedExpenses - oldPlannedAmount + plannedAmount;
        
        // Update total actual expenses if actual amount was provided
        if (actualAmount !== undefined) {
          inMemoryBudgets[index].totalActualExpenses = 
            inMemoryBudgets[index].totalActualExpenses - oldActualAmount + actualAmount;
        }
      } else {
        // Add new category
        inMemoryBudgets[index].categories.push({
          category,
          plannedAmount,
          actualAmount: actualAmount || 0,
          notes
        });
        
        // Update total planned expenses
        inMemoryBudgets[index].totalPlannedExpenses += plannedAmount;
        
        // Update total actual expenses if actual amount was provided
        if (actualAmount) {
          inMemoryBudgets[index].totalActualExpenses += actualAmount;
        }
      }
      
      inMemoryBudgets[index].updatedAt = new Date();
      
      return inMemoryBudgets[index];
    } else {
      // Using MongoDB
      // Check if the category already exists
      const existingCategory = budget.categories.find(cat => cat.category === category);
      
      let updateQuery;
      
      if (existingCategory) {
        // Update existing category
        const oldPlannedAmount = existingCategory.plannedAmount;
        const oldActualAmount = existingCategory.actualAmount || 0;
        
        // Remove the old category
        updateQuery = { 
          $pull: { categories: { category } },
          updatedAt: new Date()
        };
        
        // Adjust the totals
        updateQuery.$inc = { 
          totalPlannedExpenses: plannedAmount - oldPlannedAmount 
        };
        
        if (actualAmount !== undefined) {
          updateQuery.$inc.totalActualExpenses = actualAmount - oldActualAmount;
        }
        
        // Use MongoDB's atomic operations to update the budget
        await Budget.updateOne({ _id: budgetId, userId }, updateQuery);
        
        // Add the updated category
        updateQuery = {
          $push: { 
            categories: {
              category,
              plannedAmount,
              actualAmount: actualAmount !== undefined ? actualAmount : oldActualAmount,
              notes: notes !== undefined ? notes : existingCategory.notes
            }
          }
        };
      } else {
        // Add new category
        updateQuery = {
          $push: { 
            categories: {
              category,
              plannedAmount,
              actualAmount: actualAmount || 0,
              notes
            }
          },
          $inc: { 
            totalPlannedExpenses: plannedAmount,
            totalActualExpenses: actualAmount || 0
          },
          updatedAt: new Date()
        };
      }
      
      // Update the budget with the new category
      const updatedBudget = await Budget.findOneAndUpdate(
        { _id: budgetId, userId },
        updateQuery,
        { new: true, runValidators: true }
      );
      
      return updatedBudget;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Mark a budget as completed
 * @param {string} userId - User ID
 * @param {string} budgetId - Budget ID
 * @returns {Object} - Updated budget
 */
async function completeBudget(userId, budgetId) {
  try {
    // Update budget status to completed
    const updateData = {
      status: 'completed'
    };
    
    return updateBudget(userId, budgetId, updateData);
  } catch (error) {
    throw error;
  }
}

/**
 * Archive a budget
 * @param {string} userId - User ID
 * @param {string} budgetId - Budget ID
 * @returns {Object} - Updated budget
 */
async function archiveBudget(userId, budgetId) {
  try {
    // Update budget status to archived
    const updateData = {
      status: 'archived'
    };
    
    return updateBudget(userId, budgetId, updateData);
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a budget
 * @param {string} userId - User ID
 * @param {string} budgetId - Budget ID
 * @returns {boolean} - Whether the deletion was successful
 */
async function deleteBudget(userId, budgetId) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryBudgets = getInMemoryBudgets();
      
      const index = inMemoryBudgets.findIndex(
        budget => budget._id === budgetId && budget.userId === userId
      );
      
      if (index === -1) {
        return false;
      }
      
      // Remove the budget
      inMemoryBudgets.splice(index, 1);
      
      return true;
    } else {
      // Using MongoDB
      const result = await Budget.findOneAndDelete({
        _id: budgetId,
        userId
      });
      
      return !!result;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get actual expenses and incomes for a budget period
 * @param {string} userId - User ID
 * @param {Date} startDate - Budget start date
 * @param {Date} endDate - Budget end date
 * @returns {Object} - Actual expenses and incomes for the period
 */
async function getActualAmounts(userId, startDate, endDate) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryExpenses = getInMemoryExpenses();
      const inMemoryIncomes = getInMemoryIncomes();
      
      // Filter expenses and incomes for the given period
      const filteredExpenses = inMemoryExpenses.filter(expense => 
        expense.userId === userId &&
        new Date(expense.date) >= new Date(startDate) &&
        new Date(expense.date) <= new Date(endDate)
      );
      
      const filteredIncomes = inMemoryIncomes.filter(income => 
        income.userId === userId &&
        new Date(income.date) >= new Date(startDate) &&
        new Date(income.date) <= new Date(endDate)
      );
      
      // Calculate total amounts
      const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const totalIncomes = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
      
      // Calculate amounts by category
      const expensesByCategory = {};
      filteredExpenses.forEach(expense => {
        if (!expensesByCategory[expense.category]) {
          expensesByCategory[expense.category] = 0;
        }
        expensesByCategory[expense.category] += expense.amount;
      });
      
      return {
        totalExpenses,
        totalIncomes,
        expensesByCategory
      };
    } else {
      // Using MongoDB
      // Get total expenses for the period
      const expensesResult = await Expense.aggregate([
        { 
          $match: { 
            userId,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      // Get total incomes for the period
      const incomesResult = await Income.aggregate([
        { 
          $match: { 
            userId,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      // Get expenses by category
      const expensesByCategoryResult = await Expense.aggregate([
        { 
          $match: { 
            userId,
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
          }
        },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      const totalExpenses = expensesResult.length > 0 ? expensesResult[0].total : 0;
      const totalIncomes = incomesResult.length > 0 ? incomesResult[0].total : 0;
      
      const expensesByCategory = {};
      expensesByCategoryResult.forEach(item => {
        expensesByCategory[item._id] = item.total;
      });
      
      return {
        totalExpenses,
        totalIncomes,
        expensesByCategory
      };
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get budget performance statistics
 * @param {string} userId - User ID
 * @param {string} budgetId - Budget ID
 * @returns {Object} - Budget performance statistics
 */
async function getBudgetPerformance(userId, budgetId) {
  try {
    // Get the budget
    const budget = await getBudgetById(userId, budgetId);
    
    if (!budget) {
      return null;
    }
    
    // Get actual amounts for the budget period
    const { totalExpenses, totalIncomes, expensesByCategory } = await getActualAmounts(
      userId,
      budget.startDate,
      budget.endDate
    );
    
    // Calculate overall budget performance
    const plannedSavings = budget.totalPlannedIncome - budget.totalPlannedExpenses;
    const actualSavings = totalIncomes - totalExpenses;
    const savingsRate = totalIncomes > 0 ? (actualSavings / totalIncomes) * 100 : 0;
    
    // Calculate days elapsed and remaining in the budget period
    const now = new Date();
    const startDate = new Date(budget.startDate);
    const endDate = new Date(budget.endDate);
    
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.min(
      Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)),
      totalDays
    );
    const daysRemaining = Math.max(0, totalDays - daysElapsed);
    
    // Calculate budget progress percentage
    const progressPercentage = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;
    
    // Calculate spending pace
    const idealDailyExpense = budget.totalPlannedExpenses / totalDays;
    const actualDailyExpense = daysElapsed > 0 ? totalExpenses / daysElapsed : 0;
    const spendingPace = idealDailyExpense > 0 ? (actualDailyExpense / idealDailyExpense) * 100 : 0;
    
    // Calculate category performance
    const categoryPerformance = {};
    
    budget.categories.forEach(category => {
      const plannedAmount = category.plannedAmount;
      const actualAmount = expensesByCategory[category.category] || 0;
      const variance = plannedAmount - actualAmount;
      const percentageUsed = plannedAmount > 0 ? (actualAmount / plannedAmount) * 100 : 0;
      
      categoryPerformance[category.category] = {
        plannedAmount,
        actualAmount,
        variance,
        percentageUsed: parseFloat(percentageUsed.toFixed(2))
      };
    });
    
    // Calculate overall performance
    const overallPerformance = budget.totalPlannedExpenses > 0 
      ? (totalExpenses / budget.totalPlannedExpenses) * 100 
      : 0;
    
    // Determine budget status (on track, over budget, under budget)
    let budgetStatus;
    
    if (progressPercentage >= 100) {
      budgetStatus = 'completed';
    } else if (overallPerformance > progressPercentage + 10) {
      budgetStatus = 'over_budget';
    } else if (overallPerformance < progressPercentage - 10) {
      budgetStatus = 'under_budget';
    } else {
      budgetStatus = 'on_track';
    }
    
    // Calculate projected end amounts based on current pace
    const projectedExpenses = daysElapsed > 0 
      ? (totalExpenses / daysElapsed) * totalDays 
      : totalExpenses;
    
    const projectedSavings = totalIncomes - projectedExpenses;
    
    return {
      budgetId: budget._id,
      title: budget.title,
      period: {
        startDate: budget.startDate,
        endDate: budget.endDate,
        totalDays,
        daysElapsed,
        daysRemaining,
        progressPercentage: parseFloat(progressPercentage.toFixed(2))
      },
      planned: {
        income: budget.totalPlannedIncome,
        expenses: budget.totalPlannedExpenses,
        savings: plannedSavings
      },
      actual: {
        income: parseFloat(totalIncomes.toFixed(2)),
        expenses: parseFloat(totalExpenses.toFixed(2)),
        savings: parseFloat(actualSavings.toFixed(2)),
        savingsRate: parseFloat(savingsRate.toFixed(2))
      },
      projected: {
        expenses: parseFloat(projectedExpenses.toFixed(2)),
        savings: parseFloat(projectedSavings.toFixed(2))
      },
      performance: {
        overallPercentage: parseFloat(overallPerformance.toFixed(2)),
        spendingPace: parseFloat(spendingPace.toFixed(2)),
        status: budgetStatus,
        categoryPerformance
      }
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Create a recurring budget based on an existing budget
 * @param {string} userId - User ID
 * @param {string} sourceBudgetId - Source budget ID
 * @param {string} startDate - New budget start date
 * @param {string} endDate - New budget end date
 * @returns {Object} - Created budget
 */
async function createRecurringBudget(userId, sourceBudgetId, startDate, endDate) {
  try {
    // Get the source budget
    const sourceBudget = await getBudgetById(userId, sourceBudgetId);
    
    if (!sourceBudget) {
      throw new Error('Source budget not found');
    }
    
    // Create new budget data based on source budget
    const newBudgetData = {
      userId,
      title: `${sourceBudget.title} (Recurring)`,
      description: sourceBudget.description,
      currency: sourceBudget.currency,
      startDate,
      endDate,
      totalPlannedIncome: sourceBudget.totalPlannedIncome,
      totalPlannedExpenses: sourceBudget.totalPlannedExpenses,
      categories: sourceBudget.categories.map(category => ({
        category: category.category,
        plannedAmount: category.plannedAmount,
        notes: category.notes
      })),
      type: sourceBudget.type,
      recurrence: {
        isRecurring: true,
        frequency: sourceBudget.recurrence?.frequency || 'monthly'
      },
      tags: sourceBudget.tags
    };
    
    // Create the new budget
    return createBudget(newBudgetData);
  } catch (error) {
    throw error;
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