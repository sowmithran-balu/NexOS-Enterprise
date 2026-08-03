package com.erp.auth.controller;

import com.erp.org.entity.*;
import com.erp.org.service.OrgService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/org")
public class OrgController {

    private final OrgService orgService;

    public OrgController(OrgService orgService) {
        this.orgService = orgService;
    }

    @GetMapping("/companies")
    public ResponseEntity<List<Company>> getAllCompanies() {
        return ResponseEntity.ok(orgService.getAllCompanies());
    }

    @GetMapping("/companies/{id}")
    public ResponseEntity<Company> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(orgService.getCompanyById(id));
    }

    @PostMapping("/companies")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Company> createCompany(@RequestBody Company company) {
        return ResponseEntity.ok(orgService.createCompany(company));
    }

    @GetMapping("/companies/{companyId}/branches")
    public ResponseEntity<List<Branch>> getBranchesByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(orgService.getBranchesByCompany(companyId));
    }

    @PostMapping("/branches")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Branch> createBranch(@RequestBody Branch branch) {
        return ResponseEntity.ok(orgService.createBranch(branch));
    }

    @GetMapping("/branches/{branchId}/departments")
    public ResponseEntity<List<Department>> getDepartmentsByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(orgService.getDepartmentsByBranch(branchId));
    }

    @GetMapping("/companies/{companyId}/departments")
    public ResponseEntity<List<Department>> getDepartmentsByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(orgService.getDepartmentsByCompany(companyId));
    }

    @PostMapping("/departments")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        return ResponseEntity.ok(orgService.createDepartment(department));
    }

    @GetMapping("/companies/{companyId}/cost-centers")
    public ResponseEntity<List<CostCenter>> getCostCentersByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(orgService.getCostCentersByCompany(companyId));
    }

    @PostMapping("/cost-centers")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<CostCenter> createCostCenter(@RequestBody CostCenter costCenter) {
        return ResponseEntity.ok(orgService.createCostCenter(costCenter));
    }

    @GetMapping("/companies/{companyId}/profit-centers")
    public ResponseEntity<List<ProfitCenter>> getProfitCentersByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(orgService.getProfitCentersByCompany(companyId));
    }

    @PostMapping("/profit-centers")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ProfitCenter> createProfitCenter(@RequestBody ProfitCenter profitCenter) {
        return ResponseEntity.ok(orgService.createProfitCenter(profitCenter));
    }

    @GetMapping("/companies/{companyId}/fiscal-years")
    public ResponseEntity<List<FiscalYear>> getFiscalYearsByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(orgService.getFiscalYearsByCompany(companyId));
    }

    @PostMapping("/fiscal-years")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<FiscalYear> createFiscalYear(@RequestBody FiscalYear fiscalYear) {
        return ResponseEntity.ok(orgService.createFiscalYear(fiscalYear));
    }
}
