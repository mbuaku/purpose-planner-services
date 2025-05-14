const JournalEntry = require('../models/journal-entry.model');
const journalService = require('../services/journal.service');

/**
 * Create a new journal entry
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function createJournalEntry(req, res) {
  try {
    const userId = req.user.id;
    const entryData = {
      ...req.body,
      userId
    };

    const entry = await journalService.createJournalEntry(entryData);

    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      data: {
        entry
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
 * Get all journal entries for a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getJournalEntries(req, res) {
  try {
    const userId = req.user.id;
    const { 
      limit = 10, 
      page = 1, 
      category, 
      startDate, 
      endDate,
      isFavorite,
      searchQuery
    } = req.query;

    const entries = await journalService.getJournalEntries(
      userId,
      parseInt(limit),
      parseInt(page),
      category,
      startDate,
      endDate,
      isFavorite === 'true',
      searchQuery
    );

    res.status(200).json({
      success: true,
      data: {
        entries,
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
 * Get a specific journal entry by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getJournalEntryById(req, res) {
  try {
    const userId = req.user.id;
    const entryId = req.params.id;

    const entry = await journalService.getJournalEntryById(userId, entryId);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        entry
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
 * Update a journal entry
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function updateJournalEntry(req, res) {
  try {
    const userId = req.user.id;
    const entryId = req.params.id;
    const updateData = req.body;

    const entry = await journalService.updateJournalEntry(userId, entryId, updateData);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Journal entry updated successfully',
      data: {
        entry
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
 * Toggle favorite status of a journal entry
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function toggleFavorite(req, res) {
  try {
    const userId = req.user.id;
    const entryId = req.params.id;

    const entry = await journalService.toggleFavorite(userId, entryId);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Journal entry ${entry.isFavorite ? 'marked as favorite' : 'removed from favorites'}`,
      data: {
        entry
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
 * Add an attachment to a journal entry
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function addAttachment(req, res) {
  try {
    const userId = req.user.id;
    const entryId = req.params.id;
    
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

    const entry = await journalService.addAttachment(userId, entryId, attachment);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Attachment added successfully',
      data: {
        entry
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
 * Delete a journal entry
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function deleteJournalEntry(req, res) {
  try {
    const userId = req.user.id;
    const entryId = req.params.id;

    const result = await journalService.deleteJournalEntry(userId, entryId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Get journal entry statistics
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getJournalStats(req, res) {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;

    const stats = await journalService.getJournalStats(userId, period);

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
  createJournalEntry,
  getJournalEntries,
  getJournalEntryById,
  updateJournalEntry,
  toggleFavorite,
  addAttachment,
  deleteJournalEntry,
  getJournalStats
};