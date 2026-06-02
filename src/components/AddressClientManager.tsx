import React, { useState } from 'react';
import { MapPin, User, Plus, Trash2, Database, AlertCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddressClientManagerProps {
  customAddresses: string[];
  customClients: string[];
  onAddAddress: (address: string) => void;
  onDeleteAddress: (address: string) => void;
  onAddClient: (client: string) => void;
  onDeleteClient: (client: string) => void;
}

export function AddressClientManager({
  customAddresses,
  customClients,
  onAddAddress,
  onDeleteAddress,
  onAddClient,
  onDeleteClient
}: AddressClientManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'addresses' | 'clients'>('addresses');
  const [newValue, setNewValue] = useState('');
  const [error, setError] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = newValue.trim();
    if (!trimmed) {
      setError('कृपया रिकामी जागा सोडू नका.');
      return;
    }

    if (activeSubTab === 'addresses') {
      if (customAddresses.includes(trimmed)) {
        setError('हा पत्ता डेटाबेसमध्ये आधीपासूनच उपलब्ध आहे!');
        return;
      }
      onAddAddress(trimmed);
    } else {
      if (customClients.includes(trimmed)) {
        setError('हा ग्राहक डेटाबेसमध्ये आधीपासूनच उपलब्ध आहे!');
        return;
      }
      onAddClient(trimmed);
    }

    setNewValue('');
  };

  const currentList = activeSubTab === 'addresses' ? customAddresses : customClients;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mt-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="p-1 px-1.5 bg-indigo-50 border border-indigo-100/50 text-indigo-600 rounded-lg">
          <Database className="w-4 h-4 stroke-[2.25]" />
        </div>
        <div>
          <h3 className="text-xs font-black text-slate-800 leading-tight uppercase tracking-wider">
            पत्ता व ग्राहक डेटाबेस व्यवस्थापक
          </h3>
          <span className="text-[10px] text-slate-400 font-bold block leading-none">
            Manage Saved Addresses & Clients
          </span>
        </div>
      </div>

      {/* Sub-tabs switcher */}
      <div className="grid grid-cols-2 gap-1.5 bg-slate-100/80 p-1 rounded-xl mb-3">
        <button
          type="button"
          onClick={() => {
            setActiveSubTab('addresses');
            setNewValue('');
            setError('');
          }}
          className={`py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeSubTab === 'addresses'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" /> कामाचे पत्ते ({customAddresses.length})
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveSubTab('clients');
            setNewValue('');
            setError('');
          }}
          className={`py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeSubTab === 'clients'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <User className="w-3.5 h-3.5" /> ग्राहकांची नावे ({customClients.length})
        </button>
      </div>

      {/* Form to Add New */}
      <form onSubmit={handleAdd} className="space-y-2 mb-3">
        <div className="flex gap-1.5">
          <input
            type="text"
            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 placeholder-slate-400 font-medium"
            placeholder={
              activeSubTab === 'addresses'
                ? "उदा. बाणेर रोड, बिल्डिंग ४ (Pune)"
                : "उदा. राजमुद्रा एंटरप्रायझेस (Rajmudra)"
            }
            value={newValue}
            onChange={(e) => {
              setNewValue(e.target.value);
              if (error) setError('');
            }}
          />
          <button
            type="submit"
            className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center cursor-pointer active:scale-95"
            title="डेटाबेसमध्ये नवीन जोडा"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
        
        {error && (
          <div className="flex items-center gap-1.5 text-[10px] text-rose-500 font-bold bg-rose-50 border border-rose-100 p-2 rounded-lg">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Explanatory Message */}
      <span className="text-[9px] text-slate-450 block italic mb-2.5 leading-tight">
        💡 येथे सेव्ह केलेले पत्ते आणि ग्राहक वर काम नोंदणी फॉर्मच्या ड्रॉपडाऊन (suggestions) मध्ये थेट दिसतील.
      </span>

      {/* Items list */}
      <div className="border border-slate-100 rounded-xl max-h-[160px] overflow-y-auto divide-y divide-slate-100 bg-slate-50/20">
        {currentList.length === 0 ? (
          <p className="text-center py-6 text-[11px] text-slate-400 font-bold">
            कोणतीही नोंद नाही. नवीन माहिती जोडा!
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {currentList.map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between p-2.5 hover:bg-slate-50 transition-all gap-2 group overflow-hidden"
              >
                <span className="text-[11px] text-slate-700 font-medium font-sans truncate leading-tight">
                  {item}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`आपण खात्रीने "${item}" डेटाबेसमधून काढून टाकू इच्छिता?`)) {
                      if (activeSubTab === 'addresses') {
                        onDeleteAddress(item);
                      } else {
                        onDeleteClient(item);
                      }
                    }
                  }}
                  className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-100 md:opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                  title="काढून टाका (Delete)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
