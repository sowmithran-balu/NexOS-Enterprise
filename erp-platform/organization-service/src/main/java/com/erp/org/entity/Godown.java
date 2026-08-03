package com.erp.org.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.time.LocalDateTime;

@Entity
@Table(name = "godowns")
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class Godown {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(nullable = false)
    private String name;

    private String location;
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Godown() {}

    public Godown(Long id, Long companyId, String name, String location, boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.companyId = companyId;
        this.name = name;
        this.location = location;
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
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static GodownBuilder builder() {
        return new GodownBuilder();
    }

    public static class GodownBuilder {
        private Long id;
        private Long companyId;
        private String name;
        private String location;
        private boolean active = true;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        GodownBuilder() {}

        public GodownBuilder id(Long id) { this.id = id; return this; }
        public GodownBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public GodownBuilder name(String name) { this.name = name; return this; }
        public GodownBuilder location(String location) { this.location = location; return this; }
        public GodownBuilder active(boolean active) { this.active = active; return this; }
        public GodownBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public GodownBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Godown build() {
            return new Godown(id, companyId, name, location, active, createdAt, updatedAt);
        }
    }
}
