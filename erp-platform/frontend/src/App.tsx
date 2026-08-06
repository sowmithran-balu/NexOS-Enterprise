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

  // Chart Canvas Refs
  const salesExpensesChartRef = useRef<HTMLCanvasElement | null>(null);
  const monthwiseExpensesChartRef = useRef<HTMLCanvasElement | null>(null);

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
                  <div className="text-xs p-1.5 hover:bg-teal-50 hover:text-teal-800 rounded cursor-pointer font-medium" onClick={() => openTab('dashboard', 'Dashboard', 'dashboard')}>
                    All Ledgers Master
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase text-slate-400 border-b pb-1 mb-2">Inventory</div>
                  <div className="text-xs p-1.5 hover:bg-teal-50 hover:text-teal-800 rounded cursor-pointer font-medium" onClick={() => openTab('dashboard', 'Dashboard', 'dashboard')}>
                    Stock & Products
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-4 h-full flex items-center hover:bg-[#232C63] hover:text-white transition cursor-pointer">Transactions</div>
          <div className="px-4 h-full flex items-center hover:bg-[#232C63] hover:text-white transition cursor-pointer">Payroll</div>
          <div className="px-4 h-full flex items-center hover:bg-[#232C63] hover:text-white transition cursor-pointer">Documents</div>
          <div className="px-4 h-full flex items-center hover:bg-[#232C63] hover:text-white transition cursor-pointer">Reports</div>
          <div className="px-4 h-full flex items-center hover:bg-[#232C63] hover:text-white transition cursor-pointer">CRM</div>
          <div className="px-4 h-full flex items-center hover:bg-[#232C63] hover:text-white transition cursor-pointer">Projects</div>
          <div className="px-4 h-full flex items-center hover:bg-[#232C63] hover:text-white transition cursor-pointer">Profit & Loss</div>
          <div className="px-4 h-full flex items-center hover:bg-[#232C63] hover:text-white transition cursor-pointer">Help & support</div>
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

      {/* 4. MAIN DASHBOARD CONTENT WORKSPACE */}
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
              + + New account
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
    </div>
  );
}
