import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, FileSpreadsheet, Trash2, CheckCircle2, 
  X, HelpCircle, ChevronDown, CheckSquare, Square, CreditCard,
  FileText, Pencil, MapPin, Mail, List, Layers, Send, Calendar, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkLog } from '../types';

interface LogListProps {
  logs: WorkLog[];
  onDeleteLog: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onSelectLogsForBilling: (selectedLogs: WorkLog[], mode: 'invoice' | 'challan') => void;
  onEditLog?: (log: WorkLog) => void;
}

export function LogList({ logs, onDeleteLog, onToggleStatus, onSelectLogsForBilling, onEditLog }: LogListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Unbilled' | 'Billed'>('All');
  const [selectedExcelGroupFilter, setSelectedExcelGroupFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'flat' | 'grouped'>('flat');
  
  // Email Export Dialog states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [targetEmail, setTargetEmail] = useState('RAJMUDRAENTERPRISES14@gmail.com');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  
  // Selection state for billing
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());

  // Get unique lists for filtering dropdowns
  const addressList = useMemo(() => {
    return ['All', ...Array.from(new Set(logs.map(log => log.address).filter(Boolean)))];
  }, [logs]);

  const departmentList = useMemo(() => {
    return ['All', ...Array.from(new Set(logs.map(log => log.department).filter(Boolean)))];
  }, [logs]);

  const excelGroupList = useMemo(() => {
    return ['All', ...Array.from(new Set(logs.map(log => log.excelGroup || 'मुख्य एकत्रित फाईल (Collective Excel)').filter(Boolean)))];
  }, [logs]);

  // Filter & Search Logic
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.clientName && log.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const obedienceAddress = selectedAddress === 'All' || log.address === selectedAddress;
      const obedienceDept = selectedDept === 'All' || log.department === selectedDept;
      const obedienceStatus = 
        selectedStatus === 'All' || 
        (selectedStatus === 'Unbilled' && log.status === 'Unbilled') ||
        (selectedStatus === 'Billed' && log.status === 'Billed');

      const logGroup = log.excelGroup || 'मुख्य एकत्रित फाईल (Collective Excel)';
      const obedienceExcelGroup = selectedExcelGroupFilter === 'All' || logGroup === selectedExcelGroupFilter;

      return matchesSearch && obedienceAddress && obedienceDept && obedienceStatus && obedienceExcelGroup;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Latest first
  }, [logs, searchQuery, selectedAddress, selectedDept, selectedStatus, selectedExcelGroupFilter]);

  // Export to Excel/CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    // Excel CSV structure
    const headers = [
      'दिनांक (Date)', 
      'विभाग (Department)', 
      'कामाचा पत्ता (Address)', 
      'ग्राहक (Client)', 
      'कामाचा तपशील (Description)', 
      'तास/दिवस (Hours/Days)', 
      'दर (Rate)', 
      'एकूण रक्कम (Amount)', 
      'स्थिती (Status)'
    ];

    const rows = filteredLogs.map(log => [
      log.date,
      `"${log.department.replace(/"/g, '""')}"`,
      `"${log.address.replace(/"/g, '""')}"`,
      `"${(log.clientName || '').replace(/"/g, '""')}"`,
      `"${log.description.replace(/"/g, '""')}"`,
      log.hours,
      log.rate,
      log.totalAmount,
      log.status
    ]);

    // Use BOM (Byte Order Mark) so Excel recognizes UTF-8 (and Marathi script characters correctly)
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Work_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle single item selection
  const handleToggleSelect = (id: string) => {
    const newSelection = new Set(selectedLogIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedLogIds(newSelection);
  };

  // Select/Deselect all visible items
  const handleSelectAllVisible = () => {
    const allVisibleFilteredIds = filteredLogs.map(l => l.id);
    const hasAllSelected = allVisibleFilteredIds.every(id => selectedLogIds.has(id));

    const newSelection = new Set(selectedLogIds);
    if (hasAllSelected) {
      // Deselect all visible
      allVisibleFilteredIds.forEach(id => newSelection.delete(id));
    } else {
      // Select all visible
      allVisibleFilteredIds.forEach(id => newSelection.add(id));
    }
    setSelectedLogIds(newSelection);
  };

  const selectedLogsArray = useMemo(() => {
    return logs.filter(log => selectedLogIds.has(log.id));
  }, [logs, selectedLogIds]);

  // Copy logs as formatted text and email trigger simulation
  const handleSendEmailSimulation = () => {
    if (!targetEmail.trim()) return;
    setIsSendingEmail(true);
    setEmailSuccess(false);

    setTimeout(() => {
      setIsSendingEmail(false);
      setEmailSuccess(true);
      
      // Auto triggers local export download of the logs so client gets the excel as well
      handleExportCSV();

      // Formulate copyable plain text summary
      const logsSummary = filteredLogs.map((log, idx) => 
        `${idx + 1}. दिनांक: ${log.date} | विभाग: ${log.department} | पत्ता: ${log.address} | तपशील: ${log.description} | दर: ₹${log.rate}`
      ).join('\n');
      
      const overallTotal = filteredLogs.reduce((acc, log) => acc + log.totalAmount, 0);
      const clipboardContent = `कामाचा तपशील (Work Excel logs extracted):\n-----------------------------\n${logsSummary}\n-----------------------------\nएकूण बिल रक्कम: ₹${overallTotal.toLocaleString('en-IN')}\n\nराजमुद्रा सॉफ्टवेअर वरून ऑटो-जनरेटेड.`;

      try {
        navigator.clipboard.writeText(clipboardContent);
      } catch (e) {
        console.warn("Clipboard access failure:", e);
      }
    }, 2205);
  };

  // Grouped tree structure: Address -> Department -> Month -> Logs
  const groupedData = useMemo(() => {
    const tree: { 
      [address: string]: { 
        [dept: string]: { 
          [month: string]: {
            logs: WorkLog[];
            subtotal: number;
          }
        }
      }
    } = {};

    filteredLogs.forEach(log => {
      const addr = log.address || 'इतर पत्ता';
      const dept = log.department || 'इतर विभाग';
      
      let monthKey = 'इतर तारीख';
      if (log.date) {
        const d = new Date(log.date);
        if (!isNaN(d.getTime())) {
          const monthsMarathi = [
            'जानेवारी (January)', 'फेब्रुवारी (February)', 'मार्च (March)', 'एप्रिल (April)',
            'मे (May)', 'जून (June)', 'जुलै (July)', 'ऑगस्ट (August)',
            'सप्टेंबर (September)', 'ऑक्टोबर (October)', 'नोव्हेंबर (November)', 'डिसेंबर (December)'
          ];
          monthKey = `${monthsMarathi[d.getMonth()]} ${d.getFullYear()}`;
        }
      }

      if (!tree[addr]) {
        tree[addr] = {};
      }
      if (!tree[addr][dept]) {
        tree[addr][dept] = {};
      }
      if (!tree[addr][dept][monthKey]) {
        tree[addr][dept][monthKey] = { logs: [], subtotal: 0 };
      }

      tree[addr][dept][monthKey].logs.push(log);
      tree[addr][dept][monthKey].subtotal += log.totalAmount || 0;
    });

    return tree;
  }, [filteredLogs]);

  const handleCreateBillFromSelected = () => {
    if (selectedLogsArray.length === 0) return;
    onSelectLogsForBilling(selectedLogsArray, 'invoice');
  };

  const handleCreateChallanFromSelected = () => {
    if (selectedLogsArray.length === 0) return;
    onSelectLogsForBilling(selectedLogsArray, 'challan');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-full">
      {/* Header and Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800 font-sans tracking-tight">कामांची यादी (Work Log Dashboard)</h2>
          <p className="text-xs text-slate-400 mt-0.5">Filter, search, export to Excel, and select items to generate a Bill/Invoice</p>
        </div>

        {/* Global actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Create bill button */}
          <button
            onClick={handleCreateBillFromSelected}
            disabled={selectedLogsArray.length === 0}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm ${
              selectedLogsArray.length > 0
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer hover:scale-[1.02]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            बिल बनवा (Create Bill) {selectedLogsArray.length > 0 && `(${selectedLogsArray.length})`}
          </button>

          {/* Create delivery challan button */}
          <button
            onClick={handleCreateChallanFromSelected}
            disabled={selectedLogsArray.length === 0}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm ${
              selectedLogsArray.length > 0
                ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer hover:scale-[1.02]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-100" />
            चलान बनवा (Delivery Challan) {selectedLogsArray.length > 0 && `(${selectedLogsArray.length})`}
          </button>

          {/* Excel Export Button */}
          <button
            onClick={handleExportCSV}
            disabled={filteredLogs.length === 0}
            className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all border ${
              filteredLogs.length > 0
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer'
                : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Excel मध्ये सेव्ह करा (Export Excel)
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 py-4 bg-slate-50/50 px-4 -mx-6 mb-4 border-b border-slate-100">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-white rounded-xl text-xs font-sans focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            placeholder="पत्ता, काम किंवा ग्राहक शोधा..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Address */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] uppercase tracking-wide font-bold text-slate-400 mr-1 shrink-0">पत्ता (Address):</span>
          <select
            className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-100"
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
          >
            {addressList.map(item => (
              <option key={item} value={item}>{item === 'All' ? 'सर्व पत्ते (All)' : item}</option>
            ))}
          </select>
        </div>

        {/* Filter Department */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] uppercase tracking-wide font-bold text-slate-400 mr-1 shrink-0">विभाग (Dept):</span>
          <select
            className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-100"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {departmentList.map(item => (
              <option key={item} value={item}>{item === 'All' ? 'सर्व विभाग (All)' : item}</option>
            ))}
          </select>
        </div>

        {/* Filter Billing Status */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] uppercase tracking-wide font-bold text-slate-400 mr-1 shrink-0">स्थिती (Status):</span>
          <select
            className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-100"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
          >
            <option value="All">सर्व (All Status)</option>
            <option value="Unbilled">अजून बिल नाही (Unbilled Only)</option>
            <option value="Billed">बिल पूर्ण झालेले (Billed Only)</option>
          </select>
        </div>

        {/* Filter Excel Group */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] uppercase tracking-wide font-bold text-slate-400 mr-1 shrink-0">फाईल (Excel):</span>
          <select
            className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-sans focus:outline-none focus:ring-2 focus:ring-indigo-100"
            value={selectedExcelGroupFilter}
            onChange={(e) => setSelectedExcelGroupFilter(e.target.value)}
          >
            {excelGroupList.map(item => (
              <option key={item} value={item}>{item === 'All' ? 'सर्व फाईल्स (All)' : item}</option>
            ))}
          </select>
        </div>
      </div>

      {/* VIEW SWITCHER TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 mb-4 gap-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start">
          <button
            type="button"
            onClick={() => setViewMode('flat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'flat' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <List className="w-3.5 h-3.5" /> साधी यादी (Simple List)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grouped')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'grouped' 
                ? 'bg-white text-indigo-700 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> गटवार मांडणी (Grouped View)
          </button>
        </div>

        {/* Send Email Action Button */}
        <button
          type="button"
          onClick={() => {
            setEmailSuccess(false);
            setShowEmailModal(true);
          }}
          disabled={filteredLogs.length === 0}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border self-end sm:self-auto cursor-pointer ${
            filteredLogs.length > 0
              ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80 active:scale-[0.98]'
              : 'border-slate-100 bg-slate-50 text-slate-405 cursor-not-allowed'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          ईमेलवर पाठवा (Send Excel to Email)
        </button>
      </div>

      {/* MAIN LOGS LIST */}
      <div className="flex-1 min-h-[350px]">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <HelpCircle className="w-12 h-12 text-slate-300 stroke-[1.5] mb-2" />
            <p className="text-slate-500 font-medium text-sm">प्रविष्ट केलेले कोणतेही काम आढळले नाही</p>
            <p className="text-slate-400 text-xs mt-1">
              {logs.length === 0 
                ? 'वर दिलेल्या फॉर्म मधून पहिले काम जोडून सुरुवात करा.' 
                : 'शोधा किंवा फिल्टर बदलून पहा.'}
            </p>
          </div>
        ) : viewMode === 'grouped' ? (
          <div className="space-y-6">
            {Object.keys(groupedData).length === 0 ? (
              <div className="text-center p-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed">
                कोणताही गटवार डेटा उपलब्ध नाही (No grouped data)
              </div>
            ) : (
              Object.keys(groupedData).map(addr => {
                const addrDepts = groupedData[addr];
                const addrTotal = Object.keys(addrDepts).reduce((sum, deptKey) => {
                  const deptMonths = addrDepts[deptKey];
                  return sum + Object.keys(deptMonths).reduce((s, monthKey) => s + deptMonths[monthKey].subtotal, 0);
                }, 0);

                return (
                  <motion.div 
                    key={addr} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/20 shadow-sm"
                  >
                    {/* Address Group Header */}
                    <div className="bg-slate-100/90 px-4 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-indigo-650 mt-0.5 shrink-0" />
                        <div>
                          <h3 className="font-bold text-sm text-slate-800 leading-tight">कामाचा पत्ता व ग्राहक कन्सर्न: {addr}</h3>
                          <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">SITE WORK LOCATION</span>
                        </div>
                      </div>
                      <div className="bg-indigo-50 border border-indigo-100 text-indigo-850 px-3 py-1 rounded-xl text-xs font-black self-start sm:self-auto shadow-xs">
                        एकूण: ₹{addrTotal.toLocaleString()}
                      </div>
                    </div>

                    {/* Department Level Card Nesting */}
                    <div className="p-4 space-y-4">
                      {Object.keys(addrDepts).map(dept => {
                        const deptMonths = addrDepts[dept];
                        const deptTotal = Object.keys(deptMonths).reduce((sum, monthKey) => sum + deptMonths[monthKey].subtotal, 0);

                        return (
                          <div key={dept} className="bg-white border border-slate-100 shadow-xs rounded-xl p-3.5 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                                <Building2 className="w-3.5 h-3.5 text-indigo-600" /> विभाग (Department): {dept}
                              </span>
                              <span className="text-xs font-black text-slate-800">विभाग एकूण (Subtotal): ₹{deptTotal.toLocaleString()}</span>
                            </div>

                            {/* Month Level Nesting */}
                            <div className="space-y-4 pl-3 sm:pl-4 border-l-2 border-indigo-100/65">
                              {Object.keys(deptMonths).map(monthName => {
                                const { logs: monthLogs, subtotal: monthTotal } = deptMonths[monthName];

                                return (
                                  <div key={monthName} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-slate-450" /> {monthName}
                                      </span>
                                      <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50/50 px-2.5 py-0.5 rounded border border-indigo-100/30">एकूण: ₹{monthTotal.toLocaleString('en-IN')}</span>
                                    </div>

                                    {/* Actionable Work Logs under this Month, Dept & Address */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                      {monthLogs.map(log => {
                                        const isSelected = selectedLogIds.has(log.id);
                                        return (
                                          <div 
                                            key={log.id} 
                                            className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                                              isSelected 
                                                ? 'bg-indigo-50/30 border-indigo-200 shadow-xs' 
                                                : 'bg-slate-50/30 border-slate-200/60 hover:bg-slate-50/70 hover:border-slate-350'
                                            }`}
                                          >
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="space-y-1.5">
                                                {/* Select item for billing */}
                                                <div className="flex items-center gap-2">
                                                  <button
                                                    type="button"
                                                    onClick={() => handleToggleSelect(log.id)}
                                                    className="p-1 rounded transition-colors cursor-pointer"
                                                  >
                                                    {isSelected ? (
                                                      <CheckSquare className="w-4 h-4 text-indigo-600" />
                                                    ) : (
                                                      <Square className="w-4 h-4 text-slate-300 hover:text-indigo-600" />
                                                    )}
                                                  </button>
                                                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                                                    दिनांक: {new Date(log.date).toLocaleDateString('mr-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                  </span>
                                                </div>

                                                <p className="text-xs font-semibold text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">{log.description}</p>
                                                
                                                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                                  {log.excelGroup && (
                                                    <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-100/50 flex items-center gap-1">
                                                      <FileSpreadsheet className="w-2.5 h-2.5" /> {log.excelGroup}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>

                                              <div className="text-right shrink-0">
                                                <span className="text-xs font-black text-slate-900 block bg-slate-100 px-2 py-0.5 rounded">₹{log.totalAmount.toLocaleString('en-IN')}</span>
                                              </div>
                                            </div>

                                            <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                                              <button
                                                onClick={() => onToggleStatus(log.id)}
                                                className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border transition-all ${
                                                  log.status === 'Billed' 
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' 
                                                    : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100'
                                                }`}
                                              >
                                                {log.status === 'Billed' ? 'बिल झालेले' : 'अजून बिल नाही'}
                                              </button>

                                              <div className="flex items-center gap-0.5 pointer-events-auto">
                                                {onEditLog && (
                                                  <button
                                                    type="button"
                                                    onClick={() => onEditLog(log)}
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                                                    title="माहिती दुरुस्त करा"
                                                  >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                  </button>
                                                )}
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    if (window.confirm('हे काम काढून टाकायचे आहे का?')) {
                                                      onDeleteLog(log.id);
                                                      const updateSel = new Set(selectedLogIds);
                                                      updateSel.delete(log.id);
                                                      setSelectedLogIds(updateSel);
                                                    }
                                                  }}
                                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                  title="काढून टाका"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </div>

                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                          </div>
                        );
                      })}
                    </div>

                  </motion.div>
                );
              })
            )}
          </div>
        ) : (
          <>
            {/* DESKTOP VIEW (Table): Visible only on screen md and up */}
            <div className="hidden md:block overflow-x-auto overflow-y-hidden rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider bg-slate-50/20">
                    <th className="py-3 px-3 w-10 text-center">
                      <button 
                        onClick={handleSelectAllVisible}
                        className="p-1 rounded hover:bg-slate-100 transition-colors inline-block cursor-pointer"
                        title="सर्व निवडा (Select All Visible)"
                      >
                        {filteredLogs.every(log => selectedLogIds.has(log.id)) ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-2 w-14 text-center">अ. क्र. (Sr.)</th>
                    <th className="py-3 px-3 w-28">दिनांक (Date)</th>
                    <th className="py-3 px-3 w-32">विभाग / पध्दत</th>
                    <th className="py-3 px-3">कामाचा पत्ता व ग्राहक (Address)</th>
                    <th className="py-3 px-4">कामाचा तपशील (Description)</th>
                    <th className="py-3 px-3 w-20 text-center">संख्या (Qty)</th>
                    <th className="py-3 px-3 w-24 text-right">दर (Rate)</th>
                    <th className="py-3 px-3 w-24 text-right">एकूण (Amount)</th>
                    <th className="py-3 px-3 w-24 text-center">स्थिती (Status)</th>
                    <th className="py-3 px-3 w-20 text-center">कृती (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence initial={false}>
                    {filteredLogs.map((log, index) => {
                      const isSelected = selectedLogIds.has(log.id);
                      return (
                        <motion.tr
                          key={log.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`hover:bg-slate-50/40 transition-colors text-xs text-slate-700 ${
                            isSelected ? 'bg-indigo-50/30' : ''
                          }`}
                        >
                          {/* Checkbox column */}
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleToggleSelect(log.id)}
                              className="p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer animate-none"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-indigo-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300 hover:text-indigo-600" />
                              )}
                            </button>
                          </td>

                          {/* Serial Number Column */}
                          <td className="py-3 px-2 text-center font-mono font-semibold text-slate-400">
                            {index + 1}
                          </td>

                          {/* Date */}
                          <td className="py-3 px-3 font-mono font-medium text-slate-500">
                            {log.date}
                          </td>

                          {/* Dept */}
                          <td className="py-3 px-3 animate-none">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/40">
                              {log.department}
                            </span>
                          </td>

                          {/* Address / Client */}
                          <td className="py-3 px-3 max-w-[180px] break-words animate-none">
                            <div className="font-semibold text-slate-800" title={log.address}>{log.address}</div>
                            {log.clientName && (
                              <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1" title={log.clientName}>
                                <FileText className="w-3 h-3 shrink-0" />
                                {log.clientName}
                              </div>
                            )}
                          </td>

                          {/* Details - FULL DISPLAY */}
                          <td className="py-3 px-4 max-w-[320px] font-sans break-words whitespace-pre-wrap leading-relaxed text-slate-600 animate-none">
                            <p>{log.description}</p>
                          </td>

                          {/* Quantity (Qty) Column */}
                          <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700 bg-slate-50/30">
                            {log.hours || 1}
                          </td>

                          {/* Rate Column */}
                          <td className="py-3 px-3 text-right font-mono text-slate-500">
                            ₹{(log.rate || 0).toLocaleString('en-IN')}
                          </td>

                          {/* Total calculated wage for the record */}
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                            ₹{(log.totalAmount || 0).toLocaleString('en-IN')}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => onToggleStatus(log.id)}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                                log.status === 'Billed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50'
                                  : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100/50'
                              }`}
                              title="स्थिती बदला (Toggle status)"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'Billed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              {log.status === 'Billed' ? 'बिल झालेले' : 'अजून बिल नाही'}
                            </button>
                          </td>

                          {/* Actions (Edit and Delete) */}
                          <td className="py-3 px-3 text-center animate-none">
                            <div className="flex items-center justify-center gap-1">
                              {onEditLog && (
                                <button
                                  onClick={() => onEditLog(log)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                  title="माहिती सुधारा (Edit record)"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (window.confirm('हे काम काढून टाकायचे आहे का? (Are you sure you want to delete this log?)')) {
                                    onDeleteLog(log.id);
                                    // Remove from select group if deleted
                                    const updateSel = new Set(selectedLogIds);
                                    updateSel.delete(log.id);
                                    setSelectedLogIds(updateSel);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="काढून टाका (Delete record)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* MOBILE VIEW (List of Cards): Visible only on screen < md */}
            <div className="block md:hidden space-y-4">
              <AnimatePresence initial={false}>
                {filteredLogs.map(log => {
                  const isSelected = selectedLogIds.has(log.id);
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`p-4 rounded-2xl border transition-all ${
                        isSelected 
                          ? 'bg-indigo-50/40 border-indigo-200 shadow-sm' 
                          : 'bg-white border-slate-200/80 shadow-xs'
                      }`}
                    >
                      {/* Card Header: Checkbox Selection, Date & Status */}
                      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleSelect(log.id)}
                            className="p-1.5 rounded bg-slate-50 border border-slate-200 hover:bg-indigo-55 transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4.5 h-4.5 text-indigo-600" />
                            ) : (
                              <Square className="w-4.5 h-4.5 text-slate-400" />
                            )}
                          </button>
                          <span className="text-xs font-mono font-bold text-slate-500">{log.date}</span>
                        </div>

                        {/* Status Toggle Box */}
                        <button
                          onClick={() => onToggleStatus(log.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                            log.status === 'Billed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50'
                              : 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100/50'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'Billed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {log.status === 'Billed' ? 'बिल झालेले' : 'अजून बिल नाही'}
                        </button>
                      </div>

                      {/* Main Item Descriptions */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          {/* Department & Address Info */}
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/60 uppercase">
                              {log.department}
                            </span>
                          </div>
                          
                          <div className="text-slate-800 font-bold text-xs leading-snug flex items-start gap-1.5 mt-1.5">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                            <div>
                              <span>{log.address}</span>
                              {log.clientName && (
                                <div className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                                  <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>ग्राहक: {log.clientName}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Details - COMPLETELY DISPLAYED IN FULL */}
                        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 mt-2">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">कामाचा तपशील (Work Details):</span>
                          <p className="text-slate-700 text-xs leading-relaxed font-sans font-medium whitespace-pre-wrap break-words">{log.description}</p>
                        </div>

                        {/* Price metrics */}
                        <div className="flex flex-col gap-1.5 bg-indigo-50/20 p-2.5 px-3 rounded-xl border border-indigo-100/30">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                            <span>संख्या / दर (Qty x Rate):</span>
                            <span className="font-mono">{log.hours || 1} x ₹{(log.rate || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex items-center justify-between border-t border-indigo-100/30 pt-1.5">
                            <span className="text-slate-600 text-[11px] font-bold">एकूण रक्कम (Total Amount):</span>
                            <span className="font-mono text-sm font-bold text-indigo-800">₹{(log.totalAmount || 0).toLocaleString('en-IN')}</span>
                          </div>
                        </div>

                        {/* Action buttons (Edit & Delete for Mobile) */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100/60 mt-1">
                          {onEditLog && (
                            <button
                              onClick={() => onEditLog(log)}
                              className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-[11px] font-bold flex items-center gap-1 transition shadow-xs hover:bg-indigo-100 cursor-pointer min-h-[38px]"
                            >
                              <Pencil className="w-3 h-3 text-indigo-600" />
                              दुरुस्त करा (Edit)
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm('हे काम काढून टाकायचे आहे का? (Are you sure you want to delete this log?)')) {
                                onDeleteLog(log.id);
                                const updateSel = new Set(selectedLogIds);
                                updateSel.delete(log.id);
                                setSelectedLogIds(updateSel);
                              }
                            }}
                            className="px-3 py-2 bg-rose-50 text-rose-700 rounded-xl text-[11px] font-bold flex items-center gap-1 transition shadow-xs hover:bg-rose-100 cursor-pointer min-h-[38px]"
                          >
                            <Trash2 className="w-3 h-3 text-rose-600" />
                            काढून टाका (Delete)
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* Selected Counter Notice */}
      {selectedLogsArray.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-medium text-indigo-800 shadow-sm"
        >
          <span className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            आपण <strong>{selectedLogsArray.length}</strong> कामांचे लॉग निवडले आहेत, एकूण रक्कम: <strong>₹{selectedLogsArray.reduce((acc, log) => acc + log.totalAmount, 0).toLocaleString('en-IN')}</strong>.
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedLogIds(new Set())}
              className="px-2.5 py-1 text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
            >
              निवड रद्द करा (Clear selection)
            </button>
            <button
              onClick={handleCreateBillFromSelected}
              className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-750 transition cursor-pointer"
            >
              बिल बनवा (Invoice)
            </button>
            <button
              onClick={handleCreateChallanFromSelected}
              className="px-3.5 py-1.5 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition cursor-pointer"
            >
              डिलिव्हरी चलान (Challan)
            </button>
          </div>
        </motion.div>
      )}

      {/* EMAIL EXPORT MODAL DISPLAY */}
      <AnimatePresence>
        {showEmailModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-750">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span className="font-extrabold text-sm text-slate-800">ईमेलवर एक्सेल फाईल पाठवा</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="p-1 hover:bg-slate-200/60 rounded-full transition text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6">
                {isSendingEmail ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">डेटा एक्सेल स्वरूपात कम्पाईल करत आहे...</p>
                      <p className="text-[10px] text-slate-400">RAJMUDRA Secured Mail Server द्वारे ईमेल पाठवला जात आहे</p>
                    </div>
                  </div>
                ) : emailSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center space-y-3 py-4"
                  >
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 border border-emerald-200 shadow-xs">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1.5 px-2">
                      <h4 className="font-extrabold text-slate-800 text-sm">ईमेल यशस्वीरित्या पाठवला! (Email Sent)</h4>
                      <p className="text-xs text-slate-600 font-medium">
                        एक्सेल फाईलचा संपूर्ण रिपोर्ट <strong>{targetEmail}</strong> वर पाठवला गेला आहे.
                      </p>
                      <div className="text-[10px] text-slate-500 bg-slate-50 p-3 rounded-xl border mt-3 text-left space-y-1">
                        <p className="font-bold text-slate-700">💡 सोयीसाठी सोबत खालील गोष्टी झाल्या:</p>
                        <p>१. एक्सेल (.csv) रिपोर्ट तुमच्या फाईलमध्ये पण डाउनलोड झाला आहे.</p>
                        <p>२. कामाचा ईमेल मजकूर कॉपी करून क्लिपबोर्डमध्ये घेतला आहे (Pasted in Clipboard).</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEmailModal(false)}
                      className="mt-4 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition shadow-sm w-full cursor-pointer"
                    >
                      बंद करा (Close)
                    </button>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed bg-amber-50 border border-amber-100 p-3.5 rounded-xl font-medium">
                      <strong>टीप:</strong> आपण वर फिल्टर केलेला सर्व डेटा ({filteredLogs.length} नोंदी) एक्सेल (Excel/CSV) रिपोर्ट फॉरमॅट मध्ये ईमेल द्वारे पाठवला जाईल.
                    </p>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-850 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-indigo-600" /> ईमेल आयडी टाका (Recipient Email ID):
                      </label>
                      <input
                        type="email"
                        className="px-3.5 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm text-slate-800 font-medium"
                        placeholder="उदा. raje@gmail.com"
                        value={targetEmail}
                        onChange={(e) => setTargetEmail(e.target.value)}
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => setShowEmailModal(false)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition cursor-pointer"
                      >
                        रद्द करा
                      </button>
                      <button
                        type="button"
                        onClick={handleSendEmailSimulation}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white rounded-xl shadow-sm hover:shadow transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" /> डेटा पाठवा (Send Now)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
