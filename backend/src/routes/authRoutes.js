/**
 * Authentication Routes
 * 
 * Defines all authentication-related API endpoints.
 * Routes are organized into public (no auth required) and protected (auth required) sections.
 */

const express = require('express');
const { 
  register, 
  verifyEmail, 
  resendVerification,
  login,
  getProfile,
  updateProfile,
  requestPasswordReset,
  resetPassword,
  changePassword
} = require('../controllers/authController');
const { 
  validateRegistration, 
  validateLogin,
  validateEmailVerification, 
  validatePasswordReset,
  validateNewPassword,
  validateProfileUpdate
} = require('../middleware/validation');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ==================== PUBLIC ROUTES (No Authentication Required) ====================

// User registration endpoint
router.post('/register', validateRegistration, register);
// User login endpoint
router.post('/login', validateLogin, login);
// Email verification endpoint (accessed via link in email)
router.get('/verify/:token', verifyEmail);
// Resend email verification token
router.post('/resend-verification', validateEmailVerification, resendVerification);
// Request password reset (generates reset token)
router.post('/request-password-reset', validatePasswordReset, requestPasswordReset);
// Reset password using token
router.post('/reset-password', validateNewPassword, resetPassword);

// ==================== PROTECTED ROUTES (Authentication Required) ====================

// Get current user's profile information
router.get('/profile', authMiddleware, getProfile);
// Update current user's profile
router.put('/profile', authMiddleware, validateProfileUpdate, updateProfile);
// Change password for authenticated user
router.put('/change-password', authMiddleware, validateNewPassword, changePassword);

module.exports = router;