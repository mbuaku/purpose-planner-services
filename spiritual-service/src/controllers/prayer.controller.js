const Prayer = require('../models/prayer.model');
const prayerService = require('../services/prayer.service');

/**
 * Create a new prayer
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function createPrayer(req, res) {
  try {
    const userId = req.user.id;
    const prayerData = {
      ...req.body,
      userId
    };

    const prayer = await prayerService.createPrayer(prayerData);

    res.status(201).json({
      success: true,
      message: 'Prayer request created successfully',
      data: {
        prayer
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
 * Get all prayers for a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getPrayers(req, res) {
  try {
    const userId = req.user.id;
    const { 
      limit = 20, 
      page = 1, 
      category, 
      isAnswered, 
      isFavorite,
      isArchived,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const prayers = await prayerService.getPrayers(
      userId,
      {
        limit: parseInt(limit),
        page: parseInt(page),
        category,
        isAnswered: isAnswered === 'true',
        isFavorite: isFavorite === 'true',
        isArchived: isArchived === 'true',
        sortBy,
        sortOrder
      }
    );

    res.status(200).json({
      success: true,
      data: {
        prayers,
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
 * Get a specific prayer by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getPrayerById(req, res) {
  try {
    const userId = req.user.id;
    const prayerId = req.params.id;

    const prayer = await prayerService.getPrayerById(userId, prayerId);

    if (!prayer) {
      return res.status(404).json({
        success: false,
        message: 'Prayer not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        prayer
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
 * Update a prayer
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function updatePrayer(req, res) {
  try {
    const userId = req.user.id;
    const prayerId = req.params.id;
    const updateData = req.body;

    const prayer = await prayerService.updatePrayer(userId, prayerId, updateData);

    if (!prayer) {
      return res.status(404).json({
        success: false,
        message: 'Prayer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Prayer updated successfully',
      data: {
        prayer
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
 * Mark a prayer as answered
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function markPrayerAsAnswered(req, res) {
  try {
    const userId = req.user.id;
    const prayerId = req.params.id;
    const { answerNotes } = req.body;

    const prayer = await prayerService.markPrayerAsAnswered(userId, prayerId, answerNotes);

    if (!prayer) {
      return res.status(404).json({
        success: false,
        message: 'Prayer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Prayer marked as answered',
      data: {
        prayer
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
 * Toggle favorite status of a prayer
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function toggleFavorite(req, res) {
  try {
    const userId = req.user.id;
    const prayerId = req.params.id;

    const prayer = await prayerService.toggleFavorite(userId, prayerId);

    if (!prayer) {
      return res.status(404).json({
        success: false,
        message: 'Prayer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Prayer ${prayer.isFavorite ? 'marked as favorite' : 'removed from favorites'}`,
      data: {
        prayer
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
 * Archive a prayer
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function archivePrayer(req, res) {
  try {
    const userId = req.user.id;
    const prayerId = req.params.id;

    const prayer = await prayerService.archivePrayer(userId, prayerId);

    if (!prayer) {
      return res.status(404).json({
        success: false,
        message: 'Prayer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Prayer archived successfully',
      data: {
        prayer
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
 * Delete a prayer
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function deletePrayer(req, res) {
  try {
    const userId = req.user.id;
    const prayerId = req.params.id;

    const result = await prayerService.deletePrayer(userId, prayerId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Prayer not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Prayer deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Get prayer statistics
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getPrayerStats(req, res) {
  try {
    const userId = req.user.id;

    const stats = await prayerService.getPrayerStats(userId);

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