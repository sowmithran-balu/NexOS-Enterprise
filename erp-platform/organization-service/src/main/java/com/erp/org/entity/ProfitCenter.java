package com.erp.org.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.time.LocalDateTime;

@Entity
@Table(name = "profit_centers")
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class ProfitCenter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String code; // e.g., PC-EAST-01

    private String description;

    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ProfitCenter() {}

    public ProfitCenter(Long id, Long companyId, String name, String code, String description, boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.companyId = companyId;
        this.name = name;
        this.code = code;
        this.description = description;
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
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static ProfitCenterBuilder builder() {
        return new ProfitCenterBuilder();
    }

    public static class ProfitCenterBuilder {
        private Long id;
        private Long companyId;
        private String name;
        private String code;
        private String description;
        private boolean active = true;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        ProfitCenterBuilder() {}

        public ProfitCenterBuilder id(Long id) { this.id = id; return this; }
        public ProfitCenterBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public ProfitCenterBuilder name(String name) { this.name = name; return this; }
        public ProfitCenterBuilder code(String code) { this.code = code; return this; }
        public ProfitCenterBuilder description(String description) { this.description = description; return this; }
        public ProfitCenterBuilder active(boolean active) { this.active = active; return this; }
        public ProfitCenterBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ProfitCenterBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public ProfitCenter build() {
            return new ProfitCenter(id, companyId, name, code, description, active, createdAt, updatedAt);
        }
    }
}
