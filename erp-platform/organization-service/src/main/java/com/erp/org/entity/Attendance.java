package com.erp.org.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_records")
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "check_in")
    private LocalTime checkIn;

    @Column(name = "check_out")
    private LocalTime checkOut;

    @Column(nullable = false)
    private String status = "PRESENT"; // PRESENT, ABSENT, LATE

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Attendance() {}

    public Attendance(Long id, Long companyId, Long employeeId, LocalDate date, LocalTime checkIn, LocalTime checkOut, String status, LocalDateTime createdAt) {
        this.id = id;
        this.companyId = companyId;
        this.employeeId = employeeId;
        this.date = date;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.status = status != null ? status : "PRESENT";
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
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalTime getCheckIn() { return checkIn; }
    public void setCheckIn(LocalTime checkIn) { this.checkIn = checkIn; }
    public LocalTime getCheckOut() { return checkOut; }
    public void setCheckOut(LocalTime checkOut) { this.checkOut = checkOut; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static AttendanceBuilder builder() {
        return new AttendanceBuilder();
    }

    public static class AttendanceBuilder {
        private Long id;
        private Long companyId;
        private Long employeeId;
        private LocalDate date;
        private LocalTime checkIn;
        private LocalTime checkOut;
        private String status = "PRESENT";
        private LocalDateTime createdAt;

        AttendanceBuilder() {}

        public AttendanceBuilder id(Long id) { this.id = id; return this; }
        public AttendanceBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public AttendanceBuilder employeeId(Long employeeId) { this.employeeId = employeeId; return this; }
        public AttendanceBuilder date(LocalDate date) { this.date = date; return this; }
        public AttendanceBuilder checkIn(LocalTime checkIn) { this.checkIn = checkIn; return this; }
        public AttendanceBuilder checkOut(LocalTime checkOut) { this.checkOut = checkOut; return this; }
        public AttendanceBuilder status(String status) { this.status = status; return this; }
        public AttendanceBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Attendance build() {
            return new Attendance(id, companyId, employeeId, date, checkIn, checkOut, status, createdAt);
        }
    }
}
