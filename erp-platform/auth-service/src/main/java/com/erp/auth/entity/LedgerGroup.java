package com.erp.auth.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.time.LocalDateTime;

@Entity
@Table(name = "ledger_groups")
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class LedgerGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code; // Auto-generated group code

    @Column(name = "parent_group_id")
    private Long parentGroupId; // Self-referencing parent ID (nullable for top-level groups like Assets)

    @Column(nullable = false)
    private String type; // ASSET, LIABILITY, INCOME, EXPENSE, EQUITY

    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public LedgerGroup() {}

    public LedgerGroup(Long id, Long companyId, String name, String code, Long parentGroupId, String type, boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.companyId = companyId;
        this.name = name;
        this.code = code;
        this.parentGroupId = parentGroupId;
        this.type = type;
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
    public Long getParentGroupId() { return parentGroupId; }
    public void setParentGroupId(Long parentGroupId) { this.parentGroupId = parentGroupId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static LedgerGroupBuilder builder() {
        return new LedgerGroupBuilder();
    }

    public static class LedgerGroupBuilder {
        private Long id;
        private Long companyId;
        private String name;
        private String code;
        private Long parentGroupId;
        private String type;
        private boolean active = true;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        LedgerGroupBuilder() {}

        public LedgerGroupBuilder id(Long id) { this.id = id; return this; }
        public LedgerGroupBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public LedgerGroupBuilder name(String name) { this.name = name; return this; }
        public LedgerGroupBuilder code(String code) { this.code = code; return this; }
        public LedgerGroupBuilder parentGroupId(Long parentGroupId) { this.parentGroupId = parentGroupId; return this; }
        public LedgerGroupBuilder type(String type) { this.type = type; return this; }
        public LedgerGroupBuilder active(boolean active) { this.active = active; return this; }
        public LedgerGroupBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public LedgerGroupBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public LedgerGroup build() {
            return new LedgerGroup(id, companyId, name, code, parentGroupId, type, active, createdAt, updatedAt);
        }
    }
}
