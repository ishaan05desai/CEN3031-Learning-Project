@echo off
echo FlashLearn Setup Instructions
echo ============================
echo.

echo 1. DATABASE SETUP REQUIRED:
echo    You need MongoDB running for the application to work.
echo.
echo    Option A - Local MongoDB:
echo    - Install MongoDB from: https://www.mongodb.com/try/download/community
echo    - Start MongoDB service: net start MongoDB
echo    - Or run: mongod
echo.
echo    Option B - MongoDB Atlas (Cloud - Recommended):
echo    - Go to https://www.mongodb.com/atlas
echo    - Create a free account and cluster
echo    - Copy your connection string
echo    - Update backend/.env with your connection string
echo.

echo 2. UPDATE start-app.bat FILE PATH:
echo    After cloning the project, you MUST update the file paths in start-app.bat.
echo.
echo    Example:
echo    - If your project is located at:
echo      C:\Users\YourName\Documents\CEN3031-Learning-Project
echo    - Then update these lines inside start-app.bat:
echo      cd /d C:\Users\YourName\Documents\CEN3031-Learning-Project\backend
echo      cd /d C:\Users\YourName\Documents\CEN3031-Learning-Project\frontend
echo.
echo    (The file includes an example path, but you must replace it with your own.)
echo.

echo 3. START THE APPLICATION:
echo    - Double-click start-app.bat
echo    - Or run the commands manually:
echo      Backend:  cd backend && npm start
echo      Frontend: cd frontend && npm start
echo.

echo 4. ACCESS THE APPLICATION:
echo    - Open http://localhost:3000 in your browser
echo    - Register a new account
echo    - Create decks and flashcards
echo    - Start studying!
echo.

pause