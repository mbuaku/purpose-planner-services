const mongoose = require('mongoose');

const widgetSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: [
        'spiritual-summary',
        'prayer-list',
        'journal-entries',
        'upcoming-events',
        'habits-tracker',
        'budget-overview',
        'savings-goals',
        'recent-expenses',
        'custom'
      ]
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    source: {
      type: String,
      required: true,
      enum: [
        'spiritual-service',
        'financial-service',
        'schedule-service',
        'profile-service',
        'custom'
      ]
    },
    icon: {
      type: String,
      default: 'box'
    },
    position: {
      type: String,
      enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'custom'],
      default: 'top-left'
    },
    size: {
      width: {
        type: Number,
        min: 1,
        max: 4,
        default: 1
      },
      height: {
        type: Number,
        min: 1,
        max: 4,
        default: 1
      }
    },
    order: {
      type: Number,
      default: 0
    },
    refreshInterval: {
      type: Number,
      default: 15, // Minutes
      min: 5
    },
    lastRefreshed: {
      type: Date,
      default: Date.now
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    chartType: {
      type: String,
      enum: ['bar', 'line', 'pie', 'doughnut', 'area', 'none'],
      default: 'none'
    },
    isVisible: {
      type: Boolean,
      default: true
    },
    cachedData: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Create index on userId and type
widgetSchema.index({ userId: 1, type: 1 });

// Method to update cached data
widgetSchema.methods.updateCache = async function(data) {
  this.cachedData = data;
  this.lastRefreshed = new Date();
  return this.save();
};

// Method to check if cache is stale
widgetSchema.methods.isCacheStale = function() {
  const now = new Date();
  const lastRefreshed = this.lastRefreshed || new Date(0);
  const staleDuration = this.refreshInterval * 60 * 1000; // Convert minutes to milliseconds
  
  return (now - lastRefreshed) > staleDuration;
};

// Static method to create default widgets for a user
widgetSchema.statics.createDefaultWidgets = async function(userId) {
  const defaultWidgets = [
    {
      userId,
      type: 'spiritual-summary',
      title: 'Spiritual Summary',
      source: 'spiritual-service',
      icon: 'pray',
      position: 'top-left',
      order: 0
    },
    {
      userId,
      type: 'upcoming-events',
      title: 'Upcoming Events',
      source: 'schedule-service',
      icon: 'calendar',
      position: 'top-right',
      order: 1
    },
    {
      userId,
      type: 'budget-overview',
      title: 'Budget Overview',
      source: 'financial-service',
      icon: 'dollar-sign',
      position: 'bottom-left',
      order: 2,
      chartType: 'pie'
    },
    {
      userId,
      type: 'prayer-list',
      title: 'Prayer Requests',
      source: 'spiritual-service',
      icon: 'list',
      position: 'bottom-right',
      order: 3
    }
  ];
  
  return this.insertMany(defaultWidgets);
};

const Widget = mongoose.model('Widget', widgetSchema);

module.exports = Widget;