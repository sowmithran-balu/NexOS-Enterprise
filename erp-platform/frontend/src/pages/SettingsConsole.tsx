import React, { useState, useEffect } from 'react';
import { defaultSettingsSchema } from './defaultSettingsSchema';
import SecurityFirewallConsole from './SecurityFirewallConsole';

interface SettingsConsoleProps {
  companyName: string;
  setCompanyName: (val: string) => void;
  fiscalYear: string;
  setFiscalYear: (val: string) => void;
  planTier: string;
  setPlanTier: (val: string) => void;
  onBack: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning') => void;
}

const categoriesList = [
  { id: 'general', title: '1. GENERAL / ORGANIZATION', icon: 'corporate_fare', subKeys: ['company_profile', 'branches', 'fiscal_year', 'locale', 'currency', 'cost_centers'], badge: 'Active' },
  { id: 'modules', title: '2. MODULES & LICENSING', icon: 'toggle_on', subKeys: ['module_matrix', 'licensing', 'feature_flags', 'subscription'], badge: 'Active' },
  { id: 'version', title: '3. VERSION & SYSTEM UPDATES', icon: 'system_update', subKeys: ['build_info', 'version_tracker', 'update_scheduler', 'changelog', 'update_history', 'environment'], badge: 'Update' },
  { id: 'users', title: '4. USER MANAGEMENT & SECURITY', icon: 'security', subKeys: ['user_accounts', 'rbac_matrix', 'firewall_defense', 'permission_groups', 'two_factor', 'sso_config', 'session_policies', 'ip_whitelisting', 'login_activity'], badge: 'Active' },
  { id: 'finance', title: '5. FINANCE & ACCOUNTING CONFIG', icon: 'account_balance', subKeys: ['chart_of_accounts', 'tax_config', 'e_invoicing', 'numbering_series', 'payment_terms', 'bank_master', 'costing_method'], badge: 'Active' },
  { id: 'inventory', title: '6. INVENTORY & PROCUREMENT SETTINGS', icon: 'inventory_2', subKeys: ['warehouse_master', 'uom_config', 'reorder_rules', 'approval_workflows', 'vendor_master', 'serial_tracking'], badge: 'Active' },
  { id: 'manufacturing', title: '7. MANUFACTURING / MRP SETTINGS', icon: 'precision_manufacturing', subKeys: ['bom_config', 'work_center_master', 'production_rules', 'quality_checkpoints', 'shift_planning'], badge: 'Setup' },
  { id: 'sales_crm', title: '8. SALES & CRM SETTINGS', icon: 'contact_page', subKeys: ['crm_pipeline', 'lead_scoring', 'quotation_templates', 'discount_rules', 'customer_segments', 'sales_territories'], badge: 'Active' },
  { id: 'hr_payroll', title: '9. HR & PAYROLL SETTINGS', icon: 'badge', subKeys: ['employee_fields', 'salary_components', 'leave_policy', 'hr_compliance', 'hr_shifts', 'payroll_chain'], badge: 'Active' },
  { id: 'integrations', title: '10. INTEGRATIONS & API MANAGEMENT', icon: 'settings_ethernet', subKeys: ['db_connection', 'third_party', 'api_webhooks', 'import_export', 'edi_setup'], badge: 'Active' },
  { id: 'notifications', title: '11. NOTIFICATIONS & ALERTS', icon: 'notifications_active', subKeys: ['alert_rules', 'notification_channels', 'escalation_matrix', 'alert_templates'], badge: 'Active' },
  { id: 'audit_backup', title: '12. AUDIT, COMPLIANCE & BACKUP', icon: 'restore_page', subKeys: ['audit_logs', 'backup_manager', 'gdpr_controls', 'regulatory_checklist', 'doc_retention'], badge: 'Active' },
  { id: 'customization', title: '13. CUSTOMIZATION & WORKFLOW', icon: 'dashboard_customize', subKeys: ['custom_fields', 'workflow_builder', 'report_builder_access', 'print_designer', 'design_customizer', 'custom_numbering'], badge: 'Active' },
  { id: 'maintenance', title: '14. SYSTEM MAINTENANCE', icon: 'build_circle', subKeys: ['cache_management', 'background_jobs', 'system_logs', 'storage_cleanup', 'sandbox_reset'], badge: 'Active' }
];

export default function SettingsConsole({
  companyName,
  setCompanyName,
  fiscalYear,
  setFiscalYear,
  planTier,
  setPlanTier,
  onBack,
  showToast
}: SettingsConsoleProps) {
  // Load settings schema from localStorage or defaults
  const [settingsSchema, setSettingsSchema] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('nexos_settings_schema');
    if (!saved) return defaultSettingsSchema;
    try {
      const parsed = JSON.parse(saved);
      const merged = { ...defaultSettingsSchema };
      for (const key in merged) {
        if (parsed[key] && parsed[key].fields && merged[key].fields) {
          merged[key].fields = merged[key].fields.map((defField: any) => {
            const savedField = parsed[key].fields.find((f: any) => f.name === defField.name);
            return savedField ? { ...defField, value: savedField.value } : defField;
          });
        }
      }
      return merged;
    } catch (e) {
      console.error('Error loading settings schema', e);
      return defaultSettingsSchema;
    }
  });

  const [activeSubKey, setActiveSubKey] = useState<string>('company_profile');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({ general: true });
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Custom panel states
  const [modules, setModules] = useState([
    { name: 'Core Accounts & General Ledger', active: true, essential: true },
    { name: 'Accounts Payable & Receivable', active: true, essential: true },
    { name: 'Inventory & Materials Management', active: true, essential: false },
    { name: 'Payroll & HR Administration', active: true, essential: false },
    { name: 'Sales & CRM Deals Engine', active: true, essential: false },
    { name: 'Manufacturing (BOM & Routing)', active: false, essential: false }
  ]);

  const [rbacMatrix, setRbacMatrix] = useState<Record<string, boolean[]>>({
    'Administrator': [true, true, true, true, true, true],
    'Accountant': [true, true, false, false, false, false],
    'Sales Representative': [true, false, false, false, false, false],
    'Manager': [true, true, true, false, true, false]
  });
  const rbacPermissions = ['Read ledger', 'Post journal entries', 'Approve payroll', 'Modify BOM routes', 'Configure integrations', 'Trigger system rollbacks'];
  const rbacRoles = ['Administrator', 'Accountant', 'Sales Representative', 'Manager'];

  const [apiKeys, setApiKeys] = useState([
    { name: 'Google Studio API Connector', key: 'nx_live_gemini_f7832...b1', created: '2026-07-01' },
    { name: 'Tax Portal API Endpoint', key: 'nx_eway_statutory_9901...a8', created: '2026-07-05' }
  ]);
  const [webhookUrl, setWebhookUrl] = useState('https://webhook.site/apex-gateway-ledger');

  const [backups, setBackups] = useState([
    { name: 'NEXOS_AUTO_DAILY_BK_2026-07-11.bak', size: '242 MB', date: '2026-07-11 23:59:00', type: 'System Auto' },
    { name: 'NEXOS_LEDGER_PREPATCH_RESTORE.bak', size: '241 MB', date: '2026-07-09 12:04:10', type: 'Manual Admin' }
  ]);
  const [backupFreq, setBackupFreq] = useState('daily');
  const [backupTarget, setBackupTarget] = useState('s3://apex-erp-backup-store/');

  const [backingUp, setBackingUp] = useState(false);

  // Design theme customizer state
  const [themeState, setThemeState] = useState(() => {
    return {
      theme: localStorage.getItem('design_theme') || 'light',
      contrast: localStorage.getItem('design_contrast') || '1',
      accent: localStorage.getItem('design_accent') || '#12A594'
    };
  });

  const [previewState, setPreviewState] = useState({ ...themeState });

  // Handle category search/filter
  const filterSettings = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) return;

    // Automatically expand categories containing matches
    const newExpanded: Record<string, boolean> = {};
    categoriesList.forEach(cat => {
      const match = cat.subKeys.some(subKey => {
        const item = settingsSchema[subKey];
        return item && (
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
        );
      });
      if (match) {
        newExpanded[cat.id] = true;
      }
    });
    setExpandedCategories(prev => ({ ...prev, ...newExpanded }));
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Adjust hex colors for accent hover/tint colors
  const adjustHexColor = (hex: string, percent: number) => {
    if (!hex.startsWith('#')) return hex;
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = Math.min(255, Math.max(0, parseInt(((R * (100 + percent)) / 100).toString())));
    G = Math.min(255, Math.max(0, parseInt(((G * (100 + percent)) / 100).toString())));
    B = Math.min(255, Math.max(0, parseInt(((B * (100 + percent)) / 100).toString())));

    const rHex = R.toString(16).padStart(2, '0');
    const gHex = G.toString(16).padStart(2, '0');
    const bHex = B.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  };

  // Apply CSS variables to root element
  const applyThemeStyleRules = (theme: string, contrast: string, accent: string) => {
    let bg = '#F3F5F9';
    let surface = '#FFFFFF';
    let text = '#161B33';
    let text2 = '#5B6178';
    let border = '#E1E5EC';

    if (theme === 'dark') {
      bg = '#0B1220';
      surface = '#172033';
      text = '#F8FAFC';
      text2 = '#CBD5E1';
      border = '#273449';
    } else if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      bg = isDark ? '#0B1220' : '#F3F5F9';
      surface = isDark ? '#172033' : '#FFFFFF';
      text = isDark ? '#F8FAFC' : '#161B33';
      text2 = isDark ? '#CBD5E1' : '#5B6178';
      border = isDark ? '#273449' : '#E1E5EC';
    } else if (theme === 'hc-light') {
      bg = '#FFFFFF';
      surface = '#FFFFFF';
      text = '#000000';
      text2 = '#000000';
      border = '#000000';
    } else if (theme === 'hc-dark') {
      bg = '#000000';
      surface = '#000000';
      text = '#FFFFFF';
      text2 = '#FFFFFF';
      border = '#FFFFFF';
    }

    let borderWidth = '1px';
    if (contrast === '2') {
      borderWidth = '2px';
      if (theme === 'light' || theme === 'system') {
        text = '#000000';
        text2 = '#111111';
      } else if (theme === 'dark') {
        text = '#FFFFFF';
        text2 = '#F8FAFC';
      }
    } else if (contrast === '3') {
      borderWidth = '3px';
      if (theme === 'light' || theme === 'system') {
        text = '#000000';
        text2 = '#000000';
        border = '#000000';
      } else if (theme === 'dark') {
        text = '#FFFFFF';
        text2 = '#FFFFFF';
        border = '#FFFFFF';
      }
    }

    document.documentElement.style.setProperty('--bg', bg);
    document.documentElement.style.setProperty('--surface', surface);
    document.documentElement.style.setProperty('--text', text);
    document.documentElement.style.setProperty('--text-2', text2);
    document.documentElement.style.setProperty('--border', border);
    document.documentElement.style.setProperty('--border-width', borderWidth);
    document.documentElement.style.setProperty('--accent', accent);

    let accentDark = accent;
    let accentTint = 'rgba(18, 165, 148, 0.1)';
    if (accent.startsWith('#')) {
      accentDark = adjustHexColor(accent, -20);
      accentTint = accent + '1A';
    }
    document.documentElement.style.setProperty('--accent-dark', accentDark);
    document.documentElement.style.setProperty('--accent-tint', accentTint);
  };

  const saveThemeSettings = () => {
    setThemeState({ ...previewState });
    localStorage.setItem('design_theme', previewState.theme);
    localStorage.setItem('design_contrast', previewState.contrast);
    localStorage.setItem('design_accent', previewState.accent);

    applyThemeStyleRules(previewState.theme, previewState.contrast, previewState.accent);
    showToast('Theme design system settings applied app-wide.', 'success');
  };

  const restoreThemeDefaults = () => {
    const defaults = {
      theme: 'light',
      contrast: '1',
      accent: '#12A594'
    };
    setPreviewState(defaults);
    setThemeState(defaults);
    localStorage.setItem('design_theme', defaults.theme);
    localStorage.setItem('design_contrast', defaults.contrast);
    localStorage.setItem('design_accent', defaults.accent);

    applyThemeStyleRules(defaults.theme, defaults.contrast, defaults.accent);
    showToast('Theme design settings reverted to defaults.', 'success');
  };

  // Dynamic field input change handler
  const handleFieldChange = (subKey: string, fieldName: string, newValue: any) => {
    setSettingsSchema(prev => {
      const updated = { ...prev };
      if (updated[subKey] && updated[subKey].fields) {
        updated[subKey].fields = updated[subKey].fields.map((f: any) => {
          if (f.name === fieldName) {
            return { ...f, value: newValue };
          }
          return f;
        });
      }
      return updated;
    });
  };

  // Save changes for standard form
  const saveDynamicSettings = (subKey: string) => {
    const target = settingsSchema[subKey];
    if (!target) return;

    // Apply header company changes if editing company profile
    if (subKey === 'company_profile') {
      const nameField = target.fields.find((f: any) => f.name === 'legalName');
      if (nameField) setCompanyName(nameField.value);
    } else if (subKey === 'fiscal_year') {
      const yearField = target.fields.find((f: any) => f.name === 'fyName');
      if (yearField) setFiscalYear(yearField.value);
    }

    localStorage.setItem('nexos_settings_schema', JSON.stringify(settingsSchema));
    showToast(`Changes applied for ${target.title} configuration.`, 'success');
  };

  const resetDynamicSettings = (subKey: string) => {
    setSettingsSchema(prev => {
      const updated = { ...prev };
      if (updated[subKey] && defaultSettingsSchema[subKey]) {
        updated[subKey].fields = defaultSettingsSchema[subKey].fields;
      }
      return updated;
    });
    showToast('Form reverted to default setup.', 'warning');
  };

  // Sandbox data flush reset
  const handleSandboxReset = () => {
    if (window.confirm('Are you absolutely sure you want to restore all ERP settings and database parameters to standard defaults?')) {
      showToast('Dropping transaction tables and resetting schemas...', 'warning');
      setTimeout(() => {
        localStorage.clear();
        showToast('ERP Sandbox reverted. Reloading page...', 'success');
        setTimeout(() => window.location.reload(), 1000);
      }, 1200);
    }
  };

  // Active Category object based on key selection
  const activeCategoryObj = categoriesList.find(c => c.subKeys.includes(activeSubKey)) || categoriesList[0];
  const activeSubSchema = settingsSchema[activeSubKey];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)] font-sans">
      {/* Settings Top Identity Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo-badge">nX</div>
          <div className="brand-info">
            <h1 className="brand-name">NexOS Enterprise Settings</h1>
            <span className="brand-tagline">{companyName}</span>
          </div>
        </div>
        <div className="header-right">
          <button className="nav-btn" onClick={onBack}>
            <span className="material-icons-round">dashboard</span> Back to ERP
          </button>
        </div>
      </header>

      {/* Settings Sub-ribbon Banner */}
      <nav className="ribbon-bar">
        <div className="ribbon-title">
          <span className="material-icons-round" style={{ fontSize: '16px', color: 'var(--accent)' }}>settings</span>
          <span>System Administrator Settings Console</span>
        </div>
        <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 500 }}>
          Current active node: <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>GATEWAY-US-EAST</span>
        </div>
      </nav>

      {/* Main Settings Console Layout */}
      <div className="settings-workspace">
        {/* Left Sidebar */}
        <aside className="settings-sidebar">
          <div className="sidebar-search">
            <div className="search-wrapper">
              <input
                type="text"
                value={searchQuery}
                onChange={e => filterSettings(e.target.value)}
                className="search-input"
                placeholder="Filter settings..."
              />
              <span className="material-icons-round search-icon">search</span>
            </div>
          </div>

          <div className="categories-menu">
            {categoriesList.map(cat => {
              // Filtering subkeys check
              const filteredSubKeys = cat.subKeys.filter(subKey => {
                if (!searchQuery.trim()) return true;
                const item = settingsSchema[subKey];
                return item && (
                  item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.description.toLowerCase().includes(searchQuery.toLowerCase())
                );
              });

              if (filteredSubKeys.length === 0) return null;

              const isExpanded = !!expandedCategories[cat.id];
              return (
                <div key={cat.id} className={`category-group ${isExpanded ? 'expanded' : ''}`}>
                  <div className="category-header" onClick={() => toggleCategory(cat.id)}>
                    <span className="material-icons-round category-icon">{cat.icon}</span>
                    <span className="category-label">{cat.title}</span>
                    <span className="material-icons-round category-chevron">chevron_right</span>
                  </div>

                  {isExpanded && (
                    <div className="category-subitems">
                      {filteredSubKeys.map(subKey => {
                        const item = settingsSchema[subKey];
                        if (!item) return null;
                        const isActive = activeSubKey === subKey;
                        return (
                          <a
                            key={subKey}
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveSubKey(subKey);
                            }}
                            className={`subitem-link ${isActive ? 'active' : ''}`}
                          >
                            <span>{item.title}</span>
                            {isActive && <span className="material-icons-round" style={{ fontSize: '12px' }}>check</span>}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Details Panel */}
        <main className="settings-content">
          <div className="content-header">
            <div className="breadcrumbs">
              <span>Settings</span>
              <span className="bc-separator">&gt;</span>
              <span>{activeCategoryObj.title.replace(/^\d+\.\s+/, '').split(' / ')[0]}</span>
              <span className="bc-separator">&gt;</span>
              <span className="bc-active">{activeSubSchema?.title}</span>
            </div>
            <div className="page-title-row">
              <div>
                <h2 className="page-title">{activeSubSchema?.title}</h2>
                <p className="page-description">{activeSubSchema?.description}</p>
              </div>
            </div>
          </div>

          <div className="content-body">
            <div className="settings-card">
              {/* Dynamic schema switch */}
              {activeSubKey === 'firewall_defense' || activeSubKey === 'ip_whitelisting' ? (
                <SecurityFirewallConsole showToast={showToast} />
              ) : activeSubKey === 'module_matrix' ? (
                // 1. MODULE ACTIVATION MATRIX
                <div>
                  <h3 className="font-manrope" style={{ fontSize: '16px', marginBottom: '12px', fontWeight: 700 }}>
                    Active Module Subsystem Activation
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Toggle module daemons across the global ERP ecosystem. Core systems cannot be disabled.
                  </p>

                  <table className="matrix-table">
                    <thead>
                      <tr>
                        <th>Subsystem Name</th>
                        <th style={{ width: '100px', textAlign: 'center' }}>Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modules.map((mod, idx) => (
                        <tr key={idx}>
                          <td className="font-semibold" style={{ fontSize: '13px', fontWeight: 600 }}>
                            {mod.name} {mod.essential && <span className="badge-status active">Core Module</span>}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <label className="switch">
                              <input
                                type="checkbox"
                                checked={mod.active}
                                disabled={mod.essential}
                                onChange={e => {
                                  const updated = [...modules];
                                  updated[idx].active = e.target.checked;
                                  setModules(updated);
                                }}
                              />
                              <span className="slider"></span>
                            </label>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="form-actions">
                    <button className="btn btn-secondary" onClick={() => showToast('Module settings reset', 'warning')}>
                      Reset Matrix
                    </button>
                    <button className="btn btn-primary" onClick={() => showToast('Module activation matrix updated.', 'success')}>
                      Save Subsystems
                    </button>
                  </div>
                </div>
              ) : activeSubKey === 'rbac_matrix' ? (
                // 2. RBAC ACCESS MATRIX
                <div>
                  <h3 className="font-manrope" style={{ fontSize: '16px', marginBottom: '12px', fontWeight: 700 }}>
                    Global RBAC Matrix Mapping
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Click checkboxes to map read/write parameters across core security profiles.
                  </p>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="matrix-table">
                      <thead>
                        <tr>
                          <th>Permission Name</th>
                          {rbacRoles.map(role => (
                            <th key={role} style={{ textAlign: 'center' }}>{role}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rbacPermissions.map((perm, pIdx) => (
                          <tr key={pIdx}>
                            <td>{perm}</td>
                            {rbacRoles.map(role => {
                              const hasAccess = rbacMatrix[role][pIdx];
                              return (
                                <td key={role} style={{ textAlign: 'center' }}>
                                  <input
                                    type="checkbox"
                                    className="matrix-checkbox"
                                    checked={hasAccess}
                                    onChange={e => {
                                      const updated = { ...rbacMatrix };
                                      updated[role][pIdx] = e.target.checked;
                                      setRbacMatrix(updated);
                                    }}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="form-actions">
                    <button className="btn btn-secondary" onClick={() => showToast('RBAC settings reset', 'warning')}>
                      Reset Matrix
                    </button>
                    <button className="btn btn-primary" onClick={() => showToast('Security authorization matrix updated.', 'success')}>
                      Save RBAC Permissions
                    </button>
                  </div>
                </div>
              ) : activeSubKey === 'api_webhooks' ? (
                // 3. CLIENT API TOKENS & WEBHOOKS
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 className="font-manrope" style={{ fontSize: '16px', fontWeight: 700 }}>Active Client API Tokens</h3>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        const randHex = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
                        setApiKeys([
                          ...apiKeys,
                          {
                            name: `Dynamic Custom Token - ${apiKeys.length + 1}`,
                            key: `nx_live_custom_${randHex}...key`,
                            created: new Date().toISOString().split('T')[0]
                          }
                        ]);
                        showToast('New client API key token generated.', 'success');
                      }}
                      style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: 'var(--accent)' }}
                    >
                      + Generate Token
                    </button>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    {apiKeys.length === 0 ? (
                      <div style={{ padding: '15px', textAlign: 'center', color: 'var(--text-muted)' }}>No client API tokens issued.</div>
                    ) : (
                      apiKeys.map((k, idx) => (
                        <div key={idx} className="log-item">
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{k.name}</div>
                            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color: 'var(--text-2)', marginTop: '2px' }}>{k.key}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span className="text-muted" style={{ fontSize: '10px' }}>Issued: {k.created}</span>
                            <button
                              onClick={() => {
                                const updated = [...apiKeys];
                                updated.splice(idx, 1);
                                setApiKeys(updated);
                                showToast('Client token revoked.', 'warning');
                              }}
                              style={{ background: 'none', border: 'none', color: 'var(--warm)', cursor: 'pointer', marginLeft: '12px' }}
                              title="Revoke Key"
                            >
                              <span className="material-icons-round" style={{ fontSize: '16px' }}>delete</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <h3 className="font-manrope" style={{ fontSize: '16px', marginBottom: '12px', fontWeight: 700 }}>
                    Outgoing webhook endpoints
                  </h3>
                  <div className="form-grid">
                    <div className="form-group span-2">
                      <label className="form-label">Active Notification Webhook URL</label>
                      <input
                        type="text"
                        className="form-input"
                        value={webhookUrl}
                        onChange={e => setWebhookUrl(e.target.value)}
                        placeholder="https://api.yourcompany.com/webhook"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button className="btn btn-secondary" onClick={() => setWebhookUrl('https://webhook.site/apex-gateway-ledger')}>
                      Reset Config
                    </button>
                    <button className="btn btn-primary" onClick={() => showToast('Integrations credentials updated.', 'success')}>
                      Save Webhook
                    </button>
                  </div>
                </div>
              ) : activeSubKey === 'backup_manager' ? (
                // 4. BACKUP MANAGER
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 className="font-manrope" style={{ fontSize: '16px', fontWeight: 700 }}>Statutory Restore Snapshots</h3>
                    <button
                      className="btn btn-sm btn-primary"
                      disabled={backingUp}
                      onClick={() => {
                        setBackingUp(true);
                        showToast('Compiling accounting books and file attachments database...', 'success');
                        setTimeout(() => {
                          const randId = Math.floor(Math.random() * 9000 + 1000);
                          setBackups([
                            {
                              name: `NEXOS_MANUAL_BK_GEN-${randId}.bak`,
                              size: '241.8 MB',
                              date: new Date().toISOString().replace('T', ' ').slice(0, 19),
                              type: 'Manual Admin'
                            },
                            ...backups
                          ]);
                          setBackingUp(false);
                          showToast('Snapshot generated and dispatched to cloud storage bucket.', 'success');
                        }, 1200);
                      }}
                      style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: 'var(--accent)' }}
                    >
                      <span className="material-icons-round" style={{ fontSize: '14px', marginRight: '4px' }}>backup</span>
                      {backingUp ? 'Backing Up...' : 'Backup Now'}
                    </button>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    {backups.map((b, idx) => (
                      <div key={idx} className="log-item">
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px', fontFamily: 'JetBrains Mono' }}>{b.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-2)', marginTop: '2px' }}>Size: {b.size} | Type: {b.type}</div>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="text-muted" style={{ fontSize: '10px' }}>{b.date}</span>
                          <button
                            className="btn btn-sm btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '10px' }}
                            onClick={() => {
                              showToast(`Initiating data rollback check to snapshot: ${b.name}`, 'warning');
                              setTimeout(() => {
                                showToast('System rollback simulation completed successfully.', 'success');
                              }, 1000);
                            }}
                          >
                            Restore
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <h3 className="font-manrope" style={{ fontSize: '16px', marginBottom: '12px', fontWeight: 700 }}>
                    Data Backup Schedule Config
                  </h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Auto-Backup Frequency</label>
                      <select className="form-input" value={backupFreq} onChange={e => setBackupFreq(e.target.value)}>
                        <option value="daily">Every 24 Hours (Daily)</option>
                        <option value="weekly">Every Sunday (Weekly)</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">S3 Cloud Storage Target Bucket</label>
                      <input type="text" className="form-input" value={backupTarget} onChange={e => setBackupTarget(e.target.value)} />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setBackupFreq('daily');
                        setBackupTarget('s3://apex-erp-backup-store/');
                      }}
                    >
                      Reset Schedule
                    </button>
                    <button className="btn btn-primary" onClick={() => showToast('Data Backup schedule saved.', 'success')}>
                      Save Schedule
                    </button>
                  </div>
                </div>
              ) : activeSubKey === 'cache_management' ? (
                // 5. CACHE MANAGEMENT
                <div>
                  <h3 className="font-manrope" style={{ fontSize: '16px', marginBottom: '12px', fontWeight: 700 }}>
                    Web & Cache Assembly Cleanup
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Purging client browser cache and dynamic query tables resolves schema mismatch issues after update patches.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="log-item" style={{ backgroundColor: '#FFFFFF' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>Dynamic Query Code Assemblies</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cache size: 14.8 MB</div>
                      </div>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '11px' }}
                        onClick={() => {
                          showToast('Flushing code cache buffers...', 'success');
                          setTimeout(() => showToast('Cache memory buffers cleared.', 'success'), 600);
                        }}
                      >
                        Purge
                      </button>
                    </div>
                    <div className="log-item" style={{ backgroundColor: '#FFFFFF' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>Static Print templates pre-compiles</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cache size: 2.1 MB</div>
                      </div>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '11px' }}
                        onClick={() => {
                          showToast('Flushing print cache buffers...', 'success');
                          setTimeout(() => showToast('Cache memory buffers cleared.', 'success'), 600);
                        }}
                      >
                        Purge
                      </button>
                    </div>
                  </div>
                </div>
              ) : activeSubKey === 'sandbox_reset' ? (
                // 6. SANDBOX SYSTEM RESET
                <div>
                  <h3 className="font-manrope" style={{ fontSize: '16px', marginBottom: '12px', fontWeight: 700, color: 'var(--warm)' }}>
                    Enforce Sandbox Data Reset
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    WARNING: This operation flushes out custom settings and database schemas, reverting the setup back to default. This cannot be
                    undone.
                  </p>

                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: '#FFF3CD',
                      border: '1px solid #FFE69C',
                      borderRadius: '6px',
                      color: '#664D03',
                      fontSize: '12px',
                      lineHeight: 1.5,
                      marginBottom: '20px'
                    }}
                  >
                    <strong>Pre-execution Warning:</strong> Rolling back settings flushes out the dynamic ledger accounts created in this sandbox
                    instance. Ensure all accounting reports have been exported before resetting.
                  </div>

                  <button className="btn btn-primary" style={{ backgroundColor: 'var(--warm)', borderColor: 'var(--warm)' }} onClick={handleSandboxReset}>
                    <span className="material-icons-round" style={{ fontSize: '16px', marginRight: '6px' }}>warning</span> Flush Data & Revert
                  </button>
                </div>
              ) : activeSubKey === 'design_customizer' ? (
                // 7. DESIGN SYSTEM THEME CUSTOMIZER
                <div>
                  <h3 className="font-manrope" style={{ fontSize: '16px', marginBottom: '12px', fontWeight: 700 }}>
                    Global Theme Design Customizer
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Configure standard theme layouts, WCAG contrast levels, and brand primary accent colors.
                  </p>

                  {/* 1. Theme selection */}
                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Base Color Theme</label>
                    <div className="theme-picker-grid">
                      {/* Light */}
                      <div className={`theme-thumb ${previewState.theme === 'light' ? 'active' : ''}`} onClick={() => setPreviewState(p => ({ ...p, theme: 'light' }))}>
                        <div className="thumb-preview light">
                          <div className="thumb-header"></div>
                          <div className="thumb-body">
                            <div className="thumb-sidebar"></div>
                            <div className="thumb-main"></div>
                          </div>
                        </div>
                        <span className="thumb-label">Light Mode</span>
                      </div>

                      {/* Dark */}
                      <div className={`theme-thumb ${previewState.theme === 'dark' ? 'active' : ''}`} onClick={() => setPreviewState(p => ({ ...p, theme: 'dark' }))}>
                        <div className="thumb-preview dark">
                          <div className="thumb-header"></div>
                          <div className="thumb-body">
                            <div className="thumb-sidebar"></div>
                            <div className="thumb-main"></div>
                          </div>
                        </div>
                        <span className="thumb-label">Dark Mode</span>
                      </div>

                      {/* System */}
                      <div className={`theme-thumb ${previewState.theme === 'system' ? 'active' : ''}`} onClick={() => setPreviewState(p => ({ ...p, theme: 'system' }))}>
                        <div className="thumb-preview system">
                          <div className="thumb-header"></div>
                          <div className="thumb-body">
                            <div className="thumb-sidebar"></div>
                            <div className="thumb-main"></div>
                          </div>
                        </div>
                        <span className="thumb-label">System Default</span>
                      </div>

                      {/* High Contrast Light */}
                      <div className={`theme-thumb ${previewState.theme === 'hc-light' ? 'active' : ''}`} onClick={() => setPreviewState(p => ({ ...p, theme: 'hc-light' }))}>
                        <div className="thumb-preview hc-light">
                          <div className="thumb-header"></div>
                          <div className="thumb-body">
                            <div className="thumb-sidebar"></div>
                            <div className="thumb-main"></div>
                          </div>
                        </div>
                        <span className="thumb-label">High Contrast (L)</span>
                      </div>

                      {/* High Contrast Dark */}
                      <div className={`theme-thumb ${previewState.theme === 'hc-dark' ? 'active' : ''}`} onClick={() => setPreviewState(p => ({ ...p, theme: 'hc-dark' }))}>
                        <div className="thumb-preview hc-dark">
                          <div className="thumb-header"></div>
                          <div className="thumb-body">
                            <div className="thumb-sidebar"></div>
                            <div className="thumb-main"></div>
                          </div>
                        </div>
                        <span className="thumb-label">High Contrast (D)</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Contrast levels */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label className="form-label">Border Stroke & Contrast Level</label>
                      <span
                        className="badge-status active"
                        style={{ fontSize: '10px', textTransform: 'none', backgroundColor: 'var(--accent-tint)', color: 'var(--accent-dark)' }}
                      >
                        Active: {previewState.contrast === '1' ? 'Standard' : previewState.contrast === '2' ? 'Increased (WCAG AA)' : 'Maximum (WCAG AAA)'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      value={previewState.contrast}
                      onChange={e => setPreviewState(p => ({ ...p, contrast: e.target.value }))}
                      style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '4px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-2)', marginTop: '4px', fontWeight: 600 }}>
                      <span>Standard Thin</span>
                      <span>Increased AA</span>
                      <span>Maximum AAA Block</span>
                    </div>
                  </div>

                  {/* 3. Primary Accents swatches */}
                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Primary Brand Accent Hex Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div className="color-presets" style={{ marginTop: 0 }}>
                        {['#12A594', '#0F766E', '#2563EB', '#4F46E5', '#7C3AED', '#DB2777', '#EA580C', '#15803D'].map(presetColor => (
                          <div
                            key={presetColor}
                            className={`color-preset ${previewState.accent === presetColor ? 'active' : ''}`}
                            style={{ backgroundColor: presetColor }}
                            onClick={() => setPreviewState(p => ({ ...p, accent: presetColor }))}
                          >
                            <span className="material-icons-round preset-icon" style={{ display: previewState.accent === presetColor ? 'block' : 'none' }}>done</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-2)', fontWeight: 600 }}>Custom Picker:</span>
                        <input
                          type="color"
                          value={previewState.accent}
                          onChange={e => setPreviewState(p => ({ ...p, accent: e.target.value }))}
                          style={{ border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', width: '36px', height: '24px', padding: 0, background: 'none' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Live Preview Panel */}
                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Live Preview Panel (Pre-apply demo)</label>
                    <div
                      style={{
                        border: `${previewState.contrast === '1' ? '1px' : previewState.contrast === '2' ? '2px' : '3px'} solid ${
                          previewState.theme === 'light' || previewState.theme === 'system' ? '#E1E5EC' : '#273449'
                        }`,
                        backgroundColor: previewState.theme === 'light' || previewState.theme === 'system' ? '#F3F5F9' : '#0B1220',
                        padding: '16px',
                        borderRadius: '8px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 'bold',
                          color: previewState.theme === 'light' || previewState.theme === 'system' ? '#161B33' : '#F8FAFC',
                          marginBottom: '10px',
                          borderBottom: `1px solid ${previewState.theme === 'light' || previewState.theme === 'system' ? '#E1E5EC' : '#273449'}`,
                          paddingBottom: '6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span>NexOS Enterprise - Preview Mode</span>
                        <span style={{ fontSize: '9px', fontWeight: 'normal', opacity: 0.7 }}>Active Theme: {previewState.theme.toUpperCase()}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', height: '120px', fontSize: '10px' }}>
                        {/* Mini Sidebar */}
                        <div
                          style={{
                            width: '80px',
                            borderRight: `1px solid ${previewState.theme === 'light' || previewState.theme === 'system' ? '#E1E5EC' : '#273449'}`,
                            backgroundColor: previewState.theme === 'light' || previewState.theme === 'system' ? '#FFFFFF' : '#172033',
                            padding: '6px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}
                        >
                          <div
                            style={{
                              height: '8px',
                              backgroundColor: previewState.theme === 'light' || previewState.theme === 'system' ? '#E1E5EC' : '#273449',
                              width: '85%',
                              borderRadius: '2px'
                            }}
                          ></div>
                          <div style={{ height: '8px', backgroundColor: previewState.accent, width: '70%', borderRadius: '2px', opacity: 0.85 }}></div>
                          <div
                            style={{
                              height: '8px',
                              backgroundColor: previewState.theme === 'light' || previewState.theme === 'system' ? '#E1E5EC' : '#273449',
                              width: '60%',
                              borderRadius: '2px'
                            }}
                          ></div>
                          <div
                            style={{
                              height: '8px',
                              backgroundColor: previewState.theme === 'light' || previewState.theme === 'system' ? '#E1E5EC' : '#273449',
                              width: '80%',
                              borderRadius: '2px'
                            }}
                          ></div>
                        </div>
                        {/* Mini Main Content */}
                        <div
                          style={{
                            flex: 1,
                            backgroundColor: previewState.theme === 'light' || previewState.theme === 'system' ? '#F3F5F9' : '#0B1220',
                            padding: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            overflow: 'hidden'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span
                              style={{
                                fontWeight: 'bold',
                                color: previewState.theme === 'light' || previewState.theme === 'system' ? '#161B33' : '#F8FAFC',
                                fontSize: '11px'
                              }}
                            >
                              Sales Ledger
                            </span>
                            <button
                              style={{
                                backgroundColor: previewState.accent,
                                color: '#FFFFFF',
                                border: 'none',
                                padding: '3px 8px',
                                fontSize: '9px',
                                borderRadius: '3px',
                                fontWeight: 'bold',
                                cursor: 'default',
                                marginLeft: 'auto'
                              }}
                            >
                              Post Voucher
                            </button>
                          </div>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                            <thead>
                              <tr
                                style={{
                                  backgroundColor: previewState.theme === 'light' || previewState.theme === 'system' ? '#FFFFFF' : '#172033',
                                  borderBottom: `1px solid ${previewState.theme === 'light' || previewState.theme === 'system' ? '#E1E5EC' : '#273449'}`
                                }}
                              >
                                <th
                                  style={{
                                    padding: '3px 2px',
                                    textAlign: 'left',
                                    color: previewState.theme === 'light' || previewState.theme === 'system' ? '#5B6178' : '#CBD5E1',
                                    fontWeight: 600
                                  }}
                                >
                                  Account
                                </th>
                                <th
                                  style={{
                                    padding: '3px 2px',
                                    textAlign: 'right',
                                    color: previewState.theme === 'light' || previewState.theme === 'system' ? '#5B6178' : '#CBD5E1',
                                    fontWeight: 600
                                  }}
                                >
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                style={{
                                  borderBottom: `1px solid ${previewState.theme === 'light' || previewState.theme === 'system' ? '#E1E5EC' : '#273449'}`
                                }}
                              >
                                <td style={{ padding: '3px 2px', color: previewState.theme === 'light' || previewState.theme === 'system' ? '#161B33' : '#F8FAFC' }}>
                                  Sales Corporate
                                </td>
                                <td style={{ padding: '3px 2px', textAlign: 'right', color: previewState.accent, fontWeight: 'bold' }}>Active</td>
                              </tr>
                              <tr>
                                <td style={{ padding: '3px 2px', color: previewState.theme === 'light' || previewState.theme === 'system' ? '#161B33' : '#F8FAFC' }}>
                                  Cash-in-hand
                                </td>
                                <td
                                  style={{
                                    padding: '3px 2px',
                                    textAlign: 'right',
                                    color: previewState.theme === 'light' || previewState.theme === 'system' ? '#5B6178' : '#CBD5E1'
                                  }}
                                >
                                  Pending
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="form-actions" style={{ marginTop: '10px' }}>
                    <button className="btn btn-secondary" onClick={restoreThemeDefaults}>Restore Standard</button>
                    <button className="btn btn-primary" onClick={saveThemeSettings} style={{ backgroundColor: 'var(--accent)' }}>
                      Apply Theme Styles
                    </button>
                  </div>
                </div>
              ) : (
                // STANDARD DYNAMIC SCHEMA FORM
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    saveDynamicSettings(activeSubKey);
                  }}
                >
                  <div className="form-grid">
                    {activeSubSchema?.fields?.map((f: any) => {
                      const isSpan2 = f.type === 'textarea' ? 'span-2' : '';
                      return (
                        <div key={f.name} className={`form-group ${isSpan2}`}>
                          <label className="form-label" htmlFor={`field-${f.name}`}>{f.label}</label>

                          {f.type === 'textarea' ? (
                            <textarea
                              id={`field-${f.name}`}
                              className="form-input form-textarea"
                              value={f.value}
                              onChange={e => handleFieldChange(activeSubKey, f.name, e.target.value)}
                            />
                          ) : f.type === 'select' ? (
                            <select
                              id={`field-${f.name}`}
                              className="form-input font-semibold"
                              value={f.value}
                              onChange={e => handleFieldChange(activeSubKey, f.name, e.target.value)}
                            >
                              {f.options.map((opt: string) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : f.type === 'toggle' ? (
                            <div className="toggle-control">
                              <label className="switch">
                                <input
                                  type="checkbox"
                                  checked={!!f.value}
                                  onChange={e => handleFieldChange(activeSubKey, f.name, e.target.checked)}
                                />
                                <span className="slider"></span>
                              </label>
                              <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>Activate option</span>
                            </div>
                          ) : (
                            <input
                              type={f.type || 'text'}
                              id={`field-${f.name}`}
                              className="form-input"
                              value={f.value}
                              onChange={e => handleFieldChange(activeSubKey, f.name, e.target.value)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => resetDynamicSettings(activeSubKey)}>
                      Reset Defaults
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--accent)' }}>
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
