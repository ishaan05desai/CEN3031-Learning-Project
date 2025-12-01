import React, { useState } from 'react';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import DeckManagement from './components/DeckManagement';
import './App.css';

function App() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [user, setUser] = useState(null);

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
        setIsLoginMode(true); // Switch to login after successful registration
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

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
        // Store token and user data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        alert('Login successful! Welcome to FlashLearn.');
        // TODO: Redirect to dashboard
      } else {
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

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

  // Check if user is already logged in
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
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
            <span>Welcome, {user.username}!</span>
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