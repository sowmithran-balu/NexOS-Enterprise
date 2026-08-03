package com.erp.auth.controller;

import com.erp.auth.entity.*;
import com.erp.auth.repository.UserRepository;
import com.erp.auth.service.UserService;
import com.erp.common.security.JwtUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    public UserController(UserService userService, UserRepository userRepository, JwtUtils jwtUtils) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(userService.getAllRoles());
    }

    @GetMapping("/permissions")
    public ResponseEntity<List<Permission>> getAllPermissions() {
        return ResponseEntity.ok(userService.getAllPermissions());
    }

    @PutMapping("/{userId}/roles")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<User> updateUserRoles(@PathVariable Long userId, @RequestBody Set<String> roleNames) {
        return ResponseEntity.ok(userService.updateUserRoles(userId, roleNames));
    }

    @PutMapping("/roles/{roleId}/permissions")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Role> updateRolePermissions(@PathVariable Long roleId, @RequestBody Set<Long> permissionIds) {
        return ResponseEntity.ok(userService.updateRolePermissions(roleId, permissionIds));
    }

    @PutMapping("/switch-context")
    public ResponseEntity<?> switchContext(@RequestBody ContextSwitchRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setCurrentCompanyId(request.companyId());
        user.setCurrentBranchId(request.branchId());
        userRepository.save(user);

        List<String> roles = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        // Generate a new JWT token with the new company and branch context
        String token = jwtUtils.generateToken(
                user.getUsername(),
                user.getCurrentCompanyId(),
                user.getCurrentBranchId(),
                roles
        );

        return ResponseEntity.ok(Map.of(
                "token", token,
                "companyId", user.getCurrentCompanyId(),
                "branchId", user.getCurrentBranchId()
        ));
    }

    public static record ContextSwitchRequest(Long companyId, Long branchId) {}
    
    // Quick helper for map responses
    private static class Map {
        public static java.util.Map<String, Object> of(String k1, Object v1, String k2, Object v2) {
            java.util.Map<String, Object> m = new java.util.HashMap<>();
            m.put(k1, v1);
            m.put(k2, v2);
            return m;
        }
        public static java.util.Map<String, Object> of(String k1, Object v1, String k2, Object v2, String k3, Object v3) {
            java.util.Map<String, Object> m = new java.util.HashMap<>();
            m.put(k1, v1);
            m.put(k2, v2);
            m.put(k3, v3);
            return m;
        }
    }
}
