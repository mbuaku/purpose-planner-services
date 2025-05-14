const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      trim: true
    }
  },
  { _id: true, timestamps: true }
);

const withdrawalSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    reason: {
      type: String,
      trim: true
    }
  },
  { _id: true, timestamps: true }
);

const savingsGoalSchema = new mongoose.Schema(
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
    targetAmount: {
      type: Number,
      required: true,
      min: 0
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    targetDate: {
      type: Date,
      required: false
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: {
      type: Date
    },
    category: {
      type: String,
      enum: [
        'emergency_fund', 'retirement', 'education', 'home', 'car', 
        'vacation', 'wedding', 'technology', 'healthcare', 'other'
      ],
      default: 'other'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    visibility: {
      type: String,
      enum: ['private', 'public'],
      default: 'private'
    },
    plannedContributions: {
      frequency: {
        type: String,
        enum: ['one-time', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'annually'],
        default: 'monthly'
      },
      amount: {
        type: Number,
        min: 0
      }
    },
    contributions: [contributionSchema],
    withdrawals: [withdrawalSchema],
    // Optional image/icon for the goal
    image: {
      type: String,
      trim: true
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

// Create compound index for userId and category
savingsGoalSchema.index({ userId: 1, category: 1 });

// Create compound index for userId and completion status
savingsGoalSchema.index({ userId: 1, completed: 1 });

// Create compound index for userId and priority
savingsGoalSchema.index({ userId: 1, priority: 1 });

const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);

module.exports = SavingsGoal;