const mongoose = require('mongoose');

const readingPlanSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ['chronological', 'devotional', 'topical', 'cover-to-cover', 'custom'],
      default: 'custom'
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: false
    },
    readings: [
      {
        day: Number,
        book: String,
        chapter: Number,
        verses: {
          start: Number,
          end: Number
        },
        completed: {
          type: Boolean,
          default: false
        },
        completedDate: Date
      }
    ],
    progress: {
      type: Number, // percentage
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    tags: [String]
  },
  {
    timestamps: true
  }
);

// Create index for finding public reading plans
readingPlanSchema.index({ isPublic: 1, type: 1 });

const ReadingPlan = mongoose.model('ReadingPlan', readingPlanSchema);

module.exports = ReadingPlan;