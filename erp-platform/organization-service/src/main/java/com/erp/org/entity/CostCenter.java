package com.erp.org.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.time.LocalDateTime;

@Entity
@Table(name = "cost_centers")
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class CostCenter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String code; // e.g., CC-HR-01, CC-PROD-02

    private String description;

    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CostCenter() {}

    public CostCenter(Long id, Long companyId, String name, String code, String description, boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
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
    public static CostCenterBuilder builder() {
        return new CostCenterBuilder();
    }

    public static class CostCenterBuilder {
        private Long id;
        private Long companyId;
        private String name;
        private String code;
        private String description;
        private boolean active = true;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        CostCenterBuilder() {}

        public CostCenterBuilder id(Long id) { this.id = id; return this; }
        public CostCenterBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public CostCenterBuilder name(String name) { this.name = name; return this; }
        public CostCenterBuilder code(String code) { this.code = code; return this; }
        public CostCenterBuilder description(String description) { this.description = description; return this; }
        public CostCenterBuilder active(boolean active) { this.active = active; return this; }
        public CostCenterBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public CostCenterBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public CostCenter build() {
            return new CostCenter(id, companyId, name, code, description, active, createdAt, updatedAt);
        }
    }
}
