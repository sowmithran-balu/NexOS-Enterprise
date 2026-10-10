# NexOS Enterprise ERP

> **Unified Autonomous Business Management, 6-Layer Firewall Security & Agentic AI Platform**

[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203.2-brightgreen.svg)](https://spring.io/)
[![React + Vite](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%208-blue.svg)](https://vitejs.dev/)
[![LangChain](https://img.shields.io/badge/Agentic%20AI-LangChain%20%2B%20FastAPI-orange.svg)](https://www.langchain.com/)
[![Security](https://img.shields.io/badge/Security-6--Layer%20Defense--in--Depth-red.svg)](#6-layer-defense-in-depth-firewall-security)

---

## 🌟 Overview

**NexOS Enterprise** is a mission-critical enterprise resource planning (ERP) system designed for ultra-high security, multi-tenant financial operations, automated ledger balancing, and AI-driven workflow assistance.

It unites accounting masters, automated vouchers, financial reporting (P&L, Balance Sheet, Trial Balance), CRM pipelines, and document management with enterprise-grade perimeter defense and autonomous AI capabilities.

---

## 🛡️ 6-Layer Defense-in-Depth Firewall Security

NexOS enforces a multi-tiered security perimeter protecting all endpoints against automated bots, credential stuffing, SQL injection (SQLi), cross-site scripting (XSS), and data exfiltration.

```
[ Incoming Request ]
         │
         ▼
[ Layer 1: Edge & Perimeter Defense ] ──> Cloudflare WAF / Juniper cSRX Container
         │
         ▼
[ Layer 2: Reverse Proxy & DDoS Rate Limiting ] ──> IP Sliding-Window Limiter & Geo-Filter
         │
         ▼
[ Layer 3: Application WAF & Signature Inspection ] ──> Spring Cloud WafInspectionFilter
         │
         ▼
[ Layer 4: RBAC & Tenant Isolation ] ──> TenantSecurityValidator (Multi-Tenant Enforcer)
         │
         ▼
[ Layer 5: Adaptive IP Defense & Brute-Force Shield ] ──> IpDefenseManager & Failed Attempt Counter
         │
         ▼
[ Layer 6: Database Firewall & Network Isolation ] ──> Port 1433 Dedicated SQL Isolation Rule
```

### Security Console Features
* **Real-Time Firewall Dashboard:** Live telemetry showing blocked threats, active inspection metrics, and layer health.
* **Attack Simulation Engine:** Built-in test harness verifying resilience against SQLi, XSS, and credential brute-forcing.
* **One-Click Hardening:** Automated PowerShell and Bash scripts for immediate database port isolation.

---

## 🤖 Autonomous Agentic AI & Secure API Key Vault

NexOS features an embedded Agentic Copilot capable of analyzing financial statements, executing ledger reconciliations, auditing trial balances, and diagnosing system security status.

### Supported AI Providers
* **Google AI Studio (Gemini 2.5 Flash)**
* **OpenAI ChatGPT (GPT-4o)**
* **OpenRouter**
* **Local Autonomous Agentic AI Microservice** (Port 8000 via FastAPI + LangChain)

### 🔒 API Key Locking & Masking (Secret Vault)
* **Secret Masking:** Automatically encrypts and obscures your active key with `••••••••••••••••••••••••`.
* **Lock / Unlock Toggle (🔒 / 🔓):** Prevents accidental exposure or tampering in open office / shared screen environments.
* **Encrypted Local Storage:** Securely persists active credentials in client storage without exposing plain text in UI forms.
* **Pre-Flight Health Check:** Real-time API key validation test against generative AI provider endpoints.

---

## 🚀 Getting Started

### Prerequisites
* **Java 17+** & **Maven 3.9+**
* **Node.js 18+** & **npm**
* **Python 3.10+** (for Agentic AI Microservice)

### One-Click Launch
Launch all microservices, database consoles, and the Vite frontend simultaneously:

```bat
run_nexos.bat
```

This starts:
1. **Frontend Dashboard:** [http://localhost:5174/](http://localhost:5174/)
2. **Spring Boot Backend:** [http://localhost:8080/](http://localhost:8080/)
3. **Agentic AI Microservice:** [http://localhost:8000/](http://localhost:8000/) *(Swagger: `/docs`)*
4. **H2 In-Memory DB Console:** [http://localhost:8080/h2-console](http://localhost:8080/h2-console)

### Security Deployment
Deploy and verify the Juniper Cloud & WAF defense layers:

```bat
deploy_juniper_security.bat
```

---

## 📂 Project Structure

```
ERP software/
├── ai-agent/                 # LangChain Agentic AI microservice (Port 8000)
├── erp-platform/             # Enterprise Core Stack
│   ├── auth-service/         # Authentication, JWT, and 6-Layer WAF Filters
│   ├── common-library/       # Tenant isolation, security validators, entities
│   ├── organization-service/ # Multi-tenant ledger and financial engines
│   └── frontend/             # React 19 + Vite 8 High-Fidelity UI (Port 5174)
├── edge/                     # Cloudflare WAF and edge perimeter configurations
├── scripts/                  # Security deployment & attack simulation scripts
├── nexos_enterprise.html     # Standalone portable HTML prototype
├── nexos_settings.html       # Standalone theme & configuration prototype
├── run_nexos.bat             # Unified full-stack application launcher
└── deploy_juniper_security.bat # Security verification & firewall deployment
```

---

## 📄 License
NexOS Enterprise &copy; 2026. All rights reserved.
