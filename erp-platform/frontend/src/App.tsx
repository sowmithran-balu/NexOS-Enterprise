import React, { useState, useEffect, useRef } from 'react';
import { 
  FiPlus, FiTrash2, FiUser, FiCheckCircle, FiXCircle, 
  FiDollarSign, FiTrendingUp, FiTrendingDown, FiBookOpen, FiBriefcase, 
  FiLayers, FiClock, FiFileText, FiPieChart, FiDatabase, 
  FiLogOut, FiSearch, FiCalendar, FiCheck, FiX, FiRefreshCw, 
  FiSettings, FiChevronDown, FiMic, FiMicOff, FiSend, FiVolume2, FiInfo, FiMessageSquare
} from 'react-icons/fi';
import SettingsConsole from './pages/SettingsConsole';

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
    { id: 3, code: 'ACT-10001', name: 'Office Expense A/C', group: 'Indirect Expenses', openingBalance: 2400, dc: 'DEBIT' }
  ]);

  // New Ledger Modal Form State
  const [showNewLedgerModal, setShowNewLedgerModal] = useState(false);
  const [newCode, setNewCode] = useState('ACT-10004');
  const [newName, setNewName] = useState('');
  const [newGroup, setNewGroup] = useState('Bank Accounts');
  const [newOpeningBal, setNewOpeningBal] = useState(0);
  const [newDc, setNewDc] = useState<'DEBIT' | 'CREDIT'>('DEBIT');

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

  const [employees, setEmployees] = useState([
    { id: 'EMP-01', name: 'Alexander Wright', dept: 'Engineering', desg: 'Principal Engineer', sal: 8500.00, status: 'Unpaid' },
    { id: 'EMP-02', name: 'Sarah Jenkins', dept: 'Finance', desg: 'Lead Accountant', sal: 6200.00, status: 'Unpaid' },
    { id: 'EMP-03', name: 'Marcus Chen', dept: 'Sales', desg: 'VP Sales East', sal: 7800.00, status: 'Unpaid' }
  ]);

  const [documents, setDocuments] = useState([
    { name: 'audit_report_q2_draft.pdf', cat: 'Compliance', size: '1.4 MB', date: '2026-07-12', user: 'admin' },
    { name: 'office_rent_agreement.pdf', cat: 'Bills & Receipts', size: '2.1 MB', date: '2026-07-09', user: 'admin' },
    { name: 'database_restore_point.bak', cat: 'Backups', size: '241.8 MB', date: '2026-07-09', user: 'system' }
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

  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [profitLossView, setProfitLossView] = useState<'monthly' | 'yearly'>('monthly');
  const [plTimelineView, setPlTimelineView] = useState<'1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y'>('1Y');
  const [plChartType, setPlChartType] = useState<'line' | 'candlestick'>('line');

  // Chart Canvas Refs
  const salesExpensesChartRef = useRef<HTMLCanvasElement | null>(null);
  const monthwiseExpensesChartRef = useRef<HTMLCanvasElement | null>(null);
  const plChartRef = useRef<HTMLCanvasElement | null>(null);

  // Voice / Copilot State
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copilotMessages, setCopilotMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    { sender: 'assistant', text: 'Hello! I am your NexOS Voice Assistant. How can I help with your financial operations?' }
  ]);
  const [copilotInput, setCopilotInput] = useState('');

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
                  data: [12500, 15300, 18200, 17000, 21400, 24850],
                  backgroundColor: '#12A594',
                  borderRadius: 4,
                  barPercentage: 0.6,
                  categoryPercentage: 0.5
                },
                {
                  label: 'Expenses',
                  data: [8200, 9100, 11400, 10200, 11800, 14000],
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
                  data: [12500, 0, 0],
                  backgroundColor: '#232C63',
                  borderRadius: 4,
                  barThickness: 36
                },
                {
                  label: 'Direct',
                  data: [0, 4800, 0],
                  backgroundColor: '#E2662F',
                  borderRadius: 4,
                  barThickness: 36
                },
                {
                  label: 'Indirect',
                  data: [0, 0, 6700],
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
  }, [currentActiveTab?.view]);

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

  // Voice / Chat Assistant Command
  const handleCopilotSend = () => {
    if (!copilotInput.trim()) return;
    const txt = copilotInput;
    setCopilotMessages(prev => [...prev, { sender: 'user', text: txt }]);
    setCopilotInput('');

    let reply = `I received your request: "${txt}". Operations executed.`;
    const lower = txt.toLowerCase();
    if (lower.includes('ledger') || lower.includes('account')) {
      reply = `You have ${ledgers.length} registered ledger accounts: Silicon Valley Bank, Acme Corp Sales, Office Expense.`;
    } else if (lower.includes('sales') || lower.includes('revenue')) {
      reply = 'Sales this month stand at $24,850.00 (+14.2% vs last month).';
    } else if (lower.includes('cash')) {
      reply = 'Cash in hand is currently $38,400.00 (+5.1% vs last week).';
    }

    setTimeout(() => {
      setCopilotMessages(prev => [...prev, { sender: 'assistant', text: reply }]);
    }, 300);
  };

  const renderTabContent = () => {
    switch (currentActiveTab.view) {
      case 'dashboard':
        return (
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* ROW 1: 4 METRIC CARDS MATCHING EXACT SCREENSHOT */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Card 1: LEDGER ACCOUNTS */}
              <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-5 flex flex-col justify-between shadow-sm min-h-[115px]">
                <div className="text-[11px] font-bold uppercase text-[#5B6178] tracking-wider">LEDGER ACCOUNTS</div>
                <div className="font-extrabold text-3xl font-manrope text-[#161B33] my-1">{ledgers.length}</div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2E9E5B]">
                  <span className="w-2 h-2 rounded-full bg-[#2E9E5B]"></span> + Active accounts
                </div>
              </div>

              {/* Card 2: SALES THIS MONTH */}
              <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-5 flex flex-col justify-between shadow-sm min-h-[115px]">
                <div className="text-[11px] font-bold uppercase text-[#5B6178] tracking-wider">SALES THIS MONTH</div>
                <div className="font-extrabold text-3xl font-manrope text-[#161B33] my-1">$24,850.00</div>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#2E9E5B]">
                  <FiTrendingUp /> +14.2% vs last month
                </div>
              </div>

              {/* Card 3: EXPENSES THIS MONTH */}
              <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-5 flex flex-col justify-between shadow-sm min-h-[115px]">
                <div className="text-[11px] font-bold uppercase text-[#5B6178] tracking-wider">EXPENSES THIS MONTH</div>
                <div className="font-extrabold text-3xl font-manrope text-[#161B33] my-1">$11,210.00</div>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#2E9E5B]">
                  <FiTrendingDown /> -2.4% vs last month
                </div>
              </div>

              {/* Card 4: CASH IN HAND */}
              <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-5 flex flex-col justify-between shadow-sm min-h-[115px]">
                <div className="text-[11px] font-bold uppercase text-[#5B6178] tracking-wider">CASH IN HAND</div>
                <div className="font-extrabold text-3xl font-manrope text-[#161B33] my-1">$38,400.00</div>
                <div className="flex items-center gap-1 text-xs font-semibold text-[#2E9E5B]">
                  <FiTrendingUp /> +5.1% vs last week
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
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-base font-manrope text-[#161B33]">Recent Ledger Accounts</h2>
                <button 
                  onClick={() => setShowNewLedgerModal(true)}
                  className="border-[1.5px] border-[#2563EB] text-[#2563EB] bg-white hover:bg-blue-50 px-3 py-1.5 rounded-md text-xs font-extrabold flex items-center gap-1 transition"
                >
                  + New account
                </button>
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
                    {ledgers.slice(0, 5).map(l => (
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

      case 'transactions':
        return (
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-manrope text-[#161B33]">Transactions Journal</h2>
                  <p className="text-xs text-[#5B6178] mt-1">Audit and record journal entries, receipts, and client bank settlement vouchers</p>
                </div>
                <button 
                  onClick={() => {
                    const newTx = {
                      id: `VT-${Date.now().toString().slice(-3)}`,
                      date: new Date().toISOString().split('T')[0],
                      desc: 'Manual Sales Posting',
                      deb: 'Silicon Valley Bank',
                      cred: 'Acme Corp Sales A/C',
                      amt: 1850.00,
                      type: 'Receipt'
                    };
                    setTransactions([newTx, ...transactions]);
                    showToast('Transaction posted successfully to sales journal ledger!', 'success');
                  }}
                  className="bg-[#12A594] hover:bg-[#0B7A6E] text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition"
                >
                  + Post Transaction
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E1E5EC] text-[#5B6178] font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-2">VOUCHER ID</th>
                      <th className="py-3 px-2">DATE</th>
                      <th className="py-3 px-2">DESCRIPTION</th>
                      <th className="py-3 px-2">DEBIT ACCOUNT</th>
                      <th className="py-3 px-2">CREDIT ACCOUNT</th>
                      <th className="py-3 px-2">AMOUNT</th>
                      <th className="py-3 px-2 text-right">TYPE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E5EC] text-[#161B33]">
                    {transactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-2 font-mono font-bold text-slate-700">{t.id}</td>
                        <td className="py-3 px-2 text-slate-500 font-semibold">{t.date}</td>
                        <td className="py-3 px-2 font-bold">{t.desc}</td>
                        <td className="py-3 px-2 text-slate-600 font-semibold">{t.deb}</td>
                        <td className="py-3 px-2 text-slate-600 font-semibold">{t.cred}</td>
                        <td className="py-3 px-2 font-bold font-mono text-sm">${t.amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-2 text-right">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold font-mono uppercase ${
                            t.type === 'Receipt' ? 'bg-[#EAF5EE] text-[#2E9E5B] border border-[#2E9E5B]/30' : 'bg-[#FFF3EC] text-[#E2662F] border border-[#E2662F]/30'
                          }`}>
                            {t.type}
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

      case 'payroll':
        return (
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-manrope text-[#161B33]">Payroll & Salary Manager</h2>
                  <p className="text-xs text-[#5B6178] mt-1">Manage employee profiles, payroll distributions, and tax deductions</p>
                </div>
                <button 
                  onClick={() => {
                    showToast('Compiling employee timesheets and salary components...', 'success');
                    setTimeout(() => {
                      setEmployees(employees.map(emp => ({ ...emp, status: 'Paid' })));
                      showToast('Payroll Cycle executed. 3 employees successfully paid.', 'success');
                    }, 1200);
                  }}
                  className="bg-[#12A594] hover:bg-[#0B7A6E] text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <span className="material-icons-round text-sm">play_arrow</span> Run Payroll Cycle
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E1E5EC] text-[#5B6178] font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-2">ID</th>
                      <th className="py-3 px-2">EMPLOYEE NAME</th>
                      <th className="py-3 px-2">DEPARTMENT</th>
                      <th className="py-3 px-2">DESIGNATION</th>
                      <th className="py-3 px-2">GROSS SALARY</th>
                      <th className="py-3 px-2 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E5EC] text-[#161B33]">
                    {employees.map(emp => (
                      <tr key={emp.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-2 font-mono font-bold text-slate-700">{emp.id}</td>
                        <td className="py-3 px-2 font-bold text-sm text-[#161B33]">{emp.name}</td>
                        <td className="py-3 px-2 font-semibold text-slate-600">{emp.dept}</td>
                        <td className="py-3 px-2 text-slate-500 font-semibold">{emp.desg}</td>
                        <td className="py-3 px-2 font-bold font-mono text-sm">${emp.sal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3 px-2 text-right">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold font-mono uppercase ${
                            emp.status === 'Paid' ? 'bg-[#EAF5EE] text-[#2E9E5B] border border-[#2E9E5B]/30' : 'bg-[#FFF3EC] text-[#E2662F] border border-[#E2662F]/30'
                          }`}>
                            {emp.status}
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

      case 'documents':
        return (
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-manrope text-[#161B33]">Document Explorer</h2>
                  <p className="text-xs text-[#5B6178] mt-1">Securely archive tax sheets, bills, compliance agreements, and snapshots</p>
                </div>
                <button 
                  onClick={() => {
                    const name = window.prompt('Enter file name to upload:', 'new_tax_compliance_filing.pdf');
                    if (name) {
                      const newDoc = {
                        name,
                        cat: 'Compliance',
                        size: '1.8 MB',
                        date: new Date().toISOString().split('T')[0],
                        user: 'admin'
                      };
                      setDocuments([newDoc, ...documents]);
                      showToast(`File ${name} uploaded successfully to secure vault!`, 'success');
                    }
                  }}
                  className="bg-[#12A594] hover:bg-[#0B7A6E] text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <span className="material-icons-round text-sm">cloud_upload</span> Upload Document
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E1E5EC] text-[#5B6178] font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-2">FILE NAME</th>
                      <th className="py-3 px-2">CATEGORY</th>
                      <th className="py-3 px-2">SIZE</th>
                      <th className="py-3 px-2">UPLOAD DATE</th>
                      <th className="py-3 px-2 text-right">USER</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E1E5EC] text-[#161B33]">
                    {documents.map((doc, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-2 font-bold text-sm text-[#2563EB] hover:underline cursor-pointer" onClick={() => showToast(`Downloading ${doc.name}...`)}>{doc.name}</td>
                        <td className="py-3 px-2 font-semibold text-slate-600">{doc.cat}</td>
                        <td className="py-3 px-2 font-mono font-semibold text-slate-500">{doc.size}</td>
                        <td className="py-3 px-2 text-slate-500 font-semibold">{doc.date}</td>
                        <td className="py-3 px-2 text-right font-semibold text-slate-700">{doc.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        );

      case 'reports':
        return (
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-manrope text-[#161B33]">Financial Reports & Audits</h2>
                  <p className="text-xs text-[#5B6178] mt-1">Generate statutory financial statements, balance sheets, and audit books</p>
                </div>
                <button 
                  onClick={() => showToast('Auditor Pack generated. ZIP download started.', 'success')}
                  className="bg-[#12A594] hover:bg-[#0B7A6E] text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition"
                >
                  Export Auditor Pack
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 space-y-3">
                  <h4 className="font-extrabold text-base font-manrope text-[#10163A]">Balance Sheet</h4>
                  <p className="text-xs text-slate-600">Detailed snapshot of assets, liabilities, and equity balances.</p>
                  <button 
                    onClick={() => setActiveReport('Balance Sheet')}
                    className="w-full text-center border border-[#12A594] text-[#12A594] bg-white hover:bg-teal-50 px-3 py-2 rounded-md text-xs font-extrabold transition"
                  >
                    View Report
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 space-y-3">
                  <h4 className="font-extrabold text-base font-manrope text-[#10163A]">Profit & Loss</h4>
                  <p className="text-xs text-slate-600">Trading summary showing sales revenues and operating expenses.</p>
                  <button 
                    onClick={() => setActiveReport('Profit & Loss Statement')}
                    className="w-full text-center border border-[#12A594] text-[#12A594] bg-white hover:bg-teal-50 px-3 py-2 rounded-md text-xs font-extrabold transition"
                  >
                    View Report
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg p-5 bg-slate-50 space-y-3">
                  <h4 className="font-extrabold text-base font-manrope text-[#10163A]">Trial Balance</h4>
                  <p className="text-xs text-slate-600">Parity checks comparing debit balances vs credit balances.</p>
                  <button 
                    onClick={() => setActiveReport('Trial Balance Parity Check')}
                    className="w-full text-center border border-[#12A594] text-[#12A594] bg-white hover:bg-teal-50 px-3 py-2 rounded-md text-xs font-extrabold transition"
                  >
                    View Report
                  </button>
                </div>
              </div>
            </div>
          </main>
        );

      case 'crm':
        return (
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg p-6 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-manrope text-[#161B33]">CRM Portal</h2>
                  <p className="text-xs text-[#5B6178] mt-1">Track pipeline deal stages, active negotiations, and closed opportunities</p>
                </div>
                <button 
                  onClick={() => {
                    const name = window.prompt('Enter Lead Name:', 'ByteDance Inc');
                    if (name) {
                      const newLead = {
                        id: `LD-${Date.now().toString().slice(-3)}`,
                        name,
                        ref: 'BD-801',
                        amt: 45000.00,
                        status: 'Qualification',
                        label: 'Hot'
                      };
                      setLeads([...leads, newLead]);
                      showToast(`New lead '${name}' added to Qualification stage.`, 'success');
                    }
                  }}
                  className="bg-[#12A594] hover:bg-[#0B7A6E] text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition"
                >
                  + Add New Lead
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['Qualification', 'Proposal Sent', 'Negotiation', 'Closed Won'].map(stage => {
                  const stageLeads = leads.filter(l => l.status === stage);
                  return (
                    <div key={stage} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                      <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-600 mb-2">
                        {stage} ({stageLeads.length})
                      </h4>
                      {stageLeads.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs italic">No deals in this stage</div>
                      ) : (
                        stageLeads.map(l => (
                          <div key={l.id} className="bg-white border border-slate-200 rounded-md p-3 shadow-sm space-y-2">
                            <div className="font-bold text-slate-900 text-sm">{l.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">Ref: {l.ref}</div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-[#10163A]">${l.amt.toLocaleString()}</span>
                              <span className="bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">{l.label}</span>
                            </div>
                            <div className="flex items-center justify-end gap-1.5 border-t pt-2 mt-2">
                              {stage !== 'Qualification' && (
                                <button 
                                  onClick={() => {
                                    const stages = ['Qualification', 'Proposal Sent', 'Negotiation', 'Closed Won'];
                                    const idx = stages.indexOf(stage);
                                    setLeads(leads.map(lead => lead.id === l.id ? { ...lead, status: stages[idx - 1] } : lead));
                                  }}
                                  className="text-slate-400 hover:text-slate-600 text-xs p-1"
                                >
                                  &larr;
                                </button>
                              )}
                              {stage !== 'Closed Won' && (
                                <button 
                                  onClick={() => {
                                    const stages = ['Qualification', 'Proposal Sent', 'Negotiation', 'Closed Won'];
                                    const idx = stages.indexOf(stage);
                                    setLeads(leads.map(lead => lead.id === l.id ? { ...lead, status: stages[idx + 1] } : lead));
                                  }}
                                  className="text-slate-400 hover:text-slate-600 text-xs p-1"
                                >
                                  &rarr;
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
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
        <div className="fixed bottom-24 right-6 w-80 bg-[#10163A] text-white rounded-xl border border-white/20 shadow-2xl p-4 flex flex-col z-[1000] space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-extrabold text-xs uppercase tracking-wider text-[#12A594]">NexOS Voice Assistant</span>
            <button onClick={() => setCopilotOpen(false)} className="text-slate-400 hover:text-white">
              <FiX />
            </button>
          </div>
          <div className="h-48 overflow-y-auto space-y-2 text-xs">
            {copilotMessages.map((m, idx) => (
              <div key={idx} className={`p-2 rounded-md ${m.sender === 'user' ? 'bg-[#12A594] text-white self-end ml-6' : 'bg-[#1B2456] text-slate-200 mr-6'}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={copilotInput} 
              onChange={e => setCopilotInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleCopilotSend()}
              placeholder="Ask AI Copilot..." 
              className="flex-1 bg-[#1B2456] border border-white/20 text-white text-xs px-2.5 py-1.5 rounded outline-none"
            />
            <button onClick={handleCopilotSend} className="bg-[#12A594] text-white p-2 rounded hover:bg-[#0B7A6E]">
              <FiSend />
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

      {/* ACTIVE REPORT POPUP MODAL */}
      {activeReport && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base font-manrope text-slate-900">{activeReport}</h3>
              <button onClick={() => setActiveReport(null)} className="text-slate-400 hover:text-slate-700 text-lg">&times;</button>
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              {activeReport === 'Balance Sheet' ? (
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b">
                      <th className="p-2">Particulars</th>
                      <th className="p-2 text-right">Debit ($)</th>
                      <th className="p-2 text-right">Credit ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    <tr className="font-bold"><td className="p-2">Assets</td><td></td><td></td></tr>
                    <tr><td className="p-2 pl-4">Silicon Valley Bank</td><td className="p-2 text-right">$45,000.00</td><td className="p-2 text-right">-</td></tr>
                    <tr><td className="p-2 pl-4">Acme Corp (Debtor)</td><td className="p-2 text-right">$12,500.00</td><td className="p-2 text-right">-</td></tr>
                    <tr><td className="p-2 pl-4">Stock-in-hand</td><td className="p-2 text-right">$52,290.00</td><td className="p-2 text-right">-</td></tr>
                    <tr className="font-bold"><td className="p-2">Liabilities & Equity</td><td></td><td></td></tr>
                    <tr><td className="p-2 pl-4">Globex Logistics (Creditor)</td><td className="p-2 text-right">-</td><td className="p-2 text-right">$8,400.00</td></tr>
                    <tr><td className="p-2 pl-4">Equity Capital A/c</td><td className="p-2 text-right">-</td><td className="p-2 text-right">$101,390.00</td></tr>
                    <tr className="font-extrabold bg-teal-50"><td className="p-2">Total</td><td className="p-2 text-right text-teal-600">$109,790.00</td><td className="p-2 text-right text-teal-600">$109,790.00</td></tr>
                  </tbody>
                </table>
              ) : activeReport === 'Profit & Loss Statement' ? (
                <table className="w-full text-xs text-left border-collapse">
                  <tbody className="divide-y text-slate-700">
                    <tr className="font-bold bg-slate-100"><td className="p-2">Operating Revenues</td><td className="p-2 text-right">$24,850.00</td></tr>
                    <tr><td className="p-2 pl-4">Sales Invoices</td><td className="p-2 text-right">$24,850.00</td></tr>
                    <tr className="font-bold bg-slate-100"><td className="p-2">Direct Cost of Sales</td><td className="p-2 text-right">$11,210.00</td></tr>
                    <tr><td className="p-2 pl-4">Cost of Materials</td><td className="p-2 text-right">$8,210.00</td></tr>
                    <tr><td className="p-2 pl-4">Logistics & Shipping</td><td className="p-2 text-right">$3,000.00</td></tr>
                    <tr className="font-extrabold bg-teal-50"><td className="p-2">Net Trading Profit</td><td className="p-2 text-right text-green-600">$13,640.00</td></tr>
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b">
                      <th className="p-2">Ledger Account</th>
                      <th className="p-2 text-right">Debit ($)</th>
                      <th className="p-2 text-right">Credit ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-700">
                    <tr><td className="p-2">Silicon Valley Bank</td><td className="p-2 text-right">$45,000.00</td><td className="p-2 text-right">-</td></tr>
                    <tr><td className="p-2">Acme Corp</td><td className="p-2 text-right">$12,500.00</td><td className="p-2 text-right">-</td></tr>
                    <tr><td className="p-2">Globex Logistics</td><td className="p-2 text-right">-</td><td className="p-2 text-right">$8,400.00</td></tr>
                    <tr><td className="p-2">Sales Account</td><td className="p-2 text-right">-</td><td className="p-2 text-right">$24,850.00</td></tr>
                    <tr><td className="p-2">Logistics Expense A/c</td><td className="p-2 text-right">$8,400.00</td><td className="p-2 text-right">-</td></tr>
                    <tr><td className="p-2">Equity Capital A/c</td><td className="p-2 text-right">-</td><td className="p-2 text-right">$45,000.00</td></tr>
                    <tr className="font-extrabold bg-teal-50"><td className="p-2">Total Parity</td><td className="p-2 text-right text-teal-600">$65,900.00</td><td className="p-2 text-right text-teal-600">$65,900.00</td></tr>
                  </tbody>
                </table>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t pt-3">
              <button onClick={() => window.print()} className="border px-4 py-1.5 rounded bg-slate-50 hover:bg-slate-100 text-xs font-bold">Print</button>
              <button onClick={() => setActiveReport(null)} className="bg-[#12A594] text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-[#0B7A6E]">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
