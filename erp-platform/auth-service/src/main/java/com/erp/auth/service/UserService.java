package com.erp.auth.service;

import com.erp.auth.entity.*;
import com.erp.auth.repository.*;
import com.erp.common.security.TotpManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final TotpManager totpManager;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PermissionRepository permissionRepository,
                       AuditLogRepository auditLogRepository,
                       PasswordEncoder passwordEncoder,
                       TotpManager totpManager) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.totpManager = totpManager;
    }

    @Transactional
    public User registerUser(String username, String password, String email, String firstName, String lastName, String phone) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .phone(phone)
                .active(true)
                .build();

        // Assign Default Role (ROLE_ADMIN if first user, else ROLE_STAFF)
        Role role;
        if (userRepository.count() == 0) {
            role = roleRepository.findByName("ROLE_ADMIN")
                    .orElseGet(() -> roleRepository.save(Role.builder()
                            .name("ROLE_ADMIN")
                            .description("Administrator Role")
                            .build()));
        } else {
            role = roleRepository.findByName("ROLE_STAFF")
                    .orElseGet(() -> roleRepository.save(Role.builder()
                            .name("ROLE_STAFF")
                            .description("Staff Member Role")
                            .build()));
        }
        user.setRoles(new HashSet<>(Collections.singletonList(role)));

        User savedUser = userRepository.save(user);
        
        logEvent(savedUser.getCurrentCompanyId(), savedUser.getId(), username, "SYSTEM", 
                "USER_REGISTER", "AUTH", "User registered successfully", "SUCCESS");

        return savedUser;
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional
    public Map<String, String> setupMfa(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String secret = totpManager.generateSecret();
        user.setMfaSecret(secret);
        userRepository.save(user);

        String qrCodeUrl = totpManager.getQrCodeUrl(secret, username, "EnterpriseERP");
        
        Map<String, String> response = new HashMap<>();
        response.put("secret", secret);
        response.put("qrCodeUrl", qrCodeUrl);
        
        logEvent(user.getCurrentCompanyId(), user.getId(), username, "SYSTEM", 
                "MFA_SETUP_INIT", "AUTH", "MFA setup initialized", "SUCCESS");

        return response;
    }

    @Transactional
    public boolean enableMfa(String username, String code) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getMfaSecret() == null) {
            throw new RuntimeException("MFA secret not initialized");
        }

        boolean verified = totpManager.verifyCode(user.getMfaSecret(), code);
        if (verified) {
            user.setMfaEnabled(true);
            userRepository.save(user);
            
            logEvent(user.getCurrentCompanyId(), user.getId(), username, "SYSTEM", 
                    "MFA_ENABLED", "AUTH", "MFA successfully enabled", "SUCCESS");
            return true;
        } else {
            logEvent(user.getCurrentCompanyId(), user.getId(), username, "SYSTEM", 
                    "MFA_ENABLED", "AUTH", "Failed code verification to enable MFA", "FAILURE");
            return false;
        }
    }

    public boolean verifyMfa(String username, String code) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isMfaEnabled() || user.getMfaSecret() == null) {
            return true; // Pass if MFA is not enabled
        }

        return totpManager.verifyCode(user.getMfaSecret(), code);
    }

    @Transactional
    public User updateUserRoles(Long userId, Set<String> roleNames) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<Role> roles = new HashSet<>();
        for (String roleName : roleNames) {
            Role r = roleRepository.findByName(roleName)
                    .orElseThrow(() -> new RuntimeException("Role " + roleName + " not found"));
            roles.add(r);
        }
        user.setRoles(roles);
        
        logEvent(user.getCurrentCompanyId(), user.getId(), user.getUsername(), "SYSTEM", 
                "UPDATE_USER_ROLES", "RBAC", "Roles updated to: " + roleNames, "SUCCESS");

        return userRepository.save(user);
    }

    @Transactional
    public void logEvent(Long companyId, Long userId, String username, String ip, 
                         String action, String module, String details, String status) {
        AuditLog log = AuditLog.builder()
                .companyId(companyId)
                .userId(userId)
                .username(username)
                .ipAddress(ip)
                .action(action)
                .module(module)
                .details(details)
                .status(status)
                .build();
        auditLogRepository.save(log);
    }

    public List<AuditLog> getAuditLogs(Long companyId) {
        if (companyId == null) {
            return auditLogRepository.findAllByOrderByTimestampDesc();
        }
        return auditLogRepository.findByCompanyIdOrderByTimestampDesc(companyId);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Transactional
    public Role createRole(Role role) {
        return roleRepository.save(role);
    }

    @Transactional
    public Role updateRolePermissions(Long roleId, Set<Long> permissionIds) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        Set<Permission> permissions = new HashSet<>(permissionRepository.findAllById(permissionIds));
        role.setPermissions(permissions);
        return roleRepository.save(role);
    }

    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }
}
