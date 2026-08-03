package com.erp.auth.aspect;

import com.erp.common.context.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Session;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class TenantFilterAspect {

    @PersistenceContext
    private EntityManager entityManager;

    @Before("execution(* org.springframework.data.repository.Repository+.*(..))")
    public void enableTenantFilters() {
        try {
            Session session = entityManager.unwrap(Session.class);
            if (session != null) {
                Long companyId = TenantContext.getCompanyId();
                if (companyId != null) {
                    session.enableFilter("companyFilter").setParameter("companyId", companyId);
                }

                Long branchId = TenantContext.getBranchId();
                if (branchId != null) {
                    session.enableFilter("branchFilter").setParameter("branchId", branchId);
                }
            }
        } catch (Exception e) {
            // Log or handle exception if Session is not available in the current context
        }
    }
}
