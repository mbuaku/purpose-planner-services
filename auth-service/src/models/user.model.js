const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    // Password removed - Google OAuth only
    profileImage: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    // Email verification not needed with Google OAuth
    joinDate: {
      type: Date,
      default: Date.now,
    },
    lastLogin: Date,
    // Social login fields
    googleId: {
      type: String,
      required: [true, 'Google ID is required'],
      unique: true,
    },
    socialProfile: {
      provider: String,
      id: String,
      displayName: String,
      name: {
        familyName: String,
        givenName: String,
      },
      emails: [{
        value: String,
        verified: Boolean
      }],
      photos: [{
        value: String
      }],
      _json: mongoose.Schema.Types.Mixed
    }
  },
  { timestamps: true }
);

// Password methods removed - Google OAuth only

// Method to generate a formatted full name
userSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

// Create a virtual for the user's ID to ensure consistency
userSchema.virtual('userId').get(function () {
  return this._id.toString();
});

const User = mongoose.model('User', userSchema);

module.exports = User;