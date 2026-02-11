import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Zap, Loader2, ShieldAlert, Baby, Orbit, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from "../UserContext";

const MangaGrid = ({ category }) => {
  const { isRedMode, familyMode, currentTheme } = useContext(AppContext);

  // --- DATA FETCHING ---
  const fetchManga = async (redMode) => {
    const endpoint = redMode ? 'adult' : 'general';
    const response = await axios.get(`http://localhost:5000/api/mangas/${endpoint}`);
    return response.data;
  };

  const { data: mangas, isLoading } = useQuery({
    queryKey: ['mangaList', isRedMode, familyMode],
    queryFn: () => fetchManga(isRedMode),
    staleTime: 1000 * 60 * 30,
  });

  // --- FILTER & SORT LOGIC ---
  const mangaDisplay = useMemo(() => {
    if (!mangas) return [];
    
    // 1. Base Family Mode Filter
    let filtered = mangas.filter(m => (familyMode ? m.rating_type !== '18+' : true));

    // 2. Category Specific Logic
    if (category === 'premium') {
      // STRICT FILTER: Only show mangas marked as premium
      filtered = filtered.filter(m => m.isPremium === true);
    } else if (category === 'trending') {
      filtered = [...filtered].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 12);
    } else if (category === 'top-rated') {
      filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 12);
    }
    
    return filtered;
  }, [mangas, category, familyMode]);

  if (isLoading) return (
    <div className="py-32 flex flex-col items-center justify-center gap-6">
      <div className="relative flex items-center justify-center">
        <Loader2 className={`animate-spin ${isRedMode ? 'text-red-500' : 'text-[var(--accent)]'}`} size={48} />
        <div className={`absolute inset-0 blur-2xl opacity-20 animate-pulse ${isRedMode ? 'bg-red-600' : 'bg-[var(--accent)]'}`} />
        <Orbit className="absolute text-[var(--text-dim)]/10 animate-spin-slow" size={80} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-dim)] animate-pulse">
        Retrieving Archives...
      </p>
    </div>
  );

  return (
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 px-4 sm:px-6 pb-24 theme-${currentTheme}`}>
      <AnimatePresence>
        {mangaDisplay.map((manga, index) => (
          <motion.div
            key={manga._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
          >
            <Link
              to={`/manga/${manga._id}`}
              className="group relative flex flex-col bg-[var(--bg-secondary)]/30 backdrop-blur-md rounded-2xl border border-[var(--border)] overflow-hidden transition-all duration-500 hover:border-[var(--accent)]/50 hover:shadow-2xl hover:-translate-y-2"
            >
              {/* IMAGE */}
              <div className="relative aspect-[3/4.2] overflow-hidden rounded-t-2xl">
                <img
                  src={manga.coverImage}
                  alt={manga.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* PREMIUM / COIN / FREE BADGE */}
                {manga.isPremium ? (
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 shadow-lg ${
                    isRedMode ? 'bg-red-600 text-white' : 'bg-[var(--accent)] text-white'
                  }`}>
                    <Zap size={12} fill="currentColor" /> 
                    {manga.price > 0 ? `${manga.price} COINS` : 'VIP'}
                  </div>
                ) : (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-black rounded-full uppercase tracking-widest border border-white/5">
                    Free
                  </div>
                )}

                {/* RATING */}
                <div className="absolute top-3 right-3 bg-black/70 px-2 py-0.5 rounded-full text-xs text-yellow-400 flex gap-1 items-center">
                  <Star size={12} fill="currentColor"/> {manga.rating?.toFixed(1)||'5.0'}
                </div>

                {/* OVERLAY FOR PREMIUM (Optional visual polish) */}
                {manga.isPremium && (
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white">
                            <Lock size={20} />
                        </div>
                    </div>
                )}
              </div>

              {/* DATA */}
              <div className="px-4 py-3 flex flex-col gap-1">
                <h3 className="text-lg font-black line-clamp-2 text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">
                  {manga.title}
                </h3>
                <div className="text-sm opacity-60 flex justify-between font-medium">
                  <span className="capitalize">{manga.status||'ongoing'}</span>
                  <span>{manga.TotalChapter||0} ch</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* EMPTY STATE */}
      {mangaDisplay.length === 0 && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="col-span-full py-40 text-center space-y-6">
          <div className="inline-flex p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-dim)]">
            {familyMode ? <Baby size={48} className="animate-bounce"/> : <ShieldAlert size={48} className="animate-pulse"/>}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black uppercase tracking-[0.5em] text-[var(--text-main)]">Access Restricted</p>
            <p className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-widest">No {category} transmissions found in this sector.</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MangaGrid;