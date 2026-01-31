import React, { useState, useEffect, useContext } from 'react';
import { Zap, Play, ChevronRight, Flame, ShieldAlert } from 'lucide-react';
import { AppContext } from "../UserContext"; 
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ASSET SYNC PROTOCOL
 */
const getAssetsByFolder = (folderName) => {
  try {
    const allAssets = import.meta.glob('../assets/**/*.{jpg,jpeg,png,webp,avif,jfif}', { eager: true });
    return Object.keys(allAssets)
      .filter(path => path.includes(`/${folderName}/`))
      .map(path => allAssets[path].default || allAssets[path]);
  } catch (error) {
    console.error(`Dossier Error: Failed to sync ${folderName} archive.`, error);
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
    if (!pool || pool.length === 0) pool = isRedMode ? mangaImages : pornwahImages;
    if (pool.length > 0) {
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      setDisplayGrid(shuffled.slice(0, 6));
    }
  }, [isRedMode]);

  // Dynamic accent and glow for theme support
  const accent = isRedMode ? '#ef4444' : 'var(--accent)';
  const glow = isRedMode ? 'rgba(239,68,68,0.4)' : 'var(--accent-glow)';

  return (
    <section className={`relative pt-12 pb-8 overflow-hidden transition-all duration-1000 theme-${currentTheme}`}>
      {/* Background layers */}
      <div className="absolute inset-0 bg-[var(--bg-primary)] -z-20 transition-colors duration-1000" />
      <div 
        className="absolute -top-40 -left-40 w-[600px] h-[600px] blur-[140px] opacity-20 rounded-full animate-pulse-slow transition-colors duration-1000 -z-10"
        style={{ backgroundColor: accent }}
      />

      <div className="container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-16 relative z-10">
        {/* Left Column: Operational Terminal */}
        <div className="flex-1 text-center lg:text-left">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] mb-8 shadow-xl"
          >
            {isRedMode 
              ? <ShieldAlert size={14} className="text-red-500" /> 
              : <Zap size={14} className="text-[var(--accent)]" />
            }
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[var(--text-dim)]">
              {isRedMode ? "Restricted Access Protocol" : "The Future of Manga Reading"}
            </span>
          </motion.div>

          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter italic leading-[0.8] mb-10 text-[var(--text-main)]">
            READ <span className="transition-colors duration-700" style={{ color: accent }}>{isRedMode ? "UNCENSORED." : "MANGA."}</span><br />
            EARN <span className="opacity-90">POINTS.</span><br />
            UNLOCK <span className="opacity-40">PREMIUM.</span>
          </h1>

          <p className="text-[var(--text-dim)] text-lg lg:text-xl max-w-xl mb-6 font-medium leading-relaxed italic opacity-80">
            {isRedMode
              ? "Access the realm's most exclusive adult manhwa. High-definition art, uncensored story arcs, and instant decryption."
              : "Dive into a massive archive of legendary titles. Read to accumulate points, then bypass paywalls for new releases."}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start mb-12">
            <Link 
              to="/home" 
              className="group flex items-center gap-4 px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all hover:scale-105 active:scale-95 shadow-2xl text-white"
              style={{ backgroundColor: accent, boxShadow: `0 15px 30px -10px ${glow}` }}
            >
              <Play size={18} fill="currentColor" />
              Start The Uplink
            </Link>
            
            <Link 
              to="/browse" 
              className="flex items-center gap-2 px-10 py-5 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all font-black text-xs uppercase tracking-widest text-[var(--text-dim)] hover:text-[var(--text-main)] shadow-xl"
            >
              Browse Catalog
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>

        {/* Right Column: Visual Archive Grid */}
        <div className="flex-1 w-full relative perspective-[2000px]">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 rotate-2 hover:rotate-0 transition-transform duration-1000 ease-out">
            <AnimatePresence mode="popLayout">
              {displayGrid.length > 0 ? displayGrid.map((src, i) => (
                <motion.div
                  key={`${src}-${i}`}
                  initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  className="aspect-[3/4] rounded-3xl overflow-hidden border border-[var(--border)] shadow-2xl hover:border-[var(--accent)]/50 hover:scale-110 hover:-translate-y-4 hover:z-30 transition-all duration-500 bg-[var(--bg-secondary)]"
                >
                  <img src={src} alt="Archive Data" className="w-full h-full object-cover transition-transform duration-700 grayscale-[0.3] hover:grayscale-0" />
                </motion.div>
              )) : (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border)] animate-pulse" />
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Points Bonus HUD */}
          
        </div>
      </div>

      <style>{`
        .animate-pulse-slow { animation: pulse 10s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { transform: scale(1); opacity:0.1; } 50% { transform: scale(1.2); opacity:0.25; } }
      `}</style>
    </section>
  );
};

export default ToonLordHero;
