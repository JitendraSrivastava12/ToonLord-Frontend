import React, { useState, useMemo, useContext } from 'react';
import { Filter, Grid, List, ArrowUpDown, Search, Check, Play, Clock, Star, MoreVertical } from 'lucide-react';
import { AppContext } from "../UserContext"; // Path to your Master Context

const libraryData = {
  'Reading': [
    { id: 1, title: 'Demon Slayer: Kimetsu', genre: 'Action', lastUpdated: 1706000000, tag: '2 NEW', cover: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=400', progress: 125, total: 205, rating: 4.8 },
    { id: 2, title: 'Jujutsu Kaisen', genre: 'Action', lastUpdated: 1705824000, tag: null, cover: 'https://images.unsplash.com/photo-1620336655055-088d06e76600?q=80&w=400', progress: 210, total: 240, rating: 4.9 },
    { id: 3, title: 'Chainsaw Man', genre: 'Horror', lastUpdated: 1706100000, tag: 'NEW', cover: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=400', progress: 98, total: 145, rating: 4.7 },
    { id: 10, title: 'Oshi no Ko', genre: 'Drama', lastUpdated: 1706200000, tag: 'NEW', cover: 'https://images.unsplash.com/photo-1601850494422-3cf14624b0b3?q=80&w=400', progress: 45, total: 120, rating: 4.8 },
    { id: 11, title: 'Blue Lock', genre: 'Sports', lastUpdated: 1705900000, tag: 'NEW', cover: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=400', progress: 180, total: 240, rating: 4.6 }
  ],
  'Plan to Read': [
    { id: 4, title: 'Solo Leveling', genre: 'Fantasy', lastUpdated: 1705000000, tag: null, cover: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?q=80&w=400', progress: 0, total: 179, rating: 4.9 },
    { id: 5, title: 'Vagabond', genre: 'Action', lastUpdated: 1704000000, tag: null, cover: 'https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=400', progress: 0, total: 327, rating: 4.9 },
    { id: 12, title: 'Berserk', genre: 'Fantasy', lastUpdated: 1703000000, tag: 'Masterpiece', cover: 'https://images.unsplash.com/photo-1515516089376-88db1e26e9c0?q=80&w=400', progress: 0, total: 373, rating: 5.0 }
  ],
  'Completed': [
    { id: 6, title: 'Attack on Titan', genre: 'Fantasy', lastUpdated: 1600000000, tag: 'END', cover: 'https://images.unsplash.com/photo-1578632738908-4521c726f989?q=80&w=400', progress: 139, total: 139, rating: 4.8 },
    { id: 13, title: 'Haikyuu!!', genre: 'Sports', lastUpdated: 1650000000, tag: 'END', cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400', progress: 402, total: 402, rating: 4.9 }
  ]
};

const LibraryPage = () => {
  // 1. Consume the master context
  const { isRedMode } = useContext(AppContext);
  
  const [activeTab, setActiveTab] = useState('Reading');
  const [sortBy, setSortBy] = useState('updated'); 
  const [filterGenre, setFilterGenre] = useState('All');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = ['Reading', 'Plan to Read', 'Completed', 'Dropped', 'On Hold'];
  const genres = ['All', 'Action', 'Romance', 'Fantasy', 'Sports', 'Drama', 'Horror'];

  const processedList = useMemo(() => {
    let list = [...(libraryData[activeTab] || [])];
    if (searchQuery) list = list.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterGenre !== 'All') list = list.filter(item => item.genre === filterGenre);
    
    list.sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.lastUpdated - a.lastUpdated;
    });
    return list;
  }, [activeTab, sortBy, filterGenre, searchQuery]);

  // Use dynamic colors from Context
  const activeColor = isRedMode ? '#ef4444' : '#22c55e'; // Red vs Green (Synced)

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            My Library
          </h1>
          <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <span>Collection</span>
            <span className="w-1 h-1 bg-gray-700 rounded-full" />
            <span>{processedList.length} Titles Total</span>
          </div>
        </div>

        <div className="relative group w-full md:w-80">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors h-4 w-4 ${isRedMode ? 'group-focus-within:text-red-500' : 'group-focus-within:text-green-400'}`} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text" 
            placeholder="Find a series..." 
            className={`bg-[#0f111a]/50 backdrop-blur-xl text-sm text-gray-300 pl-11 pr-4 py-3 rounded-2xl border border-white/5 w-full focus:outline-none transition-all ${isRedMode ? 'focus:border-red-500/30' : 'focus:border-green-400/30'}`}
          />
        </div>
      </div>

      {/* --- NAVIGATION TABS --- */}
      <div className="flex items-center gap-4 mb-10 overflow-x-auto no-scrollbar pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap border ${
              activeTab === tab 
              ? 'bg-white/5 border-white/20 text-white shadow-xl' 
              : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
            style={activeTab === tab ? { boxShadow: `0 0 20px ${activeColor}20`, borderColor: activeColor } : {}}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* --- FILTER & SORT CONTROLS --- */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <button className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-gray-400 hover:text-white transition-all"><Grid size={18} /></button>
          <button className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-gray-400 hover:text-white transition-all"><List size={18} /></button>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSortBy(sortBy === 'updated' ? 'title' : 'updated')} 
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <ArrowUpDown size={14} /> Sort
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)} 
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all cursor-pointer"
            >
              <Filter size={14} /> {filterGenre}
            </button>

            {showFilterDropdown && (
              <div className="absolute top-12 right-0 w-48 bg-[#0a0b10] border border-white/10 rounded-2xl shadow-2xl z-50 p-2 backdrop-blur-3xl">
                {genres.map(g => (
                  <button key={g} onClick={() => {setFilterGenre(g); setShowFilterDropdown(false);}} className="flex items-center justify-between w-full px-4 py-2 text-xs font-bold rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                    {g} {filterGenre === g && <Check size={14} style={{color: activeColor}} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MANGA GRID --- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
        {processedList.map((manga) => {
          const percent = Math.round((manga.progress / manga.total) * 100);
          return (
            <div key={manga.id} className="group relative">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:border-white/20">
                <img src={manga.cover} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={manga.title} />
                
                {manga.tag && (
                  <div className={`absolute top-3 left-3 px-2 py-1 ${isRedMode ? 'bg-red-600' : 'bg-green-600'} text-[8px] font-black rounded-md shadow-xl uppercase italic tracking-tighter`}>
                    {manga.tag}
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px] flex items-center justify-center">
                   <button className="bg-white text-black p-4 rounded-full scale-50 group-hover:scale-100 transition-all duration-500 hover:scale-110 shadow-2xl cursor-pointer">
                      <Play size={20} fill="black" />
                   </button>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                   <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-1 text-[9px] font-black text-white/70">
                         <Star size={8} fill="#fbbf24" className="text-yellow-400" /> {manga.rating}
                      </div>
                      <span className="text-[9px] font-black text-white/70 tracking-tighter">{percent}%</span>
                   </div>
                   <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${percent}%`, backgroundColor: activeColor }} />
                   </div>
                </div>
              </div>

              <div className="mt-4 px-1">
                <div className="flex justify-between items-start gap-2">
                  <h3 className={`text-sm font-black truncate text-gray-200 transition-colors uppercase leading-tight tracking-tight ${isRedMode ? 'group-hover:text-red-500' : 'group-hover:text-green-400'}`}>
                    {manga.title}
                  </h3>
                  <MoreVertical size={14} className="text-gray-700 hover:text-white cursor-pointer" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Clock size={10} className="text-gray-600" />
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                    Ch. {manga.progress} <span className="text-gray-800 mx-1">/</span> {manga.total}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LibraryPage;