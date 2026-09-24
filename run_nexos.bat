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

rem Waiting for services to initialize...
ping 127.0.0.1 -n 7 >nul

echo Opening browser to dashboard...
start http://localhost:5174/

echo.
echo ===================================================
echo   NexOS Enterprise ERP - All Services Active!
echo   -------------------------------------------------
echo   * Frontend Dashboard:   http://localhost:5174/
echo   * Backend REST API:     http://localhost:8080/
echo   * H2 Database Console:  http://localhost:8080/h2-console
echo     - JDBC URL:  jdbc:h2:mem:NexOS_Enterprise
echo     - User:      sa
echo     - Password:  [leave empty]
echo ===================================================
