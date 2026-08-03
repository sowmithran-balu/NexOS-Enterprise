package com.erp.auth.controller;

import com.erp.org.entity.Bom;
import com.erp.org.entity.WorkOrder;
import com.erp.auth.service.ManufacturingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manufacturing")
public class ManufacturingController {

    private final ManufacturingService manufacturingService;

    public ManufacturingController(ManufacturingService manufacturingService) {
        this.manufacturingService = manufacturingService;
    }

    @GetMapping("/boms")
    public ResponseEntity<List<Bom>> getBoms(@RequestParam Long companyId) {
        return ResponseEntity.ok(manufacturingService.getBomsByCompany(companyId));
    }

    @PostMapping("/boms")
    public ResponseEntity<Bom> createBom(@RequestBody Bom bom) {
        return ResponseEntity.ok(manufacturingService.createBom(bom));
    }

    @GetMapping("/work-orders")
    public ResponseEntity<List<WorkOrder>> getWorkOrders(@RequestParam Long companyId) {
        return ResponseEntity.ok(manufacturingService.getWorkOrdersByCompany(companyId));
    }

    @PostMapping("/work-orders")
    public ResponseEntity<WorkOrder> createWorkOrder(@RequestBody WorkOrder order) {
        return ResponseEntity.ok(manufacturingService.createWorkOrder(order));
    }

    @PostMapping("/work-orders/{id}/complete")
    public ResponseEntity<WorkOrder> completeWorkOrder(@PathVariable Long id) {
        return ResponseEntity.ok(manufacturingService.completeWorkOrder(id));
    }
}
