package com.erp.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Filter(name = "companyFilter", condition = "current_company_id = :companyId")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    private String phone;

    @Column(name = "mfa_enabled")
    private boolean mfaEnabled = false;

    @JsonIgnore
    @Column(name = "mfa_secret")
    private String mfaSecret;

    @Column(name = "current_company_id")
    private Long currentCompanyId;

    @Column(name = "current_branch_id")
    private Long currentBranchId;

    @Column(name = "department_id")
    private Long departmentId;

    private boolean active = true;

    @Column(name = "gemini_api_key")
    private String geminiApiKey;

    @Column(name = "openrouter_api_key")
    private String openrouterApiKey;

    @Column(name = "active_ai_provider")
    private String activeAiProvider = "local";

    @Column(name = "openrouter_model")
    private String openrouterModel = "google/gemini-2.5-flash";

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public User() {}

    public User(Long id, String username, String password, String email, String firstName, String lastName, String phone, boolean mfaEnabled, String mfaSecret, Long currentCompanyId, Long currentBranchId, Long departmentId, boolean active, Set<Role> roles, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.mfaEnabled = mfaEnabled;
        this.mfaSecret = mfaSecret;
        this.currentCompanyId = currentCompanyId;
        this.currentBranchId = currentBranchId;
        this.departmentId = departmentId;
        this.active = active;
        this.roles = roles != null ? roles : new HashSet<>();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public boolean isMfaEnabled() { return mfaEnabled; }
    public void setMfaEnabled(boolean mfaEnabled) { this.mfaEnabled = mfaEnabled; }
    public String getMfaSecret() { return mfaSecret; }
    public void setMfaSecret(String mfaSecret) { this.mfaSecret = mfaSecret; }
    public Long getCurrentCompanyId() { return currentCompanyId; }
    public void setCurrentCompanyId(Long currentCompanyId) { this.currentCompanyId = currentCompanyId; }
    public Long getCurrentBranchId() { return currentBranchId; }
    public void setCurrentBranchId(Long currentBranchId) { this.currentBranchId = currentBranchId; }
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getGeminiApiKey() { return geminiApiKey; }
    public void setGeminiApiKey(String geminiApiKey) { this.geminiApiKey = geminiApiKey; }
    public String getOpenrouterApiKey() { return openrouterApiKey; }
    public void setOpenrouterApiKey(String openrouterApiKey) { this.openrouterApiKey = openrouterApiKey; }
    public String getActiveAiProvider() { return activeAiProvider; }
    public void setActiveAiProvider(String activeAiProvider) { this.activeAiProvider = activeAiProvider; }
    public String getOpenrouterModel() { return openrouterModel; }
    public void setOpenrouterModel(String openrouterModel) { this.openrouterModel = openrouterModel; }

    // Builder
    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private Long id;
        private String username;
        private String password;
        private String email;
        private String firstName;
        private String lastName;
        private String phone;
        private boolean mfaEnabled = false;
        private String mfaSecret;
        private Long currentCompanyId;
        private Long currentBranchId;
        private Long departmentId;
        private boolean active = true;
        private Set<Role> roles = new HashSet<>();
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        UserBuilder() {}

        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder username(String username) { this.username = username; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public UserBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public UserBuilder phone(String phone) { this.phone = phone; return this; }
        public UserBuilder mfaEnabled(boolean mfaEnabled) { this.mfaEnabled = mfaEnabled; return this; }
        public UserBuilder mfaSecret(String mfaSecret) { this.mfaSecret = mfaSecret; return this; }
        public UserBuilder currentCompanyId(Long currentCompanyId) { this.currentCompanyId = currentCompanyId; return this; }
        public UserBuilder currentBranchId(Long currentBranchId) { this.currentBranchId = currentBranchId; return this; }
        public UserBuilder departmentId(Long departmentId) { this.departmentId = departmentId; return this; }
        public UserBuilder active(boolean active) { this.active = active; return this; }
        public UserBuilder roles(Set<Role> roles) { this.roles = roles; return this; }
        public UserBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public UserBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public User build() {
            return new User(id, username, password, email, firstName, lastName, phone, mfaEnabled, mfaSecret, currentCompanyId, currentBranchId, departmentId, active, roles, createdAt, updatedAt);
        }
    }
}
