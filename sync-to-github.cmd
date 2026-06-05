@echo off
echo ===================================================
echo SYNC TO GITHUB
echo ===================================================
echo This script will initialize a Git repository and push your code to GitHub.
echo.
echo NOTE: You MUST log into GitHub in your browser if prompted.
echo.
pause

echo Initializing Git...
git init
if %errorlevel% neq 0 (
    echo Error: Git is not installed or not working properly.
    pause
    exit /b %errorlevel%
)

echo Adding files...
git add .

echo Committing changes...
git commit -m "Migrate to async Supabase backend"

echo Pushing to GitHub...
echo (You will be prompted to log in to GitHub in your web browser)
gh repo create TheVendor --public --source=. --remote=origin --push

echo.
echo ===================================================
echo SUCCESS! Your code has been synced to GitHub.
echo ===================================================
pause
