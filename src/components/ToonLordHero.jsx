import React, { useState, useEffect, useContext } from 'react';
import { Zap, Play, ChevronRight, ShieldAlert } from 'lucide-react';
import { AppContext } from "../UserContext"; 
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/* Asset loader */
const getAssetsByFolder = (folderName) => {
  try {
    const allAssets = import.meta.glob('../assets/**/*.{jpg,jpeg,png,webp,avif,jfif}', { eager: true });
    return Object.keys(allAssets)
      .filter(path => path.includes(`/${folderName}/`))
      .map(path => allAssets[path].default || allAssets[path]);
  } catch {
    return [];
  }
};

const mangaImages = getAssetsByFolder('Mangas');
const pornwahImages = getAssetsByFolder('Pornwahs');

const ToonLordHero = () => {
  const { isRedMode, currentTheme } = useContext(AppContext);
  const [displayGrid, setDisplayGrid] = useState([]);

  useEffect(() => {
    let pool = isRedMode ? pornwahImages : mangaImages;
    if (!pool.length) pool = mangaImages;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setDisplayGrid(shuffled.slice(0, 6));
  }, [isRedMode]);

  const accent = isRedMode ? '#ef4444' : 'var(--accent)';
  const glow = isRedMode ? 'rgba(239,68,68,0.35)' : 'var(--accent-glow)';

  return (
    <section className={`relative overflow-hidden theme-${currentTheme}`}>
      {/* Glow background */}
      <div 
        className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[140px] opacity-20"
        style={{ backgroundColor: accent }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 grid lg:grid-cols-2 gap-16 items-center relative z-10">

        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] mb-6">
            {isRedMode 
              ? <ShieldAlert size={14} className="text-red-500" /> 
              : <Zap size={14} className="text-[var(--accent)]" />
            }
            <span className="text-[11px] tracking-widest uppercase text-[var(--text-dim)]">
              {isRedMode ? "Restricted Mode" : "Next-Gen Manga Platform"}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight text-[var(--text-main)] mb-6">
            Read <span style={{ color: accent }}>{isRedMode ? "Uncensored" : "Manga"}</span><br />
            Earn Points<br />
            Unlock Premium
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-dim)] max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
            {isRedMode
              ? "Explore exclusive adult manhwa with uncensored chapters and premium unlocks."
              : "Discover top manga titles, earn points while reading, and unlock premium releases."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link 
              to="/home" 
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-white transition hover:scale-105"
              style={{ backgroundColor: accent, boxShadow: `0 10px 25px -10px ${glow}` }}
            >
              <Play size={18} fill="currentColor" />
              Start Reading
            </Link>

            <Link 
              to="/browse" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-main)] hover:border-[var(--accent)]/50 transition"
            >
              Browse Library
              <ChevronRight size={18} />
            </Link>
          </div>
        </motion.div>

        {/* RIGHT */}
        <div className="relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <AnimatePresence>
              {displayGrid.map((src, i) => (
                <motion.div
                  key={src}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="aspect-[3/4] rounded-xl overflow-hidden border border-[var(--border)] shadow-lg hover:scale-105 transition"
                >
                  <img 
                    src={src} 
                    alt="cover" 
                    className="w-full h-full object-cover" 
                  />
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
