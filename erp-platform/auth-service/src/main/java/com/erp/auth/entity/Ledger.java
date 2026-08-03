package com.erp.auth.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ledgers")
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class Ledger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String code; // Auto-generated account code

    @Column(nullable = false)
    private String type; // CUSTOMER, SUPPLIER, BANK, CASH, EXPENSE, INCOME

    @Column(name = "group_id")
    private Long groupId; // Reference to LedgerGroup id

    private String email;
    private String phone;

    @Column(name = "tax_id")
    private String taxId; // e.g. GSTIN

    @Column(name = "opening_balance", precision = 15, scale = 2)
    private BigDecimal openingBalance = BigDecimal.ZERO;

    @Column(name = "opening_balance_type")
    private String openingBalanceType = "DEBIT"; // DEBIT or CREDIT

    @Column(name = "current_balance", precision = 15, scale = 2)
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @Column(name = "credit_limit", precision = 15, scale = 2)
    private BigDecimal creditLimit = BigDecimal.ZERO;

    @Column(name = "price_category")
    private String priceCategory = "RETAIL"; // RETAIL, WHOLESALE, DEALER

    @Column(name = "gst_registration_type")
    private String gstRegistrationType = "UNREGISTERED"; // REGULAR, COMPOSITION, UNREGISTERED, CONSUMER

    private String pan; // Permanent Account Number (statutory)

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "ifsc_code")
    private String ifscCode;

    @Column(name = "bank_branch")
    private String bankBranch;

    @Column(name = "custom_fields", length = 2000)
    private String customFields; // Custom metadata as text/JSON

    @Column(name = "branch_visibility")
    private String branchVisibility; // Comma-separated branch IDs or null for all branches

    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Ledger() {}

    public Ledger(Long id, Long companyId, String name, String code, String type, Long groupId, String email, String phone, String taxId, BigDecimal openingBalance, String openingBalanceType, BigDecimal currentBalance, BigDecimal creditLimit, String priceCategory, String gstRegistrationType, String pan, String bankName, String accountNumber, String ifscCode, String bankBranch, String customFields, String branchVisibility, boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.companyId = companyId;
        this.name = name;
        this.code = code;
        this.type = type;
        this.groupId = groupId;
        this.email = email;
        this.phone = phone;
        this.taxId = taxId;
        this.openingBalance = openingBalance != null ? openingBalance : BigDecimal.ZERO;
        this.openingBalanceType = openingBalanceType != null ? openingBalanceType : "DEBIT";
        this.currentBalance = currentBalance != null ? currentBalance : BigDecimal.ZERO;
        this.creditLimit = creditLimit != null ? creditLimit : BigDecimal.ZERO;
        this.priceCategory = priceCategory != null ? priceCategory : "RETAIL";
        this.gstRegistrationType = gstRegistrationType != null ? gstRegistrationType : "UNREGISTERED";
        this.pan = pan;
        this.bankName = bankName;
        this.accountNumber = accountNumber;
        this.ifscCode = ifscCode;
        this.bankBranch = bankBranch;
        this.customFields = customFields;
        this.branchVisibility = branchVisibility;
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
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }
    public BigDecimal getOpeningBalance() { return openingBalance; }
    public void setOpeningBalance(BigDecimal openingBalance) { this.openingBalance = openingBalance; }
    public String getOpeningBalanceType() { return openingBalanceType; }
    public void setOpeningBalanceType(String openingBalanceType) { this.openingBalanceType = openingBalanceType; }
    public BigDecimal getCurrentBalance() { return currentBalance; }
    public void setCurrentBalance(BigDecimal currentBalance) { this.currentBalance = currentBalance; }
    public BigDecimal getCreditLimit() { return creditLimit; }
    public void setCreditLimit(BigDecimal creditLimit) { this.creditLimit = creditLimit; }
    public String getPriceCategory() { return priceCategory; }
    public void setPriceCategory(String priceCategory) { this.priceCategory = priceCategory; }
    public String getGstRegistrationType() { return gstRegistrationType; }
    public void setGstRegistrationType(String gstRegistrationType) { this.gstRegistrationType = gstRegistrationType; }
    public String getPan() { return pan; }
    public void setPan(String pan) { this.pan = pan; }
    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    public String getIfscCode() { return ifscCode; }
    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }
    public String getBankBranch() { return bankBranch; }
    public void setBankBranch(String bankBranch) { this.bankBranch = bankBranch; }
    public String getCustomFields() { return customFields; }
    public void setCustomFields(String customFields) { this.customFields = customFields; }
    public String getBranchVisibility() { return branchVisibility; }
    public void setBranchVisibility(String branchVisibility) { this.branchVisibility = branchVisibility; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static LedgerBuilder builder() {
        return new LedgerBuilder();
    }

    public static class LedgerBuilder {
        private Long id;
        private Long companyId;
        private String name;
        private String code;
        private String type;
        private Long groupId;
        private String email;
        private String phone;
        private String taxId;
        private BigDecimal openingBalance = BigDecimal.ZERO;
        private String openingBalanceType = "DEBIT";
        private BigDecimal currentBalance = BigDecimal.ZERO;
        private BigDecimal creditLimit = BigDecimal.ZERO;
        private String priceCategory = "RETAIL";
        private String gstRegistrationType = "UNREGISTERED";
        private String pan;
        private String bankName;
        private String accountNumber;
        private String ifscCode;
        private String bankBranch;
        private String customFields;
        private String branchVisibility;
        private boolean active = true;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        LedgerBuilder() {}

        public LedgerBuilder id(Long id) { this.id = id; return this; }
        public LedgerBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public LedgerBuilder name(String name) { this.name = name; return this; }
        public LedgerBuilder code(String code) { this.code = code; return this; }
        public LedgerBuilder type(String type) { this.type = type; return this; }
        public LedgerBuilder groupId(Long groupId) { this.groupId = groupId; return this; }
        public LedgerBuilder email(String email) { this.email = email; return this; }
        public LedgerBuilder phone(String phone) { this.phone = phone; return this; }
        public LedgerBuilder taxId(String taxId) { this.taxId = taxId; return this; }
        public LedgerBuilder openingBalance(BigDecimal openingBalance) { this.openingBalance = openingBalance; return this; }
        public LedgerBuilder openingBalanceType(String openingBalanceType) { this.openingBalanceType = openingBalanceType; return this; }
        public LedgerBuilder currentBalance(BigDecimal currentBalance) { this.currentBalance = currentBalance; return this; }
        public LedgerBuilder creditLimit(BigDecimal creditLimit) { this.creditLimit = creditLimit; return this; }
        public LedgerBuilder priceCategory(String priceCategory) { this.priceCategory = priceCategory; return this; }
        public LedgerBuilder gstRegistrationType(String gstRegistrationType) { this.gstRegistrationType = gstRegistrationType; return this; }
        public LedgerBuilder pan(String pan) { this.pan = pan; return this; }
        public LedgerBuilder bankName(String bankName) { this.bankName = bankName; return this; }
        public LedgerBuilder accountNumber(String accountNumber) { this.accountNumber = accountNumber; return this; }
        public LedgerBuilder ifscCode(String ifscCode) { this.ifscCode = ifscCode; return this; }
        public LedgerBuilder bankBranch(String bankBranch) { this.bankBranch = bankBranch; return this; }
        public LedgerBuilder customFields(String customFields) { this.customFields = customFields; return this; }
        public LedgerBuilder branchVisibility(String branchVisibility) { this.branchVisibility = branchVisibility; return this; }
        public LedgerBuilder active(boolean active) { this.active = active; return this; }
        public LedgerBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public LedgerBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Ledger build() {
            return new Ledger(id, companyId, name, code, type, groupId, email, phone, taxId, openingBalance, openingBalanceType, currentBalance, creditLimit, priceCategory, gstRegistrationType, pan, bankName, accountNumber, ifscCode, bankBranch, customFields, branchVisibility, active, createdAt, updatedAt);
        }
    }
}
