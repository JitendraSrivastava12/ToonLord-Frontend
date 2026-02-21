import React, { useState, useMemo, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Star, ChevronLeft, ChevronRight, 
  SlidersHorizontal, X
} from 'lucide-react';
import { AppContext } from "../UserContext"; 

const API_URL = import.meta.env.VITE_API_URL;

const BrowsePage = () => {
  const { isRedMode, currentTheme, familyMode } = useContext(AppContext);
  const [activeGenres, setActiveGenres] = useState([]); 
  const [sortBy, setSortBy] = useState('Newest');
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showFilterBtn, setShowFilterBtn] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY && currentScrollY > 100) setShowFilterBtn(true);
      else if (currentScrollY > lastScrollY) setShowFilterBtn(false);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const itemsPerPage = 20;
  const genres = ['Action','Adventure','Comedy','Drama','Fantasy','Horror','Isekai','Mystery','Romance','Sci-Fi','Thriller','Slice of Life'];
  const sortOptions = ['Newest','Highest Rated','Most Chapters','Most Views'];

  const { data: mangaList = [] } = useQuery({
    queryKey: ['catalog', isRedMode, familyMode],
    queryFn: async () => {
      const endpoint = isRedMode ? 'adult' : 'general';
      const res = await axios.get(`${API_URL}/api/mangas/${endpoint}`);
      return res.data;
    }
  });

  const filteredList = useMemo(() => {
    let list = mangaList.filter(manga => {
      if (familyMode && manga.rating_type === '18+') return false;
      const tags = manga.tags || manga.genres || [];
      const matchesGenres = activeGenres.length === 0 || activeGenres.every(g => tags.includes(g));
      const q = searchQuery.toLowerCase();
      return matchesGenres && (
        manga.title.toLowerCase().includes(q) ||
        manga.author?.toLowerCase().includes(q)
      );
    });

    const sorters = {
      'Highest Rated': (a,b) => (b.rating||0)-(a.rating||0),
      'Newest': (a,b) => new Date(b.createdAt)-new Date(a.createdAt),
      'Most Chapters': (a,b) => (b.TotalChapter||0)-(a.TotalChapter||0),
      'Most Views': (a,b) => (b.views||0)-(a.views||0),
    };
    return list.sort(sorters[sortBy]);
  }, [mangaList, activeGenres, searchQuery, sortBy, familyMode]);

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const currentItems = filteredList.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  return (
    <div className={`flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] theme-${currentTheme}`}>

      {/* MOBILE FILTER BUTTON */}
      <AnimatePresence>
        {showFilterBtn && (
          <motion.button
            onClick={() => setFiltersOpen(true)}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="lg:hidden fixed bottom-6 right-6 z-50 p-4 md:p-4 rounded-2xl bg-[var(--accent)] text-white shadow-lg"
          >
            <SlidersHorizontal size={20}/>
          </motion.button>
        )}
      </AnimatePresence>

      {/* OVERLAY */}
      {filtersOpen && (
        <div onClick={() => setFiltersOpen(false)} className="fixed inset-0 bg-black/40 z-40 lg:hidden" />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:relative z-50 top-0 left-0 h-full w-72 
        bg-[var(--bg-secondary)]/95 backdrop-blur border-r border-[var(--border)]
        px-6 pt-20 md:pt-6 transition-transform duration-300
        ${filtersOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <header className="flex justify-between items-center mb-8">
          <div>
            <p className="text-xs text-[var(--text-dim)] mb-1">Filters</p>
            <h2 className="text-lg font-semibold">Browse options</h2>
          </div>
          <button onClick={() => setFiltersOpen(false)} className="lg:hidden">
            <X size={18}/>
          </button>
        </header>

        <div className="space-y-7">
          {/* SEARCH */}
          <div>
            <p className="text-xs text-[var(--text-dim)] mb-2">Search</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={14}/>
              <input
                value={searchQuery}
                onChange={e => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                placeholder="Search series..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          {/* SORT */}
          <div>
            <p className="text-xs text-[var(--text-dim)] mb-2">Sort by</p>
            <div className="grid grid-cols-2 gap-2">
              {sortOptions.map(opt => (
                <button key={opt}
                  onClick={()=>setSortBy(opt)}
                  className={`py-2 rounded-xl text-xs transition ${
                    sortBy===opt 
                      ? "bg-[var(--accent)] text-white" 
                      : "bg-[var(--bg-primary)] border border-[var(--border)]"
                  }`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* GENRES */}
          <div>
            <p className="text-xs text-[var(--text-dim)] mb-2">Genres</p>
            <div className="flex flex-wrap gap-2">
              {genres.map(g => (
                <button key={g}
                  onClick={()=>{setActiveGenres(prev=>prev.includes(g)?prev.filter(x=>x!==g):[...prev,g]); setCurrentPage(1);}}
                  className={`px-3 py-1.5 rounded-full text-xs transition ${
                    activeGenres.includes(g) 
                      ? "bg-[var(--accent)] text-white" 
                      : "bg-[var(--bg-primary)] border border-[var(--border)]"
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      {/* Changed px-4 to px-0 on mobile */}
      <main className="flex-1 px-0 sm:px-4 lg:px-12 py-4 md:py-10 overflow-x-hidden">

        {/* Header - Added px-4/6 back specifically for text */}
        <header className="mb-8 px-4 sm:px-0">
          <p className="text-xs text-[var(--accent)] font-medium uppercase tracking-wider mb-1">
            Browse library
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold">
            All series
          </h1>
          <p className="text-sm text-[var(--text-dim)] mt-1">
            {filteredList.length} results found
          </p>
        </header>

        {/* GRID: gap-1 on mobile for tight edge-to-edge look */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-1 sm:gap-6">
          {currentItems.map((manga) => (
            <motion.div key={manga._id} initial={{opacity:0}} animate={{opacity:1}}>
              <Link to={`/manga/${manga._id}`} className="group block">
                {/* Removed rounded-xl on mobile with rounded-none */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[var(--bg-secondary)] sm:rounded-xl sm:border border-[var(--border)] transition group-hover:shadow-lg">
                  <img 
                    src={manga.coverImage} 
                    alt={manga.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] text-yellow-400 flex items-center gap-1">
                    <Star size={10} fill="currentColor"/>{manga.rating||"5.0"}
                  </div>
                  
                  {/* Mobile Title Overlay (Optional - since titles are below, but looks better for edge-to-edge) */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <p className="text-white text-xs font-medium line-clamp-1 sm:hidden">
                       {manga.title}
                    </p>
                  </div>
                </div>
                
                {/* Desktop/Tablet metadata (Hidden on very tight mobile or keep for clarity) */}
                <div className="mt-2 px-3 pb-4 sm:px-0">
                  <h3 className="text-sm font-medium line-clamp-1 hidden sm:block group-hover:text-[var(--accent)] transition">
                    {manga.title}
                  </h3>
                  <div className="text-[10px] uppercase tracking-tighter text-[var(--text-dim)] flex justify-between">
                    <span>{manga.status}</span>
                    <span>{manga.TotalChapter||0} Chapters</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages>1 && (
          <div className="flex justify-center items-center gap-6 mt-14 pb-12">
            <button 
              disabled={currentPage===1} 
              onClick={()=>setCurrentPage(p=>p-1)} 
              className="p-3 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] disabled:opacity-30"
            >
              <ChevronLeft size={18}/>
            </button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              disabled={currentPage===totalPages} 
              onClick={()=>setCurrentPage(p=>p+1)} 
              className="p-3 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] disabled:opacity-30"
            >
              <ChevronRight size={18}/>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BrowsePage;