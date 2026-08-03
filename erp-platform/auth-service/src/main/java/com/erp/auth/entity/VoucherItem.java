package com.erp.auth.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "voucher_items")
public class VoucherItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "godown_id")
    private Long godownId; // Godown inventory origin

    @Column(name = "batch_number")
    private String batchNumber; // Batch tracking

    @Column(name = "serial_number")
    private String serialNumber; // Serial number tracking

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal rate = BigDecimal.ZERO;

    @Column(name = "tax_rate", precision = 5, scale = 2)
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 12, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 12, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    public VoucherItem() {}

    public VoucherItem(Long id, Long productId, Long godownId, String batchNumber, String serialNumber, BigDecimal quantity, BigDecimal rate, BigDecimal taxRate, BigDecimal taxAmount, BigDecimal discountAmount, BigDecimal totalAmount) {
        this.id = id;
        this.productId = productId;
        this.godownId = godownId;
        this.batchNumber = batchNumber;
        this.serialNumber = serialNumber;
        this.quantity = quantity != null ? quantity : BigDecimal.ZERO;
        this.rate = rate != null ? rate : BigDecimal.ZERO;
        this.taxRate = taxRate != null ? taxRate : BigDecimal.ZERO;
        this.taxAmount = taxAmount != null ? taxAmount : BigDecimal.ZERO;
        this.discountAmount = discountAmount != null ? discountAmount : BigDecimal.ZERO;
        this.totalAmount = totalAmount != null ? totalAmount : BigDecimal.ZERO;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getGodownId() { return godownId; }
    public void setGodownId(Long godownId) { this.godownId = godownId; }
    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }
    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getRate() { return rate; }
    public void setRate(BigDecimal rate) { this.rate = rate; }
    public BigDecimal getTaxRate() { return taxRate; }
    public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    // Builder
    public static VoucherItemBuilder builder() {
        return new VoucherItemBuilder();
    }

    public static class VoucherItemBuilder {
        private Long id;
        private Long productId;
        private Long godownId;
        private String batchNumber;
        private String serialNumber;
        private BigDecimal quantity = BigDecimal.ZERO;
        private BigDecimal rate = BigDecimal.ZERO;
        private BigDecimal taxRate = BigDecimal.ZERO;
        private BigDecimal taxAmount = BigDecimal.ZERO;
        private BigDecimal discountAmount = BigDecimal.ZERO;
        private BigDecimal totalAmount = BigDecimal.ZERO;

        VoucherItemBuilder() {}

        public VoucherItemBuilder id(Long id) { this.id = id; return this; }
        public VoucherItemBuilder productId(Long productId) { this.productId = productId; return this; }
        public VoucherItemBuilder godownId(Long godownId) { this.godownId = godownId; return this; }
        public VoucherItemBuilder batchNumber(String batchNumber) { this.batchNumber = batchNumber; return this; }
        public VoucherItemBuilder serialNumber(String serialNumber) { this.serialNumber = serialNumber; return this; }
        public VoucherItemBuilder quantity(BigDecimal quantity) { this.quantity = quantity; return this; }
        public VoucherItemBuilder rate(BigDecimal rate) { this.rate = rate; return this; }
        public VoucherItemBuilder taxRate(BigDecimal taxRate) { this.taxRate = taxRate; return this; }
        public VoucherItemBuilder taxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; return this; }
        public VoucherItemBuilder discountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; return this; }
        public VoucherItemBuilder totalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; return this; }

        public VoucherItem build() {
            return new VoucherItem(id, productId, godownId, batchNumber, serialNumber, quantity, rate, taxRate, taxAmount, discountAmount, totalAmount);
        }
    }
}
