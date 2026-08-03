package com.erp.auth.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "crm_leads")
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class CrmLead {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(nullable = false)
    private String name; // Lead name (or Company Name)

    @Column(name = "contact_person")
    private String contactPerson;

    private String email;
    private String phone;

    @Column(nullable = false)
    private String status = "NEW"; // NEW, CONTACTED, QUOTED, WON, LOST

    @Column(name = "lead_value", precision = 15, scale = 2)
    private BigDecimal value = BigDecimal.ZERO; // Estimated deal value

    @Column(name = "last_follow_up_date")
    private LocalDate lastFollowUpDate;

    @Column(name = "next_follow_up_date")
    private LocalDate nextFollowUpDate;

    @Column(length = 2000)
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CrmLead() {}

    public CrmLead(Long id, Long companyId, String name, String contactPerson, String email, String phone, String status, BigDecimal value, LocalDate lastFollowUpDate, LocalDate nextFollowUpDate, String notes, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.companyId = companyId;
        this.name = name;
        this.contactPerson = contactPerson;
        this.email = email;
        this.phone = phone;
        this.status = status != null ? status : "NEW";
        this.value = value != null ? value : BigDecimal.ZERO;
        this.lastFollowUpDate = lastFollowUpDate;
        this.nextFollowUpDate = nextFollowUpDate;
        this.notes = notes;
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
    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getValue() { return value; }
    public void setValue(BigDecimal value) { this.value = value; }
    public LocalDate getLastFollowUpDate() { return lastFollowUpDate; }
    public void setLastFollowUpDate(LocalDate lastFollowUpDate) { this.lastFollowUpDate = lastFollowUpDate; }
    public LocalDate getNextFollowUpDate() { return nextFollowUpDate; }
    public void setNextFollowUpDate(LocalDate nextFollowUpDate) { this.nextFollowUpDate = nextFollowUpDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static CrmLeadBuilder builder() {
        return new CrmLeadBuilder();
    }

    public static class CrmLeadBuilder {
        private Long id;
        private Long companyId;
        private String name;
        private String contactPerson;
        private String email;
        private String phone;
        private String status = "NEW";
        private BigDecimal value = BigDecimal.ZERO;
        private LocalDate lastFollowUpDate;
        private LocalDate nextFollowUpDate;
        private String notes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        CrmLeadBuilder() {}

        public CrmLeadBuilder id(Long id) { this.id = id; return this; }
        public CrmLeadBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public CrmLeadBuilder name(String name) { this.name = name; return this; }
        public CrmLeadBuilder contactPerson(String contactPerson) { this.contactPerson = contactPerson; return this; }
        public CrmLeadBuilder email(String email) { this.email = email; return this; }
        public CrmLeadBuilder phone(String phone) { this.phone = phone; return this; }
        public CrmLeadBuilder status(String status) { this.status = status; return this; }
        public CrmLeadBuilder value(BigDecimal value) { this.value = value; return this; }
        public CrmLeadBuilder lastFollowUpDate(LocalDate lastFollowUpDate) { this.lastFollowUpDate = lastFollowUpDate; return this; }
        public CrmLeadBuilder nextFollowUpDate(LocalDate nextFollowUpDate) { this.nextFollowUpDate = nextFollowUpDate; return this; }
        public CrmLeadBuilder notes(String notes) { this.notes = notes; return this; }
        public CrmLeadBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public CrmLeadBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public CrmLead build() {
            return new CrmLead(id, companyId, name, contactPerson, email, phone, status, value, lastFollowUpDate, nextFollowUpDate, notes, createdAt, updatedAt);
        }
    }
}
