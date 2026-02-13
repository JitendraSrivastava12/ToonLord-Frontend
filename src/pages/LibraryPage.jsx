import React, { useState, useEffect, useMemo, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  MoreVertical,
  Bookmark,
  XCircle,
  PlayCircle,
  Layers,
} from "lucide-react";
import {
  fetchUserLibrary,
  updateMangaStatus,
  removeFromLibrary,
} from "../services/libraryApi";
import { AppContext } from "../UserContext";
import { Link } from "react-router-dom";

const LibrarySection = () => {
  const { isRedMode, currentTheme } = useContext(AppContext);
  const [libraryData, setLibraryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Reading");
  const [searchQuery, setSearchQuery] = useState("");

  const isDark = currentTheme === "dark";
  const activeAccent = isRedMode ? "#ef4444" : "var(--accent, #6366f1)";
  const textColor = isDark ? "text-[var(--text-main,white)]" : "text-slate-900";

  const tabs = [
    { id: "Reading", label: "Reading", icon: <PlayCircle size={16} /> },
    { id: "Favorite", label: "Favorites", icon: <Heart size={16} /> },
    { id: "Bookmarks", label: "Watchlist", icon: <Bookmark size={16} /> },
  ];

  const loadData = async () => {
    try {
      const { data } = await fetchUserLibrary();
      setLibraryData(data);
    } catch (err) {
      console.error("Registry Sync Failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("focus", loadData);
    return () => window.removeEventListener("focus", loadData);
  }, []);

  const handleStatusUpdate = async (mangaId, newStatus) => {
    try {
      setLibraryData((prev) =>
        prev.map((item) =>
          item.manga._id === mangaId ? { ...item, status: newStatus } : item
        )
      );
      await updateMangaStatus(mangaId, newStatus);
      loadData();
    } catch {
      loadData();
    }
  };

  const handleRemove = async (mangaId, status) => {
    try {
      setLibraryData((prev) =>
        prev.filter(
          (item) => !(item.manga._id === mangaId && item.status === status)
        )
      );
      await removeFromLibrary(mangaId, status);
    } catch (err) {
      console.error("Removal Failed", err);
      loadData();
    }
  };

  const filteredList = useMemo(() => {
    return libraryData
      .filter((item) => item.status === activeTab)
      .filter((item) =>
        item.manga.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.lastReadAt) - new Date(a.lastReadAt));
  }, [libraryData, activeTab, searchQuery]);

  if (loading)
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
        <div
          className="w-14 h-14 border-4 border-white/5 border-t-current rounded-full animate-spin"
          style={{ color: activeAccent }}
        />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
          Accessing Database...
        </p>
      </div>
    );

  return (
    <section
      className={`py-10 px-4 md:px-10 max-w-7xl mx-auto min-h-screen ${textColor}`}
    >
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tight leading-none">
            Registry<span style={{ color: activeAccent }}>.</span>
          </h1>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-[2px]"
              style={{ backgroundColor: activeAccent }}
            />
            <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-50">
              Sector: {activeTab} // {filteredList.length} Units
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative w-full lg:w-80 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30"
            size={18}
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className={`w-full py-4 pl-12 pr-6 rounded-xl border outline-none text-[11px] font-black uppercase tracking-widest transition-all
            ${
              isDark
                ? "bg-white/[0.03] border-white/10 focus:border-white/20"
                : "bg-slate-100 border-slate-200 focus:border-slate-400"
            }`}
          />
        </div>
      </div>

      {/* NAVIGATION */}
      <div
        className={`flex gap-4 mb-10 border-b ${
          isDark ? "border-white/5" : "border-slate-200"
        }`}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative
            ${activeTab === tab.id ? "" : "opacity-30 hover:opacity-60"}`}
            style={{ color: activeTab === tab.id ? activeAccent : "" }}
          >
            {tab.icon} {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tabUnderline"
                className="absolute bottom-[-1px] left-0 right-0 h-[3px] rounded-full"
                style={{ backgroundColor: activeAccent }}
              />
            )}
          </button>
        ))}
      </div>

      {/* GRID */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          {filteredList.length > 0 ? (
            filteredList.map((item, index) => (
              <Link
                to={
                  item.status === "Reading"
                    ? `/manga/${item.manga._id}/${item.progress || 1}`
                    : `/manga/${item.manga._id}`
                }
                key={`${item.manga._id}-${item.status}`}
              >
                <MangaCard
                  item={item}
                  index={index}
                  accent={activeAccent}
                  onRemove={handleRemove}
                  isDark={isDark}
                />
              </Link>
            ))
          ) : (
            <div className="col-span-full py-32 text-center opacity-30">
              <Layers size={50} className="mx-auto mb-6" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">
                No Entry Found
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

const MangaCard = ({ item, index, accent, onRemove, isDark }) => {
  const [showMenu, setShowMenu] = useState(false);
  const progress =
    item.totalChapters > 0
      ? (item.progress / item.totalChapters) * 100
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      className="group"
    >
      <div
        className={`relative aspect-[3/4] rounded-3xl overflow-hidden border transition-all duration-500 group-hover:-translate-y-2
        ${
          isDark
            ? "border-white/10"
            : "border-slate-200 shadow-sm"
        }`}
      >
        <img
          src={item.manga.coverImage}
          className="w-full h-full object-cover group-hover:scale-105 transition"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <div className="px-2 py-1 rounded-lg bg-black/60 text-[9px] font-black text-white">
            CH. {item.progress}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 rounded-lg bg-black/60 text-white"
          >
            <MoreVertical size={14} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`absolute right-0 top-10 w-40 rounded-xl overflow-hidden border shadow-xl z-50
                ${
                  isDark
                    ? "bg-[#0f0f11] border-white/10"
                    : "bg-white border-slate-200"
                }`}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemove(item.manga._id, item.status);
                    setShowMenu(false);
                  }}
                  className="w-full p-3 text-left text-[9px] font-black uppercase flex items-center gap-2 text-red-500 hover:bg-red-500/5"
                >
                  <XCircle size={14} /> Remove
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <h3 className="text-[12px] font-black uppercase italic text-white line-clamp-2">
            {item.manga.title}
          </h3>
          <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full"
              style={{ backgroundColor: accent }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LibrarySection;
