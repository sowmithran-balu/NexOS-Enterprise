package com.erp.org.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import java.time.LocalDateTime;

@Entity
@Table(name = "departments")
@FilterDef(name = "branchFilter", parameters = @ParamDef(name = "branchId", type = Long.class))
@Filter(name = "companyFilter", condition = "company_id = :companyId")
@Filter(name = "branchFilter", condition = "branch_id = :branchId")
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(name = "parent_department_id")
    private Long parentDepartmentId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String code; // e.g., HR, RND, MKT

    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Department() {}

    public Department(Long id, Long companyId, Long branchId, Long parentDepartmentId, String name, String code, boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.companyId = companyId;
        this.branchId = branchId;
        this.parentDepartmentId = parentDepartmentId;
        this.name = name;
        this.code = code;
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
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public Long getParentDepartmentId() { return parentDepartmentId; }
    public void setParentDepartmentId(Long parentDepartmentId) { this.parentDepartmentId = parentDepartmentId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static DepartmentBuilder builder() {
        return new DepartmentBuilder();
    }

    public static class DepartmentBuilder {
        private Long id;
        private Long companyId;
        private Long branchId;
        private Long parentDepartmentId;
        private String name;
        private String code;
        private boolean active = true;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        DepartmentBuilder() {}

        public DepartmentBuilder id(Long id) { this.id = id; return this; }
        public DepartmentBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public DepartmentBuilder branchId(Long branchId) { this.branchId = branchId; return this; }
        public DepartmentBuilder parentDepartmentId(Long parentDepartmentId) { this.parentDepartmentId = parentDepartmentId; return this; }
        public DepartmentBuilder name(String name) { this.name = name; return this; }
        public DepartmentBuilder code(String code) { this.code = code; return this; }
        public DepartmentBuilder active(boolean active) { this.active = active; return this; }
        public DepartmentBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public DepartmentBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Department build() {
            return new Department(id, companyId, branchId, parentDepartmentId, name, code, active, createdAt, updatedAt);
        }
    }
}
