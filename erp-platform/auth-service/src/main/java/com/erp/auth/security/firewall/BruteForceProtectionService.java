package com.erp.auth.security.firewall;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Layer 3: Adaptive Brute-Force Defense Service.
 * Tracks failed authentication attempts per username and per client IP in a sliding time window.
 * Enforces automated account & IP lockouts to neutralize dictionary and credential-stuffing attacks.
 */
@Service
public class BruteForceProtectionService {

    private final IpDefenseManager ipDefenseManager;

    @Value("${erp.security.brute-force.max-attempts:5}")
    private int maxAttempts;

    @Value("${erp.security.brute-force.lockout-minutes:15}")
    private int lockoutMinutes;

    // Keys are either client IP or "user:username"
    private final ConcurrentHashMap<String, AttemptTracker> attempts = new ConcurrentHashMap<>();

    public BruteForceProtectionService(IpDefenseManager ipDefenseManager) {
        this.ipDefenseManager = ipDefenseManager;
    }

    public static class LockoutStatus {
        private final boolean locked;
        private final long remainingSeconds;
        private final String message;

        public LockoutStatus(boolean locked, long remainingSeconds, String message) {
            this.locked = locked;
            this.remainingSeconds = remainingSeconds;
            this.message = message;
        }

        public boolean isLocked() { return locked; }
        public long getRemainingSeconds() { return remainingSeconds; }
        public String getMessage() { return message; }
    }

    private static class AttemptTracker {
        private int failedAttempts = 0;
        private Instant lockoutExpiresAt = null;
        private long lastAttemptTime = Instant.now().toEpochMilli();

        synchronized boolean isLocked() {
            if (lockoutExpiresAt != null) {
                if (Instant.now().isBefore(lockoutExpiresAt)) {
                    return true;
                } else {
                    // Lockout has elapsed, reset counter
                    lockoutExpiresAt = null;
                    failedAttempts = 0;
                }
            }
            return false;
        }

        synchronized long getRemainingLockoutSeconds() {
            if (lockoutExpiresAt == null) return 0;
            long remaining = lockoutExpiresAt.getEpochSecond() - Instant.now().getEpochSecond();
            return Math.max(0, remaining);
        }

        synchronized int recordFailure(int maxAllowed, int lockoutMins) {
            long now = Instant.now().toEpochMilli();
            // Reset count if previous failure was more than 30 minutes ago
            if (now - lastAttemptTime > 1800_000L) {
                failedAttempts = 0;
            }
            lastAttemptTime = now;
            failedAttempts++;

            if (failedAttempts >= maxAllowed) {
                lockoutExpiresAt = Instant.now().plusSeconds(lockoutMins * 60L);
            }
            return failedAttempts;
        }

        synchronized void reset() {
            failedAttempts = 0;
            lockoutExpiresAt = null;
        }
    }

    /**
     * Checks whether the client IP or target username is currently locked out.
     */
    public LockoutStatus checkLockout(String clientIp, String username) {
        if (ipDefenseManager.isWhitelisted(clientIp)) {
            return new LockoutStatus(false, 0, "Whitelisted");
        }

        // Check IP-level lock
        AttemptTracker ipTracker = attempts.get("ip:" + clientIp);
        if (ipTracker != null && ipTracker.isLocked()) {
            long remaining = ipTracker.getRemainingLockoutSeconds();
            return new LockoutStatus(true, remaining,
                    String.format("Client IP is temporarily locked due to repeated authentication failures. Try again in %d seconds.", remaining));
        }

        // Check Username-level lock
        if (username != null && !username.isBlank()) {
            AttemptTracker userTracker = attempts.get("user:" + username.trim().toLowerCase());
            if (userTracker != null && userTracker.isLocked()) {
                long remaining = userTracker.getRemainingLockoutSeconds();
                return new LockoutStatus(true, remaining,
                        String.format("Account '%s' is temporarily locked to prevent credential stuffing. Try again in %d seconds.", username, remaining));
            }
        }

        return new LockoutStatus(false, 0, "Active");
    }

    /**
     * Records an authentication failure for both the client IP and username.
     */
    public void recordLoginFailure(String clientIp, String username) {
        if (ipDefenseManager.isWhitelisted(clientIp)) {
            return;
        }

        AttemptTracker ipTracker = attempts.computeIfAbsent("ip:" + clientIp, k -> new AttemptTracker());
        int ipFails = ipTracker.recordFailure(maxAttempts, lockoutMinutes);

        if (username != null && !username.isBlank()) {
            AttemptTracker userTracker = attempts.computeIfAbsent("user:" + username.trim().toLowerCase(), k -> new AttemptTracker());
            userTracker.recordFailure(maxAttempts, lockoutMinutes);
        }

        // If IP repeatedly fails beyond threshold, advise DefenseManager
        if (ipFails >= maxAttempts) {
            ipDefenseManager.banIp(clientIp, "Adaptive Brute-Force Defense Lockout (" + ipFails + " failed attempts)", lockoutMinutes * 60L);
        }
    }

    /**
     * Resets authentication failures upon successful login.
     */
    public void recordLoginSuccess(String clientIp, String username) {
        AttemptTracker ipTracker = attempts.get("ip:" + clientIp);
        if (ipTracker != null) {
            ipTracker.reset();
        }

        if (username != null && !username.isBlank()) {
            AttemptTracker userTracker = attempts.get("user:" + username.trim().toLowerCase());
            if (userTracker != null) {
                userTracker.reset();
            }
        }
    }

    public int getMaxAttempts() {
        return maxAttempts;
    }

    public int getLockoutMinutes() {
        return lockoutMinutes;
    }
}
