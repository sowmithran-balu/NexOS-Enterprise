@echo off
title NexOS Enterprise ERP Launcher
echo ===================================================
echo   NexOS Enterprise ERP - Starting All Services...
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting LangChain Agentic AI Microservice (Port 8000)...
start "NexOS Agentic AI Microservice" cmd /k "cd /d "%~dp0ai-agent" && if exist ".venv\Scripts\python.exe" (.venv\Scripts\python.exe main.py) else (python main.py)"

echo [2/3] Starting Spring Boot Backend (Port 8080)...
start "NexOS Backend" cmd /k "cd /d "%~dp0erp-platform" && .\maven\bin\mvn.cmd -pl auth-service spring-boot:run"

echo [3/3] Starting Vite Frontend (Port 5174)...
start "NexOS Frontend" cmd /k "cd /d "%~dp0erp-platform\frontend" && npm run dev"

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
echo   * Agentic AI Service:   http://localhost:8000/
echo     - API Swagger Docs:   http://localhost:8000/docs
echo   * H2 Database Console:  http://localhost:8080/h2-console
echo     - JDBC URL:  jdbc:h2:mem:NexOS_Enterprise
echo     - User:      sa
echo     - Password:  [leave empty]
echo ===================================================
