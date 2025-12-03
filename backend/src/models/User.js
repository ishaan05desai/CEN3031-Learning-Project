/**
 * User Model
 * 
 * Defines the schema and methods for user accounts in the FlashLearn application.
 * Handles user authentication, email verification, password management, and profile data.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// User schema definition with validation rules
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    validate: {
      validator: function(password) {
        // Password validation: must contain uppercase, lowercase, number, and special character
        // This regex ensures strong password requirements for security
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/.test(password);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    avatar: {
      type: String,
      default: null
    }
  },
  studyStreak: {
    type: Number,
    default: 0
  },
  lastStudyDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save Middleware: Hash Password
// Automatically hashes the password before saving to the database
// Only hashes if the password field has been modified (not on every save)
// Uses bcrypt with salt rounds of 12 for strong security
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save Middleware: Update Timestamp
// Automatically updates the updatedAt field whenever the document is saved
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Generate Email Verification Token
 * Creates a cryptographically secure random token for email verification
 * Token expires after 24 hours
 * @returns {string} The generated verification token
 */
userSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = token;
  // Set expiration to 24 hours from now
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
  return token;
};

/**
 * Generate Password Reset Token
 * Creates a cryptographically secure random token for password reset
 * Token expires after 1 hour for security
 * @returns {string} The generated reset token
 */
userSchema.methods.generatePasswordResetToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = token;
  // Set expiration to 1 hour from now
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000;
  return token;
};

/**
 * Compare Password
 * Verifies a candidate password against the stored hashed password
 * @param {string} candidatePassword - The password to verify
 * @returns {Promise<boolean>} True if password matches, false otherwise
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Remove Sensitive Data from JSON Output
 * Overrides the default toJSON method to exclude sensitive fields
 * Prevents password and tokens from being sent in API responses
 * @returns {Object} User object without sensitive data
 */
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  // Remove sensitive fields before sending to client
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerificationExpires;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
