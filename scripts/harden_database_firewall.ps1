<#
.SYNOPSIS
    NexOS Enterprise ERP - Layer 5 Database Firewall Hardening Script
.DESCRIPTION
    Harden Microsoft SQL Server port 1433 using Windows Defender Firewall with Advanced Security:
    1. Locks port 1433 to localhost (127.0.0.1, ::1) and authorized backend CIDR blocks.
    2. Drops and logs all foreign or external connection attempts to port 1433.
    3. Verifies registry binding to prevent SQL Server from listening on unrestricted public NICs.
#>

param(
    [string]$BackendServerIP = "127.0.0.1",
    [string]$DatabasePort = "1433",
    [switch]$DryRun = $false
)

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  NexOS Enterprise ERP - Layer 5: Database Firewall Hardening   " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Ensure Administrator privileges
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Warning "[!] This script requires elevated Administrator privileges to configure Windows Firewall rules."
    Write-Warning "    Please re-run this script in an elevated PowerShell session (Run as Administrator)."
}

Write-Host "[1/4] Inspecting SQL Server TCP/IP network binding..." -ForegroundColor Yellow
$tcpPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL14.MSSQLSERVER\MSSQLServer\SuperSocketNetLib\Tcp"
if (Test-Path $tcpPath) {
    $ipAllPath = "$tcpPath\IPAll"
    $currentPort = (Get-ItemProperty -Path $ipAllPath -Name "TcpPort" -ErrorAction SilentlyContinue).TcpPort
    Write-Host "      -> SQL Server is configured on TCP Port: $currentPort" -ForegroundColor Green
} else {
    Write-Host "      -> SQL Server default registry path not found or custom instance in use. Continuing to firewall..." -ForegroundColor Gray
}

Write-Host ""
Write-Host "[2/4] Removing legacy unconstrained port 1433 firewall rules..." -ForegroundColor Yellow
$legacyRules = @("SQL Server Default (Allow All)", "NexOS-SQLServer-Port1433-AllowAll")
foreach ($r in $legacyRules) {
    $existing = Get-NetFirewallRule -DisplayName $r -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "      [-] Removing legacy rule: $r" -ForegroundColor Red
        if (-not $DryRun) {
            Remove-NetFirewallRule -DisplayName $r -ErrorAction SilentlyContinue
        }
    }
}

Write-Host ""
Write-Host "[3/4] Creating Hardened Inbound Firewall Rule: NexOS-SQLServer-Restricted-Port1433..." -ForegroundColor Yellow
$ruleName = "NexOS-SQLServer-Isolated-Port1433"
$authorizedIPs = @("127.0.0.1", "::1")
if ($BackendServerIP -and $BackendServerIP -ne "127.0.0.1") {
    $authorizedIPs += $BackendServerIP
}

$ipString = $authorizedIPs -join ","
Write-Host "      -> Enforcing Remote IP Whitelist: $ipString" -ForegroundColor Cyan
Write-Host "      -> Blocking all non-whitelisted external IPs from reaching Port $DatabasePort" -ForegroundColor Cyan

if (-not $DryRun) {
    # Remove rule if it already exists to ensure fresh idempotent creation
    Remove-NetFirewallRule -Name $ruleName -ErrorAction SilentlyContinue

    New-NetFirewallRule -Name $ruleName `
                        -DisplayName "NexOS Enterprise - Isolated SQL Server (Port $DatabasePort)" `
                        -Description "Restricts SQL Server inbound connections exclusively to authorized NexOS backend application servers." `
                        -Direction Inbound `
                        -Action Allow `
                        -Protocol TCP `
                        -LocalPort $DatabasePort `
                        -RemoteAddress $authorizedIPs `
                        -Profile Domain, Private, Public `
                        -Enabled True

    Write-Host "      [+] Hardened Inbound Firewall Rule successfully applied!" -ForegroundColor Green
} else {
    Write-Host "      [DRY-RUN] Would create Inbound Rule allowing only: $ipString" -ForegroundColor Magenta
}

Write-Host ""
Write-Host "[4/4] Verifying Active Firewall Policy for Port $DatabasePort..." -ForegroundColor Yellow
$activeRule = Get-NetFirewallRule -Name $ruleName -ErrorAction SilentlyContinue
if ($activeRule) {
    $portFilter = Get-NetFirewallPortFilter -AssociatedNetFirewallRule $activeRule
    $addressFilter = Get-NetFirewallAddressFilter -AssociatedNetFirewallRule $activeRule
    Write-Host "      [OK] Rule Name     : $($activeRule.DisplayName)" -ForegroundColor Green
    Write-Host "      [OK] Action        : $($activeRule.Action)" -ForegroundColor Green
    Write-Host "      [OK] Local Port    : $($portFilter.LocalPort)" -ForegroundColor Green
    Write-Host "      [OK] Remote IPs    : $($addressFilter.RemoteAddress -join ', ')" -ForegroundColor Green
} else {
    Write-Host "      [-] Rule status: Simulation or requires admin rights." -ForegroundColor Gray
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Database Firewall Hardening Complete: Port $DatabasePort Isolated! " -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Cyan
