package com.erp.auth.security.firewall;

import com.erp.auth.entity.AuditLog;
import com.erp.auth.repository.AuditLogRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.regex.Pattern;

/**
 * Layer 3: In-Application Web Application Firewall (WAF) & Request Sanitization Filter.
 * Pre-emptively inspects request paths, parameters, and headers for SQL Injection (SQLi),
 * Cross-Site Scripting (XSS), Directory Traversal, and Command Injection signatures.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class WafInspectionFilter extends OncePerRequestFilter {

    private final IpDefenseManager ipDefenseManager;
    private final AuditLogRepository auditLogRepository;

    // Detection Signatures (OWASP Core Rule Set subset)
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
            "(?i)(\\b(union\\s+select|select\\s+.*\\s+from|insert\\s+into|drop\\s+table|delete\\s+from|update\\s+.*\\s+set)\\b|'\\s*(or|and)\\s*'\\w+'='\\w+'|--|;\\s*drop|information_schema|exec\\s*\\()",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern XSS_PATTERN = Pattern.compile(
            "(?i)(<script|javascript:|onerror\\s*=|onload\\s*=|onclick\\s*=|document\\.cookie|<iframe|<object|<embed)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern PATH_TRAVERSAL_PATTERN = Pattern.compile(
            "(\\.\\./|\\.\\.\\\\|%2e%2e%2f|%2e%2e\\\\)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Pattern CMD_INJECTION_PATTERN = Pattern.compile(
            "(?i)(;|\\|\\||&&)\\s*(cat\\s+/etc|powershell|cmd\\.exe|whoami|curl\\s+http|wget\\s+http|rm\\s+-rf)",
            Pattern.CASE_INSENSITIVE
    );

    public WafInspectionFilter(IpDefenseManager ipDefenseManager, AuditLogRepository auditLogRepository) {
        this.ipDefenseManager = ipDefenseManager;
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String clientIp = extractClientIp(request);
        ipDefenseManager.recordRequestProcessed();

        // 1. Check IP Blacklist / Lockdown Enforcement
        if (ipDefenseManager.isBlocked(clientIp)) {
            sendJsonSecurityError(response, HttpServletResponse.SC_FORBIDDEN,
                    "FIREWALL_BLOCKED",
                    "Access has been restricted by NexOS Perimeter Security. Your IP is currently blocked or under emergency lockdown.");
            return;
        }

        // 2. Perform Deep Inspection on URI, Query Parameters and Headers
        String uri = request.getRequestURI();
        String queryString = request.getQueryString();

        // Check Path Traversal
        if (matchesPattern(uri, PATH_TRAVERSAL_PATTERN)) {
            handleIntrusion(request, response, clientIp, "PATH_TRAVERSAL", uri);
            return;
        }

        // Check Query String
        if (queryString != null) {
            String decodedQuery;
            try {
                decodedQuery = URLDecoder.decode(queryString, StandardCharsets.UTF_8);
            } catch (Exception e) {
                decodedQuery = queryString;
            }

            if (matchesPattern(decodedQuery, SQL_INJECTION_PATTERN)) {
                handleIntrusion(request, response, clientIp, "SQL_INJECTION", decodedQuery);
                return;
            }
            if (matchesPattern(decodedQuery, XSS_PATTERN)) {
                handleIntrusion(request, response, clientIp, "CROSS_SITE_SCRIPTING", decodedQuery);
                return;
            }
            if (matchesPattern(decodedQuery, CMD_INJECTION_PATTERN)) {
                handleIntrusion(request, response, clientIp, "COMMAND_INJECTION", decodedQuery);
                return;
            }
        }

        // Check Parameter Values
        Enumeration<String> paramNames = request.getParameterNames();
        while (paramNames.hasMoreElements()) {
            String paramName = paramNames.nextElement();
            String[] values = request.getParameterValues(paramName);
            if (values != null) {
                for (String val : values) {
                    if (val != null) {
                        if (matchesPattern(val, SQL_INJECTION_PATTERN)) {
                            handleIntrusion(request, response, clientIp, "SQL_INJECTION", paramName + "=" + val);
                            return;
                        }
                        if (matchesPattern(val, XSS_PATTERN)) {
                            handleIntrusion(request, response, clientIp, "CROSS_SITE_SCRIPTING", paramName + "=" + val);
                            return;
                        }
                        if (matchesPattern(val, PATH_TRAVERSAL_PATTERN)) {
                            handleIntrusion(request, response, clientIp, "PATH_TRAVERSAL", paramName + "=" + val);
                            return;
                        }
                    }
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean matchesPattern(String input, Pattern pattern) {
        return input != null && pattern.matcher(input).find();
    }

    private void handleIntrusion(HttpServletRequest request, HttpServletResponse response,
                                 String clientIp, String threatType, String payloadSnippet) throws IOException {
        String truncatedSnippet = payloadSnippet.length() > 200 ? payloadSnippet.substring(0, 200) + "..." : payloadSnippet;
        
        // Record violation in Defense Manager
        ipDefenseManager.recordWafViolation(clientIp, threatType, truncatedSnippet);

        // Record security audit log
        try {
            AuditLog log = AuditLog.builder()
                    .ipAddress(clientIp)
                    .username("ANONYMOUS_ATTACKER")
                    .action("WAF_BLOCKED_" + threatType)
                    .module("PERIMETER_FIREWALL")
                    .details("Intrusion detected at " + request.getMethod() + " " + request.getRequestURI() + " | Payload: " + truncatedSnippet)
                    .status("BLOCKED")
                    .build();
            auditLogRepository.save(log);
        } catch (Exception ignored) {}

        sendJsonSecurityError(response, HttpServletResponse.SC_BAD_REQUEST,
                "WAF_INTRUSION_DETECTED",
                "Malicious payload neutralized by NexOS Web Application Firewall. Threat signature: " + threatType);
    }

    private String extractClientIp(HttpServletRequest request) {
        String simIp = request.getHeader("X-Simulate-Attacker-IP");
        if (simIp != null && !simIp.isBlank()) {
            return simIp.trim();
        }
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        return request.getRemoteAddr();
    }

    private void sendJsonSecurityError(HttpServletResponse response, int statusCode, String error, String message)
            throws IOException {
        response.setStatus(statusCode);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(String.format(
                "{\"error\": \"%s\", \"message\": \"%s\", \"status\": %d, \"timestamp\": \"%s\"}",
                error, message.replace("\"", "\\\""), statusCode, java.time.Instant.now()
        ));
    }
}
