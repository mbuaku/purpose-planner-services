const Prayer = require('../models/prayer.model');

// In-memory store accessor function
function getInMemoryPrayers() {
  return global.inMemoryDB ? global.inMemoryDB.prayers : null;
}

/**
 * Check if we're using MongoDB or in-memory storage
 * @returns {boolean} - Whether in-memory storage is being used
 */
function isUsingInMemory() {
  return global.inMemoryDB !== undefined;
}

/**
 * Create a new prayer
 * @param {Object} prayerData - Prayer data
 * @returns {Object} - Created prayer
 */
async function createPrayer(prayerData) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryPrayers = getInMemoryPrayers();
      
      const newPrayer = {
        ...prayerData,
        _id: Date.now().toString(),
        isAnswered: prayerData.isAnswered || false,
        isFavorite: prayerData.isFavorite || false,
        isArchived: prayerData.isArchived || false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      inMemoryPrayers.push(newPrayer);
      return newPrayer;
    } else {
      // Using MongoDB
      const prayer = new Prayer(prayerData);
      await prayer.save();
      return prayer;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get all prayers for a user with filtering and pagination
 * @param {string} userId - User ID
 * @param {Object} options - Filter and pagination options
 * @returns {Array} - Prayers
 */
async function getPrayers(userId, options = {}) {
  try {
    const { 
      limit = 20, 
      page = 1, 
      category, 
      isAnswered, 
      isFavorite,
      isArchived,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;
    
    const skip = (page - 1) * limit;
    
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryPrayers = getInMemoryPrayers();
      
      // Filter prayers
      let filteredPrayers = inMemoryPrayers.filter(prayer => prayer.userId === userId);
      
      if (category) {
        filteredPrayers = filteredPrayers.filter(prayer => prayer.category === category);
      }
      
      if (isAnswered !== undefined) {
        filteredPrayers = filteredPrayers.filter(prayer => prayer.isAnswered === isAnswered);
      }
      
      if (isFavorite !== undefined) {
        filteredPrayers = filteredPrayers.filter(prayer => prayer.isFavorite === isFavorite);
      }
      
      if (isArchived !== undefined) {
        filteredPrayers = filteredPrayers.filter(prayer => prayer.isArchived === isArchived);
      }
      
      // Sort prayers
      filteredPrayers.sort((a, b) => {
        if (sortOrder === 'asc') {
          return a[sortBy] > b[sortBy] ? 1 : -1;
        } else {
          return a[sortBy] < b[sortBy] ? 1 : -1;
        }
      });
      
      // Apply pagination
      return filteredPrayers.slice(skip, skip + limit);
    } else {
      // Using MongoDB
      let query = { userId };
      
      if (category) {
        query.category = category;
      }
      
      if (isAnswered !== undefined) {
        query.isAnswered = isAnswered;
      }
      
      if (isFavorite !== undefined) {
        query.isFavorite = isFavorite;
      }
      
      if (isArchived !== undefined) {
        query.isArchived = isArchived;
      }
      
      // Determine sort order
      const sortOption = {};
      sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;
      
      const prayers = await Prayer.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit);
      
      return prayers;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get a specific prayer by ID
 * @param {string} userId - User ID
 * @param {string} prayerId - Prayer ID
 * @returns {Object} - Prayer
 */
async function getPrayerById(userId, prayerId) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryPrayers = getInMemoryPrayers();
      
      const prayer = inMemoryPrayers.find(
        prayer => prayer._id === prayerId && prayer.userId === userId
      );
      
      return prayer || null;
    } else {
      // Using MongoDB
      const prayer = await Prayer.findOne({
        _id: prayerId,
        userId
      });
      
      return prayer;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Update a prayer
 * @param {string} userId - User ID
 * @param {string} prayerId - Prayer ID
 * @param {Object} updateData - Updated prayer data
 * @returns {Object} - Updated prayer
 */
async function updatePrayer(userId, prayerId, updateData) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryPrayers = getInMemoryPrayers();
      
      const index = inMemoryPrayers.findIndex(
        prayer => prayer._id === prayerId && prayer.userId === userId
      );
      
      if (index === -1) {
        return null;
      }
      
      // Update the prayer
      inMemoryPrayers[index] = {
        ...inMemoryPrayers[index],
        ...updateData,
        updatedAt: new Date()
      };
      
      return inMemoryPrayers[index];
    } else {
      // Using MongoDB
      const prayer = await Prayer.findOneAndUpdate(
        { _id: prayerId, userId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      return prayer;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Mark a prayer as answered
 * @param {string} userId - User ID
 * @param {string} prayerId - Prayer ID
 * @param {string} answerNotes - Notes about how the prayer was answered
 * @returns {Object} - Updated prayer
 */
async function markPrayerAsAnswered(userId, prayerId, answerNotes) {
  try {
    const updateData = {
      isAnswered: true,
      answeredDate: new Date(),
      answerNotes: answerNotes || ''
    };
    
    return updatePrayer(userId, prayerId, updateData);
  } catch (error) {
    throw error;
  }
}

/**
 * Toggle favorite status of a prayer
 * @param {string} userId - User ID
 * @param {string} prayerId - Prayer ID
 * @returns {Object} - Updated prayer
 */
async function toggleFavorite(userId, prayerId) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryPrayers = getInMemoryPrayers();
      
      const index = inMemoryPrayers.findIndex(
        prayer => prayer._id === prayerId && prayer.userId === userId
      );
      
      if (index === -1) {
        return null;
      }
      
      // Toggle favorite status
      inMemoryPrayers[index].isFavorite = !inMemoryPrayers[index].isFavorite;
      inMemoryPrayers[index].updatedAt = new Date();
      
      return inMemoryPrayers[index];
    } else {
      // Using MongoDB
      const prayer = await Prayer.findOne({
        _id: prayerId,
        userId
      });
      
      if (!prayer) {
        return null;
      }
      
      prayer.isFavorite = !prayer.isFavorite;
      prayer.updatedAt = new Date();
      
      await prayer.save();
      
      return prayer;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Archive a prayer
 * @param {string} userId - User ID
 * @param {string} prayerId - Prayer ID
 * @returns {Object} - Updated prayer
 */
async function archivePrayer(userId, prayerId) {
  try {
    const updateData = {
      isArchived: true
    };
    
    return updatePrayer(userId, prayerId, updateData);
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a prayer
 * @param {string} userId - User ID
 * @param {string} prayerId - Prayer ID
 * @returns {boolean} - Whether the deletion was successful
 */
async function deletePrayer(userId, prayerId) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryPrayers = getInMemoryPrayers();
      
      const index = inMemoryPrayers.findIndex(
        prayer => prayer._id === prayerId && prayer.userId === userId
      );
      
      if (index === -1) {
        return false;
      }
      
      // Remove the prayer
      inMemoryPrayers.splice(index, 1);
      
      return true;
    } else {
      // Using MongoDB
      const result = await Prayer.findOneAndDelete({
        _id: prayerId,
        userId
      });
      
      return !!result;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get prayer statistics for a user
 * @param {string} userId - User ID
 * @returns {Object} - Prayer statistics
 */
async function getPrayerStats(userId) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryPrayers = getInMemoryPrayers();
      
      // Filter prayers by user
      const userPrayers = inMemoryPrayers.filter(prayer => prayer.userId === userId);
      
      // Calculate statistics
      const totalPrayers = userPrayers.length;
      const answeredPrayers = userPrayers.filter(prayer => prayer.isAnswered).length;
      const unansweredPrayers = totalPrayers - answeredPrayers;
      const archivedPrayers = userPrayers.filter(prayer => prayer.isArchived).length;
      const favoritePrayers = userPrayers.filter(prayer => prayer.isFavorite).length;
      
      // Category breakdown
      const categories = {};
      userPrayers.forEach(prayer => {
        if (!categories[prayer.category]) {
          categories[prayer.category] = 0;
        }
        categories[prayer.category]++;
      });
      
      // Calculate answer rate
      const answerRate = totalPrayers > 0 ? (answeredPrayers / totalPrayers) * 100 : 0;
      
      return {
        totalPrayers,
        answeredPrayers,
        unansweredPrayers,
        archivedPrayers,
        favoritePrayers,
        answerRate: parseFloat(answerRate.toFixed(2)),
        categoryBreakdown: categories
      };
    } else {
      // Using MongoDB
      // Get total counts
      const totalPrayers = await Prayer.countDocuments({ userId });
      const answeredPrayers = await Prayer.countDocuments({ userId, isAnswered: true });
      const unansweredPrayers = totalPrayers - answeredPrayers;
      const archivedPrayers = await Prayer.countDocuments({ userId, isArchived: true });
      const favoritePrayers = await Prayer.countDocuments({ userId, isFavorite: true });
      
      // Get category breakdown
      const categoryAggregation = await Prayer.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      
      const categoryBreakdown = {};
      categoryAggregation.forEach(item => {
        categoryBreakdown[item._id] = item.count;
      });
      
      // Calculate answer rate
      const answerRate = totalPrayers > 0 ? (answeredPrayers / totalPrayers) * 100 : 0;
      
      return {
        totalPrayers,
        answeredPrayers,
        unansweredPrayers,
        archivedPrayers,
        favoritePrayers,
        answerRate: parseFloat(answerRate.toFixed(2)),
        categoryBreakdown
      };
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createPrayer,
  getPrayers,
  getPrayerById,
  updatePrayer,
  markPrayerAsAnswered,
  toggleFavorite,
  archivePrayer,
  deletePrayer,
  getPrayerStats
};