package com.erp.auth.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.Filter;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_vault")
@Filter(name = "companyFilter", condition = "company_id = :companyId")
public class DocumentVault {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(nullable = false)
    private String name;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_type")
    private String fileType;

    @Column(name = "ocr_status", nullable = false)
    private String ocrStatus = "PENDING"; // PENDING, PROCESSED, FAILED

    @Column(length = 2000)
    private String summary;

    @Column(name = "parsed_data", columnDefinition = "TEXT")
    private String parsedData; // JSON String

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public DocumentVault() {}

    public DocumentVault(Long id, Long companyId, String name, String fileName, String fileType, String ocrStatus, String summary, String parsedData, LocalDateTime createdAt) {
        this.id = id;
        this.companyId = companyId;
        this.name = name;
        this.fileName = fileName;
        this.fileType = fileType;
        this.ocrStatus = ocrStatus != null ? ocrStatus : "PENDING";
        this.summary = summary;
        this.parsedData = parsedData;
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
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public String getOcrStatus() { return ocrStatus; }
    public void setOcrStatus(String ocrStatus) { this.ocrStatus = ocrStatus; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getParsedData() { return parsedData; }
    public void setParsedData(String parsedData) { this.parsedData = parsedData; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static DocumentVaultBuilder builder() {
        return new DocumentVaultBuilder();
    }

    public static class DocumentVaultBuilder {
        private Long id;
        private Long companyId;
        private String name;
        private String fileName;
        private String fileType;
        private String ocrStatus = "PENDING";
        private String summary;
        private String parsedData;
        private LocalDateTime createdAt;

        DocumentVaultBuilder() {}

        public DocumentVaultBuilder id(Long id) { this.id = id; return this; }
        public DocumentVaultBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public DocumentVaultBuilder name(String name) { this.name = name; return this; }
        public DocumentVaultBuilder fileName(String fileName) { this.fileName = fileName; return this; }
        public DocumentVaultBuilder fileType(String fileType) { this.fileType = fileType; return this; }
        public DocumentVaultBuilder ocrStatus(String ocrStatus) { this.ocrStatus = ocrStatus; return this; }
        public DocumentVaultBuilder summary(String summary) { this.summary = summary; return this; }
        public DocumentVaultBuilder parsedData(String parsedData) { this.parsedData = parsedData; return this; }
        public DocumentVaultBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public DocumentVault build() {
            return new DocumentVault(id, companyId, name, fileName, fileType, ocrStatus, summary, parsedData, createdAt);
        }
    }
}
