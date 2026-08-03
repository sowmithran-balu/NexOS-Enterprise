package com.erp.auth.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id")
    private Long companyId;

    @Column(name = "user_id")
    private Long userId;

    private String username;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(nullable = false)
    private String action; // e.g., LOGIN_SUCCESS, USER_REGISTER, CREATE_COMPANY

    @Column(nullable = false)
    private String module; // e.g., AUTH, ORG, HR

    @Column(length = 2000)
    private String details;

    @Column(nullable = false)
    private String status; // SUCCESS, FAILURE

    @Column(nullable = false, name = "event_timestamp")
    private LocalDateTime timestamp;

    public AuditLog() {}

    public AuditLog(Long id, Long companyId, Long userId, String username, String ipAddress, String action, String module, String details, String status, LocalDateTime timestamp) {
        this.id = id;
        this.companyId = companyId;
        this.userId = userId;
        this.username = username;
        this.ipAddress = ipAddress;
        this.action = action;
        this.module = module;
        this.details = details;
        this.status = status;
        this.timestamp = timestamp;
    }

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getModule() { return module; }
    public void setModule(String module) { this.module = module; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    // Builder
    public static AuditLogBuilder builder() {
        return new AuditLogBuilder();
    }

    public static class AuditLogBuilder {
        private Long id;
        private Long companyId;
        private Long userId;
        private String username;
        private String ipAddress;
        private String action;
        private String module;
        private String details;
        private String status;
        private LocalDateTime timestamp;

        AuditLogBuilder() {}

        public AuditLogBuilder id(Long id) { this.id = id; return this; }
        public AuditLogBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public AuditLogBuilder userId(Long userId) { this.userId = userId; return this; }
        public AuditLogBuilder username(String username) { this.username = username; return this; }
        public AuditLogBuilder ipAddress(String ipAddress) { this.ipAddress = ipAddress; return this; }
        public AuditLogBuilder action(String action) { this.action = action; return this; }
        public AuditLogBuilder module(String module) { this.module = module; return this; }
        public AuditLogBuilder details(String details) { this.details = details; return this; }
        public AuditLogBuilder status(String status) { this.status = status; return this; }
        public AuditLogBuilder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }

        public AuditLog build() {
            return new AuditLog(id, companyId, userId, username, ipAddress, action, module, details, status, timestamp);
        }
    }
}
