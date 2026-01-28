import React, { useContext } from 'react'; // 1. Added useContext
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Star, Zap, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { AppContext } from "../UserContext"; // 2. Import your Master Context

const MangaGrid = ({ category }) => {
  // 3. Consume Master Context instead of Outlet
  const { isRedMode } = useContext(AppContext);

  // Optimized Fetch Function
  const fetchManga = async (mode) => {
    const endpoint = mode ? 'adult' : 'general';
    const response = await axios.get(`http://localhost:5000/api/mangas/${endpoint}`);
    return response.data;
  };

  // React Query Engine
  const { data: mangas, isLoading } = useQuery({
    queryKey: ['mangaList', isRedMode], // Re-fetches when mode changes across tabs
    queryFn: () => fetchManga(isRedMode),
    staleTime: 1000 * 60 * 30, 
  });

  // In-Memory Sorting & Filtering
  const mangaDisplay = React.useMemo(() => {
    if (!mangas) return [];
    let filtered = [...mangas];
    
    if (category === 'trending') {
      filtered = filtered.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 12);
    } else if (category === 'top-rated') {
      filtered = filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 12);
    }
    return filtered;
  }, [mangas, category]);

  if (isLoading) return (
    <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
      <Loader2 className={`animate-spin ${isRedMode ? 'text-red-500' : 'text-cyan-500'}`} size={32} />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 italic">Synchronizing Crystal Cache...</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6 px-4 lg:px-10">
      {mangaDisplay.map((manga) => (
        <Link 
          to={`/manga/${manga._id}`} 
          key={manga._id} 
          className="relative group overflow-hidden rounded-xl bg-[#0f111a] border border-white/5 transition-all hover:scale-[1.02] shadow-2xl"
        >
          <div className="aspect-[2/3] relative overflow-hidden bg-gray-900">
            <img 
              src={manga.coverImage} 
              alt={manga.title} 
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            
            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
              {manga.TotalChapter > 10 ? (
                <span className={`px-2 py-1 text-[10px] font-black rounded-md flex items-center gap-1 backdrop-blur-md border border-white/10 transition-colors duration-500 ${
                  isRedMode ? 'bg-red-800/40 text-red-300 border-red-500/20' : 'bg-cyan-800/40 text-cyan-300 border-cyan-500/20'
                }`}>
                  <Zap size={10} fill="currentColor" /> PREMIUM
                </span>
              ) : (
                <span className={`px-2 py-1 text-white text-[10px] font-black rounded-md uppercase ${isRedMode ? 'bg-red-600' : 'bg-green-600'}`}>
                  Free
                </span>
              )}
            </div>
          </div>

          <div className="p-4">
            <h3 className={`text-sm font-bold truncate text-gray-100 transition-colors uppercase tracking-tight ${
              isRedMode ? 'group-hover:text-red-400' : 'group-hover:text-cyan-400'
            }`}>
              {manga.title}
            </h3>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5 italic truncate">{manga.author || 'ToonLord Creator'}</p>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1">
                <Star size={12} fill="#fbbf24" className="text-yellow-400" />
                <span className="text-xs text-gray-400 font-bold">{manga.rating || '0.0'}</span>
              </div>
              <span className="text-[10px] text-gray-600 font-bold uppercase">{manga.TotalChapter || 0} Ch.</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default MangaGrid;