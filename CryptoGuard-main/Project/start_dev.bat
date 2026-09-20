@echo off
title CryptoGuard // Full-Stack Development Launcher
echo ====================================================================
echo  CryptoGuard : Bitcoin Forensic Intelligence Platform
echo  Launching Full-Stack Dev Environment (Backend :8000 + Frontend :5173)
echo ====================================================================
echo.

echo [1/2] Launching Team 2 FastAPI Backend on http://localhost:8000 ...
start "CryptoGuard Backend API" cmd /k "cd /d %~dp0backend && py -3 -m uvicorn main:app --reload --port 8000 || python -m uvicorn main:app --reload --port 8000"

echo [2/2] Launching Team 3 React/Vite Frontend on http://localhost:5173 ...
start "CryptoGuard Frontend Dev Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo All services launched!
echo - Frontend UI : http://localhost:5173
echo - Backend API : http://localhost:8000/docs
echo.
