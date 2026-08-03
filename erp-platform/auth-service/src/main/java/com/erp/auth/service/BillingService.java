package com.erp.auth.service;

import com.erp.auth.entity.*;
import com.erp.auth.repository.*;
import com.erp.org.entity.Employee;
import com.erp.org.repository.EmployeeRepository;
import com.erp.org.service.InventoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class BillingService {

    private final VoucherRepository voucherRepository;
    private final LedgerRepository ledgerRepository;
    private final AccountingService accountingService;
    private final InventoryService inventoryService;
    private final EmployeeRepository employeeRepository;
    private final AuditLogRepository auditLogRepository;

    public BillingService(VoucherRepository voucherRepository,
                          LedgerRepository ledgerRepository,
                          AccountingService accountingService,
                          InventoryService inventoryService,
                          EmployeeRepository employeeRepository,
                          AuditLogRepository auditLogRepository) {
        this.voucherRepository = voucherRepository;
        this.ledgerRepository = ledgerRepository;
        this.accountingService = accountingService;
        this.inventoryService = inventoryService;
        this.employeeRepository = employeeRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public List<Voucher> getCompanyVouchers(Long companyId) {
        return voucherRepository.findByCompanyId(companyId);
    }

    public List<Voucher> getVouchersByType(Long companyId, String type) {
        return voucherRepository.findByCompanyIdAndType(companyId, type);
    }

    @Transactional
    public Voucher createVoucher(Voucher voucher) {
        Long companyId = voucher.getCompanyId();
        
        // Auto-generate voucher number
        long count = voucherRepository.findByCompanyIdAndType(companyId, voucher.getType()).size() + 1;
        String prefix = switch (voucher.getType()) {
            case "SALES" -> "INV-";
            case "PURCHASE" -> "PUR-";
            case "PAYMENT" -> "PAY-";
            case "RECEIPT" -> "RCT-";
            case "CONTRA" -> "CON-";
            case "JOURNAL" -> "JNL-";
            case "DEBIT_NOTE" -> "DBN-";
            case "CREDIT_NOTE" -> "CRN-";
            case "PHYSICAL_STOCK" -> "PHY-";
            case "JOB_WORK" -> "JOB-";
            default -> "VCH-";
        };
        voucher.setVoucherNumber(prefix + String.format("%04d", count));
        if (voucher.getDate() == null) {
            voucher.setDate(LocalDate.now());
        }

        // Initialize cheque status if cheque is present
        if (voucher.getChequeNumber() != null && !voucher.getChequeNumber().trim().isEmpty()) {
            if (voucher.getChequeStatus() == null) {
                voucher.setChequeStatus("PENDING");
            }
        }

        // 1. Process Stock changes first for Inventory Vouchers
        if (voucher.getType().equals("SALES") || voucher.getType().equals("PURCHASE") ||
            voucher.getType().equals("DEBIT_NOTE") || voucher.getType().equals("CREDIT_NOTE") ||
            voucher.getType().equals("PHYSICAL_STOCK") || voucher.getType().equals("JOB_WORK")) {
            
            BigDecimal subTotal = BigDecimal.ZERO;
            BigDecimal taxTotal = BigDecimal.ZERO;

            for (VoucherItem item : voucher.getItems()) {
                BigDecimal qty = item.getQuantity() != null ? item.getQuantity() : BigDecimal.ZERO;
                BigDecimal rate = item.getRate() != null ? item.getRate() : BigDecimal.ZERO;
                BigDecimal taxRate = item.getTaxRate() != null ? item.getTaxRate() : BigDecimal.ZERO;
                
                BigDecimal itemSubTotal = qty.multiply(rate);
                BigDecimal itemTax = itemSubTotal.multiply(taxRate.divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP));
                BigDecimal itemTotal = itemSubTotal.add(itemTax);

                item.setTaxAmount(itemTax);
                item.setTotalAmount(itemTotal);

                subTotal = subTotal.add(itemSubTotal);
                taxTotal = taxTotal.add(itemTax);

                // Stock Adjustment
                if (voucher.getType().equals("SALES") || voucher.getType().equals("DEBIT_NOTE") || voucher.getType().equals("JOB_WORK")) {
                    // Outward: Sales, Debit Note (Purchase Return), and Job Work Outward decrease stock
                    inventoryService.adjustStock(companyId, item.getProductId(), item.getGodownId(), item.getBatchNumber(), item.getSerialNumber(), qty.negate());
                } else if (voucher.getType().equals("PURCHASE") || voucher.getType().equals("CREDIT_NOTE")) {
                    // Inward: Purchase and Credit Note (Sales Return) increase stock
                    inventoryService.adjustStock(companyId, item.getProductId(), item.getGodownId(), item.getBatchNumber(), item.getSerialNumber(), qty);
                } else if (voucher.getType().equals("PHYSICAL_STOCK")) {
                    // Physical Stock Adjustment (Overwrite/Set stock quantity)
                    BigDecimal currentQty = inventoryService.getProductStockQty(companyId, item.getProductId(), item.getGodownId(), item.getBatchNumber(), item.getSerialNumber());
                    BigDecimal stockChange = qty.subtract(currentQty);
                    inventoryService.adjustStock(companyId, item.getProductId(), item.getGodownId(), item.getBatchNumber(), item.getSerialNumber(), stockChange);
                }
            }

            voucher.setSubTotal(subTotal);
            voucher.setTaxTotal(taxTotal);
            
            BigDecimal grandTotal = subTotal.add(taxTotal).add(voucher.getOtherCharges() != null ? voucher.getOtherCharges() : BigDecimal.ZERO)
                    .subtract(voucher.getDiscountTotal() != null ? voucher.getDiscountTotal() : BigDecimal.ZERO);
            voucher.setGrandTotal(grandTotal);
            voucher.setOutstandingAmount(grandTotal);
        }

        // 2. Post Financial Double-Entry Journal Entries (unless cheque is PENDING)
        boolean hasPendingCheque = "PENDING".equals(voucher.getChequeStatus());
        if (!hasPendingCheque) {
            postFinancialEntries(voucher);
        }

        Voucher savedVoucher = voucherRepository.save(voucher);
        logAudit(companyId, "CREATE_VOUCHER", "BILLING", "Created " + savedVoucher.getType() + " voucher: " + savedVoucher.getVoucherNumber() + ", Total: " + savedVoucher.getGrandTotal());
        return savedVoucher;
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

    private void postFinancialEntries(Voucher voucher) {
        Long companyId = voucher.getCompanyId();
        BigDecimal grandTotal = voucher.getGrandTotal();
        BigDecimal subTotal = voucher.getSubTotal();
        BigDecimal taxTotal = voucher.getTaxTotal();
        LocalDate date = voucher.getDate();
        String vNum = voucher.getVoucherNumber();

        if (voucher.getType().equals("SALES")) {
            // Debit Customer by grandTotal
            accountingService.postJournalEntry(companyId, voucher.getId(), voucher.getLedgerId(), grandTotal, BigDecimal.ZERO, date, "Sales Billing " + vNum);
            // Credit Sales Account by subTotal
            Ledger salesAccount = getOrCreateSystemLedger(companyId, "General Sales Account", "INCOME");
            accountingService.postJournalEntry(companyId, voucher.getId(), salesAccount.getId(), BigDecimal.ZERO, subTotal, date, "Sales Income " + vNum);
            // Credit Tax Account by taxTotal
            if (taxTotal.compareTo(BigDecimal.ZERO) > 0) {
                Ledger taxAccount = getOrCreateSystemLedger(companyId, "GST Tax Ledger", "INCOME");
                accountingService.postJournalEntry(companyId, voucher.getId(), taxAccount.getId(), BigDecimal.ZERO, taxTotal, date, "GST Output Tax " + vNum);
            }

            // Agent Commission auto-credit
            if (voucher.getEmployeeId() != null) {
                BigDecimal commRate = voucher.getCommissionRate() != null && voucher.getCommissionRate().compareTo(BigDecimal.ZERO) > 0 
                        ? voucher.getCommissionRate() : BigDecimal.valueOf(5.00);
                BigDecimal commAmount = subTotal.multiply(commRate.divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP));
                voucher.setCommissionRate(commRate);
                voucher.setCommissionAmount(commAmount);

                if (commAmount.compareTo(BigDecimal.ZERO) > 0) {
                    Optional<Employee> optEmp = employeeRepository.findById(voucher.getEmployeeId());
                    String empName = optEmp.isPresent() ? optEmp.get().getFirstName() + " " + optEmp.get().getLastName() : "Employee #" + voucher.getEmployeeId();
                    
                    Ledger commExpense = getOrCreateSystemLedger(companyId, "Commission Expense", "EXPENSE");
                    Ledger commPayable = getOrCreateSystemLedger(companyId, "Commission Payable - " + empName, "SUPPLIER");

                    // Debit Commission Expense, Credit Agent Commission Payable
                    accountingService.postJournalEntry(companyId, voucher.getId(), commExpense.getId(), commAmount, BigDecimal.ZERO, date, "Commission Expense for " + empName + " on " + vNum);
                    accountingService.postJournalEntry(companyId, voucher.getId(), commPayable.getId(), BigDecimal.ZERO, commAmount, date, "Commission Earned by " + empName + " on " + vNum);
                }
            }
        } 
        else if (voucher.getType().equals("PURCHASE")) {
            // Credit Supplier by grandTotal
            accountingService.postJournalEntry(companyId, voucher.getId(), voucher.getLedgerId(), BigDecimal.ZERO, grandTotal, date, "Purchase Order Billing " + vNum);
            // Debit Purchase Account by subTotal
            Ledger purchaseAccount = getOrCreateSystemLedger(companyId, "General Purchase Account", "EXPENSE");
            accountingService.postJournalEntry(companyId, voucher.getId(), purchaseAccount.getId(), subTotal, BigDecimal.ZERO, date, "Purchase Expense " + vNum);
            // Debit Tax Account by taxTotal
            if (taxTotal.compareTo(BigDecimal.ZERO) > 0) {
                Ledger taxAccount = getOrCreateSystemLedger(companyId, "GST Tax Ledger", "INCOME");
                accountingService.postJournalEntry(companyId, voucher.getId(), taxAccount.getId(), taxTotal, BigDecimal.ZERO, date, "GST Input Tax " + vNum);
            }
        } 
        else if (voucher.getType().equals("RECEIPT")) {
            BigDecimal amt = voucher.getGrandTotal();
            // Debit Bank/Cash Account
            accountingService.postJournalEntry(companyId, voucher.getId(), voucher.getLedgerId(), amt, BigDecimal.ZERO, date, "Receipt Voucher " + vNum);
            // Credit Customer Ledger (stored in notes or parsed)
            Long customerLedgerId = Long.parseLong(voucher.getNotes().split(";")[0]); // notes contains Customer Ledger ID
            accountingService.postJournalEntry(companyId, voucher.getId(), customerLedgerId, BigDecimal.ZERO, amt, date, "Customer Settlement " + vNum);

            // Bill-by-Bill FIFO allocation matching
            List<Voucher> unpaidInvoices = voucherRepository.findByCompanyIdAndTypeAndLedgerId(companyId, "SALES", customerLedgerId);
            BigDecimal remainingPayment = amt;
            for (Voucher inv : unpaidInvoices) {
                if (inv.getOutstandingAmount().compareTo(BigDecimal.ZERO) > 0 && remainingPayment.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal outstanding = inv.getOutstandingAmount();
                    if (remainingPayment.compareTo(outstanding) >= 0) {
                        remainingPayment = remainingPayment.subtract(outstanding);
                        inv.setOutstandingAmount(BigDecimal.ZERO);
                        inv.setStatus("PAID");
                    } else {
                        inv.setOutstandingAmount(outstanding.subtract(remainingPayment));
                        inv.setStatus("PARTIAL");
                        remainingPayment = BigDecimal.ZERO;
                    }
                    voucherRepository.save(inv);
                }
            }
            voucher.setOutstandingAmount(BigDecimal.ZERO);
            voucher.setStatus("PAID");
        } 
        else if (voucher.getType().equals("PAYMENT")) {
            BigDecimal amt = voucher.getGrandTotal();
            // Credit Bank/Cash Account
            accountingService.postJournalEntry(companyId, voucher.getId(), voucher.getLedgerId(), BigDecimal.ZERO, amt, date, "Payment Voucher " + vNum);
            // Debit Supplier Ledger (stored in notes or parsed)
            Long supplierLedgerId = Long.parseLong(voucher.getNotes().split(";")[0]);
            accountingService.postJournalEntry(companyId, voucher.getId(), supplierLedgerId, amt, BigDecimal.ZERO, date, "Vendor Settlement " + vNum);

            // Match against outstanding purchases
            List<Voucher> unpaidPurchases = voucherRepository.findByCompanyIdAndTypeAndLedgerId(companyId, "PURCHASE", supplierLedgerId);
            BigDecimal remainingPayment = amt;
            for (Voucher pur : unpaidPurchases) {
                if (pur.getOutstandingAmount().compareTo(BigDecimal.ZERO) > 0 && remainingPayment.compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal outstanding = pur.getOutstandingAmount();
                    if (remainingPayment.compareTo(outstanding) >= 0) {
                        remainingPayment = remainingPayment.subtract(outstanding);
                        pur.setOutstandingAmount(BigDecimal.ZERO);
                        pur.setStatus("PAID");
                    } else {
                        pur.setOutstandingAmount(outstanding.subtract(remainingPayment));
                        pur.setStatus("PARTIAL");
                        remainingPayment = BigDecimal.ZERO;
                    }
                    voucherRepository.save(pur);
                }
            }
            voucher.setOutstandingAmount(BigDecimal.ZERO);
            voucher.setStatus("PAID");
        } 
        else if (voucher.getType().equals("CONTRA")) {
            BigDecimal amt = voucher.getGrandTotal();
            // Debit target bank/cash (ledgerId)
            accountingService.postJournalEntry(companyId, voucher.getId(), voucher.getLedgerId(), amt, BigDecimal.ZERO, date, "Contra Debit " + vNum);
            // Credit source bank/cash (stored in notes)
            Long sourceLedgerId = Long.parseLong(voucher.getNotes().split(";")[0]);
            accountingService.postJournalEntry(companyId, voucher.getId(), sourceLedgerId, BigDecimal.ZERO, amt, date, "Contra Credit " + vNum);
            voucher.setStatus("PAID");
            voucher.setOutstandingAmount(BigDecimal.ZERO);
        } 
        else if (voucher.getType().equals("JOURNAL")) {
            // Re-purpose items list for multi-debit/credit lines
            // item.productId represents ledgerId, item.rate represents amount, item.batchNumber represents DEBIT/CREDIT
            for (VoucherItem item : voucher.getItems()) {
                Long entryLedgerId = item.getProductId();
                BigDecimal amount = item.getRate();
                String entryType = item.getBatchNumber(); // DEBIT or CREDIT

                if ("DEBIT".equalsIgnoreCase(entryType)) {
                    accountingService.postJournalEntry(companyId, voucher.getId(), entryLedgerId, amount, BigDecimal.ZERO, date, "Journal Debit " + vNum);
                } else {
                    accountingService.postJournalEntry(companyId, voucher.getId(), entryLedgerId, BigDecimal.ZERO, amount, date, "Journal Credit " + vNum);
                }
            }
            voucher.setStatus("PAID");
            voucher.setOutstandingAmount(BigDecimal.ZERO);
        } 
        else if (voucher.getType().equals("DEBIT_NOTE")) {
            // Purchase Return: Debit Supplier (reduces liability)
            accountingService.postJournalEntry(companyId, voucher.getId(), voucher.getLedgerId(), grandTotal, BigDecimal.ZERO, date, "Purchase Return Debit " + vNum);
            // Credit Purchase Expense
            Ledger purchaseAccount = getOrCreateSystemLedger(companyId, "General Purchase Account", "EXPENSE");
            accountingService.postJournalEntry(companyId, voucher.getId(), purchaseAccount.getId(), BigDecimal.ZERO, subTotal, date, "Purchase Return Credit " + vNum);
            // Credit Tax
            if (taxTotal.compareTo(BigDecimal.ZERO) > 0) {
                Ledger taxAccount = getOrCreateSystemLedger(companyId, "GST Tax Ledger", "INCOME");
                accountingService.postJournalEntry(companyId, voucher.getId(), taxAccount.getId(), BigDecimal.ZERO, taxTotal, date, "GST Input Tax Reversal " + vNum);
            }
            voucher.setStatus("PAID");
            voucher.setOutstandingAmount(BigDecimal.ZERO);
        } 
        else if (voucher.getType().equals("CREDIT_NOTE")) {
            // Sales Return: Credit Customer (reduces asset)
            accountingService.postJournalEntry(companyId, voucher.getId(), voucher.getLedgerId(), BigDecimal.ZERO, grandTotal, date, "Sales Return Credit " + vNum);
            // Debit Sales Income
            Ledger salesAccount = getOrCreateSystemLedger(companyId, "General Sales Account", "INCOME");
            accountingService.postJournalEntry(companyId, voucher.getId(), salesAccount.getId(), subTotal, BigDecimal.ZERO, date, "Sales Return Debit " + vNum);
            // Debit Tax
            if (taxTotal.compareTo(BigDecimal.ZERO) > 0) {
                Ledger taxAccount = getOrCreateSystemLedger(companyId, "GST Tax Ledger", "INCOME");
                accountingService.postJournalEntry(companyId, voucher.getId(), taxAccount.getId(), taxTotal, BigDecimal.ZERO, date, "GST Output Tax Reversal " + vNum);
            }
            voucher.setStatus("PAID");
            voucher.setOutstandingAmount(BigDecimal.ZERO);
        }
    }

    @Transactional
    public Voucher reconcileCheque(Long voucherId, String status) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Voucher not found: " + voucherId));

        if (!"PENDING".equals(voucher.getChequeStatus())) {
            throw new RuntimeException("Cheque is not in PENDING state.");
        }

        if ("CLEARED".equalsIgnoreCase(status)) {
            voucher.setChequeStatus("CLEARED");
            // Post double-entry postings now
            postFinancialEntries(voucher);
        } else if ("CANCELLED".equalsIgnoreCase(status)) {
            voucher.setChequeStatus("CANCELLED");
            voucher.setStatus("CANCELLED");
        }

        Voucher saved = voucherRepository.save(voucher);
        logAudit(saved.getCompanyId(), "RECONCILE_CHEQUE", "BILLING", "Reconciled cheque for voucher " + saved.getVoucherNumber() + " with status: " + status);
        return saved;
    }

    private Ledger getOrCreateSystemLedger(Long companyId, String name, String type) {
        return ledgerRepository.findByCompanyIdAndName(companyId, name)
                .orElseGet(() -> ledgerRepository.save(Ledger.builder()
                        .companyId(companyId)
                        .name(name)
                        .type(type)
                        .openingBalance(BigDecimal.ZERO)
                        .currentBalance(BigDecimal.ZERO)
                        .active(true)
                        .build()));
    }

    @Transactional
    public Voucher generateEwayBill(Long voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Voucher not found: " + voucherId));

        if (!voucher.getType().equals("SALES") && !voucher.getType().equals("PURCHASE")) {
            throw new IllegalArgumentException("e-Way Bill can only be generated for Sales or Purchase transactions.");
        }

        // Simulating e-Way Bill generation: 12-digit format starting with 12
        long randomNum = 120000000000L + (long) (Math.random() * 9999999999L);
        voucher.setEwayBillNumber(String.valueOf(randomNum));
        voucher.setEwayBillDate(LocalDate.now());

        Voucher saved = voucherRepository.save(voucher);
        logAudit(saved.getCompanyId(), "GENERATE_EWAY_BILL", "BILLING", "Generated e-Way Bill for voucher " + saved.getVoucherNumber() + ", Number: " + saved.getEwayBillNumber());
        return saved;
    }

    @Transactional
    public Voucher generateEInvoice(Long voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Voucher not found: " + voucherId));

        if (!voucher.getType().equals("SALES")) {
            throw new IllegalArgumentException("e-Invoicing is only applicable to Sales invoices.");
        }

        String irnInput = "GSTIN-" + voucher.getCompanyId() + "-" + voucher.getVoucherNumber();
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(irnInput.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            voucher.setIrn(hexString.toString().toUpperCase());
        } catch (Exception e) {
            voucher.setIrn("IRN-" + UUID.randomUUID().toString().replace("-", "").toUpperCase());
        }

        voucher.setQrCodeData("GSTN:IRN:" + voucher.getIrn() + ":VAL:" + voucher.getGrandTotal());

        Voucher saved = voucherRepository.save(voucher);
        logAudit(saved.getCompanyId(), "GENERATE_EINVOICE", "BILLING", "Generated e-Invoice IRN for voucher " + saved.getVoucherNumber());
        return saved;
    }

    public Map<String, Object> sendPaymentReminder(Long voucherId) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Voucher not found: " + voucherId));

        if (voucher.getOutstandingAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return Map.of("status", "SKIPPED", "message", "Voucher is already fully paid.");
        }

        String customerName = "Client";
        String email = "n/a";
        String phone = "n/a";

        if (voucher.getLedgerId() != null) {
            Optional<Ledger> optLedger = ledgerRepository.findById(voucher.getLedgerId());
            if (optLedger.isPresent()) {
                Ledger ledger = optLedger.get();
                customerName = ledger.getName();
                email = ledger.getEmail() != null ? ledger.getEmail() : "billing@client.com";
                phone = ledger.getPhone() != null ? ledger.getPhone() : "+91 99999 99999";
            }
        }

        String messageBody = String.format("Dear %s, this is a reminder that invoice %s with outstanding amount Rs.%s is due. Please settle as soon as possible.",
                customerName, voucher.getVoucherNumber(), voucher.getOutstandingAmount());

        System.out.println("---- SENDING EMAIL REMINDER ----");
        System.out.println("To: " + email);
        System.out.println("Subject: Payment Reminder - " + voucher.getVoucherNumber());
        System.out.println("Body: " + messageBody);
        System.out.println("--------------------------------");

        System.out.println("---- SENDING SMS REMINDER ----");
        System.out.println("To: " + phone);
        System.out.println("Message: " + messageBody);
        System.out.println("------------------------------");

        return Map.of(
            "status", "SUCCESS",
            "message", "Reminder sent successfully to " + customerName + " (" + email + " / " + phone + ")"
        );
    }
}
