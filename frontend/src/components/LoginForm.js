/**
 * Login Form Component
 * 
 * Displays the user login form with email and password fields.
 * Handles form validation and submission to authenticate users.
 * 
 * @param {Function} onLogin - Callback function called with form data on successful validation
 * @param {Function} onSwitchToRegister - Callback to switch to registration view
 * @param {Function} onForgotPassword - Callback to handle forgot password action
 */

import React, { useState } from 'react';
import './LoginForm.css';

const LoginForm = ({ onLogin, onSwitchToRegister, onForgotPassword }) => {
  // Form state management
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  // Validation errors state
  const [errors, setErrors] = useState({});
  // Loading state for form submission
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle Input Field Changes
   * Updates form state and clears field-specific errors when user types
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Validate Form Input
   * Performs client-side validation before submission
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};

    // Email validation: required and must match email format
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation: required
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      await onLogin(formData);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-form-card">
        <h2>Welcome Back</h2>
        <p className="form-subtitle">Sign in to continue your learning journey</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
              required
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? 'error' : ''}
              required
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-options">
            <button 
              type="button" 
              className="forgot-password-link"
              onClick={onForgotPassword}
            >
              Forgot Password?
            </button>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="form-footer">
          <p>Don't have an account? 
            <button 
              type="button" 
              className="switch-button"
              onClick={onSwitchToRegister}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
