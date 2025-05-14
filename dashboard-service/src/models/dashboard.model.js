const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'Main Dashboard'
    },
    description: {
      type: String,
      trim: true
    },
    isDefault: {
      type: Boolean,
      default: true
    },
    layout: {
      columns: {
        type: Number,
        default: 2,
        min: 1,
        max: 4
      },
      rows: {
        type: Number,
        default: 2,
        min: 1,
        max: 4
      }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    widgets: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Widget'
    }],
    lastAccessed: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Create index on userId
dashboardSchema.index({ userId: 1 });

// Static method to get or create default dashboard
dashboardSchema.statics.getOrCreateDefault = async function(userId) {
  // Try to find default dashboard
  let dashboard = await this.findOne({ userId, isDefault: true });
  
  // If no dashboard found, create a default one
  if (!dashboard) {
    dashboard = await this.create({
      userId,
      name: 'Main Dashboard',
      isDefault: true
    });
  }
  
  return dashboard;
};

// Update last accessed timestamp
dashboardSchema.methods.updateLastAccessed = async function() {
  this.lastAccessed = new Date();
  return this.save();
};

const Dashboard = mongoose.model('Dashboard', dashboardSchema);

module.exports = Dashboard;