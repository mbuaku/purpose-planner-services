const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    profileImage: {
      type: String,
      default: null,
    },
    coverImage: {
      type: String,
      default: null,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
      website: String,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        browser: {
          type: Boolean,
          default: true,
        },
        emailFrequency: {
          type: String,
          enum: ['daily', 'weekly', 'never'],
          default: 'daily',
        },
      },
      privacy: {
        showProfile: {
          type: Boolean,
          default: true,
        },
        showActivity: {
          type: Boolean,
          default: true,
        },
        showSocialLinks: {
          type: Boolean,
          default: true,
        },
      },
    },
    modules: {
      spiritual: {
        type: Boolean,
        default: true,
      },
      financial: {
        type: Boolean,
        default: true,
      },
      schedule: {
        type: Boolean,
        default: true,
      },
      goals: {
        type: Boolean,
        default: true,
      },
    },
    spiritualPreferences: {
      bibleVersion: {
        type: String,
        default: 'NIV',
      },
      prayerReminderTime: String,
      devotionalSeries: String,
      churchName: String,
      denomination: String,
      ministryAreas: [String],
      bibleReadingPlan: String,
    },
    financialPreferences: {
      currency: {
        type: String,
        default: 'USD',
      },
      incomeStreams: [{
        name: String,
        category: String,
        isActive: Boolean,
      }],
      expenseCategories: [{
        name: String,
        color: String,
        isDefault: Boolean,
      }],
      savingsGoalCategories: [{
        name: String,
        color: String,
        isDefault: Boolean,
      }],
    },
    schedulePreferences: {
      defaultView: {
        type: String,
        enum: ['day', 'week', 'month'],
        default: 'week',
      },
      startTime: {
        type: String,
        default: '08:00',
      },
      endTime: {
        type: String,
        default: '18:00',
      },
      defaultCalendars: [String],
      defaultTimeBlockDuration: {
        type: Number,
        default: 60, // minutes
      },
    },
    achievements: [{
      name: String,
      description: String,
      icon: String,
      unlockedAt: Date,
      category: String,
    }],
    statsHighlights: [{
      label: String,
      value: String,
      category: String,
    }],
    progressAreas: {
      spiritual: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      financial: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      schedule: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      goals: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    onboardingStep: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Update lastUpdated timestamp before saving
profileSchema.pre('save', function (next) {
  this.lastUpdated = Date.now();
  next();
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;