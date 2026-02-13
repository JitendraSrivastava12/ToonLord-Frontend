import React, { useState, useContext, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Heart, BookOpen, Layers, Eye, Star, 
  ChevronDown, ChevronUp, ShieldAlert, Bookmark, Bell, Lock,
  ShoppingBag, X, CheckCircle2, Wallet, ArrowRight,Coins, RefreshCw
} from "lucide-react";
import MangaDetailMap from "../components/MangaDetailMap";
import { AppContext } from "../UserContext";
import CommentSection from "../components/Comment";
import { useAlert } from "../context/AlertContext";
import ReportModal from "../components/ReportModal";

const CHAPTERS_PER_PAGE = 50;

const MangaDetail = () => {
  const { mangaId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { currentTheme, isRedMode, familyMode, user, setUser } = useContext(AppContext);
  const { showAlert } = useAlert();
  
  // UI States
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [tocPage, setTocPage] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  
  // Tracks multiple statuses (e.g., ['Reading', 'Favorite', 'Subscribe'])
  const [activeStatuses, setActiveStatuses] = useState([]); 

  const themeStyles = useMemo(() => ({
    accent: isRedMode ? '#ef4444' : 'var(--accent)',
    text: isRedMode ? 'text-red-500' : 'text-[var(--accent)]',
    button: isRedMode 
      ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' 
      : 'bg-[var(--accent)] hover:bg-[var(--accent)]/80 shadow-[var(--accent-glow)]'
  }), [isRedMode]);

  // 1. Fetch Manga Details
  const { data: manga, isLoading: mangaLoading } = useQuery({
    queryKey: ["mangaDetail", mangaId],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/mangas/${mangaId}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // 2. Fetch Chapters
  const { data: chapters = [] } = useQuery({
    queryKey: ["mangaChapters", mangaId],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/chapters/${mangaId}`);
      let rawData = Array.isArray(res.data) ? res.data : (res.data.chapters || res.data.items || []);
      return rawData.sort((a, b) => (b.chapterNumber || 0) - (a.chapterNumber || 0));
    },
  });

  // 3. Fetch User Library
  const { data: userLibrary } = useQuery({
    queryKey: ["userLibrary"],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return [];
      const res = await axios.get("http://localhost:5000/api/library", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
  });

  // --- ACCESS LOGIC HELPERS ---
  const isUploader = useMemo(() => {
    if (!user || !manga) return false;
    const uploaderId = manga.uploader?._id || manga.uploader;
    return uploaderId === user._id;
  }, [user, manga]);

  const isOwned = useMemo(() => {
    if (!user || !manga) return false;
    return user.unlockedContent?.some(item => 
      (item.manga?._id || item.manga) === mangaId
    );
  }, [user, mangaId]);

  // Sync active statuses whenever library data changes
  useEffect(() => {
    if (userLibrary) {
      const currentEntries = userLibrary
        .filter(item => (item.manga?._id || item.manga) === mangaId)
        .map(item => item.status);
      setActiveStatuses(currentEntries);
    }
  }, [userLibrary, mangaId]);

  const totalChapters = chapters.length;
  const totalPages = Math.ceil(totalChapters / CHAPTERS_PER_PAGE);
  const visibleChapters = chapters.slice((tocPage - 1) * CHAPTERS_PER_PAGE, tocPage * CHAPTERS_PER_PAGE);

  // 4. Library Sync Handler
  const syncLibrary = async (status) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showAlert("Authentication Required", "error");
      return navigate('/login');
    }

    setIsSyncing(true);
    try {
      const payload = {
        mangaId: mangaId,
        status: status,
        totalChapters: totalChapters
      };

      await axios.post("http://localhost:5000/api/library/update", payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      const isAlreadyInStatus = activeStatuses.includes(status);

      if (status !== 'Reading' && isAlreadyInStatus) {
        showAlert(`Removed from ${status}`, "info");
      } else {
        showAlert(`Added to ${status}`, "success");
      }
      
      queryClient.invalidateQueries(["userLibrary"]);
    } catch (err) {
      console.error("Sync Error:", err.response?.data || err.message);
      showAlert(err.response?.data?.message || "Registry update failed", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  // --- PURCHASE LOGIC ---
  const handleConfirmPurchase = async () => {
    const token = localStorage.getItem('token');
    setIsSyncing(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/transactions/unlock/${mangaId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update Context Balance
      setUser(prev => ({
        ...prev,
        wallet: { ...prev.wallet, toonCoins: res.data.newBalance },
        unlockedContent: [...(prev.unlockedContent || []), { manga: mangaId }]
      }));

      showAlert("Access Granted: Series Unlocked!", "success");
      setIsPurchaseModalOpen(false);
      queryClient.invalidateQueries(["mangaDetail"]);
    } catch (err) {
      showAlert(err.response?.data?.message || "Purchase Failed", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  if (mangaLoading) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-[var(--accent)]/20 border-t-[var(--accent)] rounded-full animate-spin" />
    </div>
  );

  if (familyMode && manga.rating_type === '18+') {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md text-center space-y-6">
          <ShieldAlert size={50} className="text-red-500 mx-auto animate-pulse" />
          <h2 className="text-3xl font-black uppercase italic">Content Restricted</h2>
          <Link to="/home" className="inline-block px-8 py-3 bg-white text-black rounded-2xl font-black uppercase text-[9px]">Back Home</Link>
        </motion.div>
      </div>
    );
  }

  const shortDesc = manga?.description?.length > 280 && !expanded
    ? manga.description.slice(0, 280) + "..."
    : manga?.description;

  // Wallet Constants from your provided WalletPage
  const toonCoins = user?.wallet?.toonCoins ?? 0;

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] transition-all duration-700 theme-${currentTheme}`}>
      <div className="max-w-5xl mx-auto px-4 py-8 lg:py-10 relative z-10">
        
        {/* HERO CARD */}
        <section className="relative rounded-3xl p-6 lg:p-12 bg-[var(--bg-secondary)]/20 backdrop-blur-2xl border border-[var(--border)] shadow-[var(--shadow-aesthetic)] overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

            {/* COVER */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto lg:mx-0 shrink-0">
              <img src={manga.coverImage} alt={manga.title} className="w-60 h-[380px] object-cover rounded-2xl shadow-2xl border border-white/10 " />
            </motion.div>

            {/* HEADER TEXT */}
            <div className="flex-1 flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl lg:text-5xl font-black uppercase italic text-[var(--text-main)] leading-none line-clamp-2">
                    {manga.title}
                  </h1>
                  {manga.isPremium && (
                    <span className="bg-yellow-500 text-black text-[9px] font-black px-3 py-1 rounded-full uppercase italic">Premium</span>
                  )}
                </div>
                <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${themeStyles.text}`}>
                  Author: <span className="text-[var(--text-main)]">{manga.author || "Unknown"}</span>
                </p>
              </div>

              {/* STAT GRID */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <StatBox icon={<Layers size={12}/>} label="Status" value={manga.status || "Ongoing"} accent={themeStyles.text} />
                <StatBox icon={<BookOpen size={12}/>} label="Chapters" value={totalChapters} />
                <StatBox icon={<Eye size={12}/>} label="Views" value={manga.views?.toLocaleString() || "0"} />
                <StatBox icon={<Star size={12}/>} label="Rating" value={manga.rating || "5.0"} color="text-yellow-400" />
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link 
                  to={chapters.length > 0 ? `/manga/${mangaId}/${chapters[chapters.length - 1]?.chapterNumber}` : "#"} 
                  onClick={() => chapters.length > 0 && syncLibrary('Reading')}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white transition-all transform hover:scale-105 active:scale-95 ${themeStyles.button} ${chapters.length === 0 ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                >
                  <Play size={18} fill="currentColor" /> 
                  {activeStatuses.includes('Reading') ? 'In Library' : 'Read Now'}
                </Link>

                {/* BUY BUTTON */}
                {manga.isPremium && !isOwned && !isUploader && (
                  <button 
                    onClick={() => setIsPurchaseModalOpen(true)}
                    className="flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 font-black uppercase tracking-widest text-[9px] hover:scale-105 transition-all"
                  >
                    <ShoppingBag size={16} />
                    Unlock Access ({manga.price || 0} Coins)
                  </button>
                )}
                
                <button 
                  onClick={() => syncLibrary('Favorite')}
                  disabled={isSyncing}
                  className={`flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-[var(--bg-primary)] border transition-all shadow font-black uppercase tracking-widest text-[9px]
                    ${activeStatuses.includes('Favorite') 
                      ? 'border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                      : 'border-[var(--border)] text-[var(--text-dim)] hover:text-red-500'}`}
                >
                  <Heart size={16} fill={activeStatuses.includes('Favorite') ? "currentColor" : "none"} /> 
                  {activeStatuses.includes('Favorite') ? 'Favorited' : 'Favorite'}
                </button>

                <button 
                  onClick={() => syncLibrary('Bookmarks')}
                  disabled={isSyncing}
                  className={`flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-[var(--bg-primary)] border transition-all shadow font-black uppercase tracking-widest text-[9px]
                    ${activeStatuses.includes('Bookmarks') 
                      ? 'border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                      : 'border-[var(--border)] text-[var(--text-dim)] hover:text-yellow-500'}`}
                >
                  <Bookmark size={16} fill={activeStatuses.includes('Bookmarks') ? "currentColor" : "none"} /> 
                  {activeStatuses.includes('Bookmarks') ? 'Waitlisted' : 'Bookmark'}
                </button>

                <button 
                  onClick={() => syncLibrary('Subscribe')}
                  disabled={isSyncing}
                  className={`flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-[var(--bg-primary)] border transition-all shadow font-black uppercase tracking-widest text-[9px]
                    ${activeStatuses.includes('Subscribe') 
                      ? 'border-purple-500 text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                      : 'border-[var(--border)] text-[var(--text-dim)] hover:text-purple-500'}`}
                >
                  <Bell size={16} className={activeStatuses.includes('Subscribe') ? "animate-pulse" : ""} fill={activeStatuses.includes('Subscribe') ? "currentColor" : "none"} /> 
                  {activeStatuses.includes('Subscribe') ? 'Subscribed' : 'Subscribe'}
                </button>

                <button 
                  onClick={() => setReportModalOpen(true)}
                  className="flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] transition-all shadow font-black uppercase tracking-widest text-[9px] text-[var(--text-dim)] hover:text-red-500 hover:border-red-500/40"
                >
                  <ShieldAlert size={16} /> 
                  Report
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* TABS MODULE */}
        <div className="mt-10 bg-[var(--bg-secondary)]/15 backdrop-blur-2xl border border-[var(--border)] rounded-3xl overflow-hidden">
          <nav className="flex border-b border-[var(--border)]">
            {["about", "toc", "review"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-[9px] font-black uppercase tracking-[0.3em] transition-all
                  ${activeTab === tab ? 'bg-[var(--accent)] text-white shadow' : 'text-[var(--text-dim)] hover:bg-white/5'}`}>
                {tab === "toc" ? "Chapters" : tab === "review" ? "Comments" : "Details"}
              </button>
            ))}
          </nav>
          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === "about" && (
                <motion.div key="about-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl space-y-4">
                  <h2 className="text-xl font-black uppercase italic">Description</h2>
                  <p className="text-[var(--text-dim)] leading-relaxed text-sm font-medium italic opacity-90">{shortDesc}</p>
                  {manga.description?.length > 280 && (
                    <button onClick={() => setExpanded(!expanded)} className={`text-[9px] font-black uppercase flex items-center gap-2 ${themeStyles.text}`}>
                      {expanded ? <><ChevronUp size={14}/> Less</> : <><ChevronDown size={14}/> More</>}
                    </button>
                  )}
                </motion.div>
              )}

              {activeTab === 'toc' && (
                <motion.div key="toc-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {visibleChapters.length > 0 ? visibleChapters.map((ch) => {
                      // --- LOCK LOGIC ---
                      let isLocked = false;
                      if (isUploader) {
                        isLocked = false;
                      } else if (manga.isPremium) {
                        isLocked = !user || (ch.chapterNumber > 3 && !isOwned);
                      } else {
                        isLocked = !user && ch.chapterNumber > 3;
                      }

                      return (
                        <Link 
                          key={ch._id} 
                          to={isLocked ? "#" : `/manga/${mangaId}/${ch.chapterNumber}`}
                          onClick={(e) => {
                            if (isLocked) {
                              e.preventDefault();
                              if (!user) return showAlert("Please Login", "error");
                              setIsPurchaseModalOpen(true);
                            }
                          }}
                          className="group flex items-center justify-between p-4 rounded-2xl bg-[var(--bg-primary)]/50 border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all shadow"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[var(--text-main)] font-black text-sm uppercase">Chapter {ch.chapterNumber}</span>
                            {manga.isPremium && ch.chapterNumber > 3 && !isLocked && !isUploader && (
                               <span className="text-[7px] font-black bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full border border-green-500/20">OWNED</span>
                            )}
                          </div>
                          
                          {/* Updated Lock Icon View: Standard colors, icon at the end */}
                          <div className="flex items-center gap-2">
                             {isLocked ? (
                               <Lock size={14} className="text-red-500" />
                             ) : (
                               <span className="text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-all">Read →</span>
                             )}
                          </div>
                        </Link>
                      );
                    }) : (
                      <p className="text-gray-500 text-xs uppercase font-black tracking-widest p-4">No chapters available yet.</p>
                    )}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setTocPage(i + 1)}
                          className={`w-10 h-10 rounded-xl font-black text-[10px] transition-all ${
                            tocPage === i + 1 
                            ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' 
                            : 'bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-dim)] hover:bg-white/5'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "review" && (
                <motion.div key="review-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <CommentSection targetId={manga._id} targetType="manga" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* INFO MAP MODULE */}
        <div className="mt-10 p-8 lg:p-10 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border)] shadow-[var(--shadow-aesthetic)]">
          <MangaDetailMap manga={manga} />
        </div>

      </div>

      {/* --- PROFESSIONAL PURCHASE MODAL --- */}
      <AnimatePresence>
        {isPurchaseModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isSyncing && setIsPurchaseModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
            />

            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[var(--bg-primary)] border border-[var(--border)] rounded-[2.5rem] p-8 lg:p-12 overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setIsPurchaseModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-[var(--text-dim)] transition-colors"
              >
                <X size={20} />
              </button>

              <div className="space-y-8">
                {/* Modal Header */}
                <div className="text-center space-y-3">
                  <div className={`w-16 h-16 rounded-3xl ${isRedMode ? 'bg-red-500/10' : 'bg-[var(--accent)]/10'} flex items-center justify-center mx-auto`}>
                    <ShoppingBag size={28} className={themeStyles.text} />
                  </div>
                  <h3 className="text-2xl font-black uppercase italic tracking-tight">Unlock Series</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-dim)] leading-relaxed">
                    Confirm purchase to gain full access to <br/>
                    <span className="text-[var(--text-main)] italic">"{manga?.title}"</span>
                  </p>
                </div>

                {/* Financial Summary */}
                <div className="space-y-3">
                   <div className="bg-[var(--bg-secondary)]/30 border border-[var(--border)] rounded-2xl p-5 flex justify-between items-center">
                      <div>
                        <p className="text-[9px] font-black uppercase text-[var(--text-dim)] mb-1">Item Cost</p>
                        <div className="flex items-center gap-2">
                          <Coins size={14} className="text-yellow-500" />
                          <span className="text-xl font-black">{manga?.price}</span>
                        </div>
                      </div>
                      <ArrowRight size={20} className="text-[var(--border)]" />
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase text-[var(--text-dim)] mb-1">Wallet Balance</p>
                        <div className="flex items-center gap-2 justify-end">
                          <span className={`text-xl font-black ${toonCoins < manga?.price ? 'text-red-500' : ''}`}>
                            {toonCoins}
                          </span>
                          <Wallet size={14} className="text-[var(--text-dim)]" />
                        </div>
                      </div>
                   </div>

                   {toonCoins < manga?.price && (
                     <p className="text-[9px] font-black text-red-500 uppercase tracking-widest text-center px-4">
                       Insufficient balance. Please recharge your wallet.
                     </p>
                   )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    disabled={isSyncing || toonCoins < manga?.price}
                    onClick={handleConfirmPurchase}
                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-tighter text-[11px] flex items-center justify-center gap-3 transition-all
                      ${toonCoins < manga?.price 
                        ? 'bg-[var(--border)] text-[var(--text-dim)] cursor-not-allowed' 
                        : 'bg-white text-black hover:scale-[1.02] active:scale-95 shadow-xl'
                      }`}
                  >
                    {isSyncing ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <>Confirm Purchase <CheckCircle2 size={16} /></>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setIsPurchaseModalOpen(false)}
                    className="w-full py-4 text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors"
                  >
                    Not Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REPORT MODAL COMPONENT */}
      <ReportModal 
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetId={mangaId}
        targetType="manga"
        targetUser={manga.uploader?._id || manga.uploader || manga.authorId} 
        showAlert={showAlert}
        extraData={{
          parentManga: mangaId
        }}
      />
    </div>
  );
};

const StatBox = ({ icon, label, value, color = 'text-[var(--text-main)]', accent = 'text-[var(--text-dim)]' }) => (
  <div className="bg-[var(--bg-primary)]/30 border border-[var(--border)] p-4 rounded-2xl transition-all shadow">
    <div className={`flex items-center gap-2 mb-2 ${accent} uppercase font-black text-[8px] tracking-[0.2em] opacity-60`}>
      {icon} {label}
    </div>
    <p className={`text-sm font-black italic tracking-tight ${color}`}>{value}</p>
  </div>
);

export default MangaDetail;