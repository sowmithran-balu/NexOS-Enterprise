<#
.SYNOPSIS
    NexOS Enterprise ERP - 6-Layer Security & Juniper Cloud Networks Deployment
.DESCRIPTION
    Orchestrates the deployment of the 6-Layer Defense-in-Depth architecture:
    Layer 1: Juniper SRX / Cloud Edge Geo-fencing & OWASP IDP
    Layer 2: Nginx Reverse Proxy & Payload Size Limiting
    Layer 3: In-Application Brute-Force & Tenant Isolation
    Layer 4: Zero-Trust Microsegmentation (Juniper cSRX Container Firewall)
    Layer 5: Database Firewall (Port 1433 Dedicated Host Binding)
    Layer 6: SIEM Auditing & Juniper SecIntel Automated Wire-Speed Dropping
#>

param(
    [ValidateSet("Docker", "Local", "Verify", "HardenDB")]
    [string]$Mode = "Local"
)

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  NexOS Enterprise - Juniper Cloud Networks Security Deployment  " -ForegroundColor White
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

$WorkspaceRoot = Split-Path -Parent $PSScriptRoot

switch ($Mode) {
    "Docker" {
        Write-Host "[Deploying] Starting full 6-Layer Docker container stack with Juniper cSRX..." -ForegroundColor Green
        Set-Location $WorkspaceRoot
        docker-compose -f docker-compose.security.yml up -d
        Write-Host "`n[Status] Docker containers deployed successfully:" -ForegroundColor Green
        docker-compose -f docker-compose.security.yml ps
        Write-Host "`n* Frontend UI:           http://localhost:5174/" -ForegroundColor White
        Write-Host "* Nginx Edge Gateway:    https://localhost:443/" -ForegroundColor White
        Write-Host "* Backend API:           http://localhost:8080/" -ForegroundColor White
        Write-Host "* Juniper SRX Cluster:   JUNIPER-SRX-NEXOS-CLOUD-01 (Port 8443)" -ForegroundColor White
    }

    "Local" {
        Write-Host "[Step 1/3] Hardening Database Firewall (Port 1433 local isolation)..." -ForegroundColor Yellow
        powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\harden_database_firewall.ps1"

        Write-Host "`n[Step 2/3] Starting Spring Boot Backend with Juniper Cloud Connector..." -ForegroundColor Green
        Start-Process cmd -ArgumentList "/k", "cd /d `"$WorkspaceRoot\erp-platform`" && .\maven\bin\mvn.cmd -pl auth-service spring-boot:run" -WindowStyle Normal

        Write-Host "[Step 3/3] Starting Vite Frontend with Security Console..." -ForegroundColor Green
        Start-Process cmd -ArgumentList "/k", "cd /d `"$WorkspaceRoot\erp-platform\frontend`" && npm run dev" -WindowStyle Normal

        Write-Host "`nWaiting for services to initialize..." -ForegroundColor Cyan
        Start-Sleep -Seconds 6

        Write-Host "`nOpening NexOS Enterprise Security Firewall Console..." -ForegroundColor Green
        Start-Process "http://localhost:5174/"

        Write-Host "`n[Done] All services active with Juniper Cloud Networks SecIntel integration!" -ForegroundColor White
    }

    "Verify" {
        Write-Host "[Verifying] Executing automated attack simulation and Juniper SecIntel check..." -ForegroundColor Yellow
        Set-Location $WorkspaceRoot
        node scripts\test_attacks.js
    }

    "HardenDB" {
        Write-Host "[Hardening] Running Database Firewall Port 1433 isolation..." -ForegroundColor Yellow
        powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\harden_database_firewall.ps1"
    }
}
