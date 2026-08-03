package com.erp.auth.repository;

import com.erp.auth.entity.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
    List<JournalEntry> findByCompanyId(Long companyId);
    List<JournalEntry> findByCompanyIdAndLedgerId(Long companyId, Long ledgerId);
    List<JournalEntry> findByLedgerIdAndProfitCentreId(Long ledgerId, Long profitCentreId);
}
