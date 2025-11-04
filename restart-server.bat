@echo off
title TWEEST Web - Restart Server
color 0E

echo ========================================
echo   TWEEST WEB - RESTART SERVER
echo ========================================
echo.

echo [1/4] Killing ALL Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo     ✓ Node.js processes killed
) else (
    echo     ℹ No Node.js processes found
)

echo.
echo [2/4] Waiting for ports to free...
timeout /t 3 /nobreak >nul
echo     ✓ Ports freed

echo.
echo [3/4] Starting server with auto-restart...
cd /d "%~dp0"
start "TWEEST Web Server - Auto Restart" cmd /k "start-server-watch.bat"

echo     ✓ Server started with auto-restart
echo.
echo [4/4] Done!
echo.
echo ========================================
echo   Server restarted successfully!
echo   
echo   Features:
echo   - Auto-restart on crash
echo   - Port 3001 monitoring
echo   - Ctrl+C to stop
echo ========================================
echo.
pause
