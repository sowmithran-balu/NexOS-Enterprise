package com.erp.auth.controller;

import com.erp.org.entity.Employee;
import com.erp.org.entity.Attendance;
import com.erp.org.entity.LeaveRequest;
import com.erp.org.entity.PayrollSlip;
import com.erp.org.repository.EmployeeRepository;
import com.erp.org.repository.AttendanceRepository;
import com.erp.org.repository.LeaveRequestRepository;
import com.erp.org.repository.PayrollSlipRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/hr")
public class HrController {

    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PayrollSlipRepository payrollSlipRepository;

    public HrController(EmployeeRepository employeeRepository,
                        AttendanceRepository attendanceRepository,
                        LeaveRequestRepository leaveRequestRepository,
                        PayrollSlipRepository payrollSlipRepository) {
        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.payrollSlipRepository = payrollSlipRepository;
    }

    // 1. Employees
    @GetMapping("/employees")
    public ResponseEntity<List<Employee>> getEmployees(@RequestParam Long companyId) {
        return ResponseEntity.ok(employeeRepository.findByCompanyId(companyId));
    }

    @PostMapping("/employees")
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee) {
        return ResponseEntity.ok(employeeRepository.save(employee));
    }

    // 2. Attendance
    @GetMapping("/attendance")
    public ResponseEntity<List<Attendance>> getAttendance(@RequestParam Long companyId) {
        return ResponseEntity.ok(attendanceRepository.findByCompanyId(companyId));
    }

    @PostMapping("/attendance/check-in")
    public ResponseEntity<?> checkIn(@RequestBody Map<String, Object> payload) {
        try {
            Long companyId = Long.valueOf(payload.get("companyId").toString());
            Long employeeId = Long.valueOf(payload.get("employeeId").toString());
            LocalDate today = LocalDate.now();

            Optional<Attendance> existing = attendanceRepository.findByCompanyIdAndEmployeeIdAndDate(companyId, employeeId, today);
            if (existing.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Already checked in today."));
            }

            LocalTime checkInTime = LocalTime.now();
            String status = "PRESENT";
            if (checkInTime.isAfter(LocalTime.of(9, 15))) {
                status = "LATE";
            }

            Attendance record = Attendance.builder()
                    .companyId(companyId)
                    .employeeId(employeeId)
                    .date(today)
                    .checkIn(checkInTime)
                    .status(status)
                    .build();

            return ResponseEntity.ok(attendanceRepository.save(record));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/attendance/check-out")
    public ResponseEntity<?> checkOut(@RequestBody Map<String, Object> payload) {
        try {
            Long companyId = Long.valueOf(payload.get("companyId").toString());
            Long employeeId = Long.valueOf(payload.get("employeeId").toString());
            LocalDate today = LocalDate.now();

            Optional<Attendance> existing = attendanceRepository.findByCompanyIdAndEmployeeIdAndDate(companyId, employeeId, today);
            if (!existing.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "No check-in record found for today."));
            }

            Attendance record = existing.get();
            record.setCheckOut(LocalTime.now());
            return ResponseEntity.ok(attendanceRepository.save(record));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // 3. Leaves
    @GetMapping("/leaves")
    public ResponseEntity<List<LeaveRequest>> getLeaves(@RequestParam Long companyId) {
        return ResponseEntity.ok(leaveRequestRepository.findByCompanyId(companyId));
    }

    @PostMapping("/leaves")
    public ResponseEntity<LeaveRequest> submitLeaveRequest(@RequestBody LeaveRequest request) {
        request.setStatus("PENDING");
        return ResponseEntity.ok(leaveRequestRepository.save(request));
    }

    @PutMapping("/leaves/{id}/status")
    public ResponseEntity<?> updateLeaveStatus(@PathVariable Long id, @RequestParam String status) {
        Optional<LeaveRequest> opt = leaveRequestRepository.findById(id);
        if (opt.isPresent()) {
            LeaveRequest req = opt.get();
            req.setStatus(status);
            return ResponseEntity.ok(leaveRequestRepository.save(req));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Leave request not found."));
    }

    // 4. Payroll
    @GetMapping("/payroll")
    public ResponseEntity<List<PayrollSlip>> getPayroll(@RequestParam Long companyId) {
        return ResponseEntity.ok(payrollSlipRepository.findByCompanyId(companyId));
    }

    @PostMapping("/payroll/generate")
    public ResponseEntity<?> generatePayroll(@RequestParam Long companyId, @RequestParam String month, @RequestParam int year) {
        try {
            List<Employee> employees = employeeRepository.findByCompanyId(companyId);
            if (employees.isEmpty()) {
                return ResponseEntity.ok(Map.of("message", "No employees found to generate payroll."));
            }

            int generatedCount = 0;
            for (Employee emp : employees) {
                if (!emp.isActive()) continue;

                BigDecimal basic = emp.getBaseSalary() != null ? emp.getBaseSalary() : BigDecimal.ZERO;
                BigDecimal allowances = basic.multiply(BigDecimal.valueOf(0.10)).setScale(2, RoundingMode.HALF_UP); // 10%
                
                // Fetch attendance for the month to calculate deductions
                List<Attendance> attendanceList = attendanceRepository.findByCompanyId(companyId);
                long absentCount = attendanceList.stream()
                        .filter(a -> a.getEmployeeId().equals(emp.getId()))
                        .filter(a -> a.getDate().getMonth().name().equalsIgnoreCase(month) || getMonthName(a.getDate().getMonthValue()).equalsIgnoreCase(month))
                        .filter(a -> a.getDate().getYear() == year)
                        .filter(a -> "ABSENT".equalsIgnoreCase(a.getStatus()))
                        .count();

                BigDecimal absentDeduction = basic.divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(absentCount));
                
                BigDecimal standardDeduction = basic.multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP); // 5% pf/tax
                BigDecimal deductions = absentDeduction.add(standardDeduction);

                BigDecimal netSalary = basic.add(allowances).subtract(deductions);
                if (netSalary.compareTo(BigDecimal.ZERO) < 0) {
                    netSalary = BigDecimal.ZERO;
                }

                // Check if slip already exists
                Optional<PayrollSlip> existingSlip = payrollSlipRepository.findByCompanyIdAndEmployeeIdAndMonthAndYear(companyId, emp.getId(), month, year);
                PayrollSlip slip;
                if (existingSlip.isPresent()) {
                    slip = existingSlip.get();
                    slip.setBasicSalary(basic);
                    slip.setAllowances(allowances);
                    slip.setDeductions(deductions);
                    slip.setNetSalary(netSalary);
                } else {
                    slip = PayrollSlip.builder()
                            .companyId(companyId)
                            .employeeId(emp.getId())
                            .month(month)
                            .year(year)
                            .basicSalary(basic)
                            .allowances(allowances)
                            .deductions(deductions)
                            .netSalary(netSalary)
                            .status("UNPAID")
                            .build();
                }
                payrollSlipRepository.save(slip);
                generatedCount++;
            }

            return ResponseEntity.ok(Map.of("message", "Payroll generated successfully.", "count", generatedCount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    private String getMonthName(int m) {
        String[] months = {"", "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"};
        if (m >= 1 && m <= 12) return months[m];
        return "";
    }
}
