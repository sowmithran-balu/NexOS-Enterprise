package com.erp.org.repository;

import com.erp.org.entity.ProjectTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectTaskRepository extends JpaRepository<ProjectTask, Long> {
    List<ProjectTask> findByCompanyId(Long companyId);
    List<ProjectTask> findByCompanyIdAndProjectId(Long companyId, Long projectId);
}
