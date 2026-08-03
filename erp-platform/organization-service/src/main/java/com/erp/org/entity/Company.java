package com.erp.org.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "tax_id")
    private String taxId;

    @Column(name = "registration_number")
    private String registrationNumber;

    private String currency; // e.g., USD, EUR, INR
    
    @Column(name = "time_zone")
    private String timeZone; // e.g., UTC, America/New_York, Asia/Kolkata
    
    private String language; // e.g., en, es, fr

    private String address;

    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Company() {}

    public Company(Long id, String name, String taxId, String registrationNumber, String currency, String timeZone, String language, String address, boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.taxId = taxId;
        this.registrationNumber = registrationNumber;
        this.currency = currency;
        this.timeZone = timeZone;
        this.language = language;
        this.address = address;
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
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }
    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getTimeZone() { return timeZone; }
    public void setTimeZone(String timeZone) { this.timeZone = timeZone; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder Pattern
    public static CompanyBuilder builder() {
        return new CompanyBuilder();
    }

    public static class CompanyBuilder {
        private Long id;
        private String name;
        private String taxId;
        private String registrationNumber;
        private String currency;
        private String timeZone;
        private String language;
        private String address;
        private boolean active = true;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        CompanyBuilder() {}

        public CompanyBuilder id(Long id) { this.id = id; return this; }
        public CompanyBuilder name(String name) { this.name = name; return this; }
        public CompanyBuilder taxId(String taxId) { this.taxId = taxId; return this; }
        public CompanyBuilder registrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; return this; }
        public CompanyBuilder currency(String currency) { this.currency = currency; return this; }
        public CompanyBuilder timeZone(String timeZone) { this.timeZone = timeZone; return this; }
        public CompanyBuilder language(String language) { this.language = language; return this; }
        public CompanyBuilder address(String address) { this.address = address; return this; }
        public CompanyBuilder active(boolean active) { this.active = active; return this; }
        public CompanyBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public CompanyBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Company build() {
            return new Company(id, name, taxId, registrationNumber, currency, timeZone, language, address, active, createdAt, updatedAt);
        }
    }
}
