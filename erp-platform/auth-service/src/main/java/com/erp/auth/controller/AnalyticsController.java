package com.erp.auth.controller;

import com.erp.auth.entity.CrmLead;
import com.erp.auth.entity.Voucher;
import com.erp.auth.repository.CrmLeadRepository;
import com.erp.auth.repository.VoucherRepository;
import com.erp.org.entity.PayrollSlip;
import com.erp.org.entity.ProjectTask;
import com.erp.org.repository.PayrollSlipRepository;
import com.erp.org.repository.ProjectTaskRepository;
import com.erp.org.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final VoucherRepository voucherRepository;
    private final CrmLeadRepository crmLeadRepository;
    private final PayrollSlipRepository payrollSlipRepository;
    private final InventoryService inventoryService;
    private final ProjectTaskRepository projectTaskRepository;

    public AnalyticsController(VoucherRepository voucherRepository,
                               CrmLeadRepository crmLeadRepository,
                               PayrollSlipRepository payrollSlipRepository,
                               InventoryService inventoryService,
                               ProjectTaskRepository projectTaskRepository) {
        this.voucherRepository = voucherRepository;
        this.crmLeadRepository = crmLeadRepository;
        this.payrollSlipRepository = payrollSlipRepository;
        this.inventoryService = inventoryService;
        this.projectTaskRepository = projectTaskRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(@RequestParam Long companyId) {
        try {
            // 1. Total Sales Revenue (Sum of grandTotal for SALES vouchers)
            List<Voucher> salesVouchers = voucherRepository.findByCompanyIdAndType(companyId, "SALES");
            BigDecimal totalSalesRevenue = salesVouchers.stream()
                    .map(Voucher::getGrandTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // 2. Active Leads Count (CRM Leads with status != WON and != LOST)
            List<CrmLead> leads = crmLeadRepository.findByCompanyId(companyId);
            long activeLeadsCount = leads.stream()
                    .filter(l -> !l.getStatus().equalsIgnoreCase("WON") && !l.getStatus().equalsIgnoreCase("LOST"))
                    .count();

            // 3. Total Monthly Payroll Expenses (Sum of netSalary for PAID payroll slips)
            List<PayrollSlip> payrollSlips = payrollSlipRepository.findByCompanyId(companyId);
            BigDecimal totalMonthlyPayrollExpenses = payrollSlips.stream()
                    .filter(p -> p.getStatus().equalsIgnoreCase("PAID"))
                    .map(PayrollSlip::getNetSalary)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // 4. Inventory Valuation
            BigDecimal inventoryValuation = inventoryService.getStockValuation(companyId);

            // 5. Project Milestones Progress (Percentage of DONE tasks)
            List<ProjectTask> tasks = projectTaskRepository.findByCompanyId(companyId);
            double progress = 0.0;
            if (!tasks.isEmpty()) {
                long doneTasks = tasks.stream()
                        .filter(t -> t.getStatus().equalsIgnoreCase("DONE"))
                        .count();
                progress = ((double) doneTasks / tasks.size()) * 100.0;
            }

            return ResponseEntity.ok(Map.of(
                    "totalSalesRevenue", totalSalesRevenue,
                    "activeLeadsCount", activeLeadsCount,
                    "totalMonthlyPayrollExpenses", totalMonthlyPayrollExpenses,
                    "inventoryValuation", inventoryValuation,
                    "projectMilestonesProgress", progress
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
