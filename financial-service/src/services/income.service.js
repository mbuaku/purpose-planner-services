const fs = require('fs').promises;
const path = require('path');
const Income = require('../models/income.model');

// In-memory store accessor function
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
 * Create a new income entry
 * @param {Object} incomeData - Income data
 * @returns {Object} - Created income entry
 */
async function createIncome(incomeData) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryIncomes = getInMemoryIncomes();
      
      const newIncome = {
        ...incomeData,
        _id: Date.now().toString(),
        attachments: incomeData.attachments || [],
        tags: incomeData.tags || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      inMemoryIncomes.push(newIncome);
      return newIncome;
    } else {
      // Using MongoDB
      const income = new Income(incomeData);
      await income.save();
      return income;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get all income entries for a user with filtering and pagination
 * @param {string} userId - User ID
 * @param {Object} options - Filter and pagination options
 * @returns {Array} - Income entries
 */
async function getIncomes(userId, options = {}) {
  try {
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
    } = options;
    
    const skip = (page - 1) * limit;
    
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryIncomes = getInMemoryIncomes();
      
      // Filter incomes by user
      let filteredIncomes = inMemoryIncomes.filter(income => income.userId === userId);
      
      // Apply date filters if provided
      if (startDate) {
        const startDateObj = new Date(startDate);
        filteredIncomes = filteredIncomes.filter(income => 
          new Date(income.date) >= startDateObj
        );
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        filteredIncomes = filteredIncomes.filter(income => 
          new Date(income.date) <= endDateObj
        );
      }
      
      // Apply category filter if provided
      if (category) {
        filteredIncomes = filteredIncomes.filter(income => income.category === category);
      }
      
      // Apply amount filters if provided
      if (minAmount !== undefined) {
        filteredIncomes = filteredIncomes.filter(income => income.amount >= minAmount);
      }
      
      if (maxAmount !== undefined) {
        filteredIncomes = filteredIncomes.filter(income => income.amount <= maxAmount);
      }
      
      // Sort incomes
      filteredIncomes.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        
        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
      
      // Apply pagination
      return filteredIncomes.slice(skip, skip + limit);
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
      
      // Determine sort option
      const sortOption = {};
      sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;
      
      // Execute query with pagination
      const incomes = await Income.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit);
      
      return incomes;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get a specific income entry by ID
 * @param {string} userId - User ID
 * @param {string} incomeId - Income entry ID
 * @returns {Object} - Income entry
 */
async function getIncomeById(userId, incomeId) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryIncomes = getInMemoryIncomes();
      
      const income = inMemoryIncomes.find(
        income => income._id === incomeId && income.userId === userId
      );
      
      return income || null;
    } else {
      // Using MongoDB
      const income = await Income.findOne({
        _id: incomeId,
        userId
      });
      
      return income;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Update an income entry
 * @param {string} userId - User ID
 * @param {string} incomeId - Income entry ID
 * @param {Object} updateData - Updated income data
 * @returns {Object} - Updated income entry
 */
async function updateIncome(userId, incomeId, updateData) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryIncomes = getInMemoryIncomes();
      
      const index = inMemoryIncomes.findIndex(
        income => income._id === incomeId && income.userId === userId
      );
      
      if (index === -1) {
        return null;
      }
      
      // Update the income entry
      inMemoryIncomes[index] = {
        ...inMemoryIncomes[index],
        ...updateData,
        updatedAt: new Date()
      };
      
      return inMemoryIncomes[index];
    } else {
      // Using MongoDB
      const income = await Income.findOneAndUpdate(
        { _id: incomeId, userId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      return income;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Delete an income entry
 * @param {string} userId - User ID
 * @param {string} incomeId - Income entry ID
 * @returns {boolean} - Whether the deletion was successful
 */
async function deleteIncome(userId, incomeId) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryIncomes = getInMemoryIncomes();
      
      const index = inMemoryIncomes.findIndex(
        income => income._id === incomeId && income.userId === userId
      );
      
      if (index === -1) {
        return false;
      }
      
      // Remove the income entry
      inMemoryIncomes.splice(index, 1);
      
      return true;
    } else {
      // Using MongoDB
      const result = await Income.findOneAndDelete({
        _id: incomeId,
        userId
      });
      
      return !!result;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Add an attachment to an income entry
 * @param {string} userId - User ID
 * @param {string} incomeId - Income entry ID
 * @param {Object} attachment - Attachment data
 * @returns {Object} - Updated income entry
 */
async function addAttachment(userId, incomeId, attachment) {
  try {
    // Get the income entry first
    const income = await getIncomeById(userId, incomeId);
    
    if (!income) {
      return null;
    }
    
    // Define the target directory for uploads
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const userUploadsDir = path.join(uploadDir, userId, 'income', incomeId);
    
    // Ensure the upload directory exists
    await fs.mkdir(userUploadsDir, { recursive: true });
    
    // Generate a unique filename
    const filename = `attachment_${Date.now()}${path.extname(attachment.file.originalname)}`;
    const filePath = path.join(userUploadsDir, filename);
    
    // Write the file
    await fs.writeFile(filePath, attachment.file.buffer);
    
    // Generate the URL for the file
    const baseUrl = process.env.BASE_URL || 'http://localhost:3006';
    const fileUrl = `${baseUrl}/uploads/${userId}/income/${incomeId}/${filename}`;
    
    // Create attachment object
    const attachmentObject = {
      name: attachment.name,
      type: attachment.type,
      url: fileUrl
    };
    
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryIncomes = getInMemoryIncomes();
      
      const index = inMemoryIncomes.findIndex(
        income => income._id === incomeId && income.userId === userId
      );
      
      if (index === -1) {
        return null;
      }
      
      // Add attachment to the income entry
      if (!inMemoryIncomes[index].attachments) {
        inMemoryIncomes[index].attachments = [];
      }
      
      inMemoryIncomes[index].attachments.push(attachmentObject);
      inMemoryIncomes[index].updatedAt = new Date();
      
      return inMemoryIncomes[index];
    } else {
      // Using MongoDB
      const updatedIncome = await Income.findOneAndUpdate(
        { _id: incomeId, userId },
        { 
          $push: { attachments: attachmentObject },
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );
      
      return updatedIncome;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get income statistics
 * @param {string} userId - User ID
 * @param {string} period - Time period for stats (day, week, month, year)
 * @param {string} category - Optional category filter
 * @returns {Object} - Income statistics
 */
async function getIncomeStats(userId, period = 'month', category) {
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
      const inMemoryIncomes = getInMemoryIncomes();
      
      // Filter incomes by user, date range, and category if provided
      let filteredIncomes = inMemoryIncomes.filter(income => {
        const incomeDate = new Date(income.date);
        let match = income.userId === userId && 
                   incomeDate >= startDate && 
                   incomeDate <= endDate;
                   
        if (match && category) {
          match = income.category === category;
        }
        
        return match;
      });
      
      // Calculate total income
      const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
      
      // Calculate average income
      const avgIncome = filteredIncomes.length > 0 ? totalIncome / filteredIncomes.length : 0;
      
      // Calculate income by category
      const incomeByCategory = {};
      filteredIncomes.forEach(income => {
        if (!incomeByCategory[income.category]) {
          incomeByCategory[income.category] = 0;
        }
        incomeByCategory[income.category] += income.amount;
      });
      
      // Calculate income by day/month
      const incomeByPeriod = {};
      filteredIncomes.forEach(income => {
        let periodKey;
        const incomeDate = new Date(income.date);
        
        if (period === 'year') {
          // For yearly stats, group by month
          periodKey = `${incomeDate.getFullYear()}-${incomeDate.getMonth() + 1}`;
        } else {
          // For other periods, group by day
          periodKey = incomeDate.toISOString().slice(0, 10); // YYYY-MM-DD
        }
        
        if (!incomeByPeriod[periodKey]) {
          incomeByPeriod[periodKey] = 0;
        }
        
        incomeByPeriod[periodKey] += income.amount;
      });
      
      // Calculate highest income transaction
      let highestIncome = filteredIncomes.length > 0 ? filteredIncomes[0] : null;
      
      filteredIncomes.forEach(income => {
        if (income.amount > (highestIncome?.amount || 0)) {
          highestIncome = income;
        }
      });
      
      // Calculate income frequency
      const recurringIncome = filteredIncomes.filter(income => income.isRecurring).reduce((sum, income) => sum + income.amount, 0);
      const oneTimeIncome = totalIncome - recurringIncome;
      
      return {
        period,
        dateRange: { startDate, endDate },
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        incomeCount: filteredIncomes.length,
        avgIncome: parseFloat(avgIncome.toFixed(2)),
        incomeByCategory,
        incomeByPeriod,
        highestIncome: highestIncome ? {
          amount: highestIncome.amount,
          title: highestIncome.title,
          category: highestIncome.category,
          date: highestIncome.date
        } : null,
        incomeFrequency: {
          recurring: parseFloat(recurringIncome.toFixed(2)),
          oneTime: parseFloat(oneTimeIncome.toFixed(2))
        }
      };
    } else {
      // Using MongoDB
      // Get total income and count
      const totalResult = await Income.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: '$amount' },
            incomeCount: { $sum: 1 }
          }
        }
      ]);
      
      const totalIncome = totalResult.length > 0 ? totalResult[0].totalIncome : 0;
      const incomeCount = totalResult.length > 0 ? totalResult[0].incomeCount : 0;
      const avgIncome = incomeCount > 0 ? totalIncome / incomeCount : 0;
      
      // Get income by category
      const categoryResult = await Income.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      const incomeByCategory = {};
      categoryResult.forEach(item => {
        incomeByCategory[item._id] = item.total;
      });
      
      // Get income by period (day/month)
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
      
      const periodResult = await Income.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: periodGroupId,
            total: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);
      
      const incomeByPeriod = {};
      
      periodResult.forEach(item => {
        let periodKey;
        
        if (period === 'year') {
          periodKey = `${item._id.year}-${item._id.month}`;
        } else {
          periodKey = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`;
        }
        
        incomeByPeriod[periodKey] = item.total;
      });
      
      // Get highest income transaction
      const highestIncome = await Income.findOne(baseQuery).sort({ amount: -1 });
      
      // Get income frequency breakdown
      const frequencyResult = await Income.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$isRecurring',
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      const recurringIncome = frequencyResult.find(item => item._id === true)?.total || 0;
      const oneTimeIncome = frequencyResult.find(item => item._id === false)?.total || 0;
      
      return {
        period,
        dateRange: { startDate, endDate },
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        incomeCount,
        avgIncome: parseFloat(avgIncome.toFixed(2)),
        incomeByCategory,
        incomeByPeriod,
        highestIncome: highestIncome ? {
          amount: highestIncome.amount,
          title: highestIncome.title,
          category: highestIncome.category,
          date: highestIncome.date
        } : null,
        incomeFrequency: {
          recurring: parseFloat(recurringIncome.toFixed(2)),
          oneTime: parseFloat(oneTimeIncome.toFixed(2))
        }
      };
    }
  } catch (error) {
    throw error;
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