import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiSearch, FiCalendar, FiClock, FiCheck, FiX, FiUsers, 
  FiDollarSign, FiMail, FiPhone, FiMessageSquare, FiList, FiGrid, 
  FiTable, FiTrendingUp, FiAlertTriangle, FiAlertCircle, FiSettings, 
  FiCheckSquare, FiPlusCircle, FiUserCheck, FiPaperclip, FiArrowRight, 
  FiArrowLeft, FiEdit, FiTrash2, FiFileText, FiChevronDown, FiUser
} from 'react-icons/fi';

// Props matching the expected state from App.tsx
interface CrmPortalProps {
  showToast: (msg: string, type?: 'success' | 'error' | 'warning') => void;
  openTab: (id: string, title: string, view: string) => void;
  products: any[];
  vouchers: any[];
  setVouchers: React.Dispatch<React.SetStateAction<any[]>>;
}

interface QuotedProduct {
  productId: string;
  quantity: number;
  price: number;
}

interface ActivityLog {
  id: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Note' | 'StageChange' | 'DocumentAttached' | 'System';
  description: string;
  performedBy: string;
  performedAt: string;
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  assignedTo: string;
  status: 'Pending' | 'Completed' | 'Overdue';
}

interface Contact {
  name: string;
  email: string;
  phone: string;
  designation: string;
  companySize: string;
  industry: string;
}

interface Deal {
  id: string;
  ref: string;
  name: string;
  value: number;
  stage: 'Qualification' | 'Proposal Sent' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  temperature: 'Hot' | 'Warm' | 'Cold';
  probability: number; // percentage
  isManualProbability: boolean;
  expectedCloseDate: string;
  actualCloseDate?: string;
  source: 'Referral' | 'Website' | 'Cold Outreach' | 'Trade Show';
  owner: string;
  createdAt: string;
  stageUpdatedAt: string;
  lostReason?: 'Price' | 'Competitor' | 'Timing' | 'No Budget' | '';
  contact: Contact;
  quotedProducts: QuotedProduct[];
  activities: ActivityLog[];
  tasks: Task[];
  notes: string;
  isStale: boolean;
  score: number; // engagement/fit score 0-100
}

const STAGES = ['Qualification', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'] as const;
const STAGE_PROBABILITIES = {
  'Qualification': 10,
  'Proposal Sent': 40,
  'Negotiation': 70,
  'Closed Won': 100,
  'Closed Lost': 0
};

// Current system date for mock calculations
const CURRENT_DATE = new Date('2026-08-10');

export default function CrmPortal({ showToast, openTab, products, vouchers, setVouchers }: CrmPortalProps) {
  // Initial Deals setup
  const [deals, setDeals] = useState<Deal[]>([
    {
      id: 'LD-801',
      ref: 'BD-801',
      name: 'ByteDance Inc',
      value: 45000.00,
      stage: 'Qualification',
      temperature: 'Hot',
      probability: 10,
      isManualProbability: false,
      expectedCloseDate: '2026-08-25',
      source: 'Website',
      owner: 'admin',
      createdAt: '2026-08-01T10:00:00Z',
      stageUpdatedAt: '2026-08-01T10:00:00Z',
      isStale: false,
      score: 85,
      contact: {
        name: 'Li Wei',
        email: 'li.wei@bytedance.com',
        phone: '+86 10 5836 1000',
        designation: 'Procurement Manager',
        companySize: '10,000+ employees',
        industry: 'Internet Technology'
      },
      quotedProducts: [
        { productId: 'PD-103', quantity: 40, price: 950.00 },
        { productId: 'PD-102', quantity: 154, price: 45.50 }
      ],
      activities: [
        { id: 'act-1', type: 'System', description: 'Lead captured from Website demo request', performedBy: 'System', performedAt: '2026-08-01T10:00:00Z' },
        { id: 'act-2', type: 'Call', description: 'Initial qualification call. High interest in finished gearbox assemblies.', performedBy: 'admin', performedAt: '2026-08-02T14:30:00Z' }
      ],
      tasks: [
        { id: 'tsk-1', title: 'Send corporate profile and catalog', dueDate: '2026-08-12', assignedTo: 'admin', status: 'Pending' }
      ],
      notes: 'Interested in bulk purchase for their robotics division. Needs custom gear ratios.'
    },
    {
      id: 'LD-802',
      ref: 'OC-221',
      name: 'Oracle Cloud Corp',
      value: 95000.00,
      stage: 'Proposal Sent',
      temperature: 'Warm',
      probability: 40,
      isManualProbability: false,
      expectedCloseDate: '2026-09-12',
      source: 'Cold Outreach',
      owner: 'Sarah Jenkins',
      createdAt: '2026-07-28T09:15:00Z',
      stageUpdatedAt: '2026-08-04T16:00:00Z',
      isStale: false,
      score: 65,
      contact: {
        name: 'John Miller',
        email: 'john.miller@oracle.com',
        phone: '+1 (415) 555-0198',
        designation: 'Infrastructure Director',
        companySize: '50,000+ employees',
        industry: 'Software & Cloud'
      },
      quotedProducts: [
        { productId: 'PD-101', quantity: 300, price: 280.00 },
        { productId: 'PD-103', quantity: 11, price: 950.00 }
      ],
      activities: [
        { id: 'act-3', type: 'System', description: 'Outreach campaign response logged', performedBy: 'System', performedAt: '2026-07-28T09:15:00Z' },
        { id: 'act-4', type: 'Meeting', description: 'Technical scoping session on steel sheets compatibility', performedBy: 'Sarah Jenkins', performedAt: '2026-08-02T11:00:00Z' },
        { id: 'act-5', type: 'StageChange', description: 'Stage updated from Qualification to Proposal Sent', performedBy: 'Sarah Jenkins', performedAt: '2026-08-04T16:00:00Z' }
      ],
      tasks: [
        { id: 'tsk-2', title: 'Follow up on proposal feedback', dueDate: '2026-08-15', assignedTo: 'Sarah Jenkins', status: 'Pending' }
      ],
      notes: 'Required specific structural grading certifications. Emailed proposal deck.'
    },
    {
      id: 'LD-803',
      ref: 'TS-404',
      name: 'Tesla Supply Chain',
      value: 120000.00,
      stage: 'Negotiation',
      temperature: 'Hot',
      probability: 70,
      isManualProbability: false,
      expectedCloseDate: '2026-08-18',
      source: 'Referral',
      owner: 'David Miller',
      createdAt: '2026-07-15T11:00:00Z',
      stageUpdatedAt: '2026-07-23T10:30:00Z', // 18 days in current stage (Neg) as of Aug 10
      isStale: false,
      score: 92,
      contact: {
        name: 'Sarah Connor',
        email: 'sconnor@tesla.com',
        phone: '+1 (650) 555-4309',
        designation: 'Strategic Sourcing Manager',
        companySize: '10,000+ employees',
        industry: 'Automotive'
      },
      quotedProducts: [
        { productId: 'PD-101', quantity: 400, price: 280.00 },
        { productId: 'PD-102', quantity: 175, price: 45.50 }
      ],
      activities: [
        { id: 'act-6', type: 'System', description: 'Referral registered from partner network', performedBy: 'System', performedAt: '2026-07-15T11:00:00Z' },
        { id: 'act-7', type: 'Email', description: 'NDA signed & engineering specifications received', performedBy: 'David Miller', performedAt: '2026-07-18T15:20:00Z' },
        { id: 'act-8', type: 'StageChange', description: 'Stage updated from Proposal Sent to Negotiation', performedBy: 'David Miller', performedAt: '2026-07-23T10:30:00Z' }
      ],
      tasks: [
        { id: 'tsk-3', title: 'Price discount negotiation approval', dueDate: '2026-08-08', assignedTo: 'David Miller', status: 'Overdue' }
      ],
      notes: 'Negotiating volume discount. They requested a 5% price cut on steel sheets.'
    }
  ]);

  // Accounts persistence (Customer 360)
  const [accounts360, setAccounts360] = useState([
    { accountId: 'ACC-501', companyName: 'Stark Industries', industry: 'Defense & Aerospace', convertedFromDealId: 'LD-790', totalLtv: 540000.00, createdAt: '2026-06-12' },
    { accountId: 'ACC-502', companyName: 'Wayne Enterprises', industry: 'Conglomerate', convertedFromDealId: 'LD-795', totalLtv: 980000.00, createdAt: '2026-07-05' }
  ]);

  // Views & Filters state
  const [currentView, setCurrentView] = useState<'kanban' | 'list' | 'table' | 'forecast' | 'analytics' | 'customer360'>('kanban');
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [activeOwnerFilter, setActiveOwnerFilter] = useState<'my' | 'team'>('team');
  const [searchQuery, setSearchQuery] = useState('');
  const [temperatureFilter, setTemperatureFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'value' | 'owner' | 'close_date'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Interactive edit states for inline deal cards
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'value' | 'ref' | 'temp' | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Dropdown for Lost Reason
  const [showLostModal, setShowLostModal] = useState(false);
  const [lostDealId, setLostDealId] = useState<string | null>(null);
  const [selectedLostReason, setSelectedLostReason] = useState<'Price' | 'Competitor' | 'Timing' | 'No Budget' | ''>('');

  // Drawer timeline manual entry state
  const [manualTimelineType, setManualTimelineType] = useState<'Call' | 'Email' | 'Meeting' | 'Note'>('Call');
  const [manualTimelineDesc, setManualTimelineDesc] = useState('');

  // Drawer Task Creator state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskOwner, setNewTaskOwner] = useState('admin');

  // Mention autocomplete helper
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSearchText, setMentionSearchText] = useState('');
  const [noteText, setNoteText] = useState('');
  const teamMembers = ['admin', 'Sarah Jenkins', 'David Miller', 'Finance Director', 'Inventory Head'];

  // Automation rules state
  const [automationRules, setAutomationRules] = useState([
    { ruleId: 'AR-01', name: 'Proposal Sent -> Auto-create Document Checklist', triggerEvent: 'StageChanged', condition: 'status == "Proposal Sent"', action: 'CreateDocument', isActive: true },
    { ruleId: 'AR-02', name: 'Closed Won -> Auto-trigger ERP Sales Order', triggerEvent: 'StageChanged', condition: 'status == "Closed Won"', action: 'CreateSalesOrder', isActive: true },
    { ruleId: 'AR-03', name: 'Stale Deal Alert -> Mark Untouched (>30 days)', triggerEvent: 'DealStale', condition: 'daysSinceUpdate > 30', action: 'SendNotification', isActive: true }
  ]);
  const [showAutomationPanel, setShowAutomationPanel] = useState(false);

  // New Lead Modal States
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadVal, setNewLeadVal] = useState(25000);
  const [newLeadOwner, setNewLeadOwner] = useState('admin');
  const [newLeadSource, setNewLeadSource] = useState<'Referral' | 'Website' | 'Cold Outreach' | 'Trade Show'>('Website');
  const [newLeadTemp, setNewLeadTemp] = useState<'Hot' | 'Warm' | 'Cold'>('Warm');
  const [newLeadContactName, setNewLeadContactName] = useState('');
  const [newLeadContactEmail, setNewLeadContactEmail] = useState('');

  const selectedDeal = deals.find(d => d.id === selectedDealId);

  // Auto decay calculation for stale deals (>30 days since update) on boot
  useEffect(() => {
    setDeals(prevDeals => 
      prevDeals.map(d => {
        const updateDate = new Date(d.stageUpdatedAt);
        const diffTime = Math.abs(CURRENT_DATE.getTime() - updateDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          ...d,
          isStale: diffDays > 30
        };
      })
    );
  }, []);

  // Compute calculated values
  const getDealAging = (deal: Deal) => {
    const updateDate = new Date(deal.stageUpdatedAt);
    const diffTime = Math.abs(CURRENT_DATE.getTime() - updateDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const getFilteredDeals = () => {
    return deals.filter(d => {
      // Search matches ref or company name
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.ref.toLowerCase().includes(searchQuery.toLowerCase());
      
      // User / Team Filter
      const matchesOwnerType = activeOwnerFilter === 'my' ? d.owner === 'admin' : true;
      
      // Temperature filter
      const matchesTemp = temperatureFilter === 'all' ? true : d.temperature === temperatureFilter;
      
      // Specific Owner Filter
      const matchesOwner = ownerFilter === 'all' ? true : d.owner === ownerFilter;

      return matchesSearch && matchesOwnerType && matchesTemp && matchesOwner;
    }).sort((a, b) => {
      let multiplier = sortOrder === 'desc' ? -1 : 1;
      if (sortBy === 'value') {
        return (a.value - b.value) * multiplier;
      }
      if (sortBy === 'owner') {
        return a.owner.localeCompare(b.owner) * multiplier;
      }
      if (sortBy === 'close_date') {
        return a.expectedCloseDate.localeCompare(b.expectedCloseDate) * multiplier;
      }
      return 0;
    });
  };

  const openDeals = deals.filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost');
  
  // Pipeline intelligence: Weighted pipeline value: sum(value * probability %)
  const weightedPipeline = openDeals.reduce((sum, d) => sum + (d.value * (d.probability / 100)), 0);
  
  // Total Open Opportunities
  const totalOpenDeals = openDeals.length;

  // Win rate: Closed Won / (Closed Won + Closed Lost)
  const closedWonCount = deals.filter(d => d.stage === 'Closed Won').length;
  const closedLostCount = deals.filter(d => d.stage === 'Closed Lost').length;
  const totalClosed = closedWonCount + closedLostCount;
  const winRate = totalClosed > 0 ? Math.round((closedWonCount / totalClosed) * 100) : 75; // Mock starting win rate if no closed deals

  // Average sales cycle velocity (mocked based on data)
  const salesVelocity = '24 days';

  // Handle stage change with automation triggers
  const handleStageChange = (dealId: string, newStage: Deal['stage'], lostReason?: Deal['lostReason']) => {
    let salesOrderCreated = false;
    let documentCreated = false;

    setDeals(prevDeals => prevDeals.map(d => {
      if (d.id === dealId) {
        const timestamp = new Date().toISOString();
        const prevStage = d.stage;
        
        // Setup default probability based on new stage
        const newProb = STAGE_PROBABILITIES[newStage];
        const probToSet = d.isManualProbability ? d.probability : newProb;

        // Auto-score logic: moving stages increments engagement
        const currentScore = Math.min(100, d.score + 5);

        // Stage history activity log item
        const activityItem: ActivityLog = {
          id: `act-${Date.now()}`,
          type: 'StageChange',
          description: `Stage changed from ${prevStage} to ${newStage}${lostReason ? ` (Reason: ${lostReason})` : ''}`,
          performedBy: 'admin',
          performedAt: timestamp
        };

        // Automations triggered
        if (newStage === 'Closed Won' && prevStage !== 'Closed Won') {
          salesOrderCreated = true;
          // Trigger Sales Order Creation in ERP Vouchers
          const newVoucher = {
            voucherId: `VOU-${Date.now().toString().slice(-4)}`,
            voucherType: 'Sales' as const,
            voucherNumber: `SO-2026-${Date.now().toString().slice(-3)}`,
            date: CURRENT_DATE.toISOString().split('T')[0],
            fiscalYear: 'FY 2026-27',
            fiscalPeriod: 'August',
            narration: `Automated Sales Order created via CRM Deal Won conversion for ${d.name}. Ref: ${d.ref}`,
            referenceNumber: d.ref,
            sourceModule: 'Sales' as const,
            sourceDocumentId: d.id,
            status: 'Approved' as const,
            createdBy: 'CRM-Automation',
            createdAt: timestamp,
            attachments: [],
            currency: 'USD',
            exchangeRate: 1.0,
            totalDebit: d.value,
            totalCredit: d.value,
            lines: [
              { lineId: 1, accountId: 10, debitAmount: d.value, creditAmount: 0, lineNarration: 'Receivable created for Won Deal' },
              { lineId: 2, accountId: 5, debitAmount: 0, creditAmount: d.value, lineNarration: 'Sales Revenue booked' }
            ],
            history: [
              { logId: 1, action: 'Created' as const, performedBy: 'CRM-Automation', performedAt: timestamp, details: 'Created automatically upon Closed Won stage' },
              { logId: 2, action: 'Approved' as const, performedBy: 'admin', performedAt: timestamp, details: 'Authorized automatically via sales cadence rule' }
            ]
          };
          setVouchers(prev => [newVoucher, ...prev]);
        }

        if (newStage === 'Proposal Sent' && prevStage !== 'Proposal Sent') {
          documentCreated = true;
        }

        return {
          ...d,
          stage: newStage,
          probability: probToSet,
          stageUpdatedAt: timestamp,
          lostReason: lostReason || '',
          score: currentScore,
          actualCloseDate: (newStage === 'Closed Won' || newStage === 'Closed Lost') ? timestamp.split('T')[0] : undefined,
          activities: [...d.activities, activityItem]
        };
      }
      return d;
    }));

    if (salesOrderCreated) {
      showToast(`Deal Won! ERP Sales Order created in Transactions.`, 'success');
    }
    if (documentCreated) {
      showToast(`Proposal Sent: Created proposal placeholder document.`, 'success');
    }
  };

  // Convert to Customer Account (Post-conversion 360)
  const handleConvertToAccount = (deal: Deal) => {
    if (accounts360.some(acc => acc.convertedFromDealId === deal.id)) {
      showToast('Account already exists for this client.', 'warning');
      return;
    }
    const newAcc = {
      accountId: `ACC-${Date.now().toString().slice(-3)}`,
      companyName: deal.name,
      industry: deal.contact.industry || 'Enterprise',
      convertedFromDealId: deal.id,
      totalLtv: deal.value,
      createdAt: CURRENT_DATE.toISOString().split('T')[0]
    };
    setAccounts360([...accounts360, newAcc]);
    showToast(`Account '${deal.name}' created in Customer 360 database!`, 'success');
  };

  // Run round-robin lead assignment rules
  const handleRoundRobinAssignment = () => {
    let unassigned = deals.filter(d => d.owner === 'Unassigned' || !d.owner);
    if (unassigned.length === 0) {
      showToast('All active deals are already assigned to owners.', 'warning');
      return;
    }
    const reps = ['admin', 'Sarah Jenkins', 'David Miller'];
    setDeals(prevDeals => {
      let repIndex = 0;
      return prevDeals.map(d => {
        if (d.owner === 'Unassigned' || !d.owner) {
          const assignedRep = reps[repIndex];
          repIndex = (repIndex + 1) % reps.length;
          
          const log: ActivityLog = {
            id: `act-${Date.now()}-${d.id}`,
            type: 'System',
            description: `Auto-assigned to ${assignedRep} via CRM Round-Robin Rule`,
            performedBy: 'System',
            performedAt: new Date().toISOString()
          };
          return { ...d, owner: assignedRep, activities: [...d.activities, log] };
        }
        return d;
      });
    });
    showToast(`Round-Robin run: ${unassigned.length} leads assigned to team.`, 'success');
  };

  // Drag and Drop implementation
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStage: Deal['stage']) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    if (!dealId) return;

    if (targetStage === 'Closed Lost') {
      setLostDealId(dealId);
      setShowLostModal(true);
    } else {
      handleStageChange(dealId, targetStage);
    }
  };

  // Inline editing handler
  const triggerInlineEdit = (dealId: string, field: 'value' | 'ref' | 'temp', currentValue: string) => {
    setEditingCardId(dealId);
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveInlineEdit = (dealId: string) => {
    if (!editingField) return;

    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        let updatedObj = { ...d };
        if (editingField === 'value') {
          const parsed = parseFloat(editValue.replace(/[^0-9.]/g, ''));
          updatedObj.value = isNaN(parsed) ? d.value : parsed;
        } else if (editingField === 'ref') {
          updatedObj.ref = editValue;
        } else if (editingField === 'temp') {
          updatedObj.temperature = editValue as Deal['temperature'];
        }
        
        // Log the edit activity
        const log: ActivityLog = {
          id: `act-${Date.now()}`,
          type: 'System',
          description: `Field '${editingField}' updated directly on card`,
          performedBy: 'admin',
          performedAt: new Date().toISOString()
        };
        updatedObj.activities = [...d.activities, log];
        return updatedObj;
      }
      return d;
    }));

    setEditingCardId(null);
    setEditingField(null);
  };

  // Add new lead form submission
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim()) return;

    const newDeal: Deal = {
      id: `LD-${Date.now().toString().slice(-3)}`,
      ref: `REF-${Math.floor(100 + Math.random() * 900)}`,
      name: newLeadName,
      value: newLeadVal,
      stage: 'Qualification',
      temperature: newLeadTemp,
      probability: 10,
      isManualProbability: false,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
      source: newLeadSource,
      owner: newLeadOwner,
      createdAt: new Date().toISOString(),
      stageUpdatedAt: new Date().toISOString(),
      isStale: false,
      score: 50,
      contact: {
        name: newLeadContactName || 'Main Contact',
        email: newLeadContactEmail || 'contact@client.com',
        phone: '',
        designation: 'Buyer',
        companySize: '100-500 employees',
        industry: 'Services'
      },
      quotedProducts: [],
      activities: [
        { id: `act-new-${Date.now()}`, type: 'System', description: 'Lead manually created in pipeline', performedBy: 'admin', performedAt: new Date().toISOString() }
      ],
      tasks: [],
      notes: ''
    };

    setDeals([newDeal, ...deals]);
    setShowNewLeadModal(false);
    // Reset Form
    setNewLeadName('');
    setNewLeadVal(25000);
    setNewLeadContactName('');
    setNewLeadContactEmail('');
    showToast(`Lead '${newLeadName}' added to Qualification stage.`, 'success');
  };

  // Timeline entry addition
  const handleAddTimelineEntry = (dealId: string) => {
    if (!manualTimelineDesc.trim()) return;

    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        const item: ActivityLog = {
          id: `act-${Date.now()}`,
          type: manualTimelineType,
          description: manualTimelineDesc,
          performedBy: 'admin',
          performedAt: new Date().toISOString()
        };
        // Auto score adjustment for interaction
        const newScore = Math.min(100, d.score + 3);
        return {
          ...d,
          score: newScore,
          activities: [...d.activities, item]
        };
      }
      return d;
    }));

    setManualTimelineDesc('');
    showToast('Activity logged in timeline.', 'success');
  };

  // Task creation inside drawer
  const handleAddTask = (dealId: string) => {
    if (!newTaskTitle.trim()) return;

    const taskItem: Task = {
      id: `tsk-${Date.now()}`,
      title: newTaskTitle,
      dueDate: newTaskDueDate || CURRENT_DATE.toISOString().split('T')[0],
      assignedTo: newTaskOwner,
      status: 'Pending'
    };

    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        return { ...d, tasks: [...d.tasks, taskItem] };
      }
      return d;
    }));

    setNewTaskTitle('');
    setNewTaskDueDate('');
    showToast('New reminder task created.', 'success');
  };

  // Toggle Task Completed
  const handleToggleTask = (dealId: string, taskId: string) => {
    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        return {
          ...d,
          tasks: d.tasks.map(t => t.id === taskId ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' } : t)
        };
      }
      return d;
    }));
  };

  // Quote Products list management
  const handleAddProductToQuote = (dealId: string, prodId: string) => {
    const prodObj = products.find(p => p.id === prodId);
    if (!prodObj) return;

    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        const existing = d.quotedProducts.find(qp => qp.productId === prodId);
        let updatedQuote = [...d.quotedProducts];

        if (existing) {
          updatedQuote = d.quotedProducts.map(qp => qp.productId === prodId ? { ...qp, quantity: qp.quantity + 1 } : qp);
        } else {
          updatedQuote.push({ productId: prodId, quantity: 1, price: prodObj.price });
        }

        // Auto calculate deal value based on quoted products
        const newValue = updatedQuote.reduce((sum, qp) => sum + (qp.price * qp.quantity), 0);

        return {
          ...d,
          quotedProducts: updatedQuote,
          value: newValue
        };
      }
      return d;
    }));
  };

  const handleRemoveProductFromQuote = (dealId: string, prodId: string) => {
    setDeals(prev => prev.map(d => {
      if (d.id === dealId) {
        const updatedQuote = d.quotedProducts.filter(qp => qp.productId !== prodId);
        const newValue = updatedQuote.reduce((sum, qp) => sum + (qp.price * qp.quantity), 0);

        return {
          ...d,
          quotedProducts: updatedQuote,
          value: newValue
        };
      }
      return d;
    }));
  };

  const handleNoteTextChange = (text: string) => {
    setNoteText(text);
    const lastWord = text.split(/\s+/).pop() || '';
    if (lastWord.startsWith('@')) {
      setShowMentionSuggestions(true);
      setMentionSearchText(lastWord.slice(1));
    } else {
      setShowMentionSuggestions(false);
    }
  };

  const applyMention = (username: string) => {
    const words = noteText.split(/\s+/);
    words.pop(); // remove the partial mention
    const completed = [...words, `@${username} `].join(' ');
    setNoteText(completed);
    setShowMentionSuggestions(false);
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/10 min-h-screen">
      {/* Top Banner Stats Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weighted Pipeline value */}
        <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-700 shadow flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Weighted Pipeline</p>
            <h3 className="text-2xl font-black font-manrope text-teal-400">
              ${weightedPipeline.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-400">Probability adjusted value</p>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <FiDollarSign className="text-xl text-teal-400" />
          </div>
        </div>

        {/* Opportunities Count */}
        <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-700 shadow flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Active Deals</p>
            <h3 className="text-2xl font-black font-manrope text-blue-400">{totalOpenDeals}</h3>
            <p className="text-[10px] text-slate-400">Total in progress</p>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <FiUsers className="text-xl text-blue-400" />
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-700 shadow flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Closing Win Rate</p>
            <h3 className="text-2xl font-black font-manrope text-emerald-400">{winRate}%</h3>
            <p className="text-[10px] text-slate-400">Conversion efficiency</p>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <FiCheck className="text-xl text-emerald-400" />
          </div>
        </div>

        {/* Sales Velocity */}
        <div className="bg-slate-900 text-white rounded-lg p-5 border border-slate-700 shadow flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-extrabold">Sales Velocity</p>
            <h3 className="text-2xl font-black font-manrope text-amber-400">{salesVelocity}</h3>
            <p className="text-[10px] text-slate-400">Average deal lifecycle</p>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <FiClock className="text-xl text-amber-400" />
          </div>
        </div>
      </div>

      {/* Main CRM Workspace Container */}
      <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg shadow-sm space-y-4">
        {/* Navigation Tab / View Switcher Header */}
        <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setCurrentView('kanban')} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                currentView === 'kanban' ? 'bg-[#161B33] text-white' : 'hover:bg-slate-200 text-slate-600'
              }`}
            >
              <FiGrid /> Kanban Board
            </button>
            <button 
              onClick={() => setCurrentView('list')} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                currentView === 'list' ? 'bg-[#161B33] text-white' : 'hover:bg-slate-200 text-slate-600'
              }`}
            >
              <FiList /> List View
            </button>
            <button 
              onClick={() => setCurrentView('table')} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                currentView === 'table' ? 'bg-[#161B33] text-white' : 'hover:bg-slate-200 text-slate-600'
              }`}
            >
              <FiTable /> Data Table
            </button>
            <button 
              onClick={() => setCurrentView('forecast')} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                currentView === 'forecast' ? 'bg-[#161B33] text-white' : 'hover:bg-slate-200 text-slate-600'
              }`}
            >
              <FiTrendingUp /> Forecast
            </button>
            <button 
              onClick={() => setCurrentView('analytics')} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                currentView === 'analytics' ? 'bg-[#161B33] text-white' : 'hover:bg-slate-200 text-slate-600'
              }`}
            >
              <FiTrendingUp /> Pipeline Insights
            </button>
            <button 
              onClick={() => setCurrentView('customer360')} 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition ${
                currentView === 'customer360' ? 'bg-[#161B33] text-white' : 'hover:bg-slate-200 text-slate-600'
              }`}
            >
              <FiUsers /> Customer 360
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAutomationPanel(!showAutomationPanel)}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition"
            >
              <FiSettings /> Automation ({automationRules.filter(r => r.isActive).length} active)
            </button>
            <button 
              onClick={() => setShowNewLeadModal(true)}
              className="bg-[#12A594] hover:bg-[#0B7A6E] text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 transition"
            >
              <FiPlus /> New Opportunity
            </button>
          </div>
        </div>

        {/* Global Pipeline Filters Header bar */}
        {currentView !== 'customer360' && currentView !== 'analytics' && (
          <div className="px-6 py-3 border-b border-slate-200 flex flex-wrap items-center gap-4 bg-slate-50/20 text-xs">
            {/* Search */}
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search by company or ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border rounded border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#12A594] text-slate-800"
              />
              <FiSearch className="absolute left-2.5 top-2.5 text-slate-400" />
            </div>

            {/* My vs Team Toggle */}
            <div className="flex border rounded border-slate-300 overflow-hidden font-bold">
              <button
                onClick={() => setActiveOwnerFilter('my')}
                className={`px-3 py-1.5 transition ${activeOwnerFilter === 'my' ? 'bg-slate-200 text-slate-800' : 'bg-white text-slate-600'}`}
              >
                My Deals
              </button>
              <button
                onClick={() => setActiveOwnerFilter('team')}
                className={`px-3 py-1.5 transition ${activeOwnerFilter === 'team' ? 'bg-slate-200 text-slate-800' : 'bg-white text-slate-600'}`}
              >
                Team Pipeline
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold">Temp:</span>
              <select
                value={temperatureFilter}
                onChange={(e) => setTemperatureFilter(e.target.value)}
                className="border border-slate-300 rounded px-2 py-1 text-xs"
              >
                <option value="all">All</option>
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-bold">Owner:</span>
              <select
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                className="border border-slate-300 rounded px-2 py-1 text-xs"
              >
                <option value="all">All Reps</option>
                {teamMembers.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <button
              onClick={handleRoundRobinAssignment}
              className="bg-[#161B33]/5 hover:bg-[#161B33]/15 text-[#161B33] border border-[#161B33]/30 px-3 py-1.5 rounded text-xs font-extrabold flex items-center gap-1 transition ml-auto"
            >
              <FiUserCheck /> Auto-Assign Leads
            </button>
          </div>
        )}

        {/* View Render Area */}
        <div className="p-6">
          {/* 1. KANBAN BOARD VIEW */}
          {currentView === 'kanban' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {STAGES.map(stage => {
                const stageDeals = getFilteredDeals().filter(d => d.stage === stage);
                const stageTotalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

                return (
                  <div 
                    key={stage} 
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col space-y-3 min-h-[480px] transition-colors hover:bg-slate-100/50"
                  >
                    {/* Stage Header */}
                    <div className="flex items-center justify-between pb-2 border-b">
                      <div>
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700">
                          {stage}
                        </h4>
                        <span className="text-[10px] text-slate-400 block font-mono">{stageDeals.length} opportunity</span>
                      </div>
                      <span className="bg-slate-200/80 text-slate-800 px-1.5 py-0.5 rounded text-[10px] font-black font-mono">
                        ${stageTotalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>

                    {/* Cards Container */}
                    <div className="flex-1 overflow-y-auto space-y-3 max-h-[500px] pr-1">
                      {stageDeals.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-xs italic">Drop deals here</div>
                      ) : (
                        stageDeals.map(d => {
                          const agingDays = getDealAging(d);
                          const showAgingWarning = (d.stage === 'Negotiation' && agingDays > 14) || (d.stage === 'Proposal Sent' && agingDays > 20);

                          return (
                            <div 
                              key={d.id} 
                              draggable
                              onDragStart={(e) => handleDragStart(e, d.id)}
                              onClick={() => setSelectedDealId(d.id)}
                              className={`bg-white border rounded-lg p-3.5 shadow-sm space-y-3 relative cursor-pointer hover:shadow-md transition duration-200 ${
                                d.isStale ? 'border-amber-400 bg-amber-50/10' : 'border-slate-200'
                              }`}
                            >
                              {/* Top Bar: Title & Scoring */}
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-extrabold text-sm text-[#161B33] hover:text-[#12A594] transition truncate block max-w-[130px]">
                                  {d.name}
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-black font-mono ${
                                    d.score >= 80 ? 'bg-emerald-100 text-emerald-800' : d.score >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    Score: {d.score}
                                  </span>
                                </div>
                              </div>

                              {/* Middle: Ref & Value (Both Inline Editable) */}
                              <div className="space-y-1.5 text-xs">
                                {/* Inline Reference Number Edit */}
                                {editingCardId === d.id && editingField === 'ref' ? (
                                  <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      className="border border-slate-400 rounded px-1.5 py-0.5 text-[11px] w-24 font-mono font-bold"
                                    />
                                    <button onClick={() => saveInlineEdit(d.id)} className="bg-emerald-500 text-white rounded p-0.5"><FiCheck /></button>
                                    <button onClick={() => { setEditingCardId(null); setEditingField(null); }} className="bg-slate-300 text-slate-700 rounded p-0.5"><FiX /></button>
                                  </div>
                                ) : (
                                  <div 
                                    onClick={(e) => { e.stopPropagation(); triggerInlineEdit(d.id, 'ref', d.ref); }} 
                                    className="text-[10px] text-slate-500 font-mono flex items-center gap-1 hover:bg-slate-100 px-1 py-0.5 rounded"
                                    title="Click to edit Reference Number"
                                  >
                                    Ref: <span className="font-extrabold text-slate-700">{d.ref}</span>
                                    <FiEdit className="text-[9px] text-slate-400 opacity-0 hover:opacity-100" />
                                  </div>
                                )}

                                {/* Inline Value Edit */}
                                {editingCardId === d.id && editingField === 'value' ? (
                                  <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      className="border border-slate-400 rounded px-1.5 py-0.5 text-xs w-24 font-bold"
                                    />
                                    <button onClick={() => saveInlineEdit(d.id)} className="bg-emerald-500 text-white rounded p-0.5"><FiCheck /></button>
                                    <button onClick={() => { setEditingCardId(null); setEditingField(null); }} className="bg-slate-300 text-slate-700 rounded p-0.5"><FiX /></button>
                                  </div>
                                ) : (
                                  <div 
                                    onClick={(e) => { e.stopPropagation(); triggerInlineEdit(d.id, 'value', d.value.toString()); }}
                                    className="font-black text-sm text-slate-900 flex items-center gap-1 hover:bg-slate-100 px-1 py-0.5 rounded cursor-edit"
                                    title="Click to edit value"
                                  >
                                    ${d.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    <FiEdit className="text-[9px] text-slate-400 opacity-0 hover:opacity-100" />
                                  </div>
                                )}
                              </div>

                              {/* Warnings & Info bar */}
                              <div className="flex flex-wrap gap-1.5 items-center">
                                {/* Inline Temperature Tag Edit */}
                                {editingCardId === d.id && editingField === 'temp' ? (
                                  <select
                                    onClick={(e) => e.stopPropagation()}
                                    value={editValue}
                                    onChange={(e) => { setEditValue(e.target.value); }}
                                    onBlur={() => saveInlineEdit(d.id)}
                                    className="border border-slate-400 rounded text-[9px] font-black uppercase py-0.5 px-1 bg-white"
                                    autoFocus
                                  >
                                    <option value="Hot">Hot</option>
                                    <option value="Warm">Warm</option>
                                    <option value="Cold">Cold</option>
                                  </select>
                                ) : (
                                  <span 
                                    onClick={(e) => { e.stopPropagation(); triggerInlineEdit(d.id, 'temp', d.temperature); }}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                      d.temperature === 'Hot' ? 'bg-red-50 text-red-700 border border-red-200' : d.temperature === 'Warm' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                                    }`}
                                    title="Click to change temperature"
                                  >
                                    {d.temperature}
                                  </span>
                                )}

                                {/* Aging Alert */}
                                {showAgingWarning && (
                                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 animate-pulse">
                                    <FiAlertTriangle className="text-[10px]" /> {agingDays} days in stage
                                  </span>
                                )}

                                {/* Stale warning */}
                                {d.isStale && (
                                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                                    <FiAlertCircle /> Stale ({agingDays}d idle)
                                  </span>
                                )}
                              </div>

                              {/* Footer: Owner Avatar & Tasks */}
                              <div className="flex items-center justify-between border-t pt-2 mt-2 text-[10px]">
                                <div className="flex items-center gap-1 text-slate-500 font-semibold">
                                  <div className="bg-slate-200 text-slate-700 w-5 h-5 rounded-full flex items-center justify-center font-bold uppercase">
                                    {d.owner.slice(0, 2)}
                                  </div>
                                  <span>{d.owner === 'admin' ? 'Me' : d.owner}</span>
                                </div>

                                <div className="text-slate-400 font-mono font-bold flex items-center gap-1">
                                  <FiCheckSquare className="text-slate-500" />
                                  <span>
                                    {d.tasks.filter(t => t.status === 'Completed').length}/{d.tasks.length} tasks
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. LIST VIEW */}
          {currentView === 'list' && (
            <div className="space-y-3">
              {getFilteredDeals().map(d => (
                <div 
                  key={d.id} 
                  onClick={() => setSelectedDealId(d.id)}
                  className="bg-white border border-slate-200 hover:border-[#12A594] rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition duration-150"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900">{d.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Ref: {d.ref}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                        d.temperature === 'Hot' ? 'bg-red-50 text-red-700 border border-red-200' : d.temperature === 'Warm' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {d.temperature}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-4">
                      <span>Owner: <strong className="text-slate-700">{d.owner}</strong></span>
                      <span>Source: <strong className="text-slate-700">{d.source}</strong></span>
                      <span>Created: <strong className="text-slate-700">{d.createdAt.split('T')[0]}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Expected Close</div>
                      <div className="text-xs font-black text-slate-800 font-mono">{d.expectedCloseDate}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Deal Value</div>
                      <div className="text-sm font-black text-[#161B33]">${d.value.toLocaleString()}</div>
                    </div>

                    <div className="w-32 bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          d.stage === 'Closed Won' ? 'bg-emerald-500' : d.stage === 'Closed Lost' ? 'bg-red-500' : 'bg-[#12A594]'
                        }`}
                        style={{ width: `${d.probability}%` }}
                      ></div>
                    </div>
                    
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase text-center w-28 ${
                      d.stage === 'Closed Won' ? 'bg-emerald-100 text-emerald-800' : d.stage === 'Closed Lost' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {d.stage} ({d.probability}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. DATA TABLE VIEW */}
          {currentView === 'table' && (
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-black border-b select-none">
                  <tr>
                    <th className="px-6 py-3">Deal ID / Ref</th>
                    <th className="px-6 py-3">Company Name</th>
                    <th className="px-6 py-3 cursor-pointer hover:text-slate-800 flex items-center gap-1" onClick={() => { setSortBy('value'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                      Deal Value <FiChevronDown />
                    </th>
                    <th className="px-6 py-3">Stage</th>
                    <th className="px-6 py-3">Temp</th>
                    <th className="px-6 py-3 cursor-pointer hover:text-slate-800 flex items-center gap-1" onClick={() => { setSortBy('owner'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                      Owner <FiChevronDown />
                    </th>
                    <th className="px-6 py-3 cursor-pointer hover:text-slate-800 flex items-center gap-1" onClick={() => { setSortBy('close_date'); setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                      Expected Close <FiChevronDown />
                    </th>
                    <th className="px-6 py-3">Lead Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {getFilteredDeals().map(d => (
                    <tr 
                      key={d.id} 
                      onClick={() => setSelectedDealId(d.id)}
                      className="hover:bg-slate-50 cursor-pointer transition"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-slate-600">{d.id} / {d.ref}</td>
                      <td className="px-6 py-4 font-extrabold text-slate-800">{d.name}</td>
                      <td className="px-6 py-4 font-black font-mono text-[#161B33]">${d.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          d.stage === 'Closed Won' ? 'bg-emerald-100 text-emerald-800' : d.stage === 'Closed Lost' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {d.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                          d.temperature === 'Hot' ? 'bg-red-100 text-red-800' : d.temperature === 'Warm' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {d.temperature}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{d.owner}</td>
                      <td className="px-6 py-4 font-mono">{d.expectedCloseDate}</td>
                      <td className="px-6 py-4 text-slate-500 font-semibold">{d.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. FORECAST VIEW (Projected Revenue by Month) */}
          {currentView === 'forecast' && (
            <div className="space-y-6">
              {/* Calculate forecast groupings */}
              {(() => {
                const forecastGroups: { [key: string]: { totalVal: number; weightedVal: number; deals: Deal[] } } = {};
                
                deals.forEach(d => {
                  if (d.stage === 'Closed Lost') return;
                  const date = new Date(d.expectedCloseDate);
                  const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                  
                  if (!forecastGroups[monthName]) {
                    forecastGroups[monthName] = { totalVal: 0, weightedVal: 0, deals: [] };
                  }
                  forecastGroups[monthName].totalVal += d.value;
                  forecastGroups[monthName].weightedVal += d.value * (d.probability / 100);
                  forecastGroups[monthName].deals.push(d);
                });

                const sortedMonths = Object.keys(forecastGroups).sort((a, b) => {
                  const dateA = new Date(a);
                  const dateB = new Date(b);
                  return dateA.getTime() - dateB.getTime();
                });

                if (sortedMonths.length === 0) {
                  return <div className="text-center py-10 text-slate-400 italic">No forecast projections available. Set expected close dates.</div>;
                }

                return sortedMonths.map(month => {
                  const g = forecastGroups[month];
                  return (
                    <div key={month} className="border border-slate-200 rounded-lg p-5 bg-white space-y-4 shadow-sm">
                      {/* Month Summary Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
                        <div>
                          <h3 className="font-extrabold text-base text-[#161B33]">{month}</h3>
                          <span className="text-xs text-slate-400 font-semibold">{g.deals.length} opportunities closing this month</span>
                        </div>

                        <div className="flex gap-4 text-xs font-black">
                          <div className="text-right">
                            <span className="text-slate-400 uppercase tracking-wider block text-[10px]">Unweighted Value</span>
                            <span className="text-slate-800 font-mono">${g.totalVal.toLocaleString()}</span>
                          </div>
                          <div className="text-right border-l pl-4 border-slate-200">
                            <span className="text-teal-500 uppercase tracking-wider block text-[10px]">Projected (Weighted)</span>
                            <span className="text-teal-600 font-mono font-black text-sm">${g.weightedVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Small list of deals closing */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {g.deals.map(d => (
                          <div 
                            key={d.id}
                            onClick={() => setSelectedDealId(d.id)}
                            className="border border-slate-100 hover:border-slate-300 rounded p-3 cursor-pointer bg-slate-50/50 flex flex-col justify-between h-28"
                          >
                            <div className="flex justify-between items-start gap-1">
                              <div>
                                <span className="font-extrabold text-xs text-slate-900 block truncate max-w-[150px]">{d.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{d.id} | {d.owner}</span>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-center ${
                                d.stage === 'Closed Won' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {d.stage}
                              </span>
                            </div>

                            <div className="flex justify-between items-end">
                              <div>
                                <span className="text-[10px] text-slate-400 font-semibold">Value / Prob</span>
                                <div className="text-xs font-black text-slate-800 font-mono">
                                  ${d.value.toLocaleString()} <span className="text-slate-400 font-normal">({d.probability}%)</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 font-semibold block">Close Date</span>
                                <span className="text-xs font-bold text-slate-600 font-mono">{d.expectedCloseDate}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}

          {/* 5. PIPELINE ANALYTICS VIEW */}
          {currentView === 'analytics' && (
            <div className="space-y-6">
              {/* Top row funnel + Lead ROI */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visual Conversion Funnel */}
                <div className="border border-slate-200 rounded-lg p-5 bg-white space-y-4 shadow-sm">
                  <h3 className="font-extrabold text-sm text-[#161B33] border-b pb-2">Sales Conversion Funnel</h3>
                  <div className="flex flex-col space-y-3 pt-2">
                    {/* Funnel Stage block generator */}
                    {['Qualification', 'Proposal Sent', 'Negotiation', 'Closed Won'].map((stage, idx) => {
                      const count = deals.filter(d => d.stage === stage || STAGES.indexOf(d.stage) > STAGES.indexOf(stage as any)).length;
                      const pct = deals.length > 0 ? Math.round((count / deals.length) * 100) : 0;
                      
                      // Funnel width style
                      const widths = ['w-full', 'w-[80%]', 'w-[60%]', 'w-[40%]'];
                      const colors = ['bg-[#161B33]', 'bg-[#1e2754]', 'bg-[#12A594]', 'bg-[#0e8b7c]'];

                      return (
                        <div key={stage} className="flex items-center gap-4">
                          <span className="text-xs font-bold text-slate-600 w-28 truncate">{stage}</span>
                          <div className="flex-1 bg-slate-100 h-8 rounded overflow-hidden relative border">
                            <div className={`${widths[idx]} ${colors[idx]} h-full flex items-center justify-between px-3 text-white transition-all duration-500`}>
                              <span className="text-[10px] font-black font-mono">{count} deals</span>
                              <span className="text-[10px] font-mono font-bold">{pct}%</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">Shows total deals that reached or surpassed each milestone stage.</p>
                </div>

                {/* Lead Source ROI */}
                <div className="border border-slate-200 rounded-lg p-5 bg-white space-y-4 shadow-sm">
                  <h3 className="font-extrabold text-sm text-[#161B33] border-b pb-2">Lead Source Value Contribution</h3>
                  <div className="space-y-3 pt-2">
                    {(() => {
                      const sourceStats: { [key: string]: number } = { 'Website': 0, 'Referral': 0, 'Cold Outreach': 0, 'Trade Show': 0 };
                      deals.forEach(d => {
                        if (d.source) sourceStats[d.source] += d.value;
                      });
                      const maxVal = Math.max(...Object.values(sourceStats), 1);

                      return Object.keys(sourceStats).map(source => {
                        const val = sourceStats[source];
                        const pct = Math.round((val / maxVal) * 100);
                        return (
                          <div key={source} className="space-y-1 text-xs">
                            <div className="flex justify-between font-semibold">
                              <span className="text-slate-700">{source}</span>
                              <span className="font-mono text-slate-900">${val.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border">
                              <div className="bg-[#12A594] h-full" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Bottom Row Leaderboard & Aging */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rep Leaderboard */}
                <div className="border border-slate-200 rounded-lg p-5 bg-white space-y-4 shadow-sm">
                  <h3 className="font-extrabold text-sm text-[#161B33] border-b pb-2">Deal Owner Leaderboard</h3>
                  <div className="divide-y text-xs">
                    {(() => {
                      const repData: { [key: string]: { wonVal: number; totalDeals: number } } = {};
                      deals.forEach(d => {
                        if (!repData[d.owner]) repData[d.owner] = { wonVal: 0, totalDeals: 0 };
                        repData[d.owner].totalDeals++;
                        if (d.stage === 'Closed Won') {
                          repData[d.owner].wonVal += d.value;
                        }
                      });

                      return Object.keys(repData).map(rep => {
                        const data = repData[rep];
                        return (
                          <div key={rep} className="py-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="bg-slate-200 text-slate-800 w-6 h-6 rounded-full flex items-center justify-center font-bold uppercase text-[10px]">
                                {rep.slice(0,2)}
                              </div>
                              <span className="font-bold text-slate-700">{rep}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-black text-slate-900 font-mono">${data.wonVal.toLocaleString()} Closed Won</div>
                              <div className="text-[10px] text-slate-400">{data.totalDeals} active opportunities</div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Sales Velocity Average Days */}
                <div className="border border-slate-200 rounded-lg p-5 bg-white space-y-4 shadow-sm">
                  <h3 className="font-extrabold text-sm text-[#161B33] border-b pb-2">Stage Residence Time (Velocity Analysis)</h3>
                  <div className="space-y-4 pt-2">
                    {['Qualification', 'Proposal Sent', 'Negotiation'].map(stage => {
                      const stageDeals = deals.filter(d => d.stage === stage);
                      const avgDays = stageDeals.length > 0 
                        ? Math.round(stageDeals.reduce((sum, d) => sum + getDealAging(d), 0) / stageDeals.length)
                        : 5;
                      
                      return (
                        <div key={stage} className="flex items-center justify-between text-xs border-b pb-2">
                          <span className="font-bold text-slate-600">{stage}</span>
                          <span className="font-mono bg-slate-100 border px-2 py-0.5 rounded text-slate-800 font-extrabold">
                            {avgDays} days average
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">Identifies stages where sales cycles slow down, causing inventory/resource planning bottle-necks.</p>
                </div>
              </div>
            </div>
          )}

          {/* 6. CUSTOMER 360 PANEL */}
          {currentView === 'customer360' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="font-black text-base text-[#161B33]">Customer 360 Dashboard</h3>
                  <p className="text-xs text-slate-500">Persistent customer records created post-sales conversion with lifetime metrics</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accounts360.map(acc => (
                  <div key={acc.accountId} className="border border-slate-200 rounded-lg p-5 bg-white shadow-sm space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-1.5 w-full bg-emerald-500"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-sm text-[#161B33]">{acc.companyName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {acc.accountId} | Industry: {acc.industry}</span>
                      </div>
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-black">
                        Active Client
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-b py-3 font-semibold text-slate-600">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Lifetime Value (LTV)</span>
                        <span className="text-slate-800 font-mono font-black text-sm">${acc.totalLtv.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Acquired Date</span>
                        <span className="text-slate-800 font-mono font-black">{acc.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 text-xs pt-1">
                      <button
                        onClick={() => {
                          showToast('Opening ledger profile for accounting...', 'success');
                          openTab('accounts_list', 'Ledger Accounts', 'accounts_list');
                        }}
                        className="flex-1 bg-slate-900 text-white font-bold py-1.5 rounded hover:bg-slate-800 transition"
                      >
                        Ledger Balance
                      </button>
                      <button
                        onClick={() => {
                          showToast('Fetching invoice audit documents...', 'success');
                          openTab('transactions', 'Transactions', 'transactions');
                        }}
                        className="flex-1 border border-slate-300 text-slate-700 font-bold py-1.5 rounded hover:bg-slate-100 transition"
                      >
                        Invoices History
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL DRAWER (SLIDE-OVER PANEL) */}
      {selectedDealId && selectedDeal && (
        <div className="fixed inset-0 overflow-hidden z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSelectedDealId(null)}
          ></div>

          {/* Drawer Body */}
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in">
            {/* Header */}
            <div className="bg-[#161B33] text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black font-manrope">{selectedDeal.name}</h3>
                  <span className="text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded">
                    {selectedDeal.id}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Ref: {selectedDeal.ref} • Owned by {selectedDeal.owner}</p>
              </div>
              <button 
                onClick={() => setSelectedDealId(null)}
                className="text-slate-400 hover:text-white transition p-1.5 rounded-full hover:bg-slate-800"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Converted actions if Won */}
              {selectedDeal.stage === 'Closed Won' && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h5 className="font-extrabold text-emerald-900 text-sm">Deal Closed Won!</h5>
                    <p className="text-xs text-emerald-700 mt-0.5">Move this deal forward into ERP operations.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConvertToAccount(selectedDeal)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded transition"
                    >
                      Convert to Account
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDealId(null);
                        openTab('transactions', 'Transactions', 'transactions');
                        showToast('Viewing Sales Orders generated for deal.', 'success');
                      }}
                      className="border border-emerald-400 text-emerald-800 hover:bg-emerald-100 font-bold text-xs py-1.5 px-3 rounded transition"
                    >
                      View Sales Order
                    </button>
                  </div>
                </div>
              )}

              {/* Grid Properties */}
              <div className="grid grid-cols-2 gap-4 border-b pb-5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Stage</span>
                  <select
                    value={selectedDeal.stage}
                    onChange={(e) => {
                      const nextS = e.target.value as Deal['stage'];
                      if (nextS === 'Closed Lost') {
                        setLostDealId(selectedDeal.id);
                        setShowLostModal(true);
                      } else {
                        handleStageChange(selectedDeal.id, nextS);
                      }
                    }}
                    className="border border-slate-300 rounded px-2.5 py-1.5 w-full bg-slate-50 font-bold text-slate-800 mt-1"
                  >
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Deal Value ($)</span>
                  <input
                    type="number"
                    value={selectedDeal.value}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setDeals(prev => prev.map(d => d.id === selectedDeal.id ? { ...d, value: isNaN(val) ? 0 : val } : d));
                    }}
                    className="border border-slate-300 rounded px-2.5 py-1.5 w-full bg-white mt-1 text-slate-800 font-bold font-mono"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Close Probability (%)</span>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="number"
                      value={selectedDeal.probability}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setDeals(prev => prev.map(d => d.id === selectedDeal.id ? { ...d, probability: isNaN(val) ? 0 : Math.min(100, Math.max(0, val)), isManualProbability: true } : d));
                      }}
                      className="border border-slate-300 rounded px-2 py-1 w-20 bg-white text-slate-800 font-bold text-center"
                    />
                    <button
                      onClick={() => {
                        setDeals(prev => prev.map(d => d.id === selectedDeal.id ? { ...d, probability: STAGE_PROBABILITIES[d.stage], isManualProbability: false } : d));
                      }}
                      className="text-[10px] text-slate-500 hover:text-slate-700 underline font-bold"
                    >
                      Reset to stage default
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Expected Close Date</span>
                  <input
                    type="date"
                    value={selectedDeal.expectedCloseDate}
                    onChange={(e) => {
                      setDeals(prev => prev.map(d => d.id === selectedDeal.id ? { ...d, expectedCloseDate: e.target.value } : d));
                    }}
                    className="border border-slate-300 rounded px-2.5 py-1.5 w-full mt-1 text-slate-800 font-bold font-mono bg-white"
                  />
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Owner</span>
                  <select
                    value={selectedDeal.owner}
                    onChange={(e) => {
                      const nextOwner = e.target.value;
                      setDeals(prev => prev.map(d => {
                        if (d.id === selectedDeal.id) {
                          const log: ActivityLog = {
                            id: `act-${Date.now()}`,
                            type: 'System',
                            description: `Deal ownership transferred from ${d.owner} to ${nextOwner}`,
                            performedBy: 'admin',
                            performedAt: new Date().toISOString()
                          };
                          return { ...d, owner: nextOwner, activities: [...d.activities, log] };
                        }
                        return d;
                      }));
                      showToast(`Deal reassigned to ${nextOwner}`, 'success');
                    }}
                    className="border border-slate-300 rounded px-2.5 py-1.5 w-full mt-1 text-slate-800 font-semibold bg-white"
                  >
                    {teamMembers.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Lead Source</span>
                  <select
                    value={selectedDeal.source}
                    onChange={(e) => {
                      const src = e.target.value as Deal['source'];
                      setDeals(prev => prev.map(d => d.id === selectedDeal.id ? { ...d, source: src } : d));
                    }}
                    className="border border-slate-300 rounded px-2.5 py-1.5 w-full mt-1 text-slate-800 font-semibold bg-white"
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Cold Outreach">Cold Outreach</option>
                    <option value="Trade Show">Trade Show</option>
                  </select>
                </div>
              </div>

              {/* Contact Profile details */}
              <div className="space-y-3 border-b pb-5">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FiUser /> Contact & Account Profile
                </h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 font-bold">Contact Name</label>
                    <input
                      type="text"
                      value={selectedDeal.contact.name}
                      onChange={(e) => {
                        setDeals(prev => prev.map(d => d.id === selectedDeal.id ? { ...d, contact: { ...d.contact, name: e.target.value } } : d));
                      }}
                      className="border border-slate-300 rounded px-2.5 py-1.5 w-full bg-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-bold">Email Address</label>
                    <input
                      type="email"
                      value={selectedDeal.contact.email}
                      onChange={(e) => {
                        setDeals(prev => prev.map(d => d.id === selectedDeal.id ? { ...d, contact: { ...d.contact, email: e.target.value } } : d));
                      }}
                      className="border border-slate-300 rounded px-2.5 py-1.5 w-full bg-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-bold">Phone Number</label>
                    <input
                      type="text"
                      value={selectedDeal.contact.phone}
                      onChange={(e) => {
                        setDeals(prev => prev.map(d => d.id === selectedDeal.id ? { ...d, contact: { ...d.contact, phone: e.target.value } } : d));
                      }}
                      className="border border-slate-300 rounded px-2.5 py-1.5 w-full bg-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-bold">Industry Sector</label>
                    <input
                      type="text"
                      value={selectedDeal.contact.industry}
                      onChange={(e) => {
                        setDeals(prev => prev.map(d => d.id === selectedDeal.id ? { ...d, contact: { ...d.contact, industry: e.target.value } } : d));
                      }}
                      className="border border-slate-300 rounded px-2.5 py-1.5 w-full bg-white mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Products quoted integration */}
              <div className="space-y-3 border-b pb-5">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FiPaperclip /> Quoted Products & Services
                </h4>

                {/* List quoted products */}
                <div className="space-y-2">
                  {selectedDeal.quotedProducts.length === 0 ? (
                    <div className="text-slate-400 text-xs italic bg-slate-50 border p-4 rounded text-center">No inventory products linked to this quote.</div>
                  ) : (
                    selectedDeal.quotedProducts.map(qp => {
                      const pObj = products.find(p => p.id === qp.productId);
                      return (
                        <div key={qp.productId} className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
                          <div>
                            <span className="font-extrabold text-slate-800">{pObj?.name || 'Unknown product'}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">SKU: {qp.productId} • ${qp.price.toLocaleString()} per unit</span>
                          </div>
                          <div className="flex items-center gap-3 text-right">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-bold">Qty</span>
                              <input
                                type="number"
                                min="1"
                                value={qp.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  setDeals(prev => prev.map(d => {
                                    if (d.id === selectedDeal.id) {
                                      const updatedQuote = d.quotedProducts.map(q => q.productId === qp.productId ? { ...q, quantity: isNaN(val) ? 1 : val } : q);
                                      const valTotal = updatedQuote.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                      return { ...d, quotedProducts: updatedQuote, value: valTotal };
                                    }
                                    return d;
                                  }));
                                }}
                                className="border border-slate-300 rounded px-1.5 py-0.5 text-center font-bold font-mono w-14 bg-white"
                              />
                            </div>
                            <div className="font-black text-slate-700 font-mono w-24">
                              ${(qp.price * qp.quantity).toLocaleString()}
                            </div>
                            <button
                              onClick={() => handleRemoveProductFromQuote(selectedDeal.id, qp.productId)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add product dropdown link */}
                <div className="flex items-center gap-2">
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddProductToQuote(selectedDeal.id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="border border-slate-300 rounded px-2 py-1 text-xs bg-white text-slate-600 font-bold"
                  >
                    <option value="" disabled>+ Link Quoted Inventory Item...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${p.price.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 border-b pb-5">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FiCheckSquare /> Tasks & Follow-up Reminders
                </h4>

                <div className="space-y-2">
                  {selectedDeal.tasks.map(t => (
                    <div 
                      key={t.id} 
                      className={`flex items-center justify-between text-xs p-2.5 rounded border ${
                        t.status === 'Completed' ? 'bg-slate-50 border-slate-200 text-slate-400 line-through' : t.status === 'Overdue' ? 'bg-red-50 border-red-200 text-slate-700' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={t.status === 'Completed'}
                          onChange={() => handleToggleTask(selectedDeal.id, t.id)}
                          className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span className="font-bold">{t.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[10px]">Due: {t.dueDate}</span>
                        <span className="bg-slate-100 text-slate-700 border px-1.5 py-0.5 rounded text-[8px] font-black uppercase font-mono">
                          {t.assignedTo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new task Form */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded border border-slate-200">
                  <input
                    type="text"
                    placeholder="Task description..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="col-span-2 border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-800"
                  />
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="border border-slate-300 rounded px-2.5 py-1.5 text-xs bg-white text-slate-800"
                  />
                  <div className="col-span-3 flex justify-between items-center pt-2 border-t mt-1">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-400 font-bold">Assignee:</span>
                      <select
                        value={newTaskOwner}
                        onChange={(e) => setNewTaskOwner(e.target.value)}
                        className="border rounded text-[11px] px-1 bg-white text-slate-600"
                      >
                        {teamMembers.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <button
                      onClick={() => handleAddTask(selectedDeal.id)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] py-1 px-3 rounded transition"
                    >
                      + Add Task
                    </button>
                  </div>
                </div>
              </div>

              {/* Mentions Collaboration Note area */}
              <div className="space-y-3 border-b pb-5 relative">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FiMessageSquare /> Collaborative Deal Notes (@mentions)
                </h4>

                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="Type a note. Use @name to notify team members..."
                    value={noteText}
                    onChange={(e) => handleNoteTextChange(e.target.value)}
                    className="w-full border border-slate-300 rounded p-2.5 text-xs bg-white text-slate-800 focus:ring-1 focus:ring-[#12A594] focus:outline-none"
                  ></textarea>

                  {/* Mentions popover */}
                  {showMentionSuggestions && (
                    <div className="absolute bottom-full left-0 bg-white border border-slate-300 rounded shadow-lg w-48 mb-1 overflow-hidden z-10 text-xs">
                      <div className="bg-slate-50 px-2 py-1 font-bold text-[10px] uppercase text-slate-400 border-b">Notify teammate</div>
                      {teamMembers
                        .filter(m => m.toLowerCase().includes(mentionSearchText.toLowerCase()))
                        .map(m => (
                          <div
                            key={m}
                            onClick={() => applyMention(m)}
                            className="px-3 py-1.5 hover:bg-slate-100 cursor-pointer font-semibold text-slate-700 flex items-center gap-2"
                          >
                            <FiUser /> {m}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] text-slate-400 italic">Saved notes persist on this deal pipeline file.</span>
                  <button
                    onClick={() => {
                      if (!noteText.trim()) return;
                      setDeals(prev => prev.map(d => {
                        if (d.id === selectedDeal.id) {
                          const log: ActivityLog = {
                            id: `act-${Date.now()}`,
                            type: 'Note',
                            description: noteText,
                            performedBy: 'admin',
                            performedAt: new Date().toISOString()
                          };
                          const newScore = Math.min(100, d.score + 2);
                          return { 
                            ...d, 
                            notes: d.notes ? `${d.notes}\n---\n${noteText}` : noteText, 
                            score: newScore,
                            activities: [...d.activities, log] 
                          };
                        }
                        return d;
                      }));
                      setNoteText('');
                      showToast('Collaborative note added.', 'success');
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-1 px-3 rounded transition"
                  >
                    Save Note
                  </button>
                </div>

                {/* Display accumulated notes */}
                {selectedDeal.notes && (
                  <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-700 space-y-2 mt-2 font-medium max-h-36 overflow-y-auto whitespace-pre-line">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider border-b pb-1">Notes History</span>
                    {selectedDeal.notes}
                  </div>
                )}
              </div>

              {/* Activity Timeline logs */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FiClock /> Activity Timeline
                </h4>

                {/* Quick Add Timeline log */}
                <div className="flex gap-2 items-center bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
                  <select
                    value={manualTimelineType}
                    onChange={(e) => setManualTimelineType(e.target.value as any)}
                    className="border border-slate-300 rounded px-2 py-1.5 bg-white font-bold text-slate-600"
                  >
                    <option value="Call">📞 Log Call</option>
                    <option value="Email">✉️ Log Email</option>
                    <option value="Meeting">🤝 Log Meeting</option>
                    <option value="Note">📝 Log Note</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Describe the activity logged..."
                    value={manualTimelineDesc}
                    onChange={(e) => setManualTimelineDesc(e.target.value)}
                    className="flex-1 border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                  />
                  <button
                    onClick={() => handleAddTimelineEntry(selectedDeal.id)}
                    className="bg-slate-950 hover:bg-slate-850 text-white font-black py-1.5 px-3 rounded transition shrink-0"
                  >
                    + Log
                  </button>
                </div>

                {/* Chronological List of activities */}
                <div className="relative border-l-2 border-slate-200 pl-4 ml-3 space-y-4">
                  {selectedDeal.activities.slice().reverse().map(act => (
                    <div key={act.id} className="relative text-xs">
                      {/* Timeline dot marker */}
                      <span className="absolute -left-[23px] top-1 bg-white border-2 border-slate-300 w-3 h-3 rounded-full flex items-center justify-center"></span>
                      <div className="font-bold flex items-center gap-2 text-slate-700">
                        <span className="bg-slate-100 text-slate-800 border px-1.5 py-0.2 rounded text-[9px] uppercase tracking-wider font-extrabold">
                          {act.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-normal">
                          {act.performedAt.split('T')[0]} {act.performedAt.split('T')[1]?.slice(0, 5)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">by {act.performedBy}</span>
                      </div>
                      <p className="text-slate-600 mt-1.5 pl-1 leading-relaxed bg-slate-50/50 p-1 rounded font-medium">{act.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOST REASON POPUP MODAL */}
      {showLostModal && lostDealId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="font-black text-sm text-[#161B33]">Log Closed Lost Reason</h4>
              <button 
                onClick={() => { setShowLostModal(false); setLostDealId(null); setSelectedLostReason(''); }}
                className="text-slate-400 hover:text-slate-700"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              To analyze pipeline drop-off causes and improve sales enablement, please select the main reason for losing this opportunity:
            </p>

            <select
              value={selectedLostReason}
              onChange={(e) => setSelectedLostReason(e.target.value as any)}
              className="border border-slate-300 rounded px-2 py-1.5 w-full text-xs bg-white text-slate-700 font-bold"
            >
              <option value="" disabled>-- Select Reason --</option>
              <option value="Price">Price (Competitor offered lower quotes)</option>
              <option value="Competitor">Competitor (Features or brand preference)</option>
              <option value="Timing">Timing (Project delayed or suspended)</option>
              <option value="No Budget">No Budget (Client lacked budget authorization)</option>
            </select>

            <div className="flex gap-2 pt-2 border-t text-xs">
              <button
                disabled={!selectedLostReason}
                onClick={() => {
                  handleStageChange(lostDealId, 'Closed Lost', selectedLostReason);
                  setShowLostModal(false);
                  setLostDealId(null);
                  setSelectedLostReason('');
                  showToast('Deal updated to Closed Lost.', 'warning');
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded transition disabled:opacity-50"
              >
                Log Loss Reason
              </button>
              <button
                onClick={() => {
                  setShowLostModal(false);
                  setLostDealId(null);
                  setSelectedLostReason('');
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW LEAD POPUP MODAL */}
      {showNewLeadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-start border-b pb-2">
              <h4 className="font-black text-sm text-[#161B33]">Create Sales Opportunity</h4>
              <button 
                onClick={() => setShowNewLeadModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-1">Company / Account Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corp"
                    value={newLeadName}
                    onChange={(e) => setNewLeadName(e.target.value)}
                    className="w-full border rounded border-slate-300 px-2.5 py-1.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-1">Estimated Value ($)</label>
                  <input
                    type="number"
                    required
                    value={newLeadVal}
                    onChange={(e) => setNewLeadVal(parseFloat(e.target.value) || 0)}
                    className="w-full border rounded border-slate-300 px-2.5 py-1.5 text-slate-800 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-1">Deal Owner</label>
                  <select
                    value={newLeadOwner}
                    onChange={(e) => setNewLeadOwner(e.target.value)}
                    className="w-full border rounded border-slate-300 px-2.5 py-1.5 text-slate-800 bg-white"
                  >
                    {teamMembers.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-1">Lead Source</label>
                  <select
                    value={newLeadSource}
                    onChange={(e) => setNewLeadSource(e.target.value as any)}
                    className="w-full border rounded border-slate-300 px-2.5 py-1.5 text-slate-800 bg-white"
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Cold Outreach">Cold Outreach</option>
                    <option value="Trade Show">Trade Show</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-1">Temperature</label>
                  <select
                    value={newLeadTemp}
                    onChange={(e) => setNewLeadTemp(e.target.value as any)}
                    className="w-full border rounded border-slate-300 px-2.5 py-1.5 text-slate-800 bg-white"
                  >
                    <option value="Hot">🔥 Hot</option>
                    <option value="Warm">☀️ Warm</option>
                    <option value="Cold">❄️ Cold</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-1">Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={newLeadContactName}
                    onChange={(e) => setNewLeadContactName(e.target.value)}
                    className="w-full border rounded border-slate-300 px-2.5 py-1.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="e.g. john@acme.com"
                    value={newLeadContactEmail}
                    onChange={(e) => setNewLeadContactEmail(e.target.value)}
                    className="w-full border rounded border-slate-300 px-2.5 py-1.5 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-3 border-t">
                <button type="submit" className="flex-1 bg-[#12A594] hover:bg-[#0B7A6E] text-white py-2 rounded font-extrabold transition">
                  Create Opportunity
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowNewLeadModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUTOMATION TRIGGER CONFIGURATION PANEL MODAL */}
      {showAutomationPanel && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white border-[1.5px] border-[#161B33] rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-start border-b pb-2">
              <h4 className="font-black text-sm text-[#161B33] flex items-center gap-1.5">
                <FiSettings /> CRM Automation Rules
              </h4>
              <button 
                onClick={() => setShowAutomationPanel(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <p className="text-xs text-[#5B6178] leading-relaxed">
              Define stage-triggered and auto-decay triggers that link CRM events to actions in ERP modules:
            </p>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
              {automationRules.map(rule => (
                <div key={rule.ruleId} className="border border-slate-200 rounded p-3 bg-slate-50 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-800 block">{rule.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono block">Trigger: {rule.triggerEvent} | Action: {rule.action}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setAutomationRules(prev => prev.map(r => r.ruleId === rule.ruleId ? { ...r, isActive: !r.isActive } : r));
                        showToast(`Rule '${rule.name}' ${rule.isActive ? 'disabled' : 'enabled'}.`, 'success');
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-black transition uppercase ${
                        rule.isActive ? 'bg-teal-100 text-teal-800 hover:bg-teal-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t text-right">
              <button
                onClick={() => setShowAutomationPanel(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
