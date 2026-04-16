@echo off
cd /d %~dp0
echo ================================
echo Building WeChat Mini Program
echo ================================
call npm run build:mp-weixin 2> build_errors.txt
if %errorlevel% neq 0 (
    echo.
    echo Build failed! Check build_errors.txt for details.
) else (
    echo.
    echo ================================
    echo Build Successful!
    echo ================================
    echo Output: dist\build\mp-weixin
    echo.
    echo Open in WeChat DevTools:
    echo 1. Open WeChat DevTools
    echo 2. Select 'Import Project'
    echo 3. Choose this folder
    echo 4. Set AppID (use your own or test mode)
)
echo.
pause