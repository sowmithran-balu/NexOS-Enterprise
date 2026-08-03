package com.erp.org.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "work_orders")
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class WorkOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "bom_id", nullable = false)
    private Long bomId; // Link to BOM

    @Column(name = "finished_product_id", nullable = false)
    private Long finishedProductId; // Finished product ID

    @Column(name = "godown_id", nullable = false)
    private Long godownId; // Godown where stock goes in / comes out

    @Column(precision = 12, scale = 2, nullable = false)
    private BigDecimal quantity; // Target production quantity

    @Column(name = "overhead_cost", precision = 12, scale = 2)
    private BigDecimal overheadCost = BigDecimal.ZERO; // Direct wages / overheads

    private String status = "PENDING"; // PENDING, COMPLETED, CANCELLED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedDate;

    public WorkOrder() {}

    public WorkOrder(Long id, Long companyId, Long bomId, Long finishedProductId, Long godownId, BigDecimal quantity, BigDecimal overheadCost, String status, LocalDateTime createdAt, LocalDateTime completedDate) {
        this.id = id;
        this.companyId = companyId;
        this.bomId = bomId;
        this.finishedProductId = finishedProductId;
        this.godownId = godownId;
        this.quantity = quantity;
        this.overheadCost = overheadCost != null ? overheadCost : BigDecimal.ZERO;
        this.status = status;
        this.createdAt = createdAt;
        this.completedDate = completedDate;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public Long getBomId() { return bomId; }
    public void setBomId(Long bomId) { this.bomId = bomId; }
    public Long getFinishedProductId() { return finishedProductId; }
    public void setFinishedProductId(Long finishedProductId) { this.finishedProductId = finishedProductId; }
    public Long getGodownId() { return godownId; }
    public void setGodownId(Long godownId) { this.godownId = godownId; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getOverheadCost() { return overheadCost; }
    public void setOverheadCost(BigDecimal overheadCost) { this.overheadCost = overheadCost; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDateTime completedDate) { this.completedDate = completedDate; }
}
