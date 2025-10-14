@echo off
echo FlashLearn Setup Instructions
echo ============================
echo.

echo 1. DATABASE SETUP REQUIRED:
echo    You need MongoDB running for the application to work.
echo.
echo    Option A - Local MongoDB:
echo    - Install MongoDB from https://www.mongodb.com/try/download/community
echo    - Start MongoDB service: net start MongoDB
echo    - Or run: mongod
echo.
echo    Option B - MongoDB Atlas (Cloud - Recommended):
echo    - Go to https://www.mongodb.com/atlas
echo    - Create free account and cluster
echo    - Get connection string
echo    - Update backend/.env file with your connection string
echo.

echo 2. START THE APPLICATION:
echo    - Double-click start-app.bat
echo    - Or run the commands manually:
echo      Backend:  cd backend && npm start
echo      Frontend: cd frontend && npm start
echo.

echo 3. ACCESS THE APPLICATION:
echo    - Open browser to http://localhost:3000
echo    - Register a new account
echo    - Create decks and flashcards
echo    - Start studying!
echo.

pause
