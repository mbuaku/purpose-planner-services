const mongoose = require('mongoose');

const bibleReadingSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    book: {
      type: String,
      required: true,
      trim: true
    },
    chapter: {
      type: Number,
      required: true
    },
    verses: {
      start: {
        type: Number,
        required: false
      },
      end: {
        type: Number,
        required: false
      }
    },
    completed: {
      type: Boolean,
      default: true
    },
    notes: {
      type: String,
      trim: true
    },
    favorite: {
      type: Boolean,
      default: false
    },
    readingPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReadingPlan',
      required: false
    },
    duration: {
      type: Number, // in minutes
      required: false
    }
  },
  {
    timestamps: true
  }
);

// Create compound index for userId and date for efficient queries
bibleReadingSchema.index({ userId: 1, date: -1 });

// Create compound index for userId and book for efficient queries
bibleReadingSchema.index({ userId: 1, book: 1 });

const BibleReading = mongoose.model('BibleReading', bibleReadingSchema);

module.exports = BibleReading;