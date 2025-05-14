const fs = require('fs').promises;
const path = require('path');
const JournalEntry = require('../models/journal-entry.model');

// In-memory store accessor function
function getInMemoryJournalEntries() {
  return global.inMemoryDB ? global.inMemoryDB.journalEntries : null;
}

/**
 * Check if we're using MongoDB or in-memory storage
 * @returns {boolean} - Whether in-memory storage is being used
 */
function isUsingInMemory() {
  return global.inMemoryDB !== undefined;
}

/**
 * Create a new journal entry
 * @param {Object} entryData - Journal entry data
 * @returns {Object} - Created journal entry
 */
async function createJournalEntry(entryData) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryJournalEntries = getInMemoryJournalEntries();
      
      const newEntry = {
        ...entryData,
        _id: Date.now().toString(),
        isFavorite: entryData.isFavorite || false,
        isPrivate: entryData.isPrivate !== undefined ? entryData.isPrivate : true,
        attachments: entryData.attachments || [],
        tags: entryData.tags || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      inMemoryJournalEntries.push(newEntry);
      return newEntry;
    } else {
      // Using MongoDB
      const entry = new JournalEntry(entryData);
      await entry.save();
      return entry;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get all journal entries for a user with filtering and pagination
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of entries to return
 * @param {number} page - Page number for pagination
 * @param {string} category - Category filter
 * @param {string} startDate - Start date for filtering (ISO format)
 * @param {string} endDate - End date for filtering (ISO format)
 * @param {boolean} isFavorite - Filter by favorite status
 * @param {string} searchQuery - Search query for title and content
 * @returns {Array} - Journal entries
 */
async function getJournalEntries(
  userId, 
  limit = 10, 
  page = 1, 
  category, 
  startDate, 
  endDate, 
  isFavorite,
  searchQuery
) {
  try {
    const skip = (page - 1) * limit;
    
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryJournalEntries = getInMemoryJournalEntries();
      
      // Filter entries by user
      let filteredEntries = inMemoryJournalEntries.filter(entry => entry.userId === userId);
      
      // Apply category filter if provided
      if (category) {
        filteredEntries = filteredEntries.filter(entry => entry.category === category);
      }
      
      // Apply date filters if provided
      if (startDate) {
        const startDateObj = new Date(startDate);
        filteredEntries = filteredEntries.filter(entry => 
          new Date(entry.createdAt) >= startDateObj
        );
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        filteredEntries = filteredEntries.filter(entry => 
          new Date(entry.createdAt) <= endDateObj
        );
      }
      
      // Apply favorite filter if provided
      if (isFavorite !== undefined) {
        filteredEntries = filteredEntries.filter(entry => entry.isFavorite === isFavorite);
      }
      
      // Apply search query if provided
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredEntries = filteredEntries.filter(entry => 
          entry.title.toLowerCase().includes(query) || 
          entry.content.toLowerCase().includes(query)
        );
      }
      
      // Sort by creation date (newest first)
      filteredEntries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Apply pagination
      return filteredEntries.slice(skip, skip + limit);
    } else {
      // Using MongoDB
      let query = { userId };
      
      // Apply category filter if provided
      if (category) {
        query.category = category;
      }
      
      // Apply date filters if provided
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }
      
      // Apply favorite filter if provided
      if (isFavorite !== undefined) {
        query.isFavorite = isFavorite;
      }
      
      // Apply search query if provided
      if (searchQuery) {
        query.$text = { $search: searchQuery };
      }
      
      // Execute query with pagination
      let entriesQuery = JournalEntry.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      // Add score if using text search
      if (searchQuery) {
        entriesQuery = entriesQuery.select({ score: { $meta: 'textScore' } })
          .sort({ score: { $meta: 'textScore' } });
      }
      
      const entries = await entriesQuery;
      
      return entries;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get a specific journal entry by ID
 * @param {string} userId - User ID
 * @param {string} entryId - Journal entry ID
 * @returns {Object} - Journal entry
 */
async function getJournalEntryById(userId, entryId) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryJournalEntries = getInMemoryJournalEntries();
      
      const entry = inMemoryJournalEntries.find(
        entry => entry._id === entryId && entry.userId === userId
      );
      
      return entry || null;
    } else {
      // Using MongoDB
      const entry = await JournalEntry.findOne({
        _id: entryId,
        userId
      });
      
      return entry;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Update a journal entry
 * @param {string} userId - User ID
 * @param {string} entryId - Journal entry ID
 * @param {Object} updateData - Updated journal entry data
 * @returns {Object} - Updated journal entry
 */
async function updateJournalEntry(userId, entryId, updateData) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryJournalEntries = getInMemoryJournalEntries();
      
      const index = inMemoryJournalEntries.findIndex(
        entry => entry._id === entryId && entry.userId === userId
      );
      
      if (index === -1) {
        return null;
      }
      
      // Update the entry
      inMemoryJournalEntries[index] = {
        ...inMemoryJournalEntries[index],
        ...updateData,
        updatedAt: new Date()
      };
      
      return inMemoryJournalEntries[index];
    } else {
      // Using MongoDB
      const entry = await JournalEntry.findOneAndUpdate(
        { _id: entryId, userId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      
      return entry;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Toggle favorite status of a journal entry
 * @param {string} userId - User ID
 * @param {string} entryId - Journal entry ID
 * @returns {Object} - Updated journal entry
 */
async function toggleFavorite(userId, entryId) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryJournalEntries = getInMemoryJournalEntries();
      
      const index = inMemoryJournalEntries.findIndex(
        entry => entry._id === entryId && entry.userId === userId
      );
      
      if (index === -1) {
        return null;
      }
      
      // Toggle favorite status
      inMemoryJournalEntries[index].isFavorite = !inMemoryJournalEntries[index].isFavorite;
      inMemoryJournalEntries[index].updatedAt = new Date();
      
      return inMemoryJournalEntries[index];
    } else {
      // Using MongoDB
      const entry = await JournalEntry.findOne({
        _id: entryId,
        userId
      });
      
      if (!entry) {
        return null;
      }
      
      entry.isFavorite = !entry.isFavorite;
      entry.updatedAt = new Date();
      
      await entry.save();
      
      return entry;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Add an attachment to a journal entry
 * @param {string} userId - User ID
 * @param {string} entryId - Journal entry ID
 * @param {Object} attachment - Attachment data
 * @returns {Object} - Updated journal entry
 */
async function addAttachment(userId, entryId, attachment) {
  try {
    // Get the entry first
    const entry = await getJournalEntryById(userId, entryId);
    
    if (!entry) {
      return null;
    }
    
    // Define the target directory for uploads
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const userUploadsDir = path.join(uploadDir, userId, 'journal', entryId);
    
    // Ensure the upload directory exists
    await fs.mkdir(userUploadsDir, { recursive: true });
    
    // Generate a unique filename
    const filename = `attachment_${Date.now()}${path.extname(attachment.file.originalname)}`;
    const filePath = path.join(userUploadsDir, filename);
    
    // Write the file
    await fs.writeFile(filePath, attachment.file.buffer);
    
    // Generate the URL for the file
    const baseUrl = process.env.BASE_URL || 'http://localhost:3005';
    const fileUrl = `${baseUrl}/uploads/${userId}/journal/${entryId}/${filename}`;
    
    // Create attachment object
    const attachmentObject = {
      name: attachment.name,
      type: attachment.type,
      url: fileUrl
    };
    
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryJournalEntries = getInMemoryJournalEntries();
      
      const index = inMemoryJournalEntries.findIndex(
        entry => entry._id === entryId && entry.userId === userId
      );
      
      if (index === -1) {
        return null;
      }
      
      // Add attachment to the entry
      if (!inMemoryJournalEntries[index].attachments) {
        inMemoryJournalEntries[index].attachments = [];
      }
      
      inMemoryJournalEntries[index].attachments.push(attachmentObject);
      inMemoryJournalEntries[index].updatedAt = new Date();
      
      return inMemoryJournalEntries[index];
    } else {
      // Using MongoDB
      const entry = await JournalEntry.findOneAndUpdate(
        { _id: entryId, userId },
        { 
          $push: { attachments: attachmentObject },
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );
      
      return entry;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a journal entry
 * @param {string} userId - User ID
 * @param {string} entryId - Journal entry ID
 * @returns {boolean} - Whether the deletion was successful
 */
async function deleteJournalEntry(userId, entryId) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const inMemoryJournalEntries = getInMemoryJournalEntries();
      
      const index = inMemoryJournalEntries.findIndex(
        entry => entry._id === entryId && entry.userId === userId
      );
      
      if (index === -1) {
        return false;
      }
      
      // Remove the entry
      inMemoryJournalEntries.splice(index, 1);
      
      return true;
    } else {
      // Using MongoDB
      const result = await JournalEntry.findOneAndDelete({
        _id: entryId,
        userId
      });
      
      return !!result;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get journal entry statistics
 * @param {string} userId - User ID
 * @param {string} period - Time period for stats (day, week, month, year)
 * @returns {Object} - Journal statistics
 */
async function getJournalStats(userId, period = 'month') {
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
      const inMemoryJournalEntries = getInMemoryJournalEntries();
      
      // Filter entries by user and date range
      const filteredEntries = inMemoryJournalEntries.filter(entry => 
        entry.userId === userId && 
        new Date(entry.createdAt) >= startDate &&
        new Date(entry.createdAt) <= endDate
      );
      
      // Calculate total entries
      const totalEntries = filteredEntries.length;
      
      // Calculate average words per entry
      const totalWords = filteredEntries.reduce((sum, entry) => {
        return sum + (entry.content.split(/\s+/).length || 0);
      }, 0);
      const avgWordsPerEntry = totalEntries > 0 ? totalWords / totalEntries : 0;
      
      // Calculate category breakdown
      const categoryBreakdown = {};
      filteredEntries.forEach(entry => {
        if (entry.category) {
          if (!categoryBreakdown[entry.category]) {
            categoryBreakdown[entry.category] = 0;
          }
          categoryBreakdown[entry.category]++;
        }
      });
      
      // Calculate consistency (entries per day)
      const daysDiff = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
      const consistency = totalEntries / daysDiff;
      
      // Count entries with scripture references
      const entriesWithScripture = filteredEntries.filter(entry => 
        entry.scripture && entry.scripture.book
      ).length;
      
      // Count favorite entries
      const favoriteEntries = filteredEntries.filter(entry => entry.isFavorite).length;
      
      return {
        period,
        totalEntries,
        avgWordsPerEntry: parseFloat(avgWordsPerEntry.toFixed(2)),
        categoryBreakdown,
        consistency: parseFloat(consistency.toFixed(2)),
        entriesWithScripture,
        favoriteEntries,
        startDate,
        endDate
      };
    } else {
      // Using MongoDB
      const match = {
        userId,
        createdAt: {
          $gte: startDate,
          $lte: endDate
        }
      };
      
      // Get total entries
      const totalEntries = await JournalEntry.countDocuments(match);
      
      // Calculate average words per entry using aggregate
      const wordCountAgg = await JournalEntry.aggregate([
        { $match: match },
        {
          $project: {
            wordCount: { $size: { $split: ["$content", " "] } }
          }
        },
        {
          $group: {
            _id: null,
            totalWords: { $sum: "$wordCount" }
          }
        }
      ]);
      
      const totalWords = wordCountAgg.length > 0 ? wordCountAgg[0].totalWords : 0;
      const avgWordsPerEntry = totalEntries > 0 ? totalWords / totalEntries : 0;
      
      // Get category breakdown
      const categoryAgg = await JournalEntry.aggregate([
        { $match: match },
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]);
      
      const categoryBreakdown = {};
      categoryAgg.forEach(cat => {
        categoryBreakdown[cat._id] = cat.count;
      });
      
      // Count entries with scripture references
      const entriesWithScripture = await JournalEntry.countDocuments({
        ...match,
        "scripture.book": { $exists: true, $ne: "" }
      });
      
      // Count favorite entries
      const favoriteEntries = await JournalEntry.countDocuments({
        ...match,
        isFavorite: true
      });
      
      // Calculate consistency (entries per day)
      const daysDiff = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
      const consistency = totalEntries / daysDiff;
      
      return {
        period,
        totalEntries,
        avgWordsPerEntry: parseFloat(avgWordsPerEntry.toFixed(2)),
        categoryBreakdown,
        consistency: parseFloat(consistency.toFixed(2)),
        entriesWithScripture,
        favoriteEntries,
        startDate,
        endDate
      };
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createJournalEntry,
  getJournalEntries,
  getJournalEntryById,
  updateJournalEntry,
  toggleFavorite,
  addAttachment,
  deleteJournalEntry,
  getJournalStats
};