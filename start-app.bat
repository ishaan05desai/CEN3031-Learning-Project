@echo off
REM ============================================================================
REM FlashLearn Application Startup Script for Windows
REM 
REM This script starts both the backend and frontend servers for the
REM FlashLearn flashcard application. It opens separate command windows
REM for each server to allow independent monitoring and control.
REM
REM Prerequisites:
REM - Node.js and npm must be installed
REM - Backend and frontend dependencies must be installed (npm install)
REM - MongoDB must be running (default: localhost:27017)
REM ============================================================================

echo Starting FlashLearn Application...
echo.

REM Start the backend server in a new command window
REM The /k flag keeps the window open after the command completes
REM Note: Update the path if your project is in a different location
echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d C:\Users\dalai\CEN3031\CEN3031-Learning-Project\backend && npm start"

REM Wait 3 seconds to allow backend to start before starting frontend
REM /nobreak prevents user from skipping the wait
timeout /t 3 /nobreak >nul

REM Start the frontend server in a new command window
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d C:\Users\dalai\CEN3031\CEN3031-Learning-Project\frontend && npm start"

echo.
echo Both servers are starting...
echo Backend will be available at: http://localhost:5001
echo Frontend will be available at: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul
