const express = require('express');
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Get passport config
const passportConfig = require('../config/passport')(router);

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

// Only add Google authentication routes if credentials are configured
const isGoogleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
console.log('Google authentication routes configuration status:', isGoogleConfigured ? 'ENABLED' : 'DISABLED');

if (isGoogleConfigured) {
  console.log('Setting up Google authentication routes with passport');
  
  /**
   * @route GET /api/auth/google
   * @desc Authenticate with Google
   * @access Public
   */
  router.get(
    '/google',
    (req, res, next) => {
      console.log('Google auth route accessed');
      next();
    },
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'select_account',
    })
  );

  /**
   * @route GET /api/auth/google/callback
   * @desc Google auth callback
   * @access Public
   */
  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/' }),
    (req, res) => {
      try {
        // Generate JWT token
        const token = passportConfig.generateToken(req.user);
        
        // User is now authenticated
        // Redirect to frontend with token
        const clientRedirectUrl = process.env.CLIENT_REDIRECT_URL || `${process.env.BASE_URL}/?token=${token}`;
        
        // Add token to URL as parameter
        const redirectUrl = clientRedirectUrl.includes('?') 
          ? `${clientRedirectUrl}&token=${token}`
          : `${clientRedirectUrl}?token=${token}`;
        
        res.redirect(redirectUrl);
      } catch (error) {
        console.error('Google auth callback error:', error);
        res.redirect('/');
      }
    }
  );
} else {
  // Add placeholder routes for when Google auth is not configured
  router.get('/google', (req, res) => {
    console.error('Google authentication not configured - route accessed without credentials');
    console.error('GOOGLE_CLIENT_ID present:', Boolean(process.env.GOOGLE_CLIENT_ID));
    console.error('GOOGLE_CLIENT_SECRET present:', Boolean(process.env.GOOGLE_CLIENT_SECRET));
    
    res.status(501).json({
      success: false,
      message: 'Google authentication not configured',
      debug: {
        clientIdExists: Boolean(process.env.GOOGLE_CLIENT_ID),
        clientSecretExists: Boolean(process.env.GOOGLE_CLIENT_SECRET),
        callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'not set'
      }
    });
  });
  
  router.get('/google/callback', (req, res) => {
    console.error('Google authentication callback accessed but not configured');
    
    res.status(501).json({
      success: false,
      message: 'Google authentication not configured',
      debug: {
        clientIdExists: Boolean(process.env.GOOGLE_CLIENT_ID),
        clientSecretExists: Boolean(process.env.GOOGLE_CLIENT_SECRET),
        callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'not set'
      }
    });
  });
}

module.exports = router;