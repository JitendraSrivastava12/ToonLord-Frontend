import React, { useState, useEffect, useMemo, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Heart,
  MoreVertical,
  Bookmark,
  Trash2,
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
  const textColor = isDark ? "text-white" : "text-slate-900";

  const tabs = [
    { id: "Reading", label: "Reading", icon: <PlayCircle size={18} /> },
    { id: "Favorite", label: "Favorites", icon: <Heart size={18} /> },
    { id: "Bookmarks", label: "Watchlist", icon: <Bookmark size={18} /> },
  ];

  const loadData = async () => {
    try {
      const { data } = await fetchUserLibrary();
      setLibraryData(data);
    } catch (err) {
      console.error("Library sync failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("focus", loadData);
    return () => window.removeEventListener("focus", loadData);
  }, []);

  const handleRemove = async (mangaId, status) => {
    try {
      setLibraryData((prev) =>
        prev.filter(
          (item) => !(item.manga._id === mangaId && item.status === status)
        )
      );
      await removeFromLibrary(mangaId, status);
    } catch (err) {
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
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <div
          className="w-12 h-12 border-4 border-slate-200 border-t-current rounded-full animate-spin"
          style={{ color: activeAccent }}
        />
        <p className="text-sm font-medium opacity-50 uppercase tracking-widest">
          Loading Library...
        </p>
      </div>
    );

  return (
    <section className={`py-6 px-4 md:px-10 max-w-7xl mx-auto min-h-screen ${textColor}`}>
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight italic">
            My Library<span style={{ color: activeAccent }}>.</span>
          </h1>
          <p className="text-xs font-bold opacity-50 mt-1 uppercase tracking-wider">
            {activeTab} — {filteredList.length} titles found
          </p>
        </div>

        {/* SEARCH - Full width on mobile */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={18} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            className={`w-full py-3 pl-11 pr-4 rounded-2xl border outline-none text-sm font-semibold transition-all
            ${isDark ? "bg-white/5 border-white/10 focus:border-white/30" : "bg-slate-100 border-slate-200 focus:border-slate-400"}`}
          />
        </div>
      </div>

      {/* NAVIGATION TABS - Scrollable on very small screens */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap relative transition-all
            ${activeTab === tab.id ? "" : "opacity-40 hover:opacity-100"}`}
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

      {/* GRID - Optimized column counts */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8"
        >
          {filteredList.length > 0 ? (
            filteredList.map((item, index) => (
              <Link
                to={item.status === "Reading" ? `/manga/${item.manga._id}/${item.progress || 1}` : `/manga/${item.manga._id}`}
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
            <div className="col-span-full py-32 text-center opacity-20">
              <Layers size={64} className="mx-auto mb-4" />
              <p className="text-lg font-bold uppercase tracking-widest">No titles found</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

const MangaCard = ({ item, index, accent, onRemove, isDark }) => {
  const [showMenu, setShowMenu] = useState(false);
  const progress = item.totalChapters > 0 ? (item.progress / item.totalChapters) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      className="group flex flex-col h-full"
    >
      <div className={`relative aspect-[3/4.2] rounded-[2rem] overflow-hidden border transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-1
        ${isDark ? "border-white/10" : "border-slate-200"}`}>
        
        <img src={item.manga.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        {/* Top Info */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <div className="px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/10">
            CH. {item.progress}
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 rounded-xl bg-black/70 backdrop-blur-md text-white hover:bg-black transition-colors"
            >
              <MoreVertical size={16} />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  className={`absolute right-0 mt-2 w-36 rounded-2xl overflow-hidden border shadow-2xl z-50
                  ${isDark ? "bg-[#0f0f11] border-white/10" : "bg-white border-slate-200"}`}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemove(item.manga._id, item.status);
                      setShowMenu(false);
                    }}
                    className="w-full p-4 text-left text-xs font-bold uppercase flex items-center gap-3 text-red-500 hover:bg-red-500/5 transition-colors"
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug mb-3 uppercase tracking-tight">
            {item.manga.title}
          </h3>
          
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
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