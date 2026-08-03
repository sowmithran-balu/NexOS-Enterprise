package com.erp.auth.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "journal_entries")
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class JournalEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "voucher_id")
    private Long voucherId; // Optional link to source voucher

    @Column(name = "profit_centre_id")
    private Long profitCentreId; // Cost Center (Profit Centre) link

    @Column(name = "ledger_id", nullable = false)
    private Long ledgerId; // Link to ledger account

    @Column(name = "debit_amount", precision = 15, scale = 2)
    private BigDecimal debitAmount = BigDecimal.ZERO;

    @Column(name = "credit_amount", precision = 15, scale = 2)
    private BigDecimal creditAmount = BigDecimal.ZERO;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    private String narration;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public JournalEntry() {}

    public JournalEntry(Long id, Long companyId, Long voucherId, Long profitCentreId, Long ledgerId, BigDecimal debitAmount, BigDecimal creditAmount, LocalDate entryDate, String narration, LocalDateTime createdAt) {
        this.id = id;
        this.companyId = companyId;
        this.voucherId = voucherId;
        this.profitCentreId = profitCentreId;
        this.ledgerId = ledgerId;
        this.debitAmount = debitAmount != null ? debitAmount : BigDecimal.ZERO;
        this.creditAmount = creditAmount != null ? creditAmount : BigDecimal.ZERO;
        this.entryDate = entryDate;
        this.narration = narration;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public Long getVoucherId() { return voucherId; }
    public void setVoucherId(Long voucherId) { this.voucherId = voucherId; }
    public Long getProfitCentreId() { return profitCentreId; }
    public void setProfitCentreId(Long profitCentreId) { this.profitCentreId = profitCentreId; }
    public Long getLedgerId() { return ledgerId; }
    public void setLedgerId(Long ledgerId) { this.ledgerId = ledgerId; }
    public BigDecimal getDebitAmount() { return debitAmount; }
    public void setDebitAmount(BigDecimal debitAmount) { this.debitAmount = debitAmount; }
    public BigDecimal getCreditAmount() { return creditAmount; }
    public void setCreditAmount(BigDecimal creditAmount) { this.creditAmount = creditAmount; }
    public LocalDate getEntryDate() { return entryDate; }
    public void setEntryDate(LocalDate entryDate) { this.entryDate = entryDate; }
    public String getNarration() { return narration; }
    public void setNarration(String narration) { this.narration = narration; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static JournalEntryBuilder builder() {
        return new JournalEntryBuilder();
    }

    public static class JournalEntryBuilder {
        private Long id;
        private Long companyId;
        private Long voucherId;
        private Long profitCentreId;
        private Long ledgerId;
        private BigDecimal debitAmount = BigDecimal.ZERO;
        private BigDecimal creditAmount = BigDecimal.ZERO;
        private LocalDate entryDate;
        private String narration;
        private LocalDateTime createdAt;

        JournalEntryBuilder() {}

        public JournalEntryBuilder id(Long id) { this.id = id; return this; }
        public JournalEntryBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public JournalEntryBuilder voucherId(Long voucherId) { this.voucherId = voucherId; return this; }
        public JournalEntryBuilder profitCentreId(Long profitCentreId) { this.profitCentreId = profitCentreId; return this; }
        public JournalEntryBuilder ledgerId(Long ledgerId) { this.ledgerId = ledgerId; return this; }
        public JournalEntryBuilder debitAmount(BigDecimal debitAmount) { this.debitAmount = debitAmount; return this; }
        public JournalEntryBuilder creditAmount(BigDecimal creditAmount) { this.creditAmount = creditAmount; return this; }
        public JournalEntryBuilder entryDate(LocalDate entryDate) { this.entryDate = entryDate; return this; }
        public JournalEntryBuilder narration(String narration) { this.narration = narration; return this; }
        public JournalEntryBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public JournalEntry build() {
            return new JournalEntry(id, companyId, voucherId, profitCentreId, ledgerId, debitAmount, creditAmount, entryDate, narration, createdAt);
        }
    }
}
