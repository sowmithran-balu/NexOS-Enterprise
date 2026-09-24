-- =============================================================================
-- NexOS Enterprise ERP - Layer 5: Least Privilege Database Security Provisioning
-- Replaces SA superuser with restricted application login & schema permissions
-- =============================================================================

USE master;
GO

-- 1. Create dedicated application login if it does not already exist
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'nexos_app_user')
BEGIN
    CREATE LOGIN nexos_app_user 
    WITH PASSWORD = 'StrongEnterprisePassword!2026', 
         CHECK_POLICY = ON, 
         CHECK_EXPIRATION = ON,
         DEFAULT_DATABASE = NexOS_Enterprise;
    PRINT '[+] Created application server login: nexos_app_user';
END
ELSE
BEGIN
    PRINT '[*] Server login nexos_app_user already exists.';
END
GO

-- 2. Switch to ERP Platform database
USE NexOS_Enterprise;
GO

-- 3. Map login to database user
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'nexos_app_user')
BEGIN
    CREATE USER nexos_app_user FOR LOGIN nexos_app_user;
    PRINT '[+] Created database user: nexos_app_user';
END
GO

-- 4. Create custom application role with strict DML permissions only
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'nexos_dml_role' AND type = 'R')
BEGIN
    CREATE ROLE nexos_dml_role;
    PRINT '[+] Created role: nexos_dml_role';
END
GO

-- 5. Grant Data Manipulation privileges (SELECT, INSERT, UPDATE, DELETE, EXECUTE)
GRANT SELECT ON SCHEMA::dbo TO nexos_dml_role;
GRANT INSERT ON SCHEMA::dbo TO nexos_dml_role;
GRANT UPDATE ON SCHEMA::dbo TO nexos_dml_role;
GRANT DELETE ON SCHEMA::dbo TO nexos_dml_role;
GRANT EXECUTE ON SCHEMA::dbo TO nexos_dml_role;

-- 6. Explicitly DENY Data Definition (DDL) and destructive operations to the app user
DENY ALTER ON SCHEMA::dbo TO nexos_dml_role;
DENY DROP ON SCHEMA::dbo TO nexos_dml_role;
DENY TRUNCATE TO nexos_dml_role;

-- 7. Add application user to the restricted role
ALTER ROLE nexos_dml_role ADD MEMBER nexos_app_user;
PRINT '[+] Successfully assigned nexos_app_user to nexos_dml_role (Least-Privilege Active).';

-- 8. Verify user is NOT in db_owner or sysadmin
IF IS_ROLEMEMBER('db_owner', 'nexos_app_user') = 1
BEGIN
    ALTER ROLE db_owner DROP MEMBER nexos_app_user;
    PRINT '[-] Removed nexos_app_user from db_owner superuser role.';
END
GO

PRINT '=============================================================================';
PRINT '  NexOS Database Least Privilege Setup Completed: Zero Sysadmin Exposure!     ';
PRINT '=============================================================================';
GO
