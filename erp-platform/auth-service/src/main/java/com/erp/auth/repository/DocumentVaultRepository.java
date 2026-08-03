package com.erp.auth.repository;

import com.erp.auth.entity.DocumentVault;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DocumentVaultRepository extends JpaRepository<DocumentVault, Long> {
    List<DocumentVault> findByCompanyId(Long companyId);
}
