@echo off
echo BreakIn.ai - Git Commit Script
echo ================================
echo.
echo This script will commit all changes to git.
echo.
echo Configuring git for better OneDrive compatibility...
git config core.fscache true
git config core.preloadindex true
echo.

echo Staging all changes...
git add -A
echo.

echo Creating commit...
git commit -m "Major project improvements for better collaboration" -m "" -m "Improvements made:" -m "- Enhanced .env.example with comprehensive documentation" -m "- Added MIT License" -m "- Improved README with setup instructions and troubleshooting" -m "- Added CONTRIBUTING.md with development guidelines" -m "- Updated .gitignore with comprehensive patterns" -m "- Enhanced package.json with metadata and scripts" -m "- Added API_DOCUMENTATION.md with complete API reference" -m "- Added SECURITY.md with security best practices" -m "- Added build verification (project compiles successfully)" -m "" -m "These changes make the project more accessible to contributors" -m "and easier to set up for new users."
echo.

echo Checking if remote origin exists...
git remote | findstr origin >nul
if %errorlevel% equ 0 (
    echo Remote origin exists. Pushing changes...
    git push origin main
) else (
    echo No remote origin found.
    echo Please add your GitHub repository as remote:
    echo   git remote add origin https://github.com/yourusername/BreakIn.ai.git
    echo   git push -u origin main
)

echo.
echo Done!
pause
