const mongoose = require('mongoose');

const recurringEventSchema = new mongoose.Schema(
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
    // RRule frequency
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: true
    },
    // RRule interval
    interval: {
      type: Number,
      default: 1,
      min: 1
    },
    // Days of the week when event occurs (for weekly frequency)
    byWeekday: [{
      type: String,
      enum: ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU']
    }],
    // Days of the month when event occurs (for monthly frequency)
    byMonthDay: [{
      type: Number,
      min: 1,
      max: 31
    }],
    // Month when event occurs (for yearly frequency)
    byMonth: [{
      type: Number,
      min: 1,
      max: 12
    }],
    // Position of the weekday in the month (e.g., 1st Monday, -1 for last)
    bySetPosition: [{
      type: Number,
      min: -31,
      max: 31
    }],
    // End date or count
    until: {
      type: Date
    },
    count: {
      type: Number,
      min: 1
    },
    // Store original RRule string for easy parsing
    rrule: {
      type: String
    },
    // Exceptions to the recurring rule (dates when event doesn't occur)
    exdates: [{
      type: Date
    }],
    // Modifications to specific occurrences
    modifications: [{
      originalDate: Date,
      startTime: Date,
      endTime: Date,
      title: String,
      description: String,
      location: String
    }],
    color: {
      type: String,
      default: '#4F46E5' // Default to a brand purple color
    },
    reminders: [{
      time: Date,
      method: {
        type: String,
        enum: ['email', 'push', 'sms', 'in-app'],
        default: 'in-app'
      }
    }],
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Create compound index for userId and startTime
recurringEventSchema.index({ userId: 1, startTime: 1 });

// Create compound index for userId and frequency
recurringEventSchema.index({ userId: 1, frequency: 1 });

// Create compound index for userId and category
recurringEventSchema.index({ userId: 1, category: 1 });

const RecurringEvent = mongoose.model('RecurringEvent', recurringEventSchema);

module.exports = RecurringEvent;