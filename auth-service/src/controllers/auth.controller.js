const authService = require('../services/auth.service');
const validationUtil = require('../utils/validation.util');

/**
 * Register a new user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function register(req, res) {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate user input
    const validation = validationUtil.validateUserRegistration({
      firstName,
      lastName,
      email,
      password,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Sanitize inputs
    const sanitizedData = {
      firstName: validationUtil.sanitizeInput(firstName),
      lastName: validationUtil.sanitizeInput(lastName),
      email: email.toLowerCase().trim(),
      password,
    };

    // Register user
    const user = await authService.registerUser(sanitizedData);

    // Send verification email (to be implemented in notification service)
    // For now, just return success

    return res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: { user },
    });
  } catch (error) {
    // Handle duplicate email error
    if (error.message.includes('Email already in use')) {
      return res.status(409).json({
        success: false,
        message: 'Email is already in use',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration',
      error: error.message,
    });
  }
}

/**
 * Login a user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Login user
    const { user, token } = await authService.loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user, token },
    });
  } catch (error) {
    // Handle invalid credentials
    if (error.message.includes('Invalid email or password')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: error.message,
    });
  }
}

/**
 * Verify user email
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function verifyEmail(req, res) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }

    await authService.verifyEmail(token);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Email verification failed',
      error: error.message,
    });
  }
}

/**
 * Request password reset
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const resetToken = await authService.requestPasswordReset(email);

    // TODO: Send reset email with token (to be implemented in notification service)
    // For now, just return token in response (in production, you wouldn't do this)

    return res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      data: { resetToken }, // Remove this in production
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Failed to request password reset',
      error: error.message,
    });
  }
}

/**
 * Reset password
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required',
      });
    }

    await authService.resetPassword(token, newPassword);

    return res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message,
    });
  }
}

/**
 * Get user profile
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getProfile(req, res) {
  try {
    // User ID should be provided by the auth middleware
    const userId = req.user.id;

    const userProfile = await authService.getUserProfile(userId);

    return res.status(200).json({
      success: true,
      data: { user: userProfile },
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
  register,
  login,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  getProfile,
};