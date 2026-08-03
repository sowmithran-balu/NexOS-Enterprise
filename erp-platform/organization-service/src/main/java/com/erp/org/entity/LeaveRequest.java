package com.erp.org.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_requests")
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class LeaveRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private String type = "CASUAL"; // SICK, CASUAL, ANNUAL

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    private String reason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public LeaveRequest() {}

    public LeaveRequest(Long id, Long companyId, Long employeeId, LocalDate startDate, LocalDate endDate, String type, String status, String reason, LocalDateTime createdAt) {
        this.id = id;
        this.companyId = companyId;
        this.employeeId = employeeId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.type = type != null ? type : "CASUAL";
        this.status = status != null ? status : "PENDING";
        this.reason = reason;
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
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static LeaveRequestBuilder builder() {
        return new LeaveRequestBuilder();
    }

    public static class LeaveRequestBuilder {
        private Long id;
        private Long companyId;
        private Long employeeId;
        private LocalDate startDate;
        private LocalDate endDate;
        private String type = "CASUAL";
        private String status = "PENDING";
        private String reason;
        private LocalDateTime createdAt;

        LeaveRequestBuilder() {}

        public LeaveRequestBuilder id(Long id) { this.id = id; return this; }
        public LeaveRequestBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public LeaveRequestBuilder employeeId(Long employeeId) { this.employeeId = employeeId; return this; }
        public LeaveRequestBuilder startDate(LocalDate startDate) { this.startDate = startDate; return this; }
        public LeaveRequestBuilder endDate(LocalDate endDate) { this.endDate = endDate; return this; }
        public LeaveRequestBuilder type(String type) { this.type = type; return this; }
        public LeaveRequestBuilder status(String status) { this.status = status; return this; }
        public LeaveRequestBuilder reason(String reason) { this.reason = reason; return this; }
        public LeaveRequestBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public LeaveRequest build() {
            return new LeaveRequest(id, companyId, employeeId, startDate, endDate, type, status, reason, createdAt);
        }
    }
}
