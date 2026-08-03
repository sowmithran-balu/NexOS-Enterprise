package com.erp.org.repository;

import com.erp.org.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByCompanyId(Long companyId);
    List<Attendance> findByCompanyIdAndDate(Long companyId, LocalDate date);
    Optional<Attendance> findByCompanyIdAndEmployeeIdAndDate(Long companyId, Long employeeId, LocalDate date);
}
