const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Google OAuth only - Traditional auth methods removed

/**
 * Generate JWT token for a user
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
function generateToken(user) {
  const payload = {
    id: user._id || user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'purpose_planner_secret_key_development_only', {
    expiresIn: process.env.JWT_EXPIRATION || '1d',
  });
}

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Object} - User profile
 */
async function getUserProfile(userId) {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Remove sensitive data
    const userResponse = user.toObject();
    // No password or tokens to remove with Google OAuth only
    
    return userResponse;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getUserProfile,
  generateToken,
};