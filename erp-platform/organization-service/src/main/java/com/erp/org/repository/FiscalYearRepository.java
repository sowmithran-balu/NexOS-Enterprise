package com.erp.org.repository;

import com.erp.org.entity.FiscalYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FiscalYearRepository extends JpaRepository<FiscalYear, Long> {
    List<FiscalYear> findByCompanyId(Long companyId);
}
