// src/components/admin/ContractModal.jsx
import React, { useState } from 'react';
import { X, FileText, ShieldCheck, Plus, Minus, AlertTriangle } from 'lucide-react';

const ContractModal = ({ isOpen, onClose, manga, onConfirm }) => {
  // Now these are fully dynamic states you control
  const [price, setPrice] = useState(1.99);
  const [authorSplit, setAuthorSplit] = useState(70);
  const [duration, setDuration] = useState(12);

  if (!isOpen) return null;

  // Helper to handle increment/decrement
  const adjust = (setter, val, step, min = 0) => {
    const newVal = parseFloat((val + step).toFixed(2));
    if (newVal >= min) setter(newVal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
      <div className="bg-[#161618] border border-gray-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-[#1e1e20]">
          <div className="flex items-center gap-2 text-red-600">
            <ShieldCheck size={20} />
            <h3 className="font-bold uppercase tracking-wider text-xs">Contract Configuration</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="p-8 space-y-8">
          {/* THE FORM: This is where you decide the power */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Price Control */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Set Price ($)</label>
              <div className="flex items-center bg-[#0f0f10] border border-gray-800 rounded-xl p-1">
                <button onClick={() => adjust(setPrice, price, -0.50, 0.50)} className="p-2 hover:bg-red-600/10 text-gray-400 hover:text-red-500 rounded-lg transition-all"><Minus size={14}/></button>
                <input 
                  type="number" 
                  value={price} 
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                  className="w-full bg-transparent text-center text-sm font-bold text-white outline-none"
                />
                <button onClick={() => adjust(setPrice, price, 0.50)} className="p-2 hover:bg-green-600/10 text-gray-400 hover:text-green-500 rounded-lg transition-all"><Plus size={14}/></button>
              </div>
            </div>

            {/* Split Control */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Author Split (%)</label>
              <div className="flex items-center bg-[#0f0f10] border border-gray-800 rounded-xl p-1">
                <button onClick={() => adjust(setAuthorSplit, authorSplit, -5, 0)} className="p-2 hover:bg-red-600/10 text-gray-400 hover:text-red-500 rounded-lg transition-all"><Minus size={14}/></button>
                <input 
                  type="number" 
                  value={authorSplit} 
                  onChange={(e) => setAuthorSplit(parseInt(e.target.value))}
                  className="w-full bg-transparent text-center text-sm font-bold text-white outline-none"
                />
                <button onClick={() => adjust(setAuthorSplit, authorSplit, 5, 0)} className="p-2 hover:bg-green-600/10 text-gray-400 hover:text-green-500 rounded-lg transition-all"><Plus size={14}/></button>
              </div>
            </div>

            {/* Duration Control */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest">Months</label>
              <div className="flex items-center bg-[#0f0f10] border border-gray-800 rounded-xl p-1">
                <button onClick={() => adjust(setDuration, duration, -1, 1)} className="p-2 hover:bg-red-600/10 text-gray-400 hover:text-red-500 rounded-lg transition-all"><Minus size={14}/></button>
                <input 
                  type="number" 
                  value={duration} 
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full bg-transparent text-center text-sm font-bold text-white outline-none"
                />
                <button onClick={() => adjust(setDuration, duration, 1)} className="p-2 hover:bg-green-600/10 text-gray-400 hover:text-green-500 rounded-lg transition-all"><Plus size={14}/></button>
              </div>
            </div>

          </div>

          {/* Real-time Preview: Changes as you click buttons above */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-transparent rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative p-6 bg-[#0f0f10] border border-gray-800 rounded-xl space-y-4 text-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-red-600"/>
                  <span className="text-white font-black uppercase text-[10px] tracking-tighter">Generated Agreement</span>
                </div>
                <span className="text-[10px] text-gray-600 font-mono">TL-CONTRACT-{manga.id}</span>
              </div>
              
              <div className="space-y-3 text-gray-400 leading-relaxed font-medium">
                <p>• {manga.series} will be sold at <span className="text-white">${price.toFixed(2)}</span>.</p>
                <p>• Revenue split is set to <span className="text-green-500 font-bold">{authorSplit}%</span> for the Creator.</p>
                <p>• Contract remains active for <span className="text-white underline">{duration} Months</span>.</p>
                <p>• ToonLord takes <span className="text-white">{(100 - authorSplit)}%</span> commission per sale.</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800/50 flex gap-3 items-start">
                <AlertTriangle size={16} className="text-red-600 shrink-0 mt-1" />
                <p className="text-[11px] text-gray-500 italic">Admin Notice: Finalizing this will notify {manga.creator} and update the series metadata across the platform.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-6 py-4 bg-[#1e1e20] border-t border-gray-800 flex justify-end gap-4">
          <button onClick={onClose} className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Discard</button>
          <button 
            onClick={() => onConfirm({ price, authorSplit, duration })}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20 hover:scale-[1.02]"
          >
            Deploy Contract
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractModal;