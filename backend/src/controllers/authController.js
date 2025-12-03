/**
 * Authentication Controller
 * 
 * Handles all authentication-related operations including:
 * - User registration and email verification
 * - User login and JWT token generation
 * - Password reset and change functionality
 * - User profile management
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createSeedDeck } = require('../utils/seedData');

/**
 * Generate JWT Token
 * Creates a JSON Web Token for user authentication
 * @param {string} userId - The user's MongoDB ObjectId
 * @returns {string} JWT token string
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Register New User
 * Creates a new user account with email verification
 * Automatically creates a seed deck for new users
 * @route POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role } = req.body;

    // Check if user already exists (by email or username)
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Validate and sanitize role - default to 'user' if invalid
    const validRole = role && ['user', 'admin'].includes(role) ? role : 'user';

    // Create new user instance
    const user = new User({
      username,
      email,
      password,
      role: validRole,
      profile: {
        firstName: firstName || '',
        lastName: lastName || ''
      }
    });

    // Generate email verification token (24-hour expiration)
    const verificationToken = user.generateEmailVerificationToken();
    
    // Save user to database (password will be hashed by pre-save middleware)
    await user.save();

    // Create seed flashcard deck for new user to help them get started
    try {
      await createSeedDeck(user._id);
    } catch (seedError) {
      // Log error but don't fail registration if seed creation fails
      // This ensures registration succeeds even if seed deck creation has issues
      console.error('Failed to create seed deck for new user:', seedError);
    }

    // Generate JWT token for immediate authentication
    const token = generateToken(user._id);

    // TODO: Send verification email (implement email service)
    // For now, log the token for development purposes
    console.log(`Email verification token for ${email}: ${verificationToken}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Verify Email Address
 * Verifies a user's email address using the verification token
 * @route GET /api/auth/verify/:token
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Mark email as verified and clear verification token fields
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Resend verification email
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // TODO: Send verification email
    console.log(`Resend verification token for ${email}: ${verificationToken}`);

    res.json({
      success: true,
      message: 'Verification email sent'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Login User
 * Authenticates a user and returns a JWT token
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password field (normally excluded)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      // Return generic message to prevent user enumeration
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Email verification check (currently disabled for development)
    // In production, uncomment this to require email verification before login
    // if (!user.isEmailVerified) {
    //   return res.status(401).json({
    //     success: false,
    //     message: 'Please verify your email before logging in',
    //     needsVerification: true
    //   });
    // }

    // Verify password using bcrypt comparison
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Return generic message to prevent user enumeration
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token for authenticated session
    const token = generateToken(user._id);

    // Update last login timestamp (optional tracking)
    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get Current User Profile
 * Returns the authenticated user's profile information
 * @route GET /api/auth/profile
 * @requires Authentication
 */
const getProfile = async (req, res) => {
  try {
    // req.user.userId is set by authMiddleware after JWT verification
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update profile fields
    if (firstName !== undefined) user.profile.firstName = firstName;
    if (lastName !== undefined) user.profile.lastName = lastName;
    if (bio !== undefined) user.profile.bio = bio;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.toJSON()
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Request Password Reset
 * Generates a password reset token and sends it via email
 * Returns success message even if email doesn't exist (security best practice)
 * @route POST /api/auth/request-password-reset
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    
    if (!user) {
      // Don't reveal if email exists or not for security (prevents user enumeration)
      // Always return success message regardless of whether user exists
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    // Generate password reset token (expires in 1 hour)
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // TODO: Send password reset email with reset link
    // For now, log the token for development purposes
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reset password with token
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Change password (for authenticated users)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  register,
  verifyEmail,
  resendVerification,
  login,
  getProfile,
  updateProfile,
  requestPasswordReset,
  resetPassword,
  changePassword
};