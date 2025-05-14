const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['devotional', 'reflection', 'prayer', 'sermon_notes', 'testimony', 'gratitude', 'other'],
      default: 'devotional'
    },
    scripture: {
      book: String,
      chapter: Number,
      verses: {
        start: Number,
        end: Number
      },
      text: String
    },
    emotions: [String],
    isFavorite: {
      type: Boolean,
      default: false
    },
    isPrivate: {
      type: Boolean,
      default: true
    },
    attachments: [{
      name: String,
      type: String,
      url: String
    }],
    tags: [String]
  },
  {
    timestamps: true
  }
);

// Create compound index for userId and date
journalEntrySchema.index({ userId: 1, createdAt: -1 });

// Create compound index for userId and category
journalEntrySchema.index({ userId: 1, category: 1 });

// Create compound index for userId and isFavorite
journalEntrySchema.index({ userId: 1, isFavorite: 1 });

// Create text index for full-text search
journalEntrySchema.index({ title: 'text', content: 'text' });

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);

module.exports = JournalEntry;