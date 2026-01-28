import React, { useContext } from "react"; // Added useContext
import { Link } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { FireIcon, ClockIcon, StarIcon } from "@heroicons/react/24/solid";
import { FaCrown } from "react-icons/fa";
import { AppContext } from "../UserContext"; // Import your Master Context

const ToonLordHome = () => {
  // 1. Swap useOutletContext for our Master Context
  const { isRedMode } = useContext(AppContext);

  const { data: mangas = [], isLoading } = useQuery({
    // Adding isRedMode to queryKey ensures it re-fetches when mode changes
    queryKey: ["homeFeed", isRedMode],
    queryFn: async () => {
      const endpoint = isRedMode ? "adult" : "general";
      const res = await axios.get(`http://localhost:5000/api/mangas/${endpoint}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });

  // Sorting Logic
  const latest = React.useMemo(() => 
    [...mangas]
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
      .slice(0, 40), 
  [mangas]);

  const trending = React.useMemo(() => 
    [...mangas]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 40), 
  [mangas]);

  // Spotlight Logic
  const spotlight = React.useMemo(() => {
    if (trending.length === 0) return null;
    const pool = trending.slice(0, 10);
    return pool[Math.floor(Math.random() * pool.length)];
  }, [trending]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 bg-[#0f0f0f]">
        <div className={`w-12 h-12 border-4 ${isRedMode ? 'border-red-500' : 'border-green-500'} border-t-transparent rounded-full animate-spin`}></div>
        <p className="text-gray-400 font-medium animate-pulse text-xs tracking-widest uppercase">Initializing Dossiers...</p>
      </div>
    );
  }

  const monoStyle = "font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500";

  return (
    <div className={`bg-[#0f0f0f] min-h-screen text-white pb-20 selection:${isRedMode ? 'bg-red-600/30' : 'bg-green-600/30'}`}>
      
      {/* ===== 1. DYNAMIC APEX SPOTLIGHT BANNER ===== */}
      <section className="relative pt-8 pb-12 px-4 max-w-7xl mx-auto">
        {spotlight && (
          <div className="relative group overflow-hidden rounded-[2.5rem] bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col md:flex-row items-center h-auto md:h-[450px] transition-all duration-700">
            <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-1000">
              <img src={spotlight.coverImage} className="w-full h-full object-cover blur-3xl scale-110" alt="" />
            </div>

            <div className="relative z-20 flex-1 p-8 md:p-16 space-y-6">
              <div className="flex items-center gap-3">
                <FaCrown className="text-yellow-500 animate-pulse" />
                <span className={monoStyle}>Apex Entity Rotated</span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase leading-[0.8] drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transition-all">
                {spotlight.title}
              </h1>
              
              <p className="text-gray-400 text-sm md:text-base font-medium line-clamp-3 max-w-xl leading-relaxed italic">
                {spotlight.description || "Warning: Dossier data corrupted for this entity. Proceed with maximum caution."}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link 
                  to={`/manga/${spotlight._id}`} 
                  className={`px-10 py-4 ${isRedMode ? 'bg-red-600' : 'bg-green-600'} text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all shadow-xl active:scale-95`}
                >
                  Enter Dossier
                </Link>
                
                <div className="px-6 py-3 border border-white/10 rounded-xl flex items-center gap-3 bg-black/40 backdrop-blur-lg">
                  <div className={`w-2 h-2 rounded-full ${isRedMode ? 'bg-red-500' : 'bg-green-500'} animate-ping`} />
                  <span className={monoStyle}>Priority: High</span>
                </div>
              </div>
            </div>

            <div className="relative z-20 w-full md:w-[400px] h-full p-10 hidden md:block">
              <div className="relative h-full w-full">
                <img 
                  src={spotlight.coverImage} 
                  className="w-full h-full object-cover rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/20 transform rotate-2 group-hover:rotate-0 transition-transform duration-700 ease-out" 
                  alt={spotlight.title} 
                />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ===== 2. ARCHIVE GRIDS ===== */}
      <div className="max-w-7xl mx-auto px-4 space-y-20">
        <Section title="Active Updates" icon={<ClockIcon className="w-4 h-4" />} color={isRedMode ? "bg-blue-600" : "bg-emerald-600"}>
          <Grid mangas={latest} showBadge="New" isRedMode={isRedMode} />
        </Section>

        <Section title="High-View Entities" icon={<FireIcon className="w-4 h-4" />} color={isRedMode ? "bg-red-600" : "bg-orange-600"}>
          <Grid mangas={trending} showBadge="Hot" isRedMode={isRedMode} />
        </Section>
      </div>
    </div>
  );
};

const Section = ({ title, children, icon, color }) => (
  <section>
    <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
      <div className="flex items-center gap-3">
        <span className={`${color} p-1.5 rounded-lg text-white shadow-lg`}>
          {icon}
        </span>
        <h2 className="text-3xl font-black uppercase tracking-tighter italic">{title}</h2>
      </div>
      <button className="text-[9px] text-gray-500 hover:text-white transition-all uppercase font-black tracking-[0.2em] border border-white/10 px-5 py-2 rounded-full hover:bg-white/5">
        Expand Archive
      </button>
    </div>
    {children}
  </section>
);

const Grid = ({ mangas, showBadge, isRedMode }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
    {mangas.map((manga) => (
      <Link
        to={`/manga/${manga._id}`}
        key={manga._id}
        className="group relative flex flex-col"
      >
        <div className={`relative aspect-[3/4.5] rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl border border-white/5 transition-all duration-500 group-hover:${isRedMode ? 'border-red-500/50' : 'border-green-500/50'} group-hover:-translate-y-2`}>
          <img
            src={manga.coverImage}
            alt={manga.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent opacity-80" />

          {showBadge && (
            <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest shadow-2xl ${
              showBadge === 'Hot' ? (isRedMode ? 'bg-red-600' : 'bg-orange-600') : 'bg-blue-600'
            }`}>
              {showBadge}
            </div>
          )}

          <div className="absolute bottom-3 left-3">
             <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-tighter">
                Vol. {manga.TotalChapter || 0}
             </span>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <h3 className={`text-xs font-black leading-snug line-clamp-2 group-hover:${isRedMode ? 'text-red-500' : 'text-green-500'} transition-colors uppercase tracking-tight`}>
            {manga.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-[9px] text-yellow-500 font-black">
              <StarIcon className="w-3 h-3 mr-0.5" />
              <span>{manga.rating || "4.5"}</span> 
            </div>
            <span className="text-[9px] text-zinc-600 uppercase font-black italic tracking-tighter">Verified</span>
          </div>
        </div>
      </Link>
    ))}
  </div>
);

export default ToonLordHome;