const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');

// Use the User model if available
let User;
try {
  User = require('../models/user.model');
} catch (error) {
  console.log('Using in-memory database in passport config');
}

module.exports = function (app) {
  // Initialize Passport
  app.use(passport.initialize());

  // Log Google OAuth configuration status
  console.log('Google OAuth Configuration:');
  console.log('- GOOGLE_CLIENT_ID present:', Boolean(process.env.GOOGLE_CLIENT_ID));
  console.log('- GOOGLE_CLIENT_SECRET present:', Boolean(process.env.GOOGLE_CLIENT_SECRET));
  console.log('- GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL || 'not set');
  
  // Configure Google Strategy if credentials are available
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('Configuring Google OAuth strategy with the following parameters:');
    console.log('- clientID:', process.env.GOOGLE_CLIENT_ID.substring(0, 8) + '...');
    console.log('- callbackURL:', process.env.GOOGLE_CALLBACK_URL);
    
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL,
          passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            if (global.inMemoryDB) {
              // Using in-memory database
              // Check if user exists
              let user = global.inMemoryDB.users.find(u => u.googleId === profile.id);
              
              if (!user) {
                // Check if user exists with the same email
                const emails = profile.emails || [];
                const primaryEmail = emails.length > 0 ? emails[0].value : null;
                
                if (primaryEmail) {
                  user = global.inMemoryDB.users.find(u => u.email === primaryEmail);
                }
                
                if (user) {
                  // Link Google account to existing user
                  user.googleId = profile.id;
                  user.emailVerified = true;
                  user.socialProfile = profile;
                  
                  // Update profile image if not already set
                  if (!user.profileImage && profile.photos && profile.photos.length > 0) {
                    user.profileImage = profile.photos[0].value;
                  }
                } else {
                  // Create new user
                  const firstName = profile.name?.givenName || profile.displayName.split(' ')[0];
                  const lastName = profile.name?.familyName || profile.displayName.split(' ').slice(1).join(' ');
                  const email = primaryEmail || `${profile.id}@socialuser.com`;
                  const profileImageUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
                  
                  user = {
                    _id: Date.now().toString(),
                    googleId: profile.id,
                    firstName,
                    lastName,
                    email,
                    emailVerified: true,
                    profileImage: profileImageUrl,
                    role: 'user',
                    socialProfile: profile,
                    joinDate: new Date(),
                    lastLogin: new Date()
                  };
                  
                  global.inMemoryDB.users.push(user);
                }
              } else {
                // User exists, update login time
                user.lastLogin = new Date();
              }
              
              return done(null, user);
            } else {
              // Using MongoDB
              // Check if user already exists with Google ID
              let user = await User.findOne({ googleId: profile.id });
              
              if (!user) {
                // Check if user exists with the same email
                const emails = profile.emails || [];
                const primaryEmail = emails.length > 0 ? emails[0].value : null;
                
                if (primaryEmail) {
                  user = await User.findOne({ email: primaryEmail });
                }
                
                if (user) {
                  // Link Google account to existing user
                  user.googleId = profile.id;
                  user.emailVerified = true;
                  user.socialProfile = profile;
                  
                  // Update profile image if not already set
                  if (!user.profileImage && profile.photos && profile.photos.length > 0) {
                    user.profileImage = profile.photos[0].value;
                  }
                  
                  await user.save();
                } else {
                  // Create new user
                  const firstName = profile.name?.givenName || profile.displayName.split(' ')[0];
                  const lastName = profile.name?.familyName || profile.displayName.split(' ').slice(1).join(' ');
                  const email = primaryEmail || `${profile.id}@socialuser.com`;
                  const profileImageUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
                  
                  user = new User({
                    googleId: profile.id,
                    firstName,
                    lastName,
                    email,
                    emailVerified: true,
                    profileImage: profileImageUrl,
                    socialProfile: profile
                  });
                  
                  await user.save();
                }
              } else {
                // User exists, update login time
                user.lastLogin = Date.now();
                await user.save();
              }
              
              return done(null, user);
            }
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  } else {
    console.log('Google OAuth strategy not configured due to missing credentials');
  }

  // Generate JWT token for authenticated user
  const generateToken = (user) => {
    const payload = {
      id: user._id || user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'purpose_planner_secret_key_development_only', {
      expiresIn: process.env.JWT_EXPIRATION || '1d',
    });
  };

  return {
    passport,
    generateToken,
  };
};