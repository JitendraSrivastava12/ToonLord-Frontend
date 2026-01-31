import React, { useState, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, Grid, List, ArrowUpDown, Search, Check, Play, 
  Star, ShieldAlert, Baby, Orbit, MoreVertical, BookOpen 
} from 'lucide-react';
import { AppContext } from "../UserContext";

const LibraryPage = () => {
  const { isRedMode, currentTheme, familyMode } = useContext(AppContext);
  
  const [activeTab, setActiveTab] = useState('Reading');
  const [sortBy, setSortBy] = useState('updated'); 
  const [filterGenre, setFilterGenre] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const tabs = ['Reading', 'Plan to Read', 'Completed', 'Dropped', 'On Hold'];
  const genres = ['All', 'Action', 'Romance', 'Fantasy', 'Sports', 'Drama', 'Horror'];

  const libraryData = {
    'Reading': [
      { id: 1, title: "SOLO LEVELING", progress: 170, total: 200, rating: 9.8, cover: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop", lastUpdated: Date.now(), genre: 'Action', tag: 'HOT' },
      { id: 2, title: "TOWER OF GOD", progress: 450, total: 550, rating: 9.2, cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1968&auto=format&fit=crop", lastUpdated: Date.now() - 10000, genre: 'Fantasy' }
    ],
    'Completed': [],
    'Plan to Read': [],
    'Dropped': [],
    'On Hold': []
  };

  const isLight = currentTheme === 'light';
  const activeAccent = isRedMode ? '#ef4444' : (isLight ? '#2563eb' : '#3b82f6');

  const processedList = useMemo(() => {
    let list = [...(libraryData[activeTab] || [])];
    if (familyMode) list = list.filter(m => m.rating_type !== '18+');
    if (searchQuery) list = list.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterGenre !== 'All') list = list.filter(item => item.genre === filterGenre);
    
    list.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.lastUpdated - a.lastUpdated;
    });
    return list;
  }, [activeTab, sortBy, filterGenre, searchQuery, familyMode]);

  return (
    <div className={`min-h-screen transition-all duration-500 pt-40 pb-20 px-4 sm:px-8 lg:px-12 max-w-[1600px] mx-auto ${isLight ? 'bg-slate-50' : 'bg-[#050505]'}`}>
      
      {/* 1. HERO HEADER */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="w-8 h-[2px]" style={{ backgroundColor: activeAccent }} />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Personal Collection</span>
          </div>
          <h1 className={`text-5xl sm:text-7xl font-black tracking-tighter uppercase italic leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Library
          </h1>
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-40">
            {processedList.length} Items found in database
          </p>
        </div>

        {/* Dynamic Search Bar */}
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" size={18} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your collection..."
            className={`w-full py-4 pl-14 pr-6 rounded-2xl border text-sm font-bold transition-all outline-none
              ${isLight ? 'bg-white border-slate-200 focus:ring-4 focus:ring-blue-500/10' : 'bg-white/5 border-white/10 focus:bg-white/10'}`}
          />
        </div>
      </header>

      {/* 2. NAVIGATION & TABS */}
      <div className="mb-10 overflow-x-auto no-scrollbar pb-2">
        <div className="flex items-center gap-2 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all
                ${activeTab === tab 
                  ? 'text-white shadow-xl' 
                  : `${isLight ? 'text-slate-400 hover:bg-slate-200' : 'text-white/40 hover:bg-white/5'}`}`}
              style={activeTab === tab ? { backgroundColor: activeAccent, boxShadow: `0 10px 25px ${activeAccent}44` } : {}}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 3. TOOLBAR (Filters & View Toggles) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-white/5">
        <div className="flex items-center gap-2">
           <ViewToggle icon={<Grid size={18} />} active={viewMode === 'grid'} onClick={() => setViewMode('grid')} isLight={isLight} />
           <ViewToggle icon={<List size={18} />} active={viewMode === 'list'} onClick={() => setViewMode('list')} isLight={isLight} />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <FilterPill 
            label={`Sort: ${sortBy}`} 
            onClick={() => setSortBy(sortBy === 'updated' ? 'title' : 'updated')} 
            isLight={isLight} 
          />
          <div className="relative">
            <FilterPill 
              label={`Genre: ${filterGenre}`} 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)} 
              isLight={isLight} 
            />
            <AnimatePresence>
              {showFilterDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className={`absolute right-0 top-full mt-2 w-48 rounded-2xl border z-50 p-2 shadow-2xl backdrop-blur-xl ${isLight ? 'bg-white border-slate-200' : 'bg-[#121212] border-white/10'}`}
                >
                  {genres.map(g => (
                    <button 
                      key={g} 
                      onClick={() => {setFilterGenre(g); setShowFilterDropdown(false);}}
                      className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase rounded-lg transition-colors ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'}`}
                    >
                      {g}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 4. CONTENT GRID */}
      {processedList.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 sm:gap-8" 
          : "flex flex-col gap-4"}>
          
          {processedList.map((item, index) => (
            <LibraryCard 
              key={item.id} 
              item={item} 
              index={index} 
              isLight={isLight} 
              activeAccent={activeAccent} 
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className={`py-32 flex flex-col items-center justify-center text-center rounded-[3rem] border-2 border-dashed ${isLight ? 'bg-white border-slate-200' : 'bg-white/[0.02] border-white/5'}`}>
          <div className="p-8 rounded-full bg-white/5 mb-6"><BookOpen size={48} className="opacity-20" /></div>
          <h2 className="text-2xl font-black uppercase tracking-widest opacity-80 mb-2">No Records Found</h2>
          <p className="text-xs opacity-40 font-bold mb-8">Your {activeTab} archive is currently empty.</p>
          <button className="px-8 py-3 rounded-xl text-white font-black text-[10px] uppercase tracking-[0.2em]" style={{ backgroundColor: activeAccent }}>Browse Content</button>
        </div>
      )}
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const ViewToggle = ({ icon, active, onClick, isLight }) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-xl border transition-all ${active 
      ? (isLight ? 'bg-white border-slate-300 shadow-md' : 'bg-white/10 border-white/20 text-white') 
      : (isLight ? 'border-transparent text-slate-400' : 'border-transparent text-white/20')}`}
  >
    {icon}
  </button>
);

const FilterPill = ({ label, onClick, isLight }) => (
  <button 
    onClick={onClick}
    className={`flex-1 sm:flex-none px-6 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
      ${isLight ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-400' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'}`}
  >
    {label}
  </button>
);

const LibraryCard = ({ item, index, isLight, activeAccent, viewMode }) => {
  const percent = Math.round((item.progress / item.total) * 100);

  if (viewMode === 'list') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
        className={`flex items-center gap-6 p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200 hover:shadow-lg' : 'bg-white/5 border-white/5 hover:bg-white/[0.08]'} transition-all group`}
      >
        <div className="w-16 h-20 rounded-xl overflow-hidden shrink-0">
          <img src={item.cover} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="flex-1 min-w-0">
           <h3 className="font-black text-sm uppercase truncate mb-1">{item.title}</h3>
           <div className="flex items-center gap-4 text-[10px] font-bold opacity-40 uppercase">
             <span>Ch. {item.progress} / {item.total}</span>
             <span className="hidden sm:inline">•</span>
             <span className="hidden sm:inline">{item.genre}</span>
           </div>
        </div>
        <div className="hidden md:flex flex-col items-end gap-1">
           <span className="text-[10px] font-black opacity-40">{percent}% Complete</span>
           <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
             <div className="h-full" style={{ width: `${percent}%`, backgroundColor: activeAccent }} />
           </div>
        </div>
        <button className="p-3 opacity-20 group-hover:opacity-100 transition-opacity"><Play size={18} fill="currentColor" /></button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
      className="group cursor-pointer"
    >
      <div className={`relative aspect-[3/4.5] rounded-[2rem] overflow-hidden border transition-all duration-500 group-hover:-translate-y-3
        ${isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/10 shadow-2xl'}`}
      >
        <img src={item.cover} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.title} />
        
        {/* Overlay HUD */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10">
          <Star size={10} fill="#fbbf24" className="text-yellow-400" />
          <span className="text-[10px] font-black text-white">{item.rating}</span>
        </div>

        {/* Action Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
           <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-black shadow-2xl scale-50 group-hover:scale-100 transition-all duration-500">
              <Play size={24} fill="black" />
           </div>
        </div>

        {/* Progress Bar HUD */}
        <div className="absolute bottom-5 left-5 right-5">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[9px] font-black text-white uppercase tracking-widest">{percent}% SYNC</span>
          </div>
          <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${percent}%` }}
              className="h-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" 
              style={{ backgroundColor: activeAccent }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 px-1">
        <h3 className="text-xs font-black uppercase truncate tracking-tight mb-1 group-hover:text-blue-500 transition-colors">
          {item.title}
        </h3>
        <div className="flex justify-between items-center opacity-40">
           <span className="text-[10px] font-bold uppercase tracking-widest">Chapter {item.progress}</span>
           <MoreVertical size={14} className="hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </motion.div>
  );
};

export default LibraryPage;