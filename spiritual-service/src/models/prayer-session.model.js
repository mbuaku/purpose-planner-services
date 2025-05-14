const mongoose = require('mongoose');

const prayerSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    duration: {
      type: Number, // in minutes
      default: 0
    },
    location: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    prayersIncluded: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prayer'
    }],
    mood: {
      type: String,
      enum: ['peaceful', 'joyful', 'distracted', 'troubled', 'thankful', 'other'],
      default: 'other'
    },
    focusRating: {
      type: Number,
      min: 1,
      max: 10
    },
    tags: [String]
  },
  {
    timestamps: true
  }
);

// Create compound index for userId and date
prayerSessionSchema.index({ userId: 1, startTime: -1 });

const PrayerSession = mongoose.model('PrayerSession', prayerSessionSchema);

module.exports = PrayerSession;