import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Edit3, BookOpen, Search, 
  Eye, ChevronDown, ChevronUp, Loader2, AlertTriangle, BarChart, X
} from "lucide-react";
import axios from 'axios';
import { AppContext } from "../UserContext";
import { useAlert } from "../context/AlertContext";

// --- CUSTOM CONFIRM MODAL COMPONENT ---
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, accentColor }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: accentColor }} />
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-red-500">
            <AlertTriangle size={24} />
            <h3 className="text-xl font-black uppercase italic tracking-tight">{title}</h3>
          </div>
          <p className="text-[var(--text-dim)] text-sm font-medium leading-relaxed italic">
            {message}
          </p>
          <div className="flex gap-3 pt-4">
            <button onClick={onCancel} className="flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] bg-[var(--bg-primary)] border border-[var(--border)] hover:bg-[var(--bg-secondary)] transition-all">
              Abort
            </button>
            <button onClick={onConfirm} className="flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] text-white transition-all hover:brightness-110 shadow-lg" style={{ backgroundColor: accentColor }}>
              Confirm Purge
            </button>
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

  // --- STATE ---
  const [seriesList, setSeriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSeries, setExpandedSeries] = useState(null);
  const [chaptersByManga, setChaptersByManga] = useState({});
  
  // Modal State
  const [confirmConfig, setConfirmConfig] = useState({ 
    isOpen: false, 
    type: null, // 'series' or 'chapter'
    data: null 
  });

  // --- FETCHING DATA ---
  const fetchMySeries = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/users/my-mangas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSeriesList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      showAlert("Database Sync Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchChaptersForManga = async (mangaId) => {
    if (chaptersByManga[mangaId]) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/chapters/${mangaId}`);
      setChaptersByManga(prev => ({ ...prev, [mangaId]: res.data }));
    } catch (err) { 
      console.error("Chapter Fetch Error:", err); 
    }
  };

  useEffect(() => { fetchMySeries(); }, []);

  // --- ACTION TRIGGERS ---
  const openDeleteSeriesModal = (id, title) => {
    setConfirmConfig({ isOpen: true, type: 'series', data: { id, title } });
  };

  const openDeleteChapterModal = (mangaId, chapterId, chapterNum) => {
    setConfirmConfig({ isOpen: true, type: 'chapter', data: { mangaId, chapterId, chapterNum } });
  };

  // --- THE EXECUTIONER (API CALLS) ---
  const handleExecuteDelete = async () => {
    const { type, data } = confirmConfig;
    const token = localStorage.getItem('token');

    try {
      if (type === 'series') {
        await axios.delete(`http://localhost:5000/api/mangas/${data.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSeriesList(prev => prev.filter(s => s._id !== data.id));
        showAlert(`${data.title} purged from system.`, "success");
      } else if (type === 'chapter') {
        await axios.delete(`http://localhost:5000/api/chapters/${data.mangaId}/${data.chapterId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChaptersByManga(prev => ({
          ...prev,
          [data.mangaId]: prev[data.mangaId].filter(ch => ch._id !== data.chapterId)
        }));
        showAlert(`Chapter ${data.chapterNum} purged successfully.`, "success");
      }
    } catch (err) {
      showAlert("Action Denied: Server Error", "error");
    } finally {
      setConfirmConfig({ isOpen: false, type: null, data: null });
    }
  };

  const handleEditChapter = (mangaId, chapterId) => {
    navigate(`/edit-chapter/${mangaId}/${chapterId}`);
  };

  const filteredSeries = seriesList.filter(s => 
    s.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[var(--accent)]" size={48} />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-dim)]">Syncing Database</p>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] px-4 md:px-8 lg:px-12 py-10 transition-all duration-700 theme-${currentTheme}`}>
      <div className="fixed top-0 right-0 w-[40%] h-[30%] blur-[120px] opacity-[0.05] rounded-full pointer-events-none" style={{ backgroundColor: accentColor }} />

      <div className="relative z-10 max-w-6xl mx-auto space-y-8 md:space-y-12">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 p-6 md:p-10 rounded-3xl bg-[var(--bg-secondary)]/30 backdrop-blur-2xl border border-[var(--border)]">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <div className="w-6 h-[1px] bg-[var(--accent)]" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--accent)]">Creator Portal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic leading-snug">My <span className={accentText}>Series</span></h1>
            <p className="text-[var(--text-dim)] text-[9px] font-black uppercase tracking-[0.25em]">Content Management System</p>
          </div>
          <Link to="/create-series" className="flex items-center gap-3 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs text-white transition-transform hover:scale-105 active:scale-95 shadow-lg" style={{ backgroundColor: accentColor }}>
            <Plus size={18} /> New Series
          </Link>
        </header>

        {/* SEARCH & STATS */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" size={16} />
            <input 
              type="text" placeholder="Search Series..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border)] rounded-full pl-14 pr-4 py-4 font-bold focus:outline-none focus:border-[var(--accent)] transition-all"
            />
          </div>
          <div className="px-6 py-4 rounded-2xl bg-[var(--bg-secondary)]/20 border border-[var(--border)] flex gap-12 backdrop-blur-sm">
              <StatItem val={seriesList.length} label="Series" />
              <div className="w-[1px] h-10 bg-[var(--border)]" />
              <StatItem val={seriesList.reduce((acc, curr) => acc + (curr.TotalChapter || 0), 0)} label="Chapters" />
          </div>
        </div>

        {/* SERIES LIST */}
        <div className="space-y-6 pb-20">
          <AnimatePresence>
            {filteredSeries.length > 0 ? filteredSeries.map((series) => (
              <motion.div layout key={series._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group rounded-3xl bg-[var(--bg-secondary)]/20 border border-[var(--border)] overflow-hidden transition-all hover:bg-[var(--bg-secondary)]/30">
                <div className="flex flex-col md:flex-row gap-8 p-6">
                  <div className="relative w-full md:w-40 h-64 rounded-2xl overflow-hidden shadow-md shrink-0">
                    <img src={series.coverImage} className="w-full h-full object-cover" alt="cover" />
                    <div className={`absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-xl text-[9px] font-black border border-white/10 ${series.isAdult ? 'text-red-500' : 'text-[var(--accent)]'}`}>
                      {series.isAdult ? '18+' : series.status || 'Active'}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors">{series.title}</h2>
                        <div className="flex gap-6 text-[var(--text-dim)] text-[9px] font-black uppercase tracking-[0.2em] mt-4">
                          <span className="flex items-center gap-2"><BookOpen size={14}/> {series.TotalChapter || 0} Ch.</span>
                          <span className="flex items-center gap-2"><BarChart size={14}/> {series.views || 0} Views</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <ActionButton to={`/manga/${series._id}`} icon={<Eye size={16}/>} />
                        <ActionButton to={`/edit-series/${series._id}`} icon={<Edit3 size={16}/>} />
                        <button onClick={() => openDeleteSeriesModal(series._id, series.title)} className="p-4 bg-red-500/5 border border-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[var(--border)]">
                      <button 
                        onClick={() => {
                          const isExpanding = expandedSeries !== series._id;
                          setExpandedSeries(isExpanding ? series._id : null);
                          if (isExpanding) fetchChaptersForManga(series._id);
                        }}
                        className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] transition-all ${expandedSeries === series._id ? accentText : 'text-[var(--text-dim)]'}`}
                      >
                        {expandedSeries === series._id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        {expandedSeries === series._id ? "Hide Registry" : "Manage Chapters"}
                      </button>

                      <AnimatePresence>
                        {expandedSeries === series._id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                            <div className="mt-6 p-6 rounded-2xl bg-[var(--bg-primary)]/50 border border-[var(--border)] space-y-4">
                               <div className="flex items-center justify-between px-2">
                                  <p className="text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest italic">Chapter Index</p>
                                  <Link to="/upload" className="text-[9px] font-black uppercase px-5 py-2 rounded-xl border border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-all">New Chapter</Link>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 no-scrollbar">
                                 {(chaptersByManga[series._id] || []).map(chapter => (
                                   <div key={chapter._id} className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl group/ch hover:border-[var(--accent)]/40 transition-all">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center text-[10px] font-mono text-[var(--accent)]">#{chapter.chapterNumber}</div>
                                        <p className="text-[11px] font-bold truncate max-w-[150px]">{chapter.title || `Chapter ${chapter.chapterNumber}`}</p>
                                      </div>
                                      <div className="flex gap-2 opacity-0 group-hover/ch:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditChapter(series._id, chapter._id)} className="p-2 hover:text-[var(--accent)]"><Edit3 size={14}/></button>
                                        <button onClick={() => openDeleteChapterModal(series._id, chapter._id, chapter.chapterNumber)} className="p-2 hover:text-red-500"><Trash2 size={14}/></button>
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
            )) : (
              <div className="py-32 text-center border-2 border-dashed border-[var(--border)] rounded-3xl space-y-6">
                 <AlertTriangle size={36} className="mx-auto text-[var(--text-dim)]" />
                 <p className="text-[var(--text-dim)] font-black uppercase tracking-[0.35em] text-sm">Registry Empty</p>
                 <Link to="/create-series" className="px-8 py-4 rounded-xl inline-block text-white font-black uppercase tracking-widest text-xs" style={{ backgroundColor: accentColor }}>Start Deployment</Link>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- RENDER CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {confirmConfig.isOpen && (
          <ConfirmModal 
            isOpen={confirmConfig.isOpen}
            accentColor={accentColor}
            title="Authorization Required"
            message={
              confirmConfig.type === 'series' 
              ? `PURGE PROTOCOL: You are about to permanently delete "${confirmConfig.data.title}". This erases all chapters and cloud assets. This cannot be undone.`
              : `DELETE CHAPTER: Confirm removal of Chapter ${confirmConfig.data.chapterNum}. This will purge images from the cloud.`
            }
            onConfirm={handleExecuteDelete}
            onCancel={() => setConfirmConfig({ isOpen: false, type: null, data: null })}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const StatItem = ({ val, label }) => (
  <div className="text-center group">
    <p className="text-[var(--text-main)] font-black text-3xl italic tracking-tighter transition-transform group-hover:scale-105">{val}</p>
    <p className="text-[8px] uppercase font-black tracking-[0.2em] text-[var(--text-dim)] mt-1">{label}</p>
  </div>
);

const ActionButton = ({ to, icon }) => (
  <Link to={to} className="p-4 bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-dim)] rounded-xl hover:border-[var(--accent)]/50 hover:text-[var(--text-main)] transition-all shadow-md">
    {icon}
  </Link>
);

export default MySeries;