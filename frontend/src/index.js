/**
 * FlashLearn Frontend Entry Point
 * 
 * Initializes the React application and renders the root App component.
 * Uses React 18's createRoot API for rendering.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Get the root DOM element and create a React root
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component in StrictMode for development checks
// StrictMode helps identify potential problems in the application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
