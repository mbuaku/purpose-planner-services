const authService = require('../services/auth.service');

// Traditional auth methods removed - Google OAuth only

/**
 * Get user profile
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getProfile(req, res) {
  try {
    const userId = req.user.id;

    // Get user profile
    const profile = await authService.getUserProfile(userId);

    return res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: { profile },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
      error: error.message,
    });
  }
}

module.exports = {
  getProfile,
};