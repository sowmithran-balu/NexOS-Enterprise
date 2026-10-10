@echo off
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
title NexOS ERP - Agentic AI Microservice
echo ========================================================
echo   Starting NexOS ERP Agentic AI Microservice (Port 8000)
echo   16 Autonomous Live Tools Mounted (FastAPI + LangChain)
echo ========================================================
cd /d "%~dp0ai-agent"
if not exist ".venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found in ai-agent\.venv!
    echo Please install dependencies first.
    pause
    exit /b 1
)

echo Activating Python virtual environment and launching FastAPI server on port 8000...
.venv\Scripts\python.exe main.py
pause
