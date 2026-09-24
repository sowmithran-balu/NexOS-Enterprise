package com.erp.auth.security.firewall;

import com.erp.common.security.TokenBucketRateLimiter;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Layer 3: Application Gateway Token Bucket Rate Limiting Filter.
 * Protects authentication endpoints from brute-force floods (5 req/min)
 * and general API endpoints from thread starvation/DDoS attacks (100 req/min).
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class RateLimitingFilter extends OncePerRequestFilter {

    private final IpDefenseManager ipDefenseManager;

    @Value("${erp.security.rate-limit.auth-limit:5}")
    private int authLimit;

    @Value("${erp.security.rate-limit.api-limit:100}")
    private int apiLimit;

    private TokenBucketRateLimiter authLimiter;
    private TokenBucketRateLimiter apiLimiter;

    public RateLimitingFilter(IpDefenseManager ipDefenseManager) {
        this.ipDefenseManager = ipDefenseManager;
    }

    @PostConstruct
    public void init() {
        this.authLimiter = new TokenBucketRateLimiter(authLimit, authLimit);
        this.apiLimiter = new TokenBucketRateLimiter(apiLimit, apiLimit);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String clientIp = extractClientIp(request);

        // Whitelisted IPs bypass rate limits (unless simulation test header is specified)
        if (ipDefenseManager.isWhitelisted(clientIp) && request.getHeader("X-Simulate-Attacker-IP") == null) {
            filterChain.doFilter(request, response);
            return;
        }

        TokenBucketRateLimiter.ConsumptionResult result = null;

        // Apply strict limit for login/register endpoints
        if (path.equals("/api/auth/login") || path.equals("/api/auth/register")) {
            result = authLimiter.tryConsume(clientIp);
        } else if (path.startsWith("/api/")) {
            // General API rate limit
            result = apiLimiter.tryConsume(clientIp);
        }

        if (result != null) {
            response.setHeader("X-RateLimit-Limit", String.valueOf(result.getLimit()));
            response.setHeader("X-RateLimit-Remaining", String.valueOf(result.getRemainingTokens()));
            response.setHeader("X-RateLimit-Reset", String.valueOf(result.getResetSeconds()));

            if (!result.isAllowed()) {
                response.setHeader("Retry-After", String.valueOf(result.getResetSeconds()));
                ipDefenseManager.recordRateLimitViolation(clientIp);

                response.setStatus(429); // HTTP 429 Too Many Requests
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.getWriter().write(String.format(
                        "{\"error\": \"RATE_LIMIT_EXCEEDED\", \"message\": \"Rate limit exceeded. Try again in %d seconds.\", \"retryAfterSeconds\": %d, \"status\": 429}",
                        result.getResetSeconds(), result.getResetSeconds()
                ));
                return;
            }
        }

        filterChain.doFilter(request, response);
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
}
