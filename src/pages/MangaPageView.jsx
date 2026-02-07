import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { 
  Settings, Star, User, Eye, Layout, Cpu, 
  Twitter, Github, Youtube, ChevronLeft, ChevronRight, ArrowLeft,
  RefreshCw, CheckCircle2, PartyPopper, Maximize2, Minimize2
} from 'lucide-react';
import { AppContext } from "../UserContext";
import CommentSection from '../components/Comment';

const MangaReader = () => {
  const { id, chapterNum } = useParams();
  const navigate = useNavigate();
  
  const { isRedMode } = useContext(AppContext);
  const [chapterData, setChapterData] = useState(null);
  const [mangaData, setMangaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFullyCompleted, setIsFullyCompleted] = useState(false);
  const [readingMode, setReadingMode] = useState(false);

  // --- REFS FOR STABILITY ---
  const startTimeRef = useRef(Date.now());
  const hasSyncedRef = useRef(null); // Prevents the infinite "Activity Logged" loop

  const activeAccent = isRedMode ? "#ff003c" : "#6366f1"; 
  const accentText = isRedMode ? 'text-red-500' : 'text-indigo-400';
  const glowBg = isRedMode ? 'bg-red-600/10' : 'bg-indigo-600/10';

  // --- CELEBRATION EFFECT ---
  const fireConfetti = useCallback(() => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: [activeAccent, '#ffffff'] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: [activeAccent, '#ffffff'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  }, [activeAccent]);

  // --- ANALYTICS LOGGING (FIXES MYSTATS ERROR) ---
  const logNeuralActivity = useCallback(async () => {
    const token = localStorage.getItem('token');
    // We check for mangaData to ensure we aren't sending null genres/values
    if (!token || !mangaData) return;

    const durationMinutes = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 60000));

    try {
      await axios.post('http://localhost:5000/api/analytics/log', {
        mangaId: id,
        chapterNumber: parseInt(chapterNum),
        genre: mangaData.tags?.[0] || "General",
        durationMinutes: durationMinutes
      }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) { 
      console.error("Neural log failed", err); 
    }
  }, [id, chapterNum, mangaData]);

  // --- LIBRARY UPDATE LOGIC (FIXES INFINITE LOOP) ---
  const syncLibraryProgress = useCallback(async (title, total) => {
    const token = localStorage.getItem('token');
    const syncKey = `${id}-${chapterNum}`;

    // If we already synced this specific chapter load, STOP HERE.
    if (!token || hasSyncedRef.current === syncKey) return; 

    setIsSyncing(true);
    const isLastChapter = parseInt(chapterNum) >= total;
    const finalStatus = isLastChapter ? 'Completed' : 'Reading';
    
    try {
      await axios.post('http://localhost:5000/api/library/update', {
        mangaId: id,
        mangaTitle: title,
        progress: parseInt(chapterNum),
        totalChapters: total || 0,
        currentchapter: chapterNum,
        status: finalStatus
      }, { headers: { Authorization: `Bearer ${token}` } });

      // Mark as synced for this session
      hasSyncedRef.current = syncKey;

      if (isLastChapter) {
        setIsFullyCompleted(true);
        fireConfetti();
      }
      
      setTimeout(() => setIsSyncing(false), 800);
    } catch (err) {
      console.error("Library sync failed", err);
      setIsSyncing(false);
    }
  }, [id, chapterNum, fireConfetti]);

  // --- MAIN DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const [chapterRes, mangaRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/chapters/${id}/index/${chapterNum}`, {
            headers: { 
                ...(token && { 'Authorization': `Bearer ${token}` }),
                'Content-Type': 'application/json'
            }
          }),
          axios.get(`http://localhost:5000/api/mangas/${id}`)
        ]);
        
        setChapterData(chapterRes.data);
        setMangaData(mangaRes.data);
        window.scrollTo(0, 0);

        // Sync with library once data is fetched
        syncLibraryProgress(mangaRes.data.title, mangaRes.data.TotalChapter);
        
      } catch (err) {
        console.error("Fetch Error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    startTimeRef.current = Date.now(); 

    return () => { 
      logNeuralActivity(); 
    }; 
  }, [id, chapterNum]);

  if (loading || !mangaData) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="relative">
        <div className={`w-16 h-16 border-4 border-white/5 border-t-red-500 rounded-full animate-spin`} style={{ borderTopColor: activeAccent }} />
        <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20" size={20} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20 overflow-x-hidden">
      
      {/* --- HEADER (Hidden in Reading Mode) --- */}
      {!readingMode && (
        <header className="relative bg-[#0a0a0c] pt-24 pb-16 px-4 border-b border-white/5 overflow-hidden">
            <div className={`absolute -top-24 -left-24 w-96 h-96 ${glowBg} blur-[120px] rounded-full pointer-events-none`} />
            
            <div className="absolute top-8 right-4 md:right-8 z-20 flex items-center gap-3">
                <div className={`flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest transition-all 
                    ${isFullyCompleted ? 'text-green-400 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : isSyncing ? 'text-yellow-500' : 'text-white/40'}`}>
                    {isFullyCompleted ? <CheckCircle2 size={12} /> : <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />}
                    <span>{isFullyCompleted ? 'Series Finalized' : isSyncing ? 'Syncing Archive' : 'Archive Synced'}</span>
                </div>
            </div>

            <button 
                onClick={() => navigate(`/manga/${id}`)}
                className="absolute top-8 left-4 md:left-8 z-20 flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all group"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                <span>Back to Manga</span>
            </button>

            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
                <div className="relative group shrink-0">
                    <img src={mangaData.coverImage} alt="Cover" className="rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10 w-64 md:w-80 object-cover aspect-[3/4] transition-transform duration-500 group-hover:scale-[1.02]" />
                    {isFullyCompleted && (
                        <div className="absolute -top-4 -right-4 bg-green-500 text-white p-3 rounded-full shadow-2xl animate-bounce">
                            <PartyPopper size={24} />
                        </div>
                    )}
                </div>

                <div className="flex-1 text-center md:text-left w-full pt-4">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 italic uppercase leading-[0.9] line-clamp-2">
                        {mangaData.title}
                    </h1>
                    <div className="inline-block relative">
                        <p className={`${accentText} text-sm md:text-base font-black uppercase tracking-[0.3em] mb-8`}>
                            {isFullyCompleted ? "FINAL CHAPTER REACHED" : (chapterData?.title || `CHAPTER ${chapterNum}`)}
                        </p>
                        <div className={`absolute -bottom-2 left-0 w-12 h-1`} style={{ backgroundColor: activeAccent }} />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-10 text-[11px] font-bold text-slate-400 justify-center md:justify-start uppercase tracking-widest">
                        <span className="flex items-center gap-2.5 bg-white/5 px-4 py-2 rounded-lg"><User size={14} className={accentText} /> {mangaData.author}</span>
                        <span className="flex items-center gap-2.5 text-yellow-500 bg-white/5 px-4 py-2 rounded-lg"><Star size={14} fill="currentColor" /> {mangaData.rating}</span>
                        <span className="flex items-center gap-2.5 bg-white/5 px-4 py-2 rounded-lg"><Eye size={14} /> {mangaData.views}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
                        {mangaData.tags?.map((tag) => (
                            <span key={tag} className="bg-white/5 text-white/70 text-[10px] font-black px-4 py-1.5 rounded-full border border-white/10 uppercase tracking-[0.15em] mt-5">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </header>
      )}

      {/* --- STICKY READER NAV --- */}
      <nav className="bg-[#050505]/95 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-2 md:px-4 h-16 flex justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 md:gap-3">
            <button 
              disabled={parseInt(chapterNum) <= 1}
              onClick={() => navigate(`/manga/${id}/${parseInt(chapterNum) - 1}`)}
              className="bg-white/5 hover:bg-white/10 text-[10px] font-black px-4 py-2.5 rounded-xl border border-white/5 transition-all disabled:opacity-20 flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              <span className="hidden md:block">PREVIOUS</span>
            </button>
            
            <select 
              value={chapterNum}
              onChange={(e) => navigate(`/manga/${id}/${e.target.value}`)}
              className="bg-black text-white text-[11px] font-black px-3 py-2.5 rounded-xl border border-white/10 outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none text-center min-w-[100px]"
              style={{ borderColor: isSyncing ? activeAccent : 'rgba(255,255,255,0.1)' }}
            >
              {[...Array(mangaData.TotalChapter)].map((_, i) => (
                <option key={i+1} value={i+1}>CH. {i+1}</option>
              ))}
            </select>

            <button 
              disabled={parseInt(chapterNum) >= mangaData.TotalChapter}
              onClick={() => navigate(`/manga/${id}/${parseInt(chapterNum) + 1}`)}
              className="bg-white/5 hover:bg-white/10 text-[10px] font-black px-4 py-2.5 rounded-xl border border-white/5 transition-all disabled:opacity-20 flex items-center gap-2"
            >
              <span className="hidden md:block">NEXT</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <button 
                onClick={() => setReadingMode(!readingMode)} 
                className={`transition-colors p-2 rounded-lg ${readingMode ? 'bg-white/10 text-white' : 'hover:text-white'}`}
                title="Toggle Reading Mode"
            >
                {readingMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button className="hover:text-white transition-colors p-2"><Settings size={20} /></button>
          </div>
        </div>
      </nav>

      {/* --- MANGA PAGES --- */}
      <main className="bg-black w-full overflow-hidden">
        <div className="max-w-[900px] mx-auto shadow-[0_0_100px_rgba(0,0,0,1)]">
          {chapterData?.pages?.map((img, i) => (
            <img 
              key={i} 
              src={img} 
              alt={`Page ${i + 1}`} 
              className="w-full h-auto block" 
              style={{ maxWidth: '100vw' }}
              loading="lazy" 
            />
          ))}
        </div>
      </main>

      {/* --- INTERACTION SECTION --- */}
      {!readingMode && (
        <div className="max-w-4xl mx-auto py-20 px-6">
            <div className="flex justify-center mb-24">
            {parseInt(chapterNum) < mangaData.TotalChapter ? (
                <button 
                onClick={() => navigate(`/manga/${id}/${parseInt(chapterNum) + 1}`)}
                className="group relative px-16 py-6 bg-white text-black rounded-full font-black uppercase italic tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-2xl overflow-hidden"
                >
                <span className="relative z-10">Continue to Next Chapter</span>
                <div className={`absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-10`} style={{ backgroundColor: activeAccent }} />
                </button>
            ) : (
                <div className="text-center space-y-4">
                    <div className={`text-4xl md:text-6xl font-black italic uppercase tracking-tighter ${accentText}`}>Series Completed</div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Archive updated and finalized in your registry.</p>
                    <button 
                    onClick={() => navigate('/library')}
                    className="mt-6 px-10 py-4 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                    >
                    Return to Library
                    </button>
                </div>
            )}
            </div>
            
            <div className="space-y-6">
            <CommentSection 
                targetId={chapterData?._id} 
                targetType="chapter" 
                theme="light" 
                customClass="bg-white text-slate-900 rounded-[2.5rem] p-10 shadow-2xl" 
            />
            </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      {!readingMode && (
        <footer className="bg-[#050505] border-t border-white/5 pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20 text-center md:text-left">
                <div className="col-span-1">
                <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
                    <Cpu size={35} className={accentText} />
                    <span className="font-black tracking-tighter text-2xl uppercase italic">
                    Toon<span style={{ color: activeAccent }}>Lord</span>
                    </span>
                </div>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    The ultimate destination for digital creators and storytellers. Systems fully operational.
                </p>
                </div>

                <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-10 text-slate-600">Navigation</h4>
                <ul className="space-y-4 text-xs font-black uppercase text-slate-400">
                    <li><Link to="/browse" className="hover:text-white transition-colors">Browse</Link></li>
                    <li><Link to="/library" className="hover:text-white transition-colors">Library</Link></li>
                    <li><Link to="/dashboard" className="hover:text-white transition-colors">Creator Studio</Link></li>
                </ul>
                </div>

                <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-10 text-slate-600">Legal</h4>
                <ul className="space-y-4 text-xs font-black uppercase text-slate-400">
                    <li><Link to="/terms" className="hover:text-white transition-colors">User Protocols</Link></li>
                    <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Data</Link></li>
                </ul>
                </div>

                <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-10 text-slate-600">Social</h4>
                <div className="flex gap-4 justify-center md:justify-start">
                    <SocialIconItem icon={<Twitter size={20} />} accent={activeAccent} />
                    <SocialIconItem icon={<Github size={20} />} accent={activeAccent} />
                    <SocialIconItem icon={<Youtube size={20} />} accent={activeAccent} />
                </div>
                </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
                © 2026 ToonLord AI // Created By Jitendra Srivastava
                </p>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-white/5 px-6 py-3 rounded-full border border-white/10 text-green-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Status: Nominal
                </div>
            </div>
            </div>
        </footer>
      )}
    </div>
  );
};

const SocialIconItem = ({ icon, accent }) => (
  <a href="#" className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all text-slate-400"
     onMouseEnter={(e) => e.currentTarget.style.color = accent}
     onMouseLeave={(e) => e.currentTarget.style.color = ''}>
    {icon}
  </a>
);

export default MangaReader;