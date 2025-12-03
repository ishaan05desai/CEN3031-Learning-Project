/**
 * Authentication Middleware
 * 
 * Middleware functions for protecting routes and verifying user permissions.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user information to the request object
 * Must be called before accessing protected routes
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header (format: "Bearer <token>")
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify and decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify that the user still exists in the database
    // This handles cases where a user was deleted but token is still valid
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is no longer valid'
      });
    }

    // Attach user information to request object for use in route handlers
    // This allows controllers to access userId and role without querying the database again
    req.user = {
      userId: decoded.userId,
      role: user.role
    };
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Handle specific JWT errors with appropriate messages
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    // Generic error for unexpected issues
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Admin Middleware
 * Verifies that the authenticated user has admin role
 * Must be called after authMiddleware
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware
};
