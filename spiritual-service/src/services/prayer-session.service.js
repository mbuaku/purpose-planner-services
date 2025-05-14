const PrayerSession = require('../models/prayer-session.model');

// In-memory store accessor function
function getInMemoryPrayerSessions() {
  return global.inMemoryDB ? global.inMemoryDB.prayerSessions : null;
}

/**
 * Check if we're using MongoDB or in-memory storage
 * @returns {boolean} - Whether in-memory storage is being used
 */
function isUsingInMemory() {
  return global.inMemoryDB !== undefined;
}

/**
 * Create a new prayer session
 * @param {Object} sessionData - Prayer session data
 * @returns {Object} - Created prayer session
 */
async function createPrayerSession(sessionData) {
  try {
    // Set default start time if not provided
    const startTime = sessionData.startTime || new Date();
    
    // Calculate duration if end time is provided
    let duration = sessionData.duration;
    if (sessionData.endTime && !duration) {
      const endTimeMs = new Date(sessionData.endTime).getTime();
      const startTimeMs = new Date(startTime).getTime();
      duration = Math.round((endTimeMs - startTimeMs) / (1000 * 60)); // Convert to minutes
    }
    
    // Combine session data
    const completeSessionData = {
      ...sessionData,
      startTime,
      duration: duration || 0
    };
    
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryPrayerSessions = getInMemoryPrayerSessions();
      
      const newSession = {
        ...completeSessionData,
        _id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      inMemoryPrayerSessions.push(newSession);
      return newSession;
    } else {
      // Using MongoDB
      const session = new PrayerSession(completeSessionData);
      await session.save();
      return session;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get all prayer sessions for a user with filtering and pagination
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of sessions to return
 * @param {number} page - Page number for pagination
 * @param {string} startDate - Start date for filtering (ISO format)
 * @param {string} endDate - End date for filtering (ISO format)
 * @param {string} mood - Mood filter
 * @returns {Array} - Prayer sessions
 */
async function getPrayerSessions(userId, limit = 20, page = 1, startDate, endDate, mood) {
  try {
    const skip = (page - 1) * limit;
    
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryPrayerSessions = getInMemoryPrayerSessions();
      
      // Filter sessions by user
      let filteredSessions = inMemoryPrayerSessions.filter(session => session.userId === userId);
      
      // Apply date filters if provided
      if (startDate) {
        const startDateObj = new Date(startDate);
        filteredSessions = filteredSessions.filter(session => 
          new Date(session.startTime) >= startDateObj
        );
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        filteredSessions = filteredSessions.filter(session => 
          new Date(session.startTime) <= endDateObj
        );
      }
      
      // Apply mood filter if provided
      if (mood) {
        filteredSessions = filteredSessions.filter(session => session.mood === mood);
      }
      
      // Sort by start time (newest first)
      filteredSessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      
      // Apply pagination
      return filteredSessions.slice(skip, skip + limit);
    } else {
      // Using MongoDB
      let query = { userId };
      
      // Apply date filters if provided
      if (startDate || endDate) {
        query.startTime = {};
        if (startDate) query.startTime.$gte = new Date(startDate);
        if (endDate) query.startTime.$lte = new Date(endDate);
      }
      
      // Apply mood filter if provided
      if (mood) {
        query.mood = mood;
      }
      
      const sessions = await PrayerSession.find(query)
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limit);
      
      return sessions;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get a specific prayer session by ID
 * @param {string} userId - User ID
 * @param {string} sessionId - Prayer session ID
 * @returns {Object} - Prayer session
 */
async function getPrayerSessionById(userId, sessionId) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryPrayerSessions = getInMemoryPrayerSessions();
      
      const session = inMemoryPrayerSessions.find(
        session => session._id === sessionId && session.userId === userId
      );
      
      return session || null;
    } else {
      // Using MongoDB
      const session = await PrayerSession.findOne({
        _id: sessionId,
        userId
      });
      
      return session;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Update a prayer session
 * @param {string} userId - User ID
 * @param {string} sessionId - Prayer session ID
 * @param {Object} updateData - Updated prayer session data
 * @returns {Object} - Updated prayer session
 */
async function updatePrayerSession(userId, sessionId, updateData) {
  try {
    // If duration needs to be recalculated
    if ((updateData.startTime || updateData.endTime) && !updateData.duration) {
      const session = await getPrayerSessionById(userId, sessionId);
      if (!session) return null;
      
      const startTime = updateData.startTime ? new Date(updateData.startTime) : new Date(session.startTime);
      const endTime = updateData.endTime ? new Date(updateData.endTime) : (session.endTime ? new Date(session.endTime) : null);
      
      if (endTime) {
        const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
        updateData.duration = durationMinutes;
      }
    }
    
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryPrayerSessions = getInMemoryPrayerSessions();
      
      const index = inMemoryPrayerSessions.findIndex(
        session => session._id === sessionId && session.userId === userId
      );
      
      if (index === -1) {
        return null;
      }
      
      // Update the session
      inMemoryPrayerSessions[index] = {
        ...inMemoryPrayerSessions[index],
        ...updateData,
        updatedAt: new Date()
      };
      
      return inMemoryPrayerSessions[index];
    } else {
      // Using MongoDB
      const session = await PrayerSession.findOneAndUpdate(
        { _id: sessionId, userId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      return session;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * End an active prayer session
 * @param {string} userId - User ID
 * @param {string} sessionId - Prayer session ID
 * @param {string} notes - Session notes
 * @param {number} focusRating - Focus rating (1-10)
 * @param {string} mood - Mood during prayer
 * @returns {Object} - Updated prayer session
 */
async function endPrayerSession(userId, sessionId, notes, focusRating, mood) {
  try {
    const session = await getPrayerSessionById(userId, sessionId);
    
    if (!session) return null;
    
    // Check if session is already ended
    if (session.endTime) {
      return null;
    }
    
    const endTime = new Date();
    const startTime = new Date(session.startTime);
    
    // Calculate duration in minutes
    const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
    
    const updateData = {
      endTime,
      duration: durationMinutes,
      notes: notes || session.notes,
      focusRating: focusRating || session.focusRating,
      mood: mood || session.mood
    };
    
    return updatePrayerSession(userId, sessionId, updateData);
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a prayer session
 * @param {string} userId - User ID
 * @param {string} sessionId - Prayer session ID
 * @returns {boolean} - Whether the deletion was successful
 */
async function deletePrayerSession(userId, sessionId) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryPrayerSessions = getInMemoryPrayerSessions();
      
      const index = inMemoryPrayerSessions.findIndex(
        session => session._id === sessionId && session.userId === userId
      );
      
      if (index === -1) {
        return false;
      }
      
      // Remove the session
      inMemoryPrayerSessions.splice(index, 1);
      
      return true;
    } else {
      // Using MongoDB
      const result = await PrayerSession.findOneAndDelete({
        _id: sessionId,
        userId
      });
      
      return !!result;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get prayer session statistics
 * @param {string} userId - User ID
 * @param {string} period - Time period for stats (day, week, month, year)
 * @returns {Object} - Prayer session statistics
 */
async function getPrayerSessionStats(userId, period = 'month') {
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
      const inMemoryPrayerSessions = getInMemoryPrayerSessions();
      
      // Filter sessions by user and date range
      const filteredSessions = inMemoryPrayerSessions.filter(session => 
        session.userId === userId && 
        new Date(session.startTime) >= startDate &&
        new Date(session.startTime) <= endDate
      );
      
      // Calculate stats
      const totalSessions = filteredSessions.length;
      
      // Calculate total prayer time
      const totalPrayerTime = filteredSessions.reduce((total, session) => {
        return total + (session.duration || 0);
      }, 0);
      
      // Calculate average session length
      const avgSessionLength = totalSessions > 0 ? totalPrayerTime / totalSessions : 0;
      
      // Calculate average focus rating
      const totalFocusRating = filteredSessions.reduce((total, session) => {
        return total + (session.focusRating || 0);
      }, 0);
      const avgFocusRating = totalSessions > 0 ? totalFocusRating / totalSessions : 0;
      
      // Calculate mood distribution
      const moodDistribution = {};
      filteredSessions.forEach(session => {
        if (session.mood) {
          if (!moodDistribution[session.mood]) {
            moodDistribution[session.mood] = 0;
          }
          moodDistribution[session.mood]++;
        }
      });
      
      // Calculate consistency (sessions per day)
      const daysDiff = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
      const consistency = totalSessions / daysDiff;
      
      return {
        period,
        totalSessions,
        totalPrayerTime,
        avgSessionLength: parseFloat(avgSessionLength.toFixed(2)),
        avgFocusRating: parseFloat(avgFocusRating.toFixed(2)),
        moodDistribution,
        consistency: parseFloat(consistency.toFixed(2)),
        startDate,
        endDate
      };
    } else {
      // Using MongoDB
      const match = {
        userId,
        startTime: {
          $gte: startDate,
          $lte: endDate
        }
      };
      
      // Aggregate stats
      const aggregateResult = await PrayerSession.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            totalPrayerTime: { $sum: '$duration' },
            avgFocusRating: { $avg: '$focusRating' },
            moods: { $push: '$mood' }
          }
        }
      ]);
      
      if (aggregateResult.length === 0) {
        return {
          period,
          totalSessions: 0,
          totalPrayerTime: 0,
          avgSessionLength: 0,
          avgFocusRating: 0,
          moodDistribution: {},
          consistency: 0,
          startDate,
          endDate
        };
      }
      
      const stats = aggregateResult[0];
      
      // Calculate average session length
      const avgSessionLength = stats.totalSessions > 0 ? stats.totalPrayerTime / stats.totalSessions : 0;
      
      // Calculate mood distribution
      const moodDistribution = {};
      stats.moods.forEach(mood => {
        if (mood) {
          if (!moodDistribution[mood]) {
            moodDistribution[mood] = 0;
          }
          moodDistribution[mood]++;
        }
      });
      
      // Calculate consistency (sessions per day)
      const daysDiff = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
      const consistency = stats.totalSessions / daysDiff;
      
      return {
        period,
        totalSessions: stats.totalSessions,
        totalPrayerTime: stats.totalPrayerTime,
        avgSessionLength: parseFloat(avgSessionLength.toFixed(2)),
        avgFocusRating: parseFloat((stats.avgFocusRating || 0).toFixed(2)),
        moodDistribution,
        consistency: parseFloat(consistency.toFixed(2)),
        startDate,
        endDate
      };
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createPrayerSession,
  getPrayerSessions,
  getPrayerSessionById,
  updatePrayerSession,
  endPrayerSession,
  deletePrayerSession,
  getPrayerSessionStats
};