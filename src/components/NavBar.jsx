import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { 
  Search, Menu, Bell, UserCircle, ShieldAlert, 
  LogOut, LogIn, Sparkles, Cpu, MessageSquare, Heart, Star, 
  ChevronRight, Layers, BellOff, CheckCheck, Loader2, X 
} from "lucide-react";
import { AppContext } from "../UserContext";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";

function NavBar({ setIsSidebarOpen }) {
  const navigate = useNavigate();
  const { isLoggedIn, logout, isRedMode, toggleRedMode, currentTheme, user } = useContext(AppContext);
  
  // --- SEARCH STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  
  // --- UI STATES ---
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHidden, setIsHidden] = useState(false);
  
  // --- REFS ---
  const navRef = useRef(null);
  const bellRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  const { scrollY } = useScroll();

  // --- SHORTCUT KEY (CTRL + K) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // --- LIVE SEARCH LOGIC (Debounced) ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await axios.get(`http://localhost:5000/api/mangas/search/suggestions?q=${searchQuery}`);
          setSuggestions(res.data);
          setShowSearchDropdown(true);
        } catch (error) {
          console.error("Search Error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsBellOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- NOTIFICATION LOGIC ---
  const allowedCategories = ['reader', 'creator', 'system']; 
  const filteredNotifications = (user?.activityLog || []).filter(n => 
    allowedCategories.includes(n.category)
  );
  const unreadCount = filteredNotifications.filter(n => !n.isRead).length;
  const previewNotifications = [...filteredNotifications].reverse().slice(0, 5);

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await axios.patch('http://localhost:5000/api/users/notifications/read', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.reload(); 
    } catch (error) {
      console.error("Sync Error:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'received_like': return <Heart size={14} className="text-red-500 fill-red-500/10" />;
      case 'received_comment': return <MessageSquare size={14} className="text-blue-500 fill-blue-500/10" />;
      case 'milestone_reached': return <Star size={14} className="text-yellow-500 fill-yellow-500/10" />;
      default: return <Layers size={14} className="text-slate-400" />;
    }
  };

  // --- SCROLL HIDE LOGIC ---
  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious();
    if (latest > prev && latest > 150) setIsHidden(true);
    else setIsHidden(false);
  });

  // --- THEME & STYLES ---
  const isLight = currentTheme === 'light';
  const activeAccent = isRedMode ? "#ff003c" : (isLight ? "#2563eb" : "#3b82f6");

  const themeStyles = {
    glass: isLight ? "bg-white/80 border-black/[0.08] shadow-xl" : "bg-black/80 border-white/[0.1] shadow-2xl",
    text: isLight ? "text-slate-900" : "text-white",
    subtext: isLight ? "text-slate-500" : "text-slate-400",
    input: isLight ? "bg-black/[0.03] border-black/[0.05]" : "bg-white/[0.05] border-white/[0.1]",
    kbd: isLight ? "bg-white border-slate-200 text-slate-400" : "bg-white/5 border-white/10 text-white/40",
    dropdown: isLight ? "bg-white border-slate-200" : "bg-[#0a0a0a] border-white/10"
  };

  const handleMouseMove = (e) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.nav
      ref={navRef}
      onMouseMove={handleMouseMove}
      variants={{ visible: { y: 0, opacity: 1 }, hidden: { y: "-110%", opacity: 0 } }}
      animate={isHidden ? "hidden" : "visible"}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    className="fixed top-0 left-0 right-0 z-[100] px-2 sm:px-3 md:px-8 py-2 md:py-4"

    >
      <div
  className={`relative mx-auto max-w-[1440px] 
  h-14 md:h-20 
  flex items-center justify-between 
  px-2 sm:px-4 md:px-6 
  rounded-xl md:rounded-3xl 
  border backdrop-blur-2xl transition-all duration-700 
  ${themeStyles.glass}`}
>

        
        {/* Interactive Radial Glow */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-40"
          style={{ background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${activeAccent}15, transparent 70%)` }}
        />

        {/* LEFT SECTION: BRANDING */}
        <div className="flex items-center gap-2 md:gap-5 z-20">

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSidebarOpen(true)}
            className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl border transition-all ${themeStyles.input} ${themeStyles.text}`}
          >
            <Menu size={18} className="md:w-5 md:h-5" />
          </motion.button>
          
          <Link to="/" className="group flex items-center gap-2 md:gap-5">
            <div className="relative">
              <div className="absolute inset-0 blur-lg opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: activeAccent }} />
              <Cpu size={20} style={{ color: activeAccent }} className="relative z-10 md:w-6 md:h-6" />
            </div>
            <div className="flex flex-col leading-none">
              <span className={`text-base md:text-2xl font-black tracking-tighter italic ${themeStyles.text}`}>

                TOON<span style={{ color: activeAccent }}>LORD</span>
              </span>
              <span className={`text-[6px] md:text-[7px] font-bold tracking-[0.2em] uppercase ${themeStyles.subtext}`}>Premium Mangas</span>
            </div>
          </Link>
        </div>

        {/* CENTER SECTION: FUNCTIONAL SEARCH (DESKTOP) */}
        <div className="hidden lg:flex flex-1 max-w-xl mx-12 relative z-20" ref={searchRef}>
          <div className={`flex items-center w-full rounded-2xl border transition-all group focus-within:ring-2 ${themeStyles.input}`} style={{ "--tw-ring-color": `${activeAccent}33` }}>
            <div className="pl-4 pr-3">
              {isSearching ? <Loader2 size={18} className={`animate-spin ${themeStyles.subtext}`} /> : <Search size={18} className={themeStyles.subtext} />}
            </div>
            <input 
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
              placeholder="Search Mangas..."
              className={`w-full bg-transparent py-4 text-[11px] font-bold tracking-widest uppercase outline-none ${themeStyles.text}`}
            />
            
          </div>

          {/* SEARCH SUGGESTIONS DROPDOWN */}
          <AnimatePresence>
            {showSearchDropdown && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`absolute top-full left-0 right-0 mt-3 rounded-[2rem] border overflow-hidden shadow-2xl backdrop-blur-3xl p-2 ${themeStyles.dropdown}`}
              >
                {suggestions.map((manga) => (
                  <div
                    key={manga._id}
                    onClick={() => {
                      navigate(`/manga/${manga._id}`);
                      setShowSearchDropdown(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-4 p-3 hover:bg-white/[0.05] rounded-2xl cursor-pointer group transition-all"
                  >
                    <img src={manga.coverImage} alt="" className="w-10 h-14 object-cover rounded-xl border border-white/10" />
                    <div className="flex flex-col">
                      <span className={`text-[12px] font-black uppercase italic tracking-wider ${themeStyles.text}`}>{manga.title}</span>
                      <div className="flex items-center gap-2">
                         <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-bold uppercase">{manga.status || 'Ongoing'}</span>
                         <span className="text-[9px] flex items-center gap-1 text-yellow-500 font-bold"><Star size={10} fill="currentColor"/> {manga.rating || '0.0'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT SECTION: ACTIONS */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 z-20 relative">

          
          {/* Protocol Red Toggle (Desktop) */}
          <button
            onClick={() => toggleRedMode()}
            className="hidden lg:flex relative px-6 py-3 rounded-2xl transition-all active:scale-95 shadow-lg group overflow-hidden"
            style={{ backgroundColor: isRedMode ? '#ff003c' : (isLight ? '#000' : '#fff') }}
          >
            <div className="relative z-10 flex items-center gap-2">
              {isRedMode ? <ShieldAlert size={16} color="white" className="animate-pulse" /> : <Sparkles size={16} className={isLight ? 'text-white' : 'text-black'} />}
              <span className={`text-[11px] font-black uppercase tracking-tighter ${isLight || isRedMode ? 'text-white' : 'text-black'}`}>
                {isRedMode ? 'Protocol Red' : 'Enforce Secure'}
              </span>
            </div>
          </button>
          
          {/* BELL & DROPDOWN */}
          <div className="relative" ref={bellRef}>
            <button 
              onClick={() => setIsBellOpen(!isBellOpen)}
              className={`relative p-2 md:p-3 rounded-lg md:rounded-2xl border transition-all ${themeStyles.input}`}
            >
              <Bell size={20} className={unreadCount > 0 ? "text-yellow-400 fill-yellow-400" : themeStyles.text} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] md:min-w-[18px] md:h-[18px] px-1 bg-blue-600 text-white text-[8px] md:text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-black">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isBellOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className={`absolute right-0 mt-4 w-[280px] md:w-[340px] rounded-[2rem] md:rounded-[2.5rem] border overflow-hidden shadow-2xl backdrop-blur-3xl z-50 ${themeStyles.dropdown}`}
                >
                  <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <h3 className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] ${themeStyles.subtext}`}>Sync Registry</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 hover:bg-blue-600 transition-all">
                        <CheckCheck size={10} className="text-blue-500 group-hover:text-white" />
                        <span className="text-[8px] md:text-[9px] font-black text-blue-500 group-hover:text-white uppercase">Mark Read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-[300px] md:max-h-[380px] overflow-y-auto custom-scrollbar">
                    {previewNotifications.length > 0 ? (
                      previewNotifications.map((notif, idx) => (
                        <div 
                          key={notif._id || idx} 
                          onClick={() => { navigate("/notifications"); setIsBellOpen(false); }}
                          className={`group p-4 md:p-5 transition-all border-b border-white/[0.02] cursor-pointer flex gap-4 items-start ${!notif.isRead ? 'bg-blue-500/[0.03]' : 'hover:bg-white/[0.02]'}`}
                        >
                          <div className={`shrink-0 p-2 md:p-2.5 rounded-xl md:rounded-2xl border transition-colors ${!notif.isRead ? 'border-blue-500/30 bg-blue-500/5' : 'bg-white/5 border-white/5'}`}>
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[12px] md:text-[13px] leading-snug mb-1 ${themeStyles.text} ${!notif.isRead ? 'font-medium' : 'opacity-60'}`}>
                              <span className="font-black italic mr-1 text-blue-500">{notif.originator?.username || "System"}</span> 
                              {notif.description}
                            </p>
                            <div className="flex items-center gap-3">
                              <span className="text-[8px] md:text-[9px] font-mono font-bold opacity-30 uppercase">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {!notif.isRead && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 md:py-16 flex flex-col items-center justify-center opacity-20">
                        <BellOff size={40} className="mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Active Logs</p>
                      </div>
                    )}
                  </div>
                  <button onClick={() => { navigate("/notifications"); setIsBellOpen(false); }} className={`w-full py-5 md:py-6 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 border-t border-white/5 hover:bg-blue-600 hover:text-white ${themeStyles.text}`}>
                    Access Console <ChevronRight size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* USER PROFILE */}
          <Link to="/profile" className={`w-9 h-9 md:w-11 md:h-11 overflow-hidden rounded-xl md:rounded-2xl flex items-center justify-center border transition-all hover:scale-105 active:scale-95 ${themeStyles.input} ${themeStyles.text}`}>
            {user?.profilePicture ? <img src={user.profilePicture} alt="User" className="w-full h-full object-cover" /> : <UserCircle size={22} />}
          </Link>

          {/* AUTH TOGGLE */}
          <button 
            onClick={() => isLoggedIn ? logout() : navigate("/loginlanding")}
            className={`hidden md:flex p-3 rounded-2xl transition-all shadow-sm border ${isLoggedIn ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' : `${themeStyles.input} ${themeStyles.text}`}`}
          >
            {isLoggedIn ? <LogOut size={20} /> : <LogIn size={20} />}
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

export default NavBar;