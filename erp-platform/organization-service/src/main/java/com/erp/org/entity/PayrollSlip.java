package com.erp.org.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll_slips")
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class PayrollSlip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "slip_month", nullable = false)
    private String month;

    @Column(name = "slip_year", nullable = false)
    private int year;

    @Column(name = "basic_salary", precision = 15, scale = 2, nullable = false)
    private BigDecimal basicSalary = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal allowances = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal deductions = BigDecimal.ZERO;

    @Column(name = "net_salary", precision = 15, scale = 2, nullable = false)
    private BigDecimal netSalary = BigDecimal.ZERO;

    @Column(nullable = false)
    private String status = "UNPAID"; // PAID, UNPAID

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public PayrollSlip() {}

    public PayrollSlip(Long id, Long companyId, Long employeeId, String month, int year, 
                       BigDecimal basicSalary, BigDecimal allowances, BigDecimal deductions, 
                       BigDecimal netSalary, String status, LocalDateTime createdAt) {
        this.id = id;
        this.companyId = companyId;
        this.employeeId = employeeId;
        this.month = month;
        this.year = year;
        this.basicSalary = basicSalary != null ? basicSalary : BigDecimal.ZERO;
        this.allowances = allowances != null ? allowances : BigDecimal.ZERO;
        this.deductions = deductions != null ? deductions : BigDecimal.ZERO;
        this.netSalary = netSalary != null ? netSalary : BigDecimal.ZERO;
        this.status = status != null ? status : "UNPAID";
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }
    public BigDecimal getBasicSalary() { return basicSalary; }
    public void setBasicSalary(BigDecimal basicSalary) { this.basicSalary = basicSalary; }
    public BigDecimal getAllowances() { return allowances; }
    public void setAllowances(BigDecimal allowances) { this.allowances = allowances; }
    public BigDecimal getDeductions() { return deductions; }
    public void setDeductions(BigDecimal deductions) { this.deductions = deductions; }
    public BigDecimal getNetSalary() { return netSalary; }
    public void setNetSalary(BigDecimal netSalary) { this.netSalary = netSalary; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static PayrollSlipBuilder builder() {
        return new PayrollSlipBuilder();
    }

    public static class PayrollSlipBuilder {
        private Long id;
        private Long companyId;
        private Long employeeId;
        private String month;
        private int year;
        private BigDecimal basicSalary = BigDecimal.ZERO;
        private BigDecimal allowances = BigDecimal.ZERO;
        private BigDecimal deductions = BigDecimal.ZERO;
        private BigDecimal netSalary = BigDecimal.ZERO;
        private String status = "UNPAID";
        private LocalDateTime createdAt;

        PayrollSlipBuilder() {}

        public PayrollSlipBuilder id(Long id) { this.id = id; return this; }
        public PayrollSlipBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public PayrollSlipBuilder employeeId(Long employeeId) { this.employeeId = employeeId; return this; }
        public PayrollSlipBuilder month(String month) { this.month = month; return this; }
        public PayrollSlipBuilder year(int year) { this.year = year; return this; }
        public PayrollSlipBuilder basicSalary(BigDecimal basicSalary) { this.basicSalary = basicSalary; return this; }
        public PayrollSlipBuilder allowances(BigDecimal allowances) { this.allowances = allowances; return this; }
        public PayrollSlipBuilder deductions(BigDecimal deductions) { this.deductions = deductions; return this; }
        public PayrollSlipBuilder netSalary(BigDecimal netSalary) { this.netSalary = netSalary; return this; }
        public PayrollSlipBuilder status(String status) { this.status = status; return this; }
        public PayrollSlipBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public PayrollSlip build() {
            return new PayrollSlip(id, companyId, employeeId, month, year, basicSalary, allowances, deductions, netSalary, status, createdAt);
        }
    }
}
