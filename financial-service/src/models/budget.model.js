const mongoose = require('mongoose');

const budgetCategorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true
    },
    plannedAmount: {
      type: Number,
      required: true,
      min: 0
    },
    actualAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const budgetSchema = new mongoose.Schema(
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
    currency: {
      type: String,
      default: 'USD',
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    totalPlannedIncome: {
      type: Number,
      required: true,
      min: 0
    },
    totalActualIncome: {
      type: Number,
      default: 0,
      min: 0
    },
    totalPlannedExpenses: {
      type: Number,
      required: true,
      min: 0
    },
    totalActualExpenses: {
      type: Number,
      default: 0,
      min: 0
    },
    // Budget categories with planned and actual amounts
    categories: [budgetCategorySchema],
    // Track whether this is a regular budget (e.g., monthly) or for a specific event (e.g., vacation)
    type: {
      type: String,
      enum: ['regular', 'special'],
      default: 'regular'
    },
    // Recurrence settings for regular budgets
    recurrence: {
      isRecurring: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        enum: ['monthly', 'quarterly', 'annually', 'custom'],
        default: 'monthly'
      }
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active'
    },
    notes: {
      type: String,
      trim: true
    },
    tags: [String]
  },
  {
    timestamps: true
  }
);

// Create compound index for userId and date range
budgetSchema.index({ userId: 1, startDate: -1, endDate: -1 });

// Create compound index for active budgets
budgetSchema.index({ userId: 1, status: 1 });

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;