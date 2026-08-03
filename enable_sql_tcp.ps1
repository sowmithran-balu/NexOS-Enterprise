# Enable TCP/IP protocol for SQL Server (MSSQLSERVER)
$tcpPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL14.MSSQLSERVER\MSSQLServer\SuperSocketNetLib\Tcp"
Set-ItemProperty -Path $tcpPath -Name "Enabled" -Value 1

# Enable Named Pipes protocol for SQL Server (MSSQLSERVER)
$npPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL14.MSSQLSERVER\MSSQLServer\SuperSocketNetLib\Np"
Set-ItemProperty -Path $npPath -Name "Enabled" -Value 1

# Configure IPAll to listen on port 1433
$ipAllPath = "HKLM:\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL14.MSSQLSERVER\MSSQLServer\SuperSocketNetLib\Tcp\IPAll"
Set-ItemProperty -Path $ipAllPath -Name "TcpPort" -Value "1433"
Set-ItemProperty -Path $ipAllPath -Name "TcpDynamicPorts" -Value ""

Write-Host "TCP/IP and Named Pipes protocols have been enabled."
Write-Host "Restarting SQL Server (MSSQLSERVER) service..."

Restart-Service -Name MSSQLSERVER -Force

Write-Host "SQL Server service restarted successfully. It is now listening on port 1433."
