/**
 * FlashLearn Main Application Component
 * 
 * Root component that manages application state and routing between:
 * - Authentication views (Login/Register)
 * - Main application view (Deck Management)
 * 
 * Handles user authentication state and localStorage persistence.
 */

import React, { useState } from 'react';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import DeckManagement from './components/DeckManagement';
import './App.css';

function App() {
  // State for managing login/register view toggle
  const [isLoginMode, setIsLoginMode] = useState(true);
  // State for authenticated user information
  const [user, setUser] = useState(null);

  /**
   * Handle User Registration
   * Sends registration request to backend API
   * @param {Object} formData - User registration data (username, email, password, etc.)
   */
  const handleRegister = async (formData) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Registration successful! Please check your email for verification.');
        // Switch to login view after successful registration
        setIsLoginMode(true);
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  /**
   * Handle User Login
   * Authenticates user and stores JWT token in localStorage
   * @param {Object} formData - Login credentials (email, password)
   */
  const handleLogin = async (formData) => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Store authentication token and user data in localStorage for persistence
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        alert('Login successful! Welcome to FlashLearn.');
        // TODO: Redirect to dashboard
      } else {
        // Handle specific error cases
        if (data.needsVerification) {
          alert('Please verify your email before logging in.');
        } else {
          alert(data.message || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  /**
   * Handle User Logout
   * Clears authentication data from localStorage and resets user state
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  /**
   * Handle Forgot Password Request
   * Placeholder for password reset functionality
   */
  const handleForgotPassword = () => {
    const email = prompt('Enter your email address:');
    if (email) {
      // TODO: Implement forgot password functionality
      alert('Password reset functionality will be implemented soon!');
    }
  };

  const handleSwitchToLogin = () => {
    setIsLoginMode(true);
  };

  const handleSwitchToRegister = () => {
    setIsLoginMode(false);
  };

  /**
   * Check for Existing Authentication on Component Mount
   * Restores user session from localStorage if token exists
   * This allows users to stay logged in after page refresh
   */
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        // Restore user state from localStorage
        setUser(JSON.parse(userData));
      } catch (error) {
        // If data is corrupted, clear it and require re-login
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>FlashLearn</h1>
        <p>Master your studies with intelligent flashcards</p>
        {user && (
          <div className="user-info">
            <span>
              Welcome, {user.username}!
              {user.role === 'admin' && (
                <span style={{
                  marginLeft: '8px',
                  padding: '2px 8px',
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>ADMIN</span>
              )}
            </span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        )}
      </header>
      
      <main className="App-main">
        {user ? (
          <DeckManagement />
        ) : (
          <>
            {isLoginMode ? (
              <LoginForm 
                onLogin={handleLogin}
                onSwitchToRegister={handleSwitchToRegister}
                onForgotPassword={handleForgotPassword}
              />
            ) : (
              <RegisterForm 
                onRegister={handleRegister}
                onSwitchToLogin={handleSwitchToLogin}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;