import React, { useState, useContext, useEffect } from "react";
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
// --- 1. PROFESSIONAL LIGHT-THEME CONTRACT MODAL ---
const ContractAcceptanceModal = ({ isOpen, manga, onAccept, onDecline, onCancel, loading }) => {
  const [signature, setSignature] = useState("");
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const isSigned = signature.trim().toUpperCase() === "I ACCEPT" && hasReadTerms;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
        className="w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-200"
      >
        {/* Document Header */}
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700">
              <ScrollText size={20} />
            </div>
            <div>
              <h2 className="text-lg  font-bold text-gray-900 uppercase tracking-tight italic">Monetization Contract</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Draft Protocol: {manga?._id?.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20}/></button>
        </div>

        <div className="p-8 space-y-6">
          {/* Partnership Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
              <p className="text-[9px]  font-bold uppercase text-blue-600 mb-1 tracking-widest">Asset Valuation</p>
              <p className="text-2xl  font-bold text-gray-900 italic">{manga?.pendingPrice} <span className="text-xs text-blue-500 font-bold not-italic">Coins</span></p>
            </div>
            <div className="bg-green-50 p-5 rounded-2xl border border-green-100">
              <p className="text-[9px]  font-bold uppercase text-green-600 mb-1 tracking-widest">Revenue Split</p>
              <p className="text-2xl  font-bold text-gray-900 italic">70% <span className="text-xs text-green-500 font-bold not-italic">Creator</span></p>
            </div>
          </div>

          {/* Detailed Terms Viewport */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-500">
              <ShieldCheck size={14} />
              <span className="text-[10px]  font-bold uppercase tracking-widest">General Terms of Use</span>
            </div>
            <div className="h-32 overflow-y-auto bg-gray-50 rounded-xl p-5 text-[11px] text-gray-600 leading-relaxed border border-gray-100">
              <p className="mb-2">● The Creator grants ToonLord the right to restrict access to <span className="font-bold text-gray-900">"{manga?.title}"</span> behind a paywall.</p>
              <p className="mb-2">● For every unlock transaction, the Platform shall deduct a 30% service fee, crediting 70% to the Creator Wallet.</p>
              <p className="mb-2">● Payments are processed in ToonCoins and converted to withdrawable currency after validation.</p>
              <p>● Either party may terminate this agreement with 48 hours notice via the creator dashboard.</p>
            </div>
            <label className="flex items-center gap-3 px-1 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={hasReadTerms} 
                onChange={(e) => setHasReadTerms(e.target.checked)} 
                className="w-4 h-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500" 
              />
              <span className="text-[10px] font-bold uppercase text-gray-500 group-hover:text-gray-800 transition-colors">I accept the monetization protocol</span>
            </label>
          </div>

          {/* Signature Verification */}
          <div className="space-y-3 border-t border-gray-100 pt-6">
            <div className="flex justify-between items-center text-[9px]  font-bold uppercase tracking-widest px-1">
              <span className="text-gray-400 italic">Signature Verification</span>
              {isSigned && <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle size={10}/> Verified</span>}
            </div>
            <input 
              type="text" 
              value={signature} 
              onChange={(e) => setSignature(e.target.value)} 
              placeholder="TYPE 'I ACCEPT' TO EXECUTE" 
              className={`w-full bg-gray-50 border-2 rounded-xl py-4 text-center font-mono text-sm tracking-[0.3em] outline-none transition-all uppercase
                ${isSigned ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 text-gray-900 focus:border-yellow-500'}
              `} 
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <button 
              onClick={onDecline} 
              className="flex-1 py-4 rounded-2xl  font-bold uppercase tracking-widest text-[10px] text-red-500 hover:bg-red-50 transition-all border border-red-100"
            >
              Decline Offer
            </button>
            <button 
              disabled={!isSigned || loading} 
              onClick={onAccept} 
              className={`flex-[1.5] py-4 rounded-2xl  font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all
                ${isSigned ? 'bg-yellow-500 text-black shadow-xl shadow-yellow-200 hover:-translate-y-0.5 active:scale-95' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}
              `}
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <><Gavel size={16} /> Execute Signature</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- 2. PREMIUM REQUEST MODAL ---
const PremiumRequestModal = ({ isOpen, manga, onConfirm, onCancel, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
      <motion.div initial={{ y: 50, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 50, opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600" />
        <div className="p-8 md:p-12 space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20 shadow-inner"><Zap className="text-yellow-500" size={36} fill="currentColor" /></div>
            <div className="space-y-1">
              <h3 className="text-3xl  font-bold uppercase italic tracking-tighter text-[var(--text-main)]">Premium <span className="text-yellow-500">Uplink</span></h3>
              <p className="text-[10px]  font-bold uppercase tracking-[0.4em] text-[var(--text-dim)]">Protocol: {manga?.title}</p>
            </div>
          </div>
          <div className="bg-[var(--bg-primary)]/60 rounded-[1.5rem] border border-[var(--border)] p-6 space-y-5 shadow-inner text-center">
            <p className="text-[12px] text-[var(--text-dim)] leading-relaxed italic opacity-80">Admin evaluation of performance metrics is required for coin valuation.</p>
            <div className="h-[1px] w-full bg-[var(--border)]" />
            <div className="flex items-center justify-between"><span className="text-[9px]  font-bold uppercase text-yellow-500/70 tracking-widest">Attempts Remainder</span><span className="text-[10px] font-bold text-[var(--text-main)] uppercase">{2 - (manga?.premiumRequestCount || 0)} Units</span></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={onCancel} className="flex-1 order-2 sm:order-1 py-4 rounded-2xl  font-bold uppercase tracking-[0.2em] text-[10px] border border-[var(--border)] text-[var(--text-dim)] hover:bg-white/5 transition-all">Abort</button>
            <button onClick={onConfirm} disabled={loading} className="flex-[1.5] order-1 sm:order-2 py-4 rounded-2xl  font-bold uppercase tracking-[0.2em] text-[10px] bg-yellow-500 text-black shadow-lg hover:shadow-yellow-500/20 transition-all flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle size={18} /> Transmit Request</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- 3. CUSTOM CONFIRM MODAL ---
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, accentColor }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: accentColor }} />
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-red-500"><AlertTriangle size={24} /><h3 className="text-xl  font-bold uppercase italic tracking-tight">{title}</h3></div>
          <p className="text-[var(--text-dim)] text-sm font-medium leading-relaxed italic">{message}</p>
          <div className="flex gap-3 pt-4">
            <button onClick={onCancel} className="flex-1 py-3 rounded-xl  font-bold uppercase tracking-widest text-[10px] bg-[var(--bg-primary)] border border-[var(--border)] transition-all hover:bg-white/5">Abort</button>
            <button onClick={onConfirm} className="flex-1 py-3 rounded-xl  font-bold uppercase tracking-widest text-[10px] text-white transition-all hover:brightness-110 shadow-lg" style={{ backgroundColor: accentColor }}>Confirm Purge</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- MAIN COMPONENT ---
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
  const [requestingPremium, setRequestingPremium] = useState(false);
  const [signingContract, setSigningContract] = useState(false);
  
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, type: null, data: null });
  const [premiumModal, setPremiumModal] = useState({ isOpen: false, manga: null });
  const [contractModal, setContractModal] = useState({ isOpen: false, manga: null });

  const fetchMySeries = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${API_URL}/api/users/my-mangas`, { headers: { Authorization: `Bearer ${token}` } });
      setSeriesList(Array.isArray(res.data) ? res.data : []);
    } catch (err) { showAlert("Database Sync Failed", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMySeries(); }, []);

  const fetchChaptersForManga = async (mangaId) => {
    if (chaptersByManga[mangaId]) return;
    try {
      const res = await axios.get(`${API_URL}/api/chapters/${mangaId}`);
      setChaptersByManga(prev => ({ ...prev, [mangaId]: res.data }));
    } catch (err) { console.error(err); }
  };

  const handleRequestPremium = async () => {
    const mangaId = premiumModal.manga?._id;
    setRequestingPremium(true);
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_URL}/api/mangas/request-premium/${mangaId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      showAlert("Request Transmitted.", "success");
      setPremiumModal({ isOpen: false, manga: null });
      fetchMySeries();
    } catch (err) { showAlert(err.response?.data?.message || "Protocol Denied", "error"); }
    finally { setRequestingPremium(false); }
  };

  const handleAcceptContract = async () => {
    const mangaId = contractModal.manga?._id;
    setSigningContract(true);
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_URL}/api/mangas/accept-contract/${mangaId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      showAlert("Contract Executed. Asset is now LIVE PREMIUM!", "success");
      setContractModal({ isOpen: false, manga: null });
      fetchMySeries();
    } catch (err) { showAlert("Signature Failed", "error"); }
    finally { setSigningContract(false); }
  };

  const handleDeclineContract = async () => {
    const mangaId = contractModal.manga?._id;
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${API_URL}/api/mangas/decline-contract/${mangaId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      showAlert("Offer Declined. Asset remains free.", "info");
      setContractModal({ isOpen: false, manga: null });
      fetchMySeries();
    } catch (err) { showAlert("Action Denied", "error"); }
  };

  const handleExecuteDelete = async () => {
    const { type, data } = confirmConfig;
    const token = localStorage.getItem('token');
    try {
      if (type === 'series') {
        await axios.delete(`${API_URL}/api/mangas/${data.id}`, { headers: { Authorization: `Bearer ${token}` } });
        setSeriesList(prev => prev.filter(s => s._id !== data.id));
        showAlert(`${data.title} purged.`, "success");
      } else if (type === 'chapter') {
        await axios.delete(`${API_URL}/api/chapters/${data.mangaId}/${data.chapterId}`, { headers: { Authorization: `Bearer ${token}` } });
        setChaptersByManga(prev => ({ ...prev, [data.mangaId]: prev[data.mangaId].filter(ch => ch._id !== data.chapterId) }));
        showAlert(`Chapter purged.`, "success");
      }
    } catch (err) { showAlert("Action Denied", "error"); }
    finally { setConfirmConfig({ isOpen: false, type: null, data: null }); }
  };

  const filteredSeries = seriesList.filter(s => s.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-[var(--accent)]" size={48} /><p className="text-[10px]  font-bold uppercase tracking-[0.5em] text-[var(--text-dim)]">Syncing Database</p></div>;

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] px-4 md:px-8 lg:px-12 py-2 md:py-10 transition-all duration-700 theme-${currentTheme}`}>
      <div className="fixed top-0 right-0 w-[40%] h-[30%] blur-[120px] opacity-[0.05] rounded-full pointer-events-none" style={{ backgroundColor: accentColor }} />

      <div className="relative z-10 max-w-6xl mx-auto space-y-8 md:space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 p-6 md:p-10 rounded-3xl bg-[var(--bg-secondary)]/30 backdrop-blur-2xl border border-[var(--border)]">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl  font-bold uppercase italic leading-snug">My <span className={accentText}>Series</span></h1>
            <p className="text-[var(--text-dim)] text-[9px]  font-bold uppercase tracking-[0.25em]">Content Management System</p>
          </div>
          <Link to="/create-series" className="flex items-center gap-3 px-8 py-4 rounded-xl  font-bold uppercase tracking-widest text-xs text-white bg-[var(--accent)] shadow-lg hover:scale-105 transition-transform shadow-accent/20"><Plus size={18} /> New Series</Link>
        </header>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full text-[var(--text-main)]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" size={16} />
            <input type="text" placeholder="Search Series..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border)] rounded-full pl-14 pr-4 py-4 font-bold focus:outline-none focus:border-[var(--accent)] transition-all outline-none shadow-inner" />
          </div>
          <div className="px-6 py-4 rounded-2xl bg-[var(--bg-secondary)]/20 border border-[var(--border)] flex gap-12 backdrop-blur-sm">
              <StatItem val={seriesList.length} label="Series" />
              <StatItem val={seriesList.reduce((acc, curr) => acc + (curr.TotalChapter || 0), 0)} label="Chapters" />
          </div>
        </div>

        <div className="space-y-6 pb-20">
          <AnimatePresence>
            {filteredSeries.map((series) => (
              <motion.div layout key={series._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group rounded-3xl bg-[var(--bg-secondary)]/20 border border-[var(--border)] overflow-hidden transition-all hover:bg-[var(--bg-secondary)]/30">
                <div className="flex flex-col md:flex-row gap-8 p-6">
                  <div className="relative w-full md:w-40 h-64 rounded-2xl overflow-hidden shadow-md shrink-0">
                    <img src={series.coverImage} className="w-full h-full object-cover" alt="cover" />
                    <div className={`absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-xl text-[9px]  font-bold border border-white/10 ${series.isAdult ? 'text-red-500' : 'text-[var(--accent)]'}`}>{series.isAdult ? '18+' : series.status || 'Active'}</div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl md:text-3xl  font-bold italic uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors">{series.title}</h2>
                        <div className="flex gap-6 text-[var(--text-dim)] text-[9px]  font-bold uppercase tracking-[0.2em] mt-4">
                          <span className="flex items-center gap-2"><BookOpen size={14}/> {series.TotalChapter || 0} Ch.</span>
                          <span className="flex items-center gap-2"><BarChart size={14}/> {series.views || 0} Views</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {series.isPremium ? (
                          <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-[9px]  font-bold uppercase tracking-widest flex items-center gap-2"><CheckCircle size={14} /> Premium • {series.price} Coins</div>
                        ) : series.premiumRequestStatus === 'contract_offered' ? (
                          <div className="flex flex-col items-end gap-2 p-3 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 shadow-lg shadow-yellow-500/5">
                             <span className="text-[8px]  font-bold text-yellow-500 uppercase animate-pulse tracking-[0.1em]">Offer Received</span>
                             <button onClick={() => setContractModal({ isOpen: true, manga: series })} className="px-4 py-2 bg-yellow-500 text-black text-[9px]  font-bold uppercase rounded-lg hover:scale-105 transition-all shadow-md">Sign Contract</button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <button disabled={series.premiumRequestStatus === 'pending' || series.premiumRequestCount >= 2} onClick={() => setPremiumModal({ isOpen: true, manga: series })} className={`px-4 py-2 rounded-xl border text-[9px]  font-bold uppercase transition-all ${series.premiumRequestStatus === 'pending' ? 'border-[var(--border)] text-[var(--text-dim)]' : 'border-yellow-500/30 text-yellow-500 hover:bg-yellow-500 hover:text-black shadow-lg shadow-yellow-500/5'}`}>{series.premiumRequestStatus === 'pending' ? 'Reviewing Stats...' : 'Go Premium'}</button>
                            <span className="text-[7px]  font-bold opacity-30 uppercase tracking-tighter">Attempts: {series.premiumRequestCount || 0}/2</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <ActionButton to={`/manga/${series._id}`} icon={<Eye size={16}/>} />
                      <ActionButton to={`/create-series/${series._id}`} icon={<Edit3 size={16}/>} />
                      <button onClick={() => setConfirmConfig({ isOpen: true, type: 'series', data: { id: series._id, title: series.title } })} className="p-4 bg-red-500/5 border border-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-md"><Trash2 size={16} /></button>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[var(--border)]">
                      <button onClick={() => { const isExpanding = expandedSeries !== series._id; setExpandedSeries(isExpanding ? series._id : null); if (isExpanding) fetchChaptersForManga(series._id); }} className={`flex items-center gap-3 text-[10px]  font-bold uppercase tracking-[0.25em] transition-all ${expandedSeries === series._id ? accentText : 'text-[var(--text-dim)]'}`}>{expandedSeries === series._id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>} Manage Chapters</button>
                      <AnimatePresence>
                        {expandedSeries === series._id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="mt-6 p-6 rounded-2xl bg-[var(--bg-primary)]/50 border border-[var(--border)] space-y-4 shadow-inner">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 {(chaptersByManga[series._id] || []).map(chapter => (
                                   <div key={chapter._id} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl group/ch hover:border-[var(--accent)]/40 transition-all">
                                      <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center text-[10px] font-mono text-[var(--accent)]">#{chapter.chapterNumber}</div><p className="text-[11px] font-bold truncate max-w-[150px]">{chapter.title || `Chapter ${chapter.chapterNumber}`}</p></div>
                                      <div className="flex gap-2 opacity-0 group-hover/ch:opacity-100 transition-opacity">
                                        <button onClick={() => navigate(`/edit-chapter/${series._id}/${chapter._id}`)} className="p-2 hover:text-[var(--accent)]"><Edit3 size={14}/></button>
                                        <button onClick={() => setConfirmConfig({ isOpen: true, type: 'chapter', data: { mangaId: series._id, chapterId: chapter._id, chapterNum: chapter.chapterNumber } })} className="p-2 hover:text-red-500"><Trash2 size={14}/></button>
                                      </div>
                                   </div>
                                 ))}
                               </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {confirmConfig.isOpen && <ConfirmModal isOpen={confirmConfig.isOpen} accentColor={accentColor} title="Authorization Required" message={confirmConfig.type === 'series' ? `Permanently delete "${confirmConfig.data.title}"?` : `Delete Chapter ${confirmConfig.data.chapterNum}?`} onConfirm={handleExecuteDelete} onCancel={() => setConfirmConfig({ isOpen: false, type: null, data: null })} />}
        {premiumModal.isOpen && <PremiumRequestModal isOpen={premiumModal.isOpen} manga={premiumModal.manga} loading={requestingPremium} onConfirm={handleRequestPremium} onCancel={() => setPremiumModal({ isOpen: false, manga: null })} />}
        {contractModal.isOpen && (
          <ContractAcceptanceModal 
            isOpen={contractModal.isOpen} 
            manga={contractModal.manga} 
            loading={signingContract} 
            onAccept={handleAcceptContract} 
            onDecline={handleDeclineContract} 
            onCancel={() => setContractModal({ isOpen: false, manga: null })} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const StatItem = ({ val, label }) => (
  <div className="text-center group"><p className="text-[var(--text-main)]  font-bold text-3xl italic tracking-tighter transition-transform group-hover:scale-105">{val}</p><p className="text-[8px] uppercase  font-bold tracking-[0.2em] text-[var(--text-dim)] mt-1">{label}</p></div>
);

const ActionButton = ({ to, icon }) => (
  <Link to={to} className="p-4 bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-dim)] rounded-xl hover:border-[var(--accent)]/50 hover:text-[var(--text-main)] transition-all shadow-md">{icon}</Link>
);

export default MySeries;