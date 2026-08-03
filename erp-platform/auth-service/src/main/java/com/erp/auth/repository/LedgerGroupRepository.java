package com.erp.auth.repository;

import com.erp.auth.entity.LedgerGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LedgerGroupRepository extends JpaRepository<LedgerGroup, Long> {
    List<LedgerGroup> findByCompanyId(Long companyId);
    Optional<LedgerGroup> findByCompanyIdAndName(Long companyId, String name);
    Optional<LedgerGroup> findByCompanyIdAndCode(Long companyId, String code);
}
