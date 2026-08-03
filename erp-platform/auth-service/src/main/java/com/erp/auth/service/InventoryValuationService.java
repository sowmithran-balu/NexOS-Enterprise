package com.erp.auth.service;

import com.erp.auth.entity.Voucher;
import com.erp.auth.entity.VoucherItem;
import com.erp.auth.repository.VoucherRepository;
import com.erp.org.entity.Product;
import com.erp.org.entity.ProductStock;
import com.erp.org.repository.ProductRepository;
import com.erp.org.repository.ProductStockRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InventoryValuationService {

    private final ProductStockRepository productStockRepository;
    private final ProductRepository productRepository;
    private final VoucherRepository voucherRepository;

    public InventoryValuationService(ProductStockRepository productStockRepository,
                                     ProductRepository productRepository,
                                     VoucherRepository voucherRepository) {
        this.productStockRepository = productStockRepository;
        this.productRepository = productRepository;
        this.voucherRepository = voucherRepository;
    }

    public BigDecimal getStockValuation(Long companyId, String method) {
        List<ProductStock> stocks = productStockRepository.findByCompanyId(companyId);
        BigDecimal totalValuation = BigDecimal.ZERO;

        for (ProductStock ps : stocks) {
            BigDecimal qty = ps.getQuantity();
            if (qty.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            Optional<Product> optP = productRepository.findById(ps.getProductId());
            if (optP.isEmpty()) {
                continue;
            }
            Product p = optP.get();
            BigDecimal basePrice = p.getPurchasePrice() != null ? p.getPurchasePrice() : BigDecimal.ZERO;

            if ("FIFO".equalsIgnoreCase(method) || "LIFO".equalsIgnoreCase(method)) {
                // Fetch all purchase items for this product
                List<VoucherItemPriceInfo> purchaseItems = getProductPurchases(companyId, p.getId(), "FIFO".equalsIgnoreCase(method));

                BigDecimal remainingQty = qty;
                BigDecimal productValuation = BigDecimal.ZERO;

                for (VoucherItemPriceInfo item : purchaseItems) {
                    if (remainingQty.compareTo(BigDecimal.ZERO) <= 0) {
                        break;
                    }
                    BigDecimal matchQty = remainingQty.min(item.qty);
                    productValuation = productValuation.add(matchQty.multiply(item.rate));
                    remainingQty = remainingQty.subtract(matchQty);
                }

                // If stock remaining has no matching purchase record (e.g. opening stock), use base price
                if (remainingQty.compareTo(BigDecimal.ZERO) > 0) {
                    productValuation = productValuation.add(remainingQty.multiply(basePrice));
                }
                totalValuation = totalValuation.add(productValuation);
            } 
            else if ("WEIGHTED_AVG".equalsIgnoreCase(method)) {
                List<VoucherItemPriceInfo> purchaseItems = getProductPurchases(companyId, p.getId(), true);
                BigDecimal totalPurchaseQty = BigDecimal.ZERO;
                BigDecimal totalPurchaseCost = BigDecimal.ZERO;

                for (VoucherItemPriceInfo item : purchaseItems) {
                    totalPurchaseQty = totalPurchaseQty.add(item.qty);
                    totalPurchaseCost = totalPurchaseCost.add(item.qty.multiply(item.rate));
                }

                BigDecimal avgRate = basePrice;
                if (totalPurchaseQty.compareTo(BigDecimal.ZERO) > 0) {
                    avgRate = totalPurchaseCost.divide(totalPurchaseQty, 4, RoundingMode.HALF_UP);
                }
                totalValuation = totalValuation.add(qty.multiply(avgRate));
            } 
            else { // CUSTOM / Base Price
                totalValuation = totalValuation.add(qty.multiply(basePrice));
            }
        }

        return totalValuation.setScale(2, RoundingMode.HALF_UP);
    }

    public List<Map<String, Object>> getStockAgeing(Long companyId) {
        List<ProductStock> stocks = productStockRepository.findByCompanyId(companyId);
        List<Map<String, Object>> report = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (ProductStock ps : stocks) {
            BigDecimal qty = ps.getQuantity();
            if (qty.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            Optional<Product> optP = productRepository.findById(ps.getProductId());
            if (optP.isEmpty()) {
                continue;
            }
            Product p = optP.get();

            // Trace back purchase items to assign age
            List<VoucherItemPriceInfo> purchases = getProductPurchases(companyId, p.getId(), false); // newest first

            BigDecimal remainingQty = qty;
            BigDecimal ageUnder30 = BigDecimal.ZERO;
            BigDecimal age30to90 = BigDecimal.ZERO;
            BigDecimal age90to180 = BigDecimal.ZERO;
            BigDecimal ageOver180 = BigDecimal.ZERO;

            for (VoucherItemPriceInfo purchase : purchases) {
                if (remainingQty.compareTo(BigDecimal.ZERO) <= 0) {
                    break;
                }
                BigDecimal matchQty = remainingQty.min(purchase.qty);
                long days = ChronoUnit.DAYS.between(purchase.date, today);

                if (days < 30) {
                    ageUnder30 = ageUnder30.add(matchQty);
                } else if (days < 90) {
                    age30to90 = age30to90.add(matchQty);
                } else if (days < 180) {
                    age90to180 = age90to180.add(matchQty);
                } else {
                    ageOver180 = ageOver180.add(matchQty);
                }
                remainingQty = remainingQty.subtract(matchQty);
            }

            // Unmatched stock goes to oldest category
            if (remainingQty.compareTo(BigDecimal.ZERO) > 0) {
                ageOver180 = ageOver180.add(remainingQty);
            }

            Map<String, Object> row = new HashMap<>();
            row.put("productId", p.getId());
            row.put("productName", p.getName());
            row.put("productCode", p.getCode());
            row.put("unit", p.getUnit());
            row.put("totalStock", qty);
            row.put("under30", ageUnder30);
            row.put("between30And90", age30to90);
            row.put("between90And180", age90to180);
            row.put("over180", ageOver180);

            report.add(row);
        }

        return report;
    }

    private List<VoucherItemPriceInfo> getProductPurchases(Long companyId, Long productId, boolean ascending) {
        List<Voucher> purchaseVouchers = voucherRepository.findByCompanyIdAndType(companyId, "PURCHASE");
        List<VoucherItemPriceInfo> list = new ArrayList<>();

        for (Voucher v : purchaseVouchers) {
            for (VoucherItem item : v.getItems()) {
                if (item.getProductId().equals(productId)) {
                    list.add(new VoucherItemPriceInfo(v.getDate(), item.getQuantity(), item.getRate()));
                }
            }
        }

        // Sort by date
        if (ascending) {
            list.sort(Comparator.comparing(a -> a.date));
        } else {
            list.sort((a, b) -> b.date.compareTo(a.date));
        }

        return list;
    }

    private static class VoucherItemPriceInfo {
        LocalDate date;
        BigDecimal qty;
        BigDecimal rate;

        VoucherItemPriceInfo(LocalDate date, BigDecimal qty, BigDecimal rate) {
            this.date = date;
            this.qty = qty != null ? qty : BigDecimal.ZERO;
            this.rate = rate != null ? rate : BigDecimal.ZERO;
        }
    }
}
