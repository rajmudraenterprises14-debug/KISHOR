import React, { useState, useEffect } from 'react';
import { 
  Building2, User, FileText, ListTodo
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Type imports
import { WorkLog, Invoice } from './types';

// Component imports
import { StatsCard } from './components/StatsCard';
import { WorkForm } from './components/WorkForm';
import { LogList } from './components/LogList';
import { InvoiceGenerator } from './components/InvoiceGenerator';
import { InvoiceList } from './components/InvoiceList';
import { AddressClientManager } from './components/AddressClientManager';
import { ChallanGenerator } from './components/ChallanGenerator';

// High-fidelity Marathi/English initial dummy logs for demo purposes
const SAMPLE_LOGS: WorkLog[] = [
  {
    id: 'sample-1',
    date: '2026-06-01',
    address: 'बाणेर रस्ता, बिल्डिंग ४, पुणे (Baner Road, Building 4, Pune)',
    department: 'Electrical Works',
    clientName: 'जय गणेश डेव्हलपर्स (Jay Ganesh Developers)',
    description: 'नवीन कमर्शियल हॉलमध्ये पूर्ण केबल वायरिंग आणि इलेक्ट्रिकल डिस्ट्रीब्यूशन बॉक्स (DB) चे इंस्टॉलेशन आणि ड्रेसिंग पूर्ण केले.',
    hours: 8,
    rate: 450,
    totalAmount: 3600,
    status: 'Unbilled',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'sample-2',
    date: '2026-05-30',
    address: 'हिंजवडी आयटी पार्क, फेज २ (Hinjewadi IT Park, Phase 2, Pune)',
    department: 'Maintenance Support',
    clientName: 'टेक सोल्यूशन्स एलएलपी (Tech Solutions LLP)',
    description: 'सर्व्हर रूममधील २ टनी एअर कंडिशनर (AC) युनिटचे सर्व्हिसिंग, गॅस प्रेशर तपासणी आणि मुख्य बोर्ड पॅनेलची सुरक्षा ऑडिट केली.',
    hours: 5.5,
    rate: 600,
    totalAmount: 3300,
    status: 'Unbilled',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  },
  {
    id: 'sample-3',
    date: '2026-05-28',
    address: 'कोथरूड डेपो शेजारी, पुणे (Kothrud Depot, Pune)',
    department: 'Electrical Works',
    clientName: 'राजमुद्रा एंटरप्रायझेस (Rajmudra Enterprises)',
    description: 'नवीन केबिनमधील अंतर्गत पॉवर सॉकेट्स आणि छताच्या एलईडी कन्सिल लाईट्सचे फिटिंग व सुरक्षित अर्थिंग टेस्टिंग पूर्ण केले.',
    hours: 12,
    rate: 400,
    totalAmount: 4800,
    status: 'Billed',
    createdAt: new Date(Date.now() - 120 * 3600 * 1000).toISOString()
  }
];

export default function App() {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices'>('dashboard');
  
  // Under invoice creation state (stores logs being billed)
  const [selectedBillingLogs, setSelectedBillingLogs] = useState<WorkLog[] | null>(null);
  const [billingMode, setBillingMode] = useState<'invoice' | 'challan'>('invoice');
  
  // Editing state for updating previous work entries
  const [editingLog, setEditingLog] = useState<WorkLog | null>(null);

  // Custom persistent lists for Work Addresses and Clients
  const [customAddresses, setCustomAddresses] = useState<string[]>([]);
  const [customClients, setCustomClients] = useState<string[]>([]);

  // Load from local storage on boot
  useEffect(() => {
    const savedLogs = localStorage.getItem('rajmudra_work_logs');
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (e) {
        setLogs(SAMPLE_LOGS);
      }
    } else {
      // Seed initial beautiful sample data
      setLogs(SAMPLE_LOGS);
      localStorage.setItem('rajmudra_work_logs', JSON.stringify(SAMPLE_LOGS));
    }

    const savedInvoices = localStorage.getItem('rajmudra_invoices');
    if (savedInvoices) {
      try {
        setInvoices(JSON.parse(savedInvoices));
      } catch (e) {
        setInvoices([]);
      }
    }

    // Seed/Load custom addresses
    const savedCustomAddresses = localStorage.getItem('rajmudra_custom_addresses');
    if (savedCustomAddresses) {
      try {
        setCustomAddresses(JSON.parse(savedCustomAddresses));
      } catch (e) {
        setCustomAddresses([
          'बाणेर रस्ता, बिल्डिंग ४, पुणे (Baner Road, Building 4, Pune)',
          'हिंजवडी आयटी पार्क, फेज २ (Hinjewadi IT Park, Phase 2, Pune)',
          'कोथरूड डेपो शेजारी, पुणे (Kothrud Depot, Pune)'
        ]);
      }
    } else {
      const defaultAddrs = [
        'बाणेर रस्ता, बिल्डिंग ४, पुणे (Baner Road, Building 4, Pune)',
        'हिंजवडी आयटी पार्क, फेज २ (Hinjewadi IT Park, Phase 2, Pune)',
        'कोथरूड डेपो शेजारी, पुणे (Kothrud Depot, Pune)'
      ];
      setCustomAddresses(defaultAddrs);
      localStorage.setItem('rajmudra_custom_addresses', JSON.stringify(defaultAddrs));
    }

    // Seed/Load custom clients
    const savedCustomClients = localStorage.getItem('rajmudra_custom_clients');
    if (savedCustomClients) {
      try {
        setCustomClients(JSON.parse(savedCustomClients));
      } catch (e) {
        setCustomClients([
          'जय गणेश डेव्हलपर्स (Jay Ganesh Developers)',
          'टेक सोल्यूशन्स एलएलपी (Tech Solutions LLP)',
          'राजमुद्रा एंटरप्रायझेस (Rajmudra Enterprises)'
        ]);
      }
    } else {
      const defaultClients = [
        'जय गणेश डेव्हलपर्स (Jay Ganesh Developers)',
        'टेक सोल्यूशन्स एलएलपी (Tech Solutions LLP)',
        'राजमुद्रा एंटरप्रायझेस (Rajmudra Enterprises)'
      ];
      setCustomClients(defaultClients);
      localStorage.setItem('rajmudra_custom_clients', JSON.stringify(defaultClients));
    }
  }, []);

  // Handlers to manage Custom Addresses and Clients
  const handleAddAddress = (address: string) => {
    const updated = [...customAddresses, address];
    setCustomAddresses(updated);
    localStorage.setItem('rajmudra_custom_addresses', JSON.stringify(updated));
  };

  const handleDeleteAddress = (address: string) => {
    const updated = customAddresses.filter(a => a !== address);
    setCustomAddresses(updated);
    localStorage.setItem('rajmudra_custom_addresses', JSON.stringify(updated));
  };

  const handleAddClient = (client: string) => {
    const updated = [...customClients, client];
    setCustomClients(updated);
    localStorage.setItem('rajmudra_custom_clients', JSON.stringify(updated));
  };

  const handleDeleteClient = (client: string) => {
    const updated = customClients.filter(c => c !== client);
    setCustomClients(updated);
    localStorage.setItem('rajmudra_custom_clients', JSON.stringify(updated));
  };

  // Sync logs status helper
  const syncLogsToLocalStorage = (updatedLogs: WorkLog[]) => {
    setLogs(updatedLogs);
    localStorage.setItem('rajmudra_work_logs', JSON.stringify(updatedLogs));
  };

  const syncInvoicesToLocalStorage = (updatedInvoices: Invoice[]) => {
    setInvoices(updatedInvoices);
    localStorage.setItem('rajmudra_invoices', JSON.stringify(updatedInvoices));
  };

  // Add work log handler
  const handleAddLog = (newLogData: Omit<WorkLog, 'id' | 'createdAt' | 'totalAmount' | 'status'>) => {
    const freshLog: WorkLog = {
      ...newLogData,
      id: `log-${Date.now()}`,
      totalAmount: Number((newLogData.hours * newLogData.rate).toFixed(2)),
      status: 'Unbilled',
      createdAt: new Date().toISOString()
    };

    const updated = [freshLog, ...logs];
    syncLogsToLocalStorage(updated);
  };

  // Delete work log
  const handleDeleteLog = (id: string) => {
    const updated = logs.filter(log => log.id !== id);
    syncLogsToLocalStorage(updated);
    if (editingLog?.id === id) {
      setEditingLog(null);
    }
  };

  // Update existing work log
  const handleUpdateLog = (updatedLog: WorkLog) => {
    const updated = logs.map(log => log.id === updatedLog.id ? updatedLog : log);
    syncLogsToLocalStorage(updated);
    setEditingLog(null);
  };

  // Toggle log billing status between Billed & Unbilled
  const handleToggleLogStatus = (id: string) => {
    const updated = logs.map(log => {
      if (log.id === id) {
        return {
          ...log,
          status: log.status === 'Billed' ? 'Unbilled' as const : 'Billed' as const
        };
      }
      return log;
    });
    syncLogsToLocalStorage(updated);
  };

  // Handle invoice generation
  const handleInvoiceGenerated = (newInvoice: Invoice, autoMarkAsBilled: boolean) => {
    // 1. Add invoice to historical ledger
    const updatedInvoices = [newInvoice, ...invoices];
    syncInvoicesToLocalStorage(updatedInvoices);

    // 2. Mark specific logs as Billed if selected in options
    if (autoMarkAsBilled) {
      const itemsIdsToMark = new Set(newInvoice.items.map(item => item.id));
      const updatedLogs = logs.map(log => {
        if (itemsIdsToMark.has(log.id)) {
          return { ...log, status: 'Billed' as const };
        }
        return log;
      });
      syncLogsToLocalStorage(updatedLogs);
    }

    // 3. Clear creation wizard and exit
    setSelectedBillingLogs(null);
    setActiveTab('invoices'); // Hop to saved invoices ledger view
  };

  // Quick re-print helper from lists
  const handlePrintExistingInvoice = (invoice: Invoice) => {
    // We simply populate the generator with invoice items context in print mode
    setSelectedBillingLogs(invoice.items);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 leading-normal flex flex-col">
      
      {/* NATIVE HEADER (Highly premium, optimized layout) - Hidden when printing */}
      <header className="bg-slate-900 text-white shadow-md border-b border-indigo-950/20 sticky top-0 z-25 print:hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Branded Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl border border-indigo-500 shadow-inner">
              <Building2 className="w-6 h-6 text-white stroke-[2.25]" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-extrabold tracking-tight font-display flex items-center gap-1.5 leading-none">
                <span>राजमुद्रा बिलिंग मॅनेजर</span>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-bold px-1.5 py-0.5 rounded border border-indigo-500/30">PRO</span>
              </h1>
              <p className="text-xs text-indigo-200 mt-1 font-medium font-sans">
                Address-wise & Department-wise Daily Work Log & Invoice Maker
              </p>
            </div>
          </div>

          {/* User profile details widget */}
          <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2 self-start sm:self-auto shadow-sm">
            <div className="p-1 bg-indigo-500/20 text-indigo-300 rounded-lg">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 leading-none">कंपनी व्यवस्थापक (Admin Account)</div>
              <div className="text-xs font-mono font-medium text-slate-100 mt-1 select-all">
                RAJMUDRAENTERPRISES14@gmail.com
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* REVOLUTIONARY TABS BAR (Hidden when billing details are open or printing) */}
      {!selectedBillingLogs && (
        <nav className="bg-white border-b border-slate-200/80 sticky top-[77px] z-20 shadow-sm print:hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
            <div className="flex gap-2 py-3 overflow-x-auto scrollbar-none">
              
              {/* Daily Log Dashboard TAB */}
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-150'
                }`}
              >
                <ListTodo className="w-4 h-4" />
                कामांची नोंदणी व आकडेवारी (Logs & Dashboard)
              </button>

              {/* Invoices Ledger TAB */}
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                  activeTab === 'invoices'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-150'
                }`}
              >
                <FileText className="w-4 h-4" />
                तयार केलेली बिले (Invoices Ledger)
                {invoices.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                    activeTab === 'invoices' ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {invoices.length}
                  </span>
                )}
              </button>

            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-450 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              सर्व डेटा सुरक्षित आहे (Local Storage Auto Sync)
            </div>
          </div>
        </nav>
      )}

      {/* MAIN CONTAINER CONTENT */}
      <main id="main-app-container" className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 print:p-0 print:m-0 print:bg-white">
        
        {/* Render invoice creator fullscreen style if selected logs are active */}
        {selectedBillingLogs ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full"
          >
            {billingMode === 'invoice' ? (
              <InvoiceGenerator
                selectedLogs={selectedBillingLogs}
                onInvoiceGenerated={handleInvoiceGenerated}
                onCancel={() => setSelectedBillingLogs(null)}
              />
            ) : (
              <ChallanGenerator
                selectedLogs={selectedBillingLogs}
                onCancel={() => setSelectedBillingLogs(null)}
              />
            )}
          </motion.div>
        ) : (
          <div className="space-y-6">
            
            {/* Tab 1: Dashboard and record list */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Visual stats dynamic cards */}
                <StatsCard logs={logs} />

                {/* Split Forms and Table */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Work Logger Entry */}
                  <div className="lg:col-span-4 lg:sticky lg:top-[90px] z-10 space-y-4">
                    <WorkForm 
                      onAddLog={handleAddLog} 
                      existingLogs={logs} 
                      editingLog={editingLog}
                      onUpdateLog={handleUpdateLog}
                      onCancelEdit={() => setEditingLog(null)}
                      customAddresses={customAddresses}
                      customClients={customClients}
                    />
                    
                    <AddressClientManager
                      customAddresses={customAddresses}
                      customClients={customClients}
                      onAddAddress={handleAddAddress}
                      onDeleteAddress={handleDeleteAddress}
                      onAddClient={handleAddClient}
                      onDeleteClient={handleDeleteClient}
                    />
                  </div>

                  {/* Right Column: Work tracker list & filter dashboards */}
                  <div className="lg:col-span-8 h-full">
                    <LogList
                      logs={logs}
                      onDeleteLog={handleDeleteLog}
                      onToggleStatus={handleToggleLogStatus}
                      onSelectLogsForBilling={(sel, mode) => {
                        setSelectedBillingLogs(sel);
                        setBillingMode(mode);
                      }}
                      onEditLog={(log) => {
                        setEditingLog(log);
                        document.getElementById('log-work-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                    />
                  </div>

                </div>

              </div>
            )}

            {/* Tab 2: Saved invoices database ledger */}
            {activeTab === 'invoices' && (
              <div className="w-full max-w-5xl mx-auto">
                <InvoiceList
                  invoices={invoices}
                  onDeleteInvoice={(id) => {
                    const updated = invoices.filter(inv => inv.id !== id);
                    syncInvoicesToLocalStorage(updated);
                  }}
                  onPrintInvoice={handlePrintExistingInvoice}
                />
              </div>
            )}

          </div>
        )}

      </main>

      {/* FOOTER - Hidden when printing */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-5 text-center text-xs text-slate-400 font-sans print:hidden">
        <p className="font-semibold tracking-wide">राजमुद्रा बिलिंग मॅनेजर (Rajmudra Work Tracker & Invoicing Suite)</p>
        <p className="mt-1 opacity-70">© {new Date().getFullYear()} Rajmudra Enterprises. All rights reserved. Locally Secured.</p>
      </footer>

      {/* RENDER-SKELETON IF PRINT ACTIVE FOR RAW HTML PRINT OVERRIDES */}
      {selectedBillingLogs && (
        <div className="hidden print:block w-full text-black">
          {/* This matches perfectly for window.print() selector target */}
          {billingMode === 'invoice' ? (
            <div id="invoice-print-area"></div>
          ) : (
            <div id="challan-print-area"></div>
          )}
        </div>
      )}

    </div>
  );
}
