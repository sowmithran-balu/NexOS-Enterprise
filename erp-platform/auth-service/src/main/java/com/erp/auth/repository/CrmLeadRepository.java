package com.erp.auth.repository;

import com.erp.auth.entity.CrmLead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CrmLeadRepository extends JpaRepository<CrmLead, Long> {
    List<CrmLead> findByCompanyId(Long companyId);
    List<CrmLead> findByCompanyIdAndStatus(Long companyId, String status);
}
