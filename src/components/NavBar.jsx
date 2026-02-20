import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { 
  Search, Menu, Bell, UserCircle, ShieldAlert, 
  LogOut, LogIn, Sparkles, Cpu, MessageSquare, Heart, Star, 
  ChevronRight, Layers, BellOff, CheckCheck, Loader2, ShieldCheck,
  Wallet, Users, Crown
} from "lucide-react";
import { AppContext } from "../UserContext";
import { useAlert } from "../context/AlertContext"; 
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";

const API_URL = import.meta.env.VITE_API_URL;

function NavBar({ setIsSidebarOpen }) {
  const navigate = useNavigate();
  const { isLoggedIn, logout, isRedMode, toggleRedMode, currentTheme, user, isRedModeDisabledByAdmin } = useContext(AppContext);
  const { showAlert } = useAlert(); 
  
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHidden, setIsHidden] = useState(false);
  
  const navRef = useRef(null);
  const bellRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const { scrollY } = useScroll();

  const handleProtectedNavigation = (path) => {
    if (!isLoggedIn) {
      showAlert("Access Denied. Please login to access this feature.", "error");
      navigate("/loginlanding");
    } else {
      navigate(path);
    }
  };

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

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await axios.get(`${API_URL}/api/mangas/search/suggestions?q=${searchQuery}`);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) setIsBellOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSearchDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- NOTIFICATION LOGIC (FIXED) ---------------- */
  const allowedCategories = ['creator', 'system']; 
  const filteredNotifications = (user?.activityLog || []).filter(n => allowedCategories.includes(n.category));
  
  // Count unread for the badge
  const unreadCount = filteredNotifications.filter(n => !n.isRead).length;

  // DROPDOWN FILTER: Only show unread messages in the bell preview
  const previewNotifications = [...filteredNotifications]
    .filter(n => !n.isRead) 
    // Sort by timestamp descending (Newest first)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) 
    .slice(0, 5);
  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_URL}/api/users/notifications/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.reload(); 
    } catch (error) { console.error("Sync Error:", error); }
  };

  const isLight = currentTheme === 'light';
  const activeAccent = isRedMode ? '#ef4444' : 'var(--accent)';

  const getNotificationIcon = (category, type) => {
    if (category === 'system') return <ShieldCheck size={14} style={{ color: isRedMode ? '#fff' : '#ef4444' }} />;
    switch (type) {
      case 'received_like': return <Heart size={14} style={{ color: activeAccent }} />;
      case 'received_comment': return <MessageSquare size={14} style={{ color: activeAccent }} />;
      case 'milestone_reached': return <Star size={14} className="text-yellow-500" />;
      default: return <Layers size={14} className="text-slate-400" />;
    }
  };

  const themeStyles = {
    glass: isLight ? "bg-white/80 border-black/[0.08] shadow-xl" : "bg-black/80 border-white/[0.1] shadow-2xl",
    text: isLight ? "text-slate-900" : "text-white",
    subtext: isLight ? "text-slate-500" : "text-slate-400",
    input: isLight ? "bg-black/[0.03] border-black/[0.05]" : "bg-white/[0.05] border-white/[0.1]",
    dropdown: isLight ? "bg-white border-slate-200" : "bg-[#0a0a0a] border-white/10"
  };

  const handleMouseMove = (e) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious();
    if (latest > prev && latest > 150) setIsHidden(true);
    else setIsHidden(false);
  });

  return (
    <motion.nav
      ref={navRef}
      onMouseMove={handleMouseMove}
      variants={{ visible: { y: 0, opacity: 1 }, hidden: { y: "-110%", opacity: 0 } }}
      animate={isHidden ? "hidden" : "visible"}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="fixed top-0 left-0 right-0 z-[100] px-2 sm:px-3 md:px-8 py-2 md:py-4"
    >
      <div className={`relative mx-auto max-w-[1440px] h-14 md:h-20 flex items-center justify-between px-2 sm:px-4 md:px-6 rounded-xl md:rounded-3xl border backdrop-blur-2xl transition-all duration-700 ${themeStyles.glass}`}>
        
        <div className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-40"
          style={{ background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${activeAccent}15, transparent 70%)` }}
        />

        {/* LEFT: BRANDING */}
        <div className="flex items-center gap-2 md:gap-5 z-20">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsSidebarOpen(true)}
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
              <span className={`text-base md:text-2xl font-bold tracking-tighter italic ${themeStyles.text}`}>
                TOON<span style={{ color: activeAccent }}>LORD</span>
              </span>
              <span className={`text-[6px] md:text-[7px] font-bold tracking-[0.2em] uppercase ${themeStyles.subtext}`}>Premium Mangas</span>
            </div>
          </Link>
        </div>

        {/* CENTER: SEARCH */}
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
              placeholder="Search Mangas or Users..."
              className={`w-full bg-transparent py-4 text-[11px] font-bold tracking-widest uppercase outline-none ${themeStyles.text}`}
            />
          </div>

          <AnimatePresence>
            {showSearchDropdown && suggestions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className={`absolute top-full left-0 right-0 mt-3 rounded-[2rem] border overflow-hidden shadow-2xl backdrop-blur-3xl p-2 ${themeStyles.dropdown}`}
              >
                {suggestions.map((item) => {
                  const isUser = item.type === 'user';
                  return (
                    <div 
                      key={item._id} 
                      onClick={() => { 
                        navigate(isUser ? `/profile/${item._id}` : `/manga/${item._id}`); 
                        setShowSearchDropdown(false); 
                        setSearchQuery(""); 
                      }}
                      className="flex items-center gap-4 p-3 hover:bg-white/[0.05] rounded-2xl cursor-pointer group transition-all"
                    >
                      <div className="relative shrink-0">
                        <img 
                          src={isUser ? (item.profilePicture || '/default.png') : item.coverImage} 
                          alt="" 
                          className={`w-10 h-13 object-cover border border-white/10 ${isUser ? 'rounded-full aspect-square w-10 h-10' : 'rounded-xl'}`} 
                        />
                        <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-black ${isUser ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                           {isUser ? <Users size={8} className="text-white"/> : <Layers size={8} className="text-white" />}
                        </div>
                      </div>

                      <div className="flex flex-col flex-1 truncate">
                        <span className={`text-[12px] font-bold uppercase italic tracking-wider truncate ${themeStyles.text}`}>
                          {isUser ? item.username : item.title}
                        </span>
                        <div className="flex items-center gap-2">
                           <span className="text-[7px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-white/5" 
                                   style={{ backgroundColor: isUser ? '#3b82f620' : `${activeAccent}20`, color: isUser ? '#3b82f6' : activeAccent }}>
                            {isUser ? 'User Profile' : (item.status || 'Ongoing')}
                          </span>
                          {isUser && item.role === 'author' && <span className="text-[7px] text-amber-500 font-bold uppercase tracking-widest">[AUTHOR]</span>}
                        </div>
                      </div>
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-slate-500" />
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: ACTIONS */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 z-20 relative">
        {!isRedModeDisabledByAdmin && (
          <button onClick={() => toggleRedMode()}
            className="hidden lg:flex relative px-6 py-3 rounded-2xl transition-all active:scale-95 shadow-lg group overflow-hidden cursor-pointer"
            style={{ backgroundColor: activeAccent }}
          >
            <div className="relative z-10 flex items-center gap-2">
              {isRedMode ? (
                <ShieldAlert size={16} color="white" className="animate-pulse" />
              ) : (
                <Sparkles size={16} className={isLight ? 'text-white' : 'text-black'} />
              )}
              <span className={`text-[11px] font-bold uppercase tracking-tighter ${isLight || isRedMode ? 'text-white' : 'text-black'}`}>
                {isRedMode ? ' Red Mode' : 'Friendly Mode'}
              </span>
            </div>
          </button>
        )}
          
          <div className="relative" ref={bellRef}>
            <button onClick={() => setIsBellOpen(!isBellOpen)}
              className={`relative p-2 md:p-3 rounded-lg md:rounded-2xl border transition-all cursor-pointer ${themeStyles.input}`}
            >
              <Bell size={20} className={unreadCount > 0 ? "" : themeStyles.text} style={{ color: unreadCount > 0 ? activeAccent : 'inherit', fill: unreadCount > 0 ? `${activeAccent}40` : 'none' }} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] md:min-w-[18px] md:h-[18px] px-1 text-white text-[8px] md:text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-black"
                      style={{ backgroundColor: activeAccent }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isBellOpen && (
                <motion.div initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className={`absolute right-[-10px] md:right-0 mt-4 w-[260px] md:w-[340px] rounded-[1.5rem] md:rounded-[2.5rem] border overflow-hidden shadow-2xl backdrop-blur-3xl z-50 ${themeStyles.dropdown}`}
                >
                  <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <h3 className={`text-[10px] font-bold uppercase tracking-widest ${themeStyles.subtext}`}>Activity Log</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="group flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border"
                              style={{ backgroundColor: `${activeAccent}15`, borderColor: `${activeAccent}30` }}>
                        <CheckCheck size={10} style={{ color: activeAccent }} />
                        <span className="text-[9px] font-bold uppercase" style={{ color: activeAccent }}>Clear</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-[300px] md:max-h-[380px] overflow-y-auto custom-scrollbar">
                    {previewNotifications.length > 0 ? (
                      previewNotifications.map((notif, idx) => (
                        <div key={notif._id || idx} onClick={() => { navigate("/notifications"); setIsBellOpen(false); }}
                          className={`group p-4 md:p-5 transition-all border-b border-white/[0.02] cursor-pointer flex gap-3 md:gap-4 items-start bg-white/[0.03]`}
                        >
                          <div className={`shrink-0 p-2 rounded-lg md:rounded-2xl border transition-colors bg-white/5`}
                               style={{ borderColor: `${activeAccent}40` }}>
                            {getNotificationIcon(notif.category, notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[11px] md:text-[13px] leading-snug mb-1 ${themeStyles.text} font-medium`}>
                              <span className="font-bold mr-1" style={{ color: notif.category === 'system' ? '#ef4444' : activeAccent }}>
                                {notif.category === 'system' ? 'SYSTEM' : (notif.originator?.username || "CREATOR")}
                              </span> 
                              {notif.description}
                            </p>
                            <span className="text-[8px] md:text-[9px] font-mono opacity-40 uppercase tracking-tighter">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 md:py-16 flex flex-col items-center justify-center opacity-20">
                        <BellOff size={40} className="mb-4" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">No New Alerts</p>
                      </div>
                    )}
                  </div>
                  <button onClick={() => { navigate("/notifications"); setIsBellOpen(false); }} 
                          className={`w-full py-4 md:py-6 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-t border-white/5 hover:text-white ${themeStyles.text}`}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = activeAccent}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    {previewNotifications.length > 0 ? "View All Unread" : "Full History"} <ChevronRight size={14} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => handleProtectedNavigation("/wallet")} 
            className={`w-9 h-9 md:w-11 md:h-11 overflow-hidden rounded-xl md:rounded-2xl flex items-center justify-center border transition-all hover:scale-105 active:scale-95 cursor-pointer ${themeStyles.input} ${themeStyles.text}`}
          >
            <Wallet size={22} />
          </button>

          <button 
            onClick={() => handleProtectedNavigation("/profile")} 
            className="relative group flex items-center justify-center cursor-pointer"
          >
            {user?.vipStatus?.isVip ? (
              <div className="p-[2px] rounded-full bg-gradient-to-tr from-amber-400 via-amber-600 to-amber-300 shadow-[0_0_15px_rgba(217,119,6,0.2)]">
                <div className={`w-8 h-8 md:w-10 md:h-10 overflow-hidden rounded-full flex items-center justify-center ${isLight ? 'bg-white' : 'bg-black'}`}>
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle size={20} className={themeStyles.text} />
                  )}
                </div>
              </div>
            ) : (
              <div className={`w-9 h-9 md:w-11 md:h-11 overflow-hidden rounded-xl md:rounded-2xl flex items-center justify-center border transition-all hover:scale-105 active:scale-95 ${themeStyles.input} ${themeStyles.text}`}>
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={22} />
                )}
              </div>
            )}

            {user?.vipStatus?.isVip && (
              <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 border border-black z-10">
                <Crown size={8} className="text-white fill-current" />
              </div>
            )}
          </button>

          <button onClick={() => isLoggedIn ? logout() : navigate("/loginlanding")}
            className={`hidden md:flex p-3 rounded-2xl transition-all shadow-sm border cursor-pointer ${isLoggedIn ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer' : `${themeStyles.input} ${themeStyles.text}`}`}
          >
            {isLoggedIn ? <LogOut size={20} /> : <LogIn size={20} />}
          </button>
        </div>
      </div>
    </motion.nav>
  );
}

export default NavBar;