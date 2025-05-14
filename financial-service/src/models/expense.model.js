const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
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
      enum: [
        'housing', 'utilities', 'groceries', 'transportation', 
        'health', 'insurance', 'personal', 'entertainment', 
        'dining', 'education', 'debt', 'subscriptions', 
        'charitable', 'gifts', 'business', 'taxes', 'other'
      ],
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
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'check', 'mobile_payment', 'other'],
      default: 'other'
    },
    vendor: {
      type: String,
      trim: true
    },
    attachments: [{
      name: String,
      type: String,
      url: String
    }],
    isTaxDeductible: {
      type: Boolean,
      default: false
    },
    // For budgeting purposes
    isPlanned: {
      type: Boolean,
      default: false
    },
    budgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Budget'
    },
    tags: [String]
  },
  {
    timestamps: true
  }
);

// Create compound index for userId and date for efficient queries
expenseSchema.index({ userId: 1, date: -1 });

// Create compound index for userId and category for efficient queries
expenseSchema.index({ userId: 1, category: 1 });

// Create compound index for budgeting
expenseSchema.index({ userId: 1, budgetId: 1 });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;