const BibleReading = require('../models/bible-reading.model');

// In-memory store accessor function
function getInMemoryBibleReadings() {
  return global.inMemoryDB ? global.inMemoryDB.bibleReadings : null;
}

/**
 * Check if we're using MongoDB or in-memory storage
 * @returns {boolean} - Whether in-memory storage is being used
 */
function isUsingInMemory() {
  return global.inMemoryDB !== undefined;
}

/**
 * Create a new Bible reading entry
 * @param {Object} readingData - Bible reading data
 * @returns {Object} - Created Bible reading entry
 */
async function createBibleReading(readingData) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryBibleReadings = getInMemoryBibleReadings();
      
      const newReading = {
        ...readingData,
        _id: Date.now().toString(),
        date: readingData.date || new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      inMemoryBibleReadings.push(newReading);
      return newReading;
    } else {
      // Using MongoDB
      const reading = new BibleReading(readingData);
      await reading.save();
      return reading;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get all Bible readings for a user
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of readings to return
 * @param {number} page - Page number for pagination
 * @param {string} startDate - Start date for filtering (ISO format)
 * @param {string} endDate - End date for filtering (ISO format)
 * @param {string} book - Bible book name for filtering
 * @returns {Array} - Bible reading entries
 */
async function getBibleReadings(userId, limit = 10, page = 1, startDate, endDate, book) {
  try {
    const skip = (page - 1) * limit;
    
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryBibleReadings = getInMemoryBibleReadings();
      
      let filteredReadings = inMemoryBibleReadings.filter(reading => reading.userId === userId);
      
      // Apply date filters if provided
      if (startDate) {
        const startDateObj = new Date(startDate);
        filteredReadings = filteredReadings.filter(reading => 
          new Date(reading.date) >= startDateObj
        );
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        filteredReadings = filteredReadings.filter(reading => 
          new Date(reading.date) <= endDateObj
        );
      }
      
      // Apply book filter if provided
      if (book) {
        filteredReadings = filteredReadings.filter(reading => 
          reading.book.toLowerCase() === book.toLowerCase()
        );
      }
      
      // Sort by date (newest first)
      filteredReadings.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Apply pagination
      return filteredReadings.slice(skip, skip + limit);
    } else {
      // Using MongoDB
      let query = { userId };
      
      // Apply date filters if provided
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }
      
      // Apply book filter if provided
      if (book) {
        query.book = new RegExp(book, 'i'); // Case-insensitive search
      }
      
      const readings = await BibleReading.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);
      
      return readings;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get a specific Bible reading by ID
 * @param {string} userId - User ID
 * @param {string} readingId - Bible reading ID
 * @returns {Object} - Bible reading entry
 */
async function getBibleReadingById(userId, readingId) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryBibleReadings = getInMemoryBibleReadings();
      
      const reading = inMemoryBibleReadings.find(
        reading => reading._id === readingId && reading.userId === userId
      );
      
      return reading || null;
    } else {
      // Using MongoDB
      const reading = await BibleReading.findOne({
        _id: readingId,
        userId
      });
      
      return reading;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Update a Bible reading entry
 * @param {string} userId - User ID
 * @param {string} readingId - Bible reading ID
 * @param {Object} updateData - Updated Bible reading data
 * @returns {Object} - Updated Bible reading entry
 */
async function updateBibleReading(userId, readingId, updateData) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryBibleReadings = getInMemoryBibleReadings();
      
      const index = inMemoryBibleReadings.findIndex(
        reading => reading._id === readingId && reading.userId === userId
      );
      
      if (index === -1) {
        return null;
      }
      
      // Update the reading
      inMemoryBibleReadings[index] = {
        ...inMemoryBibleReadings[index],
        ...updateData,
        updatedAt: new Date()
      };
      
      return inMemoryBibleReadings[index];
    } else {
      // Using MongoDB
      const reading = await BibleReading.findOneAndUpdate(
        { _id: readingId, userId },
        updateData,
        { new: true, runValidators: true }
      );
      
      return reading;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a Bible reading entry
 * @param {string} userId - User ID
 * @param {string} readingId - Bible reading ID
 * @returns {boolean} - Whether the deletion was successful
 */
async function deleteBibleReading(userId, readingId) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryBibleReadings = getInMemoryBibleReadings();
      
      const index = inMemoryBibleReadings.findIndex(
        reading => reading._id === readingId && reading.userId === userId
      );
      
      if (index === -1) {
        return false;
      }
      
      // Remove the reading
      inMemoryBibleReadings.splice(index, 1);
      
      return true;
    } else {
      // Using MongoDB
      const result = await BibleReading.findOneAndDelete({
        _id: readingId,
        userId
      });
      
      return !!result;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get Bible reading statistics
 * @param {string} userId - User ID
 * @param {string} period - Time period for stats (day, week, month, year)
 * @returns {Object} - Bible reading statistics
 */
async function getBibleReadingStats(userId, period = 'month') {
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
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Default to month
    }
    
    const endDate = new Date();
    
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryBibleReadings = getInMemoryBibleReadings();
      
      // Filter readings by user and date range
      const filteredReadings = inMemoryBibleReadings.filter(reading => 
        reading.userId === userId && 
        new Date(reading.date) >= startDate &&
        new Date(reading.date) <= endDate
      );
      
      // Calculate stats
      const totalReadings = filteredReadings.length;
      const totalChapters = filteredReadings.length; // Each reading is one chapter by default
      
      // Calculate unique books read
      const uniqueBooks = new Set(filteredReadings.map(reading => reading.book)).size;
      
      // Calculate total reading time (if available)
      const totalReadingTime = filteredReadings.reduce((total, reading) => {
        return total + (reading.duration || 0);
      }, 0);
      
      // Calculate reading frequency (readings per day)
      const daysDiff = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
      const readingFrequency = totalReadings / daysDiff;
      
      // Get most read book
      const bookCounts = {};
      filteredReadings.forEach(reading => {
        if (!bookCounts[reading.book]) {
          bookCounts[reading.book] = 0;
        }
        bookCounts[reading.book]++;
      });
      
      const mostReadBook = Object.entries(bookCounts).reduce((max, [book, count]) => {
        return count > (max.count || 0) ? { book, count } : max;
      }, {});
      
      return {
        period,
        totalReadings,
        totalChapters,
        uniqueBooks,
        totalReadingTime,
        readingFrequency: parseFloat(readingFrequency.toFixed(2)),
        mostReadBook: mostReadBook.book || null,
        startDate,
        endDate
      };
    } else {
      // Using MongoDB
      const match = {
        userId,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      };
      
      // Aggregate stats
      const aggregateResult = await BibleReading.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalReadings: { $sum: 1 },
            uniqueBooks: { $addToSet: '$book' },
            totalReadingTime: { $sum: { $ifNull: ['$duration', 0] } },
            books: { $push: '$book' }
          }
        }
      ]);
      
      if (aggregateResult.length === 0) {
        return {
          period,
          totalReadings: 0,
          totalChapters: 0,
          uniqueBooks: 0,
          totalReadingTime: 0,
          readingFrequency: 0,
          mostReadBook: null,
          startDate,
          endDate
        };
      }
      
      const stats = aggregateResult[0];
      
      // Calculate reading frequency (readings per day)
      const daysDiff = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
      const readingFrequency = stats.totalReadings / daysDiff;
      
      // Find most read book
      const bookCounts = {};
      stats.books.forEach(book => {
        if (!bookCounts[book]) {
          bookCounts[book] = 0;
        }
        bookCounts[book]++;
      });
      
      const mostReadBook = Object.entries(bookCounts).reduce((max, [book, count]) => {
        return count > (max.count || 0) ? { book, count } : max;
      }, {});
      
      return {
        period,
        totalReadings: stats.totalReadings,
        totalChapters: stats.totalReadings, // Each reading is one chapter by default
        uniqueBooks: stats.uniqueBooks.length,
        totalReadingTime: stats.totalReadingTime,
        readingFrequency: parseFloat(readingFrequency.toFixed(2)),
        mostReadBook: mostReadBook.book || null,
        startDate,
        endDate
      };
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createBibleReading,
  getBibleReadings,
  getBibleReadingById,
  updateBibleReading,
  deleteBibleReading,
  getBibleReadingStats
};