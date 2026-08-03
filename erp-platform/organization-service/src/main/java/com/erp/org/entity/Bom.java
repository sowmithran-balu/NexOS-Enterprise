package com.erp.org.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "boms")
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class Bom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "finished_product_id", nullable = false)
    private Long finishedProductId; // Finished product ID

    @Column(nullable = false)
    private String name; // BOM Name / code (e.g. "Standard BOM")

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @JoinColumn(name = "bom_id")
    private List<BomItem> items = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Bom() {}

    public Bom(Long id, Long companyId, Long finishedProductId, String name, List<BomItem> items, LocalDateTime createdAt) {
        this.id = id;
        this.companyId = companyId;
        this.finishedProductId = finishedProductId;
        this.name = name;
        this.items = items;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public Long getFinishedProductId() { return finishedProductId; }
    public void setFinishedProductId(Long finishedProductId) { this.finishedProductId = finishedProductId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public List<BomItem> getItems() { return items; }
    public void setItems(List<BomItem> items) { this.items = items; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
