import React, { useState, useContext, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Edit3, BookOpen, Search, 
  Eye, ChevronDown, ChevronUp, Loader2, AlertTriangle, 
  BarChart, X, Zap, CheckCircle, ScrollText, Gavel, ShieldCheck
} from "lucide-react";
import axios from 'axios';
import { AppContext } from "../UserContext";
import { useAlert } from "../context/AlertContext";

const API_URL = import.meta.env.VITE_API_URL;

// --- MODALS (Kept your logic, updated padding for balance) ---
const ContractAcceptanceModal = ({ isOpen, manga, onAccept, onDecline, onCancel, loading }) => {
  const [signature, setSignature] = useState("");
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const isSigned = signature.trim().toUpperCase() === "I ACCEPT" && hasReadTerms;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-200"
      >
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ScrollText size={18} className="text-yellow-600" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tighter italic">Monetization Contract</h2>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <p className="text-[8px] font-bold uppercase text-blue-600 mb-1">Valuation</p>
              <p className="text-xl font-bold text-gray-900">{manga?.pendingPrice} <span className="text-[10px] opacity-50">Coins</span></p>
            </div>
            <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
              <p className="text-[8px] font-bold uppercase text-green-600 mb-1">Split</p>
              <p className="text-xl font-bold text-gray-900">70% <span className="text-[10px] opacity-50">Creator</span></p>
            </div>
          </div>

          <div className="h-32 overflow-y-auto bg-gray-50 rounded-xl p-4 text-[11px] text-gray-600 border border-gray-100 font-medium">
             <p className="mb-2">● Rights granted for <span className="font-bold text-gray-900">"{manga?.title}"</span> monetization.</p>
             <p className="mb-2">● 30% Platform Fee / 70% Creator Revenue.</p>
             <p>● ToonCoins are the primary tender for all transactions.</p>
          </div>

          <div className="space-y-4 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={hasReadTerms} onChange={(e) => setHasReadTerms(e.target.checked)} className="w-4 h-4 rounded text-yellow-500" />
              <span className="text-[10px] font-bold uppercase text-gray-500">Accept Protocol Terms</span>
            </label>
            <input 
              type="text" value={signature} onChange={(e) => setSignature(e.target.value)} 
              placeholder="TYPE 'I ACCEPT'" 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 text-center font-mono text-xs tracking-widest outline-none uppercase"
            />
            <div className="flex gap-3">
              <button onClick={onDecline} className="flex-1 py-4 rounded-xl font-bold uppercase text-[10px] text-red-500 border border-red-100">Decline</button>
              <button disabled={!isSigned || loading} onClick={onAccept} className={`flex-[2] py-4 rounded-xl font-bold uppercase text-[10px] ${isSigned ? 'bg-yellow-500 text-black' : 'bg-gray-100 text-gray-300'}`}>Execute</button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const MySeries = () => {
  const { isRedMode, currentTheme } = useContext(AppContext);
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  
  const accentColor = isRedMode ? '#ef4444' : 'var(--accent)';
  const accentText = isRedMode ? 'text-red-500' : 'text-[var(--accent)]';

  const [seriesList, setSeriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSeries, setExpandedSeries] = useState(null);
  const [chaptersByManga, setChaptersByManga] = useState({});
  const [signingContract, setSigningContract] = useState(false);
  const [requestingPremium, setRequestingPremium] = useState(false);
  
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, type: null, data: null });
  const [premiumModal, setPremiumModal] = useState({ isOpen: false, manga: null });
  const [contractModal, setContractModal] = useState({ isOpen: false, manga: null });

  const fetchMySeries = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/users/my-mangas`, { 
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
      });
      setSeriesList(Array.isArray(res.data) ? res.data : []);
    } catch (err) { showAlert("Sync Failed", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMySeries(); }, []);

  const totalChaptersCount = useMemo(() => seriesList.reduce((acc, curr) => acc + (curr.TotalChapter || 0), 0), [seriesList]);
  const filteredSeries = seriesList.filter(s => s.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[var(--accent)]" size={40} />
      <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--text-dim)] animate-pulse">Establishing Uplink</p>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] px-4 py-8 lg:px-12 transition-all duration-700 theme-${currentTheme}`}>
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* --- BALANCED HEADER --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 bg-[var(--bg-secondary)]/20 backdrop-blur-3xl p-8 md:p-10 rounded-[3rem] border border-[var(--border)] relative overflow-hidden">
          <div className="z-10">
            <h1 className="text-4xl md:text-5xl font-bold uppercase italic tracking-tighter leading-none mb-4">My <span className={accentText}>Series</span></h1>
            <div className="flex gap-8">
               <div className="flex flex-col"><span className="text-2xl font-bold italic leading-none">{seriesList.length}</span><span className="text-[8px] font-bold uppercase tracking-widest text-[var(--text-dim)]">Series</span></div>
               <div className="flex flex-col"><span className="text-2xl font-bold italic leading-none">{totalChaptersCount}</span><span className="text-[8px] font-bold uppercase tracking-widest text-[var(--text-dim)]">Chapters</span></div>
            </div>
          </div>
          <Link to="/create-series" className="group relative z-10 flex items-center gap-3 px-8 py-5 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-white bg-[var(--accent)] shadow-2xl hover:brightness-110 transition-all active:scale-95 overflow-hidden">
            <Plus size={18} /> New Series
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
        </div>

        {/* --- BALANCED SEARCH BAR --- */}
        <div className="relative w-full group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-dim)] group-focus-within:text-[var(--accent)] transition-colors" size={18} />
          <input 
            type="text" placeholder="FILTER_DATABASE..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full bg-[var(--bg-secondary)]/40 border border-[var(--border)] rounded-2xl pl-16 pr-6 py-5 font-bold uppercase text-xs tracking-widest focus:outline-none focus:border-[var(--accent)]/50 transition-all shadow-inner" 
          />
        </div>

        {/* --- SERIES GRID --- */}
        <div className="grid grid-cols-1 gap-6 pb-24">
          <AnimatePresence>
            {filteredSeries.map((series) => (
              <motion.div layout key={series._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group bg-[var(--bg-secondary)]/10 border border-[var(--border)] rounded-[2.5rem] overflow-hidden hover:bg-[var(--bg-secondary)]/20 transition-all shadow-xl">
                <div className="flex flex-col md:flex-row p-6 md:p-8 gap-8">
                  
                  {/* Asset Visual */}
                  <div className="relative w-full md:w-44 h-64 md:h-64 rounded-3xl overflow-hidden shadow-2xl shrink-0 border border-white/5">
                    <img src={series.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-md rounded-xl text-[8px] font-bold border border-white/10 text-[var(--accent)] uppercase tracking-widest">
                      {series.status || 'Active'}
                    </div>
                  </div>

                  {/* Asset Data */}
                  <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <h2 className="text-2xl md:text-3xl font-bold italic uppercase tracking-tighter truncate group-hover:text-[var(--accent)] transition-colors">{series.title}</h2>
                        <div className="flex items-center gap-6 mt-4">
                           <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-dim)]"><BookOpen size={14} className={accentText}/> {series.TotalChapter || 0} SEQS</div>
                           <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-dim)]"><BarChart size={14} className={accentText}/> {series.views || 0} FLUX</div>
                        </div>
                      </div>

                      {/* Status / Actions */}
                      <div className="shrink-0 flex flex-col items-end gap-3">
                        {series.isPremium ? (
                          <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={14} /> Premium Hub</div>
                        ) : series.premiumRequestStatus === 'contract_offered' ? (
                          <button onClick={() => setContractModal({ isOpen: true, manga: series })} className="px-5 py-2.5 bg-yellow-500 text-black text-[9px] font-bold uppercase rounded-xl animate-bounce shadow-lg shadow-yellow-500/20">Sign Contract</button>
                        ) : (
                          <button 
                            disabled={series.premiumRequestStatus === 'pending' || series.premiumRequestCount >= 2} 
                            onClick={() => setPremiumModal({ isOpen: true, manga: series })} 
                            className={`px-4 py-2 rounded-xl border text-[9px] font-bold uppercase transition-all ${series.premiumRequestStatus === 'pending' ? 'opacity-50 cursor-not-allowed' : 'border-yellow-500/40 text-yellow-500 hover:bg-yellow-500 hover:text-black'}`}
                          >
                            {series.premiumRequestStatus === 'pending' ? 'Under Review' : 'Monetize'}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-8">
                      <ActionBtn to={`/manga/${series._id}`} icon={<Eye size={18}/>} label="View" />
                      <ActionBtn to={`/create-series/${series._id}`} icon={<Edit3 size={18}/>} label="Edit" />
                      <button 
                        onClick={() => setConfirmConfig({ isOpen: true, type: 'series', data: { id: series._id, title: series.title } })} 
                        className="p-4 bg-red-500/5 border border-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Chapter Expandable */}
                    <div className="mt-8 pt-6 border-t border-white/5">
                      <button 
                        onClick={() => {
                          const isExpanding = expandedSeries !== series._id;
                          setExpandedSeries(isExpanding ? series._id : null);
                          if (isExpanding) {
                            axios.get(`${API_URL}/api/chapters/${series._id}`).then(res => setChaptersByManga(p => ({...p, [series._id]: res.data})));
                          }
                        }}
                        className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] transition-all hover:pl-2 ${expandedSeries === series._id ? accentText : 'text-[var(--text-dim)]'}`}
                      >
                        {expandedSeries === series._id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        {expandedSeries === series._id ? 'Close Sequences' : 'Sequence Manager'}
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedSeries === series._id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-black/20 border-t border-white/5">
                      <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(chaptersByManga[series._id] || []).map(ch => (
                          <div key={ch._id} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)]/30 border border-[var(--border)] rounded-2xl group/ch hover:border-[var(--accent)]/50 transition-all">
                             <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 rounded">#{ch.chapterNumber}</span>
                                <span className="text-xs font-bold truncate max-w-[100px]">{ch.title || 'Untitled'}</span>
                             </div>
                             <div className="flex gap-1 opacity-0 group-hover/ch:opacity-100 transition-all">
                                <button onClick={() => navigate(`/edit-chapter/${series._id}/${ch._id}`)} className="p-2 hover:text-[var(--accent)]"><Edit3 size={14}/></button>
                                <button onClick={() => setConfirmConfig({ isOpen: true, type: 'chapter', data: { mangaId: series._id, chapterId: ch._id, chapterNum: ch.chapterNumber } })} className="p-2 hover:text-red-500"><Trash2 size={14}/></button>
                             </div>
                          </div>
                        ))}
                        <Link to={`/add-chapter/${series._id}`} className="flex items-center justify-center p-4 border border-dashed border-[var(--border)] rounded-2xl text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">+ Add Sequence</Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* --- MODALS (Unchanged logic, just wrappers) --- */}
      <AnimatePresence>
        {confirmConfig.isOpen && <ConfirmModal isOpen={confirmConfig.isOpen} accentColor={accentColor} title="Confirm Purge" message={`This will permanently delete the entry from the database. Proceed?`} onConfirm={async () => {
           const { type, data } = confirmConfig;
           const token = localStorage.getItem('token');
           if(type === 'series') {
             await axios.delete(`${API_URL}/api/mangas/${data.id}`, { headers: { Authorization: `Bearer ${token}` } });
             setSeriesList(p => p.filter(s => s._id !== data.id));
           } else {
             await axios.delete(`${API_URL}/api/chapters/${data.mangaId}/${data.chapterId}`, { headers: { Authorization: `Bearer ${token}` } });
             setChaptersByManga(p => ({ ...p, [data.mangaId]: p[data.mangaId].filter(c => c._id !== data.chapterId) }));
           }
           setConfirmConfig({ isOpen: false });
           showAlert("Entry Purged", "success");
        }} onCancel={() => setConfirmConfig({ isOpen: false })} />}

        {premiumModal.isOpen && <PremiumRequestModal isOpen={premiumModal.isOpen} manga={premiumModal.manga} loading={requestingPremium} onConfirm={async () => {
           setRequestingPremium(true);
           try {
             await axios.post(`${API_URL}/api/mangas/request-premium/${premiumModal.manga._id}`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
             showAlert("Request Sent", "success");
             fetchMySeries();
             setPremiumModal({ isOpen: false });
           } catch(e) { showAlert("Request Denied", "error"); }
           setRequestingPremium(false);
        }} onCancel={() => setPremiumModal({ isOpen: false })} />}

        {contractModal.isOpen && (
          <ContractAcceptanceModal 
            isOpen={contractModal.isOpen} manga={contractModal.manga} loading={signingContract} 
            onAccept={async () => {
              setSigningContract(true);
              try {
                await axios.post(`${API_URL}/api/mangas/accept-contract/${contractModal.manga._id}`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                showAlert("Contract Signed!", "success");
                fetchMySeries();
                setContractModal({ isOpen: false });
              } catch(e) { showAlert("Signature Failed", "error"); }
              setSigningContract(false);
            }} 
            onDecline={async () => {
              await axios.post(`${API_URL}/api/mangas/decline-contract/${contractModal.manga._id}`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
              setContractModal({ isOpen: false });
              fetchMySeries();
            }}
            onCancel={() => setContractModal({ isOpen: false })} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ActionBtn = ({ to, icon, label }) => (
  <Link to={to} className="flex items-center gap-3 px-6 py-4 bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-dim)] rounded-2xl font-bold uppercase tracking-widest text-[9px] hover:border-[var(--accent)] hover:text-[var(--text-main)] hover:shadow-lg transition-all active:scale-95">
    {icon} <span>{label}</span>
  </Link>
);

// --- OTHER MODALS REMAIN THE SAME ---
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, accentColor }) => (
  <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[2rem] p-8 max-w-sm w-full space-y-6">
      <h3 className="text-xl font-bold uppercase italic text-red-500">{title}</h3>
      <p className="text-sm opacity-70 italic">{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-[var(--bg-primary)] text-[10px] font-bold uppercase tracking-widest border border-[var(--border)]">Abort</button>
        <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">Confirm</button>
      </div>
    </div>
  </div>
);

const PremiumRequestModal = ({ isOpen, manga, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[2.5rem] p-10 max-w-lg w-full text-center space-y-8">
      <Zap className="mx-auto text-yellow-500" size={48} />
      <div>
        <h3 className="text-3xl font-bold uppercase italic tracking-tighter">Premium <span className="text-yellow-500">Uplink</span></h3>
        <p className="text-[10px] opacity-50 uppercase tracking-widest mt-2">{manga?.title}</p>
      </div>
      <p className="text-xs opacity-70 italic">Admin evaluation required for monetization approval.</p>
      <div className="flex gap-4">
        <button onClick={onCancel} className="flex-1 py-4 rounded-2xl bg-white/5 text-[10px] font-bold uppercase tracking-widest border border-[var(--border)]">Abort</button>
        <button onClick={onConfirm} className="flex-[2] py-4 rounded-2xl bg-yellow-500 text-black text-[10px] font-bold uppercase tracking-widest shadow-xl">
          {loading ? <Loader2 className="animate-spin mx-auto"/> : 'Request Approval'}
        </button>
      </div>
    </div>
  </div>
);

export default MySeries;