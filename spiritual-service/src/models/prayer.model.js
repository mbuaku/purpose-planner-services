const mongoose = require('mongoose');

const prayerSchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: ['praise', 'confession', 'thanksgiving', 'supplication', 'intercession', 'other'],
      default: 'other'
    },
    people: [{
      type: String,
      trim: true
    }],
    isAnswered: {
      type: Boolean,
      default: false
    },
    answeredDate: {
      type: Date
    },
    answerNotes: {
      type: String,
      trim: true
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    reminderFrequency: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none'
    },
    reminderTime: {
      type: Date
    },
    tags: [String],
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Create compound index for userId and category
prayerSchema.index({ userId: 1, category: 1 });

// Create compound index for userId and isAnswered
prayerSchema.index({ userId: 1, isAnswered: 1 });

// Create compound index for userId and isFavorite
prayerSchema.index({ userId: 1, isFavorite: 1 });

const Prayer = mongoose.model('Prayer', prayerSchema);

module.exports = Prayer;