package com.erp.auth.controller;

import com.erp.org.entity.Godown;
import com.erp.org.entity.Product;
import com.erp.org.entity.ProductStock;
import com.erp.org.service.InventoryService;
import com.erp.auth.service.InventoryValuationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService inventoryService;
    private final InventoryValuationService inventoryValuationService;

    public InventoryController(InventoryService inventoryService,
                               InventoryValuationService inventoryValuationService) {
        this.inventoryService = inventoryService;
        this.inventoryValuationService = inventoryValuationService;
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getProducts(@RequestParam Long companyId) {
        return ResponseEntity.ok(inventoryService.getAllProducts(companyId));
    }

    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(inventoryService.createProduct(product));
    }

    @GetMapping("/godowns")
    public ResponseEntity<List<Godown>> getGodowns(@RequestParam Long companyId) {
        return ResponseEntity.ok(inventoryService.getAllGodowns(companyId));
    }

    @PostMapping("/godowns")
    public ResponseEntity<Godown> createGodown(@RequestBody Godown godown) {
        return ResponseEntity.ok(inventoryService.createGodown(godown));
    }

    @GetMapping("/stock")
    public ResponseEntity<List<ProductStock>> getStock(@RequestParam Long companyId) {
        return ResponseEntity.ok(inventoryService.getCompanyStock(companyId));
    }

    @PostMapping("/stock/adjust")
    public ResponseEntity<?> adjustStock(@RequestBody StockAdjustRequest request) {
        try {
            inventoryService.adjustStock(
                    request.companyId(),
                    request.productId(),
                    request.godownId(),
                    request.batchNumber(),
                    request.serialNumber(),
                    request.quantity()
            );
            return ResponseEntity.ok(Map.of("message", "Stock adjusted successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/stock/transfer")
    public ResponseEntity<?> transferStock(@RequestBody StockTransferRequest request) {
        try {
            inventoryService.transferStock(
                    request.companyId(),
                    request.productId(),
                    request.fromGodownId(),
                    request.toGodownId(),
                    request.batchNumber(),
                    request.serialNumber(),
                    request.quantity()
            );
            return ResponseEntity.ok(Map.of("message", "Stock transferred successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/valuation")
    public ResponseEntity<?> getValuation(@RequestParam Long companyId, @RequestParam(defaultValue = "CUSTOM") String method) {
        BigDecimal valuation = inventoryValuationService.getStockValuation(companyId, method);
        return ResponseEntity.ok(Map.of("valuation", valuation));
    }

    @GetMapping("/ageing")
    public ResponseEntity<List<Map<String, Object>>> getStockAgeing(@RequestParam Long companyId) {
        return ResponseEntity.ok(inventoryValuationService.getStockAgeing(companyId));
    }

    public static record StockAdjustRequest(Long companyId, Long productId, Long godownId, 
                                            String batchNumber, String serialNumber, BigDecimal quantity) {}
    
    public static record StockTransferRequest(Long companyId, Long productId, Long fromGodownId, 
                                              Long toGodownId, String batchNumber, String serialNumber, BigDecimal quantity) {}
}
