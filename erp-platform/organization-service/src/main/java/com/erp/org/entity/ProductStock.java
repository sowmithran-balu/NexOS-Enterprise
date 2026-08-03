package com.erp.org.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_stocks")
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class ProductStock {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "godown_id", nullable = false)
    private Long godownId;

    @Column(name = "batch_number")
    private String batchNumber; // Support batch tracking

    @Column(name = "expiry_date")
    private LocalDate expiryDate; // Expiry tracking

    @Column(name = "serial_number")
    private String serialNumber; // Serial number tracking

    @Column(nullable = false, precision = 15, scale = 4)
    private BigDecimal quantity;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ProductStock() {}

    public ProductStock(Long id, Long companyId, Long productId, Long godownId, String batchNumber, LocalDate expiryDate, String serialNumber, BigDecimal quantity, LocalDateTime updatedAt) {
        this.id = id;
        this.companyId = companyId;
        this.productId = productId;
        this.godownId = godownId;
        this.batchNumber = batchNumber;
        this.expiryDate = expiryDate;
        this.serialNumber = serialNumber;
        this.quantity = quantity;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getGodownId() { return godownId; }
    public void setGodownId(Long godownId) { this.godownId = godownId; }
    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static ProductStockBuilder builder() {
        return new ProductStockBuilder();
    }

    public static class ProductStockBuilder {
        private Long id;
        private Long companyId;
        private Long productId;
        private Long godownId;
        private String batchNumber;
        private LocalDate expiryDate;
        private String serialNumber;
        private BigDecimal quantity;
        private LocalDateTime updatedAt;

        ProductStockBuilder() {}

        public ProductStockBuilder id(Long id) { this.id = id; return this; }
        public ProductStockBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public ProductStockBuilder productId(Long productId) { this.productId = productId; return this; }
        public ProductStockBuilder godownId(Long godownId) { this.godownId = godownId; return this; }
        public ProductStockBuilder batchNumber(String batchNumber) { this.batchNumber = batchNumber; return this; }
        public ProductStockBuilder expiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; return this; }
        public ProductStockBuilder serialNumber(String serialNumber) { this.serialNumber = serialNumber; return this; }
        public ProductStockBuilder quantity(BigDecimal quantity) { this.quantity = quantity; return this; }
        public ProductStockBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public ProductStock build() {
            return new ProductStock(id, companyId, productId, godownId, batchNumber, expiryDate, serialNumber, quantity, updatedAt);
        }
    }
}
