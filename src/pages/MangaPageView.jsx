import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { 
  Star, User, Eye, Cpu, 
  ChevronLeft, ChevronRight, ArrowLeft,
  CheckCircle2, PartyPopper, Lock, ShoppingBag, Activity, Crown, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppContext } from "../UserContext";
import CommentSection from '../components/Comment';
import ReportModal from '../components/ReportModal';

const API_URL = import.meta.env.VITE_API_URL;

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
  
  const [lockStatus, setLockStatus] = useState({ isLocked: false, reason: "" });
  const [isReportOpen, setIsReportOpen] = useState(false);

  const heartbeatTimer = useRef(null);
  const hasSyncedRef = useRef(null); 

  const activeAccent = isRedMode ? "#ff6b81" : "#7f9cf5"; 
  const accentText = isRedMode ? 'text-red-400' : 'text-indigo-300';
  const glowBg = isRedMode ? 'bg-red-400/10' : 'bg-indigo-400/10';

  const fireConfetti = useCallback(() => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: [activeAccent, '#ffffff'] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: [activeAccent, '#ffffff'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    }());
  }, [activeAccent]);

  const sendHeartbeat = useCallback(async (isFinished = false) => {
    const token = localStorage.getItem('token');
    if (!token || !mangaData || lockStatus.isLocked || document.hidden) return;
    try {
      await axios.post(`${API_URL}/api/analytics/heartbeat`, {
        mangaId: id,
        chapterNumber: parseInt(chapterNum),
        genre: mangaData?.tags?.[0] || "General",
        pageNumber: 1, 
        isCompleted: isFinished
      }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) { console.error("Analytics sync error", err); }
  }, [id, chapterNum, mangaData, lockStatus.isLocked]);

  const syncLibraryProgress = useCallback(async (title, total) => {
    const token = localStorage.getItem('token');
    const syncKey = `${id}-${chapterNum}`;
    if (!token || hasSyncedRef.current === syncKey) return; 

    setIsSyncing(true);
    const isLastChapter = parseInt(chapterNum) >= total;
    const finalStatus = isLastChapter ? 'Completed' : 'Reading';
    
    try {
      await axios.post(`${API_URL}/api/library/update`, {
        mangaId: id,
        mangaTitle: title,
        progress: parseInt(chapterNum),
        totalChapters: total || 0,
        currentchapter: chapterNum,
        status: finalStatus
      }, { headers: { Authorization: `Bearer ${token}` } });

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

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const [chapterRes, mangaRes] = await Promise.all([
          axios.get(`${API_URL}/api/chapters/${id}/index/${chapterNum}`, {
            headers: { ...(token && { 'Authorization': `Bearer ${token}` }) }
          }),
          axios.get(`${API_URL}/api/mangas/${id}`)
        ]);
        if (!isMounted) return;

        setChapterData(chapterRes.data);
        setMangaData(mangaRes.data);
        setLockStatus({ isLocked: chapterRes.data.isLocked, reason: chapterRes.data.lockReason });
        window.scrollTo(0, 0);

        if (!chapterRes.data.isLocked) {
          syncLibraryProgress(mangaRes.data.title, mangaRes.data.TotalChapter);
          sendHeartbeat(false);
          heartbeatTimer.current = setInterval(() => sendHeartbeat(false), 30000);
        }
      } catch (err) {
        console.error("Data Fetch Failure", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; if (heartbeatTimer.current) clearInterval(heartbeatTimer.current); };
  }, [id, chapterNum]);

  if (loading || !mangaData) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="relative">
        <div className={`w-16 h-16 border-4 border-white/5 rounded-full animate-spin`} style={{ borderTopColor: activeAccent }} />
        <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20" size={20} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20 overflow-x-hidden">
      {!readingMode && (
        <header className="relative bg-[#0f0f10] pt-24 md:pt-32 pb-12 md:pb-16 px-4 border-b border-white/5 overflow-hidden">
          <div className={`absolute -top-24 -left-24 w-64 md:w-96 h-64 md:h-96 ${glowBg} blur-[80px] rounded-full pointer-events-none`} />
          
          {/* Top Actions HUD */}
          <div className="absolute top-6 left-0 right-0 px-4 md:px-8 flex justify-between items-center z-20">
            <button onClick={() => navigate(`/manga/${id}`)} className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className={`flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest 
              ${isFullyCompleted ? 'text-green-400' : isSyncing ? 'text-yellow-400' : 'text-white/40'}`}>
              <Activity size={12} className={isSyncing ? 'animate-pulse' : ''} />
              <span className="hidden xs:inline">{isFullyCompleted ? 'Finalized' : isSyncing ? 'Syncing' : 'Link Active'}</span>
            </div>
          </div>

          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-10 relative z-10">
            {/* Cover Image - Adjusted for mobile scale */}
            <div className="relative group shrink-0 w-44 md:w-80">
              <img src={mangaData.coverImage} alt="Cover" className="rounded-xl md:rounded-2xl shadow-2xl border border-white/10 w-full object-cover aspect-[3/4]" />
              {isFullyCompleted && <div className="absolute -top-3 -right-3 bg-green-500 text-white p-2 md:p-3 rounded-full shadow-xl animate-bounce"><PartyPopper size={18} /></div>}
            </div>

            <div className="flex-1 text-center md:text-left pt-2 md:pt-4 w-full">
              <h1 className="text-3xl md:text-6xl font-bold tracking-tighter mb-4 italic uppercase leading-[1.1] md:leading-[0.9]">
                {mangaData.title}
              </h1>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                {mangaData.tags?.slice(0, 3).map((tag, index) => (
                  <span key={index} className="text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-white/5 border border-white/10 text-slate-400">
                    {tag}
                  </span>
                ))}
              </div>

              <p className={`${accentText} text-xs md:text-base font-bold uppercase tracking-[0.3em] mb-4`}>
                {lockStatus.isLocked ? "ACCESS RESTRICTED" : isFullyCompleted ? "STORY COMPLETE" : (chapterData?.title || `CHAPTER ${chapterNum}`)}
              </p>

              <div className="flex flex-wrap items-center gap-3 md:gap-6 text-[10px] font-bold text-slate-400 justify-center md:justify-start uppercase tracking-widest">
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <User size={12} className={accentText} /> {mangaData.author}
                </span>
                <span className="flex items-center gap-2 text-yellow-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <Star size={12} fill="currentColor" /> {mangaData.rating}
                </span>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* RENDER CONTENT OR LOCK SCREEN */}
      <div className="max-w-4xl mx-auto py-6 md:py-10 px-0 sm:px-4">
         {lockStatus.isLocked ? (
           <div className="mx-4 py-16 text-center flex flex-col items-center bg-white/[0.02] rounded-[2rem] border border-white/5 p-8">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                <Lock className="text-red-500" size={28} />
              </div>
              <h2 className="text-2xl font-bold uppercase italic tracking-tighter mb-4">Transmission Blocked</h2>
              <p className="text-slate-400 mb-8 max-w-xs text-xs leading-relaxed">{lockStatus.reason}</p>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                 <button onClick={() => navigate('/shop')} className="w-full py-4 bg-white text-black font-bold uppercase text-[10px] tracking-widest rounded-xl flex items-center justify-center gap-2">
                    <ShoppingBag size={14}/> Upgrade Protocol
                 </button>
                 <button onClick={() => navigate(-1)} className="w-full py-4 bg-white/5 border border-white/10 font-bold uppercase text-[10px] tracking-widest rounded-xl flex items-center justify-center gap-2">
                    <ChevronLeft size={14}/> Go Back
                 </button>
              </div>
           </div>
         ) : (
           <div className="space-y-1">
              {chapterData?.pages?.map((page, idx) => (
                 <img 
                   key={idx} 
                   src={page} 
                   alt={`Page ${idx + 1}`} 
                   className="w-full object-contain md:rounded-lg shadow-2xl" 
                   loading="lazy" 
                 />
              ))}
              
              {/* NAVIGATION FOOTER - Thumb friendly */}
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-between pt-12 mt-8 px-4 border-t border-white/5">
                <button 
                  disabled={parseInt(chapterNum) <= 1}
                  onClick={() => navigate(`/manga/${id}/${parseInt(chapterNum) - 1}`)}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl font-bold uppercase text-[10px] tracking-widest disabled:opacity-20"
                >
                  <ChevronLeft size={18}/> Previous
                </button>

                <div className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-30 order-last sm:order-none">
                  {chapterNum} / {mangaData.TotalChapter}
                </div>

                <button 
                  onClick={() => {
                    if(parseInt(chapterNum) >= mangaData.TotalChapter) {
                      navigate(`/manga/${id}`);
                    } else {
                      navigate(`/manga/${id}/${parseInt(chapterNum) + 1}`);
                    }
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-white text-black border border-white/10 rounded-2xl font-bold uppercase text-[10px] tracking-widest"
                >
                  {parseInt(chapterNum) >= mangaData.TotalChapter ? 'End Feed' : 'Next Chapter'} <ChevronRight size={18}/>
                </button>
              </div>
           </div>
         )}

         {!lockStatus.isLocked && (
           <div className="mt-16 px-4">
              <CommentSection mangaId={id} />
           </div>
         )}
      </div>

      <button 
        onClick={() => setIsReportOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-red-500/10 border border-red-500/20 rounded-full text-red-500 hover:bg-red-500 transition-all z-50 shadow-2xl backdrop-blur-md"
      >
        <ShieldAlert size={18} />
      </button>

      <ReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        targetId={id} 
        targetType="manga" 
      />
    </div>
  );
};

export default MangaReader;