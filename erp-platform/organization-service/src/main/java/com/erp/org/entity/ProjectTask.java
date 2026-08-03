package com.erp.org.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_tasks")
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class ProjectTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "assignee_id")
    private Long assigneeId; // Refers to Employee ID

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(nullable = false)
    private String status = "TODO"; // TODO, IN_PROGRESS, REVIEW, DONE

    @Column(nullable = false)
    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public ProjectTask() {}

    public ProjectTask(Long id, Long companyId, Long projectId, String name, String description, Long assigneeId, LocalDate dueDate, String status, String priority, LocalDateTime createdAt) {
        this.id = id;
        this.companyId = companyId;
        this.projectId = projectId;
        this.name = name;
        this.description = description;
        this.assigneeId = assigneeId;
        this.dueDate = dueDate;
        this.status = status != null ? status : "TODO";
        this.priority = priority != null ? priority : "MEDIUM";
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getAssigneeId() { return assigneeId; }
    public void setAssigneeId(Long assigneeId) { this.assigneeId = assigneeId; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static ProjectTaskBuilder builder() {
        return new ProjectTaskBuilder();
    }

    public static class ProjectTaskBuilder {
        private Long id;
        private Long companyId;
        private Long projectId;
        private String name;
        private String description;
        private Long assigneeId;
        private LocalDate dueDate;
        private String status = "TODO";
        private String priority = "MEDIUM";
        private LocalDateTime createdAt;

        ProjectTaskBuilder() {}

        public ProjectTaskBuilder id(Long id) { this.id = id; return this; }
        public ProjectTaskBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public ProjectTaskBuilder projectId(Long projectId) { this.projectId = projectId; return this; }
        public ProjectTaskBuilder name(String name) { this.name = name; return this; }
        public ProjectTaskBuilder description(String description) { this.description = description; return this; }
        public ProjectTaskBuilder assigneeId(Long assigneeId) { this.assigneeId = assigneeId; return this; }
        public ProjectTaskBuilder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }
        public ProjectTaskBuilder status(String status) { this.status = status; return this; }
        public ProjectTaskBuilder priority(String priority) { this.priority = priority; return this; }
        public ProjectTaskBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public ProjectTask build() {
            return new ProjectTask(id, companyId, projectId, name, description, assigneeId, dueDate, status, priority, createdAt);
        }
    }
}
