package com.erp.org.repository;

import com.erp.org.entity.ProfitCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProfitCenterRepository extends JpaRepository<ProfitCenter, Long> {
    List<ProfitCenter> findByCompanyId(Long companyId);
}
