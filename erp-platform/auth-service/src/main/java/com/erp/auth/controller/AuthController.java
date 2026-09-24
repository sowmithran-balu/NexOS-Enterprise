package com.erp.auth.controller;

import com.erp.auth.entity.User;
import com.erp.auth.service.UserService;
import com.erp.common.security.JwtUtils;
import com.erp.auth.security.firewall.BruteForceProtectionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final BruteForceProtectionService bruteForceProtectionService;

    public AuthController(UserService userService, JwtUtils jwtUtils, PasswordEncoder passwordEncoder,
                          BruteForceProtectionService bruteForceProtectionService) {
        this.userService = userService;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
        this.bruteForceProtectionService = bruteForceProtectionService;
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

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request, HttpServletRequest req) {
        String clientIp = extractClientIp(req);
        try {
            User user = userService.registerUser(
                    request.username(),
                    request.password(),
                    request.email(),
                    request.firstName(),
                    request.lastName(),
                    request.phone()
            );
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            userService.logEvent(null, null, request.username(), clientIp,
                    "USER_REGISTER", "AUTH", e.getMessage(), "FAILURE");
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletRequest req) {
        String clientIp = extractClientIp(req);

        // Check adaptive brute-force defense
        BruteForceProtectionService.LockoutStatus lockout =
                bruteForceProtectionService.checkLockout(clientIp, request.username());

        if (lockout.isLocked()) {
            userService.logEvent(null, null, request.username(), clientIp,
                    "LOGIN_BLOCKED_LOCKOUT", "AUTH", lockout.getMessage(), "BLOCKED");
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("Retry-After", String.valueOf(lockout.getRemainingSeconds()))
                    .body(Map.of(
                            "error", "ACCOUNT_LOCKED",
                            "message", lockout.getMessage(),
                            "retryAfterSeconds", lockout.getRemainingSeconds()
                    ));
        }

        try {
            User user = userService.findByUsername(request.username())
                    .orElseThrow(() -> {
                        bruteForceProtectionService.recordLoginFailure(clientIp, request.username());
                        userService.logEvent(null, null, request.username(), clientIp,
                                "LOGIN", "AUTH", "Unknown username attempt", "FAILURE");
                        return new RuntimeException("Invalid username or password");
                    });

            if (!passwordEncoder.matches(request.password(), user.getPassword())) {
                bruteForceProtectionService.recordLoginFailure(clientIp, user.getUsername());
                userService.logEvent(user.getCurrentCompanyId(), user.getId(), user.getUsername(), clientIp,
                        "LOGIN", "AUTH", "Invalid password attempt", "FAILURE");
                throw new RuntimeException("Invalid username or password");
            }

            if (!user.isActive()) {
                throw new RuntimeException("Account is deactivated");
            }

            // Successful authentication - reset failure tracker
            bruteForceProtectionService.recordLoginSuccess(clientIp, user.getUsername());

            if (user.isMfaEnabled()) {
                // Generate a temporary token indicating MFA is required
                String tempToken = jwtUtils.generateToken(user.getUsername(), user.getCurrentCompanyId(), user.getCurrentBranchId(), List.of("MFA_PENDING"));
                
                userService.logEvent(user.getCurrentCompanyId(), user.getId(), user.getUsername(), req.getRemoteAddr(),
                        "LOGIN_MFA_CHALLENGE", "AUTH", "MFA code verification challenge generated", "SUCCESS");

                return ResponseEntity.ok(Map.of(
                        "mfaRequired", true,
                        "tempToken", tempToken,
                        "username", user.getUsername()
                ));
            }

            // Normal login (no MFA)
            List<String> roles = user.getRoles().stream()
                    .map(role -> role.getName())
                    .collect(Collectors.toList());

            String token = jwtUtils.generateToken(
                    user.getUsername(),
                    user.getCurrentCompanyId(),
                    user.getCurrentBranchId(),
                    roles
            );

            userService.logEvent(user.getCurrentCompanyId(), user.getId(), user.getUsername(), req.getRemoteAddr(),
                    "LOGIN_SUCCESS", "AUTH", "Standard login successful", "SUCCESS");

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "roles", roles,
                    "companyId", user.getCurrentCompanyId() != null ? user.getCurrentCompanyId() : 0,
                    "branchId", user.getCurrentBranchId() != null ? user.getCurrentBranchId() : 0
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/mfa/setup")
    public ResponseEntity<?> setupMfa(@RequestParam String username, HttpServletRequest req) {
        try {
            Map<String, String> mfaData = userService.setupMfa(username);
            return ResponseEntity.ok(mfaData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/mfa/enable")
    public ResponseEntity<?> enableMfa(@RequestBody MfaVerifyRequest request, HttpServletRequest req) {
        try {
            boolean success = userService.enableMfa(request.username(), request.code());
            if (success) {
                return ResponseEntity.ok(Map.of("message", "MFA enabled successfully"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid verification code"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/mfa/verify")
    public ResponseEntity<?> verifyMfa(@RequestBody MfaVerifyRequest request, HttpServletRequest req) {
        try {
            User user = userService.findByUsername(request.username())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            boolean verified = userService.verifyMfa(request.username(), request.code());
            if (!verified) {
                userService.logEvent(user.getCurrentCompanyId(), user.getId(), user.getUsername(), req.getRemoteAddr(),
                        "LOGIN_MFA_VERIFY", "AUTH", "Invalid MFA token code", "FAILURE");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid verification code"));
            }

            List<String> roles = user.getRoles().stream()
                    .map(role -> role.getName())
                    .collect(Collectors.toList());

            String token = jwtUtils.generateToken(
                    user.getUsername(),
                    user.getCurrentCompanyId(),
                    user.getCurrentBranchId(),
                    roles
            );

            userService.logEvent(user.getCurrentCompanyId(), user.getId(), user.getUsername(), req.getRemoteAddr(),
                    "LOGIN_SUCCESS", "AUTH", "MFA verified login successful", "SUCCESS");

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "roles", roles,
                    "companyId", user.getCurrentCompanyId() != null ? user.getCurrentCompanyId() : 0,
                    "branchId", user.getCurrentBranchId() != null ? user.getCurrentBranchId() : 0
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    public static record LoginRequest(String username, String password) {}
    public static record RegisterRequest(String username, String password, String email, String firstName, String lastName, String phone) {}
    public static record MfaVerifyRequest(String username, String code) {}
}
