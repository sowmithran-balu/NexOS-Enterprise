package com.erp.org.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import java.time.LocalDateTime;

@Entity
@Table(name = "branches")
@FilterDef(name = "companyFilter", parameters = @ParamDef(name = "companyId", type = Long.class))
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class Branch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String code; // e.g., NY-01, LON-02

    private String address;
    private String phone;
    private String email;

    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Branch() {}

    public Branch(Long id, Long companyId, String name, String code, String address, String phone, String email, boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.companyId = companyId;
        this.name = name;
        this.code = code;
        this.address = address;
        this.phone = phone;
        this.email = email;
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
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static BranchBuilder builder() {
        return new BranchBuilder();
    }

    public static class BranchBuilder {
        private Long id;
        private Long companyId;
        private String name;
        private String code;
        private String address;
        private String phone;
        private String email;
        private boolean active = true;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        BranchBuilder() {}

        public BranchBuilder id(Long id) { this.id = id; return this; }
        public BranchBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public BranchBuilder name(String name) { this.name = name; return this; }
        public BranchBuilder code(String code) { this.code = code; return this; }
        public BranchBuilder address(String address) { this.address = address; return this; }
        public BranchBuilder phone(String phone) { this.phone = phone; return this; }
        public BranchBuilder email(String email) { this.email = email; return this; }
        public BranchBuilder active(boolean active) { this.active = active; return this; }
        public BranchBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public BranchBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Branch build() {
            return new Branch(id, companyId, name, code, address, phone, email, active, createdAt, updatedAt);
        }
    }
}
