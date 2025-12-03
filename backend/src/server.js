/**
 * FlashLearn Backend Server
 * 
 * Main entry point for the Express.js backend server.
 * Handles database connection, middleware setup, route registration,
 * and error handling for the FlashLearn flashcard application.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Import route handlers
const authRoutes = require('./routes/authRoutes');
const cardRoutes = require('./routes/cardRoutes');

// Initialize Express application
const app = express();

// Middleware Configuration
// Enable CORS to allow frontend (running on different port) to make requests
app.use(cors());
// Parse JSON request bodies
app.use(express.json());
// Parse URL-encoded request bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Database Connection
// Connect to MongoDB using connection string from environment variables
// Falls back to local MongoDB instance if MONGODB_URI is not set
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flashlearn', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  // Exit process if database connection fails
  process.exit(1);
});

// API Routes
// Mount authentication routes at /api/auth
app.use('/api/auth', authRoutes);
// Mount card and deck routes at /api/cards
app.use('/api/cards', cardRoutes);

// Health Check Endpoint
// Simple endpoint to verify the API is running and accessible
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'FlashLearn API is running',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handling Middleware
// Catches any unhandled errors and returns a standardized error response
// In development, shows full error details; in production, shows generic message
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    // Only expose error details in development for security
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 Handler
// Catches any requests to routes that don't exist
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Server Configuration
// Use PORT from environment variables or default to 5001
const PORT = process.env.PORT || 5001;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});