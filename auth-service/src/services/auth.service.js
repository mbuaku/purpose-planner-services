const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const crypto = require('crypto');

/**
 * Register a new user
 * @param {Object} userData - User data for registration
 * @returns {Object} - The created user object (without password)
 */
async function registerUser(userData) {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create new user
    const user = new User({
      ...userData,
      verificationToken,
    });

    await user.save();

    // Remove sensitive data
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.verificationToken;

    return userResponse;
  } catch (error) {
    throw error;
  }
}

/**
 * Login a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} - User object and JWT token
 */
async function loginUser(email, password) {
  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    // Remove sensitive data
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.verificationToken;
    delete userResponse.resetPasswordToken;
    delete userResponse.resetPasswordExpires;

    return {
      user: userResponse,
      token,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Generate JWT token for a user
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
function generateToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || '1d',
  });
}

/**
 * Verify a user's email
 * @param {string} token - Verification token
 * @returns {boolean} - Success status
 */
async function verifyEmail(token) {
  try {
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      throw new Error('Invalid verification token');
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    
    await user.save();
    
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * Initiate password reset
 * @param {string} email - User's email
 * @returns {string} - Reset token
 */
async function requestPasswordReset(email) {
  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new Error('User not found');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Set token and expiration
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();
    
    return resetToken;
  } catch (error) {
    throw error;
  }
}

/**
 * Reset user password
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {boolean} - Success status
 */
async function resetPassword(token, newPassword) {
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Set new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    return true;
  } catch (error) {
    throw error;
  }
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
    delete userResponse.password;
    delete userResponse.verificationToken;
    delete userResponse.resetPasswordToken;
    delete userResponse.resetPasswordExpires;
    
    return userResponse;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  getUserProfile,
};