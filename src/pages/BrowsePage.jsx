import React, { useState, useMemo, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Star, ChevronLeft, ChevronRight, 
  SlidersHorizontal, X, Activity, Terminal
} from 'lucide-react';
import { AppContext } from "../UserContext"; 

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
      const res = await axios.get(`http://localhost:5000/api/mangas/${endpoint}`);
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
            className="lg:hidden fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[var(--accent)] text-white shadow-2xl"
          >
            <SlidersHorizontal size={20}/>
          </motion.button>
        )}
      </AnimatePresence>

      {/* OVERLAY */}
      {filtersOpen && (
        <div onClick={() => setFiltersOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden" />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:relative z-50 top-0 left-0 h-full w-72
        bg-[var(--bg-secondary)]/90 backdrop-blur-xl border-r border-white/10
        p-6 transition-transform duration-300
        ${filtersOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <header className="flex justify-between items-center mb-8">
          <div>
            <p className="text-xs tracking-widest text-[var(--accent)] flex items-center gap-2">
              <Terminal size={14}/> FILTER SYSTEM
            </p>
            <h2 className="text-lg font-black uppercase">Parameters</h2>
          </div>
          <button onClick={() => setFiltersOpen(false)} className="lg:hidden">
            <X size={18}/>
          </button>
        </header>

        <div className="space-y-7">

          {/* SEARCH */}
          <div>
            <p className="text-xs opacity-60 mb-2">Search</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={14}/>
              <input
                value={searchQuery}
                onChange={e => {setSearchQuery(e.target.value); setCurrentPage(1);}}
                placeholder="Search title or author"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-black/20 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
          </div>

          {/* SORT */}
          <div>
            <p className="text-xs opacity-60 mb-2">Sort</p>
            <div className="space-y-2">
              {sortOptions.map(opt => (
                <button key={opt}
                  onClick={()=>setSortBy(opt)}
                  className={`w-full py-2 rounded-xl text-sm transition ${
                    sortBy===opt 
                      ? "bg-[var(--accent)] text-white shadow" 
                      : "bg-black/20 hover:bg-black/30"
                  }`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* GENRES */}
          <div>
            <p className="text-xs opacity-60 mb-2">Genres</p>
            <div className="flex flex-wrap gap-2">
              {genres.map(g => (
                <button key={g}
                  onClick={()=>{setActiveGenres(prev=>prev.includes(g)?prev.filter(x=>x!==g):[...prev,g]); setCurrentPage(1);}}
                  className={`px-3 py-1.5 rounded-full text-xs transition ${
                    activeGenres.includes(g) 
                      ? "bg-[var(--accent)] text-white" 
                      : "bg-black/20 hover:bg-black/30"
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 px-4 sm:px-6 lg:px-12 py-10">

        <header className="mb-12">
          <div className="flex items-center gap-2 text-[var(--accent)] mb-2">
            <Activity size={16}/> 
            <span className="text-xs tracking-widest uppercase">Catalog Stream</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase">
            Data <span className="text-[var(--accent)]">Grid</span>
          </h1>
          <p className="text-sm opacity-60 mt-1">{filteredList.length} results</p>
        </header>

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {currentItems.map((manga, index) => (
            <motion.div key={manga._id} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}}>
              <Link to={`/manga/${manga._id}`} className="group block">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-black/20 transition group-hover:-translate-y-1 group-hover:shadow-xl">
                  <img 
                    src={manga.coverImage} 
                    alt={manga.title} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 px-2 py-0.5 rounded-full text-xs text-yellow-400 flex items-center gap-1">
                    <Star size={12} fill="currentColor"/>{manga.rating||"5.0"}
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-[var(--accent)] transition">
                    {manga.title}
                  </h3>
                  <div className="text-xs opacity-60 flex justify-between">
                    <span>{manga.status}</span>
                    <span>{manga.TotalChapter||0} ch</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages>1 && (
          <div className="flex justify-center items-center gap-6 mt-14">
            <button 
              disabled={currentPage===1} 
              onClick={()=>setCurrentPage(p=>p-1)} 
              className="p-3 rounded-full bg-black/30 disabled:opacity-30 hover:bg-black/40 transition"
            >
              <ChevronLeft size={18}/>
            </button>

            <span className="font-semibold">
              {currentPage} / {totalPages}
            </span>

            <button 
              disabled={currentPage===totalPages} 
              onClick={()=>setCurrentPage(p=>p+1)} 
              className="p-3 rounded-full bg-black/30 disabled:opacity-30 hover:bg-black/40 transition"
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
