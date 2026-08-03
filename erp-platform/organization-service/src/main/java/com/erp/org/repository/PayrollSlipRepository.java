package com.erp.org.repository;

import com.erp.org.entity.PayrollSlip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollSlipRepository extends JpaRepository<PayrollSlip, Long> {
    List<PayrollSlip> findByCompanyId(Long companyId);
    Optional<PayrollSlip> findByCompanyIdAndEmployeeIdAndMonthAndYear(Long companyId, Long employeeId, String month, int year);
}
