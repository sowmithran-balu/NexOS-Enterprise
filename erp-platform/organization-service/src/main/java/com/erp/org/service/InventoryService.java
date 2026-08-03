package com.erp.org.service;

import com.erp.org.entity.*;
import com.erp.org.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class InventoryService {

    private final ProductRepository productRepository;
    private final GodownRepository godownRepository;
    private final ProductStockRepository productStockRepository;

    public InventoryService(ProductRepository productRepository,
                            GodownRepository godownRepository,
                            ProductStockRepository productStockRepository) {
        this.productRepository = productRepository;
        this.godownRepository = godownRepository;
        this.productStockRepository = productStockRepository;
    }

    public List<Product> getAllProducts(Long companyId) {
        return productRepository.findByCompanyId(companyId);
    }

    @Transactional
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public List<Godown> getAllGodowns(Long companyId) {
        return godownRepository.findByCompanyId(companyId);
    }

    @Transactional
    public Godown createGodown(Godown godown) {
        return godownRepository.save(godown);
    }

    public List<ProductStock> getCompanyStock(Long companyId) {
        return productStockRepository.findByCompanyId(companyId);
    }

    public BigDecimal getProductStockQty(Long companyId, Long productId, Long godownId, String batchNumber, String serialNumber) {
        String batch = (batchNumber == null || batchNumber.trim().isEmpty()) ? "DEFAULT" : batchNumber;
        String serial = (serialNumber == null || serialNumber.trim().isEmpty()) ? "DEFAULT" : serialNumber;

        return productStockRepository
                .findByCompanyIdAndProductIdAndGodownIdAndBatchNumberAndSerialNumber(
                        companyId, productId, godownId, batch, serial)
                .map(ProductStock::getQuantity)
                .orElse(BigDecimal.ZERO);
    }

    @Transactional
    public void adjustStock(Long companyId, Long productId, Long godownId, 
                            String batchNumber, String serialNumber, BigDecimal qtyChange) {
        // Clean parameters
        String batch = (batchNumber == null || batchNumber.trim().isEmpty()) ? "DEFAULT" : batchNumber;
        String serial = (serialNumber == null || serialNumber.trim().isEmpty()) ? "DEFAULT" : serialNumber;

        Optional<ProductStock> optStock = productStockRepository
                .findByCompanyIdAndProductIdAndGodownIdAndBatchNumberAndSerialNumber(
                        companyId, productId, godownId, batch, serial);

        if (optStock.isPresent()) {
            ProductStock stock = optStock.get();
            BigDecimal newQty = stock.getQuantity().add(qtyChange);
            if (newQty.compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Insufficient stock in selected godown.");
            }
            stock.setQuantity(newQty);
            productStockRepository.save(stock);
        } else {
            if (qtyChange.compareTo(BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Insufficient stock in selected godown (No stock record exists).");
            }
            ProductStock stock = ProductStock.builder()
                    .companyId(companyId)
                    .productId(productId)
                    .godownId(godownId)
                    .batchNumber(batch)
                    .serialNumber(serial)
                    .quantity(qtyChange)
                    .expiryDate(LocalDate.now().plusYears(1)) // default 1 year
                    .build();
            productStockRepository.save(stock);
        }
    }

    @Transactional
    public void transferStock(Long companyId, Long productId, Long fromGodownId, Long toGodownId,
                              String batchNumber, String serialNumber, BigDecimal qty) {
        if (qty.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Quantity to transfer must be greater than zero.");
        }
        // Decrement from source Godown
        adjustStock(companyId, productId, fromGodownId, batchNumber, serialNumber, qty.negate());
        // Increment in destination Godown
        adjustStock(companyId, productId, toGodownId, batchNumber, serialNumber, qty);
    }

    public BigDecimal getStockValuation(Long companyId) {
        List<ProductStock> stocks = productStockRepository.findByCompanyId(companyId);
        BigDecimal valuation = BigDecimal.ZERO;
        
        for (ProductStock ps : stocks) {
            Optional<Product> optP = productRepository.findById(ps.getProductId());
            if (optP.isPresent()) {
                BigDecimal rate = optP.get().getPurchasePrice();
                if (rate == null) rate = BigDecimal.ZERO;
                valuation = valuation.add(ps.getQuantity().multiply(rate));
            }
        }
        return valuation;
    }
}
