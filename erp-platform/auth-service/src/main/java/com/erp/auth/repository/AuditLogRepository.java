package com.erp.auth.repository;

import com.erp.auth.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByCompanyIdOrderByTimestampDesc(Long companyId);
    List<AuditLog> findAllByOrderByTimestampDesc();
}
