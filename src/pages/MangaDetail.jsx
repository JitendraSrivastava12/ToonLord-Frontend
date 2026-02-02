import React, { useState, useContext, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Heart, BookOpen, Layers, Eye, Star, 
  ChevronDown, ChevronUp, Share2, ShieldAlert, ArrowLeft
} from "lucide-react";
import MangaDetailMap from "../components/MangaDetailMap";
import { AppContext } from "../UserContext";
import CommentSection from "../components/Comment";

const CHAPTERS_PER_PAGE = 50;

const MangaDetail = () => {
  const { mangaId } = useParams();
  const navigate = useNavigate();
  const { currentTheme, isRedMode, familyMode } = useContext(AppContext);
  
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
  const [tocPage, setTocPage] = useState(1);

  const themeStyles = useMemo(() => ({
    accent: isRedMode ? '#ef4444' : 'var(--accent)',
    text: isRedMode ? 'text-red-500' : 'text-[var(--accent)]',
    button: isRedMode 
      ? 'bg-red-600 hover:bg-red-700 shadow-red-500/30' 
      : 'bg-[var(--accent)] hover:bg-[var(--accent)]/80 shadow-[var(--accent-glow)]'
  }), [isRedMode]);

  const { data: manga, isLoading: mangaLoading } = useQuery({
    queryKey: ["mangaDetail", mangaId],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/mangas/${mangaId}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: chapters = [] } = useQuery({
    queryKey: ["mangaChapters", mangaId],
    queryFn: async () => {
      const res = await axios.get(`http://localhost:5000/api/chapters/${mangaId}`);
      let rawData = Array.isArray(res.data) ? res.data : (res.data.chapters || res.data.items || []);
      return rawData.sort((a, b) => (b.chapterNumber || 0) - (a.chapterNumber || 0));
    },
    staleTime: 1000 * 60 * 5,
  });

  const totalChapters = chapters.length;
  const totalPages = Math.ceil(totalChapters / CHAPTERS_PER_PAGE);
  const visibleChapters = chapters.slice((tocPage - 1) * CHAPTERS_PER_PAGE, tocPage * CHAPTERS_PER_PAGE);

  if (mangaLoading) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-[var(--accent)]/20 border-t-[var(--accent)] rounded-full animate-spin" />
      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)]">
        Loading...
      </p>
    </div>
  );

  if (familyMode && manga.rating_type === '18+') {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4 transition-all duration-700">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md text-center space-y-6">
          <div className="p-6 rounded-full bg-red-500/10 border border-red-500/20 inline-block">
            <ShieldAlert size={50} className="text-red-500 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Content Restricted</h2>
            <p className="text-[var(--text-dim)] text-sm font-medium italic">
              This content is blocked by Family Mode.
            </p>
          </div>
          <Link to="/home" className="inline-block px-8 py-3 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[9px] hover:scale-105 transition-transform">
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  const shortDesc = manga?.description?.length > 280 && !expanded
    ? manga.description.slice(0, 280) + "..."
    : manga?.description;

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] transition-all duration-700 theme-${currentTheme} py-28`}>
      
      <div className="max-w-5xl mx-auto px-4 py-8 lg:py-10 relative z-10">
        
        {/* HERO CARD */}
        <section className="relative rounded-3xl p-6 lg:p-12 bg-[var(--bg-secondary)]/20 backdrop-blur-2xl border border-[var(--border)] shadow-[var(--shadow-aesthetic)] overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

            {/* COVER */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mx-auto lg:mx-0 shrink-0">
              <div className="relative group">
                <img src={manga.coverImage} alt={manga.title} className="w-60 h-[380px] object-cover rounded-2xl shadow-2xl border border-white/10" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>

            {/* HEADER TEXT */}
            <div className="flex-1 flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl lg:text-5xl font-black tracking-tight leading-[1.0] uppercase italic text-[var(--text-main)] line-clamp-3">
                  {manga.title}
                </h1>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-[1px] bg-[var(--accent)] opacity-50" />
                  <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${themeStyles.text}`}>
                    Author: <span className="text-[var(--text-main)]">{manga.author || "Unknown"}</span>
                  </p>
                </div>
              </div>

              {/* STAT GRID */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <StatBox icon={<Layers size={12}/>} label="Status" value={manga.status || "Ongoing"} accent={themeStyles.text} />
                <StatBox icon={<BookOpen size={12}/>} label="Chapters" value={totalChapters} />
                <StatBox icon={<Eye size={12}/>} label="Views" value={manga.views?.toLocaleString() || "0"} />
                <StatBox icon={<Star size={12}/>} label="Rating" value={manga.rating || "5.0"} color="text-yellow-400" />
              </div>

              {/* GENRES */}
              <div className="flex flex-wrap gap-2">
                {manga.genres?.map((g, i) => (
                  <span key={i} className="px-3 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-dim)] hover:text-[var(--text-main)] hover:border-[var(--accent)]/30 transition-all cursor-default">
                    {g}
                  </span>
                ))}
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to={`/manga/${mangaId}/${chapters[chapters.length - 1]?.chapterNumber}`} 
                  className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white transition-all transform hover:scale-105 active:scale-95 ${themeStyles.button}`}>
                  <Play size={18} fill="currentColor" /> Read Now
                </Link>
                <button className="flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] font-black uppercase tracking-widest text-[9px] text-[var(--text-dim)] hover:text-[var(--text-main)] hover:border-[var(--accent)]/40 transition-all shadow">
                  <Heart size={16} /> Add to Favorites
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* TAB MODULE */}
        <div className="mt-10 bg-[var(--bg-secondary)]/15 backdrop-blur-2xl border border-[var(--border)] rounded-3xl overflow-hidden shadow-xl">
          <nav className="flex border-b border-[var(--border)]">
            {["about", "toc", "review", "recommend"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-t-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all
                  ${activeTab === tab ? 'bg-[var(--accent)] text-white shadow' : 'text-[var(--text-dim)] hover:text-[var(--text-main)] hover:bg-white/5'}`}>
                {tab === "toc" ? "Chapters" : tab === "recommend" ? "Recommended" : tab === "review" ? "Comments" : "Details"}
              </button>
            ))}
          </nav>

          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === "about" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl space-y-4">
                  <h2 className="text-xl font-black uppercase tracking-tight italic text-[var(--text-main)]">Description</h2>
                  <p className="text-[var(--text-dim)] leading-relaxed text-sm font-medium italic tracking-tight opacity-90">{shortDesc}</p>
                  {manga.description?.length > 280 && (
                    <button onClick={() => setExpanded(!expanded)} className={`text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${themeStyles.text}`}>
                      {expanded ? <><ChevronUp size={14}/> Show Less</> : <><ChevronDown size={14}/> Read More</>}
                    </button>
                  )}
                </motion.div>
              )}

              {activeTab === 'toc' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <h2 className="text-xl font-black uppercase tracking-tight italic text-[var(--text-main)]">Chapter List</h2>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--text-dim)] opacity-40">
                      {totalChapters} Chapters
                    </span>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button key={i} onClick={() => setTocPage(i + 1)}
                          className={`shrink-0 px-3 py-1.5 rounded-lg text-[9px] font-black border transition-all
                            ${tocPage === i + 1 ? 'bg-[var(--accent)] border-transparent text-white shadow' : 'bg-[var(--bg-primary)] border-[var(--border)] text-[var(--text-dim)] hover:border-[var(--accent)]/30'}`}>
                          Page {i + 1}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {visibleChapters.map((ch) => (
                      <Link key={ch._id} to={`/manga/${mangaId}/${ch.chapterNumber}`}
                        className="group flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-primary)]/50 border border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-primary)] transition-all shadow">
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-mono ${themeStyles.text} opacity-40 group-hover:opacity-100`}>
                            #{ch.chapterNumber}
                          </span>
                          <span className="text-[var(--text-main)] font-black text-sm uppercase tracking-tight">
                            Chapter {ch.chapterNumber}
                          </span>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-dim)] opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          Read Chapter →
                        </span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "review" && (
                <CommentSection targetId={manga._id} targetType="manga" />
              )}
            
            </AnimatePresence>
          </div>
        </div>

        {/* INFO MODULE */}
        <div className="mt-10">
          <div className="p-8 lg:p-10 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] shadow-[var(--shadow-aesthetic)]">
             <div className="flex items-center gap-2 mb-6">
               <div className="w-1.5 h-10 bg-[var(--accent)] rounded-full shadow-[0_0_10px_var(--accent)]" />
               <h2 className="text-2xl font-black uppercase italic tracking-tight text-[var(--text-main)]">
                 Manga <span className={themeStyles.text}>Information</span>
               </h2>
             </div>
             <MangaDetailMap manga={manga} />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ icon, label, value, color = 'text-[var(--text-main)]', accent = 'text-[var(--text-dim)]' }) => (
  <div className="bg-[var(--bg-primary)]/30 border border-[var(--border)] p-3 rounded-2xl group hover:border-[var(--accent)]/30 transition-all shadow">
    <div className={`flex items-center gap-2 mb-2 ${accent} uppercase font-black text-[8px] tracking-[0.2em] opacity-60`}>
      {icon} {label}
    </div>
    <p className={`text-sm font-black italic tracking-tight ${color}`}>{value}</p>
  </div>
);

export default MangaDetail;
