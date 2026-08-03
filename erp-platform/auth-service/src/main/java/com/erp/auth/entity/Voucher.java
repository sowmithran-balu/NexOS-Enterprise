package com.erp.auth.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vouchers")
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "branch_id", nullable = false)
    private Long branchId;

    @Column(name = "voucher_number", nullable = false)
    private String voucherNumber;

    @Column(nullable = false)
    private String type; // SALES, PURCHASE, RECEIPT, PAYMENT, CONTRA, JOURNAL, DEBIT_NOTE, CREDIT_NOTE, PHYSICAL_STOCK, JOB_WORK

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "ledger_id")
    private Long ledgerId; // Main Debit/Credit account, or Bank/Cash account

    @Column(name = "employee_id")
    private Long employeeId; // For sales commission agent tracking

    @Column(name = "profit_centre_id")
    private Long profitCentreId; // Cost Center (branch/department)

    @Column(name = "sub_total", precision = 15, scale = 2)
    private BigDecimal subTotal = BigDecimal.ZERO;

    @Column(name = "tax_total", precision = 15, scale = 2)
    private BigDecimal taxTotal = BigDecimal.ZERO;

    @Column(name = "discount_total", precision = 15, scale = 2)
    private BigDecimal discountTotal = BigDecimal.ZERO;

    @Column(name = "other_charges", precision = 15, scale = 2)
    private BigDecimal otherCharges = BigDecimal.ZERO; // Freight, Packing, etc.

    @Column(name = "grand_total", precision = 15, scale = 2)
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Column(name = "outstanding_amount", precision = 15, scale = 2)
    private BigDecimal outstandingAmount = BigDecimal.ZERO; // Bill-by-bill matching

    private String status = "PENDING"; // PENDING, PAID, PARTIAL

    private String notes;

    @Column(name = "cheque_number")
    private String chequeNumber;

    @Column(name = "cheque_date")
    private LocalDate chequeDate;

    @Column(name = "cheque_status")
    private String chequeStatus; // PENDING, CLEARED, CANCELLED

    @Column(name = "commission_rate", precision = 5, scale = 2)
    private BigDecimal commissionRate = BigDecimal.ZERO; // Agent commission percentage

    @Column(name = "commission_amount", precision = 15, scale = 2)
    private BigDecimal commissionAmount = BigDecimal.ZERO; // Auto-calculated commission

    @Column(name = "eway_bill_number")
    private String ewayBillNumber;

    @Column(name = "eway_bill_date")
    private LocalDate ewayBillDate;

    @Column(name = "irn")
    private String irn;

    @Column(name = "qr_code_data", length = 1000)
    private String qrCodeData;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @JoinColumn(name = "voucher_id")
    private List<VoucherItem> items = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Voucher() {}

    public Voucher(Long id, Long companyId, Long branchId, String voucherNumber, String type, LocalDate date, Long ledgerId, Long employeeId, Long profitCentreId, BigDecimal subTotal, BigDecimal taxTotal, BigDecimal discountTotal, BigDecimal otherCharges, BigDecimal grandTotal, BigDecimal outstandingAmount, String status, String notes, String chequeNumber, LocalDate chequeDate, String chequeStatus, BigDecimal commissionRate, BigDecimal commissionAmount, String ewayBillNumber, LocalDate ewayBillDate, String irn, String qrCodeData, List<VoucherItem> items, LocalDateTime createdAt) {
        this.id = id;
        this.companyId = companyId;
        this.branchId = branchId;
        this.voucherNumber = voucherNumber;
        this.type = type;
        this.date = date;
        this.ledgerId = ledgerId;
        this.employeeId = employeeId;
        this.profitCentreId = profitCentreId;
        this.subTotal = subTotal != null ? subTotal : BigDecimal.ZERO;
        this.taxTotal = taxTotal != null ? taxTotal : BigDecimal.ZERO;
        this.discountTotal = discountTotal != null ? discountTotal : BigDecimal.ZERO;
        this.otherCharges = otherCharges != null ? otherCharges : BigDecimal.ZERO;
        this.grandTotal = grandTotal != null ? grandTotal : BigDecimal.ZERO;
        this.outstandingAmount = outstandingAmount != null ? outstandingAmount : BigDecimal.ZERO;
        this.status = status != null ? status : "PENDING";
        this.notes = notes;
        this.chequeNumber = chequeNumber;
        this.chequeDate = chequeDate;
        this.chequeStatus = chequeStatus;
        this.commissionRate = commissionRate != null ? commissionRate : BigDecimal.ZERO;
        this.commissionAmount = commissionAmount != null ? commissionAmount : BigDecimal.ZERO;
        this.ewayBillNumber = ewayBillNumber;
        this.ewayBillDate = ewayBillDate;
        this.irn = irn;
        this.qrCodeData = qrCodeData;
        this.items = items != null ? items : new ArrayList<>();
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
    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
    public String getVoucherNumber() { return voucherNumber; }
    public void setVoucherNumber(String voucherNumber) { this.voucherNumber = voucherNumber; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public Long getLedgerId() { return ledgerId; }
    public void setLedgerId(Long ledgerId) { this.ledgerId = ledgerId; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public Long getProfitCentreId() { return profitCentreId; }
    public void setProfitCentreId(Long profitCentreId) { this.profitCentreId = profitCentreId; }
    public BigDecimal getSubTotal() { return subTotal; }
    public void setSubTotal(BigDecimal subTotal) { this.subTotal = subTotal; }
    public BigDecimal getTaxTotal() { return taxTotal; }
    public void setTaxTotal(BigDecimal taxTotal) { this.taxTotal = taxTotal; }
    public BigDecimal getDiscountTotal() { return discountTotal; }
    public void setDiscountTotal(BigDecimal discountTotal) { this.discountTotal = discountTotal; }
    public BigDecimal getOtherCharges() { return otherCharges; }
    public void setOtherCharges(BigDecimal otherCharges) { this.otherCharges = otherCharges; }
    public BigDecimal getGrandTotal() { return grandTotal; }
    public void setGrandTotal(BigDecimal grandTotal) { this.grandTotal = grandTotal; }
    public BigDecimal getOutstandingAmount() { return outstandingAmount; }
    public void setOutstandingAmount(BigDecimal outstandingAmount) { this.outstandingAmount = outstandingAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getChequeNumber() { return chequeNumber; }
    public void setChequeNumber(String chequeNumber) { this.chequeNumber = chequeNumber; }
    public LocalDate getChequeDate() { return chequeDate; }
    public void setChequeDate(LocalDate chequeDate) { this.chequeDate = chequeDate; }
    public String getChequeStatus() { return chequeStatus; }
    public void setChequeStatus(String chequeStatus) { this.chequeStatus = chequeStatus; }
    public BigDecimal getCommissionRate() { return commissionRate; }
    public void setCommissionRate(BigDecimal commissionRate) { this.commissionRate = commissionRate; }
    public BigDecimal getCommissionAmount() { return commissionAmount; }
    public void setCommissionAmount(BigDecimal commissionAmount) { this.commissionAmount = commissionAmount; }
    public String getEwayBillNumber() { return ewayBillNumber; }
    public void setEwayBillNumber(String ewayBillNumber) { this.ewayBillNumber = ewayBillNumber; }
    public LocalDate getEwayBillDate() { return ewayBillDate; }
    public void setEwayBillDate(LocalDate ewayBillDate) { this.ewayBillDate = ewayBillDate; }
    public String getIrn() { return irn; }
    public void setIrn(String irn) { this.irn = irn; }
    public String getQrCodeData() { return qrCodeData; }
    public void setQrCodeData(String qrCodeData) { this.qrCodeData = qrCodeData; }
    public List<VoucherItem> getItems() { return items; }
    public void setItems(List<VoucherItem> items) { this.items = items; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static VoucherBuilder builder() {
        return new VoucherBuilder();
    }

    public static class VoucherBuilder {
        private Long id;
        private Long companyId;
        private Long branchId;
        private String voucherNumber;
        private String type;
        private LocalDate date;
        private Long ledgerId;
        private Long employeeId;
        private Long profitCentreId;
        private BigDecimal subTotal = BigDecimal.ZERO;
        private BigDecimal taxTotal = BigDecimal.ZERO;
        private BigDecimal discountTotal = BigDecimal.ZERO;
        private BigDecimal otherCharges = BigDecimal.ZERO;
        private BigDecimal grandTotal = BigDecimal.ZERO;
        private BigDecimal outstandingAmount = BigDecimal.ZERO;
        private String status = "PENDING";
        private String notes;
        private String chequeNumber;
        private LocalDate chequeDate;
        private String chequeStatus;
        private BigDecimal commissionRate = BigDecimal.ZERO;
        private BigDecimal commissionAmount = BigDecimal.ZERO;
        private String ewayBillNumber;
        private LocalDate ewayBillDate;
        private String irn;
        private String qrCodeData;
        private List<VoucherItem> items = new ArrayList<>();
        private LocalDateTime createdAt;

        VoucherBuilder() {}

        public VoucherBuilder id(Long id) { this.id = id; return this; }
        public VoucherBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public VoucherBuilder branchId(Long branchId) { this.branchId = branchId; return this; }
        public VoucherBuilder voucherNumber(String voucherNumber) { this.voucherNumber = voucherNumber; return this; }
        public VoucherBuilder type(String type) { this.type = type; return this; }
        public VoucherBuilder date(LocalDate date) { this.date = date; return this; }
        public VoucherBuilder ledgerId(Long ledgerId) { this.ledgerId = ledgerId; return this; }
        public VoucherBuilder employeeId(Long employeeId) { this.employeeId = employeeId; return this; }
        public VoucherBuilder profitCentreId(Long profitCentreId) { this.profitCentreId = profitCentreId; return this; }
        public VoucherBuilder subTotal(BigDecimal subTotal) { this.subTotal = subTotal; return this; }
        public VoucherBuilder taxTotal(BigDecimal taxTotal) { this.taxTotal = taxTotal; return this; }
        public VoucherBuilder discountTotal(BigDecimal discountTotal) { this.discountTotal = discountTotal; return this; }
        public VoucherBuilder otherCharges(BigDecimal otherCharges) { this.otherCharges = otherCharges; return this; }
        public VoucherBuilder grandTotal(BigDecimal grandTotal) { this.grandTotal = grandTotal; return this; }
        public VoucherBuilder outstandingAmount(BigDecimal outstandingAmount) { this.outstandingAmount = outstandingAmount; return this; }
        public VoucherBuilder status(String status) { this.status = status; return this; }
        public VoucherBuilder notes(String notes) { this.notes = notes; return this; }
        public VoucherBuilder chequeNumber(String chequeNumber) { this.chequeNumber = chequeNumber; return this; }
        public VoucherBuilder chequeDate(LocalDate chequeDate) { this.chequeDate = chequeDate; return this; }
        public VoucherBuilder chequeStatus(String chequeStatus) { this.chequeStatus = chequeStatus; return this; }
        public VoucherBuilder commissionRate(BigDecimal commissionRate) { this.commissionRate = commissionRate; return this; }
        public VoucherBuilder commissionAmount(BigDecimal commissionAmount) { this.commissionAmount = commissionAmount; return this; }
        public VoucherBuilder ewayBillNumber(String ewayBillNumber) { this.ewayBillNumber = ewayBillNumber; return this; }
        public VoucherBuilder ewayBillDate(LocalDate ewayBillDate) { this.ewayBillDate = ewayBillDate; return this; }
        public VoucherBuilder irn(String irn) { this.irn = irn; return this; }
        public VoucherBuilder qrCodeData(String qrCodeData) { this.qrCodeData = qrCodeData; return this; }
        public VoucherBuilder items(List<VoucherItem> items) { this.items = items; return this; }
        public VoucherBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Voucher build() {
            return new Voucher(id, companyId, branchId, voucherNumber, type, date, ledgerId, employeeId, profitCentreId, subTotal, taxTotal, discountTotal, otherCharges, grandTotal, outstandingAmount, status, notes, chequeNumber, chequeDate, chequeStatus, commissionRate, commissionAmount, ewayBillNumber, ewayBillDate, irn, qrCodeData, items, createdAt);
        }
    }
}
