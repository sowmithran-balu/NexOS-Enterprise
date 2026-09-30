import React, { useState, useEffect, useRef } from 'react';
import { 
  FiPlus, FiTrash2, FiUser, FiCheckCircle, FiXCircle, 
  FiDollarSign, FiTrendingUp, FiTrendingDown, FiBookOpen, FiBriefcase, 
  FiLayers, FiClock, FiFileText, FiPieChart, FiDatabase, 
  FiLogOut, FiSearch, FiCalendar, FiCheck, FiX, FiRefreshCw, 
  FiSettings, FiChevronDown, FiMic, FiMicOff, FiSend, FiVolume2, FiInfo, FiMessageSquare,
  FiShare, FiLock, FiUnlock
} from 'react-icons/fi';
import SettingsConsole from './pages/SettingsConsole';
import CrmPortal from './pages/CrmPortal';

// Chart.js global reference
declare const Chart: any;

interface Ledger {
  id: number;
  code: string;
  name: string;
  group: string;
  openingBalance: number;
  dc: 'DEBIT' | 'CREDIT';
}

interface TabInfo {
  id: string;
  title: string;
  view: string;
}

interface VoucherLine {
  lineId: number;
  accountId: number;
  debitAmount: number;
  creditAmount: number;
  costCenterId?: string;
  departmentId?: string;
  projectId?: string;
  taxCode?: string;
  lineNarration?: string;
}

interface VoucherAuditLog {
  logId: number;
  action: 'Created' | 'Edited' | 'Approved' | 'Posted' | 'Reversed' | 'Cancelled';
  performedBy: string;
  performedAt: string;
  details?: string;
}

interface Voucher {
  voucherId: string;
  voucherType: 'Journal Voucher' | 'Payment' | 'Receipt' | 'Contra' | 'Sales' | 'Purchase' | 'Debit Note' | 'Credit Note' | 'Depreciation' | 'Opening Balance';
  voucherNumber: string;
  date: string;
  fiscalYear: string;
  fiscalPeriod: string;
  narration: string;
  referenceNumber: string;
  sourceModule: 'Sales' | 'Purchase' | 'Payroll' | 'Manual';
  sourceDocumentId?: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Posted' | 'Reversed' | 'Cancelled';
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  postedAt?: string;
  reversalOf?: string;
  attachments: string[];
  currency: string;
  exchangeRate: number;
  totalDebit: number;
  totalCredit: number;
  lines: VoucherLine[];
  history: VoucherAuditLog[];
}

interface ReconRecord {
  reconId: number;
  date: string;
  description: string;
  amount: number;
  type: 'Withdrawal' | 'Deposit';
  matchedVoucherId?: string;
  status: 'Matched' | 'Unmatched';
}

interface ReportProvisionalEntry {
  provisionalId: string;
  accountName: string;
  debitAmount: number;
  creditAmount: number;
  description: string;
}

interface ReportAnnotation {
  annotationId: string;
  lineItemRef: string;
  comment: string;
  createdBy: string;
  createdAt: string;
}

interface ERPDocument {
  documentId: string;
  fileName: string;
  category: 'Compliance' | 'Bills & Receipts' | 'Backups' | 'Contracts' | 'HR' | 'Financials';
  fileType: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Archived';
  expiryDate?: string;
  linkedModule?: 'Sales' | 'Purchase' | 'Payroll' | 'HR' | 'System';
  linkedEntityId?: string;
  department_id?: string;
  isConfidential: boolean;
  lockStatus?: { lockedBy: string; lockedAt: string };
  versions: { versionId: string; versionNumber: number; fileUrl: string; uploadedBy: string; uploadedAt: string; changeNotes: string }[];
  comments: { author: string; text: string; timestamp: string }[];
  accessLogs: { action: string; user: string; timestamp: string }[];
}

interface PayrollEmployee {
  employeeId: string;
  name: string;
  departmentId: string;
  designation: string;
  dateOfJoining: string;
  dateOfExit?: string;
  bankAccountNo: string;
  ifscCode: string;
  panNumber: string;
  pfNumber: string;
  esiNumber: string;
  taxRegime: 'old' | 'new';
  status: 'active' | 'resigned' | 'terminated';
}

interface SalaryComponent {
  componentName: 'Basic' | 'HRA' | 'DA' | 'Conveyance' | 'Special Allowance' | 'Bonus' | 'LTA' | 'PF Deduction' | 'ESI Deduction' | 'TDS Deduction';
  componentType: 'earning' | 'deduction';
  calculationType: 'flat' | 'percentage';
  calculationBase?: string;
  value: number;
}

interface SalaryStructure {
  employeeId: string;
  components: SalaryComponent[];
}

interface PayrollRun {
  runId: string;
  periodMonth: string;
  periodYear: string;
  runType: 'regular' | 'off-cycle' | 'bonus' | 'F&F';
  status: 'draft' | 'processing' | 'locked' | 'paid';
  runDate: string;
  processedBy: string;
  approvedBy?: string;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
}

interface Payslip {
  payslipId: string;
  runId: string;
  employeeId: string;
  grossEarnings: number;
  totalDeductions: number;
  netPay: number;
  pfEmployee: number;
  pfEmployer: number;
  tds: number;
  esi: number;
  professionalTax: number;
  lopDays: number;
  paymentStatus: 'unpaid' | 'processing' | 'paid' | 'failed';
  paymentDate?: string;
}

interface EmployeeLoan {
  loanId: string;
  employeeId: string;
  loanType: 'advance' | 'loan';
  principalAmount: number;
  emiAmount: number;
  remainingBalance: number;
  startDate: string;
  status: 'active' | 'closed';
}

interface StatutoryFiling {
  filingId: string;
  runId: string;
  filingType: 'PF' | 'ESI' | 'PT' | 'TDS';
  dueDate: string;
  filedDate?: string;
  status: 'pending' | 'filed' | 'overdue';
  challanReference?: string;
}

interface AttendanceSummary {
  employeeId: string;
  presentDays: number;
  lopDays: number;
  overtimeHours: number;
}

export default function App() {
  // Session / Header state matching exact user screenshot
  const [companyName, setCompanyName] = useState('Super Enterprise Corp');
  const [fiscalYear, setFiscalYear] = useState('FY 2027-28');
  const [planTier, setPlanTier] = useState('Ultimate Enterprise Pack');
  
  // App Navigation Tabs
  const [openTabs, setOpenTabs] = useState<TabInfo[]>([
    { id: 'dashboard', title: 'Dashboard', view: 'dashboard' }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('dashboard');
  const [showMastersDropdown, setShowMastersDropdown] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSettingsConsole, setShowSettingsConsole] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Ledger Accounts State matching screenshot
  const [ledgers, setLedgers] = useState<Ledger[]>([
    { id: 1, code: 'ACT-10003', name: 'Silicon Valley Bank', group: 'Bank Accounts', openingBalance: 45000, dc: 'DEBIT' },
    { id: 2, code: 'ACT-10002', name: 'Acme Corp Sales A/C', group: 'Sales Account', openingBalance: 12850, dc: 'CREDIT' },
    { id: 3, code: 'ACT-10001', name: 'Office Expense A/C', group: 'Indirect Expenses', openingBalance: 2400, dc: 'DEBIT' },
    { id: 4, code: 'ACT-10004', name: 'Petty Cash Register', group: 'Bank Accounts', openingBalance: 1500, dc: 'DEBIT' },
    { id: 5, code: 'ACT-10005', name: 'Equity Capital A/c', group: 'Equity', openingBalance: 100000, dc: 'CREDIT' },
    { id: 6, code: 'ACT-10006', name: 'Globex Logistics (Creditor)', group: 'Sundry Creditors', openingBalance: 8400, dc: 'CREDIT' },
    { id: 7, code: 'ACT-10007', name: 'Machinery Asset A/c', group: 'Fixed Assets', openingBalance: 25000, dc: 'DEBIT' },
    { id: 8, code: 'ACT-10008', name: 'Depreciation Reserve', group: 'Fixed Assets', openingBalance: 5000, dc: 'CREDIT' },
    { id: 9, code: 'ACT-20001', name: 'Salary Expense A/C', group: 'Indirect Expenses', openingBalance: 0, dc: 'DEBIT' },
    { id: 10, code: 'ACT-20002', name: 'Employee Payable A/C', group: 'Current Liabilities', openingBalance: 0, dc: 'CREDIT' },
    { id: 11, code: 'ACT-20003', name: 'PF Payable A/C', group: 'Current Liabilities', openingBalance: 0, dc: 'CREDIT' },
    { id: 12, code: 'ACT-20004', name: 'TDS Payable A/C', group: 'Current Liabilities', openingBalance: 0, dc: 'CREDIT' },
    { id: 13, code: 'ACT-20005', name: 'Employer PF Expense A/C', group: 'Indirect Expenses', openingBalance: 0, dc: 'DEBIT' }
  ]);

  // Voucher management state
  const [activeTransactionSubTab, setActiveTransactionSubTab] = useState<'list' | 'create' | 'reconcile' | 'import'>('list');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  // Voucher Search & Filter States
  const [txSearch, setTxSearch] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState('ALL');
  const [txStatusFilter, setTxStatusFilter] = useState('ALL');
  const [txDateFrom, setTxDateFrom] = useState('');
  const [txDateTo, setTxDateTo] = useState('');

  // Seeded bank statement lines for Bank Reconciliation
  const [reconRecords, setReconRecords] = useState<ReconRecord[]>([
    { reconId: 101, date: '2026-07-10', description: 'ACH DEP ACME CORP INV-901', amount: 12500, type: 'Deposit', matchedVoucherId: 'VT-003', status: 'Matched' },
    { reconId: 102, date: '2026-07-09', description: 'CHK 10842 OFFICE RENT Q2', amount: 3500, type: 'Withdrawal', matchedVoucherId: 'VT-002', status: 'Matched' },
    { reconId: 103, date: '2026-08-05', description: 'DEB broadband internet sub', amount: 150, type: 'Withdrawal', status: 'Unmatched' },
    { reconId: 104, date: '2026-08-06', description: 'TRF customer refund interest', amount: 420, type: 'Deposit', status: 'Unmatched' }
  ]);

  // Voucher state list seeded
  const [vouchers, setVouchers] = useState<Voucher[]>([
    {
      voucherId: 'VT-001',
      voucherType: 'Opening Balance',
      voucherNumber: 'OB-2026-001',
      date: '2026-04-01',
      fiscalYear: 'FY 2027-28',
      fiscalPeriod: 'Period 01',
      narration: 'Initial setup of corporate opening balances',
      referenceNumber: 'REF-OB-001',
      sourceModule: 'Manual',
      status: 'Posted',
      createdBy: 'admin',
      createdAt: '2026-04-01T09:00:00Z',
      postedAt: '2026-04-01T09:05:00Z',
      attachments: ['incorporation_certificate.pdf'],
      currency: 'USD',
      exchangeRate: 1.0,
      totalDebit: 125000,
      totalCredit: 125000,
      lines: [
        { lineId: 1, accountId: 1, debitAmount: 100000, creditAmount: 0 },
        { lineId: 2, accountId: 7, debitAmount: 25000, creditAmount: 0 },
        { lineId: 3, accountId: 5, debitAmount: 0, creditAmount: 125000 }
      ],
      history: [
        { logId: 1, action: 'Created', performedBy: 'admin', performedAt: '2026-04-01T09:00:00Z', details: 'Setup opening accounts' },
        { logId: 2, action: 'Posted', performedBy: 'admin', performedAt: '2026-04-01T09:05:00Z', details: 'Initial release' }
      ]
    },
    {
      voucherId: 'VT-002',
      voucherType: 'Payment',
      voucherNumber: 'PV-2026-001',
      date: '2026-07-09',
      fiscalYear: 'FY 2027-28',
      fiscalPeriod: 'Period 04',
      narration: 'Office Rent Payment Q2',
      referenceNumber: 'REF-PV-002',
      sourceModule: 'Manual',
      status: 'Posted',
      createdBy: 'alex',
      createdAt: '2026-07-09T10:00:00Z',
      postedAt: '2026-07-09T10:10:00Z',
      attachments: ['rent_receipt_q2.pdf'],
      currency: 'USD',
      exchangeRate: 1.0,
      totalDebit: 3500,
      totalCredit: 3500,
      lines: [
        { lineId: 1, accountId: 3, debitAmount: 3500, creditAmount: 0 },
        { lineId: 2, accountId: 1, debitAmount: 0, creditAmount: 3500 }
      ],
      history: [
        { logId: 1, action: 'Created', performedBy: 'alex', performedAt: '2026-07-09T10:00:00Z' },
        { logId: 2, action: 'Posted', performedBy: 'admin', performedAt: '2026-07-09T10:10:00Z' }
      ]
    },
    {
      voucherId: 'VT-003',
      voucherType: 'Receipt',
      voucherNumber: 'RV-2026-001',
      date: '2026-07-10',
      fiscalYear: 'FY 2027-28',
      fiscalPeriod: 'Period 04',
      narration: 'Acme Invoice Payment receipt',
      referenceNumber: 'REF-RV-003',
      sourceModule: 'Sales',
      sourceDocumentId: 'INV-901',
      status: 'Posted',
      createdBy: 'admin',
      createdAt: '2026-07-10T11:00:00Z',
      postedAt: '2026-07-10T11:15:00Z',
      attachments: ['bank_deposit_slip.pdf'],
      currency: 'USD',
      exchangeRate: 1.0,
      totalDebit: 12500,
      totalCredit: 12500,
      lines: [
        { lineId: 1, accountId: 1, debitAmount: 12500, creditAmount: 0 },
        { lineId: 2, accountId: 2, debitAmount: 0, creditAmount: 12500 }
      ],
      history: [
        { logId: 1, action: 'Created', performedBy: 'admin', performedAt: '2026-07-10T11:00:00Z' },
        { logId: 2, action: 'Posted', performedBy: 'admin', performedAt: '2026-07-10T11:15:00Z' }
      ]
    },
    {
      voucherId: 'VT-004',
      voucherType: 'Contra',
      voucherNumber: 'CV-2026-001',
      date: '2026-07-11',
      fiscalYear: 'FY 2027-28',
      fiscalPeriod: 'Period 04',
      narration: 'Cash withdrawal for petty cash drawer',
      referenceNumber: 'REF-CV-004',
      sourceModule: 'Manual',
      status: 'Posted',
      createdBy: 'admin',
      createdAt: '2026-07-11T14:00:00Z',
      postedAt: '2026-07-11T14:05:00Z',
      attachments: [],
      currency: 'USD',
      exchangeRate: 1.0,
      totalDebit: 2000,
      totalCredit: 2000,
      lines: [
        { lineId: 1, accountId: 4, debitAmount: 2000, creditAmount: 0 },
        { lineId: 2, accountId: 1, debitAmount: 0, creditAmount: 2000 }
      ],
      history: [
        { logId: 1, action: 'Created', performedBy: 'admin', performedAt: '2026-07-11T14:00:00Z' },
        { logId: 2, action: 'Posted', performedBy: 'admin', performedAt: '2026-07-11T14:05:00Z' }
      ]
    },
    {
      voucherId: 'VT-005',
      voucherType: 'Sales',
      voucherNumber: 'SV-2026-001',
      date: '2026-07-12',
      fiscalYear: 'FY 2027-28',
      fiscalPeriod: 'Period 04',
      narration: 'Invoice posting auto sales INV-001',
      referenceNumber: 'REF-SV-005',
      sourceModule: 'Sales',
      sourceDocumentId: 'INV-001',
      status: 'Posted',
      createdBy: 'system',
      createdAt: '2026-07-12T16:00:00Z',
      postedAt: '2026-07-12T16:00:00Z',
      attachments: [],
      currency: 'USD',
      exchangeRate: 1.0,
      totalDebit: 8400,
      totalCredit: 8400,
      lines: [
        { lineId: 1, accountId: 1, debitAmount: 8400, creditAmount: 0 },
        { lineId: 2, accountId: 2, debitAmount: 0, creditAmount: 8400 }
      ],
      history: [
        { logId: 1, action: 'Created', performedBy: 'system', performedAt: '2026-07-12T16:00:00Z' },
        { logId: 2, action: 'Posted', performedBy: 'system', performedAt: '2026-07-12T16:00:00Z' }
      ]
    },
    {
      voucherId: 'VT-006',
      voucherType: 'Purchase',
      voucherNumber: 'PV-2026-002',
      date: '2026-07-13',
      fiscalYear: 'FY 2027-28',
      fiscalPeriod: 'Period 04',
      narration: 'Purchase invoice entry PO-101',
      referenceNumber: 'REF-PV-006',
      sourceModule: 'Purchase',
      sourceDocumentId: 'PO-101',
      status: 'Posted',
      createdBy: 'system',
      createdAt: '2026-07-13T17:00:00Z',
      postedAt: '2026-07-13T17:00:00Z',
      attachments: ['invoice_purchase_materials.pdf'],
      currency: 'USD',
      exchangeRate: 1.0,
      totalDebit: 4800,
      totalCredit: 4800,
      lines: [
        { lineId: 1, accountId: 3, debitAmount: 4800, creditAmount: 0 },
        { lineId: 2, accountId: 6, debitAmount: 0, creditAmount: 4800 }
      ],
      history: [
        { logId: 1, action: 'Created', performedBy: 'system', performedAt: '2026-07-13T17:00:00Z' },
        { logId: 2, action: 'Posted', performedBy: 'system', performedAt: '2026-07-13T17:00:00Z' }
      ]
    },
    {
      voucherId: 'VT-007',
      voucherType: 'Journal Voucher',
      voucherNumber: 'JV-2026-001',
      date: '2026-08-07',
      fiscalYear: 'FY 2027-28',
      fiscalPeriod: 'Period 05',
      narration: 'Draft adjusting entry for machinery depreciation',
      referenceNumber: 'REF-JV-007',
      sourceModule: 'Manual',
      status: 'Draft',
      createdBy: 'junior_accountant',
      createdAt: '2026-08-07T11:00:00Z',
      attachments: [],
      currency: 'USD',
      exchangeRate: 1.0,
      totalDebit: 500,
      totalCredit: 500,
      lines: [
        { lineId: 1, accountId: 3, debitAmount: 500, creditAmount: 0 },
        { lineId: 2, accountId: 8, debitAmount: 0, creditAmount: 500 }
      ],
      history: [
        { logId: 1, action: 'Created', performedBy: 'junior_accountant', performedAt: '2026-08-07T11:00:00Z', details: 'Initial draft' }
      ]
    },
    {
      voucherId: 'VT-008',
      voucherType: 'Payment',
      voucherNumber: 'PV-2026-003',
      date: '2026-08-07',
      fiscalYear: 'FY 2027-28',
      fiscalPeriod: 'Period 05',
      narration: 'Travel expense reimbursement request',
      referenceNumber: 'REF-PV-008',
      sourceModule: 'Manual',
      status: 'Pending Approval',
      createdBy: 'junior_accountant',
      createdAt: '2026-08-07T14:00:00Z',
      attachments: ['hotel_bill.pdf'],
      currency: 'USD',
      exchangeRate: 1.0,
      totalDebit: 1200,
      totalCredit: 1200,
      lines: [
        { lineId: 1, accountId: 3, debitAmount: 1200, creditAmount: 0 },
        { lineId: 2, accountId: 1, debitAmount: 0, creditAmount: 1200 }
      ],
      history: [
        { logId: 1, action: 'Created', performedBy: 'junior_accountant', performedAt: '2026-08-07T14:00:00Z', details: 'Submitted' }
      ]
    }
  ]);

  // New Ledger Modal Form State
  const [showNewLedgerModal, setShowNewLedgerModal] = useState(false);
  const [newCode, setNewCode] = useState('ACT-10004');
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('Bank Accounts');
  const [newOpeningBal, setNewOpeningBal] = useState(0);
  const [newDc, setNewDc] = useState<'DEBIT' | 'CREDIT'>('DEBIT');

  // Period & Scaling Filter State
  const [dateRange, setDateRange] = useState('This Month');
  const getMultiplier = () => {
    let fyMult = 1.0;
    if (fiscalYear === 'FY 2026-27') fyMult = 0.88;
    else if (fiscalYear === 'FY 2025-26') fyMult = 0.75;
    
    let rangeMult = 1.0;
    if (dateRange === 'This Quarter') rangeMult = 2.8;
    else if (dateRange === 'Last 30 Days') rangeMult = 0.95;
    else if (dateRange === 'Custom') rangeMult = 1.15;
    
    return fyMult * rangeMult;
  };
  const multiplier = getMultiplier();

  // Alerts Notice Banner State
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'error', message: 'Invoice INV-102 to Acme Corp is overdue by 5 days ($12,500.00)', category: 'Billing' },
    { id: 2, type: 'warning', message: 'Raw Steel Sheets (Grade A) is running low: 450 units left (Reorder point: 500)', category: 'Inventory' },
    { id: 3, type: 'info', message: 'Payroll run for August 2026 is due in 3 days', category: 'Payroll' },
    { id: 4, type: 'info', message: 'GST Return filing for July 2026 is due by August 20th', category: 'Taxation' }
  ]);

  // functional Recent Ledger table states
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerSortField, setLedgerSortField] = useState<'code' | 'name' | 'openingBalance' | null>(null);
  const [ledgerSortDir, setLedgerSortDir] = useState<'asc' | 'desc'>('asc');
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPageSize, setLedgerPageSize] = useState(5);

  // Quick Actions modal states
  const [showQuickInvoiceModal, setShowQuickInvoiceModal] = useState(false);
  const [showQuickPaymentModal, setShowQuickPaymentModal] = useState(false);
  const [showQuickExpenseModal, setShowQuickExpenseModal] = useState(false);

  // Quick Action Form states
  const [quickInvCustomer, setQuickInvCustomer] = useState('Acme Corp');
  const [quickInvAmt, setQuickInvAmt] = useState(12500);
  const [quickPayType, setQuickPayType] = useState<'Receipt' | 'Payment'>('Receipt');
  const [quickPayAmt, setQuickPayAmt] = useState(5000);
  const [quickPayDesc, setQuickPayDesc] = useState('Acme Invoice Settlement');
  const [quickExpCategory, setQuickExpCategory] = useState('Office Expense A/C');
  const [quickExpAmt, setQuickExpAmt] = useState(450);
  const [quickExpDesc, setQuickExpDesc] = useState('Office Refreshments & Stationery');

  // KPI Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState<'ledgers' | 'sales' | 'expenses' | 'cash' | null>(null);

  // Voucher Builder Form state
  const [formVoucherType, setFormVoucherType] = useState<'Journal Voucher' | 'Payment' | 'Receipt' | 'Contra' | 'Sales' | 'Purchase' | 'Debit Note' | 'Credit Note' | 'Depreciation' | 'Opening Balance'>('Journal Voucher');
  const [formVoucherDate, setFormVoucherDate] = useState(new Date().toISOString().split('T')[0]);
  const [formVoucherNarration, setFormVoucherNarration] = useState('');
  const [formVoucherRef, setFormVoucherRef] = useState('');
  const [formVoucherCurrency, setFormVoucherCurrency] = useState('USD');
  const [formVoucherExchangeRate, setFormVoucherExchangeRate] = useState(1.0);
  const [formVoucherLines, setFormVoucherLines] = useState<Array<{ accountId: number; debitAmount: number; creditAmount: number; lineNarration: string }>>([
    { accountId: 1, debitAmount: 0, creditAmount: 0, lineNarration: '' },
    { accountId: 2, debitAmount: 0, creditAmount: 0, lineNarration: '' }
  ]);

  // Other dynamic master views states to make all keys functional
  const [products, setProducts] = useState([
    { id: 'PD-101', name: 'Raw Steel Sheets (Grade A)', category: 'Raw Materials', price: 280.00, stock: 450 },
    { id: 'PD-102', name: 'Copper Wires (0.5mm)', category: 'Components', price: 45.50, stock: 1200 },
    { id: 'PD-103', name: 'Finished Gearbox Assembly', category: 'Finished Goods', price: 950.00, stock: 85 }
  ]);

  const [transactions, setTransactions] = useState([
    { id: 'VT-901', date: '2026-07-10', desc: 'Acme Invoice Payment', deb: 'Silicon Valley Bank', cred: 'Acme Corp Sales A/C', amt: 12500.00, type: 'Receipt' },
    { id: 'VT-902', date: '2026-07-09', desc: 'Office Rent Payment', deb: 'Office Expense A/C', cred: 'Silicon Valley Bank', amt: 3500.00, type: 'Payment' },
    { id: 'VT-903', date: '2026-07-08', desc: 'Steel Raw Materials purchase', deb: 'Silicon Valley Bank', cred: 'Globex Logistics', amt: 8200.00, type: 'Purchase' }
  ]);

  // Payroll active tab state
  const [activePayrollTab, setActivePayrollTab] = useState<'employees' | 'structure' | 'runs' | 'loans' | 'compliance'>('employees');
  const [selectedPayrollEmployeeId, setSelectedPayrollEmployeeId] = useState<string>('EMP-01');
  const [selectedPayrollRunId, setSelectedPayrollRunId] = useState<string | null>(null);

  // New Employee Form modal states
  const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);
  const [newEmpId, setNewEmpId] = useState('EMP-04');
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('Engineering');
  const [newEmpDesg, setNewEmpDesg] = useState('Senior Engineer');
  const [newEmpDoj, setNewEmpDoj] = useState(new Date().toISOString().split('T')[0]);
  const [newEmpBank, setNewEmpBank] = useState('');
  const [newEmpIfsc, setNewEmpIfsc] = useState('');
  const [newEmpPan, setNewEmpPan] = useState('');
  const [newEmpPf, setNewEmpPf] = useState('');
  const [newEmpEsi, setNewEmpEsi] = useState('');
  const [newEmpRegime, setNewEmpRegime] = useState<'old' | 'new'>('new');

  // Employee Loan Form states
  const [showNewLoanModal, setShowNewLoanModal] = useState(false);
  const [newLoanEmpId, setNewLoanEmpId] = useState('EMP-01');
  const [newLoanType, setNewLoanType] = useState<'advance' | 'loan'>('advance');
  const [newLoanPrincipal, setNewLoanPrincipal] = useState(1000);
  const [newLoanEmi, setNewLoanEmi] = useState(200);

  // 1. Employee Directory State
  const [employees, setEmployees] = useState<PayrollEmployee[]>([
    {
      employeeId: 'EMP-01',
      name: 'Alexander Wright',
      departmentId: 'Engineering',
      designation: 'Principal Engineer',
      dateOfJoining: '2024-03-15',
      bankAccountNo: '1002938104',
      ifscCode: 'SVB0000123',
      panNumber: 'AWPTY9821A',
      pfNumber: 'PF/AW/10293',
      esiNumber: 'ESI/AW/9812',
      taxRegime: 'new',
      status: 'active'
    },
    {
      employeeId: 'EMP-02',
      name: 'Sarah Jenkins',
      departmentId: 'Finance',
      designation: 'Lead Accountant',
      dateOfJoining: '2025-06-01',
      bankAccountNo: '3002948108',
      ifscCode: 'SVB0000123',
      panNumber: 'SJPTY2837B',
      pfNumber: 'PF/SJ/10294',
      esiNumber: 'ESI/SJ/9813',
      taxRegime: 'old',
      status: 'active'
    },
    {
      employeeId: 'EMP-03',
      name: 'Marcus Chen',
      departmentId: 'Sales',
      designation: 'VP Sales East',
      dateOfJoining: '2024-11-10',
      bankAccountNo: '4002958112',
      ifscCode: 'SVB0000123',
      panNumber: 'MCPTY4738C',
      pfNumber: 'PF/MC/10295',
      esiNumber: 'ESI/MC/9814',
      taxRegime: 'new',
      status: 'active'
    }
  ]);

  // 2. Salary Structures
  const [salaryStructures, setSalaryStructures] = useState<SalaryStructure[]>([
    {
      employeeId: 'EMP-01',
      components: [
        { componentName: 'Basic', componentType: 'earning', calculationType: 'flat', value: 4500 },
        { componentName: 'HRA', componentType: 'earning', calculationType: 'percentage', calculationBase: 'Basic', value: 40 }, // 40% of Basic ($1,800)
        { componentName: 'DA', componentType: 'earning', calculationType: 'percentage', calculationBase: 'Basic', value: 10 },  // 10% of Basic ($450)
        { componentName: 'Conveyance', componentType: 'earning', calculationType: 'flat', value: 200 },
        { componentName: 'Special Allowance', componentType: 'earning', calculationType: 'flat', value: 1050 },
        { componentName: 'PF Deduction', componentType: 'deduction', calculationType: 'percentage', calculationBase: 'Basic+DA', value: 12 }, // 12% of Basic+DA ($594)
        { componentName: 'TDS Deduction', componentType: 'deduction', calculationType: 'flat', value: 400 }
      ]
    },
    {
      employeeId: 'EMP-02',
      components: [
        { componentName: 'Basic', componentType: 'earning', calculationType: 'flat', value: 3500 },
        { componentName: 'HRA', componentType: 'earning', calculationType: 'percentage', calculationBase: 'Basic', value: 40 }, // 40% of Basic ($1,400)
        { componentName: 'DA', componentType: 'earning', calculationType: 'percentage', calculationBase: 'Basic', value: 10 },  // 10% of Basic ($350)
        { componentName: 'Conveyance', componentType: 'earning', calculationType: 'flat', value: 200 },
        { componentName: 'Special Allowance', componentType: 'earning', calculationType: 'flat', value: 750 },
        { componentName: 'PF Deduction', componentType: 'deduction', calculationType: 'percentage', calculationBase: 'Basic+DA', value: 12 }, // 12% of Basic+DA ($462)
        { componentName: 'TDS Deduction', componentType: 'deduction', calculationType: 'flat', value: 250 }
      ]
    },
    {
      employeeId: 'EMP-03',
      components: [
        { componentName: 'Basic', componentType: 'earning', calculationType: 'flat', value: 4000 },
        { componentName: 'HRA', componentType: 'earning', calculationType: 'percentage', calculationBase: 'Basic', value: 40 }, // 40% of Basic ($1,600)
        { componentName: 'DA', componentType: 'earning', calculationType: 'percentage', calculationBase: 'Basic', value: 10 },  // 10% of Basic ($400)
        { componentName: 'Conveyance', componentType: 'earning', calculationType: 'flat', value: 200 },
        { componentName: 'Special Allowance', componentType: 'earning', calculationType: 'flat', value: 1600 },
        { componentName: 'PF Deduction', componentType: 'deduction', calculationType: 'percentage', calculationBase: 'Basic+DA', value: 12 }, // 12% of Basic+DA ($528)
        { componentName: 'TDS Deduction', componentType: 'deduction', calculationType: 'flat', value: 350 }
      ]
    }
  ]);

  // 3. Historical Payroll Runs
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([
    {
      runId: 'PR-001',
      periodMonth: 'June',
      periodYear: '2026',
      runType: 'regular',
      status: 'paid',
      runDate: '2026-06-30',
      processedBy: 'alex',
      approvedBy: 'admin',
      totalGross: 22000,
      totalDeductions: 2584,
      totalNet: 19416
    },
    {
      runId: 'PR-002',
      periodMonth: 'July',
      periodYear: '2026',
      runType: 'regular',
      status: 'paid',
      runDate: '2026-07-31',
      processedBy: 'alex',
      approvedBy: 'admin',
      totalGross: 22000,
      totalDeductions: 2584,
      totalNet: 19416
    }
  ]);

  // 4. Employee Loans & Advances
  const [employeeLoans, setEmployeeLoans] = useState<EmployeeLoan[]>([
    {
      loanId: 'LN-001',
      employeeId: 'EMP-02',
      loanType: 'advance',
      principalAmount: 1000,
      emiAmount: 200,
      remainingBalance: 800,
      startDate: '2026-07-15',
      status: 'active'
    }
  ]);

  // 5. Statutory Filing Checklist
  const [statutoryFilings, setStatutoryFilings] = useState<StatutoryFiling[]>([
    { filingId: 'FL-001', runId: 'PR-001', filingType: 'PF', dueDate: '2026-07-15', filedDate: '2026-07-14', status: 'filed', challanReference: 'CHL-PF-001' },
    { filingId: 'FL-002', runId: 'PR-001', filingType: 'ESI', dueDate: '2026-07-15', filedDate: '2026-07-14', status: 'filed', challanReference: 'CHL-ESI-001' },
    { filingId: 'FL-003', runId: 'PR-002', filingType: 'PF', dueDate: '2026-08-15', filedDate: '2026-08-12', status: 'filed', challanReference: 'CHL-PF-002' },
    { filingId: 'FL-004', runId: 'PR-002', filingType: 'TDS', dueDate: '2026-09-07', status: 'pending' },
    { filingId: 'FL-005', runId: 'PR-003', filingType: 'PF', dueDate: '2026-09-15', status: 'pending' }
  ]);

  // 6. Attendance Summary Seed
  const [attendanceSummaries, setAttendanceSummaries] = useState<AttendanceSummary[]>([
    { employeeId: 'EMP-01', presentDays: 22, lopDays: 0, overtimeHours: 5 },
    { employeeId: 'EMP-02', presentDays: 21, lopDays: 1, overtimeHours: 0 },
    { employeeId: 'EMP-03', presentDays: 22, lopDays: 0, overtimeHours: 0 }
  ]);

  // DMS active sub-tab state
  const [activeDmsTab, setActiveDmsTab] = useState<'explorer' | 'approvals' | 'bundles' | 'quota'>('explorer');
  const [selectedDmsDoc, setSelectedDmsDoc] = useState<ERPDocument | null>(null);

  // DMS search and filter states
  const [dmsSearchQuery, setDmsSearchQuery] = useState('');
  const [dmsCategoryFilter, setDmsCategoryFilter] = useState('ALL');
  const [dmsTagFilter, setDmsTagFilter] = useState('ALL');
  const [dmsSelectedFolder, setDmsSelectedFolder] = useState<'all' | 'finance' | 'hr' | 'compliance' | 'backups'>('all');

  // DMS Modal and Form states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocCat, setNewDocCat] = useState<'Compliance' | 'Bills & Receipts' | 'Backups' | 'Contracts' | 'HR' | 'Financials'>('Compliance');
  const [newDocSize, setNewDocSize] = useState('1.5 MB');
  const [newDocConfidential, setNewDocConfidential] = useState(false);
  const [newDocExpiry, setNewDocExpiry] = useState('');

  // DMS Share Link states
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareDocId, setShareDocId] = useState<string | null>(null);
  const [shareExpires, setShareExpires] = useState('2026-08-15');
  const [shareLinkResult, setShareLinkResult] = useState('');

  // DMS Annotation/Comment input
  const [dmsCommentInput, setDmsCommentInput] = useState('');

  // 1. Seeded ERP Documents
  const [documents, setDocuments] = useState<ERPDocument[]>([
    {
      documentId: 'DOC-001',
      fileName: 'audit_report_q2_draft.pdf',
      category: 'Compliance',
      fileType: 'pdf',
      fileSize: '1.4 MB',
      uploadedBy: 'admin',
      uploadedAt: '2026-07-12T10:00:00Z',
      status: 'Pending Approval',
      linkedModule: 'System',
      isConfidential: false,
      lockStatus: { lockedBy: 'Sarah Jenkins', lockedAt: '2026-07-12T10:15:00Z' },
      versions: [
        { versionId: 'V-001', versionNumber: 1, fileUrl: '/dms/audit_report_q2_v1.pdf', uploadedBy: 'admin', uploadedAt: '2026-07-12T10:00:00Z', changeNotes: 'Initial draft upload' },
        { versionId: 'V-002', versionNumber: 2, fileUrl: '/dms/audit_report_q2_v2.pdf', uploadedBy: 'Sarah Jenkins', uploadedAt: '2026-07-12T10:30:00Z', changeNotes: 'Fixed depreciation tables on section 3' }
      ],
      comments: [
        { author: 'admin', text: 'Sarah, please check the depreciation splits on page 4.', timestamp: '2026-07-12T10:10:00Z' },
        { author: 'Sarah Jenkins', text: 'Checked and fixed in v2. Swapped JV ledger reference codes.', timestamp: '2026-07-12T10:29:00Z' }
      ],
      accessLogs: [
        { action: 'Viewed', user: 'admin', timestamp: '2026-07-12T10:05:00Z' },
        { action: 'Downloaded', user: 'Sarah Jenkins', timestamp: '2026-07-12T10:15:00Z' }
      ]
    },
    {
      documentId: 'DOC-002',
      fileName: 'office_rent_agreement.pdf',
      category: 'Contracts',
      fileType: 'pdf',
      fileSize: '2.1 MB',
      uploadedBy: 'admin',
      uploadedAt: '2026-07-09T09:00:00Z',
      status: 'Approved',
      expiryDate: '2026-08-25', // Expiring this month
      linkedModule: 'System',
      isConfidential: true,
      versions: [
        { versionId: 'V-003', versionNumber: 1, fileUrl: '/dms/office_rent_v1.pdf', uploadedBy: 'admin', uploadedAt: '2026-07-09T09:00:00Z', changeNotes: 'Notarized Q2 contract copy' }
      ],
      comments: [],
      accessLogs: [
        { action: 'Downloaded', user: 'admin', timestamp: '2026-07-09T09:05:00Z' }
      ]
    },
    {
      documentId: 'DOC-003',
      fileName: 'database_restore_point.bak',
      category: 'Backups',
      fileType: 'bak',
      fileSize: '241.8 MB',
      uploadedBy: 'system',
      uploadedAt: '2026-07-09T02:00:00Z',
      status: 'Archived',
      isConfidential: true,
      versions: [
        { versionId: 'V-004', versionNumber: 1, fileUrl: '/dms/db_restore_v1.bak', uploadedBy: 'system', uploadedAt: '2026-07-09T02:00:00Z', changeNotes: 'Scheduled weekly backup snapshot' }
      ],
      comments: [],
      accessLogs: []
    },
    {
      documentId: 'DOC-004',
      fileName: 'payslip_alex_july.pdf',
      category: 'HR',
      fileType: 'pdf',
      fileSize: '85 KB',
      uploadedBy: 'system',
      uploadedAt: '2026-07-31T18:00:00Z',
      status: 'Approved',
      linkedModule: 'Payroll',
      linkedEntityId: 'PR-002',
      isConfidential: true,
      versions: [
        { versionId: 'V-005', versionNumber: 1, fileUrl: '/dms/payslip_alex_july.pdf', uploadedBy: 'system', uploadedAt: '2026-07-31T18:00:00Z', changeNotes: 'Auto-generated on payroll run cycle closure' }
      ],
      comments: [],
      accessLogs: []
    }
  ]);

  const [leads, setLeads] = useState([
    { id: 'LD-801', name: 'ByteDance Inc', ref: 'BD-801', amt: 45000.00, status: 'Qualification', label: 'Hot' },
    { id: 'LD-802', name: 'Oracle Cloud Corp', ref: 'OC-221', amt: 95000.00, status: 'Proposal Sent', label: 'Warm' },
    { id: 'LD-803', name: 'Tesla Supply Chain', ref: 'TS-404', amt: 120000.00, status: 'Negotiation', label: 'Hot' }
  ]);

  const [projects, setProjects] = useState([
    { name: 'Q4 Tax Audit Compliance', completed: 8, total: 10 },
    { name: 'Multi-Warehouse Migration', completed: 3, total: 12 },
    { name: 'HR Payroll Automated Chain', completed: 15, total: 15 }
  ]);

  const [profitLossView, setProfitLossView] = useState<'monthly' | 'yearly'>('monthly');
  const [plTimelineView, setPlTimelineView] = useState<'1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y'>('1Y');
  const [plChartType, setPlChartType] = useState<'line' | 'candlestick'>('line');

  // Reports active tab states
  const [activeReportTab, setActiveReportTab] = useState<'library' | 'builder' | 'schedules' | 'audit'>('library');
  const [selectedReportType, setSelectedReportType] = useState<string>('Balance Sheet');
  const [comparisonPeriod, setComparisonPeriod] = useState<'previous' | 'priorYear' | 'none'>('none');
  const [reportViewMode, setReportViewMode] = useState<'table' | 'chart'>('table');
  const [selectedDrillDownAccount, setSelectedDrillDownAccount] = useState<number | null>(null);
  const [reportSearchQuery, setReportSearchQuery] = useState('');

  // What-if / provisional sandbox adjustments state
  const [provisionalEntries, setProvisionalEntries] = useState<ReportProvisionalEntry[]>([
    { provisionalId: 'PRV-101', accountName: 'Salary Expense A/C', debitAmount: 1200, creditAmount: 0, description: 'Accrued August outstanding salaries' },
    { provisionalId: 'PRV-102', accountName: 'Employee Payable A/C', debitAmount: 0, creditAmount: 1200, description: 'Corresponding liability credit' }
  ]);
  const [showProvisionalModal, setShowProvisionalModal] = useState(false);
  const [provAccount, setProvAccount] = useState('Salary Expense A/C');
  const [provDr, setProvDr] = useState(0);
  const [provCr, setProvCr] = useState(0);
  const [provDesc, setProvDesc] = useState('');

  // Report Annotations & Comments state
  const [reportAnnotations, setReportAnnotations] = useState<ReportAnnotation[]>([
    { annotationId: 'ANN-001', lineItemRef: 'Silicon Valley Bank', comment: 'Reconciled to statement balance — SJ, 08 Aug', createdBy: 'Sarah Jenkins', createdAt: '2026-08-08T10:00:00Z' },
    { annotationId: 'ANN-002', lineItemRef: 'Salary Expense A/C', comment: 'Higher due to Senior Engineer hiring increments — Admin', createdBy: 'admin', createdAt: '2026-08-08T11:30:00Z' }
  ]);
  const [newAnnotationComment, setNewAnnotationComment] = useState('');
  const [annotationLineRef, setAnnotationLineRef] = useState<string | null>(null);

  // Custom Report Builder structures (relabels, subtotals, reorders)
  const [customStructures, setCustomStructures] = useState<Array<{ accountId: number; customLabel: string; hidden: boolean }>>([
    { accountId: 1, customLabel: 'SVB Operational Funds', hidden: false },
    { accountId: 10, customLabel: 'Staff Net Salary Payable', hidden: false }
  ]);
  const [builderEditingAccountId, setBuilderEditingAccountId] = useState<number | null>(null);
  const [builderCustomLabel, setBuilderCustomLabel] = useState('');

  // Report Schedules & Distribution list
  const [reportSchedules, setReportSchedules] = useState<Array<{ scheduleId: string; reportName: string; frequency: string; recipients: string; nextRun: string }>>([
    { scheduleId: 'SCH-001', reportName: 'Balance Sheet', frequency: 'Monthly', recipients: 'finance@superenterprise.com', nextRun: '2026-08-31' },
    { scheduleId: 'SCH-002', reportName: 'Trial Balance', frequency: 'Weekly', recipients: 'audits@superenterprise.com', nextRun: '2026-08-15' }
  ]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedReportName, setSchedReportName] = useState('Balance Sheet');
  const [schedFreq, setSchedFreq] = useState('Monthly');
  const [schedRecipients, setSchedRecipients] = useState('');

  // Report Access Audit Trail Logs
  const [reportAccessLogs, setReportAccessLogs] = useState<Array<{ logId: string; reportName: string; user: string; action: string; timestamp: string }>>([
    { logId: 'LOG-R-01', reportName: 'Balance Sheet', user: 'admin', action: 'Generated Snapshot', timestamp: '2026-08-08T12:00:00Z' },
    { logId: 'LOG-R-02', reportName: 'Profit & Loss', user: 'junior_accountant', action: 'Exported PDF', timestamp: '2026-08-08T12:15:00Z' },
    { logId: 'LOG-R-03', reportName: 'Trial Balance', user: 'Sarah Jenkins', action: 'Added Annotation', timestamp: '2026-08-08T13:45:00Z' }
  ]);

  // Chart Canvas Refs
  const salesExpensesChartRef = useRef<HTMLCanvasElement | null>(null);
  const monthwiseExpensesChartRef = useRef<HTMLCanvasElement | null>(null);
  const plChartRef = useRef<HTMLCanvasElement | null>(null);

  // Voice / Copilot State with API Key Locking & ChatGPT Engine
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; timestamp?: string }>>([
    { 
      sender: 'assistant', 
      text: 'Hello! I am your NexOS Voice Assistant powered like ChatGPT Plus. How can I help with your ledger accounting, ratio calculations, or ERP operations today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotApiKey, setCopilotApiKey] = useState<string>(() => localStorage.getItem('nexos_ai_api_key') || '');
  const [copilotKeyLocked, setCopilotKeyLocked] = useState<boolean>(() => localStorage.getItem('nexos_ai_key_locked') === 'true');
  const [copilotProvider, setCopilotProvider] = useState<'gemini' | 'chatgpt' | 'openrouter' | 'local'>(
    () => (localStorage.getItem('nexos_ai_provider') as any) || 'gemini'
  );
  const [copilotModel, setCopilotModel] = useState<string>(() => localStorage.getItem('nexos_ai_model') || 'gemini-2.5-flash');
  const [copilotShowSettings, setCopilotShowSettings] = useState(false);
  const [copilotIsLoading, setCopilotIsLoading] = useState(false);
  const [copilotIsListening, setCopilotIsListening] = useState(false);
  const [copilotSpeechEnabled, setCopilotSpeechEnabled] = useState<boolean>(() => localStorage.getItem('nexos_ai_speech_enabled') === 'true');
  const [copilotTestStatus, setCopilotTestStatus] = useState<string | null>(null);
  const copilotChatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll Copilot messages to bottom
  useEffect(() => {
    if (copilotOpen) {
      copilotChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [copilotMessages, copilotOpen, copilotIsLoading]);

  // Lock / Unlock API Key Handler
  const handleToggleLockApiKey = (lock: boolean) => {
    if (lock) {
      if (copilotProvider !== 'local' && (!copilotApiKey || copilotApiKey.trim().length === 0)) {
        showToast('Please enter your Google AI Studio API Key before locking.', 'error');
        return;
      }
      localStorage.setItem('nexos_ai_api_key', copilotApiKey.trim());
      localStorage.setItem('nexos_ai_key_locked', 'true');
      localStorage.setItem('nexos_ai_provider', copilotProvider);
      localStorage.setItem('nexos_ai_model', copilotModel);
      setCopilotKeyLocked(true);
      setCopilotTestStatus(null);
      const provName = copilotProvider === 'gemini' ? 'Google AI Studio (Gemini)' : copilotProvider === 'chatgpt' ? 'ChatGPT (OpenAI)' : copilotProvider.toUpperCase();
      showToast(`🔒 ${provName} API Key securely locked & active!`, 'success');
    } else {
      localStorage.setItem('nexos_ai_key_locked', 'false');
      setCopilotKeyLocked(false);
      showToast('🔓 API Key unlocked for editing.', 'warning');
    }
  };

  // Test API Key Connection
  const handleTestApiKey = async () => {
    if (copilotProvider === 'local') {
      setCopilotTestStatus('✅ Offline Engine is 100% Ready (Zero API key needed)');
      return;
    }
    if (!copilotApiKey || copilotApiKey.trim().length === 0) {
      setCopilotTestStatus('⚠️ Please enter an API key to test');
      return;
    }
    setCopilotTestStatus('🔄 Testing connection...');
    try {
      if (copilotProvider === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${copilotModel || 'gemini-2.5-flash'}:generateContent?key=${copilotApiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello! Respond with "OK" if connected.' }] }]
          })
        });
        if (res.ok) {
          setCopilotTestStatus(`✅ Google AI Studio Connected! (${copilotModel} ready to assist)`);
        } else {
          const err = await res.json().catch(() => ({}));
          setCopilotTestStatus(`❌ Google AI Studio Error: ${err?.error?.message || res.statusText}`);
        }
      } else if (copilotProvider === 'chatgpt') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${copilotApiKey.trim()}`
          },
          body: JSON.stringify({
            model: copilotModel || 'gpt-4o-mini',
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 5
          })
        });
        if (res.ok) {
          setCopilotTestStatus('✅ ChatGPT Connection Verified & Active!');
        }
      } else if (copilotProvider === 'openrouter') {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${copilotApiKey.trim()}`
          },
          body: JSON.stringify({
            model: copilotModel || 'openai/gpt-4o-mini',
            messages: [{ role: 'user', content: 'ping' }]
          })
        });
        if (res.ok) {
          setCopilotTestStatus('✅ OpenRouter Connection Verified!');
        } else {
          setCopilotTestStatus(`❌ OpenRouter Error: ${res.statusText}`);
        }
      }
    } catch (e: any) {
      setCopilotTestStatus(`❌ Network error: ${e.message}`);
    }
  };

  // Text to Speech
  const speakResponse = (text: string) => {
    if (!copilotSpeechEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleaned = text.replace(/[*#_`~>|-]/g, ' ').replace(/\s+/g, ' ').trim();
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error', e);
    }
  };

  // Voice Input Toggle (Web Speech Recognition)
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Speech recognition not supported in this browser.', 'warning');
      return;
    }
    if (copilotIsListening) {
      recognitionRef.current?.stop();
      setCopilotIsListening(false);
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setCopilotIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setCopilotInput(transcript);
          handleCopilotSend(transcript);
        }
      };
      recognition.onerror = () => setCopilotIsListening(false);
      recognition.onend = () => setCopilotIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setCopilotIsListening(false);
    }
  };

  // Clear Chat History
  const handleClearCopilotChat = () => {
    setCopilotMessages([
      { 
        sender: 'assistant', 
        text: 'Conversation cleared. What financial operation or report would you like to review next?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  // Main Copilot Send Handler (ChatGPT Execution)
  const handleCopilotSend = async (overridePrompt?: string) => {
    const query = (overridePrompt ?? copilotInput).trim();
    if (!query || copilotIsLoading) return;

    const userMsg = {
      sender: 'user' as const,
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setCopilotMessages(prev => [...prev, userMsg]);
    setCopilotInput('');
    setCopilotIsLoading(true);

    const systemPrompt = `You are NexOS Enterprise AI, an elite ERP and financial intelligence Copilot equivalent to ChatGPT Plus.
You have direct knowledge of double-entry ledger bookkeeping, debit/credit rules, Chart of Accounts, balance sheets, profit & loss, EBITDA, tax compliance (GST / VAT / TDS), vendor payables (AP), customer receivables (AR), and CRM pipeline forecasting.
Formatting Instructions:
- Provide structured, professional, crisp answers.
- Use clean Markdown with bold headings, bulleted lists, and formatted tables for numbers.
- If advising on a journal entry, explicitly format with: Account Name | Debit | Credit.
- Keep tone confident, executive, and highly helpful like OpenAI ChatGPT.`;

    let reply = '';

    try {
      // 1. Google AI Studio (Gemini Direct API)
      if (copilotProvider === 'gemini' && copilotApiKey.trim()) {
        const geminiHistory = copilotMessages.slice(-8).map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${copilotModel || 'gemini-2.5-flash'}:generateContent?key=${copilotApiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [
              ...geminiHistory,
              { role: 'user', parts: [{ text: query }] }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1500
            }
          })
        });
        if (res.ok) {
          const data = await res.json();
          reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received from Google AI Studio.';
        } else {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error?.message || `Google AI Studio returned status ${res.status}`);
        }
      } 
      // 2. ChatGPT (OpenAI Direct API)
      else if (copilotProvider === 'chatgpt' && copilotApiKey.trim()) {
        const chatHistory = copilotMessages.slice(-6).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }));

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${copilotApiKey.trim()}`
          },
          body: JSON.stringify({
            model: copilotModel || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              ...chatHistory,
              { role: 'user', content: query }
            ],
            temperature: 0.7,
            max_tokens: 1000
          })
        });

        if (res.ok) {
          const data = await res.json();
          reply = data.choices?.[0]?.message?.content || 'No response received from ChatGPT.';
        } else {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error?.message || `OpenAI returned status ${res.status}`);
        }
      }
      // 3. OpenRouter Hub
      else if (copilotProvider === 'openrouter' && copilotApiKey.trim()) {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${copilotApiKey.trim()}`
          },
          body: JSON.stringify({
            model: copilotModel || 'openai/gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: query }
            ]
          })
        });
        if (res.ok) {
          const data = await res.json();
          reply = data.choices?.[0]?.message?.content || 'No response received from OpenRouter.';
        } else {
          throw new Error(`OpenRouter error: ${res.statusText}`);
        }
      }
      // 4. Intelligent Built-in NexOS Financial AI Engine (Offline / Fallback)
      else {
        await new Promise(r => setTimeout(r, 600)); // natural typing delay
        const q = query.toLowerCase();

        if (q.includes('balance sheet') || q.includes('asset') || q.includes('liabilit')) {
          reply = `### 📊 NexOS Balance Sheet Intelligence Snapshot
**Core Accounting Equation**: \`Assets = Liabilities + Equity\`

* **Total Current Assets**: $328,450.00 (Cash & Bank: $128,450 | Receivables: $145,000 | Stock: $55,000)
* **Total Current Liabilities**: $114,200.00 (Vendor Payables: $84,200 | Tax Provisions: $30,000)
* **Working Capital**: **+$214,250.00** *(Strong liquidity buffer)*

> 💡 *Note*: To unlock real-time live AI answers from ChatGPT, click **⚙️ Settings** in the assistant header, paste your OpenAI API key, and hit **🔒 Lock API Key**!`;
        } else if (q.includes('ratio') || q.includes('liquidity') || q.includes('current ratio')) {
          reply = `### ⚖️ Financial Health & Ratio Diagnostics
1. **Current Ratio**: \`2.88x\` *(Benchmark > 2.0x — Excellent short-term solvency)*
2. **Quick Ratio (Acid-Test)**: \`2.39x\` *(Excluding $55k inventory — high cash availability)*
3. **Debt-to-Equity Ratio**: \`0.35x\` *(Conservative leverage profile)*
4. **Gross Profit Margin**: \`38.4%\` *(Up +2.1% MoM)*

All metrics are within optimal solvency thresholds for enterprise operations.`;
        } else if (q.includes('journal') || q.includes('voucher') || q.includes('debit') || q.includes('credit') || q.includes('entry')) {
          reply = `### 📝 Recommended Journal Entry (Double-Entry Principle)
*Golden Rule of Accounting*: Debit what comes in / receiver; Credit what goes out / giver.

| Account Classification | Account Code | Dr Amount | Cr Amount | Narration |
| :--- | :--- | :--- | :--- | :--- |
| **Cash / Bank Account** | \`1010-01\` | $12,500.00 | — | Customer Receipt Ref #INV-8842 |
| **Accounts Receivable** | \`1020-05\` | — | $12,500.00 | Settlement of Outstanding Balance |

*The total Debits ($12,500.00) equal total Credits ($12,500.00). Ledger status: Balanced.*`;
        } else if (q.includes('tax') || q.includes('gst') || q.includes('vat')) {
          reply = `### 🏛️ Tax & Statutory Liability Summary
* **Standard VAT/GST Rate**: 18.00%
* **Output Tax Collected (Sales)**: $34,200.00
* **Input Tax Credit Claimable (Purchases)**: $18,450.00
* **Net Payable to Tax Authority**: **$15,750.00** due by the 20th of the calendar month.`;
        } else if (q.includes('security') || q.includes('firewall') || q.includes('waf')) {
          reply = `### 🛡️ NexOS Defense-in-Depth Security Status
* **Firewall Layers Active**: 6/6 Protection Tiers Active
* **Perimeter Gateway**: Nginx Reverse Proxy with Rate Limiting
* **Application WAF**: Active SQLi, XSS, and Path-Traversal inspection filters
* **IP Defense Manager**: Zero active IP bans in the jail queue; threat index nominal.`;
        } else {
          reply = `### 🤖 NexOS AI Operations Copilot
I have analyzed your query regarding: **"${query}"**

* **Ledger Accounting**: All recent transactions are reconciled across Company branches.
* **Cash Flow Position**: Positive net operational margin of +18.4%.
* **Next Audit Milestone**: Monthly Trial Balance closing scheduled for month-end.

*(For full ChatGPT generative dialogue, tap **⚙️ Settings** above and lock your OpenAI API key!)*`;
        }
      }

      setCopilotMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      speakResponse(reply);
    } catch (err: any) {
      const errMsg = `⚠️ AI Error: ${err.message || 'Failed to reach AI service'}. Please check your API key in ⚙️ Settings.`;
      setCopilotMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: errMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setCopilotIsLoading(false);
    }
  };

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Tab Manager Helpers
  const openTab = (id: string, title: string, view: string) => {
    setShowMastersDropdown(false);
    const existing = openTabs.find(t => t.id === id);
    if (!existing) {
      setOpenTabs([...openTabs, { id, title, view }]);
    }
    setActiveTabId(id);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (openTabs.length <= 1) return;
    const filtered = openTabs.filter(t => t.id !== id);
    setOpenTabs(filtered);
    if (activeTabId === id) {
      setActiveTabId(filtered[filtered.length - 1].id);
    }
  };

  const currentActiveTab = openTabs.find(t => t.id === activeTabId) || openTabs[0];

  // Add New Ledger Handler
  const handleCreateLedger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const created: Ledger = {
      id: Date.now(),
      code: newCode,
      name: newName,
      group: newGroup,
      openingBalance: Number(newOpeningBal),
      dc: newDc
    };
    setLedgers([created, ...ledgers]);
    setShowNewLedgerModal(false);
    setNewName('');
    showToast(`Created ledger account ${created.code} successfully!`);
  };

  // Recent Ledger Sort Handler
  const handleSortLedger = (field: 'code' | 'name' | 'openingBalance') => {
    if (ledgerSortField === field) {
      setLedgerSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setLedgerSortField(field);
      setLedgerSortDir('asc');
    }
  };

  // Export / Print Handler
  const handlePrintDashboard = () => {
    window.print();
  };

  // Quick Action routing stubs
  const handleQuickAction = (action: 'invoice' | 'ledger' | 'payment' | 'expense') => {
    if (action === 'invoice') setShowQuickInvoiceModal(true);
    else if (action === 'ledger') setShowNewLedgerModal(true);
    else if (action === 'payment') setShowQuickPaymentModal(true);
    else if (action === 'expense') setShowQuickExpenseModal(true);
  };

  // Quick Action form submissions
  const handleCreateQuickInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const invoiceTx = {
      id: `VT-${Date.now().toString().slice(-3)}`,
      date: new Date().toISOString().split('T')[0],
      desc: `Invoice to ${quickInvCustomer}`,
      deb: 'Silicon Valley Bank',
      cred: 'Acme Corp Sales A/C',
      amt: Number(quickInvAmt),
      type: 'Receipt' as const
    };
    setTransactions([invoiceTx, ...transactions]);
    setShowQuickInvoiceModal(false);
    showToast(`Invoice for $${quickInvAmt.toLocaleString()} generated & posted!`, 'success');
  };

  const handleCreateQuickPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const payTx = {
      id: `VT-${Date.now().toString().slice(-3)}`,
      date: new Date().toISOString().split('T')[0],
      desc: quickPayDesc,
      deb: quickPayType === 'Payment' ? 'Office Expense A/C' : 'Silicon Valley Bank',
      cred: quickPayType === 'Payment' ? 'Silicon Valley Bank' : 'Acme Corp Sales A/C',
      amt: Number(quickPayAmt),
      type: quickPayType
    };
    setTransactions([payTx, ...transactions]);
    setShowQuickPaymentModal(false);
    showToast(`Payment Voucher of $${quickPayAmt.toLocaleString()} posted!`, 'success');
  };

  const handleCreateQuickExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const expTx = {
      id: `VT-${Date.now().toString().slice(-3)}`,
      date: new Date().toISOString().split('T')[0],
      desc: quickExpDesc,
      deb: quickExpCategory,
      cred: 'Silicon Valley Bank',
      amt: Number(quickExpAmt),
      type: 'Payment' as const
    };
    setTransactions([expTx, ...transactions]);
    setShowQuickExpenseModal(false);
    showToast(`Expense of $${quickExpAmt} logged successfully!`, 'success');
  };

  // Reverse voucher (creates mirrored reversing entry)
  const handleReverseVoucher = (id: string) => {
    const orig = vouchers.find(v => v.voucherId === id);
    if (!orig) return;
    
    // Create reverse lines
    const reversedLines = orig.lines.map(line => ({
      lineId: Date.now() + Math.random(),
      accountId: line.accountId,
      debitAmount: line.creditAmount, // swap debits and credits
      creditAmount: line.debitAmount
    }));

    const revVoucher: Voucher = {
      voucherId: `VT-REV-${Date.now().toString().slice(-3)}`,
      voucherType: orig.voucherType,
      voucherNumber: `REV-${orig.voucherNumber}`,
      date: new Date().toISOString().split('T')[0],
      fiscalYear: orig.fiscalYear,
      fiscalPeriod: orig.fiscalPeriod,
      narration: `REVERSAL OF VOUCHER ${orig.voucherId}: ${orig.narration}`,
      referenceNumber: `REV-${orig.referenceNumber}`,
      sourceModule: 'Manual',
      status: 'Posted',
      createdBy: 'admin',
      createdAt: new Date().toISOString(),
      postedAt: new Date().toISOString(),
      reversalOf: orig.voucherId,
      attachments: [],
      currency: orig.currency,
      exchangeRate: orig.exchangeRate,
      totalDebit: orig.totalCredit,
      totalCredit: orig.totalDebit,
      lines: reversedLines,
      history: [
        { logId: 1, action: 'Created', performedBy: 'admin', performedAt: new Date().toISOString(), details: `Correction reversal of ${orig.voucherId}` },
        { logId: 2, action: 'Posted', performedBy: 'admin', performedAt: new Date().toISOString() }
      ]
    };

    // Update original voucher status to Reversed
    const updated = vouchers.map(v => v.voucherId === id ? { ...v, status: 'Reversed' as const } : v);
    setVouchers([revVoucher, ...updated]);
    setSelectedVoucher(null);
    showToast(`Voucher ${id} has been reversed. Reversal voucher ${revVoucher.voucherId} posted.`, 'success');
  };

  // Cancel/Void Voucher
  const handleCancelVoucher = (id: string, reason: string) => {
    setVouchers(vouchers.map(v => v.voucherId === id ? { 
      ...v, 
      status: 'Cancelled' as const,
      history: [...v.history, { logId: v.history.length + 1, action: 'Cancelled', performedBy: 'admin', performedAt: new Date().toISOString(), details: reason }]
    } : v));
    setSelectedVoucher(null);
    showToast(`Voucher ${id} cancelled: ${reason}`, 'warning');
  };

  // Approve Voucher (Maker-checker validation)
  const handleApproveVoucher = (id: string) => {
    const target = vouchers.find(v => v.voucherId === id);
    if (!target) return;

    // Maker-checker validation
    if (target.createdBy === 'admin') {
      showToast('Maker-Checker Block: Creator cannot approve their own voucher!', 'error');
      return;
    }

    setVouchers(vouchers.map(v => v.voucherId === id ? { 
      ...v, 
      status: 'Posted' as const,
      approvedBy: 'admin',
      approvedAt: new Date().toISOString(),
      postedAt: new Date().toISOString(),
      history: [...v.history, { logId: v.history.length + 1, action: 'Approved', performedBy: 'admin', performedAt: new Date().toISOString() }]
    } : v));
    setSelectedVoucher(null);
    showToast(`Voucher ${id} approved & posted to ledger.`, 'success');
  };

  // Create Custom Voucher
  const handleCreateCustomVoucher = (status: 'Draft' | 'Pending Approval' | 'Posted') => {
    // Parity / Balance Check
    const totalDr = formVoucherLines.reduce((sum, l) => sum + Number(l.debitAmount || 0), 0);
    const totalCr = formVoucherLines.reduce((sum, l) => sum + Number(l.creditAmount || 0), 0);

    if (totalDr !== totalCr) {
      showToast('Balance Error: Total Debits must equal Total Credits before posting!', 'error');
      return;
    }

    if (totalDr === 0) {
      showToast('Validation Error: Voucher cannot be empty (0 amount)!', 'error');
      return;
    }

    // Duplicate reference check
    if (formVoucherRef && vouchers.some(v => v.referenceNumber === formVoucherRef)) {
      showToast(`Validation Error: Duplicate reference number '${formVoucherRef}' detected!`, 'error');
      return;
    }

    // Period Lock Check (locks July 2026 as closed for test)
    if (formVoucherDate.startsWith('2026-07')) {
      showToast('Period Lock Check: Fiscal period July 2026 is locked/closed!', 'error');
      return;
    }

    // Role Limit Check (junior accountant limit check of $5,000)
    if (status === 'Posted' && totalDr > 5000) {
      showToast('Role limits: Junior accountant capped at $5,000. Submit for approval instead.', 'error');
      return;
    }

    const newVId = `VT-${Date.now().toString().slice(-3)}`;
    const newSeqNum = `${formVoucherType.substring(0,2).toUpperCase()}-2026-${vouchers.length + 1}`;

    const newV: Voucher = {
      voucherId: newVId,
      voucherType: formVoucherType,
      voucherNumber: newSeqNum,
      date: formVoucherDate,
      fiscalYear: fiscalYear,
      fiscalPeriod: 'Period 05',
      narration: formVoucherNarration,
      referenceNumber: formVoucherRef,
      sourceModule: 'Manual',
      status: status,
      createdBy: 'junior_accountant',
      createdAt: new Date().toISOString(),
      postedAt: status === 'Posted' ? new Date().toISOString() : undefined,
      attachments: [],
      currency: formVoucherCurrency,
      exchangeRate: Number(formVoucherExchangeRate || 1.0),
      totalDebit: totalDr,
      totalCredit: totalCr,
      lines: formVoucherLines.map((line, idx) => ({
        lineId: idx + 1,
        accountId: Number(line.accountId),
        debitAmount: Number(line.debitAmount || 0),
        creditAmount: Number(line.creditAmount || 0),
        lineNarration: line.lineNarration
      })),
      history: [
        { logId: 1, action: 'Created', performedBy: 'junior_accountant', performedAt: new Date().toISOString(), details: `Status: ${status}` }
      ]
    };

    setVouchers([newV, ...vouchers]);
    setActiveTransactionSubTab('list');
    setFormVoucherNarration('');
    setFormVoucherRef('');
    setFormVoucherLines([
      { accountId: 1, debitAmount: 0, creditAmount: 0, lineNarration: '' },
      { accountId: 2, debitAmount: 0, creditAmount: 0, lineNarration: '' }
    ]);
    showToast(`Voucher ${newSeqNum} saved successfully as ${status}!`, 'success');
  };

  // Add New Employee Profile
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName || !newEmpBank || !newEmpIfsc) {
      showToast('Validation Error: Employee Name and Bank Details are required!', 'error');
      return;
    }

    const created: PayrollEmployee = {
      employeeId: newEmpId,
      name: newEmpName,
      departmentId: newEmpDept,
      designation: newEmpDesg,
      dateOfJoining: newEmpDoj,
      bankAccountNo: newEmpBank,
      ifscCode: newEmpIfsc,
      panNumber: newEmpPan || 'XXXXX0000X',
      pfNumber: newEmpPf || 'N/A',
      esiNumber: newEmpEsi || 'N/A',
      taxRegime: newEmpRegime,
      status: 'active'
    };

    // Default structure template for the new employee
    const defaultStructure: SalaryStructure = {
      employeeId: newEmpId,
      components: [
        { componentName: 'Basic', componentType: 'earning', calculationType: 'flat', value: 3000 },
        { componentName: 'HRA', componentType: 'earning', calculationType: 'percentage', calculationBase: 'Basic', value: 40 },
        { componentName: 'DA', componentType: 'earning', calculationType: 'percentage', calculationBase: 'Basic', value: 10 },
        { componentName: 'Conveyance', componentType: 'earning', calculationType: 'flat', value: 200 },
        { componentName: 'Special Allowance', componentType: 'earning', calculationType: 'flat', value: 400 },
        { componentName: 'PF Deduction', componentType: 'deduction', calculationType: 'percentage', calculationBase: 'Basic+DA', value: 12 },
        { componentName: 'TDS Deduction', componentType: 'deduction', calculationType: 'flat', value: 150 }
      ]
    };

    setEmployees([...employees, created]);
    setSalaryStructures([...salaryStructures, defaultStructure]);
    
    // Seed default attendance summary
    setAttendanceSummaries([...attendanceSummaries, { employeeId: newEmpId, presentDays: 22, lopDays: 0, overtimeHours: 0 }]);
    
    setShowNewEmployeeModal(false);
    setNewEmpName('');
    setNewEmpBank('');
    setNewEmpIfsc('');
    setNewEmpPan('');
    setNewEmpPf('');
    setNewEmpEsi('');
    setNewEmpId(`EMP-0${employees.length + 2}`);
    showToast(`Created employee profile for ${created.name} and initialized salary structure!`, 'success');
  };

  // Add Employee Salary Component Update
  const handleUpdateSalaryStructure = (empId: string, updatedComponents: SalaryComponent[]) => {
    setSalaryStructures(salaryStructures.map(s => s.employeeId === empId ? { ...s, components: updatedComponents } : s));
    showToast('Salary structure updated successfully!', 'success');
  };

  // Add Employee Loan Request
  const handleRequestLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const created: EmployeeLoan = {
      loanId: `LN-${Date.now().toString().slice(-3)}`,
      employeeId: newLoanEmpId,
      loanType: newLoanType,
      principalAmount: Number(newLoanPrincipal),
      emiAmount: Number(newLoanEmi),
      remainingBalance: Number(newLoanPrincipal),
      startDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    setEmployeeLoans([created, ...employeeLoans]);
    setShowNewLoanModal(false);
    showToast(`Advance loan approved for employee ${newLoanEmpId}. EMIs will deduct from payroll.`, 'success');
  };

  // Run Payroll Cycle Core calculations
  const handleCreatePayrollRun = (month: string, year: string, runType: 'regular' | 'off-cycle') => {
    // Basic checks
    if (payrollRuns.some(r => r.periodMonth === month && r.periodYear === year && r.status === 'paid')) {
      showToast(`Period Lock: Payroll for ${month} ${year} has already been paid and locked!`, 'error');
      return;
    }

    let grossSum = 0;
    let dedSum = 0;
    let netSum = 0;

    // Iterate over active employees to calculate pay elements
    employees.forEach(emp => {
      if (emp.status !== 'active') return;

      const struct = salaryStructures.find(s => s.employeeId === emp.employeeId);
      const att = attendanceSummaries.find(a => a.employeeId === emp.employeeId) || { presentDays: 22, lopDays: 0, overtimeHours: 0 };
      const loan = employeeLoans.find(l => l.employeeId === emp.employeeId && l.status === 'active');

      if (!struct) return;

      const basicComp = struct.components.find(c => c.componentName === 'Basic')?.value || 0;
      
      // Calculate Loss of Pay multiplier (base: 22 working days)
      const lopDays = att.lopDays || 0;
      const payMultiplier = Math.max(0, (22 - lopDays) / 22);

      // Earning components
      let empGross = 0;
      let basicVal = basicComp * payMultiplier;
      let hraVal = 0;
      let daVal = 0;

      struct.components.forEach(comp => {
        if (comp.componentType === 'earning') {
          let compVal = comp.value;
          if (comp.calculationType === 'percentage' && comp.calculationBase === 'Basic') {
            compVal = (basicComp * comp.value) / 100;
          }
          // apply LOP deduction
          empGross += compVal * payMultiplier;
          if (comp.componentName === 'HRA') hraVal = compVal * payMultiplier;
          if (comp.componentName === 'DA') daVal = compVal * payMultiplier;
        }
      });

      // Add overtime if applicable (1.5x basic hourly rate)
      if (att.overtimeHours > 0) {
        const hourlyRate = basicComp / 22 / 8;
        const otPay = hourlyRate * 1.5 * att.overtimeHours;
        empGross += otPay;
      }

      // Deductions
      let pfEmp = 0;
      const tdsVal = struct.components.find(c => c.componentName === 'TDS Deduction')?.value || 0;
      let esiVal = 0;
      const ptVal = 200; // professional tax flat rate

      // PF calculation (12% of Basic + DA)
      const pfBase = basicVal + daVal;
      pfEmp = (pfBase * 12) / 100;

      // ESI calculation (0.75% of Gross if Gross <= $3,000)
      if (empGross <= 3000) {
        esiVal = (empGross * 0.75) / 100;
      }

      let empDeductions = pfEmp + tdsVal + esiVal + ptVal;

      // Apply loan EMI deduction
      if (loan) {
        const emi = Math.min(loan.emiAmount, loan.remainingBalance);
        empDeductions += emi;
      }

      const empNet = empGross - empDeductions;

      grossSum += empGross;
      dedSum += empDeductions;
      netSum += empNet;
    });

    const newRun: PayrollRun = {
      runId: `PR-${Date.now().toString().slice(-3)}`,
      periodMonth: month,
      periodYear: year,
      runType: runType,
      status: 'draft',
      runDate: new Date().toISOString().split('T')[0],
      processedBy: 'junior_accountant',
      totalGross: Math.round(grossSum * 100) / 100,
      totalDeductions: Math.round(dedSum * 100) / 100,
      totalNet: Math.round(netSum * 100) / 100
    };

    setPayrollRuns([newRun, ...payrollRuns.filter(r => !(r.periodMonth === month && r.periodYear === year))]);
    setSelectedPayrollRunId(newRun.runId);
    showToast(`Payroll Cycle calculated for ${month} ${year}. Gross: $${newRun.totalGross.toLocaleString()}.`, 'success');
  };

  // Lock period, disburse salaries, and AUTO-POST accounting Journal Voucher
  const handleLockAndDisbursePayroll = (runId: string) => {
    const run = payrollRuns.find(r => r.runId === runId);
    if (!run) return;

    // Maker-checker rule: HR creates (alex/junior), admin/checker approves
    if (run.processedBy === 'admin') {
      showToast('Maker-Checker Block: Creator cannot approve their own payroll cycle disbursement!', 'error');
      return;
    }

    // Validation checklist (check bank details, PAN compliance)
    const incomplete = employees.some(e => e.status === 'active' && (!e.bankAccountNo || !e.ifscCode || !e.panNumber));
    if (incomplete) {
      showToast('Validation Error: Some employees have missing bank account details or PAN numbers!', 'error');
      return;
    }

    // Compute split ledger figures for double-entry auto-post JV
    let totalGross = 0;
    let totalNet = 0;
    let employeePF = 0;
    let employerPF = 0;
    let totalTDS = 0;

    employees.forEach(emp => {
      if (emp.status !== 'active') return;

      const struct = salaryStructures.find(s => s.employeeId === emp.employeeId);
      const att = attendanceSummaries.find(a => a.employeeId === emp.employeeId) || { presentDays: 22, lopDays: 0, overtimeHours: 0 };
      const loan = employeeLoans.find(l => l.employeeId === emp.employeeId && l.status === 'active');

      if (!struct) return;

      const basicComp = struct.components.find(c => c.componentName === 'Basic')?.value || 0;
      const lopDays = att.lopDays || 0;
      const payMultiplier = Math.max(0, (22 - lopDays) / 22);

      const basicVal = basicComp * payMultiplier;
      let daVal = 0;
      let empGross = 0;

      struct.components.forEach(comp => {
        if (comp.componentType === 'earning') {
          let compVal = comp.value;
          if (comp.calculationType === 'percentage' && comp.calculationBase === 'Basic') {
            compVal = (basicComp * comp.value) / 100;
          }
          empGross += compVal * payMultiplier;
          if (comp.componentName === 'DA') daVal = compVal * payMultiplier;
        }
      });

      if (att.overtimeHours > 0) {
        const hourlyRate = basicComp / 22 / 8;
        const otPay = hourlyRate * 1.5 * att.overtimeHours;
        empGross += otPay;
      }

      const pfBase = basicVal + daVal;
      const pfEmp = (pfBase * 12) / 100;
      const pfEmpContrib = (pfBase * 12) / 100; // employer contributes matching 12%
      const tdsVal = struct.components.find(c => c.componentName === 'TDS Deduction')?.value || 0;
      const ptVal = 200;
      
      let empDeductions = pfEmp + tdsVal + ptVal;
      if (loan) {
        const emi = Math.min(loan.emiAmount, loan.remainingBalance);
        empDeductions += emi;
      }

      const empNet = empGross - empDeductions;

      totalGross += empGross;
      totalNet += empNet;
      employeePF += pfEmp;
      employerPF += pfEmpContrib;
      totalTDS += tdsVal + ptVal;
    });

    // Generate Journal Voucher matching specifications
    const jvId = `VT-PAY-${Date.now().toString().slice(-3)}`;
    const jvSeqNum = `JV-PAY-${run.periodYear}-${run.runId.slice(-3)}`;

    const payrollJV: Voucher = {
      voucherId: jvId,
      voucherType: 'Journal Voucher',
      voucherNumber: jvSeqNum,
      date: new Date().toISOString().split('T')[0],
      fiscalYear: fiscalYear,
      fiscalPeriod: 'Period 05',
      narration: `AUTO-POSTED PAYROLL JOURNAL CYCLE: ${run.periodMonth} ${run.periodYear} (Run: ${run.runId})`,
      referenceNumber: `REF-${run.runId}`,
      sourceModule: 'Payroll',
      sourceDocumentId: run.runId,
      status: 'Posted',
      createdBy: 'system',
      createdAt: new Date().toISOString(),
      postedAt: new Date().toISOString(),
      attachments: [],
      currency: 'USD',
      exchangeRate: 1.0,
      totalDebit: Math.round((totalGross + employerPF) * 100) / 100,
      totalCredit: Math.round((totalGross + employerPF) * 100) / 100,
      lines: [
        // Dr Salary Expense A/C (Gross salaries expense)
        { lineId: 1, accountId: 9, debitAmount: Math.round(totalGross * 100) / 100, creditAmount: 0 },
        // Dr Employer PF Expense A/C (Employer contribution cost)
        { lineId: 2, accountId: 13, debitAmount: Math.round(employerPF * 100) / 100, creditAmount: 0 },
        // Cr Employee Payable A/C (Net salaries payable)
        { lineId: 3, accountId: 10, debitAmount: 0, creditAmount: Math.round(totalNet * 100) / 100 },
        // Cr PF Payable A/C (Total PF payable: employee + employer)
        { lineId: 4, accountId: 11, debitAmount: 0, creditAmount: Math.round((employeePF + employerPF) * 100) / 100 },
        // Cr TDS Payable A/C (TDS tax withholding credit)
        { lineId: 5, accountId: 12, debitAmount: 0, creditAmount: Math.round(totalTDS * 100) / 100 }
      ],
      history: [
        { logId: 1, action: 'Created', performedBy: 'system', performedAt: new Date().toISOString(), details: `Auto-posted payroll cycle run ${run.runId}` },
        { logId: 2, action: 'Posted', performedBy: 'system', performedAt: new Date().toISOString() }
      ]
    };

    // Update Loan Balances (post EMI repayment)
    setEmployeeLoans(employeeLoans.map(loan => {
      if (loan.status !== 'active') return loan;
      const emi = Math.min(loan.emiAmount, loan.remainingBalance);
      const rem = loan.remainingBalance - emi;
      return {
        ...loan,
        remainingBalance: rem,
        status: rem <= 0 ? ('closed' as const) : ('active' as const)
      };
    }));

    // Update Runs list and append accounting JV
    setPayrollRuns(payrollRuns.map(r => r.runId === runId ? { ...r, status: 'paid' as const, approvedBy: 'admin' } : r));
    setVouchers([payrollJV, ...vouchers]);
    setSelectedPayrollRunId(null);
    showToast(`Payroll disbursement completed. Double-entry Journal entry ${jvSeqNum} auto-posted!`, 'success');
  };

  // DMS Handlers
  const handleCreateDmsDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) {
      showToast('Validation Error: Document File Name is required!', 'error');
      return;
    }

    const docId = `DOC-0${documents.length + 1}`;
    const fileExt = newDocName.split('.').pop() || 'pdf';
    
    // Auto-suggest tag based on content pattern
    let suggestedTag = '';
    const nameLower = newDocName.toLowerCase();
    if (nameLower.includes('gst') || nameLower.includes('tax') || nameLower.includes('filing')) {
      suggestedTag = 'GST Compliance';
    } else if (nameLower.includes('rent') || nameLower.includes('agree') || nameLower.includes('lease')) {
      suggestedTag = 'Lease Contracts';
    } else if (nameLower.includes('invoice') || nameLower.includes('bill') || nameLower.includes('receipt')) {
      suggestedTag = 'Expense Invoices';
    } else {
      suggestedTag = 'General Corporate';
    }

    // Map department based on category
    let deptId = 'Finance';
    if (newDocCat === 'Contracts') deptId = 'Legal';
    else if (newDocCat === 'HR') deptId = 'HR';
    else if (newDocCat === 'Backups') deptId = 'System';

    const newDoc: ERPDocument = {
      documentId: docId,
      fileName: newDocName,
      category: newDocCat,
      fileType: fileExt,
      fileSize: newDocSize,
      uploadedBy: 'admin',
      uploadedAt: new Date().toISOString(),
      status: 'Draft',
      expiryDate: newDocExpiry || undefined,
      isConfidential: newDocConfidential,
      versions: [
        {
          versionId: `V-${Date.now().toString().slice(-3)}`,
          versionNumber: 1,
          fileUrl: `/dms/${newDocName}`,
          uploadedBy: 'admin',
          uploadedAt: new Date().toISOString(),
          changeNotes: 'Initial ingestion upload'
        }
      ],
      comments: [],
      accessLogs: [
        { action: 'Created', user: 'admin', timestamp: new Date().toISOString() }
      ]
    };

    setDocuments([newDoc, ...documents]);
    setShowUploadModal(false);
    setNewDocName('');
    setNewDocExpiry('');
    setNewDocConfidential(false);
    
    showToast(`Ingested ${newDocName}. Auto-tagged as [${suggestedTag}] under [${newDocCat}]!`, 'success');
  };

  const handleUploadNewVersion = (docId: string) => {
    const changeNotes = prompt('Enter change notes for this new version:', 'Updated doc content adjustments');
    if (changeNotes === null) return;

    setDocuments(documents.map(doc => {
      if (doc.documentId === docId) {
        if (doc.lockStatus && doc.lockStatus.lockedBy !== 'admin') {
          showToast(`Block: Document is currently checked out/locked by ${doc.lockStatus.lockedBy}!`, 'error');
          return doc;
        }

        const nextVer = doc.versions.length + 1;
        const newVer = {
          versionId: `V-${Date.now().toString().slice(-3)}`,
          versionNumber: nextVer,
          fileUrl: `/dms/${doc.fileName.replace('.', `_v${nextVer}.`)}`,
          uploadedBy: 'admin',
          uploadedAt: new Date().toISOString(),
          changeNotes: changeNotes || `Upload version v${nextVer}`
        };

        const updated = {
          ...doc,
          fileSize: `${(parseFloat(doc.fileSize) + 0.2).toFixed(1)} MB`,
          versions: [...doc.versions, newVer],
          accessLogs: [{ action: 'Uploaded version', user: 'admin', timestamp: new Date().toISOString() }, ...doc.accessLogs]
        };

        // If selected document is currently active, sync detail preview
        if (selectedDmsDoc && selectedDmsDoc.documentId === docId) {
          setSelectedDmsDoc(updated);
        }

        showToast(`Uploaded new version v${nextVer} for ${doc.fileName}!`, 'success');
        return updated;
      }
      return doc;
    }));
  };

  const handleRollbackVersion = (docId: string, versionNum: number) => {
    if (!confirm(`Are you sure you want to rollback this document to version v${versionNum}?`)) return;

    setDocuments(documents.map(doc => {
      if (doc.documentId === docId) {
        const rollbackVer = doc.versions.find(v => v.versionNumber === versionNum);
        if (!rollbackVer) return doc;

        const updated = {
          ...doc,
          accessLogs: [{ action: `Rolled back to v${versionNum}`, user: 'admin', timestamp: new Date().toISOString() }, ...doc.accessLogs]
        };

        if (selectedDmsDoc && selectedDmsDoc.documentId === docId) {
          setSelectedDmsDoc(updated);
        }

        showToast(`Document rolled back to version v${versionNum}!`, 'success');
        return updated;
      }
      return doc;
    }));
  };

  const handleToggleLock = (docId: string) => {
    setDocuments(documents.map(doc => {
      if (doc.documentId === docId) {
        let updated;
        if (doc.lockStatus) {
          // Unlock
          updated = {
            ...doc,
            lockStatus: undefined,
            accessLogs: [{ action: 'Checked In (Unlocked)', user: 'admin', timestamp: new Date().toISOString() }, ...doc.accessLogs]
          };
          showToast(`Checked in ${doc.fileName}. File lock released.`, 'success');
        } else {
          // Lock
          updated = {
            ...doc,
            lockStatus: { lockedBy: 'admin', lockedAt: new Date().toISOString() },
            accessLogs: [{ action: 'Checked Out (Locked)', user: 'admin', timestamp: new Date().toISOString() }, ...doc.accessLogs]
          };
          showToast(`Checked out ${doc.fileName}. Lock placed.`, 'warning');
        }

        if (selectedDmsDoc && selectedDmsDoc.documentId === docId) {
          setSelectedDmsDoc(updated);
        }
        return updated;
      }
      return doc;
    }));
  };

  const handlePostDmsComment = (docId: string) => {
    if (!dmsCommentInput) return;

    setDocuments(documents.map(doc => {
      if (doc.documentId === docId) {
        const newComment = {
          author: 'admin',
          text: dmsCommentInput,
          timestamp: new Date().toISOString()
        };

        const updated = {
          ...doc,
          comments: [...doc.comments, newComment],
          accessLogs: [{ action: 'Added annotation comment', user: 'admin', timestamp: new Date().toISOString() }, ...doc.accessLogs]
        };

        if (selectedDmsDoc && selectedDmsDoc.documentId === docId) {
          setSelectedDmsDoc(updated);
        }

        setDmsCommentInput('');
        return updated;
      }
      return doc;
    }));
  };

  const handleProcessDmsWorkflow = (docId: string, action: 'Approve' | 'Reject') => {
    setDocuments(documents.map(doc => {
      if (doc.documentId === docId) {
        const newStatus = action === 'Approve' ? 'Approved' : 'Draft';
        const updated = {
          ...doc,
          status: newStatus as any,
          accessLogs: [{ action: `${action}d Document`, user: 'admin', timestamp: new Date().toISOString() }, ...doc.accessLogs]
        };

        if (selectedDmsDoc && selectedDmsDoc.documentId === docId) {
          setSelectedDmsDoc(updated);
        }

        showToast(`Document ${doc.fileName} lifecycle status flipped to ${newStatus}!`, 'success');
        return updated;
      }
      return doc;
    }));
  };

  const handleGenerateShareLink = (docId: string) => {
    const resultLink = `http://localhost:5174/share/dms/${docId}?token=lnk_${Date.now()}`;
    setShareDocId(docId);
    setShareLinkResult(resultLink);
    setShowShareModal(true);
    
    // Log shared action
    setDocuments(documents.map(doc => {
      if (doc.documentId === docId) {
        return {
          ...doc,
          accessLogs: [{ action: 'Generated time-limited share link', user: 'admin', timestamp: new Date().toISOString() }, ...doc.accessLogs]
        };
      }
      return doc;
    }));
  };

  // Reports Workspace Handlers
  const handleCreateProvisionalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provDesc) {
      showToast('Validation Error: Description is required!', 'error');
      return;
    }
    if (provDr === 0 && provCr === 0) {
      showToast('Validation Error: Enter either Debit or Credit amount!', 'error');
      return;
    }

    const created: ReportProvisionalEntry = {
      provisionalId: `PRV-${Date.now().toString().slice(-3)}`,
      accountName: provAccount,
      debitAmount: Number(provDr || 0),
      creditAmount: Number(provCr || 0),
      description: provDesc
    };

    setProvisionalEntries([...provisionalEntries, created]);
    setShowProvisionalModal(false);
    setProvDr(0);
    setProvCr(0);
    setProvDesc('');
    
    // Log access audit trail
    const logVal = {
      logId: `LOG-R-${Date.now().toString().slice(-3)}`,
      reportName: selectedReportType,
      user: 'admin',
      action: `Added Provisional: ${provDesc}`,
      timestamp: new Date().toISOString()
    };
    setReportAccessLogs([logVal, ...reportAccessLogs]);
    showToast(`Added provisional adjustment: ${provDesc} (Sandboxed)`, 'success');
  };

  const handleDeleteProvisionalEntry = (id: string) => {
    setProvisionalEntries(provisionalEntries.filter(p => p.provisionalId !== id));
    showToast('Removed sandboxed provisional adjustment.', 'warning');
  };

  const handleCreateReportAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnotationComment || !annotationLineRef) return;

    const created: ReportAnnotation = {
      annotationId: `ANN-${Date.now().toString().slice(-3)}`,
      lineItemRef: annotationLineRef,
      comment: newAnnotationComment,
      createdBy: 'admin',
      createdAt: new Date().toISOString()
    };

    setReportAnnotations([...reportAnnotations, created]);
    setNewAnnotationComment('');
    setAnnotationLineRef(null);
    showToast(`Annotation added to line [${annotationLineRef}]!`, 'success');
  };

  const handleDeleteReportAnnotation = (id: string) => {
    setReportAnnotations(reportAnnotations.filter(a => a.annotationId !== id));
    showToast('Deleted annotation.', 'warning');
  };

  const handleSaveCustomStructure = (e: React.FormEvent) => {
    e.preventDefault();
    if (builderEditingAccountId === null) return;

    const exists = customStructures.some(s => s.accountId === builderEditingAccountId);
    let updated;
    if (exists) {
      updated = customStructures.map(s => s.accountId === builderEditingAccountId ? { ...s, customLabel: builderCustomLabel } : s);
    } else {
      updated = [...customStructures, { accountId: builderEditingAccountId, customLabel: builderCustomLabel, hidden: false }];
    }

    setCustomStructures(updated);
    setBuilderEditingAccountId(null);
    setBuilderCustomLabel('');
    showToast('Report structure relabeling updated!', 'success');
  };

  const handleCreateReportSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedRecipients) {
      showToast('Validation Error: Recipients email is required!', 'error');
      return;
    }

    const created = {
      scheduleId: `SCH-${Date.now().toString().slice(-3)}`,
      reportName: schedReportName,
      frequency: schedFreq,
      recipients: schedRecipients,
      nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setReportSchedules([...reportSchedules, created]);
    setShowScheduleModal(false);
    setSchedRecipients('');
    showToast(`Scheduled ${schedReportName} delivery to ${schedRecipients}!`, 'success');
  };

  const handleDeleteReportSchedule = (id: string) => {
    setReportSchedules(reportSchedules.filter(s => s.scheduleId !== id));
    showToast('Cancelled report subscription schedule.', 'warning');
  };

  // Auditor Pack Generation Simulator
  const handleExportAuditorPack = () => {
    showToast('Compiling Balance Sheet, P&L, Trial Balance, and documents...', 'success');
    
    // Log audit log
    const logVal = {
      logId: `LOG-R-${Date.now().toString().slice(-3)}`,
      reportName: 'Auditor Pack',
      user: 'admin',
      action: 'Exported ZIP Auditor Pack',
      timestamp: new Date().toISOString()
    };
    setReportAccessLogs([logVal, ...reportAccessLogs]);

    setTimeout(() => {
      showToast('ZIP Auditor Pack (auditor_bundle_fy_2026.zip) generated successfully!', 'success');
    }, 1500);
  };

  // Initialize Dual Bar Charts on Dashboard view
  useEffect(() => {
    if (currentActiveTab?.view === 'dashboard' && typeof Chart !== 'undefined') {
      // 1. Sales vs Expenses Chart (Left)
      let chart1: any = null;
      if (salesExpensesChartRef.current) {
        const ctx1 = salesExpensesChartRef.current.getContext('2d');
        if (ctx1) {
          chart1 = new Chart(ctx1, {
            type: 'bar',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [
                {
                  label: 'Sales',
                  data: [12500, 15300, 18200, 17000, 21400, 24850].map(v => v * multiplier),
                  backgroundColor: '#12A594',
                  borderRadius: 4,
                  barPercentage: 0.6,
                  categoryPercentage: 0.5
                },
                {
                  label: 'Expenses',
                  data: [8200, 9100, 11400, 10200, 11800, 14000].map(v => v * multiplier),
                  backgroundColor: '#E2662F',
                  borderRadius: 4,
                  barPercentage: 0.6,
                  categoryPercentage: 0.5
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                  align: 'end',
                  labels: {
                    usePointStyle: false,
                    boxWidth: 12,
                    boxHeight: 12,
                    font: { family: 'Inter', size: 12, weight: '600' },
                    color: '#161B33'
                  }
                },
                tooltip: {
                  backgroundColor: '#10163A',
                  titleFont: { family: 'Manrope', size: 12, weight: '800' },
                  bodyFont: { family: 'Inter', size: 12 },
                  padding: 10,
                  cornerRadius: 6
                }
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { font: { family: 'Inter', size: 11, weight: '600' }, color: '#5B6178' }
                },
                y: {
                  border: { dash: [4, 4] },
                  grid: { color: '#E1E5EC' },
                  ticks: {
                    font: { family: 'Inter', size: 11 },
                    color: '#5B6178',
                    callback: (val: any) => '$' + (val / 1000) + 'k'
                  }
                }
              }
            }
          });
        }
      }

      // 2. Monthwise Expenses Chart (Right)
      let chart2: any = null;
      if (monthwiseExpensesChartRef.current) {
        const ctx2 = monthwiseExpensesChartRef.current.getContext('2d');
        if (ctx2) {
          chart2 = new Chart(ctx2, {
            type: 'bar',
            data: {
              labels: ['Purchases', 'Direct Expenses', 'Indirect Expenses'],
              datasets: [
                {
                  label: 'Purchases',
                  data: [12500, 0, 0].map(v => v * multiplier),
                  backgroundColor: '#232C63',
                  borderRadius: 4,
                  barThickness: 36
                },
                {
                  label: 'Direct',
                  data: [0, 4800, 0].map(v => v * multiplier),
                  backgroundColor: '#E2662F',
                  borderRadius: 4,
                  barThickness: 36
                },
                {
                  label: 'Indirect',
                  data: [0, 0, 6700].map(v => v * multiplier),
                  backgroundColor: '#EAB308',
                  borderRadius: 4,
                  barThickness: 36
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                  align: 'end',
                  labels: {
                    usePointStyle: false,
                    boxWidth: 12,
                    boxHeight: 12,
                    font: { family: 'Inter', size: 12, weight: '600' },
                    color: '#161B33'
                  }
                }
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: { font: { family: 'Inter', size: 11, weight: '600' }, color: '#5B6178' }
                },
                y: {
                  border: { dash: [4, 4] },
                  grid: { color: '#E1E5EC' },
                  ticks: {
                    font: { family: 'Inter', size: 11 },
                    color: '#5B6178',
                    callback: (val: any) => '$' + (val / 1000) + 'k'
                  }
                }
              }
            }
          });
        }
      }

      return () => {
        if (chart1) chart1.destroy();
        if (chart2) chart2.destroy();
      };
    }
  }, [currentActiveTab?.view, multiplier]);

  // Initialize P&L Chart on Profit & Loss view
  useEffect(() => {
    if (currentActiveTab?.view === 'profit_loss' && typeof Chart !== 'undefined' && plChartRef.current) {
      const ctx = plChartRef.current.getContext('2d');
      if (ctx) {
        const monthlyData = [6300, 6600, -2500, 5800, -1600, 5800, 6500, -1700, 7500, 6800, 4400, 7500];
        const yearlyData = [35000, -15000, 45000, 35000, 27000];
        const values = profitLossView === 'monthly' ? monthlyData : yearlyData;
        const labels = profitLossView === 'monthly'
          ? ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
          : ['FY 22-23', 'FY 23-24', 'FY 24-25', 'FY 25-26', 'FY 26-27'];

        const chart = new Chart(ctx, {
          type: plChartType === 'candlestick' ? 'bar' : 'line',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Net Profit / Loss',
                data: values,
                borderColor: '#FF5C33',
                backgroundColor: values.map(v => v >= 0 ? 'rgba(46, 158, 91, 0.2)' : 'rgba(226, 102, 47, 0.2)'),
                borderWidth: 2.5,
                tension: 0.25,
                fill: plChartType !== 'candlestick'
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { color: '#64748B' } },
              y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#64748B' } }
            }
          }
        });

        return () => {
          chart.destroy();
        };
      }
    }
  }, [currentActiveTab?.view, profitLossView, plTimelineView, plChartType]);

  const renderTabContent = () => {
    switch (currentActiveTab.view) {
      case 'dashboard': {
        // Calculate dynamic values for KPIs
        const scaledSales = (24850 * multiplier).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const scaledExpenses = (11210 * multiplier).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const scaledCash = (38400 * multiplier).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Filter, Sort, Paginate Ledgers
        const filteredLedgers = ledgers
          .filter(l => 
            l.name.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
            l.code.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
            l.group.toLowerCase().includes(ledgerSearch.toLowerCase())
          );

        const sortedLedgers = [...filteredLedgers].sort((a, b) => {
          if (!ledgerSortField) return 0;
          
          let aVal = a[ledgerSortField];
          let bVal = b[ledgerSortField];
          
          if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = (bVal as string).toLowerCase();
          }
          
          if (aVal < bVal) return ledgerSortDir === 'asc' ? -1 : 1;
          if (aVal > bVal) return ledgerSortDir === 'asc' ? 1 : -1;
          return 0;
        });

        const paginatedLedgers = sortedLedgers.slice(
          (ledgerPage - 1) * ledgerPageSize,
          ledgerPage * ledgerPageSize
        );

        const totalPages = Math.ceil(sortedLedgers.length / ledgerPageSize);

        return (
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Filter controls row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 rounded-lg p-4 shadow-sm print:hidden">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <FiCalendar className="text-slate-400 text-sm" />
                  <span className="text-[10px] font-extrabold text-[#5B6178] uppercase tracking-wider">Fiscal Period:</span>
                  <select 
                    value={fiscalYear} 
                    onChange={(e) => setFiscalYear(e.target.value)} 
                    className="border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-[#161B33] bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#12A594]"
                  >
                    <option value="FY 2027-28">FY 2027-28</option>
                    <option value="FY 2026-27">FY 2026-27</option>
                    <option value="FY 2025-26">FY 2025-26</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-[#5B6178] uppercase tracking-wider">Range:</span>
                  <select 
                    value={dateRange} 
                    onChange={(e) => setDateRange(e.target.value)} 
                    className="border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-[#161B33] bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#12A594]"
                  >
                    <option value="This Month">This Month</option>
                    <option value="This Quarter">This Quarter</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="Custom">Custom Range</option>
                  </select>
                </div>
              </div>
              
              <button 
                onClick={handlePrintDashboard}
                className="border-[1.5px] border-[#10163A] hover:bg-[#10163A]/5 text-[#10163A] px-3.5 py-1.5 rounded-md text-xs font-extrabold flex items-center gap-1.5 transition select-none"
              >
                <FiFileText /> Export PDF / Print
              </button>
            </div>

            {/* Alerts notice banner strip */}
            {alerts.length > 0 && (
              <div className="space-y-2 print:hidden">
                {alerts.map(alert => (
                  <div 
                    key={alert.id} 
                    className={`border-l-4 p-3 rounded-r-md bg-white border border-slate-200 border-l-slate-200 shadow-sm flex items-center justify-between text-xs transition duration-200 ${
                      alert.type === 'error' 
                        ? 'border-l-[#E2662F]' 
                        : alert.type === 'warning' 
                        ? 'border-l-[#EAB308]' 
                        : 'border-l-[#2563EB]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono ${
                        alert.type === 'error' 
                          ? 'bg-[#FFF3EC] text-[#E2662F] border border-[#E2662F]/20' 
                          : alert.type === 'warning' 
                          ? 'bg-[#FEFCE8] text-[#854D0E] border border-[#EAB308]/20' 
                          : 'bg-[#EFF6FF] text-[#1E40AF] border border-[#2563EB]/20'
                      }`}>
                        {alert.category}
                      </span>
                      <span className="font-semibold text-slate-700">{alert.message}</span>
                    </div>
                    <button 
                      onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
                      className="text-slate-400 hover:text-slate-700 transition font-extrabold text-sm ml-2 px-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ROW 1: 4 METRIC CARDS + QUICK ACTIONS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Card 1: LEDGER ACCOUNTS */}
                <div 
                  onClick={() => { setDrawerType('ledgers'); setDrawerOpen(true); }}
                  className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-5 flex flex-col justify-between shadow-sm min-h-[115px] cursor-pointer hover:border-[#12A594] hover:shadow-md transition group"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase text-[#5B6178] tracking-wider">LEDGER ACCOUNTS</div>
                    <FiInfo className="text-slate-400 opacity-0 group-hover:opacity-100 transition text-xs" />
                  </div>
                  <div className="font-extrabold text-3xl font-manrope text-[#161B33] my-1">{ledgers.length}</div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2E9E5B]">
                    <span className="w-2 h-2 rounded-full bg-[#2E9E5B]"></span> + Active accounts
                  </div>
                </div>

                {/* Card 2: SALES THIS MONTH */}
                <div 
                  onClick={() => { setDrawerType('sales'); setDrawerOpen(true); }}
                  className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-5 flex flex-col justify-between shadow-sm min-h-[115px] cursor-pointer hover:border-[#12A594] hover:shadow-md transition group"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase text-[#5B6178] tracking-wider">SALES THIS MONTH</div>
                    <FiInfo className="text-slate-400 opacity-0 group-hover:opacity-100 transition text-xs" />
                  </div>
                  <div className="font-extrabold text-3xl font-manrope text-[#161B33] my-1">${scaledSales}</div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-[#2E9E5B]">
                    <FiTrendingUp /> +14.2% vs last month
                  </div>
                </div>

                {/* Card 3: EXPENSES THIS MONTH */}
                <div 
                  onClick={() => { setDrawerType('expenses'); setDrawerOpen(true); }}
                  className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-5 flex flex-col justify-between shadow-sm min-h-[115px] cursor-pointer hover:border-[#12A594] hover:shadow-md transition group"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase text-[#5B6178] tracking-wider">EXPENSES THIS MONTH</div>
                    <FiInfo className="text-slate-400 opacity-0 group-hover:opacity-100 transition text-xs" />
                  </div>
                  <div className="font-extrabold text-3xl font-manrope text-[#161B33] my-1">${scaledExpenses}</div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-[#2E9E5B]">
                    <FiTrendingDown /> -2.4% vs last month
                  </div>
                </div>

                {/* Card 4: CASH IN HAND */}
                <div 
                  onClick={() => { setDrawerType('cash'); setDrawerOpen(true); }}
                  className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-5 flex flex-col justify-between shadow-sm min-h-[115px] cursor-pointer hover:border-[#12A594] hover:shadow-md transition group"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold uppercase text-[#5B6178] tracking-wider">CASH IN HAND</div>
                    <FiInfo className="text-slate-400 opacity-0 group-hover:opacity-100 transition text-xs" />
                  </div>
                  <div className="font-extrabold text-3xl font-manrope text-[#161B33] my-1">${scaledCash}</div>
                  <div className="flex items-between justify-between w-full mt-1">
                    <div className="flex items-center gap-1 text-xs font-semibold text-[#2E9E5B]">
                      <FiTrendingUp /> +5.1% vs last week
                    </div>
                    {/* Sparkline SVG */}
                    <svg className="w-14 h-5 overflow-visible print:hidden" viewBox="0 0 60 20">
                      <path 
                        d="M 0 15 L 10 12 L 20 18 L 30 10 L 40 8 L 50 14 L 60 4" 
                        fill="none" 
                        stroke="#2E9E5B" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                      <path 
                        d="M 0 15 L 10 12 L 20 18 L 30 10 L 40 8 L 50 14 L 60 4 L 60 20 L 0 20 Z" 
                        fill="rgba(46, 158, 91, 0.1)" 
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Quick Actions (1 column) */}
              <div className="bg-[#10163A] border-[1.5px] border-[#161B33] rounded-lg p-4 flex flex-col shadow-sm text-white print:hidden justify-between">
                <div className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider mb-2.5">QUICK ACTIONS</div>
                <div className="grid grid-cols-2 gap-2 flex-1 items-stretch">
                  <button 
                    onClick={() => handleQuickAction('invoice')}
                    className="flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-md p-2 transition text-center select-none"
                  >
                    <FiPlus className="text-[#12A594] text-lg mb-1" />
                    <span className="text-[9px] font-extrabold tracking-tight">New Invoice</span>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('ledger')}
                    className="flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-md p-2 transition text-center select-none"
                  >
                    <FiBookOpen className="text-[#38BDF8] text-lg mb-1" />
                    <span className="text-[9px] font-extrabold tracking-tight">New Ledger</span>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('payment')}
                    className="flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-md p-2 transition text-center select-none"
                  >
                    <FiDollarSign className="text-emerald-400 text-lg mb-1" />
                    <span className="text-[9px] font-extrabold tracking-tight">Record Pay</span>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('expense')}
                    className="flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-md p-2 transition text-center select-none"
                  >
                    <FiTrendingDown className="text-[#E2662F] text-lg mb-1" />
                    <span className="text-[9px] font-extrabold tracking-tight">Add Expense</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ROW 2: TWO CHARTS SIDE BY SIDE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Chart Card: SALES VS EXPENSES */}
              <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-extrabold text-sm uppercase tracking-wider font-manrope text-[#161B33]">SALES VS EXPENSES</h2>
                </div>
                <div className="h-64 relative">
                  <canvas ref={salesExpensesChartRef}></canvas>
                </div>
              </div>

              {/* Right Chart Card: MONTHWISE EXPENSES */}
              <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-extrabold text-sm uppercase tracking-wider font-manrope text-[#161B33]">MONTHWISE EXPENSES</h2>
                </div>
                <div className="h-64 relative">
                  <canvas ref={monthwiseExpensesChartRef}></canvas>
                </div>
              </div>
            </div>

            {/* ROW 3: TABLE CARD - Recent Ledger Accounts */}
            <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-extrabold text-base font-manrope text-[#161B33]">Recent Ledger Accounts</h2>
                  <p className="text-[10px] text-slate-500 font-medium">Manage and audit core ledger postings</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 print:hidden">
                  {/* Search Bar */}
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search accounts..." 
                      value={ledgerSearch}
                      onChange={(e) => {
                        setLedgerSearch(e.target.value);
                        setLedgerPage(1);
                      }}
                      className="border border-slate-300 rounded px-2.5 py-1 text-xs text-[#161B33] bg-slate-50 focus:outline-none focus:ring-1 focus:ring-[#12A594] pl-7 w-44 sm:w-56"
                    />
                    <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  </div>

                  <button 
                    onClick={() => setShowNewLedgerModal(true)}
                    className="border-[1.5px] border-[#2563EB] text-[#2563EB] bg-white hover:bg-blue-50 px-3 py-1.5 rounded-md text-xs font-extrabold flex items-center gap-1 transition"
                  >
                    + New account
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E1E5EC] text-[#5B6178] font-extrabold uppercase text-[10px] tracking-wider select-none">
                      <th 
                        className="py-3 px-2 cursor-pointer hover:text-[#161B33] transition"
                        onClick={() => handleSortLedger('code')}
                      >
                        CODE {ledgerSortField === 'code' && (ledgerSortDir === 'asc' ? ' ▲' : ' ▼')}
                      </th>
                      <th 
                        className="py-3 px-2 cursor-pointer hover:text-[#161B33] transition"
                        onClick={() => handleSortLedger('name')}
                      >
                        ACCOUNT NAME {ledgerSortField === 'name' && (ledgerSortDir === 'asc' ? ' ▲' : ' ▼')}
                      </th>
                      <th className="py-3 px-2">GROUP</th>
                      <th 
                        className="py-3 px-2 cursor-pointer hover:text-[#161B33] transition text-right"
                        onClick={() => handleSortLedger('openingBalance')}
                      >
                        OPENING BALANCE {ledgerSortField === 'openingBalance' && (ledgerSortDir === 'asc' ? ' ▲' : ' ▼')}
                      </th>
                      <th className="py-3 px-2 text-right">D/C</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E5EC] text-[#161B33]">
                    {paginatedLedgers.map(l => (
                      <tr key={l.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-2">
                          <span className="bg-[#10163A] text-white px-2.5 py-1 rounded font-mono font-bold text-[11px] tracking-wider">
                            {l.code}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-bold text-sm text-[#161B33]">{l.name}</td>
                        <td className="py-3 px-2 font-semibold text-slate-600">{l.group}</td>
                        <td className="py-3 px-2 font-bold font-mono text-sm text-right">${l.openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-2 text-right">
                          {l.dc === 'DEBIT' ? (
                            <span className="bg-[#FFF3EC] text-[#E2662F] border border-[#E2662F]/30 px-2.5 py-0.5 rounded text-[10px] font-extrabold font-mono uppercase">
                              DEBIT
                            </span>
                          ) : (
                            <span className="bg-[#EAF5EE] text-[#2E9E5B] border border-[#2E9E5B]/30 px-2.5 py-0.5 rounded text-[10px] font-extrabold font-mono uppercase">
                              CREDIT
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {paginatedLedgers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">
                          No ledger accounts found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-[#E1E5EC] pt-4 text-xs font-semibold text-slate-500 print:hidden select-none">
                  <div>
                    Showing {Math.min(filteredLedgers.length, (ledgerPage - 1) * ledgerPageSize + 1)} to {Math.min(filteredLedgers.length, ledgerPage * ledgerPageSize)} of {filteredLedgers.length} records
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setLedgerPage(prev => Math.max(1, prev - 1))}
                      disabled={ledgerPage === 1}
                      className="px-2.5 py-1 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition"
                    >
                      Previous
                    </button>
                    <span className="px-2.5">Page {ledgerPage} of {totalPages}</span>
                    <button 
                      onClick={() => setLedgerPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={ledgerPage === totalPages}
                      className="px-2.5 py-1 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        );
      }

      case 'accounts_list':
        return (
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold font-manrope text-[#161B33]">Ledger Accounts Master List</h2>
                    <span className="bg-[#12A594] text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                      {ledgers.length}
                    </span>
                  </div>
                  <p className="text-xs text-[#5B6178] mt-1">Manage corporate ledger accounts, opening balances, and D/C settings</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowNewLedgerModal(true)}
                    className="bg-[#12A594] hover:bg-[#0B7A6E] text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition"
                  >
                    + New Account
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E1E5EC] text-[#5B6178] font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-2">CODE</th>
                      <th className="py-3 px-2">ACCOUNT NAME</th>
                      <th className="py-3 px-2">GROUP</th>
                      <th className="py-3 px-2">OPENING BALANCE</th>
                      <th className="py-3 px-2 text-right">D/C</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E5EC] text-[#161B33]">
                    {ledgers.map(l => (
                      <tr key={l.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-2">
                          <span className="bg-[#10163A] text-white px-2.5 py-1 rounded font-mono font-bold text-[11px] tracking-wider">
                            {l.code}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-bold text-sm text-[#161B33]">{l.name}</td>
                        <td className="py-3 px-2 font-semibold text-slate-600">{l.group}</td>
                        <td className="py-3 px-2 font-bold font-mono text-sm">${l.openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-2 text-right">
                          {l.dc === 'DEBIT' ? (
                            <span className="bg-[#FFF3EC] text-[#E2662F] border border-[#E2662F]/30 px-2.5 py-0.5 rounded text-[10px] font-extrabold font-mono uppercase">
                              DEBIT
                            </span>
                          ) : (
                            <span className="bg-[#EAF5EE] text-[#2E9E5B] border border-[#2E9E5B]/30 px-2.5 py-0.5 rounded text-[10px] font-extrabold font-mono uppercase">
                              CREDIT
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        );

      case 'products':
        return (
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-manrope text-[#161B33]">Products & Stock Manager</h2>
                  <p className="text-xs text-[#5B6178] mt-1">Configure stock quantities, warehousing locations, and LIFO/FIFO valuation rules</p>
                </div>
                <button 
                  onClick={() => showToast('New product creation form opened.', 'success')}
                  className="bg-[#12A594] hover:bg-[#0B7A6E] text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition"
                >
                  + New Product
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E1E5EC] text-[#5B6178] font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-2">ID</th>
                      <th className="py-3 px-2">PRODUCT NAME</th>
                      <th className="py-3 px-2">CATEGORY</th>
                      <th className="py-3 px-2">BASE PRICE</th>
                      <th className="py-3 px-2 text-right">STOCK QTY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E5EC] text-[#161B33]">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-2 font-mono font-bold text-slate-700">{p.id}</td>
                        <td className="py-3 px-2 font-bold text-sm text-[#161B33]">{p.name}</td>
                        <td className="py-3 px-2 font-semibold text-slate-600">{p.category}</td>
                        <td className="py-3 px-2 font-bold font-mono text-sm">${p.price.toFixed(2)}</td>
                        <td className="py-3 px-2 text-right font-bold text-teal-600">{p.stock} units</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        );

      case 'transactions': {
        // Filter vouchers based on search & selectors
        const filteredVVs = vouchers.filter(v => {
          const matchesSearch = v.voucherId.toLowerCase().includes(txSearch.toLowerCase()) || 
                                v.voucherNumber.toLowerCase().includes(txSearch.toLowerCase()) || 
                                v.referenceNumber.toLowerCase().includes(txSearch.toLowerCase()) ||
                                v.narration.toLowerCase().includes(txSearch.toLowerCase());
          const matchesType = txTypeFilter === 'ALL' || v.voucherType === txTypeFilter;
          const matchesStatus = txStatusFilter === 'ALL' || v.status === txStatusFilter;
          const matchesDateFrom = !txDateFrom || v.date >= txDateFrom;
          const matchesDateTo = !txDateTo || v.date <= txDateTo;
          return matchesSearch && matchesType && matchesStatus && matchesDateFrom && matchesDateTo;
        });

        return (
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* WORKSPACE HEADER */}
            <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-manrope text-[#161B33]">Corporate Transactions Journal</h2>
                <p className="text-xs text-[#5B6178] mt-1">
                  Manage accounts transactions, record double-entry split vouchers, and reconcile SVB bank records.
                </p>
              </div>
              
              {/* SUB-TABS SELECTOR */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold select-none">
                <button 
                  onClick={() => { setActiveTransactionSubTab('list'); setSelectedVoucher(null); }}
                  className={`px-3 py-1.5 rounded transition ${activeTransactionSubTab === 'list' ? 'bg-[#10163A] text-white shadow-sm' : 'text-slate-600 hover:text-[#10163A]'}`}
                >
                  Vouchers Registry
                </button>
                <button 
                  onClick={() => { setActiveTransactionSubTab('create'); setSelectedVoucher(null); }}
                  className={`px-3 py-1.5 rounded transition ${activeTransactionSubTab === 'create' ? 'bg-[#10163A] text-white shadow-sm' : 'text-slate-600 hover:text-[#10163A]'}`}
                >
                  Voucher Maker (JV/PV)
                </button>
                <button 
                  onClick={() => { setActiveTransactionSubTab('reconcile'); setSelectedVoucher(null); }}
                  className={`px-3 py-1.5 rounded transition ${activeTransactionSubTab === 'reconcile' ? 'bg-[#10163A] text-white shadow-sm' : 'text-slate-600 hover:text-[#10163A]'}`}
                >
                  Bank Reconciliation
                </button>
                <button 
                  onClick={() => { setActiveTransactionSubTab('import'); setSelectedVoucher(null); }}
                  className={`px-3 py-1.5 rounded transition ${activeTransactionSubTab === 'import' ? 'bg-[#10163A] text-white shadow-sm' : 'text-slate-600 hover:text-[#10163A]'}`}
                >
                  Bulk Import
                </button>
              </div>
            </div>

            {/* TAB CONTENT: VOUCHERS LIST */}
            {activeTransactionSubTab === 'list' && (
              <div className="space-y-6">
                {/* STATUS SUMMARY STATS BAR */}
                <div className="grid grid-cols-5 gap-4">
                  <div className="bg-white border rounded-lg p-3 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-extrabold text-slate-400 uppercase">Posted Vouchers</div>
                      <div className="text-xl font-extrabold text-slate-800">{vouchers.filter(v => v.status === 'Posted').length}</div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="bg-white border rounded-lg p-3 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-extrabold text-slate-400 uppercase">Pending Approval</div>
                      <div className="text-xl font-extrabold text-slate-800">{vouchers.filter(v => v.status === 'Pending Approval').length}</div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  </div>
                  <div className="bg-white border rounded-lg p-3 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-extrabold text-slate-400 uppercase">Draft Entries</div>
                      <div className="text-xl font-extrabold text-slate-800">{vouchers.filter(v => v.status === 'Draft').length}</div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  </div>
                  <div className="bg-white border rounded-lg p-3 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-extrabold text-slate-400 uppercase">Reversals</div>
                      <div className="text-xl font-extrabold text-slate-800">{vouchers.filter(v => v.status === 'Reversed').length}</div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  </div>
                  <div className="bg-white border rounded-lg p-3 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="text-[9px] font-extrabold text-slate-400 uppercase">Voided / Cancelled</div>
                      <div className="text-xl font-extrabold text-slate-800">{vouchers.filter(v => v.status === 'Cancelled').length}</div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  </div>
                </div>

                <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-4">
                  {/* SEARCH AND ADVANCED FILTERS BAR */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                    <div className="relative">
                      <FiSearch className="absolute left-2.5 top-2.5 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search ID, Ref, Narration..."
                        value={txSearch}
                        onChange={e => setTxSearch(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-2 border rounded font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:border-[#12A594] outline-none transition"
                      />
                    </div>
                    <div>
                      <select 
                        value={txTypeFilter}
                        onChange={e => setTxTypeFilter(e.target.value)}
                        className="w-full p-2 border rounded font-semibold text-slate-800 bg-white"
                      >
                        <option value="ALL">All Voucher Types</option>
                        <option value="Journal Voucher">Journal Voucher (JV)</option>
                        <option value="Payment">Payment Voucher (PV)</option>
                        <option value="Receipt">Receipt Voucher (RV)</option>
                        <option value="Contra">Contra Voucher</option>
                        <option value="Sales">Sales Voucher</option>
                        <option value="Purchase">Purchase Voucher</option>
                        <option value="Debit Note">Debit Note</option>
                        <option value="Credit Note">Credit Note</option>
                        <option value="Depreciation">Depreciation</option>
                        <option value="Opening Balance">Opening Balance</option>
                      </select>
                    </div>
                    <div>
                      <select 
                        value={txStatusFilter}
                        onChange={e => setTxStatusFilter(e.target.value)}
                        className="w-full p-2 border rounded font-semibold text-slate-800 bg-white"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="Draft">Draft</option>
                        <option value="Pending Approval">Pending Approval</option>
                        <option value="Posted">Posted</option>
                        <option value="Reversed">Reversed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <input 
                        type="date"
                        value={txDateFrom}
                        onChange={e => setTxDateFrom(e.target.value)}
                        className="w-full p-2 border rounded font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:border-[#12A594] outline-none"
                      />
                    </div>
                    <div>
                      <input 
                        type="date"
                        value={txDateTo}
                        onChange={e => setTxDateTo(e.target.value)}
                        className="w-full p-2 border rounded font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:border-[#12A594] outline-none"
                      />
                    </div>
                  </div>

                  {/* REGISTRY JOURNAL TABLE */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#E1E5EC] text-[#5B6178] font-extrabold uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-2">VOUCHER ID</th>
                          <th className="py-3 px-2">DATE</th>
                          <th className="py-3 px-2">VOUCHER TYPE</th>
                          <th className="py-3 px-2">NARATIVE</th>
                          <th className="py-3 px-2">REFERENCE</th>
                          <th className="py-3 px-2 text-right">TOTAL AMOUNT</th>
                          <th className="py-3 px-2 text-center">ATTACHMENTS</th>
                          <th className="py-3 px-2 text-right">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E1E5EC] text-[#161B33]">
                        {filteredVVs.map(v => (
                          <tr 
                            key={v.voucherId} 
                            onClick={() => setSelectedVoucher(v)}
                            className="hover:bg-slate-50 cursor-pointer transition"
                          >
                            <td className="py-3 px-2 font-mono font-bold text-slate-700">{v.voucherId}</td>
                            <td className="py-3 px-2 font-semibold text-slate-500">{v.date}</td>
                            <td className="py-3 px-2 font-bold text-slate-700">
                              <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold uppercase text-[9px] border">
                                {v.voucherType}
                              </span>
                            </td>
                            <td className="py-3 px-2 font-bold text-slate-800 max-w-xs truncate">{v.narration}</td>
                            <td className="py-3 px-2 font-semibold text-slate-600">{v.referenceNumber || '--'}</td>
                            <td className="py-3 px-2 font-bold font-mono text-sm text-right">${v.totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                            <td className="py-3 px-2 text-center">
                              {v.attachments.length > 0 ? (
                                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold text-[9px]">
                                  {v.attachments.length} doc
                                </span>
                              ) : (
                                <span className="text-slate-300 font-bold">--</span>
                              )}
                            </td>
                            <td className="py-3 px-2 text-right">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold font-mono uppercase ${
                                v.status === 'Posted' ? 'bg-[#EAF5EE] text-[#2E9E5B] border border-[#2E9E5B]/30' :
                                v.status === 'Pending Approval' ? 'bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/30' :
                                v.status === 'Draft' ? 'bg-slate-100 text-slate-600 border border-slate-300/30' :
                                v.status === 'Reversed' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                'bg-rose-50 text-rose-600 border border-rose-200'
                              }`}>
                                {v.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {filteredVVs.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                              No journal vouchers found matching your filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: VOUCHER CREATOR */}
            {activeTransactionSubTab === 'create' && (
              <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-6">
                <div className="border-b pb-4">
                  <h3 className="font-extrabold text-base text-slate-900 font-manrope">Record Double Entry Split Voucher</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Dual balance validation check, budget check, and maker-checker limits apply.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs font-semibold text-slate-700">
                  <div>
                    <label className="block mb-1.5 uppercase tracking-wide text-[10px] font-extrabold">Voucher Type</label>
                    <select 
                      value={formVoucherType} 
                      onChange={e => setFormVoucherType(e.target.value as any)}
                      className="w-full p-2 border rounded font-bold bg-white text-slate-800"
                    >
                      <option value="Journal Voucher">Journal Voucher (JV)</option>
                      <option value="Payment">Payment Voucher (PV)</option>
                      <option value="Receipt">Receipt Voucher (RV)</option>
                      <option value="Contra">Contra Voucher</option>
                      <option value="Sales">Sales Voucher</option>
                      <option value="Purchase">Purchase Voucher</option>
                      <option value="Debit Note">Debit Note</option>
                      <option value="Credit Note">Credit Note</option>
                      <option value="Depreciation">Depreciation</option>
                      <option value="Opening Balance">Opening Balance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5 uppercase tracking-wide text-[10px] font-extrabold">Voucher Date</label>
                    <input 
                      type="date" 
                      value={formVoucherDate}
                      onChange={e => setFormVoucherDate(e.target.value)}
                      className="w-full p-2 border rounded text-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 uppercase tracking-wide text-[10px] font-extrabold">Reference Number</label>
                    <input 
                      type="text" 
                      placeholder="e.g. REF-2026-X" 
                      value={formVoucherRef}
                      onChange={e => setFormVoucherRef(e.target.value)}
                      className="w-full p-2 border rounded text-slate-800 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 uppercase tracking-wide text-[10px] font-extrabold">Currency</label>
                    <select 
                      value={formVoucherCurrency} 
                      onChange={e => setFormVoucherCurrency(e.target.value)}
                      className="w-full p-2 border rounded bg-white text-slate-800 font-bold"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1.5 uppercase tracking-wide text-[10px] font-extrabold">Exchange Rate</label>
                    <input 
                      type="number" 
                      value={formVoucherExchangeRate}
                      onChange={e => setFormVoucherExchangeRate(Number(e.target.value))}
                      className="w-full p-2 border rounded text-slate-800 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block mb-1.5 uppercase tracking-wide text-[10px] font-extrabold text-slate-700">Narration / Description</label>
                  <input 
                    type="text" 
                    placeholder="Enter details of accounting voucher transaction description..." 
                    value={formVoucherNarration}
                    onChange={e => setFormVoucherNarration(e.target.value)}
                    className="w-full p-2.5 border rounded font-semibold text-slate-800 outline-none focus:border-[#12A594]"
                  />
                </div>

                {/* MULTI-LINE SPLIT BUILDER */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-800 border-b pb-2 uppercase tracking-wide">Ledger Splits</div>
                  <div className="space-y-3">
                    {formVoucherLines.map((line, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs items-center">
                        <div className="md:col-span-5">
                          <label className="block mb-1 text-[9px] uppercase font-bold text-slate-400">Ledger Account</label>
                          <select 
                            value={line.accountId}
                            onChange={e => {
                              const updated = [...formVoucherLines];
                              updated[index].accountId = Number(e.target.value);
                              setFormVoucherLines(updated);
                            }}
                            className="w-full p-2 border rounded font-bold bg-white text-slate-800"
                          >
                            {ledgers.map(l => (
                              <option key={l.id} value={l.id}>{l.code} - {l.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block mb-1 text-[9px] uppercase font-bold text-slate-400">Debit ($)</label>
                          <input 
                            type="number" 
                            placeholder="0.00"
                            value={line.debitAmount || ''}
                            onChange={e => {
                              const updated = [...formVoucherLines];
                              updated[index].debitAmount = Number(e.target.value);
                              updated[index].creditAmount = 0; // double entry safety
                              setFormVoucherLines(updated);
                            }}
                            className="w-full p-2 border rounded font-mono font-bold text-emerald-600 outline-none"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block mb-1 text-[9px] uppercase font-bold text-slate-400">Credit ($)</label>
                          <input 
                            type="number" 
                            placeholder="0.00"
                            value={line.creditAmount || ''}
                            onChange={e => {
                              const updated = [...formVoucherLines];
                              updated[index].creditAmount = Number(e.target.value);
                              updated[index].debitAmount = 0; // double entry safety
                              setFormVoucherLines(updated);
                            }}
                            className="w-full p-2 border rounded font-mono font-bold text-rose-500 outline-none"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block mb-1 text-[9px] uppercase font-bold text-slate-400">Narration</label>
                          <input 
                            type="text" 
                            placeholder="Splits detail"
                            value={line.lineNarration}
                            onChange={e => {
                              const updated = [...formVoucherLines];
                              updated[index].lineNarration = e.target.value;
                              setFormVoucherLines(updated);
                            }}
                            className="w-full p-2 border rounded font-semibold text-slate-700"
                          />
                        </div>
                        <div className="md:col-span-1 text-center pt-4 md:pt-0">
                          {formVoucherLines.length > 2 && (
                            <button 
                              onClick={() => setFormVoucherLines(formVoucherLines.filter((_, i) => i !== index))}
                              className="text-slate-400 hover:text-rose-500 text-lg transition p-1"
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setFormVoucherLines([...formVoucherLines, { accountId: 1, debitAmount: 0, creditAmount: 0, lineNarration: '' }])}
                    className="text-[#12A594] hover:text-[#0B7A6E] font-bold text-xs flex items-center gap-1 mt-2.5 transition"
                  >
                    <FiPlus /> Add Line Item Split
                  </button>
                </div>

                {/* PARITY VALIDATOR PANEL */}
                {(() => {
                  const totDr = formVoucherLines.reduce((sum, l) => sum + Number(l.debitAmount || 0), 0);
                  const totCr = formVoucherLines.reduce((sum, l) => sum + Number(l.creditAmount || 0), 0);
                  const diff = totDr - totCr;
                  const isBalanced = diff === 0 && totDr > 0;

                  return (
                    <div className="bg-slate-50 border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                      <div className="flex gap-6">
                        <div>
                          <span className="font-semibold text-slate-500 uppercase text-[9px] block">Total Debits</span>
                          <span className="font-extrabold font-mono text-sm text-emerald-600">${totDr.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-500 uppercase text-[9px] block">Total Credits</span>
                          <span className="font-extrabold font-mono text-sm text-rose-500">${totCr.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-500 uppercase text-[9px] block">Parity Balance</span>
                          <span className={`font-extrabold font-mono text-sm ${diff === 0 ? 'text-slate-600' : 'text-rose-600'}`}>
                            ${diff.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      <div>
                        {isBalanced ? (
                          <div className="bg-[#EAF5EE] text-[#2E9E5B] border border-[#2E9E5B]/20 rounded px-3 py-1 font-bold flex items-center gap-1.5">
                            <FiCheckCircle /> Ledger Splits Balanced
                          </div>
                        ) : (
                          <div className="bg-rose-50 text-rose-600 border border-rose-200 rounded px-3 py-1 font-bold flex items-center gap-1.5">
                            <FiXCircle /> Ledger Splits Unbalanced
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* FORM CONTROLS */}
                <div className="flex justify-end gap-2.5 pt-4 border-t">
                  <button 
                    onClick={() => handleCreateCustomVoucher('Draft')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded text-xs font-bold transition"
                  >
                    Save as Draft
                  </button>
                  <button 
                    onClick={() => handleCreateCustomVoucher('Pending Approval')}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded text-xs font-bold transition"
                  >
                    Submit for Approval
                  </button>
                  <button 
                    onClick={() => handleCreateCustomVoucher('Posted')}
                    className="bg-[#12A594] hover:bg-[#0B7A6E] text-white px-5 py-2 rounded text-xs font-extrabold transition"
                  >
                    Post Voucher
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT: BANK RECONCILIATION */}
            {activeTransactionSubTab === 'reconcile' && (
              <div className="space-y-6">
                <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm">
                  <h3 className="font-extrabold text-base text-slate-900 font-manrope">SVB Bank Statements Matching Feed</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Match external bank feeds against posted ledger transactions.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* LEFT: EXTERNAL BANK FEED */}
                  <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-5 shadow-sm space-y-4">
                    <div className="font-extrabold text-xs text-slate-800 border-b pb-2 flex justify-between items-center">
                      <span>EXTERNAL BANK FEED</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
                        {reconRecords.filter(r => r.status === 'Unmatched').length} Unmatched
                      </span>
                    </div>

                    <div className="space-y-3">
                      {reconRecords.map(r => (
                        <div 
                          key={r.reconId}
                          className={`p-3 border rounded-lg flex items-center justify-between text-xs transition ${
                            r.status === 'Matched' ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 hover:bg-white border-slate-200 shadow-sm'
                          }`}
                        >
                          <div>
                            <div className="font-extrabold text-slate-900">{r.description}</div>
                            <div className="flex gap-2 text-[10px] font-bold text-slate-400 mt-1 font-mono">
                              <span>DATE: {r.date}</span>
                              <span>•</span>
                              <span>ID: STMT-{r.reconId}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-right">
                            <div>
                              <div className={`font-extrabold font-mono text-sm ${r.type === 'Deposit' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                {r.type === 'Deposit' ? '+' : '-'}${r.amount.toLocaleString()}
                              </div>
                              <span className={`text-[9px] font-bold uppercase ${r.status === 'Matched' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {r.status}
                              </span>
                            </div>

                            {r.status === 'Unmatched' && (
                              <button 
                                onClick={() => {
                                  // Auto-match mock action
                                  setReconRecords(reconRecords.map(item => item.reconId === r.reconId ? { ...item, status: 'Matched' as const } : item));
                                  showToast(`Statement line STMT-${r.reconId} reconciled successfully!`, 'success');
                                }}
                                className="bg-[#12A594] hover:bg-[#0B7A6E] text-white font-extrabold px-2.5 py-1 rounded text-[10px] transition"
                              >
                                Match
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT: LEDGER BANK POSTINGS */}
                  <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-5 shadow-sm space-y-4">
                    <div className="font-extrabold text-xs text-slate-800 border-b pb-2">
                      POSTED BANK LEDGER TRANSACTIONS (ACT-10003)
                    </div>

                    <div className="space-y-3">
                      {vouchers
                        .filter(v => v.status === 'Posted' && v.lines.some(l => l.accountId === 1))
                        .map(v => {
                          const bankLine = v.lines.find(l => l.accountId === 1);
                          const isMatched = reconRecords.some(r => r.matchedVoucherId === v.voucherId);

                          return (
                            <div 
                              key={v.voucherId}
                              className={`p-3 border rounded-lg flex items-center justify-between text-xs ${
                                isMatched ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div>
                                <div className="font-extrabold text-slate-800">{v.narration}</div>
                                <div className="flex gap-2 text-[10px] font-bold text-slate-400 mt-1 font-mono">
                                  <span>ID: {v.voucherId}</span>
                                  <span>•</span>
                                  <span>NO: {v.voucherNumber}</span>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="font-bold font-mono text-slate-700">
                                  ${(bankLine?.debitAmount || bankLine?.creditAmount || 0).toLocaleString()}
                                </div>
                                <span className={`text-[9px] font-bold uppercase ${isMatched ? 'text-emerald-600' : 'text-slate-400'}`}>
                                  {isMatched ? 'Reconciled' : 'Unmatched'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: BULK IMPORT */}
            {activeTransactionSubTab === 'import' && (
              <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-5">
                <div className="border-b pb-3">
                  <h3 className="font-extrabold text-base text-slate-900 font-manrope">CSV/Excel Bulk Voucher Ingestion</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Download the company templates, populate columns, and validate splits before batch ingestion.</p>
                </div>

                <div className="bg-slate-50 border rounded-lg p-6 flex flex-col items-center justify-center border-dashed py-10 space-y-4">
                  <FiFileText className="text-3xl text-slate-400 animate-bounce" />
                  <div className="text-center">
                    <span className="font-extrabold text-slate-800 block text-xs">Drag and drop files here or click to browse</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">Supports .csv, .xlsx formatted journal uploads</span>
                  </div>
                  <button 
                    onClick={() => {
                      showToast('Simulating bulk CSV validation: verified 12 rows, 0 errors.', 'success');
                      setTimeout(() => {
                        showToast('Batch Import complete: 3 Vouchers loaded.', 'success');
                      }, 1000);
                    }}
                    className="bg-[#12A594] hover:bg-[#0B7A6E] text-white px-4 py-2 rounded text-xs font-bold transition"
                  >
                    Select CSV File Template
                  </button>
                </div>

                <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded p-4 text-xs font-semibold flex items-start gap-2">
                  <FiInfo className="text-sm mt-0.5 shrink-0" />
                  <div>
                    <span className="font-extrabold block uppercase text-[10px]">Data Ingestion Controls</span>
                    The batch processor automatically runs balancing audits (Total Debits == Total Credits) and period-lock validations before committing uploads to the general ledger repository database.
                  </div>
                </div>
              </div>
            )}

            {/* DRILL-DOWN OVERLAY / VOUCHER STUB DRAWER */}
            {selectedVoucher && (
              <div className="fixed inset-0 z-[9999] overflow-hidden">
                <div 
                  onClick={() => setSelectedVoucher(null)}
                  className="absolute inset-0 bg-[#10163A]/50 backdrop-blur-sm transition-opacity duration-300"
                ></div>
                
                <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                  <div className="w-screen max-w-xl bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between animate-slide-in">
                    {/* Drawer Header */}
                    <div className="p-6 border-b border-slate-100 bg-[#10163A] text-white flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-base tracking-wider uppercase font-manrope">{selectedVoucher.voucherNumber}</span>
                          <span className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase font-bold ${
                            selectedVoucher.status === 'Posted' ? 'bg-[#EAF5EE] text-[#2E9E5B] border border-[#2E9E5B]/30' :
                            selectedVoucher.status === 'Pending Approval' ? 'bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/30' :
                            'bg-slate-500/20 text-slate-300'
                          }`}>
                            {selectedVoucher.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wide mt-1">
                          VOUCHER DETAILS & AUDIT TRACE
                        </p>
                      </div>
                      <button 
                        onClick={() => setSelectedVoucher(null)}
                        className="text-white hover:text-rose-400 font-extrabold text-lg p-1 transition"
                      >
                        <FiX />
                      </button>
                    </div>

                    {/* Drawer Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800">
                      {/* HEADER SUMMARY METRICS */}
                      <div className="grid grid-cols-3 gap-3 bg-slate-50 border p-3.5 rounded-lg">
                        <div>
                          <span className="font-semibold text-slate-400 uppercase text-[9px] block">Voucher Type</span>
                          <span className="font-extrabold text-slate-800 uppercase">{selectedVoucher.voucherType}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400 uppercase text-[9px] block">Posting Date</span>
                          <span className="font-bold text-slate-800">{selectedVoucher.date}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400 uppercase text-[9px] block">Total Amount</span>
                          <span className="font-extrabold font-mono text-slate-800 text-sm">${selectedVoucher.totalDebit.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* DETAILS PANEL */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[9px] font-bold uppercase text-slate-400 block">Created By</span>
                            <span className="font-semibold text-slate-700">{selectedVoucher.createdBy}</span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold uppercase text-slate-400 block">Reference No</span>
                            <span className="font-mono font-bold text-slate-700">{selectedVoucher.referenceNumber || 'N/A'}</span>
                          </div>
                        </div>
                        <div className="pt-2">
                          <span className="text-[9px] font-bold uppercase text-slate-400 block">General Narration</span>
                          <p className="font-semibold text-slate-700 leading-relaxed bg-slate-50/50 p-2 border rounded">{selectedVoucher.narration}</p>
                        </div>
                      </div>

                      {/* DOUBLE ENTRY LEDGER SPLITS TABLE */}
                      <div className="space-y-2.5">
                        <span className="text-[10px] font-extrabold uppercase text-slate-800 block">Ledger Account Splits</span>
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-100 border-b text-slate-600 font-bold uppercase text-[9px] tracking-wide">
                                <th className="py-2.5 px-3">ACCOUNT</th>
                                <th className="py-2.5 px-3 text-right">DEBIT</th>
                                <th className="py-2.5 px-3 text-right">CREDIT</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y text-slate-700 font-semibold font-mono">
                              {selectedVoucher.lines.map((line, idx) => {
                                const acc = ledgers.find(l => l.id === line.accountId);
                                return (
                                  <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="py-2.5 px-3">
                                      <span className="bg-[#10163A] text-white px-2 py-0.5 rounded text-[10px] font-bold mr-2">
                                        {acc?.code}
                                      </span>
                                      <span className="text-slate-800 font-sans font-bold">{acc?.name}</span>
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-emerald-600">
                                      {line.debitAmount > 0 ? `$${line.debitAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '--'}
                                    </td>
                                    <td className="py-2.5 px-3 text-right text-rose-500">
                                      {line.creditAmount > 0 ? `$${line.creditAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '--'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* ATTACHED DOCUMENTS LIST */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold uppercase text-slate-800 block">Attached Support Documents</span>
                        {selectedVoucher.attachments.length > 0 ? (
                          <div className="space-y-1.5">
                            {selectedVoucher.attachments.map((file, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-slate-50 border p-2 rounded-lg font-semibold text-indigo-700">
                                <FiFileText />
                                <span className="flex-1 truncate">{file}</span>
                                <button className="text-slate-400 hover:text-[#12A594] text-xs font-bold uppercase tracking-wide">Download</button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-slate-400 font-semibold italic">No source supporting files attached to this voucher.</div>
                        )}
                      </div>

                      {/* AUDIT LOG & HISTORICAL VERSIONING */}
                      <div className="space-y-3 border-t pt-4">
                        <span className="text-[10px] font-extrabold uppercase text-slate-800 block">Audit Log / Work Activity Logs</span>
                        <div className="relative border-l-2 border-slate-200 pl-4 space-y-4">
                          {selectedVoucher.history.map((log, index) => (
                            <div key={index} className="relative text-xs">
                              <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[#12A594]"></span>
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold text-[#10163A] uppercase text-[10px]">{log.action}</span>
                                <span className="text-[10px] text-slate-400 font-bold font-mono">{log.performedAt.slice(0,16).replace('T',' ')}</span>
                              </div>
                              <p className="text-slate-500 font-semibold mt-0.5">Performed by {log.performedBy} {log.details ? `(${log.details})` : ''}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Drawer Footer Actions */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2.5">
                      {selectedVoucher.status === 'Pending Approval' && (
                        <button 
                          onClick={() => handleApproveVoucher(selectedVoucher.voucherId)}
                          className="flex-1 bg-[#12A594] hover:bg-[#0B7A6E] text-white py-2 rounded font-bold transition text-center"
                        >
                          Approve Voucher
                        </button>
                      )}
                      
                      {selectedVoucher.status === 'Posted' && (
                        <button 
                          onClick={() => handleReverseVoucher(selectedVoucher.voucherId)}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-bold transition text-center"
                        >
                          Reverse Entry (Mirror Void)
                        </button>
                      )}

                      {(selectedVoucher.status === 'Draft' || selectedVoucher.status === 'Pending Approval') && (
                        <button 
                          onClick={() => {
                            const reason = prompt('Reason for cancelling this voucher:', 'Duplicate entry adjustment');
                            if (reason) handleCancelVoucher(selectedVoucher.voucherId, reason);
                          }}
                          className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2 rounded font-bold transition text-center"
                        >
                          Cancel/Void Entry
                        </button>
                      )}

                      <button 
                        onClick={() => {
                          setSelectedVoucher(null);
                          window.print();
                        }}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded font-semibold transition text-center"
                      >
                        Print Stub
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        );
      }

      case 'payroll': {
        const activeRun = payrollRuns.find(r => r.runId === selectedPayrollRunId);
        
        return (
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* WORKSPACE HEADER */}
            <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-manrope text-[#161B33]">HR & Payroll Manager Workspace</h2>
                <p className="text-xs text-[#5B6178] mt-1">
                  Manage salary bands, define pay structures, calculate monthly payroll, run compliance checks, and auto-post JVs.
                </p>
              </div>

              {/* TAB SELECTOR */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold select-none">
                <button 
                  onClick={() => { setActivePayrollTab('employees'); setSelectedPayrollRunId(null); }}
                  className={`px-3 py-1.5 rounded transition ${activePayrollTab === 'employees' ? 'bg-[#10163A] text-white shadow-sm' : 'text-slate-600 hover:text-[#10163A]'}`}
                >
                  Employee Directory
                </button>
                <button 
                  onClick={() => { setActivePayrollTab('structure'); setSelectedPayrollRunId(null); }}
                  className={`px-3 py-1.5 rounded transition ${activePayrollTab === 'structure' ? 'bg-[#10163A] text-white shadow-sm' : 'text-slate-600 hover:text-[#10163A]'}`}
                >
                  Compensation Structures
                </button>
                <button 
                  onClick={() => { setActivePayrollTab('runs'); setSelectedPayrollRunId(null); }}
                  className={`px-3 py-1.5 rounded transition ${activePayrollTab === 'runs' ? 'bg-[#10163A] text-white shadow-sm' : 'text-slate-600 hover:text-[#10163A]'}`}
                >
                  Payroll Runs
                </button>
                <button 
                  onClick={() => { setActivePayrollTab('loans'); setSelectedPayrollRunId(null); }}
                  className={`px-3 py-1.5 rounded transition ${activePayrollTab === 'loans' ? 'bg-[#10163A] text-white shadow-sm' : 'text-slate-600 hover:text-[#10163A]'}`}
                >
                  Loans & Advances
                </button>
                <button 
                  onClick={() => { setActivePayrollTab('compliance'); setSelectedPayrollRunId(null); }}
                  className={`px-3 py-1.5 rounded transition ${activePayrollTab === 'compliance' ? 'bg-[#10163A] text-white shadow-sm' : 'text-slate-600 hover:text-[#10163A]'}`}
                >
                  Statutory & Compliance
                </button>
              </div>
            </div>

            {/* SUB-TAB: EMPLOYEE DIRECTORY */}
            {activePayrollTab === 'employees' && (
              <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-[#161B33] font-manrope">Active Corporate Employees</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Manage bank account profiles, statutory ID numbers (PF/ESI/PAN), and tax regimes.</p>
                  </div>
                  <button 
                    onClick={() => setShowNewEmployeeModal(true)}
                    className="bg-[#12A594] hover:bg-[#0B7A6E] text-white px-3 py-1.5 rounded text-xs font-bold transition"
                  >
                    + Add Employee
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E1E5EC] text-[#5B6178] font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-2">EMPLOYEE ID</th>
                        <th className="py-3 px-2">NAME</th>
                        <th className="py-3 px-2">DEPARTMENT</th>
                        <th className="py-3 px-2">DESIGNATION</th>
                        <th className="py-3 px-2">BANK DETAILS</th>
                        <th className="py-3 px-2">TAX REGIME</th>
                        <th className="py-3 px-2">PF/ESI IDS</th>
                        <th className="py-3 px-2 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E5EC] text-[#161B33] font-semibold">
                      {employees.map(emp => (
                        <tr key={emp.employeeId} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-2 font-mono font-bold text-slate-700">{emp.employeeId}</td>
                          <td className="py-3 px-2 font-bold text-slate-800">{emp.name}</td>
                          <td className="py-3 px-2 text-slate-600">{emp.departmentId}</td>
                          <td className="py-3 px-2 text-slate-500">{emp.designation}</td>
                          <td className="py-3 px-2 font-mono text-[11px] text-slate-600">
                            {emp.bankAccountNo ? (
                              <div>
                                <div>A/C: {emp.bankAccountNo}</div>
                                <div className="text-[10px] text-slate-400">IFSC: {emp.ifscCode}</div>
                              </div>
                            ) : (
                              <span className="text-rose-500 font-bold uppercase text-[9px] bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Missing Details</span>
                            )}
                          </td>
                          <td className="py-3 px-2 font-bold text-[10px] uppercase text-slate-700">
                            <span className="bg-slate-100 border px-2 py-0.5 rounded">
                              {emp.taxRegime} Regime
                            </span>
                          </td>
                          <td className="py-3 px-2 font-mono text-[10px] text-slate-500">
                            <div>PF: {emp.pfNumber}</div>
                            <div>ESI: {emp.esiNumber}</div>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <span className="bg-[#EAF5EE] text-[#2E9E5B] border border-[#2E9E5B]/20 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono">
                              {emp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-TAB: COMPENSATION STRUCTURE */}
            {activePayrollTab === 'structure' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* LEFT LIST */}
                <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-5 shadow-sm space-y-4">
                  <div className="font-extrabold text-xs text-slate-800 border-b pb-2 uppercase tracking-wide">
                    Select Employee
                  </div>
                  <div className="space-y-2">
                    {employees.map(emp => (
                      <div 
                        key={emp.employeeId}
                        onClick={() => setSelectedPayrollEmployeeId(emp.employeeId)}
                        className={`p-3 border rounded-lg cursor-pointer transition text-xs flex justify-between items-center ${
                          selectedPayrollEmployeeId === emp.employeeId ? 'bg-indigo-50 border-indigo-300 shadow-sm' : 'hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-800">{emp.name}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">{emp.designation} • {emp.departmentId}</div>
                        </div>
                        <span className="font-mono font-bold text-slate-500 text-[10px]">{emp.employeeId}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT STRUCTURE DETAILS */}
                {(() => {
                  const emp = employees.find(e => e.employeeId === selectedPayrollEmployeeId);
                  const struct = salaryStructures.find(s => s.employeeId === selectedPayrollEmployeeId);
                  if (!emp || !struct) return null;

                  const basicComp = struct.components.find(c => c.componentName === 'Basic')?.value || 0;
                  
                  // Calculate split components
                  let totalEarnings = 0;
                  let totalDeductions = 0;

                  struct.components.forEach(c => {
                    let val = c.value;
                    if (c.calculationType === 'percentage' && c.calculationBase === 'Basic') {
                      val = (basicComp * c.value) / 100;
                    }
                    if (c.componentType === 'earning') totalEarnings += val;
                    else totalDeductions += val;
                  });

                  // Employer PF
                  const daComp = struct.components.find(c => c.componentName === 'DA')?.value || 0;
                  const daVal = (basicComp * daComp) / 100;
                  const employerPFVal = ((basicComp + daVal) * 12) / 100;
                  const totalCTC = totalEarnings + employerPFVal;

                  return (
                    <div className="md:col-span-2 bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-6">
                      <div className="border-b pb-4 flex justify-between items-start">
                        <div>
                          <h3 className="font-extrabold text-base text-[#161B33] font-manrope">Salary Structure: {emp.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Designation: {emp.designation} • Regime: {emp.taxRegime.toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Cost to Company (CTC)</span>
                          <span className="font-extrabold text-lg text-slate-800 font-mono">${Math.round(totalCTC).toLocaleString()}/mo</span>
                        </div>
                      </div>

                      {/* COMPENSATION MATRIX COMPONENTS */}
                      <div className="space-y-4">
                        <div className="font-extrabold text-xs text-slate-800 uppercase tracking-wide border-b pb-1.5">Earnings Components</div>
                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                          {struct.components.filter(c => c.componentType === 'earning').map((c, idx) => {
                            let calculatedValue = c.value;
                            if (c.calculationType === 'percentage' && c.calculationBase === 'Basic') {
                              calculatedValue = (basicComp * c.value) / 100;
                            }
                            return (
                              <div key={idx} className="flex justify-between border-b pb-2 border-slate-100">
                                <div>
                                  <span className="font-bold text-slate-700">{c.componentName}</span>
                                  {c.calculationType === 'percentage' && (
                                    <span className="text-[9px] text-slate-400 font-mono ml-2">({c.value}% of {c.calculationBase})</span>
                                  )}
                                </div>
                                <span className="font-bold font-mono text-slate-800">${calculatedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="font-extrabold text-xs text-slate-800 uppercase tracking-wide border-b pb-1.5 pt-2">Deduction & Tax Contributions</div>
                        <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                          {struct.components.filter(c => c.componentType === 'deduction').map((c, idx) => {
                            let calculatedValue = c.value;
                            if (c.calculationType === 'percentage' && c.calculationBase === 'Basic+DA') {
                              const daComp = struct.components.find(comp => comp.componentName === 'DA')?.value || 0;
                              const daVal = (basicComp * daComp) / 100;
                              calculatedValue = ((basicComp + daVal) * c.value) / 100;
                            }
                            return (
                              <div key={idx} className="flex justify-between border-b pb-2 border-slate-100">
                                <div>
                                  <span className="font-bold text-rose-600">{c.componentName}</span>
                                  {c.calculationType === 'percentage' && (
                                    <span className="text-[9px] text-slate-400 font-mono ml-2">({c.value}% of {c.calculationBase})</span>
                                  )}
                                </div>
                                <span className="font-bold font-mono text-rose-500">-${calculatedValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* CTC SUMMARY BAR */}
                      <div className="bg-slate-50 border rounded-lg p-4 grid grid-cols-4 gap-4 text-xs font-semibold text-center">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Gross Earnings</span>
                          <span className="text-sm font-extrabold text-slate-800 font-mono">${Math.round(totalEarnings).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Total Deductions</span>
                          <span className="text-sm font-extrabold text-rose-500 font-mono">-${Math.round(totalDeductions).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Employer PF</span>
                          <span className="text-sm font-extrabold text-slate-600 font-mono">${Math.round(employerPFVal).toLocaleString()}</span>
                        </div>
                        <div className="bg-emerald-50/50 border border-emerald-200 rounded p-1.5">
                          <span className="text-[9px] text-[#2E9E5B] uppercase font-bold block">Net Take-Home</span>
                          <span className="text-sm font-extrabold text-[#2E9E5B] font-mono">${Math.round(totalEarnings - totalDeductions).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t">
                        <button 
                          onClick={() => {
                            // Revision Increments
                            const raisePercent = prompt('Enter increment percentage (e.g. 5 for 5% raise):', '10');
                            if (raisePercent) {
                              const mult = 1 + Number(raisePercent) / 100;
                              const updated = struct.components.map(c => c.componentName === 'Basic' ? { ...c, value: Math.round(c.value * mult) } : c);
                              handleUpdateSalaryStructure(selectedPayrollEmployeeId, updated);
                              showToast(`Revision increments saved. Salary increased by ${raisePercent}%!`, 'success');
                            }
                          }}
                          className="bg-[#10163A] hover:bg-[#1B2456] text-white px-3.5 py-1.5 rounded text-xs font-bold transition"
                        >
                          Revise Salary Structure (Salary Revision)
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* SUB-TAB: PAYROLL RUN CYCLE */}
            {activePayrollTab === 'runs' && (
              <div className="space-y-6">
                <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-base text-[#161B33] font-manrope">Execute Payroll Cycle</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Maker-checker approval flow. Lock period controls are strictly enforced.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleCreatePayrollRun('August', '2026', 'regular')}
                      className="bg-[#12A594] hover:bg-[#0B7A6E] text-white px-4 py-2 rounded text-xs font-extrabold flex items-center gap-1.5 transition"
                    >
                      <FiRefreshCw className="animate-spin text-sm" /> Run August 2026 Payroll
                    </button>
                  </div>
                </div>

                {/* RUNS LIST */}
                <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-4">
                  <div className="font-extrabold text-xs text-slate-800 border-b pb-2 uppercase tracking-wide">
                    Historical & Active Payroll Cycles
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#E1E5EC] text-[#5B6178] font-extrabold uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-2">RUN ID</th>
                          <th className="py-3 px-2">CYCLE PERIOD</th>
                          <th className="py-3 px-2">RUN TYPE</th>
                          <th className="py-3 px-2 text-right">TOTAL GROSS</th>
                          <th className="py-3 px-2 text-right">TOTAL DEDUCTIONS</th>
                          <th className="py-3 px-2 text-right">TOTAL NET PAYABLE</th>
                          <th className="py-3 px-2 text-center">APPROVED BY</th>
                          <th className="py-3 px-2 text-right">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E1E5EC] text-[#161B33] font-semibold">
                        {payrollRuns.map(run => (
                          <tr 
                            key={run.runId} 
                            onClick={() => setSelectedPayrollRunId(run.runId)}
                            className="hover:bg-slate-50 cursor-pointer transition"
                          >
                            <td className="py-3 px-2 font-mono font-bold text-slate-700">{run.runId}</td>
                            <td className="py-3 px-2 font-bold text-slate-800">{run.periodMonth} {run.periodYear}</td>
                            <td className="py-3 px-2 uppercase text-[10px] text-slate-500 font-bold">{run.runType}</td>
                            <td className="py-3 px-2 font-mono text-right font-bold">${run.totalGross.toLocaleString()}</td>
                            <td className="py-3 px-2 font-mono text-right text-rose-500">-${run.totalDeductions.toLocaleString()}</td>
                            <td className="py-3 px-2 font-mono text-right text-[#2E9E5B] font-bold">${run.totalNet.toLocaleString()}</td>
                            <td className="py-3 px-2 text-center text-slate-600">{run.approvedBy || '--'}</td>
                            <td className="py-3 px-2 text-right">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono ${
                                run.status === 'paid' ? 'bg-[#EAF5EE] text-[#2E9E5B] border border-[#2E9E5B]/20' : 'bg-slate-100 text-slate-600 border border-slate-300'
                              }`}>
                                {run.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB: LOANS & ADVANCES */}
            {activePayrollTab === 'loans' && (
              <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-[#161B33] font-manrope">Employee Loans & Advances Repayments</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Salary advances are automatically scheduled for EMI deduction from monthly payslips.</p>
                  </div>
                  <button 
                    onClick={() => setShowNewLoanModal(true)}
                    className="bg-[#12A594] hover:bg-[#0B7A6E] text-white px-3 py-1.5 rounded text-xs font-bold transition"
                  >
                    + Request Advance Loan
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E1E5EC] text-[#5B6178] font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-2">LOAN ID</th>
                        <th className="py-3 px-2">EMPLOYEE ID</th>
                        <th className="py-3 px-2">NAME</th>
                        <th className="py-3 px-2">LOAN TYPE</th>
                        <th className="py-3 px-2 text-right">PRINCIPAL AMOUNT</th>
                        <th className="py-3 px-2 text-right">EMI DEDUCTION</th>
                        <th className="py-3 px-2 text-right">REMAINING BALANCE</th>
                        <th className="py-3 px-2 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E5EC] text-[#161B33] font-semibold">
                      {employeeLoans.map(l => {
                        const emp = employees.find(e => e.employeeId === l.employeeId);
                        return (
                          <tr key={l.loanId} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-2 font-mono font-bold text-slate-700">{l.loanId}</td>
                            <td className="py-3 px-2 font-mono text-slate-600">{l.employeeId}</td>
                            <td className="py-3 px-2 font-bold text-slate-800">{emp?.name || 'Unknown'}</td>
                            <td className="py-3 px-2 text-indigo-700 uppercase font-bold text-[10px]">{l.loanType}</td>
                            <td className="py-3 px-2 font-mono text-right font-bold">${l.principalAmount.toLocaleString()}</td>
                            <td className="py-3 px-2 font-mono text-right text-rose-500">-${l.emiAmount.toLocaleString()}/mo</td>
                            <td className="py-3 px-2 font-mono text-right font-extrabold">${l.remainingBalance.toLocaleString()}</td>
                            <td className="py-3 px-2 text-right">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono ${
                                l.status === 'active' ? 'bg-[#FFFBEB] text-[#D97706] border border-[#D97706]/20' : 'bg-[#EAF5EE] text-[#2E9E5B] border border-[#2E9E5B]/20'
                              }`}>
                                {l.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SUB-TAB: STATUTORY & COMPLIANCE */}
            {activePayrollTab === 'compliance' && (
              <div className="space-y-6">
                {/* CALENDAR DUE DATE ALERTS */}
                <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-4">
                  <div className="font-extrabold text-xs text-slate-800 border-b pb-2 uppercase tracking-wide flex items-center gap-1.5">
                    <FiCalendar className="text-[#12A594]" /> STATUTORY COMPLIANCE DEADLINES
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="border border-red-200 bg-red-50/50 p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-rose-700 text-[10px] uppercase block">PF CHALLAN FILING (AUG 2026)</span>
                        <span className="text-slate-500">Due: September 15th, 2026</span>
                      </div>
                      <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-extrabold text-[9px] uppercase border border-rose-300">Pending Run</span>
                    </div>

                    <div className="border border-indigo-200 bg-indigo-50/50 p-3 rounded-lg flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-indigo-700 text-[10px] uppercase block">TDS RETURN FILING (Q2)</span>
                        <span className="text-slate-500">Due: October 31st, 2026</span>
                      </div>
                      <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-extrabold text-[9px] uppercase border border-indigo-300">12 days left</span>
                    </div>
                  </div>
                </div>

                {/* FILINGS TABLE */}
                <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-4">
                  <div className="font-extrabold text-xs text-slate-800 border-b pb-2 uppercase tracking-wide">
                    Government Portal Filings History
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#E1E5EC] text-[#5B6178] font-extrabold uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-2">FILING ID</th>
                          <th className="py-3 px-2">TYPE</th>
                          <th className="py-3 px-2">ASSOCIATED CYCLE</th>
                          <th className="py-3 px-2">DUE DATE</th>
                          <th className="py-3 px-2">FILED DATE</th>
                          <th className="py-3 px-2">CHALLAN REFERENCE</th>
                          <th className="py-3 px-2 text-right">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E1E5EC] text-[#161B33] font-semibold font-mono">
                        {statutoryFilings.map(f => (
                          <tr key={f.filingId} className="hover:bg-slate-50 transition">
                            <td className="py-3 px-2 text-slate-700 font-bold">{f.filingId}</td>
                            <td className="py-3 px-2 text-slate-900 font-sans font-bold">
                              <span className="bg-slate-100 px-2.5 py-0.5 border rounded uppercase text-[10px]">
                                {f.filingType} filing
                              </span>
                            </td>
                            <td className="py-3 px-2 text-slate-500 font-sans font-semibold">{f.runId}</td>
                            <td className="py-3 px-2 text-slate-500">{f.dueDate}</td>
                            <td className="py-3 px-2 text-slate-600">{f.filedDate || '--'}</td>
                            <td className="py-3 px-2 text-indigo-700 font-bold">{f.challanReference || '--'}</td>
                            <td className="py-3 px-2 text-right font-sans">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                f.status === 'filed' ? 'bg-[#EAF5EE] text-[#2E9E5B] border border-[#2E9E5B]/20' : 'bg-[#FFF3EC] text-[#E2662F] border border-[#E2662F]/20'
                              }`}>
                                {f.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* PAYROLL PREVIEW DRAWER (DRILL-DOWN OVERLAY) */}
            {activeRun && (
              <div className="fixed inset-0 z-[9999] overflow-hidden">
                <div 
                  onClick={() => setSelectedPayrollRunId(null)}
                  className="absolute inset-0 bg-[#10163A]/50 backdrop-blur-sm transition-opacity duration-300"
                ></div>
                
                <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                  <div className="w-screen max-w-2xl bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between animate-slide-in">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 bg-[#10163A] text-white flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-base tracking-wider uppercase font-manrope">PAYROLL PREVIEW: {activeRun.periodMonth} {activeRun.periodYear}</span>
                          <span className="bg-slate-600/50 text-slate-200 border px-2 py-0.5 rounded text-[9px] uppercase font-bold font-mono">
                            {activeRun.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wide mt-1">
                          Audits calculations splits before ledger posting commit
                        </p>
                      </div>
                      <button 
                        onClick={() => setSelectedPayrollRunId(null)}
                        className="text-white hover:text-rose-400 font-extrabold text-lg p-1 transition"
                      >
                        <FiX />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800">
                      {/* RUN TOTAL SUMMARY PANEL */}
                      <div className="grid grid-cols-3 gap-3 bg-slate-50 border p-4 rounded-lg text-center">
                        <div>
                          <span className="font-semibold text-slate-400 uppercase text-[9px] block">Gross Cost</span>
                          <span className="font-extrabold font-mono text-slate-800 text-sm">${activeRun.totalGross.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400 uppercase text-[9px] block">Deductions Withheld</span>
                          <span className="font-extrabold font-mono text-rose-500 text-sm">-${activeRun.totalDeductions.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-400 uppercase text-[9px] block">Net Disbursements</span>
                          <span className="font-extrabold font-mono text-[#2E9E5B] text-sm">${activeRun.totalNet.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* INDIVIDUAL PAYSLIPS SPLIT LIST */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-extrabold uppercase text-slate-800 block">Calculated Payslips by Employee</span>
                        <div className="space-y-3">
                          {employees.map(emp => {
                            if (emp.status !== 'active') return null;

                            const struct = salaryStructures.find(s => s.employeeId === emp.employeeId);
                            const att = attendanceSummaries.find(a => a.employeeId === emp.employeeId) || { presentDays: 22, lopDays: 0, overtimeHours: 0 };
                            const loan = employeeLoans.find(l => l.employeeId === emp.employeeId && l.status === 'active');
                            if (!struct) return null;

                            const basicComp = struct.components.find(c => c.componentName === 'Basic')?.value || 0;
                            const lopDays = att.lopDays || 0;
                            const payMultiplier = Math.max(0, (22 - lopDays) / 22);

                            let basicVal = basicComp * payMultiplier;
                            let hraVal = 0;
                            let daVal = 0;
                            let empGross = 0;

                            struct.components.forEach(comp => {
                              if (comp.componentType === 'earning') {
                                let compVal = comp.value;
                                if (comp.calculationType === 'percentage' && comp.calculationBase === 'Basic') {
                                    compVal = (basicComp * comp.value) / 100;
                                }
                                empGross += compVal * payMultiplier;
                                if (comp.componentName === 'DA') daVal = compVal * payMultiplier;
                              }
                            });

                            if (att.overtimeHours > 0) {
                              const hourlyRate = basicComp / 22 / 8;
                              const otPay = hourlyRate * 1.5 * att.overtimeHours;
                              empGross += otPay;
                            }

                            const pfBase = basicVal + daVal;
                            const pfEmp = (pfBase * 12) / 100;
                            const tdsVal = struct.components.find(c => c.componentName === 'TDS Deduction')?.value || 0;
                            const ptVal = 200;

                            let empDeductions = pfEmp + tdsVal + ptVal;
                            let loanEMI = 0;
                            if (loan) {
                              loanEMI = Math.min(loan.emiAmount, loan.remainingBalance);
                              empDeductions += loanEMI;
                            }

                            const empNet = empGross - empDeductions;

                            return (
                              <div key={emp.employeeId} className="border rounded-lg p-3 space-y-2.5 bg-slate-50/50 hover:bg-slate-50 transition">
                                <div className="flex justify-between items-center border-b pb-1.5">
                                  <div>
                                    <span className="font-extrabold text-slate-800 text-[12px]">{emp.name}</span>
                                    <span className="text-[10px] text-slate-400 font-semibold ml-2">({emp.designation})</span>
                                  </div>
                                  <span className="font-mono font-bold text-slate-500 text-[10px]">{emp.employeeId}</span>
                                </div>
                                <div className="grid grid-cols-4 gap-2 text-[11px] font-semibold">
                                  <div>
                                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Gross Earning</span>
                                    <span className="font-mono font-bold">${Math.round(empGross).toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-400 uppercase font-bold block">PF (12%)</span>
                                    <span className="font-mono text-rose-500">-${Math.round(pfEmp).toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-slate-400 uppercase font-bold block">TDS + PT</span>
                                    <span className="font-mono text-rose-500">-${Math.round(tdsVal + ptVal).toLocaleString()}</span>
                                  </div>
                                  {loanEMI > 0 && (
                                    <div>
                                      <span className="text-[9px] text-slate-400 uppercase font-bold block">Loan EMI Deduct</span>
                                      <span className="font-mono text-rose-500">-${Math.round(loanEMI).toLocaleString()}</span>
                                    </div>
                                  )}
                                  <div className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                    <span className="text-[9px] text-[#2E9E5B] uppercase font-bold block">Net Salary Paid</span>
                                    <span className="font-mono font-bold text-[#2E9E5B]">${Math.round(empNet).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* SYSTEM COMPLIANCE ALERTS & WARNINGS */}
                      <div className="space-y-2 border-t pt-4">
                        <span className="text-[10px] font-extrabold uppercase text-slate-800 block">System Compliance Validation Checklist</span>
                        <div className="space-y-2 font-semibold">
                          <div className="border border-emerald-200 bg-emerald-50/50 p-2.5 rounded-lg flex items-center gap-2">
                            <FiCheck className="text-emerald-500 text-sm shrink-0" />
                            <span>Total Debits equal Total Credits validation check passed.</span>
                          </div>
                          <div className="border border-emerald-200 bg-emerald-50/50 p-2.5 rounded-lg flex items-center gap-2">
                            <FiCheck className="text-emerald-500 text-sm shrink-0" />
                            <span>Employee bank details (IFSC codes, accounts) are active and verified.</span>
                          </div>
                          <div className="border border-emerald-200 bg-emerald-50/50 p-2.5 rounded-lg flex items-center gap-2">
                            <FiCheck className="text-emerald-500 text-sm shrink-0" />
                            <span>Tax regime investment declarations match compliance slabs.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2.5">
                      {activeRun.status === 'draft' && (
                        <button 
                          onClick={() => handleLockAndDisbursePayroll(activeRun.runId)}
                          className="flex-1 bg-[#12A594] hover:bg-[#0B7A6E] text-white py-2.5 rounded font-extrabold transition text-center"
                        >
                          Lock Period, Approve & Auto-Post JV
                        </button>
                      )}
                      {activeRun.status === 'paid' && (
                        <div className="w-full bg-[#EAF5EE] text-[#2E9E5B] border border-[#2E9E5B]/20 py-2.5 rounded font-bold text-center">
                          Payroll cycle approved, disbursed & posted to transactions journal ledger.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL: ADD NEW EMPLOYEE */}
            {showNewEmployeeModal && (
              <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-extrabold text-base font-manrope text-slate-900 flex items-center gap-1.5">
                      <FiPlus className="text-[#12A594]" /> Add New Employee Profile
                    </h3>
                    <button onClick={() => setShowNewEmployeeModal(false)} className="text-slate-400 hover:text-slate-700">
                      <FiX />
                    </button>
                  </div>
                  <form onSubmit={handleCreateEmployee} className="space-y-3 text-xs font-semibold text-slate-700">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Employee ID</label>
                        <input 
                          type="text" 
                          value={newEmpId} 
                          disabled
                          className="w-full p-2 border rounded font-mono font-bold bg-slate-100" 
                        />
                      </div>
                      <div>
                        <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Employee Name</label>
                        <input 
                          type="text" 
                          value={newEmpName} 
                          onChange={e => setNewEmpName(e.target.value)} 
                          placeholder="e.g. John Doe"
                          className="w-full p-2 border rounded text-slate-800" 
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Department</label>
                        <select 
                          value={newEmpDept} 
                          onChange={e => setNewEmpDept(e.target.value)}
                          className="w-full p-2 border rounded bg-white text-slate-800"
                        >
                          <option value="Engineering">Engineering</option>
                          <option value="Finance">Finance</option>
                          <option value="Sales">Sales</option>
                          <option value="HR & Admin">HR & Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Designation</label>
                        <input 
                          type="text" 
                          value={newEmpDesg} 
                          onChange={e => setNewEmpDesg(e.target.value)} 
                          placeholder="e.g. Senior Backend Engineer"
                          className="w-full p-2 border rounded text-slate-800" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Bank Account Number</label>
                        <input 
                          type="text" 
                          value={newEmpBank} 
                          onChange={e => setNewEmpBank(e.target.value)} 
                          placeholder="e.g. 5002931082"
                          className="w-full p-2 border rounded text-slate-800 font-mono" 
                          required
                        />
                      </div>
                      <div>
                        <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">IFSC Code</label>
                        <input 
                          type="text" 
                          value={newEmpIfsc} 
                          onChange={e => setNewEmpIfsc(e.target.value)} 
                          placeholder="e.g. SVB0000123"
                          className="w-full p-2 border rounded text-slate-800 font-mono" 
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">PAN Number</label>
                        <input 
                          type="text" 
                          value={newEmpPan} 
                          onChange={e => setNewEmpPan(e.target.value)} 
                          placeholder="ABCDE1234F"
                          className="w-full p-2 border rounded text-slate-800 font-mono" 
                        />
                      </div>
                      <div>
                        <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">PF Number</label>
                        <input 
                          type="text" 
                          value={newEmpPf} 
                          onChange={e => setNewEmpPf(e.target.value)} 
                          placeholder="PF/XX/10293"
                          className="w-full p-2 border rounded text-slate-800 font-mono" 
                        />
                      </div>
                      <div>
                        <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">ESI Number</label>
                        <input 
                          type="text" 
                          value={newEmpEsi} 
                          onChange={e => setNewEmpEsi(e.target.value)} 
                          placeholder="ESI/XX/9812"
                          className="w-full p-2 border rounded text-slate-800 font-mono" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Income Tax Regime</label>
                      <select 
                        value={newEmpRegime} 
                        onChange={e => setNewEmpRegime(e.target.value as any)}
                        className="w-full p-2 border rounded bg-white text-slate-800"
                      >
                        <option value="new">New regime (default exemption)</option>
                        <option value="old">Old regime (supports declarations)</option>
                      </select>
                    </div>

                    <div className="flex gap-2.5 pt-3 border-t">
                      <button type="submit" className="flex-1 bg-[#12A594] hover:bg-[#0B7A6E] text-white py-2 rounded font-extrabold transition">
                        Register Employee
                      </button>
                      <button type="button" onClick={() => setShowNewEmployeeModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded font-bold transition">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL: REQUEST ADVANCE LOAN */}
            {showNewLoanModal && (
              <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-extrabold text-base font-manrope text-slate-900 flex items-center gap-1.5">
                      <FiPlus className="text-[#12A594]" /> Request Advance Loan Approval
                    </h3>
                    <button onClick={() => setShowNewLoanModal(false)} className="text-slate-400 hover:text-slate-700">
                      <FiX />
                    </button>
                  </div>
                  <form onSubmit={handleRequestLoan} className="space-y-3 text-xs font-semibold text-slate-700">
                    <div>
                      <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Select Employee</label>
                      <select 
                        value={newLoanEmpId} 
                        onChange={e => setNewLoanEmpId(e.target.value)}
                        className="w-full p-2 border rounded bg-white text-slate-800 font-bold"
                      >
                        {employees.map(e => (
                          <option key={e.employeeId} value={e.employeeId}>{e.employeeId} - {e.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Loan Type</label>
                      <select 
                        value={newLoanType} 
                        onChange={e => setNewLoanType(e.target.value as any)}
                        className="w-full p-2 border rounded bg-white text-slate-800"
                      >
                        <option value="advance">Salary Advance (Short Term)</option>
                        <option value="loan">Employee Loan (Long Term EMI)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Principal Amount ($)</label>
                        <input 
                          type="number" 
                          value={newLoanPrincipal}
                          onChange={e => setNewLoanPrincipal(Number(e.target.value))}
                          className="w-full p-2 border rounded font-mono font-bold text-slate-800" 
                          required
                        />
                      </div>
                      <div>
                        <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">EMI Deduction ($/mo)</label>
                        <input 
                          type="number" 
                          value={newLoanEmi}
                          onChange={e => setNewLoanEmi(Number(e.target.value))}
                          className="w-full p-2 border rounded font-mono font-bold text-rose-600" 
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-3 border-t">
                      <button type="submit" className="flex-1 bg-[#12A594] hover:bg-[#0B7A6E] text-white py-2 rounded font-extrabold transition">
                        Disburse Loan
                      </button>
                      <button type="button" onClick={() => setShowNewLoanModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded font-bold transition">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        );
      }

      case 'documents': {
        // Filter documents based on Search, Category, Folder selection, and cross-cutting Tags
        const filteredDocs = documents.filter(doc => {
          const matchesSearch = doc.fileName.toLowerCase().includes(dmsSearchQuery.toLowerCase()) || 
                                doc.category.toLowerCase().includes(dmsSearchQuery.toLowerCase()) ||
                                doc.documentId.toLowerCase().includes(dmsSearchQuery.toLowerCase());
          
          const matchesCat = dmsCategoryFilter === 'ALL' || doc.category === dmsCategoryFilter;
          
          let matchesFolder = true;
          if (dmsSelectedFolder !== 'all') {
            if (dmsSelectedFolder === 'finance') matchesFolder = doc.department_id === 'Finance' || doc.category === 'Financials';
            else if (dmsSelectedFolder === 'hr') matchesFolder = doc.department_id === 'HR' || doc.category === 'HR';
            else if (dmsSelectedFolder === 'compliance') matchesFolder = doc.department_id === 'Finance' && doc.category === 'Compliance';
            else if (dmsSelectedFolder === 'backups') matchesFolder = doc.category === 'Backups';
          }

          let matchesTag = true;
          if (dmsTagFilter !== 'ALL') {
            const nameLower = doc.fileName.toLowerCase();
            if (dmsTagFilter === 'GST') matchesTag = nameLower.includes('gst') || nameLower.includes('tax');
            else if (dmsTagFilter === 'Contracts') matchesTag = nameLower.includes('agreement') || nameLower.includes('rent');
            else if (dmsTagFilter === 'Backups') matchesTag = nameLower.includes('restore') || nameLower.includes('.bak');
          }

          return matchesSearch && matchesCat && matchesFolder && matchesTag;
        });

        return (
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* WORKSPACE HEADER */}
            <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-manrope text-[#161B33]">Secure Document Explorer (DMS)</h2>
                <p className="text-xs text-[#5B6178] mt-1">
                  Manage corporate digital assets, view versioning history, track compliance archives, and set access logs audits.
                </p>
              </div>

              {/* DMS SUB-NAV SELECTOR */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold select-none">
                <button 
                  onClick={() => { setActiveDmsTab('explorer'); setSelectedDmsDoc(null); }}
                  className={`px-3 py-1.5 rounded transition ${activeDmsTab === 'explorer' ? 'bg-[#10163A] text-white shadow-sm' : 'text-slate-600 hover:text-[#10163A]'}`}
                >
                  File Explorer
                </button>
                <button 
                  onClick={() => { setActiveDmsTab('approvals'); setSelectedDmsDoc(null); }}
                  className={`px-3 py-1.5 rounded transition ${activeDmsTab === 'approvals' ? 'bg-[#10163A] text-white shadow-sm' : 'text-slate-600 hover:text-[#10163A]'}`}
                >
                  Approval Pipelines
                </button>
                <button 
                  onClick={() => { setActiveDmsTab('bundles'); setSelectedDmsDoc(null); }}
                  className={`px-3 py-1.5 rounded transition ${activeDmsTab === 'bundles' ? 'bg-[#10163A] text-white shadow-sm' : 'text-slate-600 hover:text-[#10163A]'}`}
                >
                  Compliance Bundles
                </button>
                <button 
                  onClick={() => { setActiveDmsTab('quota'); setSelectedDmsDoc(null); }}
                  className={`px-3 py-1.5 rounded transition ${activeDmsTab === 'quota' ? 'bg-[#10163A] text-white shadow-sm' : 'text-slate-600 hover:text-[#10163A]'}`}
                >
                  Storage Quota
                </button>
              </div>
            </div>

            {/* DMS SUB-TAB: FILE EXPLORER */}
            {activeDmsTab === 'explorer' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* LEFT SIDEBAR: HYBRID FOLDERS & TAGS */}
                <div className="lg:col-span-1 space-y-6">
                  {/* FOLDERS HIERARCHY */}
                  <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-5 shadow-sm space-y-4">
                    <span className="text-[10px] font-extrabold uppercase text-slate-800 tracking-wide block border-b pb-2">Folder Tree</span>
                    <div className="text-xs font-semibold text-slate-600 space-y-2">
                      <div 
                        onClick={() => setDmsSelectedFolder('all')}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer transition ${dmsSelectedFolder === 'all' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50'}`}
                      >
                        <span className="material-icons-round text-sm">folder_special</span>
                        <span>Super Enterprise (Root)</span>
                      </div>
                      <div className="pl-4 space-y-1.5 border-l border-slate-200 ml-3">
                        <div 
                          onClick={() => setDmsSelectedFolder('finance')}
                          className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition ${dmsSelectedFolder === 'finance' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50'}`}
                        >
                          <span className="material-icons-round text-sm">folder</span>
                          <span>Finance Department</span>
                        </div>
                        <div 
                          onClick={() => setDmsSelectedFolder('hr')}
                          className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition ${dmsSelectedFolder === 'hr' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50'}`}
                        >
                          <span className="material-icons-round text-sm">folder</span>
                          <span>HR Department</span>
                        </div>
                        <div 
                          onClick={() => setDmsSelectedFolder('compliance')}
                          className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition ${dmsSelectedFolder === 'compliance' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50'}`}
                        >
                          <span className="material-icons-round text-sm">folder</span>
                          <span>Compliance Vault</span>
                        </div>
                        <div 
                          onClick={() => setDmsSelectedFolder('backups')}
                          className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition ${dmsSelectedFolder === 'backups' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50'}`}
                        >
                          <span className="material-icons-round text-sm">folder</span>
                          <span>System Backups</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CROSS-CUTTING TAGS */}
                  <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-5 shadow-sm space-y-4">
                    <span className="text-[10px] font-extrabold uppercase text-slate-800 tracking-wide block border-b pb-2">Cross-Cutting Tags</span>
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                      <button 
                        onClick={() => setDmsTagFilter('ALL')}
                        className={`px-2.5 py-1 rounded-full border transition ${dmsTagFilter === 'ALL' ? 'bg-[#10163A] text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                      >
                        All Tags
                      </button>
                      <button 
                        onClick={() => setDmsTagFilter('GST')}
                        className={`px-2.5 py-1 rounded-full border transition ${dmsTagFilter === 'GST' ? 'bg-teal-50 text-teal-700 border-teal-300 font-extrabold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                      >
                        #GST Compliance
                      </button>
                      <button 
                        onClick={() => setDmsTagFilter('Contracts')}
                        className={`px-2.5 py-1 rounded-full border transition ${dmsTagFilter === 'Contracts' ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-extrabold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                      >
                        #Lease Contracts
                      </button>
                      <button 
                        onClick={() => setDmsTagFilter('Backups')}
                        className={`px-2.5 py-1 rounded-full border transition ${dmsTagFilter === 'Backups' ? 'bg-rose-50 text-rose-700 border-rose-300 font-extrabold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                      >
                        #System Backups
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: REGISTRY & SEARCH */}
                <div className="lg:col-span-3 space-y-6">
                  {/* CONTROLS BAR */}
                  <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Search Field */}
                    <div className="relative flex-1 max-w-md">
                      <FiSearch className="absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="text"
                        value={dmsSearchQuery}
                        onChange={e => setDmsSearchQuery(e.target.value)}
                        placeholder="Search document names, file tags, contents..."
                        className="w-full pl-9 pr-4 py-2 border rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#12A594]"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <select 
                        value={dmsCategoryFilter}
                        onChange={e => setDmsCategoryFilter(e.target.value)}
                        className="p-2 border rounded bg-white text-xs font-bold text-slate-600"
                      >
                        <option value="ALL">All Categories</option>
                        <option value="Compliance">Compliance Reports</option>
                        <option value="Contracts">Contracts</option>
                        <option value="Backups">System Backups</option>
                        <option value="HR">HR Documents</option>
                        <option value="Bills & Receipts">Bills & Receipts</option>
                      </select>

                      <button 
                        onClick={() => setShowUploadModal(true)}
                        className="bg-[#12A594] hover:bg-[#0B7A6E] text-white px-3.5 py-2 rounded text-xs font-extrabold flex items-center gap-1.5 transition"
                      >
                        <FiPlus /> Ingest Document
                      </button>
                    </div>
                  </div>

                  {/* REGISTRY LIST GRID */}
                  <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-[10px] font-extrabold uppercase text-slate-800 tracking-wide">Document Registry Results ({filteredDocs.length})</span>
                      <span className="text-[10px] text-slate-400 font-bold font-mono">Company Root: Company A</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredDocs.map(doc => {
                        const currentVer = doc.versions.length;
                        const isLocked = !!doc.lockStatus;
                        
                        // Expiry Warning Check
                        const isExpiring = doc.expiryDate && new Date(doc.expiryDate) < new Date('2026-08-30');

                        return (
                          <div 
                            key={doc.documentId}
                            className={`border rounded-xl p-4 transition flex flex-col justify-between space-y-3 hover:border-indigo-300 hover:shadow-sm ${
                              doc.isConfidential ? 'bg-amber-50/20 border-amber-200' : 'border-slate-200'
                            }`}
                          >
                            <div className="space-y-1">
                              {/* Header details */}
                              <div className="flex justify-between items-start gap-2">
                                <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                                  doc.category === 'Compliance' ? 'bg-teal-50 border-teal-200 text-teal-700' :
                                  doc.category === 'Contracts' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                                  doc.category === 'Backups' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                                  'bg-slate-50 border-slate-200 text-slate-600'
                                }`}>
                                  {doc.category}
                                </span>

                                <div className="flex items-center gap-1.5">
                                  {isLocked && (
                                    <span className="material-icons-round text-amber-500 text-sm" title={`Locked by ${doc.lockStatus?.lockedBy}`}>
                                      lock
                                    </span>
                                  )}
                                  {doc.isConfidential && (
                                    <span className="bg-red-100 text-red-700 font-extrabold text-[8px] uppercase px-1.5 rounded">
                                      CONFIDENTIAL
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* File Name & ID */}
                              <div>
                                <span 
                                  onClick={() => setSelectedDmsDoc(doc)}
                                  className="font-bold text-sm text-[#161B33] hover:text-[#12A594] cursor-pointer block truncate"
                                >
                                  {doc.fileName}
                                </span>
                                <span className="font-mono text-[9px] text-slate-400">ID: {doc.documentId} • Size: {doc.fileSize}</span>
                              </div>
                            </div>

                            {/* Warning / Link alerts */}
                            {isExpiring && (
                              <div className="bg-red-50 border border-red-200 rounded p-1.5 text-[9px] text-rose-700 font-semibold flex items-center gap-1">
                                <span className="material-icons-round text-[10px]">warning</span>
                                <span>Expiry Notice: File contract expires on {doc.expiryDate}!</span>
                              </div>
                            )}

                            {doc.linkedModule && (
                              <div className="bg-slate-50 border rounded p-1.5 text-[9px] text-slate-500 font-semibold flex items-center justify-between">
                                <span>Linked to: {doc.linkedModule} ({doc.linkedEntityId || 'Record Link'})</span>
                                <span className="text-[#12A594] hover:underline cursor-pointer" onClick={() => showToast(`Audit link mapping: Jump straight to related ${doc.linkedModule} record.`, 'success')}>
                                  View Source Record
                                </span>
                              </div>
                            )}

                            {/* Bottom Controls */}
                            <div className="border-t pt-2 flex justify-between items-center text-[10px] font-bold text-slate-500">
                              <span>Version: v{currentVer}</span>
                              
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleToggleLock(doc.documentId)}
                                  className={`p-1 rounded border transition ${isLocked ? 'bg-amber-50 border-amber-300 text-amber-600' : 'hover:bg-slate-50'}`}
                                  title={isLocked ? 'Release lock (Check-In)' : 'Lock file (Check-Out)'}
                                >
                                  <span className="material-icons-round text-xs">lock_open</span>
                                </button>
                                <button 
                                  onClick={() => handleGenerateShareLink(doc.documentId)}
                                  className="p-1 rounded border hover:bg-slate-50"
                                  title="Generate secure share link"
                                >
                                  <span className="material-icons-round text-xs">share</span>
                                </button>
                                <button 
                                  onClick={() => setSelectedDmsDoc(doc)}
                                  className="bg-slate-100 hover:bg-slate-200 text-[#10163A] px-2.5 py-1 rounded"
                                >
                                  Open Detail Drawers
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DMS SUB-TAB: APPROVAL WORKFLOWS */}
            {activeDmsTab === 'approvals' && (
              <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-extrabold text-base text-[#161B33] font-manrope">Contracts & Documents Approval Workflows</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Documents requiring multi-step sign-offs: Legal (Stage 1) → Finance (Stage 2) → Admin (Stage 3).</p>
                </div>

                <div className="space-y-4">
                  {documents.filter(d => d.status === 'Pending Approval').map(doc => (
                    <div key={doc.documentId} className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/50">
                      <div className="flex justify-between items-center border-b pb-2">
                        <div>
                          <span className="font-bold text-sm text-slate-800">{doc.fileName}</span>
                          <span className="font-mono text-[10px] text-slate-400 ml-3">({doc.category})</span>
                        </div>
                        <span className="font-mono font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded text-[10px] uppercase">
                          Pending Sign-off
                        </span>
                      </div>

                      {/* Approval Tracker */}
                      <div className="grid grid-cols-3 gap-4 text-center text-xs font-semibold">
                        <div className="border border-emerald-200 bg-emerald-50 text-emerald-700 p-2.5 rounded-lg">
                          <div className="font-bold uppercase text-[9px]">Step 1: Legal Department</div>
                          <div className="font-extrabold mt-1">SIGNED OFF ✓</div>
                        </div>
                        <div className="border border-amber-300 bg-amber-50 text-amber-800 p-2.5 rounded-lg animate-pulse">
                          <div className="font-bold uppercase text-[9px]">Step 2: Finance Control</div>
                          <div className="font-extrabold mt-1">AWAITING REVIEW</div>
                        </div>
                        <div className="border border-slate-200 bg-white text-slate-400 p-2.5 rounded-lg">
                          <div className="font-bold uppercase text-[9px]">Step 3: Executive Board</div>
                          <div className="font-bold mt-1">LOCKED</div>
                        </div>
                      </div>

                      {/* Sign-off Actions */}
                      <div className="flex justify-end gap-3 text-xs font-bold">
                        <button 
                          onClick={() => handleProcessDmsWorkflow(doc.documentId, 'Approve')}
                          className="bg-[#12A594] hover:bg-[#0B7A6E] text-white px-4 py-1.5 rounded transition"
                        >
                          Approve Sign-off
                        </button>
                        <button 
                          onClick={() => handleProcessDmsWorkflow(doc.documentId, 'Reject')}
                          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-1.5 rounded transition"
                        >
                          Reject / Send back to draft
                        </button>
                      </div>
                    </div>
                  ))}

                  {documents.filter(d => d.status === 'Pending Approval').length === 0 && (
                    <div className="text-slate-400 font-semibold italic text-center p-8 border-2 border-dashed border-slate-200 rounded-lg">
                      No documents currently in the approval workflow queue.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DMS SUB-TAB: COMPLIANCE BUNDLES */}
            {activeDmsTab === 'bundles' && (
              <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-extrabold text-base text-[#161B33] font-manrope">Statutory Audit Document Bundles</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Auto-collect all GST e-invoices, TDS declarations, and financial receipts into compiled export packs.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* BUNDLE PACKET CARD */}
                  <div className="border border-slate-200 rounded-xl p-5 space-y-4 bg-slate-50/50">
                    <div className="border-b pb-2">
                      <span className="font-extrabold text-sm text-[#10163A] block">Q2 FY 2026-27 GST Audit bundle</span>
                      <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Period: July 1st, 2026 to September 30th, 2026</span>
                    </div>

                    <div className="text-xs font-semibold text-slate-600 space-y-2">
                      <div className="flex justify-between">
                        <span>GST Invoices (Sales/Purchases):</span>
                        <span className="font-mono text-slate-800 font-bold">14 Documents found</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Compliance Tax Returns (TDS):</span>
                        <span className="font-mono text-slate-800 font-bold">2 Documents found</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Supporting Bills & Receipts:</span>
                        <span className="font-mono text-slate-800 font-bold">5 Documents found</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        showToast('Compiling ZIP audit pack... Hash verification completed.', 'success');
                        setTimeout(() => {
                          showToast('ZIP packet exported: audit_bundle_q2_gst.zip download started.', 'success');
                        }, 1000);
                      }}
                      className="w-full text-center bg-[#10163A] hover:bg-[#1B2456] text-white py-2 rounded text-xs font-bold transition"
                    >
                      Export Bundle ZIP Pack
                    </button>
                  </div>

                  {/* INFO PANEL */}
                  <div className="border border-indigo-200 bg-indigo-50/30 rounded-xl p-5 space-y-3 text-xs font-semibold text-slate-600">
                    <span className="font-extrabold text-indigo-700 uppercase text-[10px] block">Audit Integrity Verification</span>
                    <p className="text-slate-500 leading-relaxed">
                      All documents compiled in these bundles are hashed using SHA-256 signatures to ensure compliance standards. Any changes made to invoice PDFs or backup restore points after period lock will flag verification validation errors automatically.
                    </p>
                    <div className="border-t border-indigo-100 pt-2 text-[10px] text-indigo-600 font-bold flex items-center gap-1.5">
                      <span className="material-icons-round text-sm">security</span>
                      <span>SHA-256 verification hash: 8f9b4c2e...88a1b</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DMS SUB-TAB: STORAGE QUOTA */}
            {activeDmsTab === 'quota' && (
              <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="font-extrabold text-base text-[#161B33] font-manrope">Storage Quota & Deduplication Analytics</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Secure corporate storage telemetry tracking. Hash-based duplicates are flagged automatically.</p>
                </div>

                {/* QUOTA GRAPH */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-extrabold text-slate-800">
                    <span>Corporate Allocation Storage</span>
                    <span>1.24 GB Used of 10.00 GB (12.4%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex border">
                    <div className="bg-[#E2662F] h-full" style={{ width: '85%' }} title="Backups (85%)"></div>
                    <div className="bg-indigo-600 h-full" style={{ width: '10%' }} title="Compliance (10%)"></div>
                    <div className="bg-[#12A594] h-full" style={{ width: '5%' }} title="Contracts / HR (5%)"></div>
                  </div>
                  <div className="flex gap-4 text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#E2662F]"></span> Backups (1.05 GB)</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Compliance (120 MB)</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#12A594]"></span> Contracts & HR (70 MB)</span>
                  </div>
                </div>

                {/* DUPLICATE DETECTOR */}
                <div className="border border-amber-200 bg-amber-50/20 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 border-b border-amber-200/50 pb-2">
                    <span className="material-icons-round text-amber-500 text-sm">warning</span>
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Duplicate File Detection Alert</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-600 leading-relaxed flex justify-between items-center">
                    <div>
                      <div className="font-bold text-slate-800">duplicate_invoice_v2_backup.pdf</div>
                      <div className="text-[10px] text-slate-400 font-mono">Matched SHA-256 hash with invoice_q2_raw_sign.pdf</div>
                    </div>
                    <button 
                      onClick={() => showToast('Deduplication cleanup complete. 42 MB freed.', 'success')}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded font-bold text-[10px] transition"
                    >
                      Deduplicate & Clean
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* DOCUMENT DETAIL DRAWER (WITH PREVIEW, VERSIONS & COMMENTS) */}
            {selectedDmsDoc && (
              <div className="fixed inset-0 z-[9999] overflow-hidden">
                <div 
                  onClick={() => setSelectedDmsDoc(null)}
                  className="absolute inset-0 bg-[#10163A]/50 backdrop-blur-sm transition-opacity duration-300"
                ></div>
                
                <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                  <div className="w-screen max-w-2xl bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between animate-slide-in">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 bg-[#10163A] text-white flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-base tracking-wider uppercase font-manrope">{selectedDmsDoc.fileName}</span>
                          <span className="bg-slate-600/50 text-slate-200 border px-2 py-0.5 rounded text-[9px] uppercase font-bold font-mono">
                            {selectedDmsDoc.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wide mt-1">
                          Category: {selectedDmsDoc.category} • Size: {selectedDmsDoc.fileSize}
                        </p>
                      </div>
                      <button 
                        onClick={() => setSelectedDmsDoc(null)}
                        className="text-white hover:text-rose-400 font-extrabold text-lg p-1 transition"
                      >
                        <FiX />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800 font-semibold">
                      {/* WATERMARKED PREVIEW CONTAINER */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold uppercase text-slate-800 block">In-Browser File Document Preview</span>
                        <div className="relative border rounded-lg p-5 bg-slate-900 text-slate-300 font-mono text-[11px] leading-relaxed select-none overflow-hidden h-40">
                          {/* Confidential Diagonal Watermark */}
                          {selectedDmsDoc.isConfidential && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none rotate-[-15deg] select-none opacity-20">
                              <span className="text-rose-500 font-extrabold text-3xl tracking-widest uppercase">CONFIDENTIAL & SECURE</span>
                            </div>
                          )}

                          <div className="space-y-1">
                            <div>% ERP DMS SECURE PREVIEW ENGINE v1.02</div>
                            <div>% Document Source ID: {selectedDmsDoc.documentId}</div>
                            <div>% Uploaded By: {selectedDmsDoc.uploadedBy} @ {selectedDmsDoc.uploadedAt.slice(0,10)}</div>
                            <div className="mt-2 text-slate-400 italic">// [SECURE METADATA PREVIEW BLOCK]</div>
                            <div>// Document contents are fully encrypted at rest using AES-256 constraints.</div>
                            <div>// Verified compliance hash signature matches statutory logs.</div>
                          </div>
                        </div>
                      </div>

                      {/* VERSION CONTROL HISTORY */}
                      <div className="space-y-3 border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-extrabold uppercase text-slate-800 block">Version History Logs</span>
                          <button 
                            onClick={() => handleUploadNewVersion(selectedDmsDoc.documentId)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-[10px] transition"
                          >
                            + Upload New Version
                          </button>
                        </div>

                        <div className="border rounded-lg overflow-hidden divide-y divide-slate-100">
                          {selectedDmsDoc.versions.map(v => (
                            <div key={v.versionId} className="p-3 bg-slate-50/50 flex justify-between items-center text-[11px]">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="bg-[#10163A] text-white px-1.5 py-0.2 rounded text-[9px] font-bold">v{v.versionNumber}</span>
                                  <span className="font-bold text-slate-800">{v.changeNotes}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">Uploaded by {v.uploadedBy} on {v.uploadedAt.slice(0,16).replace('T', ' ')}</div>
                              </div>
                              {v.versionNumber < selectedDmsDoc.versions.length && (
                                <button 
                                  onClick={() => handleRollbackVersion(selectedDmsDoc.documentId, v.versionNumber)}
                                  className="text-[#12A594] hover:underline text-[10px]"
                                >
                                  Rollback to here
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* COLLABORATIVE ANNOTATIONS / COMMENTS */}
                      <div className="space-y-3 border-t pt-4">
                        <span className="text-[10px] font-extrabold uppercase text-slate-800 block">Collaboration Review Comments</span>
                        
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                          {selectedDmsDoc.comments.map((comment, idx) => (
                            <div key={idx} className="bg-slate-100 border p-2.5 rounded-lg space-y-1 text-[11px]">
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold text-slate-800 uppercase text-[9px]">{comment.author}</span>
                                <span className="text-[9px] text-slate-400">{comment.timestamp.slice(11,16)}</span>
                              </div>
                              <p className="text-slate-600 font-semibold">{comment.text}</p>
                            </div>
                          ))}
                          {selectedDmsDoc.comments.length === 0 && (
                            <div className="text-slate-400 italic text-center text-[11px] py-2">No annotation review comments posted on this file.</div>
                          )}
                        </div>

                        {/* Add Comment */}
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            value={dmsCommentInput}
                            onChange={e => setDmsCommentInput(e.target.value)}
                            placeholder="Add annotation review note..."
                            className="flex-1 p-2 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#12A594]"
                          />
                          <button 
                            onClick={() => handlePostDmsComment(selectedDmsDoc.documentId)}
                            className="bg-[#10163A] hover:bg-[#1B2456] text-white px-3 py-2 rounded text-xs transition"
                          >
                            Comment
                          </button>
                        </div>
                      </div>

                      {/* SECURITY ACCESS AUDIT LOG */}
                      <div className="space-y-3 border-t pt-4">
                        <span className="text-[10px] font-extrabold uppercase text-slate-800 block">Security Access Audit Log</span>
                        <div className="relative border-l-2 border-slate-200 pl-4 space-y-3">
                          {selectedDmsDoc.accessLogs.map((log, index) => (
                            <div key={index} className="relative text-xs">
                              <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[#12A594]"></span>
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold text-[#10163A] uppercase text-[9px]">{log.action}</span>
                                <span className="text-[9px] text-slate-400 font-mono">{log.timestamp.slice(11,16)}</span>
                              </div>
                              <p className="text-slate-500 font-semibold mt-0.5">Performed by user: {log.user}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2.5">
                      <button 
                        onClick={() => {
                          // Simulate download
                          showToast(`Initiating secure download: ${selectedDmsDoc.fileName}...`, 'success');
                          
                          // Log download event
                          setDocuments(documents.map(doc => {
                            if (doc.documentId === selectedDmsDoc.documentId) {
                              const updated = {
                                ...doc,
                                accessLogs: [{ action: 'Downloaded File', user: 'admin', timestamp: new Date().toISOString() }, ...doc.accessLogs]
                              };
                              setSelectedDmsDoc(updated);
                              return updated;
                            }
                            return doc;
                          }));
                        }}
                        className="flex-1 bg-[#12A594] hover:bg-[#0B7A6E] text-white py-2.5 rounded font-extrabold transition text-center"
                      >
                        Secure Download
                      </button>

                      <button 
                        onClick={() => setSelectedDmsDoc(null)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded font-bold transition text-center"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MODAL: INGEST DOCUMENT */}
            {showUploadModal && (
              <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-extrabold text-base font-manrope text-slate-900 flex items-center gap-1.5">
                      <FiPlus className="text-[#12A594]" /> Ingest Document Profile
                    </h3>
                    <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-700">
                      <FiX />
                    </button>
                  </div>
                  <form onSubmit={handleCreateDmsDocument} className="space-y-3 text-xs font-semibold text-slate-700">
                    <div>
                      <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Document File Name</label>
                      <input 
                        type="text" 
                        value={newDocName}
                        onChange={e => setNewDocName(e.target.value)}
                        placeholder="e.g. gst_e_invoice_august.pdf"
                        className="w-full p-2 border rounded text-slate-800 font-bold" 
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Category</label>
                        <select 
                          value={newDocCat} 
                          onChange={e => setNewDocCat(e.target.value as any)}
                          className="w-full p-2 border rounded bg-white text-slate-800"
                        >
                          <option value="Compliance">Compliance Reports</option>
                          <option value="Contracts">Contracts</option>
                          <option value="Backups">System Backups</option>
                          <option value="HR">HR Documents</option>
                          <option value="Financials">Financial Statements</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Simulated Size</label>
                        <input 
                          type="text" 
                          value={newDocSize}
                          onChange={e => setNewDocSize(e.target.value)}
                          className="w-full p-2 border rounded text-slate-800 font-mono font-bold" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Contract Expiry Date</label>
                        <input 
                          type="date" 
                          value={newDocExpiry}
                          onChange={e => setNewDocExpiry(e.target.value)}
                          className="w-full p-2 border rounded text-slate-800 font-mono" 
                        />
                      </div>
                      <div className="flex items-center pt-5">
                        <input 
                          type="checkbox"
                          id="confidential_chk"
                          checked={newDocConfidential}
                          onChange={e => setNewDocConfidential(e.target.checked)}
                          className="w-4 h-4 rounded text-[#12A594] focus:ring-[#12A594] border-slate-300 mr-2"
                        />
                        <label htmlFor="confidential_chk" className="font-bold text-slate-600 block">Is Confidential</label>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-3 border-t">
                      <button type="submit" className="flex-1 bg-[#12A594] hover:bg-[#0B7A6E] text-white py-2 rounded font-extrabold transition">
                        Ingest & Auto-Tag File
                      </button>
                      <button type="button" onClick={() => setShowUploadModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded font-bold transition">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL: TIME-LIMITED SHARE LINK */}
            {showShareModal && (
              <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-extrabold text-base font-manrope text-slate-900 flex items-center gap-1.5">
                      <FiShare className="text-[#12A594]" /> Temporary Shared Link
                    </h3>
                    <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-700">
                      <FiX />
                    </button>
                  </div>
                  
                  <div className="space-y-3 text-xs font-semibold text-slate-700">
                    <div>
                      <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Secure Expiration Limit Date</label>
                      <input 
                        type="date"
                        value={shareExpires}
                        onChange={e => setShareExpires(e.target.value)}
                        className="w-full p-2 border rounded font-mono text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="font-bold uppercase text-[10px] text-slate-500 block">External share link URL</span>
                      <div className="bg-slate-50 border p-2.5 rounded-lg select-all font-mono text-[10px] text-indigo-700 break-all border-indigo-200">
                        {shareLinkResult}
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-[9px] text-[#2E9E5B] font-semibold flex items-center gap-1">
                      <span className="material-icons-round text-[10px]">check_circle</span>
                      <span>Link encrypted with token. Access tracker audits active.</span>
                    </div>

                    <div className="flex gap-2.5 pt-3 border-t">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(shareLinkResult);
                          showToast('Copy to Clipboard completed!', 'success');
                          setShowShareModal(false);
                        }}
                        className="flex-1 bg-[#12A594] hover:bg-[#0B7A6E] text-white py-2 rounded font-extrabold transition text-center"
                      >
                        Copy Link
                      </button>
                      <button 
                        onClick={() => setShowShareModal(false)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded font-bold transition text-center"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        );
      }

      case 'reports': {
        // Dynamic balance calculator incorporating posted vouchers + provisional adjustments
        const getAccountBalance = (accountId: number) => {
          const ledger = ledgers.find(l => l.id === accountId);
          if (!ledger) return 0;
          let bal = ledger.openingBalance;
          vouchers.forEach(v => {
            if (v.status !== 'Posted') return;
            v.lines.forEach(line => {
              if (line.accountId === accountId) {
                if (ledger.dc === 'DEBIT') {
                  bal += Number(line.debitAmount || 0) - Number(line.creditAmount || 0);
                } else {
                  bal += Number(line.creditAmount || 0) - Number(line.debitAmount || 0);
                }
              }
            });
          });
          
          // Add sandboxed provisional adjustments
          provisionalEntries.forEach(p => {
            if (p.accountName === ledger.name) {
              if (ledger.dc === 'DEBIT') {
                bal += Number(p.debitAmount || 0) - Number(p.creditAmount || 0);
              } else {
                bal += Number(p.creditAmount || 0) - Number(p.debitAmount || 0);
              }
            }
          });
          return bal;
        };

        // Extract key account balances
        const svbBal = getAccountBalance(1);
        const salesBal = getAccountBalance(2);
        const officeExpBal = getAccountBalance(3);
        const pettyCashBal = getAccountBalance(4);
        const equityBal = getAccountBalance(5);
        const creditorBal = getAccountBalance(6);
        const assetBal = getAccountBalance(7);
        const deprecBal = getAccountBalance(8);
        const salaryExpBal = getAccountBalance(9);
        const empPayableBal = getAccountBalance(10);
        const pfPayableBal = getAccountBalance(11);
        const tdsPayableBal = getAccountBalance(12);
        const employerPfExpBal = getAccountBalance(13);

        // Sub-totals calculations
        const totalGrossRevenue = salesBal;
        const totalExpenses = officeExpBal + salaryExpBal + employerPfExpBal;
        const netProfit = totalGrossRevenue - totalExpenses;

        const currentAssets = svbBal + pettyCashBal;
        const currentLiabilities = creditorBal + empPayableBal + pfPayableBal + tdsPayableBal;
        const totalAssets = currentAssets + assetBal;
        const totalLiabilitiesAndEquity = currentLiabilities + deprecBal + equityBal + netProfit;

        // Custom labels helper
        const getAccountLabel = (accountId: number, defaultLabel: string) => {
          const custom = customStructures.find(s => s.accountId === accountId);
          return custom ? custom.customLabel : defaultLabel;
        };

        return (
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* WORKSPACE HEADER */}
            <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-manrope text-[#161B33]">Statutory Reports & Ratios Engine</h2>
                <p className="text-xs text-[#5B6178] mt-1">
                  Interactive drill-editing reporting ledger, provisional what-if sandboxing, and compliance packages exports.
                </p>
              </div>

              {/* TABS SELECTOR */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold select-none">
                <button 
                  onClick={() => { setActiveReportTab('library'); setSelectedDrillDownAccount(null); }}
                  className={`px-3 py-1.5 rounded transition ${activeReportTab === 'library' ? 'bg-[#10163A] text-white shadow-sm' : 'text-slate-600 hover:text-[#10163A]'}`}
                >
                  Report Library
                </button>
                <button 
                  onClick={() => { setActiveReportTab('builder'); setSelectedDrillDownAccount(null); }}
                  className={`px-3 py-1.5 rounded transition ${activeReportTab === 'builder' ? 'bg-[#10163A] text-white shadow-sm' : 'text-slate-600 hover:text-[#10163A]'}`}
                >
                  Custom Builder
                </button>
                <button 
                  onClick={() => { setActiveReportTab('schedules'); setSelectedDrillDownAccount(null); }}
                  className={`px-3 py-1.5 rounded transition ${activeReportTab === 'schedules' ? 'bg-[#10163A] text-white shadow-sm' : 'text-slate-600 hover:text-[#10163A]'}`}
                >
                  Schedules
                </button>
                <button 
                  onClick={() => { setActiveReportTab('audit'); setSelectedDrillDownAccount(null); }}
                  className={`px-3 py-1.5 rounded transition ${activeReportTab === 'audit' ? 'bg-[#10163A] text-white shadow-sm' : 'text-slate-600 hover:text-[#10163A]'}`}
                >
                  Access Audit
                </button>
              </div>
            </div>

            {/* DMS SUB-TAB: REPORT LIBRARY */}
            {activeReportTab === 'library' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* LEFT LIST: 10 REPORT TYPES */}
                <div className="lg:col-span-1 bg-white border-[1.5px] border-[#161B33] rounded-lg p-5 shadow-sm space-y-4">
                  <span className="text-[10px] font-extrabold uppercase text-slate-800 tracking-wide block border-b pb-2">Financial Report Library</span>
                  <div className="text-xs font-semibold text-slate-600 space-y-1.5">
                    {[
                      'Balance Sheet', 'Profit & Loss', 'Trial Balance', 'Cash Flow', 
                      'General Ledger', 'Day Book', 'Ratio Analysis', 'GST Report', 
                      'Aging Report', 'Budget vs Actual'
                    ].map(rName => (
                      <div 
                        key={rName}
                        onClick={() => { setSelectedReportType(rName); setSelectedDrillDownAccount(null); }}
                        className={`p-2.5 rounded cursor-pointer transition flex justify-between items-center ${
                          selectedReportType === rName ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600' : 'hover:bg-slate-50'
                        }`}
                      >
                        <span>{rName}</span>
                        <span className="material-icons-round text-sm">chevron_right</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT AREA: THE INTERACTIVE REPORT ENGINE */}
                <div className="lg:col-span-3 space-y-6">
                  {/* RIBBON FILTERS & CONTROLS */}
                  <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Comparison selection */}
                      <select 
                        value={comparisonPeriod}
                        onChange={e => setComparisonPeriod(e.target.value as any)}
                        className="p-2 border rounded bg-white text-xs font-bold text-slate-600 focus:outline-none"
                      >
                        <option value="none">No Comparison</option>
                        <option value="previous">Compare vs Previous Period</option>
                        <option value="priorYear">Compare vs Same Period Last Year</option>
                      </select>

                      {/* Table / Chart Toggle */}
                      <div className="flex bg-slate-100 p-0.5 rounded border text-[11px] font-bold">
                        <button 
                          onClick={() => setReportViewMode('table')}
                          className={`px-2.5 py-1 rounded transition ${reportViewMode === 'table' ? 'bg-[#10163A] text-white shadow-sm' : 'text-slate-600'}`}
                        >
                          Table
                        </button>
                        <button 
                          onClick={() => setReportViewMode('chart')}
                          className={`px-2.5 py-1 rounded transition ${reportViewMode === 'chart' ? 'bg-[#10163A] text-white shadow-sm' : 'text-slate-600'}`}
                        >
                          Chart View
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowProvisionalModal(true)}
                        className="border border-[#12A594] text-[#12A594] hover:bg-teal-50 px-3 py-2 rounded text-xs font-extrabold transition"
                      >
                        + Add Sandbox Entry
                      </button>
                      <button 
                        onClick={handleExportAuditorPack}
                        className="bg-[#12A594] hover:bg-[#0B7A6E] text-white px-3 py-2 rounded text-xs font-extrabold transition"
                      >
                        Export Auditor ZIP Pack
                      </button>
                    </div>
                  </div>

                  {/* PROVISIONAL ENTRIES WARNING BANNER */}
                  {provisionalEntries.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs font-semibold text-amber-800 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="material-icons-round text-lg text-amber-600">warning</span>
                        <div>
                          <div className="font-extrabold uppercase text-[10px]">What-If Provisional Sandbox Active</div>
                          <div className="text-amber-600">Calculations reflect {provisionalEntries.length} sandboxed adjusting entries.</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {provisionalEntries.map(p => (
                          <div key={p.provisionalId} className="bg-amber-100 border border-amber-300 rounded px-2.5 py-1 flex items-center gap-1.5 font-mono text-[10px]">
                            <span>{p.accountName}: ${p.debitAmount || p.creditAmount}</span>
                            <button onClick={() => handleDeleteProvisionalEntry(p.provisionalId)} className="text-rose-600 font-bold">×</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* REPORT VIEWER CONTAINER */}
                  <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-6">
                    <div className="border-b pb-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-extrabold text-base text-[#161B33] font-manrope">{selectedReportType}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Fiscal Period: August 2026 • Reporting Base: Live General Ledger balances</p>
                      </div>
                      <span className="bg-slate-100 border px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 font-mono">FY 2026-27</span>
                    </div>

                    {/* REPORT TABLE VIEW */}
                    {reportViewMode === 'table' && (
                      <div className="overflow-x-auto text-xs font-semibold text-slate-800">
                        {/* 1. BALANCE SHEET */}
                        {selectedReportType === 'Balance Sheet' && (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-[#E1E5EC] text-slate-400 font-bold text-[9px] uppercase tracking-wider">
                                <th className="py-2.5">EQUITY & LIABILITIES</th>
                                <th className="py-2.5 text-right">BALANCE</th>
                                {comparisonPeriod !== 'none' && <th className="py-2.5 text-right">PRIOR PERIOD</th>}
                                {comparisonPeriod !== 'none' && <th className="py-2.5 text-right">VARIANCE %</th>}
                              </tr>
                            </thead>
                            <tbody>
                              {/* Equity */}
                              <tr><td className="py-3 font-extrabold text-slate-800 uppercase text-[10px]" colSpan={4}>Shareholder's Equity</td></tr>
                              <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="py-2 pl-4">{getAccountLabel(5, 'Equity Capital A/c')}</td>
                                <td className="py-2 text-right font-mono font-bold">${equityBal.toLocaleString()}</td>
                                {comparisonPeriod !== 'none' && <td className="py-2 text-right font-mono text-slate-400">${equityBal.toLocaleString()}</td>}
                                {comparisonPeriod !== 'none' && <td className="py-2 text-right font-mono text-slate-400">0.0%</td>}
                              </tr>
                              {/* Profit */}
                              <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="py-2 pl-4">Retained Earnings (Net Profit YTD)</td>
                                <td className="py-2 text-right font-mono font-bold text-emerald-600">${netProfit.toLocaleString()}</td>
                                {comparisonPeriod !== 'none' && <td className="py-2 text-right font-mono text-slate-400">$10,450</td>}
                                {comparisonPeriod !== 'none' && <td className="py-2 text-right font-mono text-emerald-600">+10.5%</td>}
                              </tr>

                              {/* Liabilities */}
                              <tr><td className="py-3 pt-4 font-extrabold text-slate-800 uppercase text-[10px]" colSpan={4}>Current Liabilities</td></tr>
                              <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="py-2 pl-4">{getAccountLabel(10, 'Employee Payable A/C')}</td>
                                <td className="py-2 text-right font-mono font-bold">${empPayableBal.toLocaleString()}</td>
                                {comparisonPeriod !== 'none' && <td className="py-2 text-right font-mono text-slate-400">${empPayableBal.toLocaleString()}</td>}
                                {comparisonPeriod !== 'none' && <td className="py-2 text-right font-mono text-slate-400">0.0%</td>}
                              </tr>
                              <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="py-2 pl-4">{getAccountLabel(11, 'PF Payable A/C')}</td>
                                <td className="py-2 text-right font-mono font-bold">${pfPayableBal.toLocaleString()}</td>
                                {comparisonPeriod !== 'none' && <td className="py-2 text-right font-mono text-slate-400">${pfPayableBal.toLocaleString()}</td>}
                                {comparisonPeriod !== 'none' && <td className="py-2 text-right font-mono text-slate-400">0.0%</td>}
                              </tr>

                              {/* Asset section */}
                              <tr className="border-t-2 border-slate-300 font-extrabold bg-slate-50">
                                <td className="py-3">TOTAL LIABILITIES & EQUITY</td>
                                <td className="py-3 text-right font-mono">${totalLiabilitiesAndEquity.toLocaleString()}</td>
                                {comparisonPeriod !== 'none' && <td className="py-3 text-right font-mono text-slate-400">${(totalLiabilitiesAndEquity - 1500).toLocaleString()}</td>}
                                {comparisonPeriod !== 'none' && <td className="py-3 text-right font-mono text-emerald-600">+1.2%</td>}
                              </tr>

                              {/* ASSETS */}
                              <tr><td className="py-4 pt-6 font-extrabold text-slate-800 uppercase text-[10px]" colSpan={4}>Fixed Assets</td></tr>
                              <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="py-2 pl-4">Machinery Asset A/c</td>
                                <td className="py-2 text-right font-mono font-bold">${assetBal.toLocaleString()}</td>
                                {comparisonPeriod !== 'none' && <td className="py-2 text-right font-mono text-slate-400">${assetBal.toLocaleString()}</td>}
                                {comparisonPeriod !== 'none' && <td className="py-2 text-right font-mono text-slate-400">0.0%</td>}
                              </tr>
                              <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="py-2 pl-4">Depreciation Reserve</td>
                                <td className="py-2 text-right font-mono font-bold text-rose-500">-${deprecBal.toLocaleString()}</td>
                                {comparisonPeriod !== 'none' && <td className="py-2 text-right font-mono text-slate-400">-$5,000</td>}
                                {comparisonPeriod !== 'none' && <td className="py-2 text-right font-mono text-slate-400">0.0%</td>}
                              </tr>

                              <tr><td className="py-3 pt-4 font-extrabold text-slate-800 uppercase text-[10px]" colSpan={4}>Current Assets</td></tr>
                              <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="py-2 pl-4">{getAccountLabel(1, 'Silicon Valley Bank')}</td>
                                <td className="py-2 text-right font-mono font-bold">${svbBal.toLocaleString()}</td>
                                {comparisonPeriod !== 'none' && <td className="py-2 text-right font-mono text-slate-400">${svbBal.toLocaleString()}</td>}
                                {comparisonPeriod !== 'none' && <td className="py-2 text-right font-mono text-slate-400">0.0%</td>}
                              </tr>

                              <tr className="border-t-2 border-slate-300 font-extrabold bg-slate-50">
                                <td className="py-3">TOTAL ASSETS</td>
                                <td className="py-3 text-right font-mono">${totalAssets.toLocaleString()}</td>
                                {comparisonPeriod !== 'none' && <td className="py-3 text-right font-mono text-slate-400">${(totalAssets - 1500).toLocaleString()}</td>}
                                {comparisonPeriod !== 'none' && <td className="py-3 text-right font-mono text-emerald-600">+1.2%</td>}
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {/* 2. PROFIT & LOSS */}
                        {selectedReportType === 'Profit & Loss' && (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-[#E1E5EC] text-slate-400 font-bold text-[9px] uppercase tracking-wider">
                                <th className="py-2.5">INCOME & EXPENSES</th>
                                <th className="py-2.5 text-right">BALANCE</th>
                                {comparisonPeriod !== 'none' && <th className="py-2.5 text-right">PRIOR PERIOD</th>}
                                {comparisonPeriod !== 'none' && <th className="py-2.5 text-right">VARIANCE %</th>}
                              </tr>
                            </thead>
                            <tbody>
                              <tr><td className="py-3 font-extrabold text-slate-800 uppercase text-[10px]" colSpan={4}>Operating Revenue</td></tr>
                              <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="py-2 pl-4">Sales Revenues (Acme Corp Sales A/C)</td>
                                <td className="py-2 text-right font-mono font-bold text-emerald-600">${salesBal.toLocaleString()}</td>
                                {comparisonPeriod !== 'none' && <td className="py-2 text-right font-mono text-slate-400">$12,850</td>}
                                {comparisonPeriod !== 'none' && <td className="py-2 text-right font-mono text-emerald-600">+12.5%</td>}
                              </tr>

                              <tr><td className="py-3 pt-4 font-extrabold text-slate-800 uppercase text-[10px]" colSpan={4}>Operating Expenditures</td></tr>
                              <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="py-2 pl-4">Office & Indirect Expenses</td>
                                <td className="py-2 text-right font-mono font-bold text-rose-500">-${officeExpBal.toLocaleString()}</td>
                                {comparisonPeriod !== 'none' && <td className="py-2 text-right font-mono text-slate-400">-$2,400</td>}
                                {comparisonPeriod !== 'none' && <td className="py-2 text-right font-mono text-slate-400">0.0%</td>}
                              </tr>
                              <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="py-2 pl-4">Employee Gross Salary Expense</td>
                                <td className="py-2 text-right font-mono font-bold text-rose-500">-${salaryExpBal.toLocaleString()}</td>
                                {comparisonPeriod !== 'none' && <td className="py-2 text-right font-mono text-slate-400">-$0</td>}
                                {comparisonPeriod !== 'none' && <td className="py-2 text-right font-mono text-rose-500">+100%</td>}
                              </tr>

                              <tr className="border-t-2 border-slate-300 font-extrabold bg-slate-50">
                                <td className="py-3 uppercase">Net Profit / Retained Earnings</td>
                                <td className="py-3 text-right font-mono text-emerald-600">${netProfit.toLocaleString()}</td>
                                {comparisonPeriod !== 'none' && <td className="py-3 text-right font-mono text-slate-400">$10,450</td>}
                                {comparisonPeriod !== 'none' && <td className="py-3 text-right font-mono text-emerald-600">+10.5%</td>}
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {/* 3. TRIAL BALANCE WITH DRILLDOWN EXPANDERS */}
                        {selectedReportType === 'Trial Balance' && (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-[#E1E5EC] text-slate-400 font-bold text-[9px] uppercase tracking-wider">
                                <th className="py-2.5">LEDGER ACCOUNT NAME</th>
                                <th className="py-2.5 text-right">DEBIT ($)</th>
                                <th className="py-2.5 text-right">CREDIT ($)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ledgers.map(ledger => {
                                const bal = getAccountBalance(ledger.id);
                                const isExpanded = selectedDrillDownAccount === ledger.id;

                                // Filter vouchers that touch this account
                                const contributingLines = vouchers.flatMap(v => {
                                  if (v.status !== 'Posted') return [];
                                  return v.lines.filter(l => l.accountId === ledger.id).map(l => ({
                                    voucherId: v.voucherId,
                                    voucherNumber: v.voucherNumber,
                                    date: v.date,
                                    narration: v.narration,
                                    debit: l.debitAmount,
                                    credit: l.creditAmount
                                  }));
                                });

                                return (
                                  <React.Fragment key={ledger.id}>
                                    <tr 
                                      onClick={() => setSelectedDrillDownAccount(isExpanded ? null : ledger.id)}
                                      className="border-b border-slate-100 hover:bg-indigo-50/30 cursor-pointer transition"
                                    >
                                      <td className="py-2.5 font-bold text-slate-800 flex items-center gap-1.5">
                                        <span className="material-icons-round text-sm text-slate-400">
                                          {isExpanded ? 'expand_more' : 'chevron_right'}
                                        </span>
                                        <span>{ledger.name}</span>
                                        <span className="font-mono text-[9px] bg-slate-100 text-slate-400 px-1.5 rounded">{ledger.code}</span>
                                      </td>
                                      <td className="py-2.5 text-right font-mono font-semibold text-slate-700">
                                        {ledger.dc === 'DEBIT' ? `$${bal.toLocaleString()}` : '--'}
                                      </td>
                                      <td className="py-2.5 text-right font-mono font-semibold text-slate-700">
                                        {ledger.dc === 'CREDIT' ? `$${bal.toLocaleString()}` : '--'}
                                      </td>
                                    </tr>

                                    {/* DRILLDOWN TRANSACTIONS VIEW */}
                                    {isExpanded && (
                                      <tr>
                                        <td colSpan={3} className="bg-slate-50/80 p-4 border rounded">
                                          <div className="space-y-2">
                                            <div className="text-[10px] font-extrabold uppercase text-slate-600">Contributing Ledger Entries (Click to inspect voucher)</div>
                                            {contributingLines.length > 0 ? (
                                              <div className="space-y-1.5">
                                                {contributingLines.map((line, idx) => (
                                                  <div 
                                                    key={idx}
                                                    onClick={() => {
                                                      const matchedV = vouchers.find(v => v.voucherId === line.voucherId);
                                                      if (matchedV) {
                                                        setSelectedVoucher(matchedV);
                                                        openTab('transactions', 'Transactions', 'transactions');
                                                      }
                                                    }}
                                                    className="bg-white border rounded p-2 text-[10px] flex justify-between items-center cursor-pointer hover:border-indigo-300 transition"
                                                  >
                                                    <div>
                                                      <span className="font-bold text-[#10163A]">{line.voucherNumber}</span>
                                                      <span className="text-slate-400 font-semibold ml-2">{line.date} • {line.narration}</span>
                                                    </div>
                                                    <span className="font-mono font-bold text-slate-600">
                                                      {line.debit > 0 ? `Dr: $${line.debit}` : `Cr: $${line.credit}`}
                                                    </span>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <div className="text-slate-400 font-semibold italic">No active transactions posted to this ledger.</div>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>
                        )}

                        {/* GENERAL LEDGER REPORT */}
                        {selectedReportType === 'General Ledger' && (
                          <div className="space-y-6">
                            {ledgers.map(ledger => {
                              const bal = getAccountBalance(ledger.id);
                              
                              // Extract voucher splits that touch this ledger
                              const lines = vouchers.flatMap(v => {
                                if (v.status !== 'Posted') return [];
                                return v.lines.filter(l => l.accountId === ledger.id).map(l => ({
                                  voucherId: v.voucherId,
                                  voucherNumber: v.voucherNumber,
                                  date: v.date,
                                  narration: v.narration,
                                  debit: l.debitAmount,
                                  credit: l.creditAmount
                                }));
                              });

                              return (
                                <div key={ledger.id} className="border rounded-lg bg-slate-50/50 p-4 space-y-3">
                                  <div className="flex justify-between items-center border-b pb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-indigo-700 font-mono bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded text-[11px]">
                                        {ledger.code}
                                      </span>
                                      <span className="font-bold text-slate-800 text-sm">{ledger.name}</span>
                                    </div>
                                    <span className="font-mono text-xs font-bold text-[#10163A]">
                                      Closing Balance: ${bal.toLocaleString()} ({ledger.dc})
                                    </span>
                                  </div>

                                  <div className="overflow-x-auto text-[10px]">
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr className="border-b text-slate-400 font-extrabold uppercase">
                                          <th className="py-1">Date</th>
                                          <th className="py-1">Voucher No</th>
                                          <th className="py-1">Description / Narration</th>
                                          <th className="py-1 text-right">Debit ($)</th>
                                          <th className="py-1 text-right">Credit ($)</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y font-semibold text-slate-700">
                                        {lines.map((line, idx) => (
                                          <tr key={idx} className="hover:bg-white transition">
                                            <td className="py-1.5 font-mono">{line.date}</td>
                                            <td className="py-1.5 font-bold text-slate-900">{line.voucherNumber}</td>
                                            <td className="py-1.5">{line.narration}</td>
                                            <td className="py-1.5 text-right font-mono">{line.debit > 0 ? `$${line.debit.toLocaleString()}` : '--'}</td>
                                            <td className="py-1.5 text-right font-mono">{line.credit > 0 ? `$${line.credit.toLocaleString()}` : '--'}</td>
                                          </tr>
                                        ))}
                                        {lines.length === 0 && (
                                          <tr>
                                            <td colSpan={5} className="py-2 text-center text-slate-400 font-semibold italic bg-white">
                                              No posted transactions in this period.
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* DAY BOOK CHRONOLOGICAL VIEW */}
                        {selectedReportType === 'Day Book' && (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-[#E1E5EC] text-slate-400 font-bold text-[9px] uppercase tracking-wider">
                                <th className="py-2.5">DATE</th>
                                <th className="py-2.5">VOUCHER NUMBER</th>
                                <th className="py-2.5">VOUCHER TYPE</th>
                                <th className="py-2.5">NARRATION</th>
                                <th className="py-2.5 text-right">TOTAL DR ($)</th>
                                <th className="py-2.5 text-right">TOTAL CR ($)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {vouchers
                                .filter(v => v.status === 'Posted')
                                .sort((a, b) => b.date.localeCompare(a.date))
                                .map(v => (
                                  <tr 
                                    key={v.voucherId} 
                                    onClick={() => {
                                      setSelectedVoucher(v);
                                      openTab('transactions', 'Transactions', 'transactions');
                                    }}
                                    className="border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer"
                                  >
                                    <td className="py-3 font-mono font-bold text-slate-500">{v.date}</td>
                                    <td className="py-3 font-bold text-[#10163A]">{v.voucherNumber}</td>
                                    <td className="py-3 text-[10px]">
                                      <span className="bg-slate-100 border text-slate-600 px-2 py-0.5 rounded font-extrabold uppercase font-mono">
                                        {v.voucherType}
                                      </span>
                                    </td>
                                    <td className="py-3 text-slate-600 font-semibold max-w-xs truncate">{v.narration}</td>
                                    <td className="py-3 text-right font-mono font-bold text-slate-700">${v.totalDebit.toLocaleString()}</td>
                                    <td className="py-3 text-right font-mono font-bold text-slate-700">${v.totalCredit.toLocaleString()}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        )}

                        {/* 4. CASH FLOW STATEMENT */}
                        {selectedReportType === 'Cash Flow' && (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-[#E1E5EC] text-slate-400 font-bold text-[9px] uppercase tracking-wider">
                                <th className="py-2.5">CASH FLOW CATEGORY</th>
                                <th className="py-2.5 text-right">INFLOW / OUTFLOW ($)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr><td className="py-3 font-extrabold text-slate-800 uppercase text-[10px]" colSpan={2}>Operating Activities</td></tr>
                              <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="py-2 pl-4">Net profit before adjustments</td>
                                <td className="py-2 text-right font-mono font-semibold text-emerald-600">${netProfit.toLocaleString()}</td>
                              </tr>
                              <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="py-2 pl-4">Adjustments for PF Liabilities changes</td>
                                <td className="py-2 text-right font-mono font-semibold text-emerald-600">+${pfPayableBal.toLocaleString()}</td>
                              </tr>

                              <tr><td className="py-3 pt-4 font-extrabold text-slate-800 uppercase text-[10px]" colSpan={2}>Investing Activities</td></tr>
                              <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="py-2 pl-4">Purchases of Machinery Assets</td>
                                <td className="py-2 text-right font-mono font-semibold text-rose-500">-${assetBal.toLocaleString()}</td>
                              </tr>

                              <tr><td className="py-3 pt-4 font-extrabold text-slate-800 uppercase text-[10px]" colSpan={2}>Financing Activities</td></tr>
                              <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="py-2 pl-4">Equity Capital Infusions</td>
                                <td className="py-2 text-right font-mono font-semibold text-emerald-600">+${equityBal.toLocaleString()}</td>
                              </tr>

                              <tr className="border-t-2 border-slate-300 font-extrabold bg-slate-50">
                                <td className="py-3 uppercase">Net Increase in Cash & Bank Cashbook</td>
                                <td className="py-3 text-right font-mono text-emerald-600">${(svbBal + pettyCashBal).toLocaleString()}</td>
                              </tr>
                            </tbody>
                          </table>
                        )}

                        {/* 5. RATIO ANALYSIS */}
                        {selectedReportType === 'Ratio Analysis' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2 text-center">
                              <span className="font-extrabold text-slate-400 uppercase text-[9px] block">Current Ratio</span>
                              <span className="font-extrabold font-mono text-[#10163A] text-xl">
                                {(currentAssets / (currentLiabilities || 1)).toFixed(2)}x
                              </span>
                              <span className="text-[9px] text-slate-500 block leading-tight">Formula: Current Assets / Current Liabilities. Benchmark: 2.0x</span>
                            </div>

                            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2 text-center">
                              <span className="font-extrabold text-slate-400 uppercase text-[9px] block">Quick Ratio</span>
                              <span className="font-extrabold font-mono text-[#10163A] text-xl">
                                {(currentAssets / (currentLiabilities || 1)).toFixed(2)}x
                              </span>
                              <span className="text-[9px] text-slate-500 block leading-tight">Formula: Quick Assets / Current Liabilities. Benchmark: 1.0x</span>
                            </div>

                            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2 text-center">
                              <span className="font-extrabold text-slate-400 uppercase text-[9px] block">Debt-to-Equity</span>
                              <span className="font-extrabold font-mono text-[#10163A] text-xl">
                                {(currentLiabilities / (equityBal || 1)).toFixed(3)}x
                              </span>
                              <span className="text-[9px] text-slate-500 block leading-tight">Formula: Liabilities / Equity Capital. Benchmark: &lt; 0.5x</span>
                            </div>

                            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2 text-center">
                              <span className="font-extrabold text-slate-400 uppercase text-[9px] block">Return on Investment (ROI)</span>
                              <span className="font-extrabold font-mono text-emerald-600 text-xl">
                                {((netProfit / (equityBal || 1)) * 100).toFixed(2)}%
                              </span>
                              <span className="text-[9px] text-slate-500 block leading-tight">Formula: Net Profit / Equity Capital * 100.</span>
                            </div>
                          </div>
                        )}

                        {/* 6. GST REPORTS */}
                        {selectedReportType === 'GST Report' && (
                          <div className="space-y-6">
                            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                              <div className="flex justify-between items-center border-b pb-1.5">
                                <span className="font-extrabold text-indigo-700 text-[10px] uppercase">GSTR-1 Sales Report Summary</span>
                                <span className="bg-[#EAF5EE] text-[#2E9E5B] border px-2 py-0.2 rounded font-extrabold text-[9px] uppercase">Ready to File</span>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                                <div className="flex justify-between">
                                  <span>Total Outward Taxable Sales:</span>
                                  <span className="font-mono font-bold">${salesBal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Integrated GST (IGST @ 18%):</span>
                                  <span className="font-mono font-bold">${(salesBal * 0.18).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>

                            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                              <div className="flex justify-between items-center border-b pb-1.5">
                                <span className="font-extrabold text-indigo-700 text-[10px] uppercase">Input Tax Credit (ITC) Reconciliation</span>
                                <span className="text-[9px] text-slate-400 font-bold font-mono">Matched to GSTR-2B</span>
                              </div>
                              <div className="text-xs font-semibold leading-relaxed text-slate-600">
                                All outward purchase bills are matched with supplier invoices. Eligible ITC: <span className="font-mono font-bold text-slate-800">$1,450.00</span>. CGST/SGST reconciliations matched successfully.
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 7. AGING REPORT */}
                        {selectedReportType === 'Aging Report' && (
                          <div className="space-y-4">
                            <div className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">Accounts Receivable Aging Buckets</div>
                            <div className="grid grid-cols-5 gap-3 text-center font-mono font-bold text-xs">
                              <div className="border p-2 bg-slate-50 rounded">
                                <div className="text-[8px] font-bold text-slate-400 uppercase">0-30 Days</div>
                                <div className="text-[#10163A] mt-1">${(salesBal * 0.75).toLocaleString()}</div>
                              </div>
                              <div className="border p-2 bg-slate-50 rounded">
                                <div className="text-[8px] font-bold text-slate-400 uppercase">30-60 Days</div>
                                <div className="text-[#10163A] mt-1">${(salesBal * 0.2).toLocaleString()}</div>
                              </div>
                              <div className="border p-2 bg-slate-50 rounded">
                                <div className="text-[8px] font-bold text-slate-400 uppercase">60-90 Days</div>
                                <div className="text-[#10163A] mt-1">${(salesBal * 0.05).toLocaleString()}</div>
                              </div>
                              <div className="border p-2 bg-slate-50 rounded">
                                <div className="text-[8px] font-bold text-slate-400 uppercase">90+ Days</div>
                                <div className="text-rose-500 mt-1">$0</div>
                              </div>
                              <div className="bg-indigo-50 border border-indigo-200 p-2 rounded">
                                <div className="text-[8px] font-bold text-indigo-500 uppercase">Total Receivables</div>
                                <div className="text-indigo-700 mt-1">${salesBal.toLocaleString()}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 8. BUDGET VS ACTUAL */}
                        {selectedReportType === 'Budget vs Actual' && (
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-[#E1E5EC] text-slate-400 font-bold text-[9px] uppercase tracking-wider">
                                <th className="py-2.5">EXPENSE ACCOUNT NAME</th>
                                <th className="py-2.5 text-right">BUDGET ALLOCATION ($)</th>
                                <th className="py-2.5 text-right">ACTUAL SPEND ($)</th>
                                <th className="py-2.5 text-right">VARIANCE BALANCE</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="py-2">Office & Indirect Expenses</td>
                                <td className="py-2 text-right font-mono font-bold">$5,000</td>
                                <td className="py-2 text-right font-mono font-bold text-slate-700">${officeExpBal.toLocaleString()}</td>
                                <td className="py-2 text-right font-mono font-bold text-emerald-600">+${(5000 - officeExpBal).toLocaleString()}</td>
                              </tr>
                              <tr className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="py-2">Employee Salary Expenses</td>
                                <td className="py-2 text-right font-mono font-bold">$30,000</td>
                                <td className="py-2 text-right font-mono font-bold text-slate-700">${salaryExpBal.toLocaleString()}</td>
                                <td className="py-2 text-right font-mono font-bold text-emerald-600">+${(30000 - salaryExpBal).toLocaleString()}</td>
                              </tr>
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}

                    {/* REPORT CHART VIEW */}
                    {reportViewMode === 'chart' && (
                      <div className="border border-dashed p-8 rounded-lg flex flex-col items-center justify-center space-y-4 bg-slate-50/50">
                        <span className="material-icons-round text-3xl text-indigo-600">bar_chart</span>
                        <div className="text-center">
                          <div className="font-extrabold text-sm text-slate-800">Visualizing Trend Charts</div>
                          <p className="text-xs text-slate-500 mt-1 max-w-sm">Expense allocation vs Sales Revenues trend charts are plotted dynamically using the dashboard modules configs.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DMS SUB-TAB: CUSTOM REPORT BUILDER */}
            {activeReportTab === 'builder' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* LEFT BUILDER CONTROLS */}
                <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-5 shadow-sm space-y-4">
                  <div className="font-extrabold text-xs text-slate-800 border-b pb-2 uppercase tracking-wide">
                    Structure Customizer
                  </div>
                  <form onSubmit={handleSaveCustomStructure} className="space-y-3 text-xs font-semibold text-slate-700">
                    <div>
                      <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Select Account to Custom Relabel</label>
                      <select 
                        value={builderEditingAccountId || 1} 
                        onChange={e => setBuilderEditingAccountId(Number(e.target.value))}
                        className="w-full p-2 border rounded bg-white text-slate-800 font-bold"
                      >
                        {ledgers.map(l => (
                          <option key={l.id} value={l.id}>{l.code} - {l.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Custom Label Name</label>
                      <input 
                        type="text" 
                        value={builderCustomLabel}
                        onChange={e => setBuilderCustomLabel(e.target.value)}
                        placeholder="e.g. SVB Operating cash A/c"
                        className="w-full p-2 border rounded text-slate-800"
                        required
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full text-center bg-[#12A594] hover:bg-[#0B7A6E] text-white py-2 rounded font-extrabold transition"
                    >
                      Save Custom Label
                    </button>
                  </form>
                </div>

                {/* RIGHT CUSTOMIZATIONS PREVIEW */}
                <div className="md:col-span-2 bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-4">
                  <div className="font-extrabold text-xs text-slate-800 border-b pb-2 uppercase tracking-wide">
                    Custom Account Structural Groupings & Relabels
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#E1E5EC] text-[#5B6178] font-extrabold uppercase text-[10px] tracking-wider">
                          <th className="py-2.5">LEDGER CODE</th>
                          <th className="py-2.5">ORIGINAL NAME</th>
                          <th className="py-2.5">CUSTOM TEMPLATE LABEL</th>
                          <th className="py-2.5 text-right">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E1E5EC] text-[#161B33] font-semibold">
                        {customStructures.map(s => {
                          const ledger = ledgers.find(l => l.id === s.accountId);
                          return (
                            <tr key={s.accountId} className="hover:bg-slate-50 transition">
                              <td className="py-2.5 font-mono text-[10px] font-bold text-slate-400">{ledger?.code}</td>
                              <td className="py-2.5 text-slate-700">{ledger?.name}</td>
                              <td className="py-2.5 text-indigo-700 font-bold">{s.customLabel}</td>
                              <td className="py-2.5 text-right">
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 px-2 py-0.2 rounded text-[9px] uppercase font-bold">Relabeled</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* DMS SUB-TAB: SCHEDULES */}
            {activeReportTab === 'schedules' && (
              <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-[#161B33] font-manrope">Scheduled Email Report Subscriptions</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Automate report distributions to auditors, stakeholders, and executives on a cadence.</p>
                  </div>
                  <button 
                    onClick={() => setShowScheduleModal(true)}
                    className="bg-[#12A594] hover:bg-[#0B7A6E] text-white px-3 py-1.5 rounded text-xs font-bold transition"
                  >
                    + Create Schedule
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#E1E5EC] text-[#5B6178] font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-2">SCHEDULE ID</th>
                        <th className="py-3 px-2">REPORT TYPE</th>
                        <th className="py-3 px-2">FREQUENCY</th>
                        <th className="py-3 px-2">RECIPIENTS EMAIL</th>
                        <th className="py-3 px-2">NEXT DISPATCH DATE</th>
                        <th className="py-3 px-2 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E1E5EC] text-[#161B33] font-semibold">
                      {reportSchedules.map(s => (
                        <tr key={s.scheduleId} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-2 font-mono font-bold text-slate-400">{s.scheduleId}</td>
                          <td className="py-3 px-2 font-bold text-[#10163A]">{s.reportName}</td>
                          <td className="py-3 px-2 text-indigo-700 uppercase font-bold text-[10px]">{s.frequency}</td>
                          <td className="py-3 px-2 font-mono text-slate-600">{s.recipients}</td>
                          <td className="py-3 px-2 font-mono font-bold text-slate-500">{s.nextRun}</td>
                          <td className="py-3 px-2 text-right">
                            <button 
                              onClick={() => handleDeleteReportSchedule(s.scheduleId)}
                              className="text-rose-600 hover:text-rose-700 text-[10px] font-bold uppercase"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* DMS SUB-TAB: ACCESS AUDIT */}
            {activeReportTab === 'audit' && (
              <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-4">
                <div className="font-extrabold text-xs text-slate-800 border-b pb-2 uppercase tracking-wide">
                  Financial Reports Generation Access Logs
                </div>
                <div className="overflow-x-auto font-mono text-xs font-semibold text-slate-600">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E1E5EC] text-slate-400 text-[10px] font-bold uppercase">
                        <th className="py-2.5">LOG ID</th>
                        <th className="py-2.5">REPORT TARGET</th>
                        <th className="py-2.5">USER</th>
                        <th className="py-2.5">ACTION TAKEN</th>
                        <th className="py-2.5 text-right">TIMESTAMP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportAccessLogs.map(log => (
                        <tr key={log.logId} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="py-2.5 text-slate-400 font-bold">{log.logId}</td>
                          <td className="py-2.5 font-bold text-[#10163A]">{log.reportName}</td>
                          <td className="py-2.5 font-sans font-bold text-slate-600">{log.user}</td>
                          <td className="py-2.5 font-sans text-slate-500 font-semibold">{log.action}</td>
                          <td className="py-2.5 text-right font-bold text-slate-400">{log.timestamp.slice(0, 16).replace('T', ' ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MODAL: ADD WHAT-IF PROVISIONAL sandbox ENTRY */}
            {showProvisionalModal && (
              <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-extrabold text-base font-manrope text-slate-900 flex items-center gap-1.5">
                      <span className="material-icons-round text-emerald-600 text-sm">science</span> Add What-If Sandbox Adjustment
                    </h3>
                    <button onClick={() => setShowProvisionalModal(false)} className="text-slate-400 hover:text-slate-700">
                      <FiX />
                    </button>
                  </div>
                  
                  <form onSubmit={handleCreateProvisionalEntry} className="space-y-3 text-xs font-semibold text-slate-700">
                    <div>
                      <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Select Account</label>
                      <select 
                        value={provAccount} 
                        onChange={e => setProvAccount(e.target.value)}
                        className="w-full p-2 border rounded bg-white text-slate-800 font-bold"
                      >
                        {ledgers.map(l => (
                          <option key={l.id} value={l.name}>{l.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Provisional Debit ($)</label>
                        <input 
                          type="number" 
                          value={provDr} 
                          onChange={e => setProvDr(Number(e.target.value))}
                          className="w-full p-2 border rounded font-mono font-bold text-slate-800" 
                        />
                      </div>
                      <div>
                        <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Provisional Credit ($)</label>
                        <input 
                          type="number" 
                          value={provCr} 
                          onChange={e => setProvCr(Number(e.target.value))}
                          className="w-full p-2 border rounded font-mono font-bold text-rose-600" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Sandboxed adjustments Notes</label>
                      <input 
                        type="text" 
                        value={provDesc}
                        onChange={e => setProvDesc(e.target.value)}
                        placeholder="e.g. outstanding salary reserves"
                        className="w-full p-2 border rounded text-slate-800"
                        required
                      />
                    </div>

                    <div className="flex gap-2.5 pt-3 border-t">
                      <button type="submit" className="flex-1 bg-[#12A594] hover:bg-[#0B7A6E] text-white py-2 rounded font-extrabold transition">
                        Inject Sandbox Line
                      </button>
                      <button type="button" onClick={() => setShowProvisionalModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded font-bold transition">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL: CREATE SCHEDULE */}
            {showScheduleModal && (
              <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-extrabold text-base font-manrope text-slate-900 flex items-center gap-1.5">
                      <FiCalendar className="text-[#12A594]" /> Configure Email Subscription
                    </h3>
                    <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-700">
                      <FiX />
                    </button>
                  </div>
                  
                  <form onSubmit={handleCreateReportSchedule} className="space-y-3 text-xs font-semibold text-slate-700">
                    <div>
                      <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Report Target</label>
                      <select 
                        value={schedReportName} 
                        onChange={e => setSchedReportName(e.target.value)}
                        className="w-full p-2 border rounded bg-white text-slate-800"
                      >
                        <option value="Balance Sheet">Balance Sheet</option>
                        <option value="Profit & Loss">Profit & Loss Statement</option>
                        <option value="Trial Balance">Trial Balance</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Cadence Frequency</label>
                      <select 
                        value={schedFreq} 
                        onChange={e => setSchedFreq(e.target.value)}
                        className="w-full p-2 border rounded bg-white text-slate-800"
                      >
                        <option value="Weekly">Weekly (Every Monday)</option>
                        <option value="Monthly">Monthly (Last calendar day)</option>
                        <option value="Quarterly">Quarterly</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold uppercase text-[10px] text-slate-500 block mb-1">Recipients Email</label>
                      <input 
                        type="email" 
                        value={schedRecipients}
                        onChange={e => setSchedRecipients(e.target.value)}
                        placeholder="e.g. auditor@superenterprise.com"
                        className="w-full p-2 border rounded text-slate-800 font-bold" 
                        required
                      />
                    </div>

                    <div className="flex gap-2.5 pt-3 border-t">
                      <button type="submit" className="flex-1 bg-[#12A594] hover:bg-[#0B7A6E] text-white py-2 rounded font-extrabold transition">
                        Subscribe Cadence
                      </button>
                      <button type="button" onClick={() => setShowScheduleModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded font-bold transition">
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        );
      }

      case 'crm':
        return (
          <CrmPortal 
            showToast={showToast} 
            openTab={openTab} 
            products={products} 
            vouchers={vouchers} 
            setVouchers={setVouchers} 
          />
        );

      case 'projects':
        return (
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-manrope text-[#161B33]">Project Management Board</h2>
                  <p className="text-xs text-[#5B6178] mt-1">Monitor operational checklists, software audits, and implementation tasks</p>
                </div>
                <button 
                  onClick={() => {
                    const name = window.prompt('Enter project name:', 'Custom Fields Rollout');
                    if (name) {
                      setProjects([...projects, { name, completed: 0, total: 10 }]);
                      showToast(`Project '${name}' roadmap initialized!`, 'success');
                    }
                  }}
                  className="bg-[#12A594] hover:bg-[#0B7A6E] text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition"
                >
                  + Create Project
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((p, idx) => {
                  const pct = (p.completed / p.total) * 100;
                  return (
                    <div key={idx} className="border border-slate-200 rounded-lg p-5 space-y-3 bg-slate-50">
                      <div className="flex items-center justify-between">
                        <h4 className="font-extrabold text-sm font-manrope text-[#10163A]">{p.name}</h4>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          pct === 100 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {pct === 100 ? 'Completed' : 'Active'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-semibold font-mono">
                        Tasks completed: {p.completed} of {p.total}
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#12A594] h-full transition-all duration-300" style={{ width: `${pct}%` }}></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-700">{pct.toFixed(0)}% Done</span>
                        {p.completed < p.total && (
                          <button 
                            onClick={() => {
                              const updated = [...projects];
                              updated[idx].completed += 1;
                              setProjects(updated);
                              showToast('Project checklist task ticked.', 'success');
                            }}
                            className="border border-[#12A594] text-[#12A594] hover:bg-teal-50 px-2.5 py-1 rounded text-[10px] font-bold"
                          >
                            Tick Task
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        );

      case 'profit_loss':
        return (
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-manrope text-[#161B33]">Profit & Loss Statement</h2>
                  <p className="text-xs text-[#5B6178] mt-1">Monitor operational revenues, direct costs, and net margin performance</p>
                </div>
                <div className="flex border border-slate-200 rounded-md overflow-hidden text-xs">
                  <button 
                    onClick={() => setProfitLossView('monthly')}
                    className={`px-3 py-1.5 font-bold ${profitLossView === 'monthly' ? 'bg-[#12A594] text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                  >
                    Monthly
                  </button>
                  <button 
                    onClick={() => setProfitLossView('yearly')}
                    className={`px-3 py-1.5 font-bold ${profitLossView === 'yearly' ? 'bg-[#12A594] text-white' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
                  >
                    Yearly
                  </button>
                </div>
              </div>

              {/* KPI Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">TOTAL REVENUE</div>
                  <div className="font-extrabold text-2xl text-[#12A594] mt-1">
                    {profitLossView === 'monthly' ? '$395,100.00' : '$1,887,000.00'}
                  </div>
                </div>
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">OPERATING EXPENSES</div>
                  <div className="font-extrabold text-2xl text-slate-700 mt-1">
                    {profitLossView === 'monthly' ? '$349,700.00' : '$1,660,000.00'}
                  </div>
                </div>
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">NET PROFIT MARGIN</div>
                  <div className="font-extrabold text-2xl text-green-600 mt-1">
                    {profitLossView === 'monthly' ? '+$45,400.00' : '+$227,000.00'}
                  </div>
                </div>
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">NEGATIVE PERIODS</div>
                  <div className="font-extrabold text-2xl text-orange-600 mt-1">
                    {profitLossView === 'monthly' ? '3' : '1'}
                  </div>
                </div>
              </div>

              {/* Chart Display */}
              <div className="bg-[#121212] border border-[#273449] rounded-xl p-5 font-mono text-white space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Net Value Margin</div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-bold text-green-500">+$24,850.00</span>
                      <span className="text-slate-600 text-base">|</span>
                      <span className="text-xs text-slate-400 font-bold">June 2026</span>
                    </div>
                  </div>
                  <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                    LIVE FEED
                  </span>
                </div>
                <div className="h-64 relative">
                  <canvas ref={plChartRef}></canvas>
                </div>
                <div className="flex items-center justify-between border-t border-[#1E293B] pt-4">
                  <div className="flex gap-2">
                    {['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setPlTimelineView(t as any)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                          plTimelineView === t ? 'bg-white text-slate-900 border-white' : 'bg-transparent text-slate-500 border-[#273449] hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setPlChartType(plChartType === 'line' ? 'candlestick' : 'line')}
                    className="w-8 h-8 rounded-full border border-[#273449] flex items-center justify-center text-slate-400 hover:text-white"
                    title="Toggle Line / Candlestick"
                  >
                    <span className="material-icons-round text-sm">analytics</span>
                  </button>
                </div>
              </div>

              {/* Detailed Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 p-4 border-b border-slate-200">
                  <h3 className="font-extrabold text-sm text-[#10163A]">Detailed Financial Ledger Table</h3>
                </div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E1E5EC] text-[#5B6178] font-extrabold uppercase text-[10px] tracking-wider bg-slate-50">
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4">Revenue</th>
                      <th className="py-3 px-4">Operating Expenses</th>
                      <th className="py-3 px-4">Net Profit / Loss</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E5EC] text-[#161B33]">
                    {(profitLossView === 'monthly' ? [
                      { period: 'April 2026', rev: 24500, exp: 18200, profit: 6300 },
                      { period: 'May 2026', rev: 28000, exp: 21400, profit: 6600 },
                      { period: 'June 2026', rev: 22300, exp: 24800, profit: -2500 },
                      { period: 'July 2026', rev: 31000, exp: 25200, profit: 5800 }
                    ] : [
                      { period: 'FY 2024-25', rev: 365000, exp: 320000, profit: 45000 },
                      { period: 'FY 2025-26', rev: 420000, exp: 385000, profit: 35000 },
                      { period: 'FY 2026-27 (Proj)', rev: 512000, exp: 485000, profit: 27000 }
                    ]).map((r, idx) => (
                      <tr key={idx} className={r.profit < 0 ? 'bg-red-50/20' : 'hover:bg-slate-50 transition'}>
                        <td className="py-3 px-4 font-bold">{r.period}</td>
                        <td className="py-3 px-4 font-semibold text-slate-600">${r.rev.toLocaleString()}</td>
                        <td className="py-3 px-4 font-semibold text-slate-600">${r.exp.toLocaleString()}</td>
                        <td className={`py-3 px-4 font-bold font-mono ${r.profit < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {r.profit < 0 ? '-' : '+'}${Math.abs(r.profit).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            r.profit < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {r.profit < 0 ? 'Net Loss' : 'Profitable'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        );

      case 'help_support':
        return (
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-manrope text-[#161B33]">Help & Support Center</h2>
                  <p className="text-xs text-[#5B6178] mt-1">Access implementation documentation or contact the technical desk</p>
                </div>
                <span className="bg-teal-50 text-teal-700 px-3 py-1 rounded text-xs font-bold border border-teal-200/50">
                  Active License Support
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-extrabold text-base font-manrope text-[#10163A] flex items-center gap-1.5">
                    <span className="material-icons-round text-lg text-[#12A594]">menu_book</span> Quick Start Guides
                  </h3>
                  <div className="space-y-3">
                    <div onClick={() => showToast('Loading ledger guide...')} className="border border-slate-200 rounded-lg p-4 bg-slate-50 cursor-pointer hover:bg-slate-100/50 transition">
                      <h4 className="font-bold text-sm text-slate-800">Double-Entry Account Setup</h4>
                      <p className="text-xs text-slate-500 mt-1">Configure asset and liability classification parameters.</p>
                    </div>
                    <div onClick={() => showToast('Loading stock guide...')} className="border border-slate-200 rounded-lg p-4 bg-slate-50 cursor-pointer hover:bg-slate-100/50 transition">
                      <h4 className="font-bold text-sm text-slate-800">Multi-Warehouse Godowns</h4>
                      <p className="text-xs text-slate-500 mt-1">Assign stock batches, trace quantities, and calculate valuations.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-extrabold text-base font-manrope text-[#10163A] flex items-center gap-1.5">
                    <span className="material-icons-round text-lg text-[#E2662F]">contact_support</span> Open Support Ticket
                  </h3>
                  <form onSubmit={e => { e.preventDefault(); showToast('Support ticket submitted successfully!', 'success'); }} className="border border-slate-200 rounded-lg p-5 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Subject Topic</label>
                      <input type="text" placeholder="e.g. Ledger parity, PDF invoice reports" required className="w-full p-2 border rounded text-xs outline-none focus:border-teal-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase">Urgency</label>
                      <select className="w-full p-2 border rounded text-xs outline-none focus:border-teal-500 bg-white">
                        <option>Low - Question</option>
                        <option>Medium - Functional Issue</option>
                        <option>High - Operational Block</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-[#12A594] hover:bg-[#0B7A6E] text-white py-2 rounded text-xs font-bold transition">
                      Submit Ticket
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </main>
        );

      default:
        return (
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white rounded-lg p-6 text-center text-slate-500 border border-slate-200">
              View "{currentActiveTab.view}" is under active configuration.
            </div>
          </main>
        );
    }
  };

  if (showSettingsConsole) {
    return (
      <SettingsConsole
        companyName={companyName}
        setCompanyName={setCompanyName}
        fiscalYear={fiscalYear}
        setFiscalYear={setFiscalYear}
        planTier={planTier}
        setPlanTier={setPlanTier}
        onBack={() => setShowSettingsConsole(false)}
        showToast={showToast}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#F3F5F9] text-[#161B33] font-sans">
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] px-4 py-2.5 rounded-md shadow-lg text-xs font-bold text-white flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-[#12A594]' : 'bg-[#E2662F]'
        }`}>
          <FiCheckCircle /> {toast.message}
        </div>
      )}

      {/* 1. TOP IDENTITY BAR (App Shell Header) */}
      <header className="bg-[#10163A] text-white h-[60px] px-6 flex items-center justify-between border-b border-white/10 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#12A594] to-[#0B7A6E] text-white rounded-lg flex items-center justify-center font-extrabold text-lg tracking-tighter shadow-md">
            nx
          </div>
          <div className="flex flex-col">
            <h1 className="font-extrabold text-base leading-tight font-manrope tracking-tight">NexOS Enterprise</h1>
            <span className="text-[11px] text-[#12A594] font-semibold tracking-wide">Business management, unified</span>
          </div>
        </div>

        <div className="flex items-center gap-8 text-right">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">COMPANY</div>
            <div className="text-xs font-bold text-white">{companyName}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">FISCAL YEAR</div>
            <div className="text-xs font-bold text-white">{fiscalYear}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PLAN</div>
            <div className="text-xs font-bold text-[#38BDF8]">{planTier}</div>
          </div>
        </div>
      </header>

      {/* 2. RIBBON NAVIGATION BAR */}
      <nav className="bg-[#1B2456] h-[40px] px-4 flex items-center justify-between border-b border-white/5 shrink-0 text-slate-300 font-semibold text-xs z-40">
        <div className="flex items-center h-full">
          <div 
            className="px-4 h-full flex items-center hover:bg-[#232C63] hover:text-white transition cursor-pointer" 
            onClick={() => openTab('dashboard', 'Dashboard', 'dashboard')}
          >
            Dashboard
          </div>

          <div className="relative h-full flex items-center">
            <button 
              onClick={() => setShowMastersDropdown(!showMastersDropdown)}
              className="px-4 h-full flex items-center gap-1 hover:bg-[#232C63] hover:text-white transition cursor-pointer"
            >
              Masters <FiChevronDown />
            </button>

            {showMastersDropdown && (
              <div className="absolute top-full left-0 mt-0.5 bg-white text-slate-900 border border-slate-200 rounded-md shadow-2xl p-4 grid grid-cols-2 gap-4 w-96 z-50">
                <div>
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 border-b pb-1 mb-2">Ledger Accounts</div>
                  <div className="text-xs p-1.5 hover:bg-teal-50 hover:text-teal-800 rounded cursor-pointer font-medium" onClick={() => openTab('accounts_list', 'Ledger Accounts', 'accounts_list')}>
                    All Ledgers Master
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 border-b pb-1 mb-2">Inventory</div>
                  <div className="text-xs p-1.5 hover:bg-teal-50 hover:text-teal-800 rounded cursor-pointer font-medium" onClick={() => openTab('products', 'Products Manager', 'products')}>
                    Stock & Products
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-4 h-full flex items-center hover:bg-[#232C63] hover:text-white transition cursor-pointer" onClick={() => openTab('transactions', 'Transactions', 'transactions')}>Transactions</div>
          <div className="px-4 h-full flex items-center hover:bg-[#232C63] hover:text-white transition cursor-pointer" onClick={() => openTab('payroll', 'Payroll Manager', 'payroll')}>Payroll</div>
          <div className="px-4 h-full flex items-center hover:bg-[#232C63] hover:text-white transition cursor-pointer" onClick={() => openTab('documents', 'Documents', 'documents')}>Documents</div>
          <div className="px-4 h-full flex items-center hover:bg-[#232C63] hover:text-white transition cursor-pointer" onClick={() => openTab('reports', 'Reports Dashboard', 'reports')}>Reports</div>
          <div className="px-4 h-full flex items-center hover:bg-[#232C63] hover:text-white transition cursor-pointer" onClick={() => openTab('crm', 'CRM Portal', 'crm')}>CRM</div>
          <div className="px-4 h-full flex items-center hover:bg-[#232C63] hover:text-white transition cursor-pointer" onClick={() => openTab('projects', 'Projects Board', 'projects')}>Projects</div>
          <div className="px-4 h-full flex items-center hover:bg-[#232C63] hover:text-white transition cursor-pointer" onClick={() => openTab('profit_loss', 'Profit & Loss', 'profit_loss')}>Profit & Loss</div>
          <div className="px-4 h-full flex items-center hover:bg-[#232C63] hover:text-white transition cursor-pointer" onClick={() => openTab('help_support', 'Help & Support', 'help_support')}>Help & support</div>
        </div>

        <button 
          onClick={() => setShowSettingsConsole(true)} 
          className="flex items-center gap-1 text-[#38BDF8] hover:text-white transition cursor-pointer font-semibold"
        >
          <FiSettings /> Settings
        </button>
      </nav>

      {/* 3. ACTIVE TAB STRIP */}
      <div className="bg-white border-b border-[#E1E5EC] px-4 flex items-end h-[42px] shrink-0 gap-1">
        {openTabs.map(t => (
          <div 
            key={t.id}
            onClick={() => setActiveTabId(t.id)}
            className={`px-4 h-[38px] flex items-center gap-2 text-xs font-semibold rounded-t-md cursor-pointer border-b-2 transition ${
              activeTabId === t.id 
                ? 'bg-[#E4F7F4] text-[#0B7A6E] border-[#12A594]' 
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-50'
            }`}
          >
            {t.title}
            {openTabs.length > 1 && (
              <span onClick={(e) => closeTab(e, t.id)} className="text-slate-400 hover:text-rose-600 font-bold ml-1">×</span>
            )}
          </div>
        ))}
      </div>
      {renderTabContent()}

      {/* COPILOT FLOATING FAB BUTTON */}
      <button 
        onClick={() => setCopilotOpen(!copilotOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-[#1B2456] to-[#10163A] text-white flex items-center justify-center shadow-2xl border-2 border-[#12A594] hover:scale-105 transition z-[999]"
      >
        <FiMessageSquare className="text-2xl text-[#12A594]" />
      </button>

      {/* COPILOT ASSISTANT DRAWER PANEL */}
      {copilotOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[370px] sm:w-[420px] max-h-[600px] bg-[#10163A]/95 backdrop-blur-xl text-white rounded-2xl border border-white/20 shadow-2xl p-4 flex flex-col z-[1000] space-y-3 transition-all duration-300">
          
          {/* ASSISTANT HEADER */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs uppercase tracking-wider text-[#12A594]">NexOS Voice Assistant</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-[#12A594]/20 text-[#12A594] border border-[#12A594]/30">
                  {copilotProvider === 'gemini' ? 'Google AI Studio' : copilotProvider === 'chatgpt' ? 'ChatGPT' : copilotProvider.toUpperCase()}
                </span>
              </div>
              <button 
                onClick={() => setCopilotShowSettings(!copilotShowSettings)}
                className="flex items-center gap-1 mt-0.5 text-[10px] text-left hover:underline"
              >
                {copilotKeyLocked ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <FiLock className="text-[10px]" /> 
                    <span>Key Locked & Secured ({copilotModel})</span>
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <FiUnlock className="text-[10px]" /> 
                    <span>API Key Unlocked - Click to Lock</span>
                  </span>
                )}
              </button>
            </div>

            {/* HEADER ACTIONS */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <button 
                onClick={() => {
                  const nextSpeech = !copilotSpeechEnabled;
                  setCopilotSpeechEnabled(nextSpeech);
                  localStorage.setItem('nexos_ai_speech_enabled', nextSpeech ? 'true' : 'false');
                  if (!nextSpeech && 'speechSynthesis' in window) window.speechSynthesis.cancel();
                  showToast(nextSpeech ? '🔊 Voice speech readout enabled' : '🔇 Voice readout muted', 'warning');
                }}
                className={`p-1.5 rounded-lg border border-white/10 transition ${copilotSpeechEnabled ? 'bg-[#12A594]/20 text-[#12A594] border-[#12A594]/40' : 'bg-white/5 hover:text-white'}`}
                title={copilotSpeechEnabled ? 'Voice readout active' : 'Voice readout muted'}
              >
                <FiVolume2 className="text-sm" />
              </button>
              
              <button 
                onClick={() => setCopilotShowSettings(!copilotShowSettings)} 
                className={`p-1.5 rounded-lg border border-white/10 transition ${copilotShowSettings ? 'bg-[#12A594] text-white' : 'bg-white/5 hover:text-white'}`}
                title="API Key & Model Settings"
              >
                <FiSettings className="text-sm" />
              </button>

              <button 
                onClick={handleClearCopilotChat}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:text-rose-400 transition"
                title="Clear Conversation"
              >
                <FiTrash2 className="text-sm" />
              </button>

              <button 
                onClick={() => setCopilotOpen(false)} 
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:text-white transition"
              >
                <FiX className="text-sm" />
              </button>
            </div>
          </div>

          {/* EXPANDABLE SETTINGS & API KEY LOCK DRAWER */}
          {copilotShowSettings && (
            <div className="bg-[#1B2456]/90 border border-[#12A594]/40 rounded-xl p-3 text-xs space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between pb-1 border-b border-white/10">
                <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FiSettings className="text-[#12A594]" /> AI Engine & API Key Lock
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${copilotKeyLocked ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                  {copilotKeyLocked ? '🔒 Key Locked' : '🔓 Unlocked'}
                </span>
              </div>

              {/* Provider Selection */}
              <div>
                <label className="text-slate-300 font-semibold block text-[10px] mb-1">AI Provider</label>
                <select 
                  value={copilotProvider} 
                  disabled={copilotKeyLocked}
                  onChange={e => {
                    const p = e.target.value as any;
                    setCopilotProvider(p);
                    if (p === 'gemini') setCopilotModel('gemini-2.5-flash');
                    else if (p === 'chatgpt') setCopilotModel('gpt-4o-mini');
                    else if (p === 'openrouter') setCopilotModel('openai/gpt-4o-mini');
                  }}
                  className="w-full bg-[#10163A] border border-white/20 text-white rounded p-1.5 outline-none font-medium disabled:opacity-60 cursor-pointer"
                >
                  <option value="gemini">🔵 Google AI Studio (Gemini 2.5 Flash / Pro)</option>
                  <option value="chatgpt">🟢 OpenAI ChatGPT (Direct API)</option>
                  <option value="openrouter">🚀 OpenRouter Hub (All Models)</option>
                  <option value="local">⚡ NexOS Built-in Financial AI (Offline)</option>
                </select>
              </div>

              {/* Model Selection */}
              {copilotProvider !== 'local' && (
                <div>
                  <label className="text-slate-300 font-semibold block text-[10px] mb-1">Model Name</label>
                  <select 
                    value={copilotModel}
                    disabled={copilotKeyLocked}
                    onChange={e => setCopilotModel(e.target.value)}
                    className="w-full bg-[#10163A] border border-white/20 text-white rounded p-1.5 outline-none font-medium disabled:opacity-60 cursor-pointer font-mono"
                  >
                    {copilotProvider === 'gemini' && (
                      <>
                        <option value="gemini-2.5-flash">gemini-2.5-flash (Google AI Studio - Fast & Recommended)</option>
                        <option value="gemini-2.5-pro">gemini-2.5-pro (Google AI Studio - Deep Reasoning)</option>
                        <option value="gemini-1.5-flash">gemini-1.5-flash (High Throughput)</option>
                        <option value="gemini-1.5-pro">gemini-1.5-pro (Extended Context)</option>
                      </>
                    )}
                    {copilotProvider === 'chatgpt' && (
                      <>
                        <option value="gpt-4o-mini">gpt-4o-mini (Fast & Intelligent - Recommended)</option>
                        <option value="gpt-4o">gpt-4o (Flagship Omni)</option>
                        <option value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy)</option>
                      </>
                    )}
                    {copilotProvider === 'openrouter' && (
                      <>
                        <option value="openai/gpt-4o-mini">openai/gpt-4o-mini</option>
                        <option value="openai/gpt-4o">openai/gpt-4o</option>
                        <option value="anthropic/claude-3.5-sonnet">anthropic/claude-3.5-sonnet</option>
                        <option value="deepseek/deepseek-r1">deepseek/deepseek-r1</option>
                      </>
                    )}
                  </select>
                </div>
              )}

              {/* API Key Input & Lock Controls */}
              {copilotProvider !== 'local' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold text-[10px]">
                      {copilotProvider === 'gemini' ? 'Google AI Studio API Key (AIzaSy...)' : copilotProvider === 'chatgpt' ? 'OpenAI ChatGPT API Key (sk-...)' : `${copilotProvider.toUpperCase()} API Key`}
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {copilotKeyLocked ? '🔒 Protected against editing' : '🔓 Editable'}
                    </span>
                  </div>

                  <div className="relative">
                    <input 
                      type={copilotKeyLocked ? "password" : "text"}
                      disabled={copilotKeyLocked}
                      value={copilotKeyLocked && copilotApiKey ? '••••••••••••••••••••••••••••••••' : copilotApiKey}
                      onChange={e => setCopilotApiKey(e.target.value)}
                      placeholder={copilotProvider === 'gemini' ? 'Paste Google AI Studio key (AIzaSy...)' : copilotProvider === 'chatgpt' ? 'Paste sk-proj-... API key' : 'Paste API key...'}
                      className="w-full bg-[#10163A] border border-white/20 text-white rounded p-1.5 outline-none font-mono text-[11px] disabled:opacity-75 disabled:bg-[#10163A]/80 disabled:cursor-not-allowed focus:border-[#12A594]"
                    />
                  </div>

                  {copilotProvider === 'gemini' && !copilotKeyLocked && (
                    <div className="mt-1 text-[9px] text-[#12A594] font-medium flex items-center justify-between">
                      <span>Free keys available at Google AI Studio</span>
                      <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline hover:text-white">
                        aistudio.google.com ↗
                      </a>
                    </div>
                  )}

                  {/* Lock / Unlock Toggle Button */}
                  <div className="flex gap-2 mt-2">
                    {copilotKeyLocked ? (
                      <button 
                        onClick={() => handleToggleLockApiKey(false)}
                        className="flex-1 py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
                      >
                        <FiUnlock className="text-xs" /> Unlock Key to Edit
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleToggleLockApiKey(true)}
                        className="flex-1 py-1.5 px-2 bg-gradient-to-r from-emerald-600 to-[#12A594] hover:opacity-90 text-white rounded font-bold text-[11px] flex items-center justify-center gap-1.5 shadow transition"
                      >
                        <FiLock className="text-xs" /> Lock & Secure API Key
                      </button>
                    )}

                    <button 
                      onClick={handleTestApiKey}
                      className="py-1.5 px-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded font-semibold text-[11px] transition"
                    >
                      Test Connection
                    </button>
                  </div>

                  {copilotTestStatus && (
                    <div className="mt-1.5 text-[10px] font-mono px-2 py-1 rounded bg-black/40 border border-white/10 text-slate-200">
                      {copilotTestStatus}
                    </div>
                  )}
                </div>
              )}

              <div className="text-[10px] text-slate-400 bg-black/20 p-2 rounded border border-white/5 leading-relaxed">
                🔒 <strong>Zero-Leak Security</strong>: Your API key is encrypted directly in your browser's protected vault and protected from accidental modification when locked.
              </div>
            </div>
          )}

          {/* QUICK PROMPT CHIPS */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px] scrollbar-none">
            {[
              { label: '📊 Balance Sheet', q: 'Summarize the current Balance Sheet health and working capital.' },
              { label: '⚖️ Solvency Ratios', q: 'Analyze our Current Ratio and Quick Ratio liquidity.' },
              { label: '📝 Journal Entry', q: 'How to post a compound journal entry for vendor payment with tax deduction?' },
              { label: '🛡️ 6-Layer Security', q: 'What is the operational status of our 6 defense-in-depth firewall layers?' }
            ].map((chip, idx) => (
              <button 
                key={idx}
                onClick={() => handleCopilotSend(chip.q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/10 hover:bg-[#12A594]/30 hover:border-[#12A594] border border-white/10 text-slate-200 text-[10px] font-medium transition"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* MESSAGES CONVERSATION CONTAINER */}
          <div className="h-60 sm:h-64 overflow-y-auto space-y-2.5 text-xs pr-1 scrollbar-thin scrollbar-thumb-white/20">
            {copilotMessages.map((m, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-xl leading-relaxed ${
                  m.sender === 'user' 
                    ? 'bg-[#12A594] text-white self-end ml-8 shadow-md rounded-br-sm' 
                    : 'bg-[#1B2456] text-slate-100 mr-4 shadow-md rounded-bl-sm border border-white/10'
                }`}
              >
                <div className="flex items-center justify-between text-[9px] text-white/60 mb-1 font-semibold uppercase tracking-wider">
                  <span>{m.sender === 'user' ? 'You' : `NexOS AI (${copilotProvider === 'chatgpt' ? 'ChatGPT' : copilotProvider.toUpperCase()})`}</span>
                  <span>{m.timestamp}</span>
                </div>
                <div className="whitespace-pre-wrap font-sans text-xs space-y-1">
                  {m.text}
                </div>
              </div>
            ))}

            {/* Thinking / Streaming Indicator */}
            {copilotIsLoading && (
              <div className="p-3 rounded-xl bg-[#1B2456] text-slate-200 mr-8 shadow-md rounded-bl-sm border border-white/10 flex items-center gap-2">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12A594] animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12A594] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#12A594] animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span className="text-[11px] text-slate-300 font-medium">NexOS AI ({copilotProvider === 'chatgpt' ? 'ChatGPT' : copilotProvider}) is thinking...</span>
              </div>
            )}
            <div ref={copilotChatEndRef} />
          </div>

          {/* INPUT BAR WITH VOICE RECOGNITION & SUBMIT */}
          <div className="flex items-center gap-2 pt-1">
            <button 
              onClick={toggleVoiceInput}
              className={`p-2 rounded-lg border transition ${
                copilotIsListening 
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse' 
                  : 'bg-[#1B2456] text-slate-300 border-white/20 hover:text-white hover:border-[#12A594]'
              }`}
              title={copilotIsListening ? 'Listening... click to stop' : 'Click to Speak'}
            >
              {copilotIsListening ? <FiMicOff className="text-sm" /> : <FiMic className="text-sm" />}
            </button>

            <input 
              type="text" 
              value={copilotInput} 
              onChange={e => setCopilotInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleCopilotSend()}
              placeholder={copilotIsListening ? "Listening to your voice..." : "Ask AI Copilot (like ChatGPT)..."} 
              className="flex-1 bg-[#1B2456] border border-white/20 text-white text-xs px-3 py-2 rounded-lg outline-none focus:border-[#12A594] transition"
            />

            <button 
              onClick={() => handleCopilotSend()} 
              disabled={copilotIsLoading || !copilotInput.trim()}
              className="bg-[#12A594] text-white p-2 rounded-lg hover:bg-[#0B7A6E] disabled:opacity-50 disabled:cursor-not-allowed transition shadow"
            >
              <FiSend className="text-sm" />
            </button>
          </div>
        </div>
      )}

      {/* NEW LEDGER ACCOUNT MODAL */}
      {showNewLedgerModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base font-manrope text-slate-900">+ Create New Ledger Account</h3>
              <button onClick={() => setShowNewLedgerModal(false)} className="text-slate-400 hover:text-slate-700">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleCreateLedger} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Account Code</label>
                <input 
                  type="text" 
                  value={newCode} 
                  onChange={e => setNewCode(e.target.value)} 
                  className="w-full mt-1 p-2 border rounded font-mono font-bold text-slate-900 outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Account Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. JPMorgan Chase Bank" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  className="w-full mt-1 p-2 border rounded font-semibold text-slate-900 outline-none focus:border-teal-500"
                  required
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Group Classification</label>
                <select value={newGroup} onChange={e => setNewGroup(e.target.value)} className="w-full mt-1 p-2 border rounded font-semibold outline-none">
                  <option value="Bank Accounts">Bank Accounts</option>
                  <option value="Sales Account">Sales Account</option>
                  <option value="Indirect Expenses">Indirect Expenses</option>
                  <option value="Sundry Debtors">Sundry Debtors</option>
                  <option value="Sundry Creditors">Sundry Creditors</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Opening Balance ($)</label>
                  <input 
                    type="number" 
                    value={newOpeningBal} 
                    onChange={e => setNewOpeningBal(Number(e.target.value))} 
                    className="w-full mt-1 p-2 border rounded font-mono font-bold outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">D/C Type</label>
                  <select value={newDc} onChange={e => setNewDc(e.target.value as 'DEBIT' | 'CREDIT')} className="w-full mt-1 p-2 border rounded font-bold outline-none">
                    <option value="DEBIT">DEBIT</option>
                    <option value="CREDIT">CREDIT</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-[#12A594] hover:bg-[#0B7A6E] text-white py-2 rounded font-bold">
                  Save Account
                </button>
                <button type="button" onClick={() => setShowNewLedgerModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded font-semibold">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base font-manrope text-slate-900">NexOS System Settings</h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-700">
                <FiX />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Company Name</label>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full mt-1 p-2 border rounded font-semibold" />
              </div>
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Fiscal Year</label>
                <input type="text" value={fiscalYear} onChange={e => setFiscalYear(e.target.value)} className="w-full mt-1 p-2 border rounded font-semibold" />
              </div>
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Plan Tier</label>
                <input type="text" value={planTier} onChange={e => setPlanTier(e.target.value)} className="w-full mt-1 p-2 border rounded font-semibold text-blue-600" />
              </div>
            </div>
            <button onClick={() => setShowSettingsModal(false)} className="w-full bg-[#10163A] text-white py-2 rounded font-bold text-xs mt-4">
              Close & Apply
            </button>
          </div>
        </div>
      )}


      {/* QUICK INVOICE MODAL */}
      {showQuickInvoiceModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base font-manrope text-slate-900 flex items-center gap-1.5">
                <FiPlus className="text-[#12A594]" /> New Quick Invoice
              </h3>
              <button onClick={() => setShowQuickInvoiceModal(false)} className="text-slate-400 hover:text-slate-700">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleCreateQuickInvoice} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Customer Name</label>
                <select 
                  value={quickInvCustomer} 
                  onChange={e => setQuickInvCustomer(e.target.value)} 
                  className="w-full mt-1 p-2 border rounded font-semibold bg-white"
                >
                  <option value="Acme Corp">Acme Corp</option>
                  <option value="ByteDance Inc">ByteDance Inc</option>
                  <option value="Oracle Cloud Corp">Oracle Cloud Corp</option>
                  <option value="Tesla Supply Chain">Tesla Supply Chain</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Invoice Amount ($)</label>
                <input 
                  type="number" 
                  value={quickInvAmt} 
                  onChange={e => setQuickInvAmt(Number(e.target.value))} 
                  className="w-full mt-1 p-2 border rounded font-mono font-bold outline-none focus:border-[#12A594]" 
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-[#12A594] hover:bg-[#0B7A6E] text-white py-2 rounded font-bold transition">
                  Create Invoice
                </button>
                <button type="button" onClick={() => setShowQuickInvoiceModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded font-semibold transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK RECORD PAYMENT MODAL */}
      {showQuickPaymentModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base font-manrope text-slate-900 flex items-center gap-1.5">
                <FiDollarSign className="text-emerald-500" /> Record Quick Payment
              </h3>
              <button onClick={() => setShowQuickPaymentModal(false)} className="text-slate-400 hover:text-slate-700">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleCreateQuickPayment} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Voucher Type</label>
                  <select 
                    value={quickPayType} 
                    onChange={e => setQuickPayType(e.target.value as 'Receipt' | 'Payment')} 
                    className="w-full mt-1 p-2 border rounded font-bold bg-white"
                  >
                    <option value="Receipt">Receipt (Inflow)</option>
                    <option value="Payment">Payment (Outflow)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Amount ($)</label>
                  <input 
                    type="number" 
                    value={quickPayAmt} 
                    onChange={e => setQuickPayAmt(Number(e.target.value))} 
                    className="w-full mt-1 p-2 border rounded font-mono font-bold outline-none focus:border-[#12A594]" 
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Description</label>
                <input 
                  type="text" 
                  value={quickPayDesc} 
                  onChange={e => setQuickPayDesc(e.target.value)} 
                  placeholder="e.g. Acme Corp invoice settlement"
                  className="w-full mt-1 p-2 border rounded font-semibold outline-none focus:border-[#12A594]" 
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-[#12A594] hover:bg-[#0B7A6E] text-white py-2 rounded font-bold transition">
                  Post Voucher
                </button>
                <button type="button" onClick={() => setShowQuickPaymentModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded font-semibold transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD EXPENSE MODAL */}
      {showQuickExpenseModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base font-manrope text-slate-900 flex items-center gap-1.5">
                <FiTrendingDown className="text-[#E2662F]" /> Log Quick Expense
              </h3>
              <button onClick={() => setShowQuickExpenseModal(false)} className="text-slate-400 hover:text-slate-700">
                <FiX />
              </button>
            </div>
            <form onSubmit={handleCreateQuickExpense} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Expense Ledger</label>
                  <select 
                    value={quickExpCategory} 
                    onChange={e => setQuickExpCategory(e.target.value)} 
                    className="w-full mt-1 p-2 border rounded font-semibold bg-white"
                  >
                    <option value="Office Expense A/C">Office Expense A/C</option>
                    <option value="Rent & Rates A/C">Rent & Rates A/C</option>
                    <option value="Electricity & Power A/C">Electricity & Power A/C</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase text-[10px]">Amount ($)</label>
                  <input 
                    type="number" 
                    value={quickExpAmt} 
                    onChange={e => setQuickExpAmt(Number(e.target.value))} 
                    className="w-full mt-1 p-2 border rounded font-mono font-bold outline-none focus:border-[#12A594]" 
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px]">Description</label>
                <input 
                  type="text" 
                  value={quickExpDesc} 
                  onChange={e => setQuickExpDesc(e.target.value)} 
                  placeholder="e.g. Broadband internet bill"
                  className="w-full mt-1 p-2 border rounded font-semibold outline-none focus:border-[#12A594]" 
                  required
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-[#12A594] hover:bg-[#0B7A6E] text-white py-2 rounded font-bold transition">
                  Save Expense
                </button>
                <button type="button" onClick={() => setShowQuickExpenseModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded font-semibold transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* KPI DRILL-DOWN SLIDE-OVER DRAWER */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[9999] overflow-hidden">
          {/* Overlay backdrop */}
          <div 
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-[#10163A]/40 backdrop-blur-sm transition-opacity duration-300"
          ></div>
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between animate-slide-in">
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#10163A] text-white">
                <div>
                  <h3 className="font-extrabold text-base uppercase tracking-wider font-manrope">
                    {drawerType === 'ledgers' && 'Ledger Accounts'}
                    {drawerType === 'sales' && 'Sales Analysis'}
                    {drawerType === 'expenses' && 'Expenses Analysis'}
                    {drawerType === 'cash' && 'Cash Allocations'}
                  </h3>
                  <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wide">Detailed dashboard breakdown</p>
                </div>
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="text-white hover:text-rose-400 font-extrabold text-lg p-1 transition"
                >
                  <FiX />
                </button>
              </div>
              
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                {drawerType === 'ledgers' && (
                  <div className="space-y-4">
                    <p className="text-slate-500 font-semibold leading-relaxed">
                      Below is the system group-wise breakdown of all corporate ledger accounts:
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b pb-2 border-slate-100">
                        <span className="font-bold text-slate-700">Bank Accounts</span>
                        <span className="bg-[#EFF6FF] text-[#1E40AF] px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                          {ledgers.filter(l => l.group === 'Bank Accounts').length} Accounts
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2 border-slate-100">
                        <span className="font-bold text-slate-700">Sales Accounts</span>
                        <span className="bg-[#EAF5EE] text-[#2E9E5B] px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                          {ledgers.filter(l => l.group === 'Sales Account').length} Accounts
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2 border-slate-100">
                        <span className="font-bold text-slate-700">Indirect Expenses</span>
                        <span className="bg-[#FEFCE8] text-[#854D0E] px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                          {ledgers.filter(l => l.group === 'Indirect Expenses').length} Accounts
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {drawerType === 'sales' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider mb-2">Top Customers this Month</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border">
                          <span className="font-bold text-slate-700">Acme Corp</span>
                          <span className="font-bold font-mono text-slate-800">${(12500 * multiplier).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border">
                          <span className="font-bold text-slate-700">ByteDance Inc</span>
                          <span className="font-bold font-mono text-slate-800">${(8300 * multiplier).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border">
                          <span className="font-bold text-slate-700">Tesla Supply Chain</span>
                          <span className="font-bold font-mono text-slate-800">${(4050 * multiplier).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider mb-2">Top Products by Revenue</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border">
                          <span className="font-bold text-slate-700">Raw Steel Sheets (Grade A)</span>
                          <span className="text-teal-600 font-bold">120 units sold</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border">
                          <span className="font-bold text-slate-700">Copper Wires (0.5mm)</span>
                          <span className="text-teal-600 font-bold">850 units sold</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {drawerType === 'expenses' && (
                  <div className="space-y-4">
                    <p className="text-slate-500 font-semibold leading-relaxed">
                      Itemized breakdown of corporate outflow accounts:
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b pb-2 border-slate-100">
                        <span className="font-bold text-slate-700">Material Purchases</span>
                        <span className="font-bold font-mono text-slate-800">${(8210 * multiplier).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2 border-slate-100">
                        <span className="font-bold text-slate-700">Direct Cost (Freight & Rent)</span>
                        <span className="font-bold font-mono text-slate-800">${(2400 * multiplier).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2 border-slate-100">
                        <span className="font-bold text-slate-700">Indirect Cost (Stationery & Food)</span>
                        <span className="font-bold font-mono text-slate-800">${(600 * multiplier).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                )}

                {drawerType === 'cash' && (
                  <div className="space-y-4">
                    <p className="text-slate-500 font-semibold leading-relaxed">
                      Liquid cash distribution across registered corporate asset accounts:
                    </p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center border-b pb-2 border-slate-100">
                        <span className="font-bold text-slate-700">Silicon Valley Bank (SVB A/C)</span>
                        <span className="font-bold font-mono text-[#2E9E5B]">${(35000 * multiplier).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between items-center border-b pb-2 border-slate-100">
                        <span className="font-bold text-slate-700">Petty Cash Register</span>
                        <span className="font-bold font-mono text-[#2E9E5B]">${(3400 * multiplier).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="w-full bg-[#10163A] hover:bg-[#1B2456] text-white py-2 rounded text-xs font-bold transition select-none"
                >
                  Close Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
