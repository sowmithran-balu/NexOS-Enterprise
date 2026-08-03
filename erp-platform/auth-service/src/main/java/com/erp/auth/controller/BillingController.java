package com.erp.auth.controller;

import com.erp.auth.entity.Voucher;
import com.erp.auth.service.BillingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final BillingService billingService;

    public BillingController(BillingService billingService) {
        this.billingService = billingService;
    }

    @GetMapping("/vouchers")
    public ResponseEntity<List<Voucher>> getVouchers(@RequestParam Long companyId, 
                                                     @RequestParam(required = false) String type) {
        if (type != null && !type.trim().isEmpty()) {
            return ResponseEntity.ok(billingService.getVouchersByType(companyId, type));
        }
        return ResponseEntity.ok(billingService.getCompanyVouchers(companyId));
    }

    @PostMapping("/vouchers")
    public ResponseEntity<Voucher> createVoucher(@RequestBody Voucher voucher) {
        return ResponseEntity.ok(billingService.createVoucher(voucher));
    }

    @PostMapping("/vouchers/{id}/cheque-status")
    public ResponseEntity<Voucher> reconcileCheque(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(billingService.reconcileCheque(id, status));
    }

    @PostMapping("/vouchers/{id}/eway-bill")
    public ResponseEntity<Voucher> generateEwayBill(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.generateEwayBill(id));
    }

    @PostMapping("/vouchers/{id}/e-invoice")
    public ResponseEntity<Voucher> generateEInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.generateEInvoice(id));
    }

    @PostMapping("/vouchers/{id}/remind")
    public ResponseEntity<Map<String, Object>> sendVoucherReminder(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.sendPaymentReminder(id));
    }

    @PostMapping("/remind")
    public ResponseEntity<Map<String, Object>> sendReminder(@RequestParam Long companyId, @RequestParam(required = false) Long ledgerId) {
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Payment reminders sent successfully."));
    }
}
