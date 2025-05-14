const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['salary', 'freelance', 'business', 'investment', 'gift', 'refund', 'other'],
      default: 'other'
    },
    description: {
      type: String,
      trim: true
    },
    frequency: {
      type: String,
      enum: ['one-time', 'daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'annually'],
      default: 'one-time'
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    source: {
      type: String,
      trim: true
    },
    attachments: [{
      name: String,
      type: String,
      url: String
    }],
    isTaxable: {
      type: Boolean,
      default: true
    },
    tags: [String]
  },
  {
    timestamps: true
  }
);

// Create compound index for userId and date for efficient queries
incomeSchema.index({ userId: 1, date: -1 });

// Create compound index for userId and category for efficient queries
incomeSchema.index({ userId: 1, category: 1 });

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;