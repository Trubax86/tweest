@echo off
title TWEEST Web Server - Auto Restart
color 0A

:start
cls
echo ========================================
echo   TWEEST WEB SERVER - AUTO RESTART
echo ========================================
echo.
echo [INFO] Server in esecuzione...
echo [INFO] Premi Ctrl+C per fermare
echo.
echo ========================================
echo.

cd /d "%~dp0api"
node server.js

echo.
echo ========================================
echo [WARNING] Server fermato!
echo [INFO] Riavvio automatico in 3 secondi...
echo ========================================
timeout /t 3 /nobreak >nul

goto start
