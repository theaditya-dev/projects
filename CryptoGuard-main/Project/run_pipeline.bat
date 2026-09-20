@echo off
title CryptoGuard - Bitcoin Monitoring ^& Investigation System
echo ====================================================================
echo  CryptoGuard - AI-Powered Bitcoin Monitoring ^& Investigation System
echo ====================================================================
echo.

set "VENV_PY=%~dp0.venv\Scripts\python.exe"

if exist "%VENV_PY%" (
    echo [INFO] Launching system using virtual environment (.venv)...
    "%VENV_PY%" run_pipeline.py
) else (
    echo [INFO] Searching for Python in environment...
    py -3 run_pipeline.py 2>nul || python run_pipeline.py
)

pause
