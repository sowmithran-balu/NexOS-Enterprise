package com.erp.org.service;

import com.erp.org.entity.*;
import com.erp.org.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class OrgService {

    private final CompanyRepository companyRepository;
    private final BranchRepository branchRepository;
    private final DepartmentRepository departmentRepository;
    private final CostCenterRepository costCenterRepository;
    private final ProfitCenterRepository profitCenterRepository;
    private final FiscalYearRepository fiscalYearRepository;

    public OrgService(CompanyRepository companyRepository,
                      BranchRepository branchRepository,
                      DepartmentRepository departmentRepository,
                      CostCenterRepository costCenterRepository,
                      ProfitCenterRepository profitCenterRepository,
                      FiscalYearRepository fiscalYearRepository) {
        this.companyRepository = companyRepository;
        this.branchRepository = branchRepository;
        this.departmentRepository = departmentRepository;
        this.costCenterRepository = costCenterRepository;
        this.profitCenterRepository = profitCenterRepository;
        this.fiscalYearRepository = fiscalYearRepository;
    }

    @Transactional
    public Company createCompany(Company company) {
        Company savedCompany = companyRepository.save(company);

        // Auto-create default Headquarters Branch
        Branch defaultBranch = Branch.builder()
                .companyId(savedCompany.getId())
                .name("Headquarters")
                .code("HQ")
                .address(savedCompany.getAddress())
                .active(true)
                .build();
        Branch savedBranch = branchRepository.save(defaultBranch);

        // Auto-create default Admin Department
        Department defaultDept = Department.builder()
                .companyId(savedCompany.getId())
                .branchId(savedBranch.getId())
                .name("General Administration")
                .code("ADMIN")
                .active(true)
                .build();
        departmentRepository.save(defaultDept);

        // Auto-create default Fiscal Year
        int currentYear = LocalDate.now().getYear();
        FiscalYear defaultFy = FiscalYear.builder()
                .companyId(savedCompany.getId())
                .name("FY-" + currentYear)
                .startDate(LocalDate.of(currentYear, 1, 1))
                .endDate(LocalDate.of(currentYear, 12, 31))
                .status("OPEN")
                .active(true)
                .build();
        fiscalYearRepository.save(defaultFy);

        return savedCompany;
    }

    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    public Company getCompanyById(Long id) {
        return companyRepository.findById(id).orElseThrow(() -> new RuntimeException("Company not found"));
    }

    @Transactional
    public Branch createBranch(Branch branch) {
        return branchRepository.save(branch);
    }

    public List<Branch> getBranchesByCompany(Long companyId) {
        return branchRepository.findByCompanyId(companyId);
    }

    public Branch getBranchById(Long id) {
        return branchRepository.findById(id).orElseThrow(() -> new RuntimeException("Branch not found"));
    }

    @Transactional
    public Department createDepartment(Department department) {
        return departmentRepository.save(department);
    }

    public List<Department> getDepartmentsByBranch(Long branchId) {
        return departmentRepository.findByBranchId(branchId);
    }

    public List<Department> getDepartmentsByCompany(Long companyId) {
        return departmentRepository.findByCompanyId(companyId);
    }

    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id).orElseThrow(() -> new RuntimeException("Department not found"));
    }

    @Transactional
    public CostCenter createCostCenter(CostCenter costCenter) {
        return costCenterRepository.save(costCenter);
    }

    public List<CostCenter> getCostCentersByCompany(Long companyId) {
        return costCenterRepository.findByCompanyId(companyId);
    }

    @Transactional
    public ProfitCenter createProfitCenter(ProfitCenter profitCenter) {
        return profitCenterRepository.save(profitCenter);
    }

    public List<ProfitCenter> getProfitCentersByCompany(Long companyId) {
        return profitCenterRepository.findByCompanyId(companyId);
    }

    @Transactional
    public FiscalYear createFiscalYear(FiscalYear fiscalYear) {
        return fiscalYearRepository.save(fiscalYear);
    }

    public List<FiscalYear> getFiscalYearsByCompany(Long companyId) {
        return fiscalYearRepository.findByCompanyId(companyId);
    }
}
