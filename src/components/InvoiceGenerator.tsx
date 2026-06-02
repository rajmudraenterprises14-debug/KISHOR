import React, { useState, useEffect } from 'react';
import { 
  X, Printer, Save, FileText, ArrowLeft, Building, 
  MapPin, Phone, Mail, Award, Landmark, Settings2, Info, Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { WorkLog, ClientDetails, CompanySettings, Invoice } from '../types';

interface InvoiceGeneratorProps {
  selectedLogs: WorkLog[];
  onInvoiceGenerated: (invoice: Invoice, autoMarkAsBilled: boolean) => void;
  onCancel: () => void;
}

const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  name: 'राजमुद्रा एंटरप्रायझेस (Rajmudra Enterprises)',
  address: 'मुख्य मार्ग, पुणे, महाराष्ट्र (Main Road, Pune, MH)',
  phone: '+91 9876543210',
  email: 'contact@rajmudra.com',
  gstNumber: '27AAAAA0000A1Z5',
  bankName: 'स्टेट बँक ऑफ इंडिया (State Bank of India)',
  accountNumber: '123456789012',
  ifscCode: 'SBIN0001234',
  terms: '१. कृपया बिल मिळाल्यापासून १५ दिवसांच्या आत पैसे जमा करावे.\n२. विलंब झाल्यास १८% वार्षिक व्याज लागू शकते.'
};

let invoiceCounterRef = 1;

export function InvoiceGenerator({ selectedLogs, onInvoiceGenerated, onCancel }: InvoiceGeneratorProps) {
  // Try to load company settings from localStorage
  const [company, setCompany] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem('invoice_company_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return DEFAULT_COMPANY_SETTINGS;
  });

  // Track if they want customizable invoice counter
  const [invoiceNumber, setInvoiceNumber] = useState(() => {
    const randomSuffix = Math.floor(Math.random() * 900) + 100;
    return `RE-${new Date().getFullYear()}-${randomSuffix}`;
  });

  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [invoiceDueDate, setInvoiceDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 15); // Default 15 days payment terms
    return date.toISOString().split('T')[0];
  });

  // Client Details auto-grafted from selected logs
  const [client, setClient] = useState<ClientDetails>(() => {
    // Collect the most common client name and address from selected logs
    const clientNameGraft = selectedLogs.find(l => l.clientName)?.clientName || 'ग्राहक नाव प्रविष्ट करा (Client Name)';
    const clientAddressGraft = selectedLogs[0]?.address || 'पत्ता प्रविष्ट करा (Client Address)';
    return {
      name: clientNameGraft,
      address: clientAddressGraft,
      phone: '',
      email: '',
      gstNumber: ''
    };
  });

  const [taxRate, setTaxRate] = useState<number>(18); // Default 18% GST (common in work contracts in India)
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [autoMarkAsBilled, setAutoMarkAsBilled] = useState<boolean>(true);

  // Save company settings to localStorage whenever they edit
  const saveCompanySettings = (updated: CompanySettings) => {
    setCompany(updated);
    localStorage.setItem('invoice_company_settings', JSON.stringify(updated));
  };

  // Calculate financials
  const subtotal = selectedLogs.reduce((acc, log) => acc + (log.totalAmount || 0), 0);
  const discountAmount = Number(discount) || 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round(taxableAmount * (taxRate / 100));
  const grandTotal = taxableAmount + taxAmount;

  // Print trigger
  const handlePrint = () => {
    window.print();
  };

  const handleSaveInvoice = () => {
    const newInvoice: Invoice = {
      id: String(Date.now()),
      invoiceNumber,
      date: invoiceDate,
      dueDate: invoiceDueDate,
      client,
      items: selectedLogs,
      taxRate,
      discount: discountAmount,
      subtotal,
      taxAmount,
      grandTotal,
      notes,
      createdAt: new Date().toISOString()
    };
    onInvoiceGenerated(newInvoice, autoMarkAsBilled);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 print:block">
      {/* LEFT PANEL: CONFIGURATION INPUTS (Hidden during print) */}
      <div className="xl:col-span-5 space-y-6 print:hidden">
        
        {/* Navigation & Header */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onCancel}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition"
            title="परत जा (Go back)"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">नवे बिल बनवा (Invoice Builder)</h1>
            <p className="text-xs text-slate-400 mt-0.5">निवडलेल्या {selectedLogs.length} कामांवरून बिल तयार करा</p>
          </div>
        </div>

        {/* 1. SELLER / COMPANY DETAILS */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-850 flex items-center gap-1.5 uppercase tracking-wide">
              <Building className="w-4 h-4 text-indigo-500" /> तुमची माहिती (My Company Settings)
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">Automatic Auto-save</span>
          </div>

          <div className="grid grid-cols-1 gap-3 text-xs">
            {/* Vendor Name */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-500">नाव/संस्था (Vendor Name)</label>
              <input
                type="text"
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-slate-705"
                value={company.name}
                onChange={(e) => saveCompanySettings({ ...company, name: e.target.value })}
              />
            </div>

            {/* Vendor Address */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-500">पत्ता (Vendor Address)</label>
              <input
                type="text"
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                value={company.address}
                onChange={(e) => saveCompanySettings({ ...company, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-500">मोबाईल (Phone)</label>
                <input
                  type="text"
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 font-mono"
                  value={company.phone}
                  onChange={(e) => saveCompanySettings({ ...company, phone: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-500">जीएसटी (GSTIN - Optional)</label>
                <input
                  type="text"
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700 font-mono uppercase"
                  placeholder="उदा. 27AAAAA0..."
                  value={company.gstNumber}
                  onChange={(e) => saveCompanySettings({ ...company, gstNumber: e.target.value })}
                />
              </div>
            </div>

            {/* Bank Details */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 mt-1">
              <div className="flex items-center gap-1 font-bold text-slate-600 text-[10px] uppercase">
                <Landmark className="w-3.5 h-3.5 text-indigo-500" /> बँक तपशील (For Payments)
              </div>
              <div className="grid grid-cols-1 gap-2 text-[11px]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-400">बँकेचे नाव (Bank Name)</span>
                  <input
                    type="text"
                    className="px-2 py-1 bg-white border border-slate-250 rounded focus:outline-none focus:ring-1 text-slate-700"
                    value={company.bankName}
                    onChange={(e) => saveCompanySettings({ ...company, bankName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400">खाते क्रमांक (Account No)</span>
                    <input
                      type="text"
                      className="px-2 py-1 bg-white border border-slate-250 rounded focus:outline-none focus:ring-1 text-slate-700 font-mono"
                      value={company.accountNumber}
                      onChange={(e) => saveCompanySettings({ ...company, accountNumber: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400">IFSC कोड</span>
                    <input
                      type="text"
                      className="px-2 py-1 bg-white border border-slate-250 rounded focus:outline-none focus:ring-1 text-slate-700 font-mono uppercase"
                      value={company.ifscCode}
                      onChange={(e) => saveCompanySettings({ ...company, ifscCode: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. THE CLIENT INFORMATION */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-850 flex items-center gap-1.5 uppercase tracking-wide border-b border-slate-150 pb-2">
            <Settings2 className="w-4 h-4 text-blue-500" /> ग्राहकाची माहिती (Bill To)
          </h3>
          <div className="grid grid-cols-1 gap-2.5 text-xs">
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-500">ग्राहकाचे नाव / संस्था (Client Name)</label>
              <input
                type="text"
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-medium"
                value={client.name}
                onChange={(e) => setClient({ ...client, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-500">पत्ता (Client Address)</label>
              <input
                type="text"
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700"
                value={client.address}
                onChange={(e) => setClient({ ...client, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-500">मोबाईल (Phone)</label>
                <input
                  type="text"
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-mono"
                  placeholder="उदा. 9812..."
                  value={client.phone}
                  onChange={(e) => setClient({ ...client, phone: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-500">जीएसटी (GSTIN)</label>
                <input
                  type="text"
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-mono uppercase"
                  placeholder="उदा. 27..."
                  value={client.gstNumber}
                  onChange={(e) => setClient({ ...client, gstNumber: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. INVOICE METADATA & FINANCIAL CONTROLS */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-850 flex items-center gap-1.5 uppercase tracking-wide border-b border-slate-150 pb-2">
            <Info className="w-4 h-4 text-emerald-500" /> बिल आणि कर तपशील (Invoice & Taxes)
          </h3>
          <div className="grid grid-cols-1 gap-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-500">बिल क्रमांक (Invoice No.)</label>
                <input
                  type="text"
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg font-mono font-semibold text-slate-750"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-500">दिनांक (Date)</label>
                <input
                  type="date"
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-705"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* GST rate selection */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-500">जीएसटी दर (GST Rate %)</label>
                <select
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-705"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                >
                  <option value={0}>0% (No tax)</option>
                  <option value={5}>5% GST</option>
                  <option value={12}>12% GST</option>
                  <option value={18}>18% GST (Standard)</option>
                  <option value={28}>28% GST</option>
                </select>
              </div>

              {/* Discount flat */}
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-500">सवलत (Flat Discount ₹)</label>
                <input
                  type="number"
                  min="0"
                  max={subtotal}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 font-mono"
                  placeholder="सवलत वजा करा"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-500">नियम व अटी / नोट्स (Notes & Terms)</label>
              <textarea
                rows={2}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-650"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="उदा. बँक ट्रान्स्फरद्वारे रक्कम पाठवणे..."
              />
            </div>

            {/* Auto status update */}
            <div className="flex items-center gap-2 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <input
                id="autoMarkBilled"
                type="checkbox"
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                checked={autoMarkAsBilled}
                onChange={(e) => setAutoMarkAsBilled(e.target.checked)}
              />
              <label htmlFor="autoMarkBilled" className="font-semibold text-slate-600 leading-none cursor-pointer">
                कामे 'बिल पूर्ण झाले' म्हणून सेट करा (Mark logs as Billed)
              </label>
            </div>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSaveInvoice}
            className="flex-1 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> सेव्ह करा (Save Bill Record)
          </button>
          
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 hover:shadow hover:scale-[1.01]"
          >
            <Printer className="w-4 h-4" /> प्रिंट / PDF काढा (Print / PDF)
          </button>
        </div>

      </div>

      {/* RIGHT PANEL: LIVE PDF PREVIEW (Full width on screen / centered and formatted) */}
      <div className="xl:col-span-7 w-full overflow-x-auto bg-slate-100/50 p-1 md:p-6 rounded-2xl border border-slate-100 print:bg-white print:border-none print:p-0 print:m-0 print:w-full flex justify-start md:justify-center">
        
        {/* Printable/Editable A4 document page */}
        <div 
          id="invoice-print-area"
          className="bg-white border border-slate-200 rounded-t-sm shadow-xl p-4 md:p-8 w-[680px] md:w-full md:max-w-[800px] shrink-0 min-h-[1050px] font-sans text-slate-800 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:min-h-0 flex flex-col justify-between"
        >
          <div>
            {/* 1. DOCUMENT SENDER HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 pb-5 border-b-2 border-slate-800">
              <div className="space-y-1">
                {/* Visual badge/seal details */}
                <div className="inline-flex items-center gap-1 bg-slate-850 text-slate-800 font-bold text-[10px] tracking-wide uppercase px-2 py-0.5 rounded border border-slate-700 mb-1">
                  <Award className="w-3 h-3 text-indigo-400" /> टॅक्स इन्व्हॉईस (Tax Invoice)
                </div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 font-sans">{company.name}</h1>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {company.address}
                </p>
                <div className="text-xs text-slate-500 font-mono space-y-0.5 pt-1">
                  {company.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {company.phone}</div>}
                  {company.gstNumber && <div className="text-slate-800 font-bold">GSTIN: {company.gstNumber}</div>}
                </div>
              </div>

              {/* Big Text "INVOICE" with numbers */}
              <div className="text-left sm:text-right space-y-1 min-w-[150px]">
                <h2 className="text-3xl font-extrabold uppercase tracking-wider text-slate-400 font-sans">बिल (Invoice)</h2>
                <div className="text-xs font-mono pt-1 text-slate-650 space-y-1">
                  <div>बिल क्र. (Invoice No): <strong className="text-slate-900 font-bold select-all">{invoiceNumber}</strong></div>
                  <div>दिनांक (Date): <strong>{invoiceDate}</strong></div>
                  <div>देय तारीख (Due Date): <strong>{invoiceDueDate}</strong></div>
                </div>
              </div>
            </div>

            {/* 2. CLIENT INFO STRIP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 border-b border-slate-100 text-xs">
              {/* Billing destination details */}
              <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold tracking-wide uppercase text-slate-400">ग्राहक (Billed To):</span>
                <h4 className="text-sm font-bold text-slate-900">{client.name}</h4>
                <p className="text-slate-600 font-sans flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {client.address}
                </p>
                <div className="font-mono text-slate-500 pt-0.5 space-y-0.5">
                  {client.phone && <div>📞 {client.phone}</div>}
                  {client.gstNumber && <div className="text-slate-700 font-semibold">GSTIN: {client.gstNumber}</div>}
                </div>
              </div>

              {/* Payment Info Overview */}
              <div className="space-y-1 p-4 rounded-xl border border-dotted border-slate-200">
                <span className="text-[10px] font-bold tracking-wide uppercase text-slate-400">पैसे पाठवण्याचा बँक तपशील (Payment Routing):</span>
                <h4 className="text-sm font-bold text-slate-850">{company.bankName}</h4>
                <div className="font-mono text-xs text-slate-600 space-y-1 pt-1">
                  <div>खाते क्र (A/C No): <strong className="text-slate-900 font-bold">{company.accountNumber}</strong></div>
                  <div>IFSC कोड (IFSC Code): <strong className="text-slate-900 font-bold">{company.ifscCode}</strong></div>
                  <div>खात्याचा प्रकार: <strong>Current Account</strong></div>
                </div>
              </div>
            </div>

            {/* 3. COMPILED TASK LOGS ATTACHMENT */}
            <div className="py-6">
              <div className="text-[10px] tracking-wider uppercase font-bold text-slate-400 mb-3.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" /> कामाचा सविस्तर तपशील (Detailed Log Records)
              </div>

              <table className="w-full text-left font-sans border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-800 text-[10px] uppercase font-bold tracking-wide text-slate-700 bg-slate-50">
                    <th className="py-2.5 px-2 text-center w-[6%]">Sr. No.</th>
                    <th className="py-2.5 px-2 w-[12%] font-sans">दिनांक (Date)</th>
                    <th className="py-2.5 px-2 w-[18%]">कामाचे ठिकाण (Where)</th>
                    <th className="py-2.5 px-2 w-[12%]">विभाग (Dept)</th>
                    <th className="py-2.5 px-3">Description (कामाचा सविस्तर तपशील)</th>
                    <th className="py-2.5 px-2 text-center w-[12%]">Quantity (संख्या)</th>
                    <th className="py-2.5 px-2 text-right w-[11%]">दर (Rate)</th>
                    <th className="py-2.5 px-2 text-right w-[15%]">एकूण (Amount)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {selectedLogs.map((log, index) => (
                    <tr key={log.id} className="align-top">
                      <td className="py-3 px-2 text-center font-mono font-semibold text-slate-400">{index + 1}</td>
                      <td className="py-3 px-2 font-mono text-slate-500 whitespace-nowrap">{log.date}</td>
                      <td className="py-3 px-2 font-medium break-words leading-tight">{log.address}</td>
                      <td className="py-3 px-2">
                        <span className="text-[10px] font-semibold bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200/50">
                          {log.department}
                        </span>
                      </td>
                      <td className="py-3 px-3 leading-relaxed whitespace-pre-line break-words font-sans text-slate-650">
                        {log.description}
                      </td>
                      <td className="py-3 px-2 text-center font-mono font-semibold text-slate-700 bg-slate-50/30">
                        {log.hours || 1}
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-slate-500">
                        ₹{(log.rate || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-2 text-right font-mono font-bold text-slate-800">
                        ₹{log.totalAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* 4. TOTALS ROW + BANK + SIGNATURES */}
          <div className="pt-4 border-t-2 border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              
              {/* Note / Terms terms left */}
              <div className="md:col-span-7 space-y-3">
                {notes && (
                  <div className="text-[10px] text-slate-400">
                    <div className="font-bold uppercase tracking-wider">विशेष नोंद (Notes):</div>
                    <p className="mt-0.5 leading-relaxed font-sans text-slate-500">{notes}</p>
                  </div>
                )}

                {company.terms && (
                  <div className="text-[10px] text-slate-400">
                    <div className="font-bold uppercase tracking-wider">नियम व अटी (Terms & Conditions):</div>
                    <p className="mt-0.5 whitespace-pre-line leading-loose font-sans font-medium text-slate-500">{company.terms}</p>
                  </div>
                )}
              </div>

              {/* Accounting details right */}
              <div className="md:col-span-5 bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs">
                {/* Subtotal */}
                <div className="flex items-center justify-between text-slate-500 font-mono">
                  <span>उपएकूण (Subtotal):</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {/* Discount */}
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-rose-600 font-mono">
                    <span>सवलत (Discount -):</span>
                    <span>₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Tax details (GST in India comprises SGST and CGST, split 50-50!) */}
                {taxRate > 0 && (
                  <div className="space-y-1 border-t border-slate-200/60 pt-1 text-[11px] text-slate-500">
                    <div className="flex items-center justify-between text-slate-500 font-mono">
                      <span>टॅक्स (CGST {taxRate / 2}%):</span>
                      <span>₹{(taxAmount / 2).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 font-mono">
                      <span>टॅक्स (SGST {taxRate / 2}%):</span>
                      <span>₹{(taxAmount / 2).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}

                {/* Grand Total */}
                <div className="flex items-center justify-between text-slate-900 border-t-2 border-slate-700/50 pt-2 font-bold text-sm md:text-base">
                  <span>एकूण देय रक्कम (Grand Total):</span>
                  <span className="font-mono text-indigo-600">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

            </div>

            {/* Bottom Footer block containing signee seals */}
            <div className="flex justify-between items-end mt-12 text-[10px] text-slate-500 font-sans">
              <div>
                <p className="italic">This is a system generated document based on custom logged work records.</p>
                <p className="font-bold mt-1 text-slate-650">© {new Date().getFullYear()} {company.name}</p>
              </div>

              {/* Authorised signatory seal frame */}
              <div className="text-right space-y-12 min-w-[150px] border-t border-slate-200 pt-1 mt-6">
                <p className="font-bold text-slate-700 uppercase tracking-wide">अधिकृत स्वाक्षरी (Authorised Signatory)</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
