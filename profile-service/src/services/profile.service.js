const Profile = require('../models/profile.model');
const fs = require('fs').promises;
const path = require('path');

// In-memory store for when MongoDB is not available
let inMemoryProfiles = [];

/**
 * Check if we're using MongoDB or in-memory storage
 * @returns {boolean} - Whether in-memory storage is being used
 */
function isUsingInMemory() {
  return global.inMemoryDB !== undefined;
}

/**
 * Create or update a user profile
 * @param {Object} profileData - Profile data
 * @param {string} userId - User ID
 * @returns {Object} - Updated profile object
 */
async function createOrUpdateProfile(profileData, userId) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      let profile = inMemoryProfiles.find(p => p.userId === userId);
      
      if (profile) {
        // Update existing profile
        Object.assign(profile, {
          ...profileData,
          lastUpdated: new Date(),
        });
      } else {
        // Create new profile
        profile = {
          ...profileData,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastUpdated: new Date(),
        };
        inMemoryProfiles.push(profile);
      }
      
      return profile;
    } else {
      // Using MongoDB
      const profile = await Profile.findOneAndUpdate(
        { userId },
        { ...profileData, lastUpdated: Date.now() },
        { new: true, upsert: true, runValidators: true }
      );
      
      return profile;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get a user's profile by user ID
 * @param {string} userId - User ID
 * @returns {Object} - Profile object
 */
async function getProfileByUserId(userId) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const profile = inMemoryProfiles.find(p => p.userId === userId);
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      return profile;
    } else {
      // Using MongoDB
      const profile = await Profile.findOne({ userId });
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      return profile;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Update user preferences
 * @param {string} userId - User ID
 * @param {Object} preferences - User preferences
 * @returns {Object} - Updated profile
 */
async function updatePreferences(userId, preferences) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const profileIndex = inMemoryProfiles.findIndex(p => p.userId === userId);
      
      if (profileIndex === -1) {
        throw new Error('Profile not found');
      }
      
      // Update preferences
      inMemoryProfiles[profileIndex].preferences = {
        ...inMemoryProfiles[profileIndex].preferences,
        ...preferences,
      };
      
      inMemoryProfiles[profileIndex].lastUpdated = new Date();
      inMemoryProfiles[profileIndex].updatedAt = new Date();
      
      return inMemoryProfiles[profileIndex];
    } else {
      // Using MongoDB
      const profile = await Profile.findOneAndUpdate(
        { userId },
        { 
          'preferences': preferences,
          'lastUpdated': Date.now()
        },
        { new: true, runValidators: true }
      );
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      return profile;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Update module settings
 * @param {string} userId - User ID
 * @param {Object} modules - Module settings
 * @returns {Object} - Updated profile
 */
async function updateModules(userId, modules) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const profileIndex = inMemoryProfiles.findIndex(p => p.userId === userId);
      
      if (profileIndex === -1) {
        throw new Error('Profile not found');
      }
      
      // Update modules
      inMemoryProfiles[profileIndex].modules = {
        ...inMemoryProfiles[profileIndex].modules,
        ...modules,
      };
      
      inMemoryProfiles[profileIndex].lastUpdated = new Date();
      inMemoryProfiles[profileIndex].updatedAt = new Date();
      
      return inMemoryProfiles[profileIndex];
    } else {
      // Using MongoDB
      const profile = await Profile.findOneAndUpdate(
        { userId },
        { 
          'modules': modules,
          'lastUpdated': Date.now()
        },
        { new: true, runValidators: true }
      );
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      return profile;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Update spiritual preferences
 * @param {string} userId - User ID
 * @param {Object} spiritualPrefs - Spiritual preferences
 * @returns {Object} - Updated profile
 */
async function updateSpiritualPreferences(userId, spiritualPrefs) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const profileIndex = inMemoryProfiles.findIndex(p => p.userId === userId);
      
      if (profileIndex === -1) {
        throw new Error('Profile not found');
      }
      
      // Update spiritual preferences
      inMemoryProfiles[profileIndex].spiritualPreferences = {
        ...inMemoryProfiles[profileIndex].spiritualPreferences,
        ...spiritualPrefs,
      };
      
      inMemoryProfiles[profileIndex].lastUpdated = new Date();
      inMemoryProfiles[profileIndex].updatedAt = new Date();
      
      return inMemoryProfiles[profileIndex];
    } else {
      // Using MongoDB
      const profile = await Profile.findOneAndUpdate(
        { userId },
        { 
          'spiritualPreferences': spiritualPrefs,
          'lastUpdated': Date.now()
        },
        { new: true, runValidators: true }
      );
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      return profile;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Update financial preferences
 * @param {string} userId - User ID
 * @param {Object} financialPrefs - Financial preferences
 * @returns {Object} - Updated profile
 */
async function updateFinancialPreferences(userId, financialPrefs) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const profileIndex = inMemoryProfiles.findIndex(p => p.userId === userId);
      
      if (profileIndex === -1) {
        throw new Error('Profile not found');
      }
      
      // Update financial preferences
      inMemoryProfiles[profileIndex].financialPreferences = {
        ...inMemoryProfiles[profileIndex].financialPreferences,
        ...financialPrefs,
      };
      
      inMemoryProfiles[profileIndex].lastUpdated = new Date();
      inMemoryProfiles[profileIndex].updatedAt = new Date();
      
      return inMemoryProfiles[profileIndex];
    } else {
      // Using MongoDB
      const profile = await Profile.findOneAndUpdate(
        { userId },
        { 
          'financialPreferences': financialPrefs,
          'lastUpdated': Date.now()
        },
        { new: true, runValidators: true }
      );
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      return profile;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Update schedule preferences
 * @param {string} userId - User ID
 * @param {Object} schedulePrefs - Schedule preferences
 * @returns {Object} - Updated profile
 */
async function updateSchedulePreferences(userId, schedulePrefs) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const profileIndex = inMemoryProfiles.findIndex(p => p.userId === userId);
      
      if (profileIndex === -1) {
        throw new Error('Profile not found');
      }
      
      // Update schedule preferences
      inMemoryProfiles[profileIndex].schedulePreferences = {
        ...inMemoryProfiles[profileIndex].schedulePreferences,
        ...schedulePrefs,
      };
      
      inMemoryProfiles[profileIndex].lastUpdated = new Date();
      inMemoryProfiles[profileIndex].updatedAt = new Date();
      
      return inMemoryProfiles[profileIndex];
    } else {
      // Using MongoDB
      const profile = await Profile.findOneAndUpdate(
        { userId },
        { 
          'schedulePreferences': schedulePrefs,
          'lastUpdated': Date.now()
        },
        { new: true, runValidators: true }
      );
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      return profile;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Update onboarding status
 * @param {string} userId - User ID
 * @param {Object} onboardingData - Onboarding data
 * @returns {Object} - Updated profile
 */
async function updateOnboardingStatus(userId, onboardingData) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const profileIndex = inMemoryProfiles.findIndex(p => p.userId === userId);
      
      if (profileIndex === -1) {
        throw new Error('Profile not found');
      }
      
      // Update onboarding status
      inMemoryProfiles[profileIndex].onboardingStep = onboardingData.step || inMemoryProfiles[profileIndex].onboardingStep;
      inMemoryProfiles[profileIndex].onboardingCompleted = onboardingData.completed || inMemoryProfiles[profileIndex].onboardingCompleted;
      
      inMemoryProfiles[profileIndex].lastUpdated = new Date();
      inMemoryProfiles[profileIndex].updatedAt = new Date();
      
      return inMemoryProfiles[profileIndex];
    } else {
      // Using MongoDB
      const updateData = {};
      
      if (onboardingData.step !== undefined) {
        updateData.onboardingStep = onboardingData.step;
      }
      
      if (onboardingData.completed !== undefined) {
        updateData.onboardingCompleted = onboardingData.completed;
      }
      
      updateData.lastUpdated = Date.now();
      
      const profile = await Profile.findOneAndUpdate(
        { userId },
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      return profile;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Upload profile image
 * @param {string} userId - User ID
 * @param {Object} file - Uploaded file
 * @returns {Object} - Updated profile
 */
async function uploadProfileImage(userId, file) {
  try {
    // Define the target directory for uploads
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const userUploadsDir = path.join(uploadDir, userId);
    
    // Ensure the upload directory exists
    await fs.mkdir(userUploadsDir, { recursive: true });
    
    // Generate a unique filename
    const filename = `profile_${Date.now()}${path.extname(file.originalname)}`;
    const filePath = path.join(userUploadsDir, filename);
    
    // Write the file
    await fs.writeFile(filePath, file.buffer);
    
    // Generate the URL for the file
    const baseUrl = process.env.BASE_URL || 'http://localhost:3004';
    const fileUrl = `${baseUrl}/uploads/${userId}/${filename}`;
    
    // Update the profile with the new image URL
    if (isUsingInMemory()) {
      // Using in-memory database
      const profileIndex = inMemoryProfiles.findIndex(p => p.userId === userId);
      
      if (profileIndex === -1) {
        throw new Error('Profile not found');
      }
      
      // Update profile image
      inMemoryProfiles[profileIndex].profileImage = fileUrl;
      
      inMemoryProfiles[profileIndex].lastUpdated = new Date();
      inMemoryProfiles[profileIndex].updatedAt = new Date();
      
      return inMemoryProfiles[profileIndex];
    } else {
      // Using MongoDB
      const profile = await Profile.findOneAndUpdate(
        { userId },
        { 
          profileImage: fileUrl,
          lastUpdated: Date.now()
        },
        { new: true, runValidators: true }
      );
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      return profile;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Upload cover image
 * @param {string} userId - User ID
 * @param {Object} file - Uploaded file
 * @returns {Object} - Updated profile
 */
async function uploadCoverImage(userId, file) {
  try {
    // Define the target directory for uploads
    const uploadDir = process.env.UPLOAD_DIR || 'uploads';
    const userUploadsDir = path.join(uploadDir, userId);
    
    // Ensure the upload directory exists
    await fs.mkdir(userUploadsDir, { recursive: true });
    
    // Generate a unique filename
    const filename = `cover_${Date.now()}${path.extname(file.originalname)}`;
    const filePath = path.join(userUploadsDir, filename);
    
    // Write the file
    await fs.writeFile(filePath, file.buffer);
    
    // Generate the URL for the file
    const baseUrl = process.env.BASE_URL || 'http://localhost:3004';
    const fileUrl = `${baseUrl}/uploads/${userId}/${filename}`;
    
    // Update the profile with the new image URL
    if (isUsingInMemory()) {
      // Using in-memory database
      const profileIndex = inMemoryProfiles.findIndex(p => p.userId === userId);
      
      if (profileIndex === -1) {
        throw new Error('Profile not found');
      }
      
      // Update cover image
      inMemoryProfiles[profileIndex].coverImage = fileUrl;
      
      inMemoryProfiles[profileIndex].lastUpdated = new Date();
      inMemoryProfiles[profileIndex].updatedAt = new Date();
      
      return inMemoryProfiles[profileIndex];
    } else {
      // Using MongoDB
      const profile = await Profile.findOneAndUpdate(
        { userId },
        { 
          coverImage: fileUrl,
          lastUpdated: Date.now()
        },
        { new: true, runValidators: true }
      );
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      return profile;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Update stats highlights
 * @param {string} userId - User ID
 * @param {Array} highlights - Stats highlights
 * @returns {Object} - Updated profile
 */
async function updateStatsHighlights(userId, highlights) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const profileIndex = inMemoryProfiles.findIndex(p => p.userId === userId);
      
      if (profileIndex === -1) {
        throw new Error('Profile not found');
      }
      
      // Update stats highlights
      inMemoryProfiles[profileIndex].statsHighlights = highlights;
      
      inMemoryProfiles[profileIndex].lastUpdated = new Date();
      inMemoryProfiles[profileIndex].updatedAt = new Date();
      
      return inMemoryProfiles[profileIndex];
    } else {
      // Using MongoDB
      const profile = await Profile.findOneAndUpdate(
        { userId },
        { 
          statsHighlights: highlights,
          lastUpdated: Date.now()
        },
        { new: true, runValidators: true }
      );
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      return profile;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Update progress areas
 * @param {string} userId - User ID
 * @param {Object} progressData - Progress data
 * @returns {Object} - Updated profile
 */
async function updateProgressAreas(userId, progressData) {
  try {
    if (isUsingInMemory()) {
      // Using in-memory database
      const profileIndex = inMemoryProfiles.findIndex(p => p.userId === userId);
      
      if (profileIndex === -1) {
        throw new Error('Profile not found');
      }
      
      // Update progress areas
      inMemoryProfiles[profileIndex].progressAreas = {
        ...inMemoryProfiles[profileIndex].progressAreas,
        ...progressData,
      };
      
      inMemoryProfiles[profileIndex].lastUpdated = new Date();
      inMemoryProfiles[profileIndex].updatedAt = new Date();
      
      return inMemoryProfiles[profileIndex];
    } else {
      // Using MongoDB
      const profile = await Profile.findOneAndUpdate(
        { userId },
        { 
          'progressAreas': progressData,
          'lastUpdated': Date.now()
        },
        { new: true, runValidators: true }
      );
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      return profile;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Add an achievement
 * @param {string} userId - User ID
 * @param {Object} achievement - Achievement data
 * @returns {Object} - Updated profile
 */
async function addAchievement(userId, achievement) {
  try {
    // Add unlocked timestamp if not provided
    const achievementToAdd = {
      ...achievement,
      unlockedAt: achievement.unlockedAt || new Date(),
    };
    
    if (isUsingInMemory()) {
      // Using in-memory database
      const profileIndex = inMemoryProfiles.findIndex(p => p.userId === userId);
      
      if (profileIndex === -1) {
        throw new Error('Profile not found');
      }
      
      // Initialize achievements array if it doesn't exist
      if (!inMemoryProfiles[profileIndex].achievements) {
        inMemoryProfiles[profileIndex].achievements = [];
      }
      
      // Add achievement
      inMemoryProfiles[profileIndex].achievements.push(achievementToAdd);
      
      inMemoryProfiles[profileIndex].lastUpdated = new Date();
      inMemoryProfiles[profileIndex].updatedAt = new Date();
      
      return inMemoryProfiles[profileIndex];
    } else {
      // Using MongoDB
      const profile = await Profile.findOneAndUpdate(
        { userId },
        { 
          $push: { achievements: achievementToAdd },
          lastUpdated: Date.now()
        },
        { new: true, runValidators: true }
      );
      
      if (!profile) {
        throw new Error('Profile not found');
      }
      
      return profile;
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createOrUpdateProfile,
  getProfileByUserId,
  updatePreferences,
  updateModules,
  updateSpiritualPreferences,
  updateFinancialPreferences,
  updateSchedulePreferences,
  updateOnboardingStatus,
  uploadProfileImage,
  uploadCoverImage,
  updateStatsHighlights,
  updateProgressAreas,
  addAchievement,
};