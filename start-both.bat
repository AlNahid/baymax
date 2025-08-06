@echo off
echo ========================================
echo Starting Baymax Application
echo ========================================
echo.

echo Step 1: Starting Backend Server...
start "Baymax Backend" cmd /k "cd baymax-backend && npm start"
echo ✅ Backend starting in new window...
echo.

echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak > nul
echo.

echo Step 2: Starting Frontend Development Server...
start "Baymax Frontend" cmd /k "cd baymax-frontend && npm start"
echo ✅ Frontend starting in new window...
echo.

echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Two new command windows should have opened.
echo If you see errors in those windows, check the TROUBLESHOOTING.md file.
echo.
pause
