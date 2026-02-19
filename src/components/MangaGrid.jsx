import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Zap, Loader2, ShieldAlert, Baby, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from "../UserContext";

const API_URL = import.meta.env.VITE_API_URL;

const MangaGrid = ({ category, className = "", itemClassName = "" }) => {
  const { isRedMode, familyMode, currentTheme } = useContext(AppContext);

  const fetchManga = async (redMode) => {
    const endpoint = redMode ? 'adult' : 'general';
    const response = await axios.get(`${API_URL}/api/mangas/${endpoint}`);
    return response.data;
  };

  const { data: mangas, isLoading } = useQuery({
    queryKey: ['mangaList', isRedMode, familyMode],
    queryFn: () => fetchManga(isRedMode),
    staleTime: 1000 * 60 * 30,
  });

  const mangaDisplay = useMemo(() => {
    if (!mangas) return [];
    let filtered = mangas.filter(m => (familyMode ? m.rating_type !== '18+' : true));

    if (category === 'premium') {
      filtered = filtered.filter(m => m.isPremium === true);
    } else if (category === 'trending') {
      filtered = [...filtered].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
    } else if (category === 'top-rated') {
      filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
    }
    return filtered;
  }, [mangas, category, familyMode]);

  if (isLoading) return (
    <div className="py-24 flex flex-col items-center justify-center gap-4">
      <Loader2 className={`animate-spin ${isRedMode ? 'text-red-500' : 'text-[var(--accent)]'}`} size={40} />
      <p className="text-[10px] font-black tracking-[0.3em] text-[var(--text-dim)] uppercase">Initializing_Library...</p>
    </div>
  );

  return (
    <div className={`theme-${currentTheme}`}>
      {/* BALANCED GRID LOGIC:
          - Mobile: 2 columns (grid-cols-2)
          - Tablet (md): 3 columns (md:grid-cols-3)
          - Laptop (lg): 4 columns (lg:grid-cols-4)
          - Desktop (xl): 5 columns (xl:grid-cols-5)
      */}
      <div className={`${className} grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6`}>
        <AnimatePresence>
          {mangaDisplay.map((manga, index) => (
            <motion.div
              key={manga._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              className={itemClassName}
            >
              <Link
                to={`/manga/${manga._id}`}
                className="group relative block h-full rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-[var(--accent)]/50"
              >
                {/* BALANCED COVER IMAGE:
                    - aspect-[2/3] ensures the image doesn't look stretched or squashed.
                */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[var(--bg-primary)]">
                  <img
                    src={manga.coverImage}
                    alt={manga.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* PREMIUM/FREE BADGE */}
                  <div className="absolute top-2 left-2 z-10">
                    {manga.isPremium ? (
                      <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter flex items-center gap-1 shadow-lg ${
                        isRedMode ? 'bg-red-600 text-white' : 'bg-[var(--accent)] text-white'
                      }`}>
                        <Zap size={10} fill="currentColor" />
                        {manga.price > 0 ? manga.price : 'VIP'}
                      </div>
                    ) : (
                      <div className="px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-tighter rounded-lg border border-white/10">
                        Free
                      </div>
                    )}
                  </div>

                  {/* RATING OVERLAY */}
                  <div className="absolute top-2 right-2 z-10 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] font-black text-yellow-400 flex gap-1 items-center border border-white/5">
                    <Star size={10} fill="currentColor" />
                    {manga.rating?.toFixed(1) || '5.0'}
                  </div>
                  
                  {/* MOBILE-ONLY GRADIENT FOR TITLE READABILITY */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent md:hidden" />
                </div>

                {/* INFO SECTION */}
                <div className="p-3 md:p-4">
                  <h3 className="text-xs md:text-sm font-black uppercase italic tracking-tighter line-clamp-1 text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">
                    {manga.title}
                  </h3>
                  
                  <div className="mt-1.5 flex justify-between items-center opacity-60">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-dim)]">
                      {manga.TotalChapter || 0} CH
                    </span>
                    <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-[var(--text-main)]/5 text-[var(--text-dim)] border border-[var(--border)]">
                      {manga.status || 'Ongoing'}
                    </span>
                  </div>
                </div>

                {/* LOCK ICON HOVER */}
                {manga.isPremium && (
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="p-3 rounded-full bg-black/60 text-white border border-white/20 scale-75 group-hover:scale-100 transition-transform duration-500">
                      <Lock size={20} />
                    </div>
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* EMPTY STATE */}
      {mangaDisplay.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-32 text-center space-y-4">
          <div className="inline-flex p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-dim)]">
            {familyMode ? <Baby size={40} /> : <ShieldAlert size={40} />}
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-[var(--text-dim)]">No content found in this sector</p>
        </motion.div>
      )}
    </div>
  );
};

export default MangaGrid;