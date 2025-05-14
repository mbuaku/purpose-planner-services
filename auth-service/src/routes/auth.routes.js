const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @desc Authenticate user & get token
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route GET /api/auth/verify/:token
 * @desc Verify user email
 * @access Public
 */
router.get('/verify/:token', authController.verifyEmail);

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password', authController.requestPasswordReset);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password
 * @access Public
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @route GET /api/auth/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', authMiddleware.authenticate, authController.getProfile);

/**
 * @route GET /api/auth/check
 * @desc Check if user is authenticated
 * @access Private
 */
router.get('/check', authMiddleware.authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authenticated',
    user: req.user,
  });
});

module.exports = router;