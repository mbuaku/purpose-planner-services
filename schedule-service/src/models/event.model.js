const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
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
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    category: {
      type: String,
      enum: ['personal', 'work', 'spiritual', 'financial', 'health', 'other'],
      default: 'personal'
    },
    location: {
      type: String,
      trim: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecurringEvent'
    },
    reminders: [{
      time: Date,
      method: {
        type: String,
        enum: ['email', 'push', 'sms', 'in-app'],
        default: 'in-app'
      },
      isSent: {
        type: Boolean,
        default: false
      }
    }],
    attachments: [{
      name: String,
      url: String,
      type: String
    }],
    color: {
      type: String,
      default: '#4F46E5' // Default to a brand purple color
    },
    notes: {
      type: String,
      trim: true
    },
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Create compound index for userId and startTime/endTime range queries
eventSchema.index({ userId: 1, startTime: 1, endTime: 1 });

// Create compound index for userId and category
eventSchema.index({ userId: 1, category: 1 });

// Create compound index for userId and priority
eventSchema.index({ userId: 1, priority: 1 });

// Create compound index for userId and isCompleted
eventSchema.index({ userId: 1, isCompleted: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;