package com.erp.org.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fiscal_years")
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class FiscalYear {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(nullable = false)
    private String name; // e.g., FY-2026

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private String status; // e.g., OPEN, CLOSED

    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public FiscalYear() {}

    public FiscalYear(Long id, Long companyId, String name, LocalDate startDate, LocalDate endDate, String status, boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.companyId = companyId;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public boolean active() { return active; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static FiscalYearBuilder builder() {
        return new FiscalYearBuilder();
    }

    public static class FiscalYearBuilder {
        private Long id;
        private Long companyId;
        private String name;
        private LocalDate startDate;
        private LocalDate endDate;
        private String status;
        private boolean active = true;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        FiscalYearBuilder() {}

        public FiscalYearBuilder id(Long id) { this.id = id; return this; }
        public FiscalYearBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public FiscalYearBuilder name(String name) { this.name = name; return this; }
        public FiscalYearBuilder startDate(LocalDate startDate) { this.startDate = startDate; return this; }
        public FiscalYearBuilder endDate(LocalDate endDate) { this.endDate = endDate; return this; }
        public FiscalYearBuilder status(String status) { this.status = status; return this; }
        public FiscalYearBuilder active(boolean active) { this.active = active; return this; }
        public FiscalYearBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public FiscalYearBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public FiscalYear build() {
            return new FiscalYear(id, companyId, name, startDate, endDate, status, active, createdAt, updatedAt);
        }
    }
}
