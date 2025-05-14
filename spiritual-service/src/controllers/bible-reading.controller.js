const BibleReading = require('../models/bible-reading.model');
const bibleReadingService = require('../services/bible-reading.service');

/**
 * Create a new Bible reading entry
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function createBibleReading(req, res) {
  try {
    const userId = req.user.id;
    const readingData = {
      ...req.body,
      userId
    };

    const reading = await bibleReadingService.createBibleReading(readingData);

    res.status(201).json({
      success: true,
      message: 'Bible reading logged successfully',
      data: {
        reading
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
 * Get all Bible readings for a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getBibleReadings(req, res) {
  try {
    const userId = req.user.id;
    const { limit = 10, page = 1, startDate, endDate, book } = req.query;

    const readings = await bibleReadingService.getBibleReadings(
      userId, 
      parseInt(limit), 
      parseInt(page),
      startDate,
      endDate,
      book
    );

    res.status(200).json({
      success: true,
      data: {
        readings,
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
 * Get a specific Bible reading by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getBibleReadingById(req, res) {
  try {
    const userId = req.user.id;
    const readingId = req.params.id;

    const reading = await bibleReadingService.getBibleReadingById(userId, readingId);

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Bible reading not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        reading
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
 * Update a Bible reading entry
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function updateBibleReading(req, res) {
  try {
    const userId = req.user.id;
    const readingId = req.params.id;
    const updateData = req.body;

    const reading = await bibleReadingService.updateBibleReading(userId, readingId, updateData);

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'Bible reading not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bible reading updated successfully',
      data: {
        reading
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
 * Delete a Bible reading entry
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function deleteBibleReading(req, res) {
  try {
    const userId = req.user.id;
    const readingId = req.params.id;

    const result = await bibleReadingService.deleteBibleReading(userId, readingId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Bible reading not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bible reading deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Get Bible reading statistics
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getBibleReadingStats(req, res) {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;

    const stats = await bibleReadingService.getBibleReadingStats(userId, period);

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
  createBibleReading,
  getBibleReadings,
  getBibleReadingById,
  updateBibleReading,
  deleteBibleReading,
  getBibleReadingStats
};