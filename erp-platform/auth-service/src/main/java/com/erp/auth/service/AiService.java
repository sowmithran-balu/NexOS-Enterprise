package com.erp.auth.service;

import com.erp.auth.entity.*;
import com.erp.auth.repository.*;
import com.erp.org.entity.*;
import com.erp.org.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AiService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductStockRepository productStockRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CrmLeadRepository crmLeadRepository;

    @Autowired
    private LedgerRepository ledgerRepository;

    @Autowired
    private VoucherRepository voucherRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    public String generateResponse(String prompt, String activeTab, User user) {
        String provider = user.getActiveAiProvider() != null ? user.getActiveAiProvider() : "local";
        
        if ("gemini".equalsIgnoreCase(provider)) {
            String apiKey = user.getGeminiApiKey();
            if (apiKey == null || apiKey.trim().isEmpty()) {
                apiKey = System.getenv("GEMINI_API_KEY");
            }
            if (apiKey != null && !apiKey.trim().isEmpty()) {
                return callGemini(prompt, activeTab, apiKey);
            }
        } else if ("openrouter".equalsIgnoreCase(provider)) {
            String apiKey = user.getOpenrouterApiKey();
            if (apiKey == null || apiKey.trim().isEmpty()) {
                apiKey = System.getenv("OPENROUTER_API_KEY");
            }
            if (apiKey != null && !apiKey.trim().isEmpty()) {
                return callOpenRouter(prompt, activeTab, apiKey, user.getOpenrouterModel());
            }
        }
        
        // Fall back to local db
        return getMockResponse(prompt, activeTab);
    }

    private String callGemini(String prompt, String activeTab, String apiKey) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> requestMap = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "systemInstruction", Map.of("parts", List.of(Map.of("text", 
                    "You are an intelligent ERP Assistant integrated into an Enterprise ERP Software.\n" +
                    "Format all data outputs as beautiful markdown tables where appropriate.\n" +
                    "Current active tab: " + activeTab + ".\n" +
                    "Help the user manage their business operations, inventory, billing, ledger accounting, and CRM pipeline."
                )))
            );
            String requestBody = mapper.writeValueAsString(requestMap);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey.trim()))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode rootNode = mapper.readTree(response.body());
                JsonNode textNode = rootNode.path("candidates").path(0).path("content").path("parts").path(0).path("text");
                if (!textNode.isMissingNode()) {
                    return textNode.asText();
                }
            }
            return "*(Failed to call Gemini API: Code " + response.statusCode() + ", falling back to local database agent)*\n\n" + getMockResponse(prompt, activeTab);
        } catch (Exception e) {
            return "*(Error calling Gemini API: " + e.getMessage() + ", falling back to local database agent)*\n\n" + getMockResponse(prompt, activeTab);
        }
    }

    private String callOpenRouter(String prompt, String activeTab, String apiKey, String model) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            ObjectMapper mapper = new ObjectMapper();
            
            String selectedModel = model;
            if (selectedModel == null || selectedModel.trim().isEmpty()) {
                selectedModel = "google/gemini-2.5-flash";
            }

            String systemInstruction = "You are an intelligent ERP Assistant integrated into an Enterprise ERP Software.\n" +
                    "Format all data outputs as beautiful markdown tables where appropriate.\n" +
                    "Current active tab: " + activeTab + ".\n" +
                    "Help the user manage their business operations, inventory, billing, ledger accounting, and CRM pipeline.";

            Map<String, Object> requestMap = Map.of(
                "model", selectedModel,
                "messages", List.of(
                    Map.of("role", "system", "content", systemInstruction),
                    Map.of("role", "user", "content", prompt)
                )
            );
            String requestBody = mapper.writeValueAsString(requestMap);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://openrouter.ai/api/v1/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey.trim())
                    .header("HTTP-Referer", "http://localhost:5173")
                    .header("X-Title", "Enterprise ERP")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode rootNode = mapper.readTree(response.body());
                JsonNode textNode = rootNode.path("choices").path(0).path("message").path("content");
                if (!textNode.isMissingNode()) {
                    return textNode.asText();
                }
            }
            return "*(Failed to call OpenRouter API: Code " + response.statusCode() + ", falling back to local database agent)*\n\n" + getMockResponse(prompt, activeTab);
        } catch (Exception e) {
            return "*(Error calling OpenRouter API: " + e.getMessage() + ", falling back to local database agent)*\n\n" + getMockResponse(prompt, activeTab);
        }
    }

    private String getMockResponse(String prompt, String activeTab) {
        String cleanPrompt = prompt.toLowerCase();

        // 1. Inventory / Stock / Products
        if (cleanPrompt.contains("product") || cleanPrompt.contains("stock") || cleanPrompt.contains("inventory")) {
            try {
                List<Product> products = productRepository.findAll();
                StringBuilder sb = new StringBuilder();
                sb.append("### 📦 Live Inventory Stock Report\n\n");
                sb.append("I scanned your database and found **").append(products.size()).append("** registered products:\n\n");
                sb.append("| ID | Product Name | Code | GST Rate | Purchase Price | Sell Price (Retail) | Unit | Status |\n");
                sb.append("|----|--------------|------|----------|----------------|---------------------|------|--------|\n");
                for (Product p : products.stream().limit(10).collect(Collectors.toList())) {
                    sb.append(String.format("| %d | **%s** | `%s` | %.1f%% | $%.2f | $%.2f | %s | %s |\n",
                        p.getId(), p.getName(), p.getCode(), p.getGstRate() != null ? p.getGstRate().doubleValue() : 0.0,
                        p.getPurchasePrice() != null ? p.getPurchasePrice().doubleValue() : 0.0,
                        p.getSellingPriceRetail() != null ? p.getSellingPriceRetail().doubleValue() : 0.0,
                        p.getUnit() != null ? p.getUnit() : "PCS",
                        p.isActive() ? "🟢 Active" : "🔴 Inactive"));
                }
                if (products.size() > 10) {
                    sb.append(String.format("\n*(Showing 10 of %d products)*\n", products.size()));
                }
                return sb.toString();
            } catch (Exception e) {
                return "Failed to load products: " + e.getMessage();
            }
        }

        // 2. User Accounts / Staff / Roles
        if (cleanPrompt.contains("user") || cleanPrompt.contains("employee") || cleanPrompt.contains("staff") || cleanPrompt.contains("role") || cleanPrompt.contains("permission")) {
            try {
                List<User> users = userRepository.findAll();
                StringBuilder sb = new StringBuilder();
                sb.append("### 👥 Live User Directory & Roles\n\n");
                sb.append("There are **").append(users.size()).append("** user accounts configured in this tenant:\n\n");
                sb.append("| ID | Username | Email | Name | Status | Assigned Roles |\n");
                sb.append("|----|----------|-------|------|--------|----------------|\n");
                for (User u : users.stream().limit(10).collect(Collectors.toList())) {
                    String rolesStr = u.getRoles().stream().map(role -> role.getName()).collect(Collectors.joining(", "));
                    sb.append(String.format("| %d | **%s** | `%s` | %s %s | %s | %s |\n",
                        u.getId(), u.getUsername(), u.getEmail(),
                        u.getFirstName() != null ? u.getFirstName() : "",
                        u.getLastName() != null ? u.getLastName() : "",
                        u.isActive() ? "🟢 Active" : "🔴 Blocked",
                        rolesStr));
                }
                return sb.toString();
            } catch (Exception e) {
                return "Failed to load users: " + e.getMessage();
            }
        }

        // 3. CRM Leads
        if (cleanPrompt.contains("lead") || cleanPrompt.contains("crm") || cleanPrompt.contains("customer") || cleanPrompt.contains("pipeline") || cleanPrompt.contains("client")) {
            try {
                List<CrmLead> leads = crmLeadRepository.findAll();
                StringBuilder sb = new StringBuilder();
                sb.append("### 📈 CRM Sales Pipeline & Leads\n\n");
                sb.append("Here is the live lead pipeline summary:\n\n");
                sb.append("| ID | Lead Name | Contact Person | Email | Value | Status | Next Follow-Up |\n");
                sb.append("|----|-----------|----------------|-------|-------|--------|----------------|\n");
                double totalVal = 0;
                for (CrmLead l : leads) {
                    if (l.getValue() != null) totalVal += l.getValue().doubleValue();
                }
                for (CrmLead l : leads.stream().limit(10).collect(Collectors.toList())) {
                    sb.append(String.format("| %d | **%s** | %s | `%s` | $%.2f | %s | %s |\n",
                        l.getId(), l.getName(),
                        l.getContactPerson() != null ? l.getContactPerson() : "-",
                        l.getEmail() != null ? l.getEmail() : "-",
                        l.getValue() != null ? l.getValue().doubleValue() : 0.0,
                        l.getStatus(),
                        l.getNextFollowUpDate() != null ? l.getNextFollowUpDate().toString() : "Not Scheduled"));
                }
                sb.append(String.format("\n**Total Sales Pipeline Value:** $%.2f across %d leads.\n", totalVal, leads.size()));
                return sb.toString();
            } catch (Exception e) {
                return "Failed to load leads: " + e.getMessage();
            }
        }

        // 4. Ledgers
        if (cleanPrompt.contains("ledger") || cleanPrompt.contains("account") || cleanPrompt.contains("balance") || cleanPrompt.contains("bank")) {
            try {
                List<Ledger> ledgers = ledgerRepository.findAll();
                StringBuilder sb = new StringBuilder();
                sb.append("### 📊 Live Accounting Ledger Balances\n\n");
                sb.append("Here are your accounts and their balances:\n\n");
                sb.append("| ID | Ledger Name | Type | Opening Balance | Current Balance | Status |\n");
                sb.append("|----|-------------|------|-----------------|-----------------|--------|\n");
                for (Ledger l : ledgers.stream().limit(10).collect(Collectors.toList())) {
                    sb.append(String.format("| %d | **%s** | `%s` | $%.2f | **$%.2f** | %s |\n",
                        l.getId(), l.getName(), l.getType(),
                        l.getOpeningBalance() != null ? l.getOpeningBalance().doubleValue() : 0.0,
                        l.getCurrentBalance() != null ? l.getCurrentBalance().doubleValue() : 0.0,
                        l.isActive() ? "🟢 Active" : "🔴 Suspended"));
                }
                return sb.toString();
            } catch (Exception e) {
                return "Failed to load ledgers: " + e.getMessage();
            }
        }

        // 5. Vouchers
        if (cleanPrompt.contains("voucher") || cleanPrompt.contains("billing") || cleanPrompt.contains("sale") || cleanPrompt.contains("purchase") || cleanPrompt.contains("invoice")) {
            try {
                List<Voucher> vouchers = voucherRepository.findAll();
                StringBuilder sb = new StringBuilder();
                sb.append("### 🧾 Live Transactions & Vouchers\n\n");
                sb.append("Found **").append(vouchers.size()).append("** transactions in the database:\n\n");
                sb.append("| Voucher Number | Type | Date | Grand Total | Status | Notes |\n");
                sb.append("|----------------|------|------|-------------|--------|-------|\n");
                double totalRev = 0;
                for (Voucher v : vouchers) {
                    if ("SALES".equalsIgnoreCase(v.getType()) && v.getGrandTotal() != null) {
                        totalRev += v.getGrandTotal().doubleValue();
                    }
                }
                for (Voucher v : vouchers.stream().limit(10).collect(Collectors.toList())) {
                    sb.append(String.format("| `%s` | **%s** | %s | **$%.2f** | %s | %s |\n",
                        v.getVoucherNumber(), v.getType(), v.getDate(),
                        v.getGrandTotal() != null ? v.getGrandTotal().doubleValue() : 0.0,
                        v.getStatus(),
                        v.getNotes() != null ? v.getNotes() : ""));
                }
                sb.append(String.format("\n**Total Sales Revenue (from Vouchers):** $%.2f\n", totalRev));
                return sb.toString();
            } catch (Exception e) {
                return "Failed to load vouchers: " + e.getMessage();
            }
        }

        // 6. Organization Structure
        if (cleanPrompt.contains("company") || cleanPrompt.contains("branch") || cleanPrompt.contains("department") || cleanPrompt.contains("organization") || cleanPrompt.contains("org")) {
            try {
                List<Company> companies = companyRepository.findAll();
                List<Branch> branches = branchRepository.findAll();
                List<Department> departments = departmentRepository.findAll();
                StringBuilder sb = new StringBuilder();
                sb.append("### 🏢 Organization Structure & Tenancy\n\n");
                sb.append("#### Active Companies:\n");
                for (Company c : companies) {
                    sb.append(String.format("- **%s** (Reg No: `%s`, Address: %s)\n", c.getName(), c.getRegistrationNumber(), c.getAddress()));
                }
                sb.append("\n#### Registered Branches:\n");
                for (Branch b : branches) {
                    sb.append(String.format("- **%s** (`%s`, Phone: %s, Email: %s)\n", b.getName(), b.getCode(), b.getPhone(), b.getEmail()));
                }
                sb.append("\n#### Departments:\n");
                for (Department d : departments) {
                    sb.append(String.format("- **%s** (`%s`)\n", d.getName(), d.getCode()));
                }
                return sb.toString();
            } catch (Exception e) {
                return "Failed to load organization structure: " + e.getMessage();
            }
        }

        // Context-aware Default fallback
        String defaultResp = "Hello! I am your **Enterprise ERP Premium Assistant**.\n\n" +
            "I have access to your live database. Since you're currently viewing the **" + activeTab.toUpperCase() + "** tab, " +
            "here are some questions you can ask me to fetch live reports:\n\n";

        if ("inventory".equalsIgnoreCase(activeTab)) {
            defaultResp += "- `Show all inventory products` (Lists products, codes, active state)\n" +
                          "- `Summarize inventory stock` (Lists stock levels)\n";
        } else if ("accounting".equalsIgnoreCase(activeTab)) {
            defaultResp += "- `List accounting ledger balances` (Displays account types and current balances)\n" +
                          "- `Show voucher transactions` (Displays journal entries, payments)\n";
        } else if ("billing".equalsIgnoreCase(activeTab)) {
            defaultResp += "- `Summarize sales revenue` (Totals sales, purchases, grand total summaries)\n" +
                          "- `Show active billing invoices` (Lists sales invoices)\n";
        } else if ("crm".equalsIgnoreCase(activeTab)) {
            defaultResp += "- `Display CRM leads` (Displays lead names, pipelines, values, status)\n" +
                          "- `Show won and lost leads` (Analyzes CRM status)\n";
        } else if ("rbac".equalsIgnoreCase(activeTab) || "audit".equalsIgnoreCase(activeTab)) {
            defaultResp += "- `List active users` (Lists accounts, emails, roles)\n" +
                          "- `Show audit log activities` (Lists system actions)\n";
        } else {
            defaultResp += "- `List all registered products` (Inventory)\n" +
                          "- `Show accounting ledger balances` (Accounting)\n" +
                          "- `List invoice transactions` (Billing)\n" +
                          "- `Display CRM sales leads` (CRM)\n" +
                          "- `List registered user accounts` (RBAC/Users)\n";
        }
        defaultResp += "\n*Tip: To unlock advanced AI reasoning and natural language processing, you can paste a `GEMINI_API_KEY` in the chatbot settings (click the gear icon in the chat window).*";
        return defaultResp;
    }
}
