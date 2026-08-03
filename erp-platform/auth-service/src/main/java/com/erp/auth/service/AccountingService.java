package com.erp.auth.service;

import com.erp.auth.entity.*;
import com.erp.auth.repository.*;
import com.erp.org.entity.Product;
import com.erp.org.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class AccountingService {

    private final LedgerRepository ledgerRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final LedgerGroupRepository ledgerGroupRepository;
    private final VoucherRepository voucherRepository;
    private final ProductRepository productRepository;
    private final AuditLogRepository auditLogRepository;

    public AccountingService(LedgerRepository ledgerRepository,
                             JournalEntryRepository journalEntryRepository,
                             LedgerGroupRepository ledgerGroupRepository,
                             VoucherRepository voucherRepository,
                             ProductRepository productRepository,
                             AuditLogRepository auditLogRepository) {
        this.ledgerRepository = ledgerRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.ledgerGroupRepository = ledgerGroupRepository;
        this.voucherRepository = voucherRepository;
        this.productRepository = productRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public List<Ledger> getCompanyLedgers(Long companyId) {
        return ledgerRepository.findByCompanyId(companyId);
    }

    @Transactional
    public Ledger createLedger(Ledger ledger) {
        // Auto-generate code if empty
        if (ledger.getCode() == null || ledger.getCode().trim().isEmpty()) {
            long count = ledgerRepository.findByCompanyId(ledger.getCompanyId()).size() + 1;
            ledger.setCode("AC-" + String.format("%04d", count));
        }
        
        // Set current balance to opening balance initially
        if (ledger.getCurrentBalance() == null || ledger.getCurrentBalance().compareTo(BigDecimal.ZERO) == 0) {
            ledger.setCurrentBalance(ledger.getOpeningBalance());
        }
        Ledger saved = ledgerRepository.save(ledger);
        logAudit(saved.getCompanyId(), "CREATE_LEDGER", "ACCOUNTING", "Created ledger account: " + saved.getName() + " (" + saved.getCode() + "), opening: " + saved.getOpeningBalance());
        return saved;
    }

    private void logAudit(Long companyId, String action, String module, String details) {
        AuditLog log = AuditLog.builder()
                .companyId(companyId)
                .userId(1L)
                .username("system")
                .ipAddress("127.0.0.1")
                .action(action)
                .module(module)
                .details(details)
                .status("SUCCESS")
                .timestamp(java.time.LocalDateTime.now())
                .build();
        auditLogRepository.save(log);
    }

    // Ledger Group Methods
    public List<LedgerGroup> getLedgerGroups(Long companyId) {
        return ledgerGroupRepository.findByCompanyId(companyId);
    }

    @Transactional
    public LedgerGroup createLedgerGroup(LedgerGroup group) {
        if (group.getCode() == null || group.getCode().trim().isEmpty()) {
            long count = ledgerGroupRepository.findByCompanyId(group.getCompanyId()).size() + 1;
            group.setCode("GRP-" + String.format("%03d", count));
        }
        LedgerGroup saved = ledgerGroupRepository.save(group);
        logAudit(saved.getCompanyId(), "CREATE_LEDGER_GROUP", "ACCOUNTING", "Created ledger group: " + saved.getName() + " (" + saved.getCode() + ")");
        return saved;
    }

    @Transactional
    public void postJournalEntry(Long companyId, Long voucherId, Long ledgerId, 
                                 BigDecimal debit, BigDecimal credit, LocalDate date, String narration) {
        Ledger ledger = ledgerRepository.findById(ledgerId)
                .orElseThrow(() -> new RuntimeException("Ledger not found: " + ledgerId));

        Long profitCentreId = null;
        if (voucherId != null) {
            Optional<Voucher> optVoucher = voucherRepository.findById(voucherId);
            if (optVoucher.isPresent()) {
                profitCentreId = optVoucher.get().getProfitCentreId();
            }
        }

        JournalEntry entry = JournalEntry.builder()
                .companyId(companyId)
                .voucherId(voucherId)
                .profitCentreId(profitCentreId)
                .ledgerId(ledgerId)
                .debitAmount(debit)
                .creditAmount(credit)
                .entryDate(date)
                .narration(narration)
                .build();
        journalEntryRepository.save(entry);

        // Adjust Ledger Balance
        // Assets & Expenses: Debits increase balance, Credits decrease balance
        // Liabilities, Equity, Incomes: Credits increase balance, Debits decrease balance
        String type = ledger.getType();
        BigDecimal balanceChange = BigDecimal.ZERO;
        
        if (type.equals("CUSTOMER") || type.equals("BANK") || type.equals("CASH") || type.equals("EXPENSE")) {
            balanceChange = debit.subtract(credit);
        } else if (type.equals("SUPPLIER") || type.equals("INCOME")) {
            balanceChange = credit.subtract(debit);
        }
        
        ledger.setCurrentBalance(ledger.getCurrentBalance().add(balanceChange));
        ledgerRepository.save(ledger);
    }

    // Trial Balance Report
    public List<Map<String, Object>> getTrialBalance(Long companyId) {
        List<Ledger> ledgers = ledgerRepository.findByCompanyId(companyId);
        List<Map<String, Object>> rows = new ArrayList<>();
        
        for (Ledger l : ledgers) {
            Map<String, Object> row = new HashMap<>();
            row.put("ledgerId", l.getId());
            row.put("name", l.getName());
            row.put("code", l.getCode());
            row.put("type", l.getType());
            
            BigDecimal bal = l.getCurrentBalance();
            if (l.getType().equals("CUSTOMER") || l.getType().equals("BANK") || l.getType().equals("CASH") || l.getType().equals("EXPENSE")) {
                if (bal.compareTo(BigDecimal.ZERO) >= 0) {
                    row.put("debit", bal);
                    row.put("credit", BigDecimal.ZERO);
                } else {
                    row.put("debit", BigDecimal.ZERO);
                    row.put("credit", bal.abs());
                }
            } else {
                if (bal.compareTo(BigDecimal.ZERO) >= 0) {
                    row.put("debit", BigDecimal.ZERO);
                    row.put("credit", bal);
                } else {
                    row.put("debit", bal.abs());
                    row.put("credit", BigDecimal.ZERO);
                }
            }
            rows.add(row);
        }
        return rows;
    }

    // Profit & Loss Statement
    public Map<String, Object> getProfitAndLoss(Long companyId) {
        List<Ledger> ledgers = ledgerRepository.findByCompanyId(companyId);
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        
        List<Map<String, Object>> revenueLines = new ArrayList<>();
        List<Map<String, Object>> expenseLines = new ArrayList<>();

        for (Ledger l : ledgers) {
            if (l.getType().equals("INCOME")) {
                totalRevenue = totalRevenue.add(l.getCurrentBalance());
                revenueLines.add(Map.of("name", l.getName(), "amount", l.getCurrentBalance()));
            } else if (l.getType().equals("EXPENSE")) {
                totalExpense = totalExpense.add(l.getCurrentBalance());
                expenseLines.add(Map.of("name", l.getName(), "amount", l.getCurrentBalance()));
            }
        }

        BigDecimal netProfit = totalRevenue.subtract(totalExpense);
        
        Map<String, Object> report = new HashMap<>();
        report.put("revenueLines", revenueLines);
        report.put("expenseLines", expenseLines);
        report.put("totalRevenue", totalRevenue);
        report.put("totalExpense", totalExpense);
        report.put("netProfit", netProfit);
        
        return report;
    }

    // Balance Sheet
    public Map<String, Object> getBalanceSheet(Long companyId) {
        List<Ledger> ledgers = ledgerRepository.findByCompanyId(companyId);
        BigDecimal totalAssets = BigDecimal.ZERO;
        BigDecimal totalLiabilities = BigDecimal.ZERO;

        List<Map<String, Object>> assetLines = new ArrayList<>();
        List<Map<String, Object>> liabilityLines = new ArrayList<>();

        for (Ledger l : ledgers) {
            String type = l.getType();
            BigDecimal bal = l.getCurrentBalance();

            if (type.equals("BANK") || type.equals("CASH") || type.equals("CUSTOMER")) {
                totalAssets = totalAssets.add(bal);
                assetLines.add(Map.of("name", l.getName(), "amount", bal));
            } else if (type.equals("SUPPLIER")) {
                totalLiabilities = totalLiabilities.add(bal);
                liabilityLines.add(Map.of("name", l.getName(), "amount", bal));
            }
        }

        Map<String, Object> pl = getProfitAndLoss(companyId);
        BigDecimal netProfit = (BigDecimal) pl.get("netProfit");
        BigDecimal equityAndProfit = totalAssets.subtract(totalLiabilities);

        Map<String, Object> report = new HashMap<>();
        report.put("assetLines", assetLines);
        report.put("liabilityLines", liabilityLines);
        report.put("totalAssets", totalAssets);
        report.put("totalLiabilities", totalLiabilities);
        report.put("netProfit", netProfit);
        report.put("equity", equityAndProfit.subtract(netProfit)); // Initial Equity
        report.put("totalEquityAndLiabilities", totalAssets);
        
        return report;
    }

    // Customer Ageing Report
    public List<Map<String, Object>> getCustomerAgeing(Long companyId) {
        List<Ledger> customers = ledgerRepository.findByCompanyIdAndType(companyId, "CUSTOMER");
        List<Map<String, Object>> report = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (Ledger c : customers) {
            List<Voucher> outstandingSales = voucherRepository.findByCompanyIdAndTypeAndLedgerId(companyId, "SALES", c.getId());
            BigDecimal age0to30 = BigDecimal.ZERO;
            BigDecimal age31to60 = BigDecimal.ZERO;
            BigDecimal age61to90 = BigDecimal.ZERO;
            BigDecimal ageOver90 = BigDecimal.ZERO;
            BigDecimal totalOutstanding = BigDecimal.ZERO;

            for (Voucher v : outstandingSales) {
                BigDecimal outstanding = v.getOutstandingAmount();
                if (outstanding != null && outstanding.compareTo(BigDecimal.ZERO) > 0) {
                    totalOutstanding = totalOutstanding.add(outstanding);
                    long days = ChronoUnit.DAYS.between(v.getDate(), today);
                    if (days <= 30) {
                        age0to30 = age0to30.add(outstanding);
                    } else if (days <= 60) {
                        age31to60 = age31to60.add(outstanding);
                    } else if (days <= 90) {
                        age61to90 = age61to90.add(outstanding);
                    } else {
                        ageOver90 = ageOver90.add(outstanding);
                    }
                }
            }

            if (totalOutstanding.compareTo(BigDecimal.ZERO) > 0) {
                Map<String, Object> row = new HashMap<>();
                row.put("customerId", c.getId());
                row.put("customerName", c.getName());
                row.put("customerCode", c.getCode());
                row.put("totalOutstanding", totalOutstanding);
                row.put("age0to30", age0to30);
                row.put("age31to60", age31to60);
                row.put("age61to90", age61to90);
                row.put("ageOver90", ageOver90);
                report.add(row);
            }
        }

        return report;
    }

    // Profitability Reports
    public List<Map<String, Object>> getVoucherProfitability(Long companyId) {
        List<Voucher> salesVouchers = voucherRepository.findByCompanyIdAndType(companyId, "SALES");
        List<Map<String, Object>> list = new ArrayList<>();

        for (Voucher v : salesVouchers) {
            BigDecimal revenue = v.getSubTotal();
            BigDecimal cost = BigDecimal.ZERO;

            for (VoucherItem item : v.getItems()) {
                Optional<Product> optP = productRepository.findById(item.getProductId());
                if (optP.isPresent()) {
                    BigDecimal pCost = optP.get().getPurchasePrice();
                    if (pCost == null) pCost = BigDecimal.ZERO;
                    cost = cost.add(item.getQuantity().multiply(pCost));
                }
            }

            BigDecimal profit = revenue.subtract(cost);
            BigDecimal profitMargin = revenue.compareTo(BigDecimal.ZERO) > 0 
                    ? profit.divide(revenue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)) 
                    : BigDecimal.ZERO;

            Map<String, Object> row = new HashMap<>();
            row.put("voucherId", v.getId());
            row.put("voucherNumber", v.getVoucherNumber());
            row.put("date", v.getDate());
            row.put("revenue", revenue);
            row.put("cost", cost);
            row.put("profit", profit);
            row.put("margin", profitMargin.setScale(2, RoundingMode.HALF_UP));
            list.add(row);
        }
        return list;
    }

    public List<Map<String, Object>> getItemProfitability(Long companyId) {
        List<Voucher> salesVouchers = voucherRepository.findByCompanyIdAndType(companyId, "SALES");
        Map<Long, ProductProfitTracker> map = new HashMap<>();

        for (Voucher v : salesVouchers) {
            for (VoucherItem item : v.getItems()) {
                Long pId = item.getProductId();
                BigDecimal qty = item.getQuantity();
                BigDecimal itemSales = item.getQuantity().multiply(item.getRate());

                ProductProfitTracker tracker = map.computeIfAbsent(pId, k -> new ProductProfitTracker());
                tracker.salesQty = tracker.salesQty.add(qty);
                tracker.salesAmt = tracker.salesAmt.add(itemSales);
            }
        }

        List<Map<String, Object>> list = new ArrayList<>();
        for (Map.Entry<Long, ProductProfitTracker> entry : map.entrySet()) {
            Optional<Product> optP = productRepository.findById(entry.getKey());
            if (optP.isPresent()) {
                Product p = optP.get();
                BigDecimal salesQty = entry.getValue().salesQty;
                BigDecimal salesAmt = entry.getValue().salesAmt;
                BigDecimal costPrice = p.getPurchasePrice() != null ? p.getPurchasePrice() : BigDecimal.ZERO;
                BigDecimal totalCost = salesQty.multiply(costPrice);
                BigDecimal profit = salesAmt.subtract(totalCost);
                BigDecimal profitMargin = salesAmt.compareTo(BigDecimal.ZERO) > 0 
                        ? profit.divide(salesAmt, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)) 
                        : BigDecimal.ZERO;

                Map<String, Object> row = new HashMap<>();
                row.put("productId", p.getId());
                row.put("productName", p.getName());
                row.put("productCode", p.getCode());
                row.put("salesQuantity", salesQty);
                row.put("salesAmount", salesAmt);
                row.put("totalCost", totalCost);
                row.put("profit", profit);
                row.put("margin", profitMargin.setScale(2, RoundingMode.HALF_UP));
                list.add(row);
            }
        }

        return list;
    }

    private static class ProductProfitTracker {
        BigDecimal salesQty = BigDecimal.ZERO;
        BigDecimal salesAmt = BigDecimal.ZERO;
    }
}
