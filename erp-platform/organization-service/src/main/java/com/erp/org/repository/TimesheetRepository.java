package com.erp.org.repository;

import com.erp.org.entity.Timesheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TimesheetRepository extends JpaRepository<Timesheet, Long> {
    List<Timesheet> findByCompanyId(Long companyId);
    List<Timesheet> findByCompanyIdAndEmployeeId(Long companyId, Long employeeId);
}
