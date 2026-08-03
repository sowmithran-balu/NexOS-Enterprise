package com.erp.auth;

import com.erp.auth.entity.*;
import com.erp.auth.repository.*;
import com.erp.org.entity.*;
import com.erp.org.repository.*;
import com.erp.org.service.OrgService;
import com.erp.org.service.InventoryService;
import com.erp.auth.service.AccountingService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@SpringBootApplication
@ComponentScan(basePackages = {"com.erp"})
@EntityScan(basePackages = {"com.erp"})
@EnableJpaRepositories(basePackages = {"com.erp"})
public class ErpApplication {

    public static void main(String[] academ) {
        SpringApplication.run(ErpApplication.class, academ);
    }

    @Bean
    public CommandLineRunner seedDatabase(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            OrgService orgService,
            InventoryService inventoryService,
            AccountingService accountingService,
            CrmLeadRepository crmLeadRepository,
            PasswordEncoder passwordEncoder,
            EmployeeRepository employeeRepository,
            AttendanceRepository attendanceRepository,
            LeaveRequestRepository leaveRequestRepository,
            PayrollSlipRepository payrollSlipRepository,
            ProjectRepository projectRepository,
            ProjectTaskRepository projectTaskRepository,
            TimesheetRepository timesheetRepository,
            DocumentVaultRepository documentVaultRepository) {
        return args -> {
            if (roleRepository.count() > 0) {
                return; // Already seeded
            }

            System.out.println("====== SEEDING SYSTEM DATABASE ======");

            // 1. Seed Permissions
            List<String> modules = Arrays.asList("ORG", "HR", "CRM", "SALES", "PURCHASE", "INVENTORY", "FINANCE", "PROJECTS", "AUDIT");
            List<String> actions = Arrays.asList("READ", "WRITE", "DELETE", "APPROVE");
            List<Permission> allPermissions = new ArrayList<>();

            for (String module : modules) {
                for (String action : actions) {
                    Permission perm = Permission.builder()
                            .module(module)
                            .action(action)
                            .description(String.format("Allows %s actions on module %s", action, module))
                            .build();
                    allPermissions.add(permissionRepository.save(perm));
                }
            }

            // 2. Seed Roles
            Role adminRole = Role.builder()
                    .name("ROLE_ADMIN")
                    .description("System Administrator - Full Access")
                    .permissions(new HashSet<>(allPermissions))
                    .build();
            roleRepository.save(adminRole);

            Set<Permission> managerPerms = new HashSet<>();
            for (Permission p : allPermissions) {
                if (!p.getAction().equals("DELETE")) {
                    managerPerms.add(p);
                }
            }
            Role managerRole = Role.builder()
                    .name("ROLE_MANAGER")
                    .description("Business Manager - Read, Write, and Approve")
                    .permissions(managerPerms)
                    .build();
            roleRepository.save(managerRole);

            Set<Permission> staffPerms = new HashSet<>();
            for (Permission p : allPermissions) {
                if (p.getAction().equals("READ")) {
                    staffPerms.add(p);
                }
            }
            Role staffRole = Role.builder()
                    .name("ROLE_STAFF")
                    .description("Staff Member - Read Only")
                    .permissions(staffPerms)
                    .build();
            roleRepository.save(staffRole);

            // 3. Seed Default Company
            Company acme = Company.builder()
                    .name("Acme Corporation")
                    .taxId("US-12345678")
                    .registrationNumber("REG-87654321")
                    .currency("USD")
                    .timeZone("UTC")
                    .language("en")
                    .address("123 Enterprise Way, Tech City")
                    .active(true)
                    .build();

            Company seededCompany = orgService.createCompany(acme);
            Long companyId = seededCompany.getId();

            List<Branch> branches = orgService.getBranchesByCompany(companyId);
            Branch hqBranch = branches.stream()
                    .filter(b -> b.getCode().equals("HQ"))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("HQ branch not seeded"));

            // 4. Seed Default Admin User
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("Admin@123"))
                    .email("admin@acme.com")
                    .firstName("System")
                    .lastName("Administrator")
                    .phone("+1-555-0199")
                    .mfaEnabled(false)
                    .currentCompanyId(companyId)
                    .currentBranchId(hqBranch.getId())
                    .active(true)
                    .roles(new HashSet<>(Collections.singletonList(adminRole)))
                    .build();
            userRepository.save(admin);

            // 5. Seed Godowns (Warehouses)
            Godown godownA = Godown.builder()
                    .companyId(companyId)
                    .name("Main Godown (A)")
                    .location("Zone 1, Central District")
                    .active(true)
                    .build();
            Godown seededGodownA = inventoryService.createGodown(godownA);

            Godown godownB = Godown.builder()
                    .companyId(companyId)
                    .name("City Warehouse (B)")
                    .location("Block C, Industrial Park")
                    .active(true)
                    .build();
            inventoryService.createGodown(godownB);

            // 6. Seed Products (Product Master)
            Product cement = Product.builder()
                    .companyId(companyId)
                    .name("Cement Grade 53")
                    .code("CEM53")
                    .hsnCode("2523")
                    .gstRate(BigDecimal.valueOf(28.00))
                    .purchasePrice(BigDecimal.valueOf(320.00))
                    .sellingPriceRetail(BigDecimal.valueOf(450.00))
                    .sellingPriceWholesale(BigDecimal.valueOf(400.00))
                    .sellingPriceDealer(BigDecimal.valueOf(380.00))
                    .unit("Bags")
                    .barcode("8901234567890")
                    .active(true)
                    .build();
            Product seededCement = inventoryService.createProduct(cement);

            Product steel = Product.builder()
                    .companyId(companyId)
                    .name("Steel Rebar 12mm")
                    .code("ST12")
                    .hsnCode("7214")
                    .gstRate(BigDecimal.valueOf(18.00))
                    .purchasePrice(BigDecimal.valueOf(65.00))
                    .sellingPriceRetail(BigDecimal.valueOf(85.00))
                    .sellingPriceWholesale(BigDecimal.valueOf(80.00))
                    .sellingPriceDealer(BigDecimal.valueOf(75.00))
                    .unit("Pcs")
                    .barcode("8901234567891")
                    .active(true)
                    .build();
            inventoryService.createProduct(steel);

            Product paint = Product.builder()
                    .companyId(companyId)
                    .name("Paint Premium Emulsion")
                    .code("PNT01")
                    .hsnCode("3209")
                    .gstRate(BigDecimal.valueOf(18.00))
                    .purchasePrice(BigDecimal.valueOf(1800.00))
                    .sellingPriceRetail(BigDecimal.valueOf(2400.00))
                    .sellingPriceWholesale(BigDecimal.valueOf(2200.00))
                    .sellingPriceDealer(BigDecimal.valueOf(2000.00))
                    .unit("Boxes")
                    .barcode("8901234567892")
                    .active(true)
                    .build();
            inventoryService.createProduct(paint);

            // 7. Seed Initial Stocks
            inventoryService.adjustStock(companyId, seededCement.getId(), seededGodownA.getId(), "B001", "S001", BigDecimal.valueOf(500));

            // 8. Seed Ledgers (Double-entry Accounts)
            Ledger cash = Ledger.builder()
                    .companyId(companyId)
                    .name("Cash Account")
                    .type("CASH")
                    .openingBalance(BigDecimal.valueOf(10000.00))
                    .currentBalance(BigDecimal.valueOf(10000.00))
                    .active(true)
                    .build();
            accountingService.createLedger(cash);

            Ledger bank = Ledger.builder()
                    .companyId(companyId)
                    .name("State Bank of India")
                    .type("BANK")
                    .openingBalance(BigDecimal.valueOf(250000.00))
                    .currentBalance(BigDecimal.valueOf(250000.00))
                    .active(true)
                    .build();
            accountingService.createLedger(bank);

            Ledger customer = Ledger.builder()
                    .companyId(companyId)
                    .name("Apex Construction Ltd")
                    .type("CUSTOMER")
                    .email("billing@apex.com")
                    .phone("+1-555-0888")
                    .taxId("27AAPCA8877A1Z1")
                    .openingBalance(BigDecimal.ZERO)
                    .currentBalance(BigDecimal.ZERO)
                    .creditLimit(BigDecimal.valueOf(100000.00))
                    .priceCategory("WHOLESALE")
                    .active(true)
                    .build();
            accountingService.createLedger(customer);

            Ledger supplier = Ledger.builder()
                    .companyId(companyId)
                    .name("Metals & Concrete Suppliers")
                    .type("SUPPLIER")
                    .email("sales@metalsconcrete.com")
                    .phone("+1-555-0999")
                    .taxId("27BBPCB7766B2Z2")
                    .openingBalance(BigDecimal.ZERO)
                    .currentBalance(BigDecimal.ZERO)
                    .creditLimit(BigDecimal.valueOf(500000.00))
                    .active(true)
                    .build();
            accountingService.createLedger(supplier);

            // Seed System accounting ledgers
            Ledger salesAcc = Ledger.builder()
                    .companyId(companyId)
                    .name("General Sales Account")
                    .type("INCOME")
                    .active(true)
                    .build();
            accountingService.createLedger(salesAcc);

            Ledger purchaseAcc = Ledger.builder()
                    .companyId(companyId)
                    .name("General Purchase Account")
                    .type("EXPENSE")
                    .active(true)
                    .build();
            accountingService.createLedger(purchaseAcc);

            Ledger taxAcc = Ledger.builder()
                    .companyId(companyId)
                    .name("GST Tax Ledger")
                    .type("INCOME")
                    .active(true)
                    .build();
            accountingService.createLedger(taxAcc);

            // 9. Seed CRM Leads
            CrmLead lead1 = CrmLead.builder()
                    .companyId(companyId)
                    .name("Empire Builders Project")
                    .contactPerson("David Miller")
                    .email("david@empire.com")
                    .phone("+1-555-0211")
                    .status("NEW")
                    .value(BigDecimal.valueOf(500000.00))
                    .lastFollowUpDate(LocalDate.now().minusDays(2))
                    .nextFollowUpDate(LocalDate.now().plusDays(4))
                    .notes("Interested in bulk Cement Grade 53 supply.")
                    .build();
            crmLeadRepository.save(lead1);

            CrmLead lead2 = CrmLead.builder()
                    .companyId(companyId)
                    .name("Metro Highway Contract")
                    .contactPerson("Sarah Jenkins")
                    .email("sarah@metrocon.com")
                    .phone("+1-555-0222")
                    .status("CONTACTED")
                    .value(BigDecimal.valueOf(1200000.00))
                    .lastFollowUpDate(LocalDate.now().minusDays(1))
                    .nextFollowUpDate(LocalDate.now().plusDays(2))
                    .notes("Enquiry about Steel Rebar. Custom lengths requested.")
                    .build();
            crmLeadRepository.save(lead2);

            // 10. Seed HRMS Employees
            Employee emp1 = Employee.builder()
                    .companyId(companyId)
                    .firstName("John")
                    .lastName("Doe")
                    .email("john.doe@acme.com")
                    .phone("+1-555-0101")
                    .position("Senior Developer")
                    .department("Engineering")
                    .hireDate(LocalDate.now().minusYears(1))
                    .baseSalary(BigDecimal.valueOf(7500.00))
                    .active(true)
                    .build();
            employeeRepository.save(emp1);

            Employee emp2 = Employee.builder()
                    .companyId(companyId)
                    .firstName("Jane")
                    .lastName("Smith")
                    .email("jane.smith@acme.com")
                    .phone("+1-555-0102")
                    .position("UI/UX Designer")
                    .department("Engineering")
                    .hireDate(LocalDate.now().minusMonths(6))
                    .baseSalary(BigDecimal.valueOf(6200.00))
                    .active(true)
                    .build();
            employeeRepository.save(emp2);

            Employee emp3 = Employee.builder()
                    .companyId(companyId)
                    .firstName("Bob")
                    .lastName("Johnson")
                    .email("bob.johnson@acme.com")
                    .phone("+1-555-0103")
                    .position("Project Manager")
                    .department("Operations")
                    .hireDate(LocalDate.now().minusYears(2))
                    .baseSalary(BigDecimal.valueOf(8500.00))
                    .active(true)
                    .build();
            employeeRepository.save(emp3);

            Employee emp4 = Employee.builder()
                    .companyId(companyId)
                    .firstName("Alice")
                    .lastName("Williams")
                    .email("alice.williams@acme.com")
                    .phone("+1-555-0104")
                    .position("HR Recruiter")
                    .department("Human Resources")
                    .hireDate(LocalDate.now().minusMonths(9))
                    .baseSalary(BigDecimal.valueOf(5500.00))
                    .active(true)
                    .build();
            employeeRepository.save(emp4);

            Employee emp5 = Employee.builder()
                    .companyId(companyId)
                    .firstName("Charlie")
                    .lastName("Brown")
                    .email("charlie.brown@acme.com")
                    .phone("+1-555-0105")
                    .position("Financial Accountant")
                    .department("Finance")
                    .hireDate(LocalDate.now().minusMonths(3))
                    .baseSalary(BigDecimal.valueOf(5800.00))
                    .active(true)
                    .build();
            employeeRepository.save(emp5);

            // 11. Seed Attendance entries (10+ entries)
            LocalDate startAttendanceDate = LocalDate.now().minusDays(5);
            for (int i = 0; i < 5; i++) {
                LocalDate date = startAttendanceDate.plusDays(i);
                // John Doe present
                attendanceRepository.save(Attendance.builder()
                        .companyId(companyId)
                        .employeeId(emp1.getId())
                        .date(date)
                        .checkIn(LocalTime.of(9, 0))
                        .checkOut(LocalTime.of(17, 30))
                        .status("PRESENT")
                        .build());
                // Jane Smith present
                attendanceRepository.save(Attendance.builder()
                        .companyId(companyId)
                        .employeeId(emp2.getId())
                        .date(date)
                        .checkIn(LocalTime.of(8, 55))
                        .checkOut(LocalTime.of(17, 0))
                        .status("PRESENT")
                        .build());
            }

            // 12. Seed Pending Leave Requests (2)
            leaveRequestRepository.save(LeaveRequest.builder()
                    .companyId(companyId)
                    .employeeId(emp1.getId())
                    .startDate(LocalDate.now().plusDays(2))
                    .endDate(LocalDate.now().plusDays(4))
                    .type("SICK")
                    .status("PENDING")
                    .reason("Medical checkup and recovery")
                    .build());

            leaveRequestRepository.save(LeaveRequest.builder()
                    .companyId(companyId)
                    .employeeId(emp2.getId())
                    .startDate(LocalDate.now().plusDays(7))
                    .endDate(LocalDate.now().plusDays(8))
                    .type("CASUAL")
                    .status("PENDING")
                    .reason("Family emergency event")
                    .build());

            // 13. Seed Projects (2 Projects with 3+ Kanban tasks each)
            Project proj1 = Project.builder()
                    .companyId(companyId)
                    .name("Commercial Office Build")
                    .description("Construction of the 5-story commercial space at Sector-V")
                    .startDate(LocalDate.now().minusMonths(1))
                    .endDate(LocalDate.now().plusMonths(6))
                    .status("ACTIVE")
                    .build();
            projectRepository.save(proj1);

            Project proj2 = Project.builder()
                    .companyId(companyId)
                    .name("ERP System Launch")
                    .description("Deployment and integration of NexOS modular ERP system")
                    .startDate(LocalDate.now().minusWeeks(2))
                    .endDate(LocalDate.now().plusMonths(3))
                    .status("ACTIVE")
                    .build();
            projectRepository.save(proj2);

            // Project 1 Tasks
            projectTaskRepository.save(ProjectTask.builder()
                    .companyId(companyId)
                    .projectId(proj1.getId())
                    .name("Foundation Excavation")
                    .description("Clear the plot and excavate soil up to 10m depth")
                    .assigneeId(emp3.getId())
                    .dueDate(LocalDate.now().minusWeeks(1))
                    .status("DONE")
                    .priority("HIGH")
                    .build());

            projectTaskRepository.save(ProjectTask.builder()
                    .companyId(companyId)
                    .projectId(proj1.getId())
                    .name("Steel Structure Erection")
                    .description("Erect steel framework for lower three floors")
                    .assigneeId(emp1.getId())
                    .dueDate(LocalDate.now().plusWeeks(2))
                    .status("IN_PROGRESS")
                    .priority("HIGH")
                    .build());

            projectTaskRepository.save(ProjectTask.builder()
                    .companyId(companyId)
                    .projectId(proj1.getId())
                    .name("Concrete Slab Pouring")
                    .description("Lay foundation cement slabs and reinforce structure")
                    .assigneeId(emp2.getId())
                    .dueDate(LocalDate.now().plusWeeks(6))
                    .status("TODO")
                    .priority("MEDIUM")
                    .build());

            // Project 2 Tasks
            projectTaskRepository.save(ProjectTask.builder()
                    .companyId(companyId)
                    .projectId(proj2.getId())
                    .name("Requirement Gathering")
                    .description("Understand and specify key workflows for org setting and RBAC")
                    .assigneeId(emp3.getId())
                    .dueDate(LocalDate.now().minusWeeks(2))
                    .status("DONE")
                    .priority("HIGH")
                    .build());

            projectTaskRepository.save(ProjectTask.builder()
                    .companyId(companyId)
                    .projectId(proj2.getId())
                    .name("Double-Entry Ledger Integration")
                    .description("Deploy core ledger schemas, journal entries, and trial balance calculations")
                    .assigneeId(emp1.getId())
                    .dueDate(LocalDate.now().plusWeeks(1))
                    .status("IN_PROGRESS")
                    .priority("MEDIUM")
                    .build());

            projectTaskRepository.save(ProjectTask.builder()
                    .companyId(companyId)
                    .projectId(proj2.getId())
                    .name("Document Vault OCR Parser")
                    .description("Connect document uploads to Gemini model for purchase voucher extraction")
                    .assigneeId(emp2.getId())
                    .dueDate(LocalDate.now().plusWeeks(3))
                    .status("TODO")
                    .priority("HIGH")
                    .build());

            // 14. Seed Document Vault Mock Invoices (2)
            documentVaultRepository.save(DocumentVault.builder()
                    .companyId(companyId)
                    .name("Cement Supply Invoice #982")
                    .fileName("UltraCement_Invoice_982.pdf")
                    .fileType("application/pdf")
                    .ocrStatus("PENDING")
                    .summary("Invoice from Metals & Concrete Suppliers. Amount: $4,800. Products: 15 Bags of Cement Grade 53.")
                    .build());

            documentVaultRepository.save(DocumentVault.builder()
                    .companyId(companyId)
                    .name("Structural Steel PO #33")
                    .fileName("ApexConstruction_PO_33.pdf")
                    .fileType("application/pdf")
                    .ocrStatus("PENDING")
                    .summary("Purchase order for 50 bags of Structural Steel Rods. Delivery due: July 15, 2026.")
                    .build());

            System.out.println("====== SEEDING COMPLETED ======");
        };
    }
}
