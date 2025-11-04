@echo off
echo ========================================
echo   TWEEST WEB - FIX AND DEPLOY
echo ========================================
echo.

echo [1/4] Fixing TypeScript errors...
echo.

echo [2/4] Adding changes to Git...
git add .
echo.

echo [3/4] Committing changes...
git commit -m "Fix: Remove setHeroIndex and use local variable for hero rotation"
echo.

echo [4/4] Pushing to GitHub (triggers Netlify deploy)...
git push
echo.

echo ========================================
echo   DEPLOY TRIGGERED!
echo ========================================
echo.
echo Vai su Netlify per vedere il deploy:
echo https://app.netlify.com
echo.
pause
