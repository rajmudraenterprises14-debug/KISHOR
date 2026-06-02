import React, { useState, useEffect } from 'react';
import { 
  X, Printer, ArrowLeft, Building, MapPin, Phone, 
  Trash2, Plus, Edit3, Settings2, RefreshCw, Eye, Check, AlertCircle, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkLog } from '../types';

interface ChallanItem {
  id: string;
  sNo: number;
  particulars: string;
  department: string;
  qty: string; // editable textual or numeric Qty (e.g., "1", "4 hrs", etc.)
}

interface ChallanGeneratorProps {
  selectedLogs: WorkLog[];
  onCancel: () => void;
}

const DEFAULT_COMPANY = {
  name: 'COMPUTRONICS',
  tagline: 'Computer Solutions',
  address: 'D/2, Mini Market, Sector 16, Vashi, Navi Mumbai',
  phone: '9867116968',
};

export function ChallanGenerator({ selectedLogs, onCancel }: ChallanGeneratorProps) {
  // Load Company profiles
  const [profiles, setProfiles] = useState<any[]>(() => {
    const saved = localStorage.getItem('rajmudra_company_profiles');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'rajmudra',
        name: 'राजमुद्रा एंटरप्रायझेस (Rajmudra Enterprises)',
        tagline: 'इलेक्ट्रिकल, मेकॅनिकल आणि वेल्डिंग वर्क्स',
        address: 'मुख्य मार्ग, पुणे, महाराष्ट्र (Main Road, Pune, MH)',
        phone: '+91 9876543210'
      },
      {
        id: 'computronics',
        name: 'COMPUTRONICS',
        tagline: 'Computer Solutions',
        address: 'D/2, Mini Market, Sector 16, Vashi, Navi Mumbai',
        phone: '9867116968'
      }
    ];
  });

  const [selectedProfileId, setSelectedProfileId] = useState<string>(() => {
    return localStorage.getItem('dc_selected_profile_id') || 'rajmudra';
  });

  // Saved active header configuration
  const [companyName, setCompanyName] = useState(() => {
    return localStorage.getItem('dc_company_name') || 'राजमुद्रा एंटरप्रायझेस (Rajmudra Enterprises)';
  });
  const [companyTagline, setCompanyTagline] = useState(() => {
    return localStorage.getItem('dc_company_tagline') || 'इलेक्ट्रिकल, मेकॅनिकल आणि वेल्डिंग वर्क्स';
  });
  const [companyAddress, setCompanyAddress] = useState(() => {
    return localStorage.getItem('dc_company_address') || 'मुख्य मार्ग, पुणे, महाराष्ट्र (Main Road, Pune, MH)';
  });
  const [companyPhone, setCompanyPhone] = useState(() => {
    return localStorage.getItem('dc_company_phone') || '+91 9876543210';
  });

  // Sync profile selection changes
  const handleSelectProfile = (profileId: string) => {
    setSelectedProfileId(profileId);
    localStorage.setItem('dc_selected_profile_id', profileId);
    if (profileId === 'custom') {
      return;
    }
    const found = profiles.find(p => p.id === profileId);
    if (found) {
      setCompanyName(found.name);
      setCompanyTagline(found.tagline);
      setCompanyAddress(found.address);
      setCompanyPhone(found.phone);
    }
  };

  // Client / Recipient Details
  const [clientTo, setClientTo] = useState(() => {
    const defaultRecipient = selectedLogs.find(l => l.clientName)?.clientName || '';
    const firstAddress = selectedLogs[0]?.address || '';
    let addressLabel = firstAddress;
    
    // Format recipient block beautifully
    return `To,\n${defaultRecipient}\n${addressLabel}`.trim();
  });

  // Challan metadata
  const [challanNo, setChallanNo] = useState(() => {
    const pad = (num: number, size: number) => {
      let s = num + "";
      while (s.length < size) s = "0" + s;
      return s;
    };
    const randomSuffix = pad(Math.floor(Math.random() * 999) + 1, 3);
    return `DC-${new Date().getFullYear()}-${randomSuffix}`;
  });
  
  const [challanDate, setChallanDate] = useState(() => {
    // Return dd/mm/yyyy style for traditional Indian delivery challans
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  });

  // State of the editable items rows in the Challan
  const [items, setItems] = useState<ChallanItem[]>([]);

  // Automatically load logs into challan items on initialization
  useEffect(() => {
    const mapped: ChallanItem[] = selectedLogs.map((log, index) => {
      const deptSuffix = log.department ? ` [विभाग: ${log.department}]` : '';
      return {
        id: log.id || `manual-${Date.now()}-${index}`,
        sNo: index + 1,
        particulars: `${log.description || ''}${deptSuffix}`,
        department: log.department || '',
        qty: String(log.hours || 1), // Default quantity from hours
      };
    });
    setItems(mapped);
  }, [selectedLogs]);

  // Recalculate S.No. whenever rows are deleted / moved
  const reindexItems = (currentItems: ChallanItem[]) => {
    return currentItems.map((item, idx) => ({
      ...item,
      sNo: idx + 1
    }));
  };

  // Add blank row manually
  const handleAddRow = () => {
    const newRow: ChallanItem = {
      id: `manual-${Date.now()}`,
      sNo: items.length + 1,
      particulars: '',
      department: '',
      qty: '1'
    };
    setItems([...items, newRow]);
  };

  // Delete specific row on the fly
  const handleDeleteRow = (id: string) => {
    const filtered = items.filter(item => item.id !== id);
    setItems(reindexItems(filtered));
  };

  // Update specific item cell
  const handleUpdateField = (id: string, field: keyof ChallanItem, value: string) => {
    const updated = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          [field]: value
        };
      }
      return item;
    });
    setItems(updated);
  };

  // Reset to default settings
  const handleResetSettings = () => {
    if (window.confirm("डिफॉल्ट 'राजमुद्रा एंटरप्रायझेस' माहितीवर रिसेट करायचे आहे का?")) {
      setCompanyName('राजमुद्रा एंटरप्रायझेस (Rajmudra Enterprises)');
      setCompanyTagline('इलेक्ट्रिकल, मेकॅनिकल आणि वेल्डिंग वर्क्स');
      setCompanyAddress('मुख्य मार्ग, पुणे, महाराष्ट्र (Main Road, Pune, MH)');
      setCompanyPhone('+91 9876543210');
      setSelectedProfileId('rajmudra');
      
      localStorage.setItem('dc_company_name', 'राजमुद्रा एंटरप्रायझेस (Rajmudra Enterprises)');
      localStorage.setItem('dc_company_tagline', 'इलेक्ट्रिकल, मेकॅनिकल आणि वेल्डिंग वर्क्स');
      localStorage.setItem('dc_company_address', 'मुख्य मार्ग, पुणे, महाराष्ट्र (Main Road, Pune, MH)');
      localStorage.setItem('dc_company_phone', '+91 9876543210');
      localStorage.setItem('dc_selected_profile_id', 'rajmudra');
    }
  };

  // Save changes under profile list so users can switch any company name & address anytime
  const handleSaveSettings = () => {
    const updatedProfiles = [...profiles];
    const existingIdx = updatedProfiles.findIndex(p => p.id === selectedProfileId);
    
    // Create new profile ID if 'custom'
    const profileIdToUse = selectedProfileId === 'custom' ? `profile-${Date.now()}` : selectedProfileId;
    
    const newProfile = {
      id: profileIdToUse,
      name: companyName,
      tagline: companyTagline,
      address: companyAddress,
      phone: companyPhone
    };

    if (existingIdx > -1 && selectedProfileId !== 'custom') {
      updatedProfiles[existingIdx] = newProfile;
    } else {
      updatedProfiles.push(newProfile);
      setSelectedProfileId(profileIdToUse);
    }

    setProfiles(updatedProfiles);
    localStorage.setItem('rajmudra_company_profiles', JSON.stringify(updatedProfiles));
    localStorage.setItem('dc_selected_profile_id', profileIdToUse);

    // Save legacy keys likewise
    localStorage.setItem('dc_company_name', companyName);
    localStorage.setItem('dc_company_tagline', companyTagline);
    localStorage.setItem('dc_company_address', companyAddress);
    localStorage.setItem('dc_company_phone', companyPhone);
    
    alert('पत्ता आणि कंपनीची माहिती प्रोफाईलमध्ये सेव्ह झाली आहे! (Company & address profile saved successfully!)');
  };

  // Add completely new blank profile
  const handleAddNewProfile = () => {
    const namePrompt = window.prompt("नवीन कंपनीचे नाव लिहा (Enter New Company Name):");
    if (!namePrompt) return;
    
    const newProfile = {
      id: `profile-${Date.now()}`,
      name: namePrompt,
      tagline: 'Services Provider',
      address: 'पत्ता प्रविष्ट करा (Enter Address)',
      phone: '+91 99999 99999'
    };

    const updated = [...profiles, newProfile];
    setProfiles(updated);
    localStorage.setItem('rajmudra_company_profiles', JSON.stringify(updated));
    
    // Select the new profile
    setSelectedProfileId(newProfile.id);
    setCompanyName(newProfile.name);
    setCompanyTagline(newProfile.tagline);
    setCompanyAddress(newProfile.address);
    setCompanyPhone(newProfile.phone);
    alert(`नवीन प्रोफाईल "${namePrompt}" तयार झाले आहे!`);
  };

  // Delete profile on demand
  const handleDeleteProfile = (profileId: string) => {
    if (profiles.length <= 1) {
      alert("किमान एक प्रोफाईल असणे गरजेचे आहे!");
      return;
    }
    if (window.confirm("हे प्रोफाईल डिलीट करायचे आहे का?")) {
      const filtered = profiles.filter(p => p.id !== profileId);
      setProfiles(filtered);
      localStorage.setItem('rajmudra_company_profiles', JSON.stringify(filtered));
      
      // Fallback selection to first profile
      const first = filtered[0];
      setSelectedProfileId(first.id);
      setCompanyName(first.name);
      setCompanyTagline(first.tagline);
      setCompanyAddress(first.address);
      setCompanyPhone(first.phone);
    }
  };

  // Trigger A4 Print Page
  const handlePrint = () => {
    window.print();
  };

  // Calculate sum of quantities if they are numeric
  const totalQtyText = () => {
    const totalNum = items.reduce((sum, item) => {
      const parsed = parseFloat(item.qty);
      return sum + (isNaN(parsed) ? 0 : parsed);
    }, 0);
    return totalNum > 0 ? String(totalNum) : '';
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 print:block">
      
      {/* 1. LEFT PANEL: CONTROLS & MANUAL FORM EDITS (Hidden during print) */}
      <div className="xl:col-span-5 space-y-5 print:hidden">
        
        {/* Navigation & Title */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onCancel}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition cursor-pointer"
            title="परत जा (Go back)"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-1.5 uppercase">
              <span>डिलिव्हरी चलान बनवणारा</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full">A4 Size</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Edit, customize and print A4 Delivery Challan professionally</p>
          </div>
        </div>

        {/* Dynamic Warning Helper */}
        <div className="bg-amber-50/60 border border-amber-200/50 rounded-2xl p-4 text-xs text-amber-850 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>manually बदल कसा करायचा?</span>
          </div>
          <p className="leading-relaxed text-slate-600">
            उजवीकडे दिसणाऱ्या <strong>Delivery Challan</strong> मधील कोणत्याही कॉलमवर (दिनांक, डिस्क्रिप्शन, विभाग किंवा मात्रा) थेट क्लिक करून आपण तिथली माहिती दुरुस्त करू शकता! तसेच गरजेनुसार खालील फॉर्म वापरून हेडरची माहिती सेव्ह करा.
          </p>
        </div>

        {/* 1a. SENDER COMPANY HEADER EDITORS */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-light-100">
            <h3 className="text-xs font-bold text-slate-850 flex items-center gap-1.5 uppercase tracking-wide">
              <Settings2 className="w-4 h-4 text-indigo-500" /> हेडर व कंपनी डिटेल्स (Header Settings)
            </h3>
            <button
              type="button"
              onClick={handleResetSettings}
              className="text-[10px] text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition font-bold"
              title="डिफॉल्ट माहितीवर रिसेट करा"
            >
              <RefreshCw className="w-3 h-3" /> रिसेट करा
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 text-xs">
            {/* Active Profile Selector Dropdown */}
            <div className="flex flex-col gap-1.5 pb-2 border-b border-slate-100">
              <label className="font-bold text-slate-600 flex items-center justify-between">
                <span>कंपनी प्रोफाइल निवडा (Active Profile)</span>
                <button
                  type="button"
                  onClick={handleAddNewProfile}
                  className="text-[10px] text-indigo-650 hover:underline flex items-center gap-0.5 font-black uppercase"
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" /> नवीन कंपनी जोडा
                </button>
              </label>
              <div className="flex gap-1.5">
                <select
                  className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-bold"
                  value={selectedProfileId}
                  onChange={(e) => handleSelectProfile(e.target.value)}
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>
                      📁 {p.name}
                    </option>
                  ))}
                  <option value="custom">✍️ नवीन कस्टम प्रोफाइल बनवा (Custom / Direct Type)</option>
                </select>
                {selectedProfileId !== 'rajmudra' && selectedProfileId !== 'custom' && (
                  <button
                    type="button"
                    onClick={() => handleDeleteProfile(selectedProfileId)}
                    className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-100 transition text-[10px] font-bold"
                    title="प्रॉफाईल डिलीट करा"
                  >
                    हटवा
                  </button>
                )}
              </div>
            </div>

            {/* Company Name */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-500">कंपनीचे नाव (Header Title)</label>
              <input
                type="text"
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 text-slate-800 font-bold tracking-tight uppercase"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  if (selectedProfileId !== 'custom') setSelectedProfileId('custom');
                }}
                placeholder="उदा. COMPUTRONICS"
              />
            </div>

            {/* Tagline / Subtitle */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-500">उपशीर्षक (Header Tagline)</label>
              <input
                type="text"
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 text-slate-700"
                value={companyTagline}
                onChange={(e) => {
                  setCompanyTagline(e.target.value);
                  if (selectedProfileId !== 'custom') setSelectedProfileId('custom');
                }}
                placeholder="उदा. Computer Solutions"
              />
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-500">पत्ता (Header Address)</label>
              <textarea
                rows={2}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 text-slate-700 resize-none text-xs"
                value={companyAddress}
                onChange={(e) => {
                  setCompanyAddress(e.target.value);
                  if (selectedProfileId !== 'custom') setSelectedProfileId('custom');
                }}
                placeholder="पत्ता टाका"
              />
            </div>

            {/* Mobile */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-500">मोबाईल नंबर (Mobile No.)</label>
              <input
                type="text"
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 text-slate-700 font-mono"
                value={companyPhone}
                onChange={(e) => {
                  setCompanyPhone(e.target.value);
                  if (selectedProfileId !== 'custom') setSelectedProfileId('custom');
                }}
                placeholder="मोबाईल"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveSettings}
              className="mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white border text-xs font-bold rounded-xl transition cursor-pointer"
            >
              या कंपनीचे प्रोफाइल सेव्ह करा (Save active Profile details)
            </button>
          </div>
        </div>

        {/* 1b. RECIPIENT INFORMATION */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-850 flex items-center gap-1.5 uppercase tracking-wide border-b pb-2">
            <Building className="w-4 h-4 text-emerald-500" /> ग्राहकाचा संदर्भ पत्ता (To Recipient Info)
          </h3>
          <div className="flex flex-col gap-1.5">
            <textarea
              rows={4}
              className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-100 text-xs text-slate-800 font-medium font-sans leading-relaxed whitespace-pre-wrap"
              placeholder="To,"
              value={clientTo}
              onChange={(e) => setClientTo(e.target.value)}
            />
            <span className="text-[10px] text-slate-400 block font-bold leading-tight">
              💡 हे वाक्य उजव्या बाजूच्या "To," बॉक्स मध्ये जसेच्या तसे बदलत राहील.
            </span>
          </div>
        </div>

        {/* 1c. ACTIONS */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white rounded-xl text-sm font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            प्रिंट / PDF काढा (Print Delivery Challan)
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-650 border border-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            मागे जा (Cancel Builder)
          </button>
        </div>

      </div>

      {/* 2. RIGHT PANEL: DETAILED LIVE EDITABLE A4 VIEW */}
      {/* Matches exactly physical A4 page (width approx 800px) */}
      <div className="xl:col-span-7 w-full overflow-x-auto bg-slate-100/50 p-1 md:p-6 rounded-2xl border border-slate-200/60 print:bg-white print:border-none print:p-0 print:m-0 print:w-full flex justify-start md:justify-center">
        
        {/* Printable/Editable A4 document page */}
        <div 
          id="challan-print-area"
          className="bg-white border-2 border-slate-350 rounded-sm shadow-xl p-4 md:p-8 w-[680px] md:w-full md:max-w-[760px] shrink-0 min-h-[960px] font-sans text-slate-900 print:shadow-none print:border-none print:p-0 print:m-0 print:w-full select-text relative flex flex-col justify-between"
        >
          {/* Custom style injection inside print-area so standard tables match exact screenshot colors */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden;
              }
              #challan-print-area, #challan-print-area * {
                visibility: visible;
              }
              #challan-print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100% !important;
                max-width: 100% !important;
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}} />

          <div>
            {/* Top Outer Border Block representing the standard vintage style block bill */}
            <div className="border-4 border-slate-950 p-1 w-full flex flex-col mb-4">
              
              {/* Core header labels */}
              <div className="text-center font-sans tracking-wide">
                <span className="text-[13px] md:text-sm font-black uppercase border-b-2 border-slate-950 px-6 py-0.5 inline-block text-slate-900 tracking-widest leading-none">
                  DELIVERY CHALLAN
                </span>
              </div>

              {/* Company Title */}
              <div className="text-center mt-3">
                <input
                  type="text"
                  className="w-full text-center bg-transparent border-none font-display font-black text-2xl md:text-3xl text-slate-950 leading-none tracking-wider uppercase focus:outline-dotted focus:ring-1 focus:ring-indigo-300 py-1"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="DELIVERY TITLE"
                  style={{ fontFamily: 'Georgia, serif' }}
                />
              </div>

              {/* Tagline / Sub-heading */}
              <div className="text-center">
                <input
                  type="text"
                  className="w-full text-center bg-transparent border-none font-sans font-bold text-xs md:text-sm text-slate-700 italic focus:outline-dotted focus:ring-1 focus:ring-indigo-300"
                  value={companyTagline}
                  onChange={(e) => setCompanyTagline(e.target.value)}
                  placeholder="Solutions Description"
                />
              </div>

              {/* Address detail subline */}
              <div className="text-center mt-1 border-t border-slate-950 pt-1">
                <input
                  type="text"
                  className="w-full text-center bg-transparent border-none font-sans text-[11px] md:text-xs text-slate-800 font-medium focus:outline-dotted focus:ring-1 focus:ring-indigo-300"
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="Store Locations"
                />
              </div>

              {/* Phone Line alignment */}
              <div className="text-right pr-2 pb-0.5 text-[10px] md:text-xs font-mono font-bold text-slate-800 border-t border-slate-100 pt-0.5 mt-0.5 flex items-center justify-end gap-1">
                <span>Mob. No.</span>
                <input
                  type="text"
                  className="w-[120px] bg-transparent border-none focus:outline-dotted focus:ring-1 focus:ring-indigo-300 font-bold p-0 text-right text-[11px]"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="Mobile"
                />
              </div>

            </div>

            {/* Split Grid for 'To' and 'Challan Meta Details' mirroring Computronics screenshot layout */}
            <div className="w-full grid grid-cols-12 border-2 border-slate-950 mb-3 text-slate-950 font-sans">
              
              {/* To: address section on the left */}
              <div className="col-span-8 border-r-2 border-slate-950 p-2 text-xs flex flex-col justify-start">
                <textarea
                  className="w-full bg-transparent border-none resize-none focus:outline-dotted focus:ring-1 focus:ring-indigo-300 font-sans font-bold text-slate-900 leading-relaxed text-xs focus:bg-indigo-50/50 min-h-[70px]"
                  value={clientTo}
                  onChange={(e) => setClientTo(e.target.value)}
                  placeholder="To, Customer address details"
                  rows={4}
                />
              </div>

              {/* Meta details columns on the right */}
              <div className="col-span-4 flex flex-col text-xs divide-y-2 divide-slate-950">
                
                {/* 1. Delivery Challan Number */}
                <div className="p-1 flex flex-col min-h-[48px]">
                  <span className="text-[9px] uppercase tracking-wide font-black text-slate-600 block pl-1">
                    Delivery Ch. No
                  </span>
                  <input
                    type="text"
                    className="w-full bg-transparent border-none focus:outline-dotted focus:ring-1 focus:ring-indigo-300 font-mono font-black text-slate-950 uppercase pl-1 pt-0.5 select-all text-[11px]"
                    value={challanNo}
                    onChange={(e) => setChallanNo(e.target.value)}
                    placeholder="CHALLAN NO"
                  />
                </div>

                {/* 2. Date */}
                <div className="p-1 flex flex-col min-h-[48px]">
                  <span className="text-[9px] uppercase tracking-wide font-black text-slate-600 block pl-1">
                    Date
                  </span>
                  <input
                    type="text"
                    className="w-full bg-transparent border-none focus:outline-dotted focus:ring-1 focus:ring-indigo-300 font-mono font-bold text-slate-950 pl-1 pt-0.5 text-[11px]"
                    value={challanDate}
                    onChange={(e) => setChallanDate(e.target.value)}
                    placeholder="DATE"
                  />
                </div>

              </div>
              
            </div>

            {/* Main Delivery Items Grid Table */}
            <div className="border-2 border-slate-950 font-sans text-slate-950 overflow-hidden w-full relative">
              <table className="w-full text-left font-sans border-collapse">
                
                {/* Headings */}
                <thead>
                  <tr className="border-b-2 border-slate-950 bg-slate-100/50 text-[11px] md:text-xs font-black text-slate-950 uppercase select-none divide-x-2 divide-slate-950">
                    <th className="py-2.5 px-2 text-center w-[12%]">Sr. No.</th>
                    <th className="py-2.5 px-3 w-[73%]">Description (कामाचा सविस्तर तपशील)</th>
                    <th className="py-2.5 px-2 text-center w-[15%]">Quantity (संख्या)</th>
                  </tr>
                </thead>

                {/* Body Rows */}
                <tbody className="divide-y-2 divide-slate-950 text-xs font-bold">
                  {items.map((item) => (
                    <tr key={item.id} className="divide-x-2 divide-slate-950 align-top group hover:bg-slate-50 transition-colors">
                      {/* S.No. block with custom hover delete */}
                      <td className="py-3 px-1 text-center font-mono text-slate-700 relative">
                        {item.sNo}
                        {/* Hover option to delete line on the fly */}
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(item.id)}
                          className="no-print opacity-0 group-hover:opacity-100 absolute -left-1.5 top-2 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-md shadow-sm transition-all cursor-pointer z-10"
                          title="ही ओळ डिलीट करा"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>

                      {/* Description (Editable inline) */}
                      <td className="py-2 px-2.5 text-left leading-relaxed">
                        <textarea
                          rows={2}
                          className="w-full bg-transparent border-none font-sans font-medium text-xs text-slate-800 focus:outline-dotted focus:ring-1 focus:ring-indigo-300 resize-none leading-relaxed p-1 focus:bg-indigo-50/50"
                          value={item.particulars}
                          onChange={(e) => handleUpdateField(item.id, 'particulars', e.target.value)}
                          placeholder="कामाचा सविस्तर तपशील प्रविष्ट करा..."
                        />
                      </td>

                      {/* Qty (Editable inline) */}
                      <td className="py-2 px-1 text-center font-mono text-slate-900">
                        <input
                          type="text"
                          className="w-full bg-transparent border-none text-center font-mono font-bold text-xs text-slate-900 focus:outline-dotted focus:ring-1 focus:ring-indigo-300 p-1 focus:bg-indigo-50/50"
                          value={item.qty}
                          onChange={(e) => handleUpdateField(item.id, 'qty', e.target.value)}
                          placeholder="संख्या/तास प्रविष्ट करा"
                        />
                      </td>
                    </tr>
                  ))}

                  {/* Empty Spacer Rows keeping minimum invoice standard size height filled up */}
                  {items.length < 9 && Array.from({ length: 9 - items.length }).map((_, spacerIdx) => (
                    <tr key={`spacer-${spacerIdx}`} className="divide-x-2 divide-slate-950 select-none no-print">
                      <td className="py-5 text-center"></td>
                      <td className="py-5"></td>
                      <td className="py-5"></td>
                    </tr>
                  ))}

                  {/* Total and Footer Summary row of table */}
                  <tr className="border-t-2 border-slate-950 divide-x-2 divide-slate-950 bg-slate-50/70 font-black">
                    <td className="py-2 px-2 text-center text-[10px] uppercase">TOTAL</td>
                    <td className="py-2 px-3 text-slate-400 text-[10px] font-normal leading-tight font-sans italic">
                      Disclaimer: Delivery challan of work completed. No monetary value is attached in transfer list.
                    </td>
                    <td className="py-2 px-1 text-center font-mono text-xs text-slate-950">
                      Total Quantity: {totalQtyText() || '-'}
                    </td>
                  </tr>
                </tbody>

              </table>
            </div>

            {/* Table Dynamic Add Row control (Hidden during print) */}
            <div className="no-print mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleAddRow}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> नवीन काम जोडा (Add Extra Row)
              </button>
              <span className="text-[10px] text-slate-400 font-bold italic">
                * उजवीकडील तक्त्यामध्ये रोच्या उजव्या वर कोपऱ्यात Hover करून डिलीट करू शकता!
              </span>
            </div>

          </div>

          {/* Bottom Footer Blocks: Signatures */}
          <div className="pt-10 flex items-end justify-between text-slate-950 text-xs font-sans">
            <div className="text-left leading-tight text-slate-400 text-[10px]">
              <p>Generated via RAJMUDRA Software Workspace</p>
              <p>System verified copies.</p>
            </div>

            {/* Authorised signature stamp block */}
            <div className="text-center w-[190px] border-2 border-slate-950 p-2.5 pb-2 font-black uppercase text-[10px] bg-slate-50">
              <div className="mb-14 text-slate-400 font-normal italic select-none">
                Stamp & Sign
              </div>
              <div className="border-t border-slate-950 pt-1 tracking-wider">
                AUTHORISED SIGN
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
