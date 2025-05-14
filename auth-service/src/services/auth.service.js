const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Use User model if available, otherwise use in-memory database
let User;
try {
  User = require('../models/user.model');
} catch (error) {
  console.log('Using in-memory database instead of MongoDB');
}

/**
 * Register a new user
 * @param {Object} userData - User data for registration
 * @returns {Object} - The created user object (without password)
 */
async function registerUser(userData) {
  try {
    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    if (global.inMemoryDB) {
      // Using in-memory database
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user object
      const user = {
        ...userData,
        password: hashedPassword,
        verificationToken,
        emailVerified: false,
        role: 'user',
        joinDate: new Date(),
      };
      
      // Add user to in-memory database
      const savedUser = global.inMemoryDB.addUser(user);
      
      // Remove sensitive data
      const userResponse = { ...savedUser };
      delete userResponse.password;
      delete userResponse.verificationToken;
      
      return userResponse;
    } else {
      // Using MongoDB
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('Email already in use');
      }

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
    }
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
    let user, isMatch;
    
    if (global.inMemoryDB) {
      // Using in-memory database
      user = global.inMemoryDB.findUserByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Compare password
      isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid email or password');
      }
      
      // Update last login
      user.lastLogin = new Date();
      
    } else {
      // Using MongoDB
      // Find user by email
      user = await User.findOne({ email });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if password matches
      isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      user.lastLogin = Date.now();
      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user);

    // Remove sensitive data
    const userResponse = global.inMemoryDB ? { ...user } : user.toObject();
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
    id: user._id || user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'purpose_planner_secret_key_development_only', {
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
    if (global.inMemoryDB) {
      // Using in-memory database
      const userIndex = global.inMemoryDB.users.findIndex(
        user => user.verificationToken === token
      );
      
      if (userIndex === -1) {
        throw new Error('Invalid verification token');
      }
      
      global.inMemoryDB.users[userIndex].emailVerified = true;
      global.inMemoryDB.users[userIndex].verificationToken = undefined;
      
      return true;
    } else {
      // Using MongoDB
      const user = await User.findOne({ verificationToken: token });
      
      if (!user) {
        throw new Error('Invalid verification token');
      }

      user.emailVerified = true;
      user.verificationToken = undefined;
      
      await user.save();
      
      return true;
    }
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
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = Date.now() + 3600000; // 1 hour
    
    if (global.inMemoryDB) {
      // Using in-memory database
      const userIndex = global.inMemoryDB.users.findIndex(
        user => user.email === email
      );
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      global.inMemoryDB.users[userIndex].resetPasswordToken = resetToken;
      global.inMemoryDB.users[userIndex].resetPasswordExpires = resetExpires;
      
      return resetToken;
    } else {
      // Using MongoDB
      const user = await User.findOne({ email });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Set token and expiration
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetExpires;
      
      await user.save();
      
      return resetToken;
    }
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
    const now = Date.now();
    
    if (global.inMemoryDB) {
      // Using in-memory database
      const userIndex = global.inMemoryDB.users.findIndex(
        user => user.resetPasswordToken === token && user.resetPasswordExpires > now
      );
      
      if (userIndex === -1) {
        throw new Error('Invalid or expired reset token');
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update user
      global.inMemoryDB.users[userIndex].password = hashedPassword;
      global.inMemoryDB.users[userIndex].resetPasswordToken = undefined;
      global.inMemoryDB.users[userIndex].resetPasswordExpires = undefined;
      
      return true;
    } else {
      // Using MongoDB
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: now },
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
    }
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
    if (global.inMemoryDB) {
      // Using in-memory database
      const user = global.inMemoryDB.findUserById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Remove sensitive data
      const userResponse = { ...user };
      delete userResponse.password;
      delete userResponse.verificationToken;
      delete userResponse.resetPasswordToken;
      delete userResponse.resetPasswordExpires;
      
      return userResponse;
    } else {
      // Using MongoDB
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
    }
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