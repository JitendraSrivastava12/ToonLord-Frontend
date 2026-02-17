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

  return (
    <section className={`relative theme-${currentTheme}`}>
      {/* very soft background accent */}
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
            <AnimatePresence>
              {displayGrid.map((src, i) => (
                <motion.div
                  key={src}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="aspect-[3/4] rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)]"
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
