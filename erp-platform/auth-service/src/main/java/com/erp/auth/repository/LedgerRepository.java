package com.erp.auth.repository;

import com.erp.auth.entity.Ledger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LedgerRepository extends JpaRepository<Ledger, Long> {
    List<Ledger> findByCompanyId(Long companyId);
    List<Ledger> findByCompanyIdAndType(Long companyId, String type);
    Optional<Ledger> findByCompanyIdAndName(Long companyId, String name);
}
