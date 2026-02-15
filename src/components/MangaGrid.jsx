import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Zap, Loader2, ShieldAlert, Baby, Orbit, Lock } from 'lucide-react';
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
      filtered = [...filtered].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 12);
    } else if (category === 'top-rated') {
      filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 12);
    }

    return filtered;
  }, [mangas, category, familyMode]);

  if (isLoading) return (
    <div className="py-24 flex flex-col items-center justify-center gap-4">
      <Loader2 className={`animate-spin ${isRedMode ? 'text-red-500' : 'text-[var(--accent)]'}`} size={40} />
      <p className="text-xs tracking-widest text-[var(--text-dim)] uppercase">
        Loading Library...
      </p>
    </div>
  );

  return (
    <div className={`theme-${currentTheme}`}>
      <div className={className}>
        <AnimatePresence>
          {mangaDisplay.map((manga, index) => (
            <motion.div
              key={manga._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: index * 0.04, duration: 0.4 }}
              className={itemClassName}
            >
              <Link
                to={`/manga/${manga._id}`}
                className="group h-full flex flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]/30 backdrop-blur overflow-hidden transition hover:-translate-y-1 hover:shadow-xl hover:border-[var(--accent)]/40"
              >
                {/* IMAGE */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={manga.coverImage}
                    alt={manga.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* BADGE */}
                  {manga.isPremium ? (
                    <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 shadow ${
                      isRedMode ? 'bg-red-600 text-white' : 'bg-[var(--accent)] text-white'
                    }`}>
                      <Zap size={11} />
                      {manga.price > 0 ? `${manga.price} COINS` : 'VIP'}
                    </div>
                  ) : (
                    <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/60 text-white text-[10px] font-semibold rounded-full">
                      Free
                    </div>
                  )}

                  {/* RATING */}
                  <div className="absolute top-2 right-2 bg-black/70 px-2 py-0.5 rounded-full text-[11px] text-yellow-400 flex gap-1 items-center">
                    <Star size={11} fill="currentColor" />
                    {manga.rating?.toFixed(1) || '5.0'}
                  </div>

                  {/* LOCK OVERLAY */}
                  {manga.isPremium && (
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <div className="p-2 rounded-full bg-black/50 text-white">
                        <Lock size={16} />
                      </div>
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="p-3 flex flex-col gap-1">
                  <h3 className="text-sm sm:text-base font-semibold line-clamp-2 text-[var(--text-main)] group-hover:text-[var(--accent)] transition">
                    {manga.title}
                  </h3>
                  <div className="text-xs text-[var(--text-dim)] flex justify-between">
                    <span className="capitalize">{manga.status || 'ongoing'}</span>
                    <span>{manga.TotalChapter || 0} ch</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* EMPTY */}
        {mangaDisplay.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-32 text-center space-y-4"
          >
            <div className="inline-flex p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-dim)]">
              {familyMode ? <Baby size={40} /> : <ShieldAlert size={40} />}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-main)]">
                Nothing available
              </p>
              <p className="text-xs text-[var(--text-dim)]">
                No {category} content found
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MangaGrid;
