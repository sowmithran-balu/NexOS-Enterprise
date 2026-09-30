package com.erp.auth.controller;

import com.erp.auth.security.firewall.IpDefenseManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/security/firewall")
public class SecurityFirewallController {

    private final IpDefenseManager ipDefenseManager;
    private final com.erp.auth.security.juniper.JuniperCloudConnectorService juniperCloudConnectorService;

    public SecurityFirewallController(IpDefenseManager ipDefenseManager,
                                      com.erp.auth.security.juniper.JuniperCloudConnectorService juniperCloudConnectorService) {
        this.ipDefenseManager = ipDefenseManager;
        this.juniperCloudConnectorService = juniperCloudConnectorService;
    }

    @GetMapping("/juniper/status")
    public ResponseEntity<Map<String, Object>> getJuniperStatus() {
        return ResponseEntity.ok(juniperCloudConnectorService.getJuniperCloudStatus());
    }

    @PostMapping("/juniper/sync")
    public ResponseEntity<?> syncWithJuniper() {
        List<IpDefenseManager.BannedIpRecord> bans = ipDefenseManager.getActiveBans();
        for (var b : bans) {
            juniperCloudConnectorService.pushBlockedIpToJuniper(b.ip(), b.reason(), b.getRemainingSeconds());
        }
        return ResponseEntity.ok(Map.of(
                "message", "Successfully synchronized all active defense bans with Juniper Cloud Networks SRX cluster",
                "syncedCount", bans.size(),
                "juniperStatus", juniperCloudConnectorService.getJuniperCloudStatus()
        ));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(ipDefenseManager.getMetrics());
    }

    @GetMapping("/bans")
    public ResponseEntity<List<IpDefenseManager.BannedIpRecord>> getBans() {
        return ResponseEntity.ok(ipDefenseManager.getActiveBans());
    }

    @PostMapping("/ban")
    public ResponseEntity<?> banIp(@RequestBody BanRequest request) {
        if (request.ip() == null || request.ip().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "IP address is required"));
        }
        long duration = request.durationSeconds() != null ? request.durationSeconds() : 3600L;
        String reason = request.reason() != null ? request.reason() : "Manual administrative firewall ban";
        
        ipDefenseManager.banIp(request.ip().trim(), reason, duration);
        return ResponseEntity.ok(Map.of(
                "message", "IP address successfully blocked",
                "ip", request.ip().trim(),
                "durationSeconds", duration,
                "osCommandWindows", ipDefenseManager.generateOsBlockCommand(request.ip().trim(), "windows"),
                "osCommandLinux", ipDefenseManager.generateOsBlockCommand(request.ip().trim(), "linux")
        ));
    }

    @PostMapping("/unban")
    public ResponseEntity<?> unbanIp(@RequestBody Map<String, String> body) {
        String ip = body.get("ip");
        if (ip == null || ip.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "IP address is required"));
        }
        boolean removed = ipDefenseManager.unbanIp(ip.trim());
        return ResponseEntity.ok(Map.of(
                "message", removed ? "IP address unbanned successfully" : "IP was not actively banned",
                "ip", ip.trim()
        ));
    }

    @PostMapping("/lockdown")
    public ResponseEntity<?> toggleLockdown(@RequestBody Map<String, Boolean> body) {
        Boolean enabled = body.get("enabled");
        if (enabled == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "'enabled' boolean required"));
        }
        ipDefenseManager.setEmergencyLockdown(enabled);
        return ResponseEntity.ok(Map.of(
                "emergencyLockdown", ipDefenseManager.isEmergencyLockdown(),
                "message", enabled ? "EMERGENCY LOCKDOWN ACTIVATED: Only whitelisted IPs can access NexOS"
                                   : "Emergency lockdown deactivated. Standard firewall rules restored."
        ));
    }

    @GetMapping("/whitelist")
    public ResponseEntity<Set<String>> getWhitelist() {
        return ResponseEntity.ok(ipDefenseManager.getWhitelistedIps());
    }

    @PostMapping("/whitelist")
    public ResponseEntity<?> addToWhitelist(@RequestBody Map<String, String> body) {
        String ip = body.get("ip");
        if (ip == null || ip.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "IP address is required"));
        }
        ipDefenseManager.addWhitelistIp(ip.trim());
        return ResponseEntity.ok(Map.of("message", "IP added to trusted whitelist", "ip", ip.trim()));
    }

    @DeleteMapping("/whitelist")
    public ResponseEntity<?> removeFromWhitelist(@RequestParam String ip) {
        ipDefenseManager.removeWhitelistIp(ip.trim());
        return ResponseEntity.ok(Map.of("message", "IP removed from whitelist", "ip", ip.trim()));
    }

    @PostMapping("/verify-access")
    public ResponseEntity<?> verifyAccess(@RequestBody Map<String, String> body) {
        String password = body.get("password");
        if (password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("authenticated", false, "message", "Master password is required"));
        }
        
        // Acceptable administrator security passwords
        boolean isValid = "admin123".equals(password)
                       || "admin".equals(password)
                       || "secops2026".equals(password)
                       || "nexos@sec2026".equals(password);
                       
        if (isValid) {
            String token = UUID.randomUUID().toString();
            return ResponseEntity.ok(Map.of(
                    "authenticated", true,
                    "token", token,
                    "clearanceLevel", "Level 4 (SecOps Administrator)",
                    "expiresInSeconds", 900L,
                    "message", "Master SecOps elevation granted. Perimeter controls unlocked."
            ));
        } else {
            return ResponseEntity.status(401).body(Map.of(
                    "authenticated", false,
                    "message", "Invalid SecOps master authorization password. Attempt recorded."
            ));
        }
    }

    public record BanRequest(String ip, String reason, Long durationSeconds) {}
}
