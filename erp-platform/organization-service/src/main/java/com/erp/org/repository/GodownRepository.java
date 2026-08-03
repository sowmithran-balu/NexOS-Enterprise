package com.erp.org.repository;

import com.erp.org.entity.Godown;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GodownRepository extends JpaRepository<Godown, Long> {
    List<Godown> findByCompanyId(Long companyId);
}
