import React, { useState, useEffect, useMemo, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  Loader2,
  MoreVertical,
  Bookmark,
  XCircle,
  PlayCircle,
  Layers,
} from "lucide-react";
// Added removeFromLibrary to imports
import { fetchUserLibrary, updateMangaStatus, removeFromLibrary } from "../services/libraryApi";
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
          item.manga._id === mangaId ? { ...item, status: newStatus } : item,
        ),
      );
      await updateMangaStatus(mangaId, newStatus);
      loadData();
    } catch (err) {
      loadData();
    }
  };

  // NEW: Handle Remove Function
  const handleRemove = async (mangaId, status) => {
    try {
      // Optimistic UI Update
      setLibraryData((prev) =>
        prev.filter((item) => !(item.manga._id === mangaId && item.status === status))
      );
      // Backend Call
      await removeFromLibrary(mangaId, status);
    } catch (err) {
      console.error("Removal Failed", err);
      loadData(); // Rollback on failure
    }
  };

  const filteredList = useMemo(() => {
    return libraryData
      .filter((item) => item.status === activeTab)
      .filter((item) =>
        item.manga.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => new Date(b.lastReadAt) - new Date(a.lastReadAt));
  }, [libraryData, activeTab, searchQuery]);

  if (loading)
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
        <div
          className="w-16 h-16 border-4 border-white/5 border-t-current rounded-full animate-spin"
          style={{ color: activeAccent }}
        />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">
          Accessing Database...
        </p>
      </div>
    );

  return (
    <section className={`py-12 px-4 md:px-12 max-w-[1700px] mx-auto min-h-screen  ${textColor}`}>
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
        <div className="space-y-2">
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">
            Registry<span style={{ color: activeAccent }}>.</span>
          </h1>
          <div className="flex items-center gap-3">
            <div className="w-10 h-[2px]" style={{ backgroundColor: activeAccent }} />
            <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-50">
              Sector: {activeTab} // {filteredList.length} Units
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" size={18} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}...`}
            className={`w-full py-5 pl-14 pr-8 rounded-2xl border outline-none text-[11px] font-black uppercase tracking-widest transition-all
              ${isDark ? "bg-white/[0.03] border-white/10 focus:border-white/20" : "bg-slate-100 border-slate-200 focus:border-slate-400"}`}
          />
        </div>
      </div>

      {/* NAVIGATION */}
      <div className={`flex gap-2 md:gap-8 mb-12 border-b ${isDark ? "border-white/5" : "border-slate-200"}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 md:px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-10"
        >
          {filteredList.length > 0 ? (
            filteredList.map((item, index) => (
              <Link 
                to={item.status === 'Reading' 
                    ? `/manga/${item.manga._id}/${item.progress || 1}` 
                    : `/manga/${item.manga._id}`} 
                key={`${item.manga._id}-${item.status}`}
              >
                <MangaCard
                  item={item}
                  index={index}
                  accent={activeAccent}
                  onStatusChange={handleStatusUpdate}
                  onRemove={handleRemove}
                  isDark={isDark}
                />
              </Link>
            ))
          ) : (
            <div className="col-span-full py-40 text-center opacity-20">
              <Layers size={60} className="mx-auto mb-6" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">
                No Entry Found in this Sector
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

/* MANGA CARD COMPONENT */
const MangaCard = ({ item, index, accent, onStatusChange, onRemove, isDark }) => {
  const [showMenu, setShowMenu] = useState(false);
  const progress = item.totalChapters > 0 ? (item.progress / item.totalChapters) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      className="group"
    >
      <div className={`relative aspect-[3/4.2] rounded-[2.5rem] overflow-hidden border transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]
        ${isDark ? "border-white/10" : "border-slate-200 shadow-sm"}`}
      >
        <img src={item.manga.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

        {/* Floating Badges */}
        <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-30">
          <div className="px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black text-white uppercase tracking-tighter">
            CH. {item.progress}
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault(); // Stop Link
                e.stopPropagation(); // Stop Link
                setShowMenu(!showMenu);
              }}
              className="p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <MoreVertical size={14} />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className={`absolute right-0 mt-3 w-44 rounded-2xl overflow-hidden shadow-2xl z-50 border
                    ${isDark ? "bg-[#0f0f11] border-white/10" : "bg-white border-slate-200"}`}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemove(item.manga._id, item.status);
                      setShowMenu(false);
                    }}
                    className="w-full p-4 text-left text-[9px] font-black uppercase flex items-center gap-3 text-red-500 hover:bg-red-500/5 transition-colors"
                  >
                    <XCircle size={14} /> Remove Entry
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Progress Bar overlay */}
        <div className="absolute bottom-6 left-6 right-6 z-20 space-y-3">
          <h3 className="text-[13px] font-black uppercase italic leading-tight text-white line-clamp-2 tracking-tighter">
            {item.manga.title}
          </h3>
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full"
              style={{ backgroundColor: accent }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LibrarySection;