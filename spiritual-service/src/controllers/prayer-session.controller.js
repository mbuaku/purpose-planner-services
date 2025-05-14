const PrayerSession = require('../models/prayer-session.model');
const prayerSessionService = require('../services/prayer-session.service');

/**
 * Create a new prayer session
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function createPrayerSession(req, res) {
  try {
    const userId = req.user.id;
    const sessionData = {
      ...req.body,
      userId
    };

    const session = await prayerSessionService.createPrayerSession(sessionData);

    res.status(201).json({
      success: true,
      message: 'Prayer session logged successfully',
      data: {
        session
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
 * Get all prayer sessions for a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getPrayerSessions(req, res) {
  try {
    const userId = req.user.id;
    const { 
      limit = 20, 
      page = 1, 
      startDate, 
      endDate, 
      mood 
    } = req.query;

    const sessions = await prayerSessionService.getPrayerSessions(
      userId,
      parseInt(limit),
      parseInt(page),
      startDate,
      endDate,
      mood
    );

    res.status(200).json({
      success: true,
      data: {
        sessions,
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
 * Get a specific prayer session by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getPrayerSessionById(req, res) {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const session = await prayerSessionService.getPrayerSessionById(userId, sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Prayer session not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        session
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
 * Update a prayer session
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function updatePrayerSession(req, res) {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const updateData = req.body;

    const session = await prayerSessionService.updatePrayerSession(userId, sessionId, updateData);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Prayer session not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Prayer session updated successfully',
      data: {
        session
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
 * End an active prayer session
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function endPrayerSession(req, res) {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const { notes, focusRating, mood } = req.body;

    const session = await prayerSessionService.endPrayerSession(
      userId, 
      sessionId, 
      notes, 
      focusRating, 
      mood
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Prayer session not found or already ended'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Prayer session ended successfully',
      data: {
        session
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
 * Delete a prayer session
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function deletePrayerSession(req, res) {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;

    const result = await prayerSessionService.deletePrayerSession(userId, sessionId);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Prayer session not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Prayer session deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * Get prayer session statistics
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getPrayerSessionStats(req, res) {
  try {
    const userId = req.user.id;
    const { period = 'month' } = req.query;

    const stats = await prayerSessionService.getPrayerSessionStats(userId, period);

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
  createPrayerSession,
  getPrayerSessions,
  getPrayerSessionById,
  updatePrayerSession,
  endPrayerSession,
  deletePrayerSession,
  getPrayerSessionStats
};