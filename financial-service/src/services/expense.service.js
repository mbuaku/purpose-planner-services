const fs = require('fs').promises;
const path = require('path');
const Expense = require('../models/expense.model');
const incomeService = require('./income.service');

// In-memory store accessor function
function getInMemoryExpenses() {
  return global.inMemoryDB ? global.inMemoryDB.expenses : null;
}

/**
 * Check if we're using MongoDB or in-memory storage
 * @returns {boolean} - Whether in-memory storage is being used
 */
function isUsingInMemory() {
  return global.inMemoryDB !== undefined;
}

/**
 * Create a new expense entry
 * @param {Object} expenseData - Expense data
 * @returns {Object} - Created expense entry
 */
async function createExpense(expenseData) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryExpenses = getInMemoryExpenses();
      
      const newExpense = {
        ...expenseData,
        _id: Date.now().toString(),
        attachments: expenseData.attachments || [],
        tags: expenseData.tags || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      inMemoryExpenses.push(newExpense);
      return newExpense;
    } else {
      // Using MongoDB
      const expense = new Expense(expenseData);
      await expense.save();
      return expense;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get all expense entries for a user with filtering and pagination
 * @param {string} userId - User ID
 * @param {Object} options - Filter and pagination options
 * @returns {Array} - Expense entries
 */
async function getExpenses(userId, options = {}) {
  try {
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
    } = options;
    
    const skip = (page - 1) * limit;
    
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryExpenses = getInMemoryExpenses();
      
      // Filter expenses by user
      let filteredExpenses = inMemoryExpenses.filter(expense => expense.userId === userId);
      
      // Apply date filters if provided
      if (startDate) {
        const startDateObj = new Date(startDate);
        filteredExpenses = filteredExpenses.filter(expense => 
          new Date(expense.date) >= startDateObj
        );
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        filteredExpenses = filteredExpenses.filter(expense => 
          new Date(expense.date) <= endDateObj
        );
      }
      
      // Apply category filter if provided
      if (category) {
        filteredExpenses = filteredExpenses.filter(expense => expense.category === category);
      }
      
      // Apply amount filters if provided
      if (minAmount !== undefined) {
        filteredExpenses = filteredExpenses.filter(expense => expense.amount >= minAmount);
      }
      
      if (maxAmount !== undefined) {
        filteredExpenses = filteredExpenses.filter(expense => expense.amount <= maxAmount);
      }
      
      // Apply payment method filter if provided
      if (paymentMethod) {
        filteredExpenses = filteredExpenses.filter(expense => expense.paymentMethod === paymentMethod);
      }
      
      // Apply tax deductible filter if provided
      if (isTaxDeductible !== undefined) {
        filteredExpenses = filteredExpenses.filter(expense => expense.isTaxDeductible === isTaxDeductible);
      }
      
      // Apply planned filter if provided
      if (isPlanned !== undefined) {
        filteredExpenses = filteredExpenses.filter(expense => expense.isPlanned === isPlanned);
      }
      
      // Sort expenses
      filteredExpenses.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      // Apply pagination
      return filteredExpenses.slice(skip, skip + limit);
    } else {
      // Using MongoDB
      let query = { userId };
      
      // Apply date filters if provided
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }
      
      // Apply category filter if provided
      if (category) {
        query.category = category;
      }
      
      // Apply amount filters if provided
      if (minAmount !== undefined || maxAmount !== undefined) {
        query.amount = {};
        if (minAmount !== undefined) query.amount.$gte = minAmount;
        if (maxAmount !== undefined) query.amount.$lte = maxAmount;
      }
      
      // Apply payment method filter if provided
      if (paymentMethod) {
        query.paymentMethod = paymentMethod;
      }
      
      // Apply tax deductible filter if provided
      if (isTaxDeductible !== undefined) {
        query.isTaxDeductible = isTaxDeductible;
      }
      
      // Apply planned filter if provided
      if (isPlanned !== undefined) {
        query.isPlanned = isPlanned;
      }
      
      // Determine sort option
      const sortOption = {};
      sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;
      
      // Execute query with pagination
      const expenses = await Expense.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit);
      
      return expenses;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get a specific expense entry by ID
 * @param {string} userId - User ID
 * @param {string} expenseId - Expense entry ID
 * @returns {Object} - Expense entry
 */
async function getExpenseById(userId, expenseId) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryExpenses = getInMemoryExpenses();
      
      const expense = inMemoryExpenses.find(
        expense => expense._id === expenseId && expense.userId === userId
      );
      
      return expense || null;
    } else {
      // Using MongoDB
      const expense = await Expense.findOne({
        _id: expenseId,
        userId
      });
      
      return expense;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Update an expense entry
 * @param {string} userId - User ID
 * @param {string} expenseId - Expense entry ID
 * @param {Object} updateData - Updated expense data
 * @returns {Object} - Updated expense entry
 */
async function updateExpense(userId, expenseId, updateData) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryExpenses = getInMemoryExpenses();
      
      const index = inMemoryExpenses.findIndex(
        expense => expense._id === expenseId && expense.userId === userId
      );
      
      if (index === -1) {
        return null;
      }
      
      // Update the expense entry
      inMemoryExpenses[index] = {
        ...inMemoryExpenses[index],
        ...updateData,
        updatedAt: new Date()
      };
      
      return inMemoryExpenses[index];
    } else {
      // Using MongoDB
      const expense = await Expense.findOneAndUpdate(
        { _id: expenseId, userId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      return expense;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Delete an expense entry
 * @param {string} userId - User ID
 * @param {string} expenseId - Expense entry ID
 * @returns {boolean} - Whether the deletion was successful
 */
async function deleteExpense(userId, expenseId) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryExpenses = getInMemoryExpenses();
      
      const index = inMemoryExpenses.findIndex(
        expense => expense._id === expenseId && expense.userId === userId
      );
      
      if (index === -1) {
        return false;
      }
      
      // Remove the expense entry
      inMemoryExpenses.splice(index, 1);
      
      return true;
    } else {
      // Using MongoDB
      const result = await Expense.findOneAndDelete({
        _id: expenseId,
        userId
      });
      
      return !!result;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Add an attachment to an expense entry
 * @param {string} userId - User ID
 * @param {string} expenseId - Expense entry ID
 * @param {Object} attachment - Attachment data
 * @returns {Object} - Updated expense entry
 */
async function addAttachment(userId, expenseId, attachment) {
  try {
    // Get the expense entry first
    const expense = await getExpenseById(userId, expenseId);
    
    if (!expense) {
      return null;
    }
    
    // Define the target directory for uploads
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const userUploadsDir = path.join(uploadDir, userId, 'expense', expenseId);
    
    // Ensure the upload directory exists
    await fs.mkdir(userUploadsDir, { recursive: true });
    
    // Generate a unique filename
    const filename = `attachment_${Date.now()}${path.extname(attachment.file.originalname)}`;
    const filePath = path.join(userUploadsDir, filename);
    
    // Write the file
    await fs.writeFile(filePath, attachment.file.buffer);
    
    // Generate the URL for the file
    const baseUrl = process.env.BASE_URL || 'http://localhost:3006';
    const fileUrl = `${baseUrl}/uploads/${userId}/expense/${expenseId}/${filename}`;
    
    // Create attachment object
    const attachmentObject = {
      name: attachment.name,
      type: attachment.type,
      url: fileUrl
    };
    
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryExpenses = getInMemoryExpenses();
      
      const index = inMemoryExpenses.findIndex(
        expense => expense._id === expenseId && expense.userId === userId
      );
      
      if (index === -1) {
        return null;
      }
      
      // Add attachment to the expense entry
      if (!inMemoryExpenses[index].attachments) {
        inMemoryExpenses[index].attachments = [];
      }
      
      inMemoryExpenses[index].attachments.push(attachmentObject);
      inMemoryExpenses[index].updatedAt = new Date();
      
      return inMemoryExpenses[index];
    } else {
      // Using MongoDB
      const updatedExpense = await Expense.findOneAndUpdate(
        { _id: expenseId, userId },
        { 
          $push: { attachments: attachmentObject },
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );
      
      return updatedExpense;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get expense statistics
 * @param {string} userId - User ID
 * @param {string} period - Time period for stats (day, week, month, year)
 * @param {string} category - Optional category filter
 * @returns {Object} - Expense statistics
 */
async function getExpenseStats(userId, period = 'month', category) {
  try {
    // Determine date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all-time':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Default to month
    }
    
    const endDate = new Date();
    
    // Base query
    const baseQuery = { 
      userId, 
      date: { $gte: startDate, $lte: endDate } 
    };
    
    // Add category filter if provided
    if (category) {
      baseQuery.category = category;
    }
    
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryExpenses = getInMemoryExpenses();
      
      // Filter expenses by user, date range, and category if provided
      let filteredExpenses = inMemoryExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        let match = expense.userId === userId && 
                   expenseDate >= startDate && 
                   expenseDate <= endDate;
                   
        if (match && category) {
          match = expense.category === category;
        }
        
        return match;
      });
      
      // Calculate total expense
      const totalExpense = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Calculate average expense
      const avgExpense = filteredExpenses.length > 0 ? totalExpense / filteredExpenses.length : 0;
      
      // Calculate expense by category
      const expenseByCategory = {};
      filteredExpenses.forEach(expense => {
        if (!expenseByCategory[expense.category]) {
          expenseByCategory[expense.category] = 0;
        }
        expenseByCategory[expense.category] += expense.amount;
      });
      
      // Calculate expense by payment method
      const expenseByPaymentMethod = {};
      filteredExpenses.forEach(expense => {
        if (!expenseByPaymentMethod[expense.paymentMethod]) {
          expenseByPaymentMethod[expense.paymentMethod] = 0;
        }
        expenseByPaymentMethod[expense.paymentMethod] += expense.amount;
      });
      
      // Calculate expense by day/month
      const expenseByPeriod = {};
      filteredExpenses.forEach(expense => {
        let periodKey;
        const expenseDate = new Date(expense.date);
        
        if (period === 'year') {
          // For yearly stats, group by month
          periodKey = `${expenseDate.getFullYear()}-${expenseDate.getMonth() + 1}`;
        } else {
          // For other periods, group by day
          periodKey = expenseDate.toISOString().slice(0, 10); // YYYY-MM-DD
        }
        
        if (!expenseByPeriod[periodKey]) {
          expenseByPeriod[periodKey] = 0;
        }
        
        expenseByPeriod[periodKey] += expense.amount;
      });
      
      // Calculate highest expense transaction
      let highestExpense = filteredExpenses.length > 0 ? filteredExpenses[0] : null;
      
      filteredExpenses.forEach(expense => {
        if (expense.amount > (highestExpense?.amount || 0)) {
          highestExpense = expense;
        }
      });
      
      // Calculate tax deductible amount
      const taxDeductibleAmount = filteredExpenses
        .filter(expense => expense.isTaxDeductible)
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      // Calculate expense frequency
      const recurringExpense = filteredExpenses
        .filter(expense => expense.isRecurring)
        .reduce((sum, expense) => sum + expense.amount, 0);
      const oneTimeExpense = totalExpense - recurringExpense;
      
      return {
        period,
        dateRange: { startDate, endDate },
        totalExpense: parseFloat(totalExpense.toFixed(2)),
        expenseCount: filteredExpenses.length,
        avgExpense: parseFloat(avgExpense.toFixed(2)),
        expenseByCategory,
        expenseByPaymentMethod,
        expenseByPeriod,
        highestExpense: highestExpense ? {
          amount: highestExpense.amount,
          title: highestExpense.title,
          category: highestExpense.category,
          date: highestExpense.date
        } : null,
        taxDeductibleAmount: parseFloat(taxDeductibleAmount.toFixed(2)),
        expenseFrequency: {
          recurring: parseFloat(recurringExpense.toFixed(2)),
          oneTime: parseFloat(oneTimeExpense.toFixed(2))
        }
      };
    } else {
      // Using MongoDB
      // Get total expense and count
      const totalResult = await Expense.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: null,
            totalExpense: { $sum: '$amount' },
            expenseCount: { $sum: 1 }
          }
        }
      ]);
      
      const totalExpense = totalResult.length > 0 ? totalResult[0].totalExpense : 0;
      const expenseCount = totalResult.length > 0 ? totalResult[0].expenseCount : 0;
      const avgExpense = expenseCount > 0 ? totalExpense / expenseCount : 0;
      
      // Get expense by category
      const categoryResult = await Expense.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      const expenseByCategory = {};
      categoryResult.forEach(item => {
        expenseByCategory[item._id] = item.total;
      });
      
      // Get expense by payment method
      const paymentMethodResult = await Expense.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$paymentMethod',
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      const expenseByPaymentMethod = {};
      paymentMethodResult.forEach(item => {
        expenseByPaymentMethod[item._id] = item.total;
      });
      
      // Get expense by period (day/month)
      let periodFormat;
      let periodGroupId;
      
      if (period === 'year') {
        // For yearly stats, group by month
        periodFormat = '%Y-%m';
        periodGroupId = { year: { $year: '$date' }, month: { $month: '$date' } };
      } else {
        // For other periods, group by day
        periodFormat = '%Y-%m-%d';
        periodGroupId = { year: { $year: '$date' }, month: { $month: '$date' }, day: { $dayOfMonth: '$date' } };
      }
      
      const periodResult = await Expense.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: periodGroupId,
            total: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);
      
      const expenseByPeriod = {};
      
      periodResult.forEach(item => {
        let periodKey;
        
        if (period === 'year') {
          periodKey = `${item._id.year}-${item._id.month}`;
        } else {
          periodKey = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`;
        }
        
        expenseByPeriod[periodKey] = item.total;
      });
      
      // Get highest expense transaction
      const highestExpense = await Expense.findOne(baseQuery).sort({ amount: -1 });
      
      // Get tax deductible amount
      const taxDeductibleResult = await Expense.aggregate([
        { $match: { ...baseQuery, isTaxDeductible: true } },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      const taxDeductibleAmount = taxDeductibleResult.length > 0 ? taxDeductibleResult[0].total : 0;
      
      // Get expense frequency breakdown
      const frequencyResult = await Expense.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$isRecurring',
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      const recurringExpense = frequencyResult.find(item => item._id === true)?.total || 0;
      const oneTimeExpense = frequencyResult.find(item => item._id === false)?.total || 0;
      
      return {
        period,
        dateRange: { startDate, endDate },
        totalExpense: parseFloat(totalExpense.toFixed(2)),
        expenseCount,
        avgExpense: parseFloat(avgExpense.toFixed(2)),
        expenseByCategory,
        expenseByPaymentMethod,
        expenseByPeriod,
        highestExpense: highestExpense ? {
          amount: highestExpense.amount,
          title: highestExpense.title,
          category: highestExpense.category,
          date: highestExpense.date
        } : null,
        taxDeductibleAmount: parseFloat(taxDeductibleAmount.toFixed(2)),
        expenseFrequency: {
          recurring: parseFloat(recurringExpense.toFixed(2)),
          oneTime: parseFloat(oneTimeExpense.toFixed(2))
        }
      };
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get cash flow analysis (comparing income vs expenses)
 * @param {string} userId - User ID
 * @param {string} period - Time period for analysis (day, week, month, year)
 * @returns {Object} - Cash flow analysis
 */
async function getCashFlowAnalysis(userId, period = 'month') {
  try {
    // Get income stats for the period
    const incomeStats = await incomeService.getIncomeStats(userId, period);
    
    // Get expense stats for the period
    const expenseStats = await getExpenseStats(userId, period);
    
    // Calculate net cash flow
    const netCashFlow = incomeStats.totalIncome - expenseStats.totalExpense;
    
    // Calculate savings rate (percentage of income saved)
    const savingsRate = incomeStats.totalIncome > 0 
      ? (netCashFlow / incomeStats.totalIncome) * 100 
      : 0;
    
    // Calculate expense to income ratio
    const expenseToIncomeRatio = incomeStats.totalIncome > 0 
      ? (expenseStats.totalExpense / incomeStats.totalIncome) * 100 
      : 0;
    
    // Calculate cash flow by period
    const cashFlowByPeriod = {};
    
    // Combine periods from both income and expense
    const allPeriodKeys = new Set([
      ...Object.keys(incomeStats.incomeByPeriod || {}),
      ...Object.keys(expenseStats.expenseByPeriod || {})
    ]);
    
    // Calculate net cash flow for each period
    allPeriodKeys.forEach(periodKey => {
      const periodIncome = incomeStats.incomeByPeriod[periodKey] || 0;
      const periodExpense = expenseStats.expenseByPeriod[periodKey] || 0;
      cashFlowByPeriod[periodKey] = periodIncome - periodExpense;
    });
    
    // Calculate cash flow by category
    const cashFlowByCategory = {};
    
    // Get all unique categories from both income and expense
    const incomeCategories = Object.keys(incomeStats.incomeByCategory || {});
    const expenseCategories = Object.keys(expenseStats.expenseByCategory || {});
    
    // Income categories are positive cash flow
    incomeCategories.forEach(category => {
      cashFlowByCategory[`income_${category}`] = incomeStats.incomeByCategory[category] || 0;
    });
    
    // Expense categories are negative cash flow
    expenseCategories.forEach(category => {
      cashFlowByCategory[`expense_${category}`] = -(expenseStats.expenseByCategory[category] || 0);
    });
    
    return {
      period,
      dateRange: incomeStats.dateRange,
      totalIncome: incomeStats.totalIncome,
      totalExpense: expenseStats.totalExpense,
      netCashFlow: parseFloat(netCashFlow.toFixed(2)),
      savingsRate: parseFloat(savingsRate.toFixed(2)),
      expenseToIncomeRatio: parseFloat(expenseToIncomeRatio.toFixed(2)),
      cashFlowByPeriod,
      cashFlowByCategory,
      incomeBreakdown: incomeStats.incomeByCategory,
      expenseBreakdown: expenseStats.expenseByCategory
    };
  } catch (error) {
    throw error;
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