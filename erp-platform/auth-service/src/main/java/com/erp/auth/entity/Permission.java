package com.erp.auth.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "permissions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"module", "action"})
})
public class Permission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String module; // e.g., ORG, HR, SALES, INVENTORY, FINANCE

    @Column(nullable = false)
    private String action; // e.g., READ, WRITE, DELETE, APPROVE

    private String description;

    public Permission() {}

    public Permission(Long id, String module, String action, String description) {
        this.id = id;
        this.module = module;
        this.action = action;
        this.description = description;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getModule() { return module; }
    public void setModule(String module) { this.module = module; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    // Builder
    public static PermissionBuilder builder() {
        return new PermissionBuilder();
    }

    public static class PermissionBuilder {
        private Long id;
        private String module;
        private String action;
        private String description;

        PermissionBuilder() {}

        public PermissionBuilder id(Long id) { this.id = id; return this; }
        public PermissionBuilder module(String module) { this.module = module; return this; }
        public PermissionBuilder action(String action) { this.action = action; return this; }
        public PermissionBuilder description(String description) { this.description = description; return this; }

        public Permission build() {
            return new Permission(id, module, action, description);
        }
    }
}
