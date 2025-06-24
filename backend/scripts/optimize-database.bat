@echo off
REM backend/scripts/optimize-database.bat
REM Batch script to run database optimization for Asset Management System
REM Optimizes Neon PostgreSQL database for faster API query response times

echo Database Optimization Script for Asset Management System
echo =========================================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: package.json not found. Please run this script from the backend directory.
    echo.
    echo Usage: cd backend ^&^& scripts\optimize-database.bat
    pause
    exit /b 1
)

REM Check if POSTGRES_URL is set
if "%POSTGRES_URL%"=="" (
    echo Error: POSTGRES_URL environment variable is not set.
    echo Please set the POSTGRES_URL environment variable to your Neon PostgreSQL connection string.
    echo This should be in your .env.local file.
    echo.
    echo Example: set POSTGRES_URL=postgresql://username:password@host:port/database
    pause
    exit /b 1
)

echo Starting database optimization...
echo.

REM Run the optimization script
call yarn db:optimize

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Database optimization completed successfully!
    echo.
    echo Next steps:
    echo 1. Monitor your API response times
    echo 2. Run this script periodically to check performance
    echo 3. Review the DATABASE_OPTIMIZATION.md file for maintenance tips
) else (
    echo.
    echo ❌ Database optimization failed. Please check the error messages above.
)

echo.
pause
