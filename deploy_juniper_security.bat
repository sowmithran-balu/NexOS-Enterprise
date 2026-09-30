@echo off
title NexOS Enterprise - Juniper Cloud Security Deployment
cls
echo =================================================================
echo   NexOS Enterprise ERP - 6-Layer Security ^& Juniper Cloud Deploy
echo =================================================================
echo.
echo Select Deployment Mode:
echo   [1] Full Docker Production Stack (with Juniper cSRX ^& Nginx)
echo   [2] Local Hybrid Deployment (Spring Boot + Vite + DB Hardening)
echo   [3] Verify ^& Simulate Attacks (SQLi, XSS, Brute-Force, SecIntel)
echo   [4] Harden Database Firewall (Port 1433 Isolation)
echo.

set /p choice="Enter choice (1-4, default=2): "
if "%choice%"=="" set choice=2

cd /d "%~dp0"

if "%choice%"=="1" (
    powershell -ExecutionPolicy Bypass -File "scripts\deploy_juniper_cloud_security.ps1" -Mode Docker
    goto end
)
if "%choice%"=="2" (
    powershell -ExecutionPolicy Bypass -File "scripts\deploy_juniper_cloud_security.ps1" -Mode Local
    goto end
)
if "%choice%"=="3" (
    powershell -ExecutionPolicy Bypass -File "scripts\deploy_juniper_cloud_security.ps1" -Mode Verify
    goto end
)
if "%choice%"=="4" (
    powershell -ExecutionPolicy Bypass -File "scripts\deploy_juniper_cloud_security.ps1" -Mode HardenDB
    goto end
)

:end
echo.
echo Press any key to exit...
pause >nul
