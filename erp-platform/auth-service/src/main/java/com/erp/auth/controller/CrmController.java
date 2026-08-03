package com.erp.auth.controller;

import com.erp.auth.entity.CrmLead;
import com.erp.auth.repository.CrmLeadRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/crm")
public class CrmController {

    private final CrmLeadRepository crmLeadRepository;

    public CrmController(CrmLeadRepository crmLeadRepository) {
        this.crmLeadRepository = crmLeadRepository;
    }

    @GetMapping("/leads")
    public ResponseEntity<List<CrmLead>> getLeads(@RequestParam Long companyId) {
        return ResponseEntity.ok(crmLeadRepository.findByCompanyId(companyId));
    }

    @PostMapping("/leads")
    public ResponseEntity<CrmLead> saveLead(@RequestBody CrmLead lead) {
        return ResponseEntity.ok(crmLeadRepository.save(lead));
    }

    @PutMapping("/leads/{id}/status")
    public ResponseEntity<?> updateLeadStatus(@PathVariable Long id, @RequestParam String status) {
        Optional<CrmLead> optLead = crmLeadRepository.findById(id);
        if (optLead.isPresent()) {
            CrmLead lead = optLead.get();
            lead.setStatus(status);
            crmLeadRepository.save(lead);
            return ResponseEntity.ok(lead);
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Lead not found."));
        }
    }
}
