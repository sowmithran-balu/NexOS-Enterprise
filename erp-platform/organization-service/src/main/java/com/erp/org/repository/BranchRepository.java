package com.erp.org.repository;

import com.erp.org.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByCompanyId(Long companyId);
    Optional<Branch> findByCompanyIdAndCode(Long companyId, String code);
}
