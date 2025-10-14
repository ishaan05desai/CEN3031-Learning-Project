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

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.get('/verify/:token', verifyEmail);
router.post('/resend-verification', validateEmailVerification, resendVerification);
router.post('/request-password-reset', validatePasswordReset, requestPasswordReset);
router.post('/reset-password', validateNewPassword, resetPassword);

// Protected routes (require authentication)
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, validateProfileUpdate, updateProfile);
router.put('/change-password', authMiddleware, validateNewPassword, changePassword);

module.exports = router;