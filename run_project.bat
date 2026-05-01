@echo off
echo ==========================================
echo   Visionary ASL - Launching System 2026
echo ==========================================
echo.
echo [1/2] Activating Virtual Environment...
call venv\Scripts\activate
if %errorlevel% neq 0 (
    echo ERROR: Virtual environment not found or failed to activate.
    pause
    exit /b
)

echo [2/2] Starting Flask API Server...
echo The application will be available at: http://localhost:5000
echo.
python api_server.py
pause
