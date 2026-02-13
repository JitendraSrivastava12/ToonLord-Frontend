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

  const { data: mangas = [], isLoading } = useQuery({
    queryKey: ["homeFeed", isRedMode, familyMode],
    queryFn: async () => {
      const endpoint = isRedMode ? "adult" : "general";
      const res = await axios.get(`http://localhost:5000/api/mangas/${endpoint}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  const processedData = useMemo(() => {
    let list = [...mangas];
    if (familyMode) list = list.filter(m => m.rating_type !== "18+");

    const latest = [...list]
      .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
      .slice(0, 20);

    const trending = [...list]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 20);

    const spotlight =
      trending.length > 0
        ? trending[Math.floor(Math.random() * trending.length)]
        : null;

    return { latest, trending, spotlight };
  }, [mangas, familyMode]);

  if (isLoading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs tracking-widest text-[var(--text-dim)] uppercase">
          Loading
        </p>
      </div>
    );

  return (
    <div className={`min-h-screen pb-20 theme-${currentTheme}`}>
      {/* HERO SPOTLIGHT */}
      {processedData.spotlight && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-[2.5rem] bg-[var(--bg-secondary)]/30 backdrop-blur-2xl border border-[var(--border)] shadow-xl flex flex-col lg:flex-row items-center overflow-hidden min-h-[360px] sm:min-h-[420px]"
          >
            {/* BACKGROUND BLUR */}
            <div className="absolute inset-0 opacity-10">
              <img
                src={processedData.spotlight.coverImage}
                className="w-full h-full object-cover blur-[60px] scale-110"
                alt=""
              />
            </div>

            {/* TEXT */}
            <div className="relative z-10 flex-1 p-6 sm:p-10 lg:p-14 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--bg-primary)] shadow">
                  <FaCrown className="text-yellow-500 text-lg" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--text-dim)]">
                  Spotlight
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight line-clamp-3">
                {processedData.spotlight.title}
              </h1>

              <p className="text-sm sm:text-base text-[var(--text-dim)] max-w-xl line-clamp-3">
                {processedData.spotlight.description ||
                  "No description available for this title."}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to={`/manga/${processedData.spotlight._id}`}
                  className="px-8 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold hover:scale-105 transition"
                >
                  Read Now
                </Link>

                <span className="px-5 py-3 rounded-xl border border-[var(--border)] text-sm text-[var(--text-dim)]">
                  Trending
                </span>
              </div>
            </div>

            {/* IMAGE */}
            <div className="relative z-10 hidden lg:block p-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-60 h-[340px] rounded-[2rem] overflow-hidden shadow-xl border border-white/10"
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

      {/* SECTIONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-14">
        <ArchiveSection
          title="Latest Updates"
          icon={<ClockIcon className="w-5 h-5" />}
          mangas={processedData.latest}
          badge="New"
        />

        <ArchiveSection
          title="Trending Now"
          icon={<FireIcon className="w-5 h-5" />}
          mangas={processedData.trending}
          badge="Hot"
        />
      </div>
    </div>
  );
};

const ArchiveSection = ({ title, icon, mangas, badge }) => (
  <section className="space-y-6">
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-[var(--bg-secondary)] text-[var(--accent)]">
          {icon}
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold">{title}</h2>
      </div>
      <button className="text-sm text-[var(--text-dim)] hover:text-[var(--text-main)] transition">
        View all →
      </button>
    </header>

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {mangas.map((manga, i) => (
        <motion.div
          key={manga._id}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          viewport={{ once: true }}
        >
          <Link to={`/manga/${manga._id}`} className="group block">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)] transition group-hover:shadow-lg group-hover:-translate-y-1">
              <img
                src={manga.coverImage}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />

              <span
                className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-semibold text-white ${
                  badge === "Hot" ? "bg-orange-500" : "bg-blue-500"
                }`}
              >
                {badge}
              </span>
            </div>

            <div className="mt-2 space-y-1">
              <h3 className="text-sm font-medium line-clamp-2 group-hover:text-[var(--accent)] transition">
                {manga.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-[var(--text-dim)]">
                <div className="flex items-center gap-1 text-yellow-500">
                  <StarIcon className="w-3 h-3" />
                  <span>{manga.rating || "4.8"}</span>
                </div>
                <span>{manga.TotalChapter || 0} ch</span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  </section>
);

export default ToonLordHome;
