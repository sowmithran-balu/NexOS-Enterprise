package com.erp.org.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String code; // Item code (SKU)

    @Column(name = "hsn_code")
    private String hsnCode;

    @Column(name = "gst_rate", precision = 5, scale = 2)
    private BigDecimal gstRate; // e.g. 18.00 for 18%

    @Column(name = "purchase_price", precision = 12, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "selling_price_retail", precision = 12, scale = 2)
    private BigDecimal sellingPriceRetail;

    @Column(name = "selling_price_wholesale", precision = 12, scale = 2)
    private BigDecimal sellingPriceWholesale;

    @Column(name = "selling_price_dealer", precision = 12, scale = 2)
    private BigDecimal sellingPriceDealer;

    private String unit; // Bags, Boxes, Pcs, Kgs
    private String barcode;

    @Column(name = "batch_tracking")
    private boolean batchTracking = false;

    @Column(name = "serial_tracking")
    private boolean serialTracking = false;

    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Product() {}

    public Product(Long id, Long companyId, String name, String code, String hsnCode, BigDecimal gstRate, BigDecimal purchasePrice, BigDecimal sellingPriceRetail, BigDecimal sellingPriceWholesale, BigDecimal sellingPriceDealer, String unit, String barcode, boolean batchTracking, boolean serialTracking, boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.companyId = companyId;
        this.name = name;
        this.code = code;
        this.hsnCode = hsnCode;
        this.gstRate = gstRate;
        this.purchasePrice = purchasePrice;
        this.sellingPriceRetail = sellingPriceRetail;
        this.sellingPriceWholesale = sellingPriceWholesale;
        this.sellingPriceDealer = sellingPriceDealer;
        this.unit = unit;
        this.barcode = barcode;
        this.batchTracking = batchTracking;
        this.serialTracking = serialTracking;
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
    public String getHsnCode() { return hsnCode; }
    public void setHsnCode(String hsnCode) { this.hsnCode = hsnCode; }
    public BigDecimal getGstRate() { return gstRate; }
    public void setGstRate(BigDecimal gstRate) { this.gstRate = gstRate; }
    public BigDecimal getPurchasePrice() { return purchasePrice; }
    public void setPurchasePrice(BigDecimal purchasePrice) { this.purchasePrice = purchasePrice; }
    public BigDecimal getSellingPriceRetail() { return sellingPriceRetail; }
    public void setSellingPriceRetail(BigDecimal sellingPriceRetail) { this.sellingPriceRetail = sellingPriceRetail; }
    public BigDecimal getSellingPriceWholesale() { return sellingPriceWholesale; }
    public void setSellingPriceWholesale(BigDecimal sellingPriceWholesale) { this.sellingPriceWholesale = sellingPriceWholesale; }
    public BigDecimal getSellingPriceDealer() { return sellingPriceDealer; }
    public void setSellingPriceDealer(BigDecimal sellingPriceDealer) { this.sellingPriceDealer = sellingPriceDealer; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    public boolean isBatchTracking() { return batchTracking; }
    public void setBatchTracking(boolean batchTracking) { this.batchTracking = batchTracking; }
    public boolean isSerialTracking() { return serialTracking; }
    public void setSerialTracking(boolean serialTracking) { this.serialTracking = serialTracking; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static ProductBuilder builder() {
        return new ProductBuilder();
    }

    public static class ProductBuilder {
        private Long id;
        private Long companyId;
        private String name;
        private String code;
        private String hsnCode;
        private BigDecimal gstRate;
        private BigDecimal purchasePrice;
        private BigDecimal sellingPriceRetail;
        private BigDecimal sellingPriceWholesale;
        private BigDecimal sellingPriceDealer;
        private String unit;
        private String barcode;
        private boolean batchTracking = false;
        private boolean serialTracking = false;
        private boolean active = true;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        ProductBuilder() {}

        public ProductBuilder id(Long id) { this.id = id; return this; }
        public ProductBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public ProductBuilder name(String name) { this.name = name; return this; }
        public ProductBuilder code(String code) { this.code = code; return this; }
        public ProductBuilder hsnCode(String hsnCode) { this.hsnCode = hsnCode; return this; }
        public ProductBuilder gstRate(BigDecimal gstRate) { this.gstRate = gstRate; return this; }
        public ProductBuilder purchasePrice(BigDecimal purchasePrice) { this.purchasePrice = purchasePrice; return this; }
        public ProductBuilder sellingPriceRetail(BigDecimal sellingPriceRetail) { this.sellingPriceRetail = sellingPriceRetail; return this; }
        public ProductBuilder sellingPriceWholesale(BigDecimal sellingPriceWholesale) { this.sellingPriceWholesale = sellingPriceWholesale; return this; }
        public ProductBuilder sellingPriceDealer(BigDecimal sellingPriceDealer) { this.sellingPriceDealer = sellingPriceDealer; return this; }
        public ProductBuilder unit(String unit) { this.unit = unit; return this; }
        public ProductBuilder barcode(String barcode) { this.barcode = barcode; return this; }
        public ProductBuilder batchTracking(boolean batchTracking) { this.batchTracking = batchTracking; return this; }
        public ProductBuilder serialTracking(boolean serialTracking) { this.serialTracking = serialTracking; return this; }
        public ProductBuilder active(boolean active) { this.active = active; return this; }
        public ProductBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ProductBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Product build() {
            return new Product(id, companyId, name, code, hsnCode, gstRate, purchasePrice, sellingPriceRetail, sellingPriceWholesale, sellingPriceDealer, unit, barcode, batchTracking, serialTracking, active, createdAt, updatedAt);
        }
    }
}
