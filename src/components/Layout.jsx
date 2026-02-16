import React, { useState, useContext, useEffect, useRef } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Home, Compass, Library, LayoutDashboard, User, FileUp,
  BarChart3, Settings as SettingsIcon, Cpu, Linkedin, Github, Youtube,
  Search, ShieldAlert, Star, Loader2, LogOut, LogIn, Sparkles, Users, Layers
} from "lucide-react";
import NavBar from "./NavBar";
import { AppContext } from "../UserContext";
import { useAlert } from "../context/AlertContext";

const API_URL = import.meta.env.VITE_API_URL;

// Updated SocialIcon to accept an href prop
const SocialIcon = ({ icon, accent, href }) => (
  <a 
    href={href}
    target="_blank" 
    rel="noopener noreferrer"
    className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all hover:scale-110 active:scale-90"
    onMouseEnter={(e) => e.currentTarget.style.color = accent}
    onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
  >
    {icon}
  </a>
);

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isLoggedIn, logout, isRedMode, toggleRedMode, currentTheme, user } = useContext(AppContext);
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();

  // --- MOBILE SEARCH STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  const isLight = currentTheme === "light";
  const activeAccent = isRedMode ? '#ef4444' : 'var(--accent)';

  // --- LIVE SEARCH LOGIC ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await axios.get(`${API_URL}/api/mangas/search/suggestions?q=${searchQuery}`);
          setSuggestions(res.data);
        } catch (error) {
          console.error("Search Error:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const themeStyles = {
    sidebarBg: isLight ? "bg-white/80 backdrop-blur-2xl" : "bg-black/80 backdrop-blur-2xl",
    border: isLight ? "border-black/10" : "border-white/10",
    text: isLight ? "text-slate-900" : "text-white",
    dim: isLight ? "text-slate-500" : "text-slate-400",
    itemHover: isLight ? "hover:bg-black/5" : "hover:bg-white/5",
    mainBg: isLight ? "bg-slate-50" : "bg-[#050505]",
    input: isLight ? "bg-black/5 border-black/5" : "bg-white/5 border-white/5"
  };

  const navSections = [
    {
      title: "Navigation",
      items: [
        { icon: <Home size={18} />, to: "/home", label: "Home" },
        { icon: <Compass size={18} />, to: "/browse", label: "Browse" },
        { icon: <Library size={18} />, to: "/library", label: "Library" },
        { icon: <User size={18} />, to: "/profile", label: "Profile" },
        { icon: <BarChart3 size={18} />, to: "/analytics", label: "Analytics" },
        { icon: <SettingsIcon size={18} />, to: "/settings", label: "Settings" },
      ]
    },
    {
      title: "Creator Studio",
      items: [
        { icon: <LayoutDashboard size={18} />, to: "/dashboard", label: "Dashboard" },
        { icon: <Library size={18} />, to: "/my-series", label: "My Series" },
        { icon: <FileUp size={18} />, to: "/upload", label: "Upload" },
      ]
    }
  ];

  const protectedRoutes = ["/profile", "/library", "/dashboard", "/my-series", "/upload", "/analytics"];

  const handleNavigationAccess = (e, item, sectionTitle) => {
    const isProtected = protectedRoutes.includes(item.to);
    const isCreatorSection = sectionTitle === "Creator Studio";

    if (!isLoggedIn && isProtected) {
      e.preventDefault();
      showAlert("Access Denied: Login Required", "error");
      setIsSidebarOpen(false);
      return;
    }

    if (isCreatorSection && user?.role === "reader") {
      e.preventDefault();
      showAlert("Creators only. Apply in Profile.", "error");
      return;
    }

    setIsSidebarOpen(false);
  };

  return (
    <div className={`min-h-screen ${themeStyles.mainBg} ${themeStyles.text} transition-colors duration-500`}>
      
      {/* SIDEBAR */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className={`fixed top-0 left-0 z-[1001] h-full w-[280px] sm:w-[320px] border-r ${themeStyles.border} ${themeStyles.sidebarBg} shadow-2xl flex flex-col`}
          >
            <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${activeAccent}, transparent)` }} />

            <div className="flex flex-col h-full">
              {/* HEADER */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <Cpu size={22} style={{ color: activeAccent }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold tracking-tighter text-xl italic leading-none">
                      TOON<span style={{ color: activeAccent }}>LORD</span>
                    </span>
                    <span className={`text-[8px] font-bold uppercase tracking-[0.3em] ${themeStyles.dim}`}>Premium Mangas</span>
                  </div>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className={`p-2 rounded-xl ${themeStyles.itemHover} transition-all`}>
                  <X size={20}/>
                </button>
              </div>

              {/* MOBILE SEARCH SECTION */}
              <div className="px-5 mb-6 lg:hidden">
                <div className={`flex items-center rounded-2xl border transition-all ${themeStyles.input} focus-within:ring-2`} style={{ "--tw-ring-color": `${activeAccent}33` }}>
                  <div className="pl-4 pr-2">
                    {isSearching ? <Loader2 size={16} className="animate-spin text-slate-500"/> : <Search size={16} className="text-slate-500"/>}
                  </div>
                  <input 
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search titles or users..."
                    className="w-full bg-transparent py-3.5 text-[10px] font-bold uppercase tracking-widest outline-none"
                  />
                  {searchQuery && <X size={14} className="mr-3 opacity-40 cursor-pointer" onClick={() => setSearchQuery("")} />}
                </div>

                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }}
                      className={`mt-2 rounded-2xl border ${themeStyles.border} overflow-hidden max-h-[300px] overflow-y-auto bg-black/20 shadow-inner`}
                    >
                      {suggestions.map((item) => {
                        const isUser = item.type === 'user';
                        return (
                          <div 
                            key={item._id} 
                            onClick={() => { 
                              navigate(isUser ? `/profile/${item._id}` : `/manga/${item._id}`); 
                              setIsSidebarOpen(false); 
                              setSearchQuery("");
                            }}
                            className={`flex items-center gap-3 p-3 transition-all cursor-pointer border-b last:border-0 ${themeStyles.border} ${themeStyles.itemHover}`}
                          >
                            <div className="relative shrink-0">
                                <img 
                                  src={isUser ? (item.profilePicture || '/default.png') : item.coverImage} 
                                  className={`w-9 h-11 object-cover ${isUser ? 'rounded-full aspect-square w-9 h-9' : 'rounded-lg'} border border-white/10`} 
                                  alt="" 
                                />
                                <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full border border-black ${isUser ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                                    {isUser ? <Users size={8} className="text-white"/> : <Layers size={8} className="text-white" />}
                                </div>
                            </div>

                            <div className="flex flex-col min-w-0">
                              <span className="text-[11px] font-bold truncate uppercase italic leading-tight">
                                {isUser ? item.username : item.title}
                              </span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[7px] font-black uppercase tracking-widest ${isUser ? 'text-blue-400' : 'text-emerald-400'}`}>
                                  {isUser ? (item.role || 'Member') : (item.status || 'Active')}
                                </span>
                                {!isUser && (
                                  <span className="text-[7px] font-bold text-yellow-500 flex items-center gap-0.5">
                                    <Star size={8} fill="currentColor"/> {item.rating || '0.0'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* NAVIGATION SCROLL AREA */}
              <div className="flex-1 overflow-y-auto px-4 space-y-7 no-scrollbar ">
                {navSections.map((section, sIdx) => (
                  <div key={sIdx}>
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] opacity-30 mb-4 px-3">{section.title}</h4>
                    <div className="space-y-1.5">
                      {section.items.map((item, idx) => {
                        const isActive = location.pathname === item.to;
                        const isProtected = protectedRoutes.includes(item.to);

                        return (
                          <Link
                            key={idx}
                            to={isLoggedIn || !isProtected ? item.to : "/loginlanding"}
                            onClick={(e) => handleNavigationAccess(e, item, section.title)}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all group ${
                              isActive ? 'text-white' : `${themeStyles.dim} ${themeStyles.itemHover}`
                            }`}
                            style={isActive ? { 
                              backgroundColor: activeAccent,
                              boxShadow: `0 8px 25px ${activeAccent}40`
                            } : {}}
                          >
                            <span className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : ''}`} style={{ color: !isActive ? activeAccent : 'inherit' }}>
                              {item.icon}
                            </span>
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* FOOTER CONTROLS */}
              <div className="md:hidden p-5 border-t border-white/5 bg-black/10 space-y-3">
                <button
                  onClick={() => toggleRedMode()}
                  className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all border group ${
                    isRedMode ? 'bg-red-500/10 border-red-500/20' : themeStyles.input
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert size={18} className={isRedMode ? 'text-red-500 animate-pulse' : 'text-slate-500 group-hover:text-white transition-colors'} />
                    <div className="flex flex-col items-start">
                      <span className={`text-[9px] font-bold uppercase tracking-tighter ${isRedMode ? 'text-red-500' : 'text-slate-400'}`}>
                        {isRedMode ? 'Protocol Red' : 'Secure Mode'}
                      </span>
                      <span className="text-[7px] font-bold opacity-30 uppercase">System Status</span>
                    </div>
                  </div>
                  <div className={`w-9 h-5 rounded-full relative transition-all ${isRedMode ? 'bg-red-500' : 'bg-slate-700'}`}>
                    <motion.div animate={{ x: isRedMode ? 18 : 4 }} className="absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm" />
                  </div>
                </button>

                <button
                  onClick={() => {
                    if(isLoggedIn) { logout(); showAlert("Logged Out", "info"); }
                    else navigate("/loginlanding");
                    setIsSidebarOpen(false);
                  }}
                  className={` w-full py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                    isLoggedIn 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                    : 'bg-white text-black'
                  }`}
                >
                  {isLoggedIn ? <><LogOut size={16}/> Logout</> : <><Sparkles size={16}/> Enter Net</>}
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <div className="flex flex-col min-h-screen">
        <NavBar setIsSidebarOpen={setIsSidebarOpen} />
        <main className="flex-1 pt-24 pb-12 px-3 sm:px-6">
          <Outlet context={[isRedMode, currentTheme]} key={location.pathname} />
        </main>

        <footer className={`mt-auto border-t ${themeStyles.border} ${themeStyles.sidebarBg} backdrop-blur-3xl`}>
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <Cpu size={32} style={{ color: activeAccent }} />
                  <span className="font-bold tracking-tighter text-xl uppercase italic">
                    Toon<span style={{ color: activeAccent }}>Lord</span>
                  </span>
                </div>
                <p className="text-xs leading-relaxed font-bold uppercase tracking-tight opacity-60 max-w-sm">
                  The next generation of digital storytelling. Build, read, and explore in the Neural Net.
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 opacity-30">Platform</h4>
                <ul className="space-y-4 text-[11px] font-bold uppercase tracking-wider">
                  <li><Link to="/browse">Browse</Link></li>
                  <li><Link to="/library">Library</Link></li>
                  <li><Link to="/dashboard">Creator Studio</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6 opacity-30">Neural Net</h4>
                <div className="flex gap-3">
                  {/* Updated Social Links */}
                  <SocialIcon 
                    icon={<Linkedin size={18} />} 
                    accent={activeAccent} 
                    href="https://www.linkedin.com/in/jitendra-srivastava-099b0b289/" 
                  />
                  <SocialIcon 
                    icon={<Github size={18} />} 
                    accent={activeAccent} 
                    href="https://github.com/JitendraSrivastava12" 
                  />
                  <SocialIcon 
                    icon={<Youtube size={18} />} 
                    accent={activeAccent} 
                    href="#" 
                  />
                </div>
              </div>
            </div>

            <div className={`mt-16 pt-8 border-t ${themeStyles.border} flex flex-col md:flex-row justify-between items-center gap-6`}>
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">
                © 2026 ToonLord AI // Created By Jitendra Srivastava
              </p>
              <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest bg-black/20 px-4 py-2 rounded-full border border-white/5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Systems: Nominal
              </div>
            </div>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000]"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Layout;