@echo off
echo Starting FlashLearn Application...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d C:\Users\chieu\CEN3031-Learning-Project\backend && npm start"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d C:\Users\chieu\CEN3031-Learning-Project\frontend && npm start"

echo.
echo Both servers are starting...
echo Backend will be available at: http://localhost:5001
echo Frontend will be available at: http://localhost:3000
echo.
echo Press any key to exit this window...
pause >nul
