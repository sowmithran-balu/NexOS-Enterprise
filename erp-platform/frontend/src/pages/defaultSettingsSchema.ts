export const defaultSettingsSchema: Record<string, any> = {
      // 1. GENERAL
      'company_profile': {
        title: 'Company Profile',
        category: 'General / Organization',
        description: 'Manage legal registration details, company logo, and addresses.',
        fields: [
          { name: 'legalName', label: 'Company Legal Name', type: 'text', value: 'Apex Global Trading Ltd.' },
          { name: 'tradeName', label: 'Trade Name / Monogram', type: 'text', value: 'Apex Trading' },
          { name: 'regNo', label: 'Corporate Registration Number', type: 'text', value: 'REG-9921-2026' },
          { name: 'taxId', label: 'Tax / GSTIN Identifier', type: 'text', value: '36AAAAC1234A1Z1' },
          { name: 'address', label: 'Headquarters Address', type: 'textarea', value: '123 Business Way, Suite 500, New York, NY' }
        ]
      },
      'branches': {
        title: 'Multi-Company & Branch Management',
        category: 'General / Organization',
        description: 'Configure and monitor subsidiary corporate legal entities and geographical branch warehouses.',
        fields: [
          { name: 'parentCo', label: 'Holding Company', type: 'text', value: 'Apex Group Holdings Inc.' },
          { name: 'activeBranches', label: 'Active Branches Count', type: 'number', value: '4' },
          { name: 'hqNode', label: 'Headquarters Branch Node', type: 'text', value: 'New York HQ' },
          { name: 'consolidatedBooks', label: 'Consolidate Balance Sheets', type: 'toggle', value: true }
        ]
      },
      'fiscal_year': {
        title: 'Fiscal Year & Period Settings',
        category: 'General / Organization',
        description: 'Define fiscal closing dates, reporting periods, and transaction locking dates.',
        fields: [
          { name: 'currentFy', label: 'Current Fiscal Period', type: 'text', value: 'FY 2026-27' },
          { name: 'startDate', label: 'Fiscal Start Date', type: 'date', value: '2026-04-01' },
          { name: 'endDate', label: 'Fiscal End Date', type: 'date', value: '2027-03-31' },
          { name: 'lockDate', label: 'Freeze Books Back-posting Date', type: 'date', value: '2026-06-30' }
        ]
      },
      'locale': {
        title: 'Locale & Formats',
        category: 'General / Organization',
        description: 'Set localization values including default languages, date layouts, and system timezones.',
        fields: [
          { name: 'lang', label: 'Primary GUI Language', type: 'select', options: ['English (US)', 'English (UK)', 'Spanish', 'German', 'Hindi'], value: 'English (US)' },
          { name: 'dateFormat', label: 'Date Display String', type: 'select', options: ['YYYY-MM-DD', 'DD-MM-YYYY', 'MM/DD/YYYY'], value: 'YYYY-MM-DD' },
          { name: 'tz', label: 'System Default Timezone', type: 'select', options: ['UTC', 'EST (UTC-5)', 'IST (UTC+5.5)', 'GMT (UTC+0)'], value: 'EST (UTC-5)' }
        ]
      },
      'currency': {
        title: 'Multi-Currency & Exchange Rates',
        category: 'General / Organization',
        description: 'Configure corporate base ledger currency and active foreign exchange feed integrations.',
        fields: [
          { 
            name: 'baseCurrency', 
            label: 'Base Ledger Currency', 
            type: 'select', 
            options: [
              'USD - United States Dollar',
              'EUR - Euro',
              'INR - Indian Rupee',
              'GBP - British Pound Sterling',
              'JPY - Japanese Yen',
              'CNY - Chinese Yuan',
              'CHF - Swiss Franc'
            ], 
            value: 'USD - United States Dollar' 
          },
          { name: 'autoFx', label: 'Automatic Live exchange updates', type: 'toggle', value: true },
          { name: 'secondaryCurrency', label: 'Reporting Currency', type: 'text', value: 'EUR (â‚¬)' }
        ]
      },
      'cost_centers': {
        title: 'Business Units / Cost Centers / Departments',
        category: 'General / Organization',
        description: 'Design departmental hierarchy nodes to map expenses and allocate corporate budgets.',
        fields: [
          { name: 'buCount', label: 'Business Unit Count', type: 'number', value: '6' },
          { name: 'defaultCC', label: 'Default Allocation Center', type: 'text', value: 'Corporate Admin' },
          { name: 'strictCC', label: 'Enforce Cost Center on all Expense Vouchers', type: 'toggle', value: false }
        ]
      },

      // 2. MODULES
      'module_matrix': {
        title: 'Module Activation Matrix',
        category: 'Modules & Licensing',
        description: 'Enable or disable complete ERP system modules to clean navigation workflows.',
        customRender: 'renderModuleMatrix'
      },
      'licensing': {
        title: 'License Management',
        category: 'Modules & Licensing',
        description: 'View active seats, subscription validity, and serial activation keys.',
        fields: [
          { name: 'seats', label: 'Allocated Seats / Users', type: 'text', value: '25 / 50 seats active', disabled: true },
          { name: 'expiry', label: 'Plan Expiry Date', type: 'text', value: '2028-12-31', disabled: true },
          { name: 'licenseKey', label: 'Product Activation Key', type: 'text', value: 'XXXX-NXER-8841-9921', disabled: true }
        ]
      },
      'feature_flags': {
        title: 'Feature Flags & Beta Toggles',
        category: 'Modules & Licensing',
        description: 'Test cutting-edge experimental features, AI voice modules, and new chart engines.',
        fields: [
          { name: 'aiVoice', label: 'Enable Cognitive AI Voice Assistant (FAB)', type: 'toggle', value: true },
          { name: 'darkTheme', label: 'Premium Dark-Mode Interface', type: 'toggle', value: false },
          { name: 'glassmorphism', label: 'Glassmorphic ribbon headers', type: 'toggle', value: true }
        ]
      },
      'subscription': {
        title: 'Subscription/Plan Tier',
        category: 'Modules & Licensing',
        description: 'Verify and manage your service level agreements, limits, and plan details.',
        fields: [
          { name: 'tier', label: 'Active Plan Tier', type: 'text', value: 'Enterprise Edition Plan' },
          { name: 'billingCycle', label: 'Billing Period', type: 'text', value: 'Annual Renewal (Active)', disabled: true }
        ]
      },

      // 3. VERSION & SYSTEM UPDATES
      'build_info': {
        title: 'Application Version & Build Info',
        category: 'Version & System Updates',
        description: 'Review technical binary versions and compilation dates.',
        fields: [
          { name: 'version', label: 'Core Version', type: 'text', value: 'v2.5.12-Stable', disabled: true },
          { name: 'build', label: 'Build Hash', type: 'text', value: 'b4a8e2_win64_node18', disabled: true },
          { name: 'compiled', label: 'Build Date', type: 'text', value: '2026-07-10 14:02:11', disabled: true }
        ]
      },
      'version_tracker': {
        title: 'Module-wise Version Tracker',
        category: 'Version & System Updates',
        description: 'Track database micro-version mappings and microservice compatibility.',
        fields: [
          { name: 'ledgerVersion', label: 'Ledger Engine Module', type: 'text', value: 'v2.4.0', disabled: true },
          { name: 'payrollVersion', label: 'Payroll Engine Module', type: 'text', value: 'v2.1.2', disabled: true },
          { name: 'crmVersion', label: 'CRM Interface Node', type: 'text', value: 'v1.9.9', disabled: true }
        ]
      },
      'update_scheduler': {
        title: 'Update Scheduler',
        category: 'Version & System Updates',
        description: 'Schedule automated hotfix applications and routine engine restarts.',
        fields: [
          { name: 'autoUpdate', label: 'Automatically apply minor patches', type: 'toggle', value: true },
          { name: 'hour', label: 'Maintenance Window Hour', type: 'select', options: ['00:00 (Midnight)', '02:00 AM', '04:00 AM'], value: '02:00 AM' }
        ]
      },
      'changelog': {
        title: 'Patch Notes & Changelog Viewer',
        category: 'Version & System Updates',
        description: 'Read notes regarding additions, security hotfixes, and API deprecations in recent patches.',
        fields: [
          { name: 'notes', label: 'Changelog Summary (v2.5.12)', type: 'textarea', value: '- Added dynamic settings schema-driven rendering.\n- Fixed speech synthesis InvalidStateError warnings.\n- Enabled full master additions in in-memory state.', disabled: true }
        ]
      },
      'update_history': {
        title: 'Rollback & Update History',
        category: 'Version & System Updates',
        description: 'Access previous system snapshots for rollback or patch audit verification.',
        fields: [
          { name: 'prevUpdate', label: 'Last Update Event', type: 'text', value: 'v2.5.11 applied on 2026-07-01', disabled: true },
          { name: 'rollbackAllowed', label: 'Allow recovery rollbacks', type: 'toggle', value: false }
        ]
      },
      'environment': {
        title: 'Environment Selector',
        category: 'Version & System Updates',
        description: 'Designate system mode parameters (Dev, Staging, or Prod) to enforce protection flags.',
        fields: [
          { name: 'env', label: 'Deployment State', type: 'select', options: ['Production', 'Staging / QA Sandbox', 'Developer Environment'], value: 'Production' }
        ]
      },

      // 4. USER MANAGEMENT & SECURITY
      'user_accounts': {
        title: 'User Accounts',
        category: 'User Management & Security',
        description: 'Activate, register, deactivate, and manage employee accounts and passwords.',
        fields: [
          { name: 'adminMail', label: 'Primary Super Administrator Email', type: 'text', value: 'admin@apexcorp.com' },
          { name: 'newUserDefRole', label: 'Default Role for new registrations', type: 'select', options: ['Standard Clerk', 'Manager', 'Auditor', 'CRM agent'], value: 'Standard Clerk' },
          { name: 'inviteRequired', label: 'Require admin invite for self-registration', type: 'toggle', value: true }
        ]
      },
      'rbac_matrix': {
        title: 'Role-Based Access Control (RBAC) Matrix',
        category: 'User Management & Security',
        description: 'Establish read/write permissions mapped across standard roles and custom user levels.',
        customRender: 'renderRBACMatrix'
      },
      'permission_groups': {
        title: 'Permission Groups & Custom Roles',
        category: 'User Management & Security',
        description: 'Declare custom role classes for specific departmental workflow combinations.',
        fields: [
          { name: 'allowCustomRoles', label: 'Support custom role subclasses', type: 'toggle', value: true },
          { name: 'groupCount', label: 'Active custom groups registered', type: 'number', value: '3', disabled: true }
        ]
      },
      'two_factor': {
        title: 'Two-Factor Authentication (2FA)',
        category: 'User Management & Security',
        description: 'Enforce MFA policies using TOTP software codes or hardware credentials.',
        fields: [
          { name: 'enforce2fa', label: 'Mandate 2FA for all administrative accounts', type: 'toggle', value: true },
          { name: 'totpIssuer', label: 'TOTP Monogram Issuer Header', type: 'text', value: 'NexOS-Apex' }
        ]
      },
      'sso_config': {
        title: 'SSO / SAML / OAuth Config',
        category: 'User Management & Security',
        description: 'Connect internal Active Directory nodes, Google Workspace SSO, or Microsoft Azure credentials.',
        fields: [
          { name: 'ssoEnabled', label: 'Enable SSO authentication login integrations', type: 'toggle', value: false },
          { name: 'oauthClient', label: 'Client Client ID key token', type: 'text', value: 'oauth_apex_client_921.apps.googleusercontent.com' }
        ]
      },
      'session_policies': {
        title: 'Session & Password Policies',
        category: 'User Management & Security',
        description: 'Set automatic session logout expirations and password entropy guidelines.',
        fields: [
          { name: 'timeout', label: 'Auto-logout idle sessions (minutes)', type: 'number', value: '15' },
          { name: 'expiryDays', label: 'Password expiration interval (days)', type: 'number', value: '90' },
          { name: 'strictRegex', label: 'Require special symbols, numbers, and case parity', type: 'toggle', value: true }
        ]
      },
      'ip_whitelisting': {
        title: 'IP Whitelisting & Restrictions',
        category: 'User Management & Security',
        description: 'Define allowed CIDR blocks or corporate static network IP addresses.',
        fields: [
          { name: 'restrictIP', label: 'Enforce connection restrictions', type: 'toggle', value: false },
          { name: 'whitelist', label: 'Allowed IP Ranges (Comma separated)', type: 'textarea', value: '192.168.1.0/24, 10.0.0.0/8' }
        ]
      },
      'login_activity': {
        title: 'Login Activity & Device Registry',
        category: 'User Management & Security',
        description: 'Audit logs of active user sessions, device specs, and source IP headers.',
        fields: [
          { name: 'activeSessions', label: 'Active Connected Sessions', type: 'text', value: '4 active sessions', disabled: true },
          { name: 'alertNewDev', label: 'Send alerts on new unrecognized device login', type: 'toggle', value: true }
        ]
      },

      // 5. FINANCE
      'chart_of_accounts': {
        title: 'Chart of Accounts Setup',
        category: 'Finance & Accounting Config',
        description: 'Maintain primary accounting structures, numbering templates, and ledger schemas.',
        fields: [
          { name: 'digits', label: 'Account Code digits format', type: 'select', options: ['5 Digits', '6 Digits', 'Alphanumeric'], value: '5 Digits' },
          { name: 'enforceParent', label: 'Enforce parent category hierarchy validation', type: 'toggle', value: true }
        ]
      },
      'tax_config': {
        title: 'Tax Configuration',
        category: 'Finance & Accounting Config',
        description: 'Establish standard tax codes (GST, VAT, TDS, TCS) and HSN/SAC rate mapping lists.',
        fields: [
          { name: 'defaultGst', label: 'Default GST Levy Rate (%)', type: 'select', options: ['5%', '12%', '18%', '28%'], value: '18%' },
          { name: 'tdsEnabled', label: 'Calculate TDS on invoice postings', type: 'toggle', value: true },
          { name: 'hsnMandatory', label: 'Mandate HSN codes on inventory bills', type: 'toggle', value: true }
        ]
      },
      'e_invoicing': {
        title: 'E-Invoicing / E-Way Bill API',
        category: 'Finance & Accounting Config',
        description: 'Configure active API connections for direct statutory filings and digital signatures.',
        fields: [
          { name: 'apiUsername', label: 'Government Sandbox API Username', type: 'text', value: 'APEX_SANDBOX_BILL' },
          { name: 'apiPassword', label: 'Government Portal Password', type: 'password', value: '********' },
          { name: 'liveFilings', label: 'Submit invoices directly upon posting', type: 'toggle', value: false }
        ]
      },
      'numbering_series': {
        title: 'Numbering Series Templates',
        category: 'Finance & Accounting Config',
        description: 'Define specific auto-number prefix formats for purchase orders, sales bills, and vouchers.',
        fields: [
          { name: 'invoicePrefix', label: 'Sales Invoice Code Prefix', type: 'text', value: 'INV-2026-' },
          { name: 'voucherPrefix', label: 'Journal Voucher Code Prefix', type: 'text', value: 'VCH-2026-' },
          { name: 'poPrefix', label: 'Purchase Order Code Prefix', type: 'text', value: 'PO-2026-' }
        ]
      },
      'payment_terms': {
        title: 'Payment Terms & Credit Limits',
        category: 'Finance & Accounting Config',
        description: 'Set standard payment milestones and maximum client credit thresholds.',
        fields: [
          { name: 'defaultTerms', label: 'Default Payment terms', type: 'select', options: ['Net 15', 'Net 30', 'Net 60', 'Immediate'], value: 'Net 30' },
          { name: 'maxCredit', label: 'Default Client Credit Limit ($)', type: 'number', value: '50000' },
          { name: 'blockOvercredit', label: 'Block sales invoicing if credit limit is breached', type: 'toggle', value: true }
        ]
      },
      'bank_master': {
        title: 'Bank Account Master & Reconciliation',
        category: 'Finance & Accounting Config',
        description: 'Connect banking gateways, parse statement uploads, and configure reconciliation models.',
        fields: [
          { name: 'reconcileTolerance', label: 'Statement match tolerance window (Days)', type: 'number', value: '3' },
          { name: 'bankFeedAuto', label: 'Enable live banking feed API synchronization', type: 'toggle', value: false }
        ]
      },
      'costing_method': {
        title: 'Inventory Costing Method',
        category: 'Finance & Accounting Config',
        description: 'Establish standard inventory ledger costing rules.',
        fields: [
          { name: 'costing', label: 'Valuation Costing model', type: 'select', options: ['First-In, First-Out (FIFO)', 'Last-In, First-Out (LIFO)', 'Weighted Average Costing'], value: 'First-In, First-Out (FIFO)' }
        ]
      },

      // 6. INVENTORY
      'warehouse_master': {
        title: 'Warehouse / Location Master',
        category: 'Inventory & Procurement Settings',
        description: 'Create and map storage warehouses and physical store shelves.',
        fields: [
          { name: 'whCount', label: 'Registered Storage Warehouses', type: 'number', value: '3', disabled: true },
          { name: 'transitWh', label: 'Transit / Delivery Stock Location', type: 'text', value: 'Transit-WH-Global' }
        ]
      },
      'uom_config': {
        title: 'Unit of Measure (UOM) Configuration',
        category: 'Inventory & Procurement Settings',
        description: 'Establish standard product packing ratios and primary unit representations.',
        fields: [
          { name: 'defUom', label: 'Default Product Unit class', type: 'select', options: ['PCS', 'MT', 'Box', 'KG', 'Ltr'], value: 'PCS' },
          { name: 'fractionUom', label: 'Allow fractional quantities (e.g. 1.25 kg)', type: 'toggle', value: true }
        ]
      },
      'reorder_rules': {
        title: 'Reorder Level & Safety Stock Rules',
        category: 'Inventory & Procurement Settings',
        description: 'Configure automated trigger rules for generating purchase requisitions.',
        fields: [
          { name: 'safetyStockPct', label: 'Safety Stock Margin percentage (%)', type: 'number', value: '15' },
          { name: 'autoReorderPo', label: 'Auto-generate PO draft on reorder breach', type: 'toggle', value: false }
        ]
      },
      'approval_workflows': {
        title: 'Approval Workflows',
        category: 'Inventory & Procurement Settings',
        description: 'Design authorization limit chains for purchase requisitions.',
        fields: [
          { name: 'poLimit', label: 'Manager Purchase Limit without Director signoff ($)', type: 'number', value: '10000' },
          { name: 'strictApproval', label: 'Reject purchase receipts without matching PO approvals', type: 'toggle', value: true }
        ]
      },
      'vendor_master': {
        title: 'Vendor Master & Rating Criteria',
        category: 'Inventory & Procurement Settings',
        description: 'Set quality score guidelines and delivery tolerance limits for vendor ranks.',
        fields: [
          { name: 'scoreMin', label: 'Minimum rating for preferred vendor tier', type: 'number', value: '80' },
          { name: 'evalPeriod', label: 'Rating recalculation window (Months)', type: 'number', value: '6' }
        ]
      },
      'serial_tracking': {
        title: 'Batch/Serial Number Tracking Rules',
        category: 'Inventory & Procurement Settings',
        description: 'Manage expiration checks, serial number ranges, and batch control policies.',
        fields: [
          { name: 'trackExpiration', label: 'Mandate expiration dates on batch receipts', type: 'toggle', value: true },
          { name: 'serialLength', label: 'Standard Serial number length (characters)', type: 'number', value: '12' }
        ]
      },

      // 7. MANUFACTURING
      'bom_config': {
        title: 'BOM Configuration',
        category: 'Manufacturing / MRP Settings',
        description: 'Define component wastage limits and revision control policies for manufacturing BOMs.',
        fields: [
          { name: 'wastagePct', label: 'Standard BOM component wastage limit (%)', type: 'number', value: '5' },
          { name: 'revisionControl', label: 'Enforce Revision control on Bill of Materials', type: 'toggle', value: true }
        ]
      },
      'work_center_master': {
        title: 'Routing & Work Center Master',
        category: 'Manufacturing / MRP Settings',
        description: 'Configure overhead rates, setup times, and machinery center definitions.',
        fields: [
          { name: 'hourlyRate', label: 'Default work center overhead rate ($/hr)', type: 'number', value: '45' },
          { name: 'setupTime', label: 'Standard machine setup time allowances (mins)', type: 'number', value: '15' }
        ]
      },
      'production_rules': {
        title: 'Production Planning Rules',
        category: 'Manufacturing / MRP Settings',
        description: 'Set material reservations, capacity models, and manufacturing schedule leads.',
        fields: [
          { name: 'leadDays', label: 'Standard production buffer lead time (Days)', type: 'number', value: '3' },
          { name: 'reserveStock', label: 'Reserve raw components upon work order approval', type: 'toggle', value: true }
        ]
      },
      'quality_checkpoints': {
        title: 'Quality Control Checkpoints',
        category: 'Manufacturing / MRP Settings',
        description: 'Configure inspection templates and failure threshold percentages.',
        fields: [
          { name: 'qaSamplePct', label: 'Batch Sampling rate for QA check (%)', type: 'number', value: '10' },
          { name: 'qaBlock', label: 'Freeze inventory usage on batch QA failure', type: 'toggle', value: true }
        ]
      },
      'shift_planning': {
        title: 'Shift & Capacity Planning',
        category: 'Manufacturing / MRP Settings',
        description: 'Manage factory operation schedules, shift limits, and overtime rules.',
        fields: [
          { name: 'shiftsCount', label: 'Active manufacturing shifts per day', type: 'select', options: ['1 Shift (8hr)', '2 Shifts (16hr)', '3 Shifts (24hr Continuous)'], value: '2 Shifts (16hr)' },
          { name: 'otAllowed', label: 'Enable factory overtime calculations', type: 'toggle', value: true }
        ]
      },

      // 8. SALES & CRM
      'crm_pipeline': {
        title: 'Sales Pipeline Stages',
        category: 'Sales & CRM Settings',
        description: 'Maintain sales stages and closing probability mappings.',
        fields: [
          { name: 'stagesList', label: 'Lead Pipeline Stages', type: 'text', value: 'Qualification, Proposal Sent, Negotiation, Closed Won', disabled: true },
          { name: 'winWeight', label: 'Default closing probability weight (%)', type: 'number', value: '35' }
        ]
      },
      'lead_scoring': {
        title: 'Lead Scoring Rules',
        category: 'Sales & CRM Settings',
        description: 'Declare scoring indicators based on client actions, volume, and budget ranges.',
        fields: [
          { name: 'scoreScale', label: 'Max qualification rank score', type: 'number', value: '100' },
          { name: 'scoringEmail', label: 'Award points for valid company domain email', type: 'number', value: '15' }
        ]
      },
      'quotation_templates': {
        title: 'Quotation/Order Templates',
        category: 'Sales & CRM Settings',
        description: 'Choose template formats and design print terms for customer quotes.',
        fields: [
          { name: 'quoteValidDays', label: 'Standard quotation validity (Days)', type: 'number', value: '30' },
          { name: 'termsQuote', label: 'Legal Disclaimers & General SLA notes', type: 'textarea', value: 'Prices are subject to market adjustments after validity period.' }
        ]
      },
      'discount_rules': {
        title: 'Discount & Pricing Rules',
        category: 'Sales & CRM Settings',
        description: 'Manage discount caps, customer price lists, and trade promo mappings.',
        fields: [
          { name: 'maxClerkDiscount', label: 'Standard clerk discount cap (%)', type: 'number', value: '5' },
          { name: 'bulkDiscountQty', label: 'Minimum quantity for bulk tier activation', type: 'number', value: '500' }
        ]
      },
      'customer_segments': {
        title: 'Customer Segmentation Tags',
        category: 'Sales & CRM Settings',
        description: 'Manage classification badges (Tier-1, VIP) for loyalty reports.',
        fields: [
          { name: 'segments', label: 'Active segment badges', type: 'text', value: 'Tier-1, VIP, Distributor, Retailer', disabled: true },
          { name: 'autoVIP', label: 'Auto-flag customers exceeding $100k annual sales as VIP', type: 'toggle', value: true }
        ]
      },
      'sales_territories': {
        title: 'Territory & Sales Team Mapping',
        category: 'Sales & CRM Settings',
        description: 'Delegate regional zip codes and geographical locations to sales reps.',
        fields: [
          { name: 'regionCode', label: 'Default region code node', type: 'text', value: 'AMER-EAST' },
          { name: 'commissionPct', label: 'Standard sales team target achievement commission (%)', type: 'number', value: '2.5' }
        ]
      },

      // 9. HR & PAYROLL
      'employee_fields': {
        title: 'Employee Master Fields',
        category: 'HR & Payroll Settings',
        description: 'Configure standard fields and active custom metadata tags in the employee registry.',
        fields: [
          { name: 'employeeIdFormat', label: 'Employee ID generation format', type: 'text', value: 'EMP-[0-9]{3}' },
          { name: 'collectBloodGroup', label: 'Require emergency medical records', type: 'toggle', value: true }
        ]
      },
      'salary_components': {
        title: 'Salary Structure & Components',
        category: 'HR & Payroll Settings',
        description: 'Maintain salary configurations including Basic Pay, HRA, allowance codes, and deductions.',
        fields: [
          { name: 'basicPct', label: 'Basic Salary allocation percentage (%)', type: 'number', value: '50' },
          { name: 'hraPct', label: 'HRA allowance percentage (%)', type: 'number', value: '40' }
        ]
      },
      'hr_compliance': {
        title: 'Statutory Compliance (PF/ESI/PT)',
        category: 'HR & Payroll Settings',
        description: 'Set PF rates, tax deductions, and standard local compliance parameters.',
        fields: [
          { name: 'pfRate', label: 'PF Employee contribution rate (%)', type: 'number', value: '12' },
          { name: 'esiRate', label: 'ESI contribution rate (%)', type: 'number', value: '0.75' }
        ]
      },
      'leave_policy': {
        title: 'Leave Policy & Attendance Rules',
        category: 'HR & Payroll Settings',
        description: 'Establish leave accruals, casual leave caps, and overtime rules.',
        fields: [
          { name: 'annualLeaves', label: 'Annual paid leave days allowance', type: 'number', value: '24' },
          { name: 'carryForwardLimit', label: 'Max carry forward days to next fiscal year', type: 'number', value: '10' }
        ]
      },
      'hr_shifts': {
        title: 'Shift Scheduling',
        category: 'HR & Payroll Settings',
        description: 'Configure corporate shift models, weekly holidays, and grace time parameters.',
        fields: [
          { name: 'graceMins', label: 'Attendance login grace time (Minutes)', type: 'number', value: '15' },
          { name: 'halfDayMins', label: 'Minimum daily attendance minutes for half-day status', type: 'number', value: '240' }
        ]
      },
      'payroll_chain': {
        title: 'Payroll Cycle & Approval Chain',
        category: 'HR & Payroll Settings',
        description: 'Set monthly closing dates and assign payroll approval chains.',
        fields: [
          { name: 'closingDay', label: 'Payroll generation day of month', type: 'number', value: '28' },
          { name: 'auditChainRequired', label: 'Require double-signoff before salary disbursements', type: 'toggle', value: true }
        ]
      },

      // 10. INTEGRATIONS & API
      'db_connection': {
        title: 'Database Connection',
        category: 'Integrations & API Management',
        description: 'Configure and test the primary database engine connection.',
        fields: [
          { name: 'dbHost', label: 'Database Host Server', type: 'text', value: 'sql-prod-cluster.apexcorp.local' },
          { name: 'dbName', label: 'Initial Database catalog', type: 'text', value: 'NEXOS_ERP_PROD' },
          { name: 'dbUser', label: 'Database User credential login', type: 'text', value: 'erp_app_sa' },
          { name: 'maxPool', label: 'Maximum connection pool limit', type: 'number', value: '150' }
        ]
      },
      'third_party': {
        title: 'Third-Party App Connectors',
        category: 'Integrations & API Management',
        description: 'Link SMS channels, email hosts, tax servers, and payment gateways.',
        fields: [
          { name: 'smtpHost', label: 'Outgoing SMTP Server Address', type: 'text', value: 'smtp.sendgrid.net' },
          { name: 'smtpPort', label: 'SMTP Connection Port', type: 'number', value: '587' },
          { name: 'smsSender', label: 'SMS API Gateway Sender Code', type: 'text', value: 'APEXTR' }
        ]
      },
      'api_webhooks': {
        title: 'API Key Management & Webhooks',
        category: 'Integrations & API Management',
        description: 'Generate client authentication tokens and register payload delivery webhooks.',
        customRender: 'renderApiWebhooks'
      },
      'import_export': {
        title: 'Import/Export Templates',
        category: 'Integrations & API Management',
        description: 'Configure mappings for uploading CSV/Excel sheets into ledger accounts.',
        fields: [
          { name: 'allowOverwrites', label: 'Allow item overrides on CSV identifier collisions', type: 'toggle', value: false },
          { name: 'strictSchema', label: 'Validate CSV headers against system column schema', type: 'toggle', value: true }
        ]
      },
      'edi_setup': {
        title: 'EDI / B2B Integration Setup',
        category: 'Integrations & API Management',
        description: 'Configure document transfer rules (EDIFACT, ANSI X12) for automated B2B transactions.',
        fields: [
          { name: 'ediEnabled', label: 'Enable EDI system listener daemon', type: 'toggle', value: false },
          { name: 'isaSenderId', label: 'ISA Interchange Sender ID', type: 'text', value: 'APEX_EDI_2026' }
        ]
      },

      // 11. NOTIFICATIONS
      'alert_rules': {
        title: 'Event-Based Alert Rules',
        category: 'Notifications & Alerts',
        description: 'Configure automated system alerts based on inventory thresholds or client balances.',
        fields: [
          { name: 'alertLowStock', label: 'Send alerts when product qty hits safety level', type: 'toggle', value: true },
          { name: 'alertOverdue', label: 'Send warning on invoices overdue past 45 days', type: 'toggle', value: true }
        ]
      },
      'notification_channels': {
        title: 'Notification Channels',
        category: 'Notifications & Alerts',
        description: 'Toggle email alerts, push updates, SMS delivery, or webhooks.',
        fields: [
          { name: 'sendEmail', label: 'Primary Email alert channel', type: 'toggle', value: true },
          { name: 'sendSms', label: 'SMS broadcast emergency backup channel', type: 'toggle', value: false },
          { name: 'sendPush', label: 'In-app desktop push notifications', type: 'toggle', value: true }
        ]
      },
      'escalation_matrix': {
        title: 'Escalation Matrix',
        category: 'Notifications & Alerts',
        description: 'Set duration parameters before escalations trigger notification transfers.',
        fields: [
          { name: 'escHours', label: 'Delay before escalating pending approvals to supervisor (Hours)', type: 'number', value: '48' },
          { name: 'strictEscalation', label: 'Auto-delegate tasks on escalation triggers', type: 'toggle', value: true }
        ]
      },
      'alert_templates': {
        title: 'Custom Alert Templates',
        category: 'Notifications & Alerts',
        description: 'Customize layout text for system warning broadcasts.',
        fields: [
          { name: 'overdueTemplate', label: 'Invoice Overdue Notification text', type: 'textarea', value: 'Dear customer, invoice {invoice_no} is overdue for payment. Please settle balances.' }
        ]
      },

      // 12. AUDIT
      'audit_logs': {
        title: 'Audit Log Viewer & Retention Policy',
        category: 'Audit, Compliance & Backup',
        description: 'Set log storage limits and read technical history logs.',
        fields: [
          { name: 'logRetentionDays', label: 'Log files retention interval (Days)', type: 'number', value: '365' },
          { name: 'auditLevel', label: 'Audit scope detail parameters', type: 'select', options: ['Minimal - Actions only', 'Standard - Before/After values', 'Verbose - Deep tracing data'], value: 'Standard - Before/After values' }
        ]
      },
      'backup_manager': {
        title: 'Data Backup Schedule & Restore Points',
        category: 'Audit, Compliance & Backup',
        description: 'Configure automated backup routines and verify restore snapshots.',
        customRender: 'renderBackupManager'
      },
      'gdpr_controls': {
        title: 'GDPR / Data Privacy Controls',
        category: 'Audit, Compliance & Backup',
        description: 'Set customer record erasure controls and data anonymization parameters.',
        fields: [
          { name: 'gdprMode', label: 'Anonymize personal customer records on deletion requests', type: 'toggle', value: true },
          { name: 'consentMandatory', label: 'Mandate cookie & data processing consent flags', type: 'toggle', value: true }
        ]
      },
      'regulatory_checklist': {
        title: 'Regulatory Compliance Checklist',
        category: 'Audit, Compliance & Backup',
        description: 'Verify system configurations against regional regulatory frameworks.',
        fields: [
          { name: 'soxCheck', label: 'SOX section 404 audit configurations active', type: 'toggle', value: true },
          { name: 'iso27001Check', label: 'Validate system password rules against ISO 27001 guidelines', type: 'toggle', value: true }
        ]
      },
      'doc_retention': {
        title: 'Document Retention Rules',
        category: 'Audit, Compliance & Backup',
        description: 'Set automatic deletion schedules for old PDFs and attachment files.',
        fields: [
          { name: 'pdfRetentionYears', label: 'Financial document retention duration (Years)', type: 'number', value: '7' }
        ]
      },

      // 13. CUSTOMIZATION
      'custom_fields': {
        title: 'Custom Field Builder',
        category: 'Customization & Workflow',
        description: 'Add custom data fields dynamically into ledger, sales, or vendor pages.',
        fields: [
          { name: 'targetModule', label: 'Target Module for custom field insertion', type: 'select', options: ['Ledger Accounts', 'Products Master', 'Sales Invoice', 'BOM Header'], value: 'Ledger Accounts' },
          { name: 'fieldName', label: 'Custom Field Identifier / Key', type: 'text', value: 'custom_cost_centre_ref' },
          { name: 'fieldType', label: 'Field Type / Format', type: 'select', options: ['Text', 'Number', 'Checkbox', 'Date Dropdown'], value: 'Text' }
        ]
      },
      'workflow_builder': {
        title: 'Workflow / Approval Builder',
        category: 'Customization & Workflow',
        description: 'Assign conditional roles to purchase or order validation pipelines.',
        fields: [
          { name: 'enforceWorkflow', label: 'Enforce custom multi-stage approval workflow', type: 'toggle', value: true },
          { name: 'stepsCount', label: 'Maximum steps in approval pipelines', type: 'number', value: '5' }
        ]
      },
      'report_builder_access': {
        title: 'Report & Dashboard Builder Access',
        category: 'Customization & Workflow',
        description: 'Manage builder authorizations for creating custom dashboard charts.',
        fields: [
          { name: 'clerkAccess', label: 'Allow clerks to design custom balance sheets', type: 'toggle', value: false },
          { name: 'sqlReporting', label: 'Allow execution of custom SQL commands inside reports', type: 'toggle', value: false }
        ]
      },
      'print_designer': {
        title: 'Print Format / Document Template Designer',
        category: 'Customization & Workflow',
        description: 'Manage layout styling (margins, columns, fonts) for sales receipts and invoice prints.',
        fields: [
          { name: 'paperSize', label: 'Default output document format', type: 'select', options: ['A4 Standard', 'Letter size', 'Thermal Roll (80mm)'], value: 'A4 Standard' },
          { name: 'showLogo', label: 'Include company corporate monogram on prints', type: 'toggle', value: true }
        ]
      },
      'design_customizer': {
        title: 'Theme & Design Customizer',
        category: 'Customization & Workflow',
        description: 'Edit theme modes, accent colors, typography, and component shapes.',
        customRender: 'renderDesignCustomizer'
      },
      'custom_numbering': {
        title: 'Custom Numbering & Naming Series',
        category: 'Customization & Workflow',
        description: 'Set custom numbering lengths and dynamic fiscal variables in prefixes.',
        fields: [
          { name: 'padZeroes', label: 'Pad voucher numbering series with zeros', type: 'number', value: '4' },
          { name: 'resetAnnual', label: 'Reset numbering indexes annually on fiscal starts', type: 'toggle', value: true }
        ]
      },

      // 14. MAINTENANCE
      'cache_management': {
        title: 'Cache Management / Clear Cache',
        category: 'System Maintenance',
        description: 'Clear system caches and rebuild dynamic code assemblies.',
        customRender: 'renderCacheManagement'
      },
      'background_jobs': {
        title: 'Scheduled Jobs & Background Tasks',
        category: 'System Maintenance',
        description: 'Monitor currency updates, report compiles, and routine tasks in real-time.',
        fields: [
          { name: 'maxBackgroundThreads', label: 'Maximum background parallel worker threads', type: 'number', value: '8' },
          { name: 'taskTimeoutMins', label: 'Force terminate stalled tasks after (Minutes)', type: 'number', value: '30' }
        ]
      },
      'system_logs': {
        title: 'System Logs & Error Tracker',
        category: 'System Maintenance',
        description: 'View standard system exceptions and track technical performance warnings.',
        fields: [
          { name: 'streamLogs', label: 'Stream core application warnings directly to syslog server', type: 'toggle', value: false },
          { name: 'syslogServer', label: 'Remote syslog target server IP', type: 'text', value: '10.0.8.55' }
        ]
      },
      'storage_cleanup': {
        title: 'Storage Usage & Cleanup Tools',
        category: 'System Maintenance',
        description: 'Audit storage drives and remove old debug dumps.',
        fields: [
          { name: 'usedSpace', label: 'Current Disk Usage space percentage', type: 'text', value: '42.8 GB / 100 GB (42.8% used)', disabled: true },
          { name: 'cleanupDumps', label: 'Remove debug dump logs older than 7 days', type: 'toggle', value: true }
        ]
      },
      'sandbox_reset': {
        title: 'Sandbox & Test Data Reset',
        category: 'System Maintenance',
        description: 'Restore settings defaults and flush out transaction logs.',
        customRender: 'renderSandboxReset'
      }
    };

