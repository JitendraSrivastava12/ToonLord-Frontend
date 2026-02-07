import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Edit3, BookOpen, Search, 
  Eye, ChevronDown, ChevronUp, Loader2, AlertTriangle, BarChart 
} from "lucide-react";
import axios from 'axios';
import { AppContext } from "../UserContext";
import { useAlert } from "../context/AlertContext";

const MySeries = () => {
  const { isRedMode, currentTheme } = useContext(AppContext);
  const { showAlert } = useAlert();
  
  const accentColor = isRedMode ? '#ef4444' : 'var(--accent)';
  const accentText = isRedMode ? 'text-red-500' : 'text-[var(--accent)]';

  const [seriesList, setSeriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSeries, setExpandedSeries] = useState(null);
  const [chaptersByManga, setChaptersByManga] = useState({});

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
      setSeriesList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMySeries(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`PERMANENT PURGE: Are you sure you want to delete "${title}"?`)) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/mangas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSeriesList(prev => prev.filter(s => s._id !== id));
      showAlert(`${title} purged from system.`, "success");
    } catch (err) {
      showAlert("Purge Interrupted", "error");
    }
  };

  const fetchChaptersForManga = async (mangaId) => {
    if (chaptersByManga[mangaId]) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/chapters/${mangaId}`);
      setChaptersByManga(prev => ({ ...prev, [mangaId]: res.data }));
    } catch (err) { console.error(err); }
  };

  const filteredSeries = seriesList.filter(s => 
    s.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[var(--accent)]" size={48} />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-dim)] animate-pulse">Syncing Series Database</p>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] px-4 md:px-8 lg:px-12 py-10 transition-all duration-700 theme-${currentTheme}  `}>

      {/* Background Ambience */}
      <div className="fixed top-0 right-0 w-[40%] h-[30%] blur-[120px] opacity-[0.05] rounded-full pointer-events-none" style={{ backgroundColor: accentColor }} />

      <div className="relative z-10 max-w-6xl mx-auto space-y-8 md:space-y-12">

        {/* HEADER: Terminal Design */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-10 p-6 md:p-10 rounded-3xl bg-[var(--bg-secondary)]/30 backdrop-blur-2xl border border-[var(--border)] shadow-lg">
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-2">
               <div className="w-6 h-[1px] bg-[var(--accent)]" />
               <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)]">Creator Portal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight italic leading-snug">
              My <span className={accentText}>Series</span>
            </h1>
            <p className="text-[var(--text-dim)] text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em]">Proprietary Content Management System</p>
          </div>
          <Link to="/create-series" className="flex items-center gap-3 md:gap-4 px-6 md:px-10 py-3 md:py-4 rounded-xl font-black uppercase tracking-widest text-xs md:text-sm shadow-md transition-transform hover:scale-105 active:scale-95 text-white"
            style={{ backgroundColor: accentColor }}>
            <Plus size={18} /> New Deployment
          </Link>
        </header>

        {/* SEARCH & SYSTEM STATS */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-[var(--text-dim)] transition-colors group-focus-within:text-[var(--accent)]" size={16} />
            <input 
              type="text" 
              placeholder="Query Series Registry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border)] rounded-full pl-12 pr-4 py-3 md:py-4 text-sm md:text-base font-bold focus:outline-none focus:border-[var(--accent)]/50 transition-all placeholder:opacity-20"
            />
          </div>
          
          <div className="px-4 md:px-6 py-3 md:py-4 rounded-2xl bg-[var(--bg-secondary)]/20 border border-[var(--border)] flex gap-6 md:gap-12 backdrop-blur-sm">
              <StatItem val={seriesList.length} label="Total Series" />
              <div className="w-[1px] h-8 md:h-10 bg-[var(--border)]" />
              <StatItem val={seriesList.reduce((acc, curr) => acc + (curr.TotalChapter || 0), 0)} label="Total Chapters" />
          </div>
        </div>

        {/* SERIES LIST */}
        <div className="space-y-6 md:space-y-8 pb-12 md:pb-20">
          <AnimatePresence>
            {filteredSeries.length > 0 ? filteredSeries.map((series) => (
              <motion.div 
                layout
                key={series._id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group rounded-2xl md:rounded-3xl bg-[var(--bg-secondary)]/20 border border-[var(--border)] overflow-hidden transition-all duration-300 hover:border-[var(--accent)]/30 hover:bg-[var(--bg-secondary)]/30"
              >
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 p-4 md:p-6">
                  
                  {/* Thumbnail / Cover */}
                  <div className="relative w-full md:w-40 h-56 md:h-64 rounded-2xl md:rounded-[1.5rem] overflow-hidden shadow-md shrink-0">
                    <img src={series.coverImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="cover" />
                    <div className={`absolute bottom-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-xl text-[8px] md:text-[9px] font-black border border-white/10 uppercase tracking-widest ${series.isAdult ? 'text-red-500' : 'text-[var(--accent)]'}`}>
                      {series.isAdult ? 'RESTRICTED' : series.status || 'Active'}
                    </div>
                  </div>

                  {/* Info & Actions */}
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-black italic tracking-tight uppercase text-[var(--text-main)] leading-snug group-hover:text-[var(--accent)] transition-colors">{series.title}</h2>
                        <div className="flex flex-wrap gap-4 md:gap-6 text-[var(--text-dim)] text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] mt-3 md:mt-4">
                          <span className="flex items-center gap-1 md:gap-2"><BookOpen size={14}/> {series.TotalChapter || 0} Chapters</span>
                          <span className="flex items-center gap-1 md:gap-2"><BarChart size={14}/> {series.views || 0} Views</span>
                          {series.isAdult && <span className="flex items-center gap-1 md:gap-2 text-red-500/80"><AlertTriangle size={14}/> 18+</span>}
                        </div>
                      </div>
                      
                      {/* Control Cluster */}
                      <div className="flex gap-2 md:gap-3">
                        <ActionButton to={`/manga/${series._id}`} icon={<Eye size={16}/>} />
                        <ActionButton to={`/edit-series/${series._id}`} icon={<Edit3 size={16}/>} />
                        <button onClick={() => handleDelete(series._id, series.title)} className="p-3 md:p-4 bg-red-500/5 border border-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-md">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* CHAPTER MANAGEMENT SYSTEM */}
                    <div className="mt-4 md:mt-6 pt-4 border-t border-[var(--border)]">
                      <button 
                        onClick={() => {
                          setExpandedSeries(expandedSeries === series._id ? null : series._id);
                          if (expandedSeries !== series._id) fetchChaptersForManga(series._id);
                        }}
                        className={`flex items-center gap-2 md:gap-3 text-[8px] md:text-[10px] font-black uppercase tracking-[0.25em] transition-all ${expandedSeries === series._id ? accentText : 'text-[var(--text-dim)] hover:text-[var(--text-main)]'}`}
                      >
                        {expandedSeries === series._id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        {expandedSeries === series._id ? "Close Registry" : "Registry Management"}
                      </button>

                      <AnimatePresence>
                        {expandedSeries === series._id && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 md:mt-6 p-4 md:p-6 rounded-2xl bg-[var(--bg-primary)]/50 border border-[var(--border)] space-y-3 md:space-y-4">
                               <div className="flex items-center justify-between mb-2 px-1 md:px-2">
                                  <p className="text-[7px] md:text-[9px] font-black text-[var(--text-dim)] uppercase tracking-widest italic">Encrypted Local Index</p>
                                  <Link to="/upload" className={`text-[7px] md:text-[9px] font-black uppercase px-3 md:px-5 py-1 md:py-2 rounded-xl border border-[var(--accent)]/30 hover:bg-[var(--accent)] text-[var(--accent)] hover:text-white transition-all`}>Inject New Data</Link>
                               </div>
                               
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 max-h-60 overflow-y-auto no-scrollbar pr-1 md:pr-2">
                                 {(chaptersByManga[series._id] || []).map(chapter => (
                                   <div key={chapter._id} className="flex items-center justify-between p-2 md:p-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)]/30 transition-all group/ch">
                                      <div className="flex items-center gap-2 md:gap-3">
                                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center text-[8px] md:text-[10px] font-mono text-[var(--accent)]">#{chapter.chapterNumber}</div>
                                        <p className="text-[9px] md:text-[11px] font-bold text-[var(--text-main)] truncate max-w-[120px] md:max-w-[150px]">{chapter.title || `Chapter ${chapter.chapterNumber}`}</p>
                                      </div>
                                      <div className="flex gap-1 md:gap-2 opacity-0 group-hover/ch:opacity-100 transition-opacity">
                                        <button className="p-1 md:p-2 hover:text-[var(--accent)]"><Edit3 size={14}/></button>
                                        <button className="p-1 md:p-2 hover:text-red-500"><Trash2 size={14}/></button>
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
              <div className="py-20 md:py-32 text-center border-2 border-dashed border-[var(--border)] rounded-2xl md:rounded-3xl space-y-4 md:space-y-6">
                 <div className="p-4 md:p-8 rounded-full bg-[var(--bg-secondary)] inline-block text-[var(--text-dim)]"><AlertTriangle size={36} /></div>
                 <p className="text-[var(--text-dim)] font-black uppercase tracking-[0.35em] text-sm">No Series Synchronized</p>
                 <Link to="/create-series" className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-6 md:px-8 py-2 md:py-4 rounded-xl inline-block text-white`} style={{ backgroundColor: accentColor }}>Initiate Protocol</Link>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Reusable Sub-components
const StatItem = ({ val, label }) => (
  <div className="text-center group">
    <p className="text-[var(--text-main)] font-black text-2xl md:text-3xl italic tracking-tighter group-hover:scale-105 transition-transform">{val}</p>
    <p className="text-[7px] md:text-[8px] uppercase font-black tracking-[0.2em] text-[var(--text-dim)] mt-1">{label}</p>
  </div>
);

const ActionButton = ({ to, icon }) => (
  <Link to={to} className="p-3 md:p-4 bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-dim)] rounded-xl hover:border-[var(--accent)]/50 hover:text-[var(--text-main)] transition-all shadow hover:-translate-y-0.5">
    {icon}
  </Link>
);

export default MySeries;
