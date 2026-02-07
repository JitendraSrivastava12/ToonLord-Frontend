import React, { useState } from 'react';
import { 
  Search, ChevronRight, ChevronDown, 
  User, Mail, FileText, Calendar, CheckCircle, XCircle, 
  Star, TrendingUp, X, Plus, Minus,
  Gavel, Sparkles, Trash2, ScrollText, Filter
} from 'lucide-react';

// --- Dummy Data (Same as provided) ---
const DUMMY_MANGA_REQUESTS = [
  { 
    id: "REQ-992", 
    series: "Shadow Leveling", 
    creator: "Kenji Tanaka", 
    email: "kenji@toonlord.com",
    chapters: 120, 
    views: "1.2M",
    rating: 4.9,
    status: "Pending",
    date: "2026-02-06",
    description: "A world-renowned series about a hunter who levels up in a world of monsters. Seeking premium status for exclusive chapter releases.",
    image: "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=400&h=560&fit=crop" 
  },
  { 
    id: "REQ-990", 
    series: "Dark Kingdom", 
    creator: "Solo_Lord", 
    email: "lord@darkness.com",
    chapters: 12, 
    views: "45K",
    rating: 4.2,
    status: "Pending",
    date: "2026-02-05",
    description: "A dark fantasy exploring the depths of a fallen kingdom. High engagement rates despite the low chapter count.",
    image: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=400&h=560&fit=crop"
  }
];

const ContractModal = ({ isOpen, onClose, manga, onConfirm }) => {
  const [price, setPrice] = useState(1.99);
  const [authorSplit, setAuthorSplit] = useState(70);
  const [duration, setDuration] = useState(12);
  const [newClause, setNewClause] = useState("");
  const [customClauses, setCustomClauses] = useState([
    "Author maintains full creative control and IP rights.",
    "Platform holds exclusive digital distribution rights during the period.",
    "Either party may terminate with 30 days written notice."
  ]);

  if (!isOpen) return null;

  const adjust = (setter, val, step, min = 0) => {
    const newVal = parseFloat((val + step).toFixed(2));
    if (newVal >= min) setter(newVal);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-6 bg-gray-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-6xl h-full md:h-[90vh] md:rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-gray-200">
        
        {/* Mobile Header (Sticky) */}
        <div className="md:hidden p-4 border-b bg-white flex justify-between items-center">
          <h3 className="font-bold">Contract Editor</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
        </div>

        {/* Left Side: Configurator */}
        <div className="w-full md:w-[380px] lg:w-[420px] bg-gray-50 flex flex-col border-r border-gray-200 overflow-y-auto">
          <div className="p-6 lg:p-8 border-b border-gray-200 bg-white hidden md:block">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Gavel className="text-blue-600" size={20} /></div>
              <div>
                <h3 className="text-gray-900 font-black text-lg">Terms Editor</h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Config Parameters</p>
              </div>
            </div>
          </div>

          <div className="p-6 lg:p-8 space-y-8 pb-32 md:pb-8">
            <div className="grid grid-cols-1 gap-6">
              {[
                { label: "Retail Price", val: price, set: setPrice, step: 0.50, unit: "$", icon: <Sparkles size={14}/> },
                { label: "Creator Split", val: authorSplit, set: setAuthorSplit, step: 5, unit: "%", icon: <TrendingUp size={14}/> },
                { label: "Duration", val: duration, set: setDuration, step: 1, unit: " Months", icon: <Calendar size={14}/> }
              ].map((ctrl, i) => (
                <div key={i} className="space-y-2">
                  <label className="text-[10px] text-gray-400 font-black uppercase tracking-[0.15em] flex items-center gap-2">
                    {ctrl.icon} {ctrl.label}
                  </label>
                  <div className="flex items-center bg-white rounded-xl border-2 border-gray-100 p-1 shadow-sm focus-within:border-blue-500 transition-all">
                    <button onClick={() => adjust(ctrl.set, ctrl.val, -ctrl.step)} className="p-3 text-gray-400 hover:text-blue-600"><Minus size={18}/></button>
                    <div className="flex-1 text-center font-black text-gray-900">
                      {ctrl.unit === '$' ? `$${ctrl.val.toFixed(2)}` : `${ctrl.val}${ctrl.unit}`}
                    </div>
                    <button onClick={() => adjust(ctrl.set, ctrl.val, ctrl.step)} className="p-3 text-gray-400 hover:text-blue-600"><Plus size={18}/></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-gray-200">
              <label className="text-[10px] text-gray-400 font-black uppercase tracking-[0.15em]">Covenants</label>
              <div className="relative">
                <textarea 
                  value={newClause}
                  onChange={(e) => setNewClause(e.target.value)}
                  placeholder="Custom legal requirement..."
                  className="w-full bg-white border-2 border-gray-100 rounded-xl p-4 text-sm focus:border-blue-500 outline-none min-h-[100px] resize-none"
                />
                <button 
                  onClick={() => { if(newClause) { setCustomClauses([...customClauses, newClause]); setNewClause(""); }}}
                  className="absolute bottom-3 right-3 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 shadow-lg"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Document Preview */}
        <div className="flex-1 bg-white p-6 md:p-12 overflow-y-auto flex flex-col relative bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]">
          {/* Desktop Close Button */}
          <button onClick={onClose} className="hidden md:block absolute top-8 right-8 p-2 hover:bg-gray-100 rounded-full text-gray-400"><X size={24} /></button>
          
          <div className="max-w-2xl mx-auto w-full flex-1">
            <div className="h-1 w-12 bg-blue-600 mb-6"></div>
            <h2 className="text-gray-900 text-2xl md:text-3xl font-serif font-bold mb-8">Partnership Agreement</h2>
            
            <div className="prose prose-sm text-gray-700 space-y-6 md:space-y-8">
              <p className="leading-relaxed border-l-4 border-gray-100 pl-4 md:pl-6 italic text-gray-500">
                Agreement between <span className="text-gray-900 font-bold">ToonLord</span> and <span className="text-gray-900 font-bold">{manga.creator}</span> for <span className="text-blue-600 font-bold">"{manga.series}"</span>.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <span className="text-[10px] font-mono text-blue-500 font-black mt-1">S.01</span>
                  <p className="text-sm">Retail: <span className="font-bold">${price.toFixed(2)}</span>. Split: <span className="font-bold text-green-600">{authorSplit}% Creator</span>.</p>
                </div>

                {customClauses.map((clause, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <span className="text-[10px] font-mono text-blue-500 font-black mt-1">S.0{idx + 2}</span>
                    <p className="text-sm flex-1">{clause}</p>
                    <button onClick={() => setCustomClauses(customClauses.filter((_, i) => i !== idx))} className="opacity-0 group-hover:opacity-100 text-red-400"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Signature Block */}
            <div className="mt-12 md:mt-20 pt-10 border-t-2 border-dashed border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="border-b border-gray-300 pb-2">
                <p className="text-[10px] text-gray-400 font-black uppercase mb-6">Platform</p>
                <p className="font-serif italic text-lg text-gray-400">J. Srivastava</p>
              </div>
              <div className="border-b border-gray-300 pb-2">
                <p className="text-[10px] text-gray-400 font-black uppercase mb-6">Creator</p>
                <p className="font-serif italic text-lg text-blue-200">Pending</p>
              </div>
            </div>
          </div>

          {/* Action Button (Sticky for mobile) */}
          <div className="mt-12 md:static sticky bottom-0 left-0 w-full bg-white/80 backdrop-blur-sm md:bg-transparent pb-4 md:pb-0">
            <button 
              onClick={() => onConfirm({ price, authorSplit, duration })}
              className="w-full bg-gray-900 hover:bg-blue-600 text-white font-black py-4 md:py-5 rounded-xl shadow-xl transition-all flex items-center justify-center gap-3"
            >
              Execute Contract <ScrollText size={18}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MangaPremiumRequests = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [currentManga, setCurrentManga] = useState(null);

  const filteredRequests = DUMMY_MANGA_REQUESTS.filter(req => {
    const matchesTab = activeTab === 'all' ? true : req.status === 'Pending';
    return matchesTab && req.series.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-4 bg-[#F9FAFB] min-h-screen font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Premium Intake</h2>
            <p className="text-gray-500 text-sm">Review creator monetization requests</p>
          </div>
          <div className="w-full lg:w-auto flex gap-2">
            <div className="relative flex-1 lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" placeholder="Search series..." 
                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-blue-500/10 transition-all"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl lg:hidden text-gray-500"><Filter size={20}/></button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-100">
          {['pending', 'all'].map((tab) => (
            <button
              key={tab} onClick={() => { setActiveTab(tab); setExpandedId(null); }}
              className={`pb-4 text-xs font-black uppercase tracking-widest relative transition-colors ${activeTab === tab ? 'text-blue-600' : 'text-gray-400'}`}
            >
              {tab} Requests
              {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* Desktop Table - Hidden on Mobile */}
        <div className="hidden md:block bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Series Info</th>
                <th className="px-6 py-4">Creator</th>
                <th className="px-6 py-4">Chapters</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRequests.map((req) => (
                <React.Fragment key={req.id}>
                  <tr className={`hover:bg-gray-50/50 transition-colors ${expandedId === req.id ? 'bg-blue-50/30' : ''}`}>
                    <td className="px-6 py-4 flex items-center gap-4">
                      <img src={req.image} alt="" className="w-10 h-14 object-cover rounded-lg shadow-sm" />
                      <div>
                        <p className="text-sm font-black text-gray-900 leading-tight">{req.series}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-1">{req.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-700">{req.creator}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{req.chapters} CH</td>
                    <td className="px-6 py-4">
                      <span className="text-[9px] font-black px-2 py-1 rounded-md border uppercase bg-yellow-50 text-yellow-700 border-yellow-100">{req.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                        className={`text-xs font-black px-4 py-2 rounded-xl transition-all border ${expandedId === req.id ? 'bg-gray-900 text-white' : 'text-blue-600 border-blue-100 hover:bg-blue-50'}`}
                      >
                        {expandedId === req.id ? 'Close' : 'Review'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === req.id && (
                    <tr>
                      <td colSpan="5" className="p-6 bg-gray-50/30">
                        <RequestDetailCard req={req} onApprove={() => { setCurrentManga(req); setIsContractOpen(true); }} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List View - Hidden on Desktop */}
        <div className="md:hidden space-y-4">
          {filteredRequests.map((req) => (
            <div key={req.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <div className="flex gap-4 mb-4">
                <img src={req.image} alt="" className="w-16 h-20 object-cover rounded-xl" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-gray-900 leading-tight">{req.series}</h4>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-yellow-50 text-yellow-600 uppercase">{req.status}</span>
                  </div>
                  <p className="text-xs font-bold text-gray-500 mt-1">{req.creator}</p>
                  <p className="text-[10px] font-black text-blue-600 mt-2 uppercase tracking-tighter">{req.chapters} Chapters Total</p>
                </div>
              </div>
              <button 
                onClick={() => { setCurrentManga(req); setIsContractOpen(true); }}
                className="w-full bg-blue-600 text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-blue-100"
              >
                Review Application
              </button>
            </div>
          ))}
        </div>

        {isContractOpen && <ContractModal isOpen={isContractOpen} onClose={() => setIsContractOpen(false)} manga={currentManga} onConfirm={(d) => setIsContractOpen(false)} />}
      </div>
    </div>
  );
};

const RequestDetailCard = ({ req, onApprove }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-xl">
    <div className="flex flex-col lg:flex-row gap-8">
      <img src={req.image} alt="" className="hidden lg:block w-48 h-64 object-cover rounded-2xl shadow-lg" />
      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Views", val: req.views, icon: <TrendingUp size={12}/>, color: "text-green-600 bg-green-50" },
            { label: "Rating", val: req.rating, icon: <Star size={12} fill="currentColor"/>, color: "text-yellow-600 bg-yellow-50" },
            { label: "Date", val: req.date, icon: <Calendar size={12}/>, color: "text-gray-600 bg-gray-50" },
            { label: "Series ID", val: req.id, icon: <FileText size={12}/>, color: "text-blue-600 bg-blue-50" }
          ].map((stat, i) => (
            <div key={i} className={`p-3 rounded-xl border border-transparent ${stat.color}`}>
              <p className="text-[9px] uppercase font-black opacity-60 mb-1 flex items-center gap-1">{stat.icon} {stat.label}</p>
              <p className="text-sm font-black">{stat.val}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Abstract</p>
          <p className="text-gray-600 text-sm leading-relaxed font-medium">{req.description}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-50">
          <button onClick={onApprove} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-2">
            <CheckCircle size={18}/> Draft Contract
          </button>
          <button className="flex-1 bg-white border border-red-100 text-red-500 hover:bg-red-50 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all">
            Decline
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default MangaPremiumRequests;