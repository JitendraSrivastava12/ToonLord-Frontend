import React, { useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FireIcon, ClockIcon, StarIcon } from "@heroicons/react/24/solid";
import { FaCrown } from "react-icons/fa";
import { AppContext } from "../UserContext";

const ToonLordHome = () => {
  const { isRedMode, currentTheme, familyMode } = useContext(AppContext);

  // Fetch mangas, red mode only affects filtering, not styling
  const { data: mangas = [], isLoading } = useQuery({
    queryKey: ["homeFeed", isRedMode, familyMode],
    queryFn: async () => {
      const endpoint = isRedMode ? "adult" : "general";
      const res = await axios.get(`http://localhost:5000/api/mangas/${endpoint}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  // Processed data: latest, trending, spotlight
  const processedData = useMemo(() => {
    let list = [...mangas];
    if (familyMode) list = list.filter(m => m.rating_type !== "18+");

    const latest = [...list]
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
      .slice(0, 24);

    const trending = [...list]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 24);

    const spotlight =
      trending.length > 0
        ? trending[Math.floor(Math.random() * Math.min(trending.length, 8))]
        : null;

    return { latest, trending, spotlight };
  }, [mangas, familyMode]);

  if (isLoading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] gap-4">
        <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[var(--text-dim)] animate-pulse">
          Fetching Data
        </p>
      </div>
    );

  return (
    <div
      className={`min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] pb-16 transition-all duration-700 theme-${currentTheme} py-28`}
    >
      {/* HERO SPOTLIGHT */}
      {processedData.spotlight && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group rounded-2xl sm:rounded-[2.5rem] bg-[var(--bg-secondary)]/30 backdrop-blur-2xl border border-[var(--border)] shadow-xl flex flex-col lg:flex-row items-center overflow-hidden min-h-[320px] sm:min-h-[360px]"
          >
            {/* Background Blur */}
            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-1000">
              <img
                src={processedData.spotlight.coverImage}
                className="w-full h-full object-cover blur-[50px] scale-110"
                alt=""
              />
            </div>

            {/* Spotlight Info */}
            <div className="relative z-10 flex-1 p-4 sm:p-8 lg:p-12 space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 rounded-lg bg-[var(--bg-primary)] shadow-lg">
                  <FaCrown className="text-yellow-500 text-base sm:text-lg" />
                </div>
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-dim)]">
                  Apex Entity Protocol
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black italic uppercase leading-tight sm:leading-[1] tracking-tight">
                {processedData.spotlight.title}
              </h1>

              <p className="text-[var(--text-dim)] text-sm sm:text-base max-w-lg leading-snug line-clamp-3 italic">
                {processedData.spotlight.description ||
                  "System Warning: No description data synchronized."}
              </p>

              <div className="flex flex-wrap gap-3 sm:gap-4 pt-1 sm:pt-2">
                <Link
                  to={`/manga/${processedData.spotlight._id}`}
                  className="px-6 sm:px-8 py-2 sm:py-3 text-white font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] rounded-lg sm:rounded-xl transition-all shadow-md hover:scale-105 active:scale-95"
                  style={{ backgroundColor: "var(--accent)" }}
                >
                  Decrypt Dossier
                </Link>

                <div className="px-4 sm:px-6 py-1 sm:py-2 border border-[var(--border)] rounded-lg flex items-center gap-2 sm:gap-3 bg-[var(--bg-primary)]/50">
                  <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: "var(--accent)" }} />
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-dim)]">
                    High Priority
                  </span>
                </div>
              </div>
            </div>

            {/* Spotlight Image */}
            <div className="relative z-10 hidden lg:block p-6 sm:p-8">
              <motion.div
                whileHover={{ rotate: 0, scale: 1.05 }}
                className="w-48 sm:w-56 h-[260px] sm:h-[300px] rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-xl border border-white/10 rotate-2 transition-all"
              >
                <img
                  src={processedData.spotlight.coverImage}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </motion.div>
            </div>
          </motion.div>
        </section>
      )}

      {/* ARCHIVE SECTIONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16">
        <ArchiveSection
          title="Temporal Updates"
          icon={<ClockIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          mangas={processedData.latest}
          badge="New"
        />

        <ArchiveSection
          title="High-Energy Flow"
          icon={<FireIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          mangas={processedData.trending}
          badge="Hot"
        />
      </div>
    </div>
  );
};

// Archive Section Component
const ArchiveSection = ({ title, icon, mangas, badge }) => (
  <section className="space-y-4 sm:space-y-6">
    <header className="flex items-center justify-between border-b border-[var(--border)] pb-2 sm:pb-3">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-2 rounded-lg sm:rounded-xl bg-[var(--bg-secondary)] text-[var(--accent)] shadow-md">
          {icon}
        </div>
        <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight">{title}</h2>
      </div>
      <button className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.25em] text-[var(--text-dim)] border border-[var(--border)] px-3 sm:px-5 py-1.5 sm:py-2 rounded-full hover:bg-[var(--accent)] hover:text-white transition">
        Expand Sector
      </button>
    </header>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {mangas.map((manga, i) => (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          viewport={{ once: true }}
          key={manga._id}
        >
          <Link to={`/manga/${manga._id}`} className="group flex flex-col">
            <div className="relative aspect-[3/4.2] rounded-xl sm:rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border)] transition-all duration-500 group-hover:border-[var(--accent)]/50 group-hover:-translate-y-1 group-hover:shadow-lg">
              <img
                src={manga.coverImage}
                className="w-full h-full object-cover grayscale-[0.25] group-hover:grayscale-0 transition"
                alt=""
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-50" />

              <div
                className={`absolute top-2 left-2 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[7px] sm:text-[9px] font-black uppercase tracking-widest text-white ${
                  badge === "Hot" ? "bg-orange-600" : "bg-blue-600"
                }`}
              >
                {badge}
              </div>

              <div className="absolute bottom-2 left-2">
                <span className="bg-black/60 backdrop-blur border border-white/10 text-white text-[7px] sm:text-[9px] font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg uppercase">
                  SEC_{manga.TotalChapter || 0}
                </span>
              </div>
            </div>

            <div className="mt-2 sm:mt-3 space-y-1 px-0.5">
              <h3 className="text-[9px] sm:text-xs font-black leading-tight line-clamp-2 uppercase tracking-tight group-hover:text-[var(--accent)] transition-colors">
                {manga.title}
              </h3>
              <div className="flex items-center justify-between text-[7px] sm:text-[9px] font-black italic tracking-widest text-[var(--text-dim)]">
                <div className="flex items-center gap-1 text-yellow-500">
                  <StarIcon className="w-3 h-3 sm:w-3 sm:h-3" />
                  <span>{manga.rating || "4.8"}</span>
                </div>
                <span className="opacity-30 uppercase">Verified</span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  </section>
);

export default ToonLordHome;
