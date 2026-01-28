import React, { useState, useMemo, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, Star, ChevronLeft, ChevronRight, 
  SlidersHorizontal, RotateCcw, X, Loader2 
} from 'lucide-react';
import { AppContext } from "../UserContext"; // Path to your Master Context

const BrowsePage = () => {
  // 1. Master Context Integration
  const { isRedMode } = useContext(AppContext);
  
  const [activeGenres, setActiveGenres] = useState([]); 
  const [sortBy, setSortBy] = useState('Newest');
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 18;
  
  // Theme syncs instantly across tabs via Context
  const themeColor = isRedMode ? '#ef4444' : '#22d3ee'; 

  const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
    'Horror', 'Isekai', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Slice of Life'
  ];

  const sortOptions = ['Newest', 'Highest Rated', 'Most Chapters', 'Most Views'];

  // 2. TanStack Query with isRedMode Dependency
  const { data: mangaList = [], isLoading } = useQuery({
    queryKey: ['catalog', isRedMode],
    queryFn: async () => {
      const endpoint = isRedMode ? 'adult' : 'general';
      const response = await axios.get(`http://localhost:5000/api/mangas/${endpoint}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });

  // 3. Filtering & Sorting
  const filteredList = useMemo(() => {
    let list = mangaList.filter(manga => {
      const mangaTags = manga.tags || manga.genres || [];
      const matchesAllGenres = activeGenres.length === 0 || 
        activeGenres.every(genre => mangaTags.includes(genre));
      
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        manga.title.toLowerCase().includes(searchLower) || 
        (manga.author && manga.author.toLowerCase().includes(searchLower));

      return matchesAllGenres && matchesSearch;
    });

    if (sortBy === 'Highest Rated') {
      list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'Newest') {
      list.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    } else if (sortBy === 'Most Chapters') {
      list.sort((a, b) => (b.TotalChapter || 0) - (a.TotalChapter || 0));
    } else if (sortBy === 'Most Views') {
      list.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    return list;
  }, [mangaList, activeGenres, searchQuery, sortBy]);

  const handleGenreToggle = (genre) => {
    setCurrentPage(1);
    setActiveGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const currentItems = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) return (
    <div className="min-h-screen bg-[#05060b] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin mb-4" size={40} style={{ color: themeColor }} />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Decrypting Registry...</p>
    </div>
  );

  return (
    <div className={`flex flex-col lg:flex-row min-h-screen bg-[#05060b] text-white transition-colors duration-500`}>
      
      {/* --- SIDEBAR FILTERS --- */}
      <aside className="w-full lg:w-80 bg-[#0a0b10] border-r border-white/5 p-6 lg:sticky lg:top-0 lg:h-screen flex flex-col shadow-2xl z-20">
        <div className="flex items-center gap-3 mb-8">
          <SlidersHorizontal size={18} style={{ color: themeColor }} />
          <h2 className="text-sm font-black uppercase tracking-[0.2em]">Filter Protocol</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-10 pr-2 no-scrollbar">
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Query Search</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 h-3 w-3" />
              <input 
                type="text" 
                placeholder="Find a title..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-[11px] focus:outline-none focus:border-white/20 transition-all"
              />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Sort Hierarchy</p>
            <div className="grid grid-cols-2 gap-2">
              {sortOptions.map(option => (
                <button
                  key={option}
                  onClick={() => setSortBy(option)}
                  className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border ${
                    sortBy === option ? 'border-transparent text-white' : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
                  }`}
                  style={sortBy === option ? { backgroundColor: themeColor } : {}}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Genre Intersection</p>
              {activeGenres.length > 0 && (
                <button onClick={() => setActiveGenres([])} className="text-[9px] text-gray-400 hover:text-white flex items-center gap-1">
                  Reset <X size={10} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {genres.map(genre => (
                <button
                  key={genre}
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${
                    activeGenres.includes(genre) 
                    ? 'text-black border-transparent' 
                    : 'bg-white/5 border-white/5 text-gray-500 hover:text-white'
                  }`}
                  style={activeGenres.includes(genre) ? { backgroundColor: themeColor } : {}}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={() => { setActiveGenres([]); setSearchQuery(""); setSortBy('Newest'); }}
          className="mt-6 w-full py-4 flex items-center justify-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
        >
          <RotateCcw size={14} /> Clear Registry
        </button>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 p-6 lg:p-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-2">
            Catalog <span className="text-gray-800 mx-2">/</span> 
            <span style={{ color: themeColor }}>
              {activeGenres.length === 0 ? 'All Series' : activeGenres.join(' + ')}
            </span>
          </h1>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
            {filteredList.length} Files Match Current Protocol
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-x-4 gap-y-10">
          {currentItems.map(manga => (
            <Link to={`/manga/${manga._id}`} key={manga._id} className="group">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 bg-[#0a0b10] transition-all duration-500 group-hover:-translate-y-2 group-hover:border-white/20 shadow-2xl">
                <img 
                   src={manga.coverImage} 
                   loading="lazy"
                   className="w-full h-full object-cover opacity-70 group-hover:opacity-100" 
                   alt={manga.title}
                />
                
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[9px] font-black text-yellow-400">
                  <Star size={10} fill="currentColor" /> {manga.rating || '0.0'}
                </div>
              </div>

              <div className="mt-4">
                <h3 className={`text-[11px] font-black truncate uppercase tracking-tight text-gray-200 transition-colors group-hover:text-cyan-400`}>
                  {manga.title}
                </h3>
                <div className="flex items-center justify-between mt-1 text-[9px] font-bold text-gray-600 uppercase">
                  <span>{manga.status}</span>
                  <span style={{ color: themeColor }}>{manga.TotalChapter || 0} Ch.</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-8 mt-20 pt-10 border-t border-white/5">
            <button 
              disabled={currentPage === 1}
              onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0,0); }}
              className="text-gray-500 hover:text-white disabled:opacity-20 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="text-[10px] font-black tracking-[0.5em] text-gray-700">{currentPage} / {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0,0); }}
              className="text-gray-500 hover:text-white disabled:opacity-20 transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BrowsePage;