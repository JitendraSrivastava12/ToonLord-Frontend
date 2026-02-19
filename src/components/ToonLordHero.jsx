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
  }, [isRedMode]);

  const accent = isRedMode ? '#ef4444' : 'var(--accent)';

  return (
    <section className={`relative theme-${currentTheme} `}>
      {/* background blob */}
      <div 
        className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full blur-[160px] opacity-10"
        style={{ backgroundColor: accent }}
      />

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-12 grid lg:grid-cols-2 gap-14 items-center relative z-10">

        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] mb-5">
            {isRedMode 
              ? <ShieldAlert size={13} className="text-red-500" /> 
              : <Zap size={13} className="text-[var(--accent)]" />
            }
            <span className="text-xs text-[var(--text-dim)]">
              {isRedMode ? "Restricted mode" : "Modern Manga Platform"}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-[var(--text-main)] mb-5">
            Read <span style={{ color: accent }}>
              {isRedMode ? "Uncensored" : "Manga"}
            </span><br />
            Earn Points<br />
            Access Premium
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-dim)] max-w-xl mx-auto lg:mx-0 mb-7 leading-relaxed">
            {isRedMode
              ? "Browse adult manhwa with controlled access and premium chapters."
              : "Explore popular manga titles, collect points as you read, and access premium releases."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link 
              to="/home" 
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: accent }}
            >
              <Play size={16} />
              Start reading
            </Link>

            <Link 
              to="/browse" 
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-main)] hover:border-[var(--accent)]/40 transition"
            >
              Browse library
              <ChevronRight size={16} />
            </Link>
          </div>
        </motion.div>

        {/* RIGHT */}
        <div className="relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {displayGrid.map((manga, i) => (
                <motion.div
                  key={manga._id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="aspect-[3/4] rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)]"
                >
                  <Link to={`/manga/${manga._id}`}>
                    <img 
                      src={manga.coverImage} 
                      alt={manga.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = '/fallback-cover.jpg'; }}
                    />
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
