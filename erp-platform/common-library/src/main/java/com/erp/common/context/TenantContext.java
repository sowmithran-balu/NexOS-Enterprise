package com.erp.common.context;

public class TenantContext {
    private static final ThreadLocal<Long> currentCompanyId = new ThreadLocal<>();
    private static final ThreadLocal<Long> currentBranchId = new ThreadLocal<>();

    public static void setCompanyId(Long companyId) {
        currentCompanyId.set(companyId);
    }

    public static Long getCompanyId() {
        return currentCompanyId.get();
    }

    public static void setBranchId(Long branchId) {
        currentBranchId.set(branchId);
    }

    public static Long getBranchId() {
        return currentBranchId.get();
    }

    public static void clear() {
        currentCompanyId.remove();
        currentBranchId.remove();
    }
}
