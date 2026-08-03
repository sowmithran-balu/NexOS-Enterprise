package com.erp.auth.service;

import com.erp.auth.entity.AuditLog;
import com.erp.auth.repository.AuditLogRepository;
import com.erp.org.entity.*;
import com.erp.org.repository.*;
import com.erp.org.service.InventoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ManufacturingService {

    private final BomRepository bomRepository;
    private final WorkOrderRepository workOrderRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final AuditLogRepository auditLogRepository;

    public ManufacturingService(BomRepository bomRepository,
                                WorkOrderRepository workOrderRepository,
                                ProductRepository productRepository,
                                InventoryService inventoryService,
                                AuditLogRepository auditLogRepository) {
        this.bomRepository = bomRepository;
        this.workOrderRepository = workOrderRepository;
        this.productRepository = productRepository;
        this.inventoryService = inventoryService;
        this.auditLogRepository = auditLogRepository;
    }

    public List<Bom> getBomsByCompany(Long companyId) {
        return bomRepository.findByCompanyId(companyId);
    }

    @Transactional
    public Bom createBom(Bom bom) {
        return bomRepository.save(bom);
    }

    public List<WorkOrder> getWorkOrdersByCompany(Long companyId) {
        return workOrderRepository.findByCompanyId(companyId);
    }

    @Transactional
    public WorkOrder createWorkOrder(WorkOrder order) {
        order.setStatus("PENDING");
        return workOrderRepository.save(order);
    }

    @Transactional
    public WorkOrder completeWorkOrder(Long id) {
        WorkOrder order = workOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Work Order not found: " + id));

        if (!"PENDING".equals(order.getStatus())) {
            throw new IllegalStateException("Work Order is already completed or cancelled.");
        }

        Bom bom = bomRepository.findById(order.getBomId())
                .orElseThrow(() -> new RuntimeException("BOM not found: " + order.getBomId()));

        Long companyId = order.getCompanyId();
        BigDecimal qty = order.getQuantity();

        // 1. Consume raw materials
        BigDecimal totalMaterialCost = BigDecimal.ZERO;
        for (BomItem item : bom.getItems()) {
            Product component = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Component product not found: " + item.getProductId()));

            BigDecimal requiredQty = item.getQuantity().multiply(qty);
            inventoryService.adjustStock(companyId, component.getId(), order.getGodownId(), "DEFAULT", "DEFAULT", requiredQty.negate());

            // Compute material cost
            BigDecimal itemPrice = component.getPurchasePrice() != null ? component.getPurchasePrice() : BigDecimal.ZERO;
            totalMaterialCost = totalMaterialCost.add(itemPrice.multiply(requiredQty));
        }

        // 2. Produce finished goods
        inventoryService.adjustStock(companyId, order.getFinishedProductId(), order.getGodownId(), "DEFAULT", "DEFAULT", qty);

        // 3. Mark completed
        order.setStatus("COMPLETED");
        order.setCompletedDate(LocalDateTime.now());
        WorkOrder savedOrder = workOrderRepository.save(order);

        // 4. Log to central audit trail
        BigDecimal totalCost = totalMaterialCost.add(order.getOverheadCost());
        AuditLog log = AuditLog.builder()
                .companyId(companyId)
                .userId(1L)
                .username("system")
                .ipAddress("127.0.0.1")
                .action("COMPLETE_WORK_ORDER")
                .module("MANUFACTURING")
                .details("Completed Work Order #" + savedOrder.getId() + ". Consumed components. Produced finished goods quantity: " + qty + ". Total Production Cost: " + totalCost)
                .status("SUCCESS")
                .timestamp(LocalDateTime.now())
                .build();
        auditLogRepository.save(log);

        return savedOrder;
    }
}
