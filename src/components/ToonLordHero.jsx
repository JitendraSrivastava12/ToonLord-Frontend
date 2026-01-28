import React, { useState, useEffect, useContext } from 'react';
import { Zap, Play, ChevronRight, Flame } from 'lucide-react';
import { AppContext } from "../UserContext"; // Path to your Master Context
import { Link } from "react-router-dom";
// Load all images from folders
const mangaImages = Object.values(
  import.meta.glob('../assets/mangas/*.{jpg,jpeg,png,webp}', { eager: true })
).map(mod => mod.default);

const pornwahImages = Object.values(
  import.meta.glob('../assets/pornwahs/*.{jpg,jpeg,png,webp}', { eager: true })
).map(mod => mod.default);

const ToonLordHero = () => {
  // 1. Consume the master context
  const { isRedMode } = useContext(AppContext);
  const [displayGrid, setDisplayGrid] = useState([]);

  // 2. Content Sync Logic
  useEffect(() => {
    const pool = isRedMode ? pornwahImages : mangaImages;
    // Safety check in case folders are empty
    if (pool.length > 0) {
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      setDisplayGrid(shuffled.slice(0, 6));
    }
  }, [isRedMode]);

  const accentColor = isRedMode ? 'text-red-500' : 'text-green-400';
  const buttonBg = isRedMode
    ? 'bg-red-600 hover:bg-red-700 shadow-red-500/50'
    : 'bg-green-500 hover:bg-green-600 shadow-green-500/50';

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0f111a] to-[#1a1b2c] animate-gradient-bg -z-10"></div>
      <div 
        className="absolute -inset-20 blur-[150px] opacity-20 rounded-full mix-blend-color-dodge animate-pulse-slow transition-colors duration-1000"
        style={{ backgroundColor: isRedMode ? '#ef4444' : '#22c55e' }}
      ></div>

      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-16 relative z-10">

        {/* LEFT CONTENT */}
        <div className="flex-1 text-center lg:text-left z-20">
          <div className="inline-flex items-center gap-3 px-4 py-1 rounded-full bg-white/10 border border-white/20 mb-6 animate-fadeIn">
            {isRedMode ? <Flame size={16} className={accentColor} /> : <Zap size={16} className={accentColor} />}
            <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
              {isRedMode ? "Premium Adult Catalog" : "Evolution of Manga Reading"}
            </span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter italic leading-[0.85] mb-8 animate-slideIn">
            READ <span className={`${accentColor} transition-colors duration-500`}>{isRedMode ? "EROTICA." : "MANGA."}</span><br />
            EARN <span className="text-white">POINTS.</span><br />
            UNLOCK <span className="text-gray-600">PREMIUM.</span>
          </h1>

          <p className="hidden md:block text-gray-400 text-lg max-w-xl mb-10 leading-relaxed animate-fadeIn delay-200">
            {isRedMode
              ? "Access the world's most exclusive adult manhwa. High-definition art, uncensored stories, and daily updates."
              : "Dive into thousands of chapters. Read for free to earn points, then use them to unlock exclusive releases."}
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start animate-fadeIn delay-400">
            <Link to="/home" className={`flex items-center gap-3 px-10 py-4 rounded-2xl text-black font-black uppercase tracking-tighter transition-all transform hover:scale-105 hover:-translate-y-1 active:scale-95 shadow-lg ${buttonBg}`}>
              <Play size={20} fill="black" />
              Start Reading
            </Link>
            <Link to="/browse" className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-white/5 border border-white/20 hover:bg-white/10 transition-all font-bold text-gray-300">
              Browse All
              <ChevronRight size={20} />
            </Link>
          </div>
        </div>

        {/* RIGHT GRID */}
        <div className="flex-1 w-full relative">
          <div className="relative grid grid-cols-2 sm:grid-cols-3 gap-5 transform scale-95 transition-transform duration-700 hover:scale-100">
            {displayGrid.map((src, i) => (
              <div
                key={`${isRedMode}-${i}`}
                className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 shadow-2xl transition-all duration-700 hover:scale-110 hover:rotate-2 hover:z-20"
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <img
                  src={src}
                  alt="Cover"
                  className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                />
              </div>
            ))}
          </div>

          {/* Daily Bonus */}
          <div className="absolute -bottom-6 -left-6 bg-[#0f111a] border border-white/10 p-5 rounded-3xl shadow-2xl animate-float">
            <div className="flex items-center gap-3">
              <Zap size={22} className={accentColor} fill="currentColor" />
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase">Daily Bonus</p>
                <p className="font-black text-lg">+50 Points</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes gradient-bg {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-bg {
          background-size: 200% 200%;
          animation: gradient-bg 20s ease infinite;
        }
        .animate-pulse-slow {
          animation: pulse 8s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease forwards;
          opacity: 0;
        }
        .animate-slideIn {
          animation: slideIn 1s ease forwards;
          opacity: 0;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes fadeIn { to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
      `}</style>
    </section>
  );
};

export default ToonLordHero;