const profileService = require('../services/profile.service');

/**
 * Get the user's profile
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    
    try {
      const profile = await profileService.getProfileByUserId(userId);
      
      return res.status(200).json({
        success: true,
        data: { profile },
      });
    } catch (error) {
      // If profile doesn't exist yet, create a default one
      if (error.message === 'Profile not found') {
        // Create default profile based on user info
        const defaultProfile = {
          userId,
          firstName: req.user.firstName || '',
          lastName: req.user.lastName || '',
          email: req.user.email,
          profileImage: req.user.profileImage || null,
          modules: {
            spiritual: true,
            financial: true,
            schedule: true,
            goals: true,
          },
          preferences: {
            theme: 'system',
            notifications: {
              email: true,
              browser: true,
              emailFrequency: 'daily',
            },
            privacy: {
              showProfile: true,
              showActivity: true,
              showSocialLinks: true,
            },
          },
          progressAreas: {
            spiritual: 0,
            financial: 0,
            schedule: 0,
            goals: 0,
          },
          onboardingCompleted: false,
          onboardingStep: 1,
        };
        
        const newProfile = await profileService.createOrUpdateProfile(defaultProfile, userId);
        
        return res.status(200).json({
          success: true,
          data: { profile: newProfile },
          message: 'Default profile created',
        });
      }
      
      throw error;
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: error.message,
    });
  }
}

/**
 * Update the user's profile
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const profileData = req.body;
    
    // Remove any sensitive or non-updatable fields
    delete profileData.userId;
    delete profileData._id;
    delete profileData.id;
    delete profileData.createdAt;
    delete profileData.updatedAt;
    
    const updatedProfile = await profileService.createOrUpdateProfile(profileData, userId);
    
    return res.status(200).json({
      success: true,
      data: { profile: updatedProfile },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
}

/**
 * Update user preferences
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function updatePreferences(req, res) {
  try {
    const userId = req.user.id;
    const preferences = req.body;
    
    const updatedProfile = await profileService.updatePreferences(userId, preferences);
    
    return res.status(200).json({
      success: true,
      data: { profile: updatedProfile },
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message,
    });
  }
}

/**
 * Update module preferences
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function updateModules(req, res) {
  try {
    const userId = req.user.id;
    const modules = req.body;
    
    const updatedProfile = await profileService.updateModules(userId, modules);
    
    return res.status(200).json({
      success: true,
      data: { profile: updatedProfile },
      message: 'Module preferences updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update module preferences',
      error: error.message,
    });
  }
}

/**
 * Update spiritual preferences
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function updateSpiritualPreferences(req, res) {
  try {
    const userId = req.user.id;
    const spiritualPrefs = req.body;
    
    const updatedProfile = await profileService.updateSpiritualPreferences(userId, spiritualPrefs);
    
    return res.status(200).json({
      success: true,
      data: { profile: updatedProfile },
      message: 'Spiritual preferences updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update spiritual preferences',
      error: error.message,
    });
  }
}

/**
 * Update financial preferences
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function updateFinancialPreferences(req, res) {
  try {
    const userId = req.user.id;
    const financialPrefs = req.body;
    
    const updatedProfile = await profileService.updateFinancialPreferences(userId, financialPrefs);
    
    return res.status(200).json({
      success: true,
      data: { profile: updatedProfile },
      message: 'Financial preferences updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update financial preferences',
      error: error.message,
    });
  }
}

/**
 * Update schedule preferences
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function updateSchedulePreferences(req, res) {
  try {
    const userId = req.user.id;
    const schedulePrefs = req.body;
    
    const updatedProfile = await profileService.updateSchedulePreferences(userId, schedulePrefs);
    
    return res.status(200).json({
      success: true,
      data: { profile: updatedProfile },
      message: 'Schedule preferences updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update schedule preferences',
      error: error.message,
    });
  }
}

/**
 * Upload profile image
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function uploadProfileImage(req, res) {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }
    
    const updatedProfile = await profileService.uploadProfileImage(userId, req.file);
    
    return res.status(200).json({
      success: true,
      data: { profile: updatedProfile },
      message: 'Profile image uploaded successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to upload profile image',
      error: error.message,
    });
  }
}

/**
 * Upload cover image
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function uploadCoverImage(req, res) {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }
    
    const updatedProfile = await profileService.uploadCoverImage(userId, req.file);
    
    return res.status(200).json({
      success: true,
      data: { profile: updatedProfile },
      message: 'Cover image uploaded successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to upload cover image',
      error: error.message,
    });
  }
}

/**
 * Update onboarding status
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function updateOnboardingStatus(req, res) {
  try {
    const userId = req.user.id;
    const { step, completed } = req.body;
    
    const updatedProfile = await profileService.updateOnboardingStatus(userId, {
      step,
      completed,
    });
    
    return res.status(200).json({
      success: true,
      data: { profile: updatedProfile },
      message: 'Onboarding status updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update onboarding status',
      error: error.message,
    });
  }
}

/**
 * Update stats highlights
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function updateStatsHighlights(req, res) {
  try {
    const userId = req.user.id;
    const highlights = req.body;
    
    if (!Array.isArray(highlights)) {
      return res.status(400).json({
        success: false,
        message: 'Stats highlights must be an array',
      });
    }
    
    const updatedProfile = await profileService.updateStatsHighlights(userId, highlights);
    
    return res.status(200).json({
      success: true,
      data: { profile: updatedProfile },
      message: 'Stats highlights updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update stats highlights',
      error: error.message,
    });
  }
}

/**
 * Update progress areas
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function updateProgressAreas(req, res) {
  try {
    const userId = req.user.id;
    const progressData = req.body;
    
    const updatedProfile = await profileService.updateProgressAreas(userId, progressData);
    
    return res.status(200).json({
      success: true,
      data: { profile: updatedProfile },
      message: 'Progress areas updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update progress areas',
      error: error.message,
    });
  }
}

/**
 * Add achievement
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
async function addAchievement(req, res) {
  try {
    const userId = req.user.id;
    const achievement = req.body;
    
    if (!achievement.name || !achievement.description) {
      return res.status(400).json({
        success: false,
        message: 'Achievement name and description are required',
      });
    }
    
    const updatedProfile = await profileService.addAchievement(userId, achievement);
    
    return res.status(200).json({
      success: true,
      data: { profile: updatedProfile },
      message: 'Achievement added successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to add achievement',
      error: error.message,
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  updatePreferences,
  updateModules,
  updateSpiritualPreferences,
  updateFinancialPreferences,
  updateSchedulePreferences,
  uploadProfileImage,
  uploadCoverImage,
  updateOnboardingStatus,
  updateStatsHighlights,
  updateProgressAreas,
  addAchievement,
};