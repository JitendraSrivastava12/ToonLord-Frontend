import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Zap, Play, ChevronRight, ShieldAlert } from 'lucide-react';
import { AppContext } from "../UserContext"; 
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL;

const ToonLordHero = () => {
  const { isRedMode, currentTheme } = useContext(AppContext);
  const [allHeroes, setAllHeroes] = useState([]); 
  const [displayGrid, setDisplayGrid] = useState([]);

  useEffect(() => {
    const loadHeroData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/mangas/hero-all`);
        const data = response.data;
        setAllHeroes(data);

        const initialFiltered = data.filter(manga => manga.isAdult === isRedMode);
        const initialShuffled = [...initialFiltered]
          .sort(() => 0.5 - Math.random())
          .slice(0, 6);

        setDisplayGrid(initialShuffled);
      } catch (err) {
        console.error("Axios fetch error:", err.message);
      }
    };
    loadHeroData();
  }, []);

  useEffect(() => {
    if (allHeroes.length > 0) {
      const filtered = allHeroes.filter(manga => manga.isAdult === isRedMode);
      const shuffled = [...filtered].sort(() => 0.5 - Math.random());
      setDisplayGrid(shuffled.slice(0, 6));
    }
  }, [isRedMode, allHeroes]);

  const accent = isRedMode ? '#ef4444' : 'var(--accent)';

  return (
    <section className={`relative theme-${currentTheme} overflow-hidden`}>
      {/* background blob */}
      <div 
        className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full blur-[160px] opacity-10 pointer-events-none"
        style={{ backgroundColor: accent }}
      />

      {/* Main Container: Removed horizontal padding on mobile */}
      <div className="max-w-7xl mx-auto lg:px-12 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">
        
        {/* LEFT SECTION: Content - Padding added back here for text */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center lg:text-left flex flex-col justify-center px-6  pb-4 lg:px-0 "
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] mb-6 self-center lg:self-start">
            {isRedMode 
              ? <ShieldAlert size={14} className="text-red-500" /> 
              : <Zap size={14} className="text-[var(--accent)]" />
            }
            <span className="text-xs font-medium text-[var(--text-dim)] uppercase tracking-wider">
              {isRedMode ? "Restricted mode" : "Modern Manga Platform"}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] text-[var(--text-main)] mb-6">
            Read <span style={{ color: accent }}>
              {isRedMode ? "Uncensored" : "Manga"}
            </span><br />
            <span className="opacity-90">Earn Points</span><br />
            <span className="opacity-80">Access Premium</span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-dim)] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
            {isRedMode
              ? "Browse adult manhwa with controlled access and premium chapters. Experience high-quality storytelling with no limits."
              : "Explore popular manga titles, collect points as you read, and access exclusive premium releases from top creators."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link 
              to="/home" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: accent, boxShadow: `${accent}33 0px 8px 24px` }}
            >
              <Play size={18} fill="currentColor" />
              Start reading
            </Link>

            <Link 
              to="/browse" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-main)] font-semibold hover:bg-[var(--bg-tertiary)] hover:border-[var(--accent)] transition-all"
            >
              Browse library
              <ChevronRight size={18} />
            </Link>
          </div>
        </motion.div>

        {/* RIGHT SECTION: Visual Grid - Edge to Edge */}
        <div className="relative w-full">
          {/* Decorative background glow */}
          <div 
            className="absolute -inset-4 blur-[80px] opacity-20 z-0 pointer-events-none" 
            style={{ backgroundColor: accent }}
          ></div>

          {/* Grid: 'gap-2' keeps space between items, 'px-0' makes it touch sides */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 px-0">
            <AnimatePresence mode="popLayout">
              {displayGrid.slice(0, 6).map((manga, i) => (
                <motion.div
                  key={manga._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: i * 0.05,
                    ease: [0.23, 1, 0.32, 1] 
                  }}
                  className="group relative aspect-[3/4] overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)]"
                >
                  <Link to={`/manga/${manga._id}`} className="block w-full h-full">
                    <img 
                      src={manga.coverImage} 
                      alt={manga.title} 
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => { e.target.src = '/fallback-cover.jpg'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <p className="text-white text-[10px] font-medium truncate">{manga.title}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ToonLordHero;