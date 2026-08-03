package com.erp.org.repository;

import com.erp.org.entity.Bom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BomRepository extends JpaRepository<Bom, Long> {
    List<Bom> findByCompanyId(Long companyId);
    List<Bom> findByCompanyIdAndFinishedProductId(Long companyId, Long finishedProductId);
}
