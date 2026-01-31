import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Home, Settings, Loader2, Maximize2, 
  ShieldCheck, ArrowUp, Keyboard, MousePointer2 
} from 'lucide-react';
import { AppContext } from "../UserContext";

const MangaReader = () => {
  const { id, chapterNum } = useParams();
  const navigate = useNavigate();
  const { currentTheme, isRedMode, userToken } = useContext(AppContext);
  
  const [chapterData, setChapterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHudVisible, setIsHudVisible] = useState(true);
  const [readingMode, setReadingMode] = useState('webtoon');

  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // --- PROGRESS TRACKING ---
  // When user reaches 90% of the page, update the backend library
  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      if (v > 0.9 && chapterData) {
        updateProgress();
      }
    });
  }, [scrollYProgress, chapterData]);

  const updateProgress = async () => {
    if (!userToken) return;
    try {
      await axios.post('http://localhost:5000/api/library/update', {
        mangaId: id,
        progress: parseInt(chapterNum),
        mangaTitle: chapterData?.mangaTitle
      }, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
    } catch (err) {
      console.warn("Progress sync failed");
    }
  };

  // --- HUD LOGIC ---
  useEffect(() => {
    return scrollY.on("change", (latest) => {
      const previous = scrollY.getPrevious();
      if (latest > previous && latest > 150) setIsHudVisible(false);
      else setIsHudVisible(true);
    });
  }, [scrollY]);

  // --- DATA FETCHING & PREFETCHING ---
  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        // Added Authorization header to prevent Handshake failure
        const res = await axios.get(`http://localhost:5000/api/chapters/${id}/index/${chapterNum}`, {
          headers: userToken ? { Authorization: `Bearer ${userToken}` } : {}
        });
        setChapterData(res.data);
        
        // Prefetch next chapter images after a small delay
        if (parseInt(chapterNum) < res.data.totalChapters) {
           setTimeout(() => prefetchNext(parseInt(chapterNum) + 1), 3000);
        }
      } catch (err) { 
        console.error("Handshake Protocol Failed:", err);
        setChapterData(null); 
      } 
      finally { setLoading(false); }
    };

    const prefetchNext = async (nextNum) => {
       try {
         const res = await axios.get(`http://localhost:5000/api/chapters/${id}/index/${nextNum}`);
         res.data.pages.forEach(src => {
           const img = new Image();
           img.src = src;
         });
       } catch (e) {}
    };

    fetchChapter();
    window.scrollTo(0, 0); 
  }, [id, chapterNum, userToken]);

  // --- KEYBOARD NAV ---
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight' && parseInt(chapterNum) < chapterData?.totalChapters) 
      navigate(`/manga/${id}/${parseInt(chapterNum) + 1}`);
    if (e.key === 'ArrowLeft' && parseInt(chapterNum) > 1) 
      navigate(`/manga/${id}/${parseInt(chapterNum) - 1}`);
  }, [id, chapterNum, navigate, chapterData]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const accentColor = isRedMode ? '#ef4444' : 'var(--accent)';
  const accentClass = isRedMode ? 'text-red-500' : 'text-[var(--accent)]';

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <Loader2 className={`animate-spin ${accentClass}`} size={64} />
        <div className={`absolute inset-0 blur-3xl opacity-30 animate-pulse ${isRedMode ? 'bg-red-600' : 'bg-[var(--accent)]'}`} />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.8em] text-[var(--text-dim)]">Syncing Archive_{chapterNum}</p>
    </div>
  );

  return (
    <div className={`min-h-screen bg-[#050505] text-[var(--text-main)] theme-${currentTheme} transition-colors duration-700`}>
      
      {/* HUD & PROGRESS BAR */}
      <AnimatePresence>
        {isHudVisible && (
          <motion.nav 
            initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-[60] bg-[var(--bg-primary)]/80 backdrop-blur-3xl border-b border-[var(--border)] p-4"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Link to={`/manga/${id}`} className="p-2 hover:bg-[var(--bg-secondary)] rounded-xl transition-all">
                  <ChevronLeft className={accentClass} />
                </Link>
                <div>
                  <h1 className="text-xs font-black uppercase tracking-widest line-clamp-1 max-w-[200px]">{chapterData?.mangaTitle}</h1>
                  <p className="text-[9px] font-bold text-[var(--text-dim)] uppercase tracking-tighter mt-1">
                    INDEX: <span className={accentClass}>{chapterNum}</span> / {chapterData?.totalChapters}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <select 
                  value={chapterNum}
                  onChange={(e) => navigate(`/manga/${id}/${e.target.value}`)}
                  className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl px-4 py-2 text-[11px] font-black focus:outline-none"
                >
                  {[...Array(chapterData?.totalChapters || 0)].map((_, i) => (
                    <option key={i+1} value={i+1}>CH. {i+1}</option>
                  ))}
                </select>
                <button className="hidden sm:block p-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl hover:border-[var(--accent)]/50 transition-all">
                  <Settings size={16} className="text-[var(--text-dim)]" />
                </button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <motion.div className="fixed top-0 left-0 right-0 h-1 z-[70] origin-left" style={{ scaleX, backgroundColor: accentColor }} />

      {/* MAIN CONTENT */}
      <main className={`mx-auto transition-all duration-500 pt-24 pb-10 ${readingMode === 'webtoon' ? 'max-w-3xl' : 'max-w-6xl'}`}>
        {chapterData?.pages?.length > 0 ? (
          <div className="flex flex-col items-center">
            {chapterData.pages.map((imgUrl, index) => (
              <img 
                key={index} src={imgUrl} alt={`Page ${index + 1}`}
                loading={index < 3 ? "eager" : "lazy"} // Eager load first 3 pages
                className="w-full h-auto select-none"
                onContextMenu={(e) => e.preventDefault()} 
              />
            ))}
          </div>
        ) : (
          <div className="py-60 text-center space-y-6">
            <ShieldCheck size={48} className="mx-auto text-red-500 opacity-50 animate-pulse" />
            <p className="text-[var(--text-dim)] uppercase font-black text-[10px] tracking-[0.4em]">Handshake Protocol Failed</p>
            <button onClick={() => window.location.reload()} className={`text-[10px] font-black underline uppercase ${accentClass}`}>Re-Synchronize Uplink</button>
          </div>
        )}
      </main>

      {/* FOOTER NAV */}
      <footer className="p-20 flex flex-col items-center gap-12">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <button 
            disabled={parseInt(chapterNum) <= 1}
            onClick={() => navigate(`/manga/${id}/${parseInt(chapterNum) - 1}`)}
            className="px-10 py-5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border)] text-[var(--text-dim)] font-black text-[10px] uppercase tracking-widest disabled:opacity-20"
          >
            Previous Sector
          </button>
          
          <button 
            disabled={parseInt(chapterNum) >= (chapterData?.totalChapters || 0)}
            onClick={() => navigate(`/manga/${id}/${parseInt(chapterNum) + 1}`)}
            className="px-20 py-6 text-white font-black rounded-[2rem] hover:scale-105 transition-all text-xs uppercase tracking-[0.3em]"
            style={{ backgroundColor: accentColor, boxShadow: `0 20px 40px -10px ${accentColor}88` }}
          >
            Decrypt Next Sector
          </button>
        </div>
      </footer>
    </div>
  );
};

export default MangaReader;