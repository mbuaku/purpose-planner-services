const express = require('express');
const multer = require('multer');
const profileController = require('../controllers/profile.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || 5 * 1024 * 1024), // 5MB default
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

/**
 * @route GET /api/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/', authMiddleware.authenticate, profileController.getProfile);

/**
 * @route PUT /api/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/', authMiddleware.authenticate, profileController.updateProfile);

/**
 * @route PUT /api/profile/preferences
 * @desc Update user preferences
 * @access Private
 */
router.put('/preferences', authMiddleware.authenticate, profileController.updatePreferences);

/**
 * @route PUT /api/profile/modules
 * @desc Update module settings
 * @access Private
 */
router.put('/modules', authMiddleware.authenticate, profileController.updateModules);

/**
 * @route PUT /api/profile/spiritual-preferences
 * @desc Update spiritual preferences
 * @access Private
 */
router.put('/spiritual-preferences', authMiddleware.authenticate, profileController.updateSpiritualPreferences);

/**
 * @route PUT /api/profile/financial-preferences
 * @desc Update financial preferences
 * @access Private
 */
router.put('/financial-preferences', authMiddleware.authenticate, profileController.updateFinancialPreferences);

/**
 * @route PUT /api/profile/schedule-preferences
 * @desc Update schedule preferences
 * @access Private
 */
router.put('/schedule-preferences', authMiddleware.authenticate, profileController.updateSchedulePreferences);

/**
 * @route POST /api/profile/profile-image
 * @desc Upload profile image
 * @access Private
 */
router.post(
  '/profile-image',
  authMiddleware.authenticate,
  upload.single('image'),
  profileController.uploadProfileImage
);

/**
 * @route POST /api/profile/cover-image
 * @desc Upload cover image
 * @access Private
 */
router.post(
  '/cover-image',
  authMiddleware.authenticate,
  upload.single('image'),
  profileController.uploadCoverImage
);

/**
 * @route PUT /api/profile/onboarding
 * @desc Update onboarding status
 * @access Private
 */
router.put('/onboarding', authMiddleware.authenticate, profileController.updateOnboardingStatus);

/**
 * @route PUT /api/profile/stats-highlights
 * @desc Update stats highlights
 * @access Private
 */
router.put('/stats-highlights', authMiddleware.authenticate, profileController.updateStatsHighlights);

/**
 * @route PUT /api/profile/progress
 * @desc Update progress areas
 * @access Private
 */
router.put('/progress', authMiddleware.authenticate, profileController.updateProgressAreas);

/**
 * @route POST /api/profile/achievements
 * @desc Add a new achievement
 * @access Private
 */
router.post('/achievements', authMiddleware.authenticate, profileController.addAchievement);

module.exports = router;