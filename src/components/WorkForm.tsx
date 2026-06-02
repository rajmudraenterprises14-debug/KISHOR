import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Calendar, Building2, MapPin, AlignLeft, Clock, IndianRupee, Plus, AlertCircle, CheckCircle, UserCheck, FileSpreadsheet, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkLog } from '../types';

interface WorkFormProps {
  onAddLog: (log: Omit<WorkLog, 'id' | 'createdAt' | 'totalAmount' | 'status'>) => void;
  existingLogs: WorkLog[];
  editingLog?: WorkLog | null;
  onUpdateLog?: (log: WorkLog) => void;
  onCancelEdit?: () => void;
  customAddresses?: string[];
  customClients?: string[];
}

export function WorkForm({ 
  onAddLog, 
  existingLogs, 
  editingLog, 
  onUpdateLog, 
  onCancelEdit,
  customAddresses = [],
  customClients = []
}: WorkFormProps) {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [address, setAddress] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [rate, setRate] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');

  // Excel update/create selection option
  const [excelOption, setExcelOption] = useState<'current' | 'new'>('current');
  const [selectedExcelGroup, setSelectedExcelGroup] = useState<string>('');
  const [newExcelGroupName, setNewExcelGroupName] = useState<string>('');

  // Extract unique excel file groups from logs
  const uniqueExcelGroups = useMemo(() => {
    const groups = existingLogs
      .map(log => log.excelGroup)
      .filter((group): group is string => typeof group === 'string' && group.trim() !== '');
    return Array.from(new Set(groups));
  }, [existingLogs]);

  // Sync default selected group
  useEffect(() => {
    if (uniqueExcelGroups.length > 0) {
      if (!selectedExcelGroup || !uniqueExcelGroups.includes(selectedExcelGroup)) {
        setSelectedExcelGroup(uniqueExcelGroups[0]);
      }
    } else {
      setSelectedExcelGroup('मुख्य एकत्रित फाईल (Collective Excel)');
    }
  }, [uniqueExcelGroups]);

  // Dropdown states for suggestions
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [showDeptSuggestions, setShowDeptSuggestions] = useState(false);
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);

  // Success indicator
  const [showSuccess, setShowSuccess] = useState(false);

  const addressRef = useRef<HTMLDivElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<HTMLDivElement>(null);

  // Click outside listener for suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (addressRef.current && !addressRef.current.contains(event.target as Node)) {
        setShowAddressSuggestions(false);
      }
      if (deptRef.current && !deptRef.current.contains(event.target as Node)) {
        setShowDeptSuggestions(false);
      }
      if (clientRef.current && !clientRef.current.contains(event.target as Node)) {
        setShowClientSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute unique suggestions from custom database and existing logs
  const uniqueAddresses = useMemo(() => {
    const listFromLogs = existingLogs.map(l => l.address).filter((a): a is string => typeof a === 'string' && a.trim() !== '');
    return Array.from(new Set([...customAddresses, ...listFromLogs]));
  }, [existingLogs, customAddresses]);

  const uniqueDepartments = useMemo(() => {
    return Array.from(new Set(existingLogs.map(l => l.department).filter((d): d is string => typeof d === 'string' && d.trim() !== '')));
  }, [existingLogs]);

  const uniqueClients = useMemo(() => {
    const listFromLogs = existingLogs.map(l => l.clientName).filter((c): c is string => typeof c === 'string' && c.trim() !== '');
    return Array.from(new Set([...customClients, ...listFromLogs]));
  }, [existingLogs, customClients]);

  const filteredAddresses = useMemo(() => {
    return uniqueAddresses.filter(addr => 
      addr.toLowerCase().includes(address.toLowerCase()) && addr.toLowerCase() !== address.toLowerCase()
    );
  }, [uniqueAddresses, address]);

  const filteredDepts = useMemo(() => {
    return uniqueDepartments.filter(dept => 
      dept.toLowerCase().includes(department.toLowerCase()) && dept.toLowerCase() !== department.toLowerCase()
    );
  }, [uniqueDepartments, department]);

  const filteredClients = useMemo(() => {
    return uniqueClients.filter(client => 
      client.toLowerCase().includes(clientName.toLowerCase()) && client.toLowerCase() !== clientName.toLowerCase()
    );
  }, [uniqueClients, clientName]);

  // Sync form state if layout enters Edit mode
  useEffect(() => {
    if (editingLog) {
      setDate(editingLog.date);
      setAddress(editingLog.address);
      setDepartment(editingLog.department);
      setClientName(editingLog.clientName || editingLog.address);
      setDescription(editingLog.description);
      setRate(editingLog.rate.toString());
      setQuantity(editingLog.hours ? editingLog.hours.toString() : '1');
    } else {
      // Clear inputs representing dynamic parts if we exited edit mode
      setDescription('');
      setRate('');
      setQuantity('1');
    }
  }, [editingLog]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple Validation without requiring hours
    if (!address.trim() || !department.trim() || !description.trim() || !rate) {
      return;
    }

    const finalExcelGroup = excelOption === 'current'
      ? (selectedExcelGroup || 'मुख्य एकत्रित फाईल (Collective Excel)')
      : (newExcelGroupName.trim() || `नवीन एक्सेल फाईल (${new Date().toLocaleDateString('mr-IN')})`);

    const finalQuantity = parseFloat(quantity) || 1;

    if (editingLog && onUpdateLog) {
      onUpdateLog({
        ...editingLog,
        date,
        address: address.trim(),
        department: department.trim(),
        clientName: clientName.trim() || undefined,
        description: description.trim(),
        hours: finalQuantity,
        rate: parseFloat(rate),
        totalAmount: parseFloat(rate) * finalQuantity,
        excelGroup: editingLog.excelGroup || finalExcelGroup
      });
    } else {
      onAddLog({
        date,
        address: address.trim(),
        department: department.trim(),
        clientName: clientName.trim() || undefined,
        description: description.trim(),
        hours: finalQuantity,
        rate: parseFloat(rate),
        excelGroup: finalExcelGroup
      });

      // Reset Form fields
      setDescription('');
      setRate('');
      setQuantity('1');
      setNewExcelGroupName('');
    }

    // Trigger Success feedback
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div id="log-work-form" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
      {/* Visual Accent header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-850 font-sans tracking-tight">
            {editingLog ? 'माहिती दुरुस्त करा (Edit Work Log)' : 'कामे नोंदवा (Log New Work)'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {editingLog ? 'निवडलेल्या कामाची माहिती दुरुस्त करा' : 'नियमित कामे आणि पत्ता व विभागानुसार तपशील प्रविष्ट करा'}
          </p>
        </div>
        <Building2 className="w-5 h-5 text-indigo-500" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* 1. Client Name (ग्राहक नाव) - FIRST */}
          <div className="flex flex-col gap-1.5 relative md:col-span-2" ref={clientRef}>
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between" htmlFor="client_input">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" /> ग्राहक / कंपनीचे नाव (Client/Business Name) <span className="text-[10px] text-rose-500 font-bold">*</span>
              </span>
              <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">बिल आणि एक्सेल अपडेटसाठी</span>
            </label>
            <input
              id="client_input"
              type="text"
              required
              autoComplete="off"
              className="px-3.5 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm transition-all text-slate-800 hover:bg-slate-50/40"
              placeholder="ग्राहकाचे नाव लिहा किंवा निवडा (उदा. राजमुद्रा एंटरप्रायझेस)"
              value={clientName}
              onFocus={() => setShowClientSuggestions(true)}
              onChange={(e) => {
                setClientName(e.target.value);
                setShowClientSuggestions(true);
              }}
            />
            
            {/* Client Suggestions */}
            <AnimatePresence>
              {showClientSuggestions && filteredClients.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 right-0 top-[76px] z-35 bg-white border border-slate-200 shadow-xl rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100"
                >
                  <div className="p-2 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">सेव्ह केलेले किंवा पूर्वीचे ग्राहक:</div>
                  {filteredClients.map((client) => (
                    <button
                      key={client}
                      type="button"
                      className="w-full text-left px-3 py-2.5 text-xs text-slate-700 hover:bg-indigo-55/60 font-medium transition-colors cursor-pointer"
                      onClick={() => {
                        setClientName(client);
                        setShowClientSuggestions(false);
                      }}
                    >
                      {client}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Sites Address (कामाचा पत्ता) - SECOND */}
          <div className="flex flex-col gap-1.5 relative md:col-span-2" ref={addressRef}>
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between" htmlFor="address_input">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" /> कामाचा पत्ता (Work Address / Site) <span className="text-[10px] text-rose-500 font-bold">*</span>
              </span>
              <span className="text-[9px] text-slate-400">साइटचे लोकेशन</span>
            </label>
            <input
              id="address_input"
              type="text"
              required
              autoComplete="off"
              className="px-3.5 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm transition-all text-slate-800 hover:bg-slate-50/40"
              placeholder="पत्ता टाका (उदा. बाणेर रोड, बिल्डींग ४/हिंजवडी आयटी पार्क)"
              value={address}
              onFocus={() => setShowAddressSuggestions(true)}
              onChange={(e) => {
                setAddress(e.target.value);
                setShowAddressSuggestions(true);
              }}
            />
            
            {/* Address Suggestions */}
            <AnimatePresence>
              {showAddressSuggestions && filteredAddresses.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 right-0 top-[76px] z-35 bg-white border border-slate-200 shadow-xl rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100"
                >
                  <div className="p-2 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">सेव्ह केलेले किंवा पूर्वीचे पत्ते:</div>
                  {filteredAddresses.map((addr) => (
                    <button
                      key={addr}
                      type="button"
                      className="w-full text-left px-3 py-2.5 text-xs text-slate-700 hover:bg-indigo-55/60 font-medium transition-colors cursor-pointer"
                      onClick={() => {
                        setAddress(addr);
                        setShowAddressSuggestions(false);
                      }}
                    >
                      {addr}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Department (विभाग) - SECOND */}
          <div className="flex flex-col gap-1.5 relative md:col-span-2" ref={deptRef}>
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between" htmlFor="dept_input">
              <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-indigo-600" /> विभाग (Department or Work Type) <span className="text-[10px] text-rose-500 font-bold">*</span></span>
              <span className="text-[9px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold">मॅन्युअली टाईप करा</span>
            </label>
            <input
              id="dept_input"
              type="text"
              required
              autoComplete="off"
              className="px-3.5 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm transition-all text-slate-800 hover:bg-slate-50/40"
              placeholder="उदा. Electrical, Plumbing, Accounts"
              value={department}
              onFocus={() => setShowDeptSuggestions(true)}
              onChange={(e) => {
                setDepartment(e.target.value);
                setShowDeptSuggestions(true);
              }}
            />
            
            {/* Auto Suggestions */}
            <AnimatePresence>
              {showDeptSuggestions && filteredDepts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 right-0 top-[76px] z-10 bg-white border border-slate-200 shadow-xl rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100"
                >
                  <div className="p-2 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wider">खालीलपैकी निवडा किंवा स्वतः टाईप करा:</div>
                  {filteredDepts.map((deptName) => (
                    <button
                      key={deptName}
                      type="button"
                      className="w-full text-left px-3 py-2.5 text-xs text-slate-700 hover:bg-indigo-55/60 font-medium transition-colors"
                      onClick={() => {
                        setDepartment(deptName);
                        setShowDeptSuggestions(false);
                      }}
                    >
                      {deptName}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Work Date (दिनांक) - THIRD */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5" htmlFor="date_input">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" /> दिनांक (Date) <span className="text-[10px] text-rose-500 font-bold">*</span>
            </label>
            <input
              id="date_input"
              type="date"
              required
              className="px-3.5 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm font-sans transition-all text-slate-800 bg-white hover:bg-slate-50"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* 4. Description of Work (कामाचा तपशील), Quantity (संख्या) & 5. Rate (दर / रक्कम) - SIDE-BY-SIDE */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Description of Work field (Takes up 2/4 width) */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5" htmlFor="desc_input">
                  <AlignLeft className="w-3.5 h-3.5 text-indigo-600" /> कामाचा तपशील (Description of Work done) <span className="text-[10px] text-rose-500 font-bold">*</span>
                </label>
                <textarea
                  id="desc_input"
                  required
                  rows={2}
                  className="px-3.5 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm font-sans transition-all text-slate-800 resize-none hover:bg-slate-50/20"
                  placeholder="केलेल्या कामाचा सविस्तर तपशील येथे लिहा..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Quantity (Qty) (Takes up 1/4 width) */}
              <div className="flex flex-col gap-1.5 md:col-span-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1" htmlFor="qty_input">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" /> संख्या/मोजमाप (Quantity) <span className="text-[10px] text-rose-500 font-bold">*</span>
                </label>
                <input
                  id="qty_input"
                  type="number"
                  required
                  min="0.1"
                  step="any"
                  className="px-3.5 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm transition-all text-slate-800 md:h-[62px]"
                  placeholder="संख्या (उदा. ५)"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              {/* Rate field (Takes up 1/4 width right next to it) */}
              <div className="flex flex-col gap-1.5 md:col-span-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1" htmlFor="rate_input">
                  <IndianRupee className="w-3.5 h-3.5 text-indigo-600" /> दर / रक्कम (Rate) <span className="text-[10px] text-rose-500 font-bold">*</span>
                </label>
                <input
                  id="rate_input"
                  type="number"
                  required
                  min="1"
                  className="px-3.5 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm transition-all text-slate-800 md:h-[62px]"
                  placeholder="₹ रक्कम टाका"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                />
              </div>

            </div>
          </div>

          {/* EXCEL STORAGE CHOICE: UPDATE VS NEW FILE */}
          {!editingLog && (
            <div className="md:col-span-2 mt-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>हा डेटा कोणत्या एक्सेल (Excel) फाईलमध्ये सेव्ह करायचा आहे?</span>
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                <button
                  type="button"
                  onClick={() => setExcelOption('current')}
                  className={`px-3 py-2.5 rounded-lg border text-left text-xs font-medium transition-all flex items-start gap-2 cursor-pointer ${
                    excelOption === 'current'
                      ? 'border-emerald-500 bg-emerald-55/15 text-emerald-900 ring-2 ring-emerald-100/50'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="excelOption"
                    checked={excelOption === 'current'}
                    onChange={() => setExcelOption('current')}
                    className="mt-0.5 accent-emerald-600 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold block text-slate-850">चालू फाईलमध्येच अपडेट करा</span>
                    <span className="text-[10px] text-slate-400 font-normal">Keep updating the existing Excel sheet</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setExcelOption('new')}
                  className={`px-3 py-2.5 rounded-lg border text-left text-xs font-medium transition-all flex items-start gap-2 cursor-pointer ${
                    excelOption === 'new'
                      ? 'border-emerald-500 bg-emerald-55/15 text-emerald-900 ring-2 ring-emerald-100/50'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="excelOption"
                    checked={excelOption === 'new'}
                    onChange={() => setExcelOption('new')}
                    className="mt-0.5 accent-emerald-600 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold block text-slate-850">नवीन स्वतंत्र एक्सेल बनवा</span>
                    <span className="text-[10px] text-slate-400 font-normal">Start a new fresh Excel sheet</span>
                  </div>
                </button>
              </div>

              <AnimatePresence mode="wait">
                {excelOption === 'current' ? (
                  <motion.div
                    key="current-excel"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">चालू असलेल्या फाईल्स (Select from existing):</span>
                      <select
                        className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-100"
                        value={selectedExcelGroup}
                        onChange={(e) => setSelectedExcelGroup(e.target.value)}
                      >
                        {uniqueExcelGroups.length > 0 ? (
                          uniqueExcelGroups.map(group => (
                            <option key={group} value={group}>{group}</option>
                          ))
                        ) : (
                          <option value="मुख्य एकत्रित फाईल (Collective Excel)">मुख्य एकत्रित फाईल (Collective Excel)</option>
                        )}
                      </select>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="new-excel"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">नवीन एक्सेल फाईलचे नाव (New Excel Name): <span className="text-rose-500 font-bold">*</span></span>
                      <input
                        type="text"
                        required={excelOption === 'new'}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 font-medium"
                        placeholder="उदा. जानेवारी ते मे कामे २०२६ (Jan-May 2026 logs)"
                        value={newExcelGroupName}
                        onChange={(e) => setNewExcelGroupName(e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

        </div>

        {/* Form Actions */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="h-6">
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-1 text-emerald-600 text-xs font-medium"
                >
                  <CheckCircle className="w-4 h-4" /> {editingLog ? 'बदल यशस्वीरित्या जतन केले!' : 'यशस्वीरित्या सेव्ह केले! (Log Action Complete)'}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {editingLog && onCancelEdit && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                रद्द करा (Cancel)
              </button>
            )}
            <button
              type="submit"
              className={`px-5 py-2.5 ${editingLog ? 'bg-indigo-650 bg-indigo-700 hover:bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-700'} active:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 hover:shadow hover:scale-[1.01]`}
            >
              {editingLog ? (
                <>
                  <CheckCircle className="w-4 h-4" /> बदल जतन करा (Save Changes)
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> नवीन काम जोडा (Add Log)
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
