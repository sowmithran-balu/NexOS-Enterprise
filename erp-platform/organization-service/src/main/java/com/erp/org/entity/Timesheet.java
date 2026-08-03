package com.erp.org.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "timesheets")
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class Timesheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "task_id", nullable = false)
    private Long taskId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "hours_logged", precision = 5, scale = 2, nullable = false)
    private BigDecimal hoursLogged = BigDecimal.ZERO;

    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Timesheet() {}

    public Timesheet(Long id, Long companyId, Long employeeId, Long taskId, LocalDate date, BigDecimal hoursLogged, String description, LocalDateTime createdAt) {
        this.id = id;
        this.companyId = companyId;
        this.employeeId = employeeId;
        this.taskId = taskId;
        this.date = date;
        this.hoursLogged = hoursLogged != null ? hoursLogged : BigDecimal.ZERO;
        this.description = description;
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
    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public BigDecimal getHoursLogged() { return hoursLogged; }
    public void setHoursLogged(BigDecimal hoursLogged) { this.hoursLogged = hoursLogged; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static TimesheetBuilder builder() {
        return new TimesheetBuilder();
    }

    public static class TimesheetBuilder {
        private Long id;
        private Long companyId;
        private Long employeeId;
        private Long taskId;
        private LocalDate date;
        private BigDecimal hoursLogged = BigDecimal.ZERO;
        private String description;
        private LocalDateTime createdAt;

        TimesheetBuilder() {}

        public TimesheetBuilder id(Long id) { this.id = id; return this; }
        public TimesheetBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public TimesheetBuilder employeeId(Long employeeId) { this.employeeId = employeeId; return this; }
        public TimesheetBuilder taskId(Long taskId) { this.taskId = taskId; return this; }
        public TimesheetBuilder date(LocalDate date) { this.date = date; return this; }
        public TimesheetBuilder hoursLogged(BigDecimal hoursLogged) { this.hoursLogged = hoursLogged; return this; }
        public TimesheetBuilder description(String description) { this.description = description; return this; }
        public TimesheetBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Timesheet build() {
            return new Timesheet(id, companyId, employeeId, taskId, date, hoursLogged, description, createdAt);
        }
    }
}
