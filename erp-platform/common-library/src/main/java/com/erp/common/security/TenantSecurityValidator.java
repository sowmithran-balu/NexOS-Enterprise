package com.erp.common.security;

import com.erp.common.context.TenantContext;
import org.springframework.security.access.AccessDeniedException;

/**
 * Tenant Security Guard: Validates that data queries and mutations remain strictly isolated
 * within the authenticated user's organization and branch boundaries.
 */
public class TenantSecurityValidator {

    private TenantSecurityValidator() {}

    /**
     * Enforces that the requested entity's company ID matches the active tenant context.
     * Throws AccessDeniedException if a cross-tenant data exfiltration attempt is detected.
     */
    public static void validateTenantOwnership(Long entityCompanyId, String resourceName) {
        Long activeCompanyId = TenantContext.getCompanyId();

        // If context has no company ID (e.g. unauthenticated or global background job), skip check
        if (activeCompanyId == null || entityCompanyId == null) {
            return;
        }

        if (!activeCompanyId.equals(entityCompanyId)) {
            throw new AccessDeniedException(String.format(
                    "Cross-Tenant Security Violation: Authenticated tenant [%d] is not authorized to access %s of tenant [%d]",
                    activeCompanyId, resourceName, entityCompanyId
            ));
        }
    }

    /**
     * Validates branch ownership if branch-level multi-tenancy is active.
     */
    public static void validateBranchOwnership(Long entityBranchId, String resourceName) {
        Long activeBranchId = TenantContext.getBranchId();

        if (activeBranchId == null || entityBranchId == null) {
            return;
        }

        if (!activeBranchId.equals(entityBranchId)) {
            throw new AccessDeniedException(String.format(
                    "Branch Isolation Security Violation: Authenticated branch [%d] cannot access %s of branch [%d]",
                    activeBranchId, resourceName, entityBranchId
            ));
        }
    }
}
