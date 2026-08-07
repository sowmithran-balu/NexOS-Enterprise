@echo off
title NexOS Enterprise ERP Launcher
echo ===================================================
echo   NexOS Enterprise ERP - Starting Services...
echo ===================================================
echo.

cd /d "%~dp0"
cd erp-platform

echo Starting Spring Boot backend...
start "NexOS Backend" cmd /k ".\maven\bin\mvn.cmd -pl auth-service spring-boot:run"

echo Starting Vite frontend...
start "NexOS Frontend" cmd /k "cd frontend && npm run dev"

echo Waiting for services to initialize...
timeout /t 6 >nul

echo Opening browser to dashboard...
start http://localhost:5174/

echo.
echo ===================================================
echo   All services launched!
echo ===================================================
