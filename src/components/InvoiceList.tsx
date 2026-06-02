import React, { useState } from 'react';
import { FileText, Printer, Trash2, Calendar, Building, Landmark, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Invoice } from '../types';

interface InvoiceListProps {
  invoices: Invoice[];
  onDeleteInvoice: (id: string) => void;
  onPrintInvoice: (invoice: Invoice) => void;
}

export function InvoiceList({ invoices, onDeleteInvoice, onPrintInvoice }: InvoiceListProps) {
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedInvoiceId(expandedInvoiceId === id ? null : id);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col h-full">
      <div className="pb-5 border-b border-slate-100 mb-4">
        <h2 className="text-lg font-bold text-slate-800 font-sans tracking-tight">बिलांचे रेकॉर्ड्स (Saved Invoices Ledger)</h2>
        <p className="text-xs text-slate-400 mt-0.5">पूर्वी तयार केलेल्या बिलांची यादी पहा आणि पुन्हा प्रिंट/शेअर करा</p>
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
          <FileText className="w-12 h-12 text-slate-300 stroke-[1.5] mb-2" />
          <p className="text-slate-500 font-medium text-sm">अद्याप कोणतेही बिल तयार केलेले नाही</p>
          <p className="text-slate-400 text-xs mt-1">
            कामांच्या यादीतून मल्टिपल कामे निवडा आणि वर "बिल बनवा" (Create Bill) वर क्लिक करा.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[800px] overflow-y-auto">
          {invoices.map((inv) => {
            const isExpanded = expandedInvoiceId === inv.id;
            return (
              <div 
                key={inv.id} 
                className="border border-slate-150 rounded-xl overflow-hidden hover:border-slate-300 transition-all bg-white"
              >
                {/* Header row */}
                <div 
                  className="p-4 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4 cursor-pointer"
                  onClick={() => toggleExpand(inv.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 font-sans text-xs sm:text-sm">{inv.invoiceNumber}</div>
                      <div className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        तारीख: <strong>{inv.date}</strong> | देय तारीख: <strong>{inv.dueDate}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    {/* Client name & summary */}
                    <div className="hidden sm:block text-right">
                      <div className="text-xs font-bold text-slate-700">{inv.client.name}</div>
                      <div className="text-[10px] text-slate-400">{inv.items.length} कामे (Logs included)</div>
                    </div>

                    {/* Grand total */}
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">एकूण रक्कम</div>
                      <div className="text-sm md:text-base font-extrabold text-indigo-600 font-mono">
                        ₹{(inv.grandTotal || 0).toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Actions panel */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onPrintInvoice(inv)}
                        className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer"
                        title="प्रिंट करा (Print Invoice)"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('हे बिल काढून टाकायचे आहे का? (Do you want to delete this invoice record from history?)')) {
                            onDeleteInvoice(inv.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="काढून टाका (Delete record)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      
                      <button
                        onClick={() => toggleExpand(inv.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details list */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-150 p-4 bg-white"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                        
                        {/* Summary Block */}
                        <div className="md:col-span-4 space-y-2">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">ग्राहकाचे तपशील (Bill To):</div>
                          <div className="space-y-1 text-slate-705 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <div><strong>{inv.client.name}</strong></div>
                            <div className="text-slate-500 mt-0.5">{inv.client.address}</div>
                            {inv.client.phone && <div className="text-slate-450 mt-1">📞 {inv.client.phone}</div>}
                            {inv.client.gstNumber && <div className="text-slate-700 font-bold mt-1">GSTIN: {inv.client.gstNumber}</div>}
                          </div>
                        </div>

                        {/* List of included Logs */}
                        <div className="md:col-span-8 space-y-2">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">समाविष्ट असलेली कामे (Compiled Logs):</div>
                          <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100 text-[11px]">
                             {inv.items.map((item, index) => (
                              <div key={item.id} className="p-2.5 flex items-start justify-between gap-3 bg-white hover:bg-slate-50/55 transition-colors">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap text-slate-500">
                                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded text-[10px]">Sr.{index + 1}</span>
                                    <span className="font-mono font-medium">{item.date}</span>
                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-650 rounded text-[9px] font-bold">
                                      {item.department}
                                    </span>
                                    <span>at <strong>{item.address}</strong></span>
                                  </div>
                                  <p className="text-slate-600 truncate max-w-sm sm:max-w-md md:max-w-lg font-sans pt-0.5" title={item.description}>
                                    <strong>Description:</strong> {item.description}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="font-mono text-slate-500">Qty: {item.hours || 1} × ₹{(item.rate || 0).toLocaleString('en-IN')}</div>
                                  <div className="font-bold text-slate-700 font-mono mt-0.5">
                                    ₹{item.totalAmount.toLocaleString('en-IN')}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
