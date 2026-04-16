@echo off
cd /d %~dp0
echo ================================
echo Installing Dependencies
echo ================================
call npm install
if %errorlevel% neq 0 (
    echo npm install failed!
    pause
    exit /b 1
)
echo.
echo ================================
echo Dependencies Installed Successfully
echo ================================
echo.
echo Next steps:
echo 1. Edit common/weatherService.js and add your OpenWeatherMap API key
echo 2. Run: npm run dev:mp-weixin
echo.
pause