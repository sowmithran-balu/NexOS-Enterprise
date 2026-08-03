package com.erp.auth.controller;

import com.erp.auth.entity.Ledger;
import com.erp.auth.entity.LedgerGroup;
import com.erp.auth.service.AccountingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounting")
public class AccountingController {

    private final AccountingService accountingService;

    public AccountingController(AccountingService accountingService) {
        this.accountingService = accountingService;
    }

    @GetMapping("/ledger-groups")
    public ResponseEntity<List<LedgerGroup>> getLedgerGroups(@RequestParam Long companyId) {
        return ResponseEntity.ok(accountingService.getLedgerGroups(companyId));
    }

    @PostMapping("/ledger-groups")
    public ResponseEntity<LedgerGroup> createLedgerGroup(@RequestBody LedgerGroup group) {
        return ResponseEntity.ok(accountingService.createLedgerGroup(group));
    }

    @GetMapping("/ledgers")
    public ResponseEntity<List<Ledger>> getLedgers(@RequestParam Long companyId) {
        return ResponseEntity.ok(accountingService.getCompanyLedgers(companyId));
    }

    @PostMapping("/ledgers")
    public ResponseEntity<Ledger> createLedger(@RequestBody Ledger ledger) {
        return ResponseEntity.ok(accountingService.createLedger(ledger));
    }

    @GetMapping("/trial-balance")
    public ResponseEntity<List<Map<String, Object>>> getTrialBalance(@RequestParam Long companyId) {
        return ResponseEntity.ok(accountingService.getTrialBalance(companyId));
    }

    @GetMapping("/profit-loss")
    public ResponseEntity<Map<String, Object>> getProfitLoss(@RequestParam Long companyId) {
        return ResponseEntity.ok(accountingService.getProfitAndLoss(companyId));
    }

    @GetMapping("/balance-sheet")
    public ResponseEntity<Map<String, Object>> getBalanceSheet(@RequestParam Long companyId) {
        return ResponseEntity.ok(accountingService.getBalanceSheet(companyId));
    }

    @GetMapping("/customer-ageing")
    public ResponseEntity<List<Map<String, Object>>> getCustomerAgeing(@RequestParam Long companyId) {
        return ResponseEntity.ok(accountingService.getCustomerAgeing(companyId));
    }

    @GetMapping("/voucher-profitability")
    public ResponseEntity<List<Map<String, Object>>> getVoucherProfitability(@RequestParam Long companyId) {
        return ResponseEntity.ok(accountingService.getVoucherProfitability(companyId));
    }

    @GetMapping("/item-profitability")
    public ResponseEntity<List<Map<String, Object>>> getItemProfitability(@RequestParam Long companyId) {
        return ResponseEntity.ok(accountingService.getItemProfitability(companyId));
    }
}
