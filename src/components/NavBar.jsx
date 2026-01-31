import React, { useState, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, Menu, List , Bell, UserCircle, ShieldAlert, 
  LogOut, LogIn, Sparkles, X ,Cpu
} from "lucide-react";
import { AppContext } from "../UserContext";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";

function NavBar({ setIsSidebarOpen }) {
  const navigate = useNavigate();
  const { isLoggedIn, logout, isRedMode, toggleRedMode, currentTheme } = useContext(AppContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRightDropdownOpen, setIsRightDropdownOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHidden, setIsHidden] = useState(false);
  const navRef = useRef(null);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const prev = scrollY.getPrevious();
    if (latest > prev && latest > 150) setIsHidden(true);
    else setIsHidden(false);
  });

  const isLight = currentTheme === 'light';
  const activeAccent = isRedMode ? "#ff003c" : (isLight ? "#2563eb" : "#3b82f6");

  const themeStyles = {
    glass: isLight 
      ? "bg-white/70 border-black/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.06)]" 
      : "bg-black/70 border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
    text: isLight ? "text-slate-900" : "text-white",
    subtext: isLight ? "text-slate-500" : "text-slate-400",
    input: isLight ? "bg-black/[0.03] border-black/[0.05]" : "bg-white/[0.03] border-white/[0.05]",
    kbd: isLight ? "bg-white border-slate-200 text-slate-400" : "bg-white/5 border-white/10 text-white/40"
  };

  const handleMouseMove = (e) => {
    if (!navRef.current) return;
    const rect = navRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <>
      <motion.nav
        ref={navRef}
        onMouseMove={handleMouseMove}
        variants={{ visible: { y: 0, opacity: 1 }, hidden: { y: "-110%", opacity: 0 } }}
        animate={isHidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="fixed top-0 left-0 right-0 z-[100] px-4 py-4 md:px-8"
      >
        <div className={`relative mx-auto max-w-[1440px] h-20 flex items-center justify-between px-6 rounded-3xl border backdrop-blur-2xl transition-all duration-700 ${themeStyles.glass}`}>
          
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-40"
            style={{ background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${activeAccent}15, transparent 70%)` }}
          />

          {/* LEFT: Branding & Sidebar Trigger */}
          <div className="flex items-center gap-5 z-20">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarOpen(true)}
              className={`p-3 rounded-2xl border transition-all ${themeStyles.input} ${themeStyles.text}`}
            >
              <Menu size={20} />
            </motion.button>
            
            <Link to="/" className="group flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 blur-lg opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: activeAccent }} />
                <Cpu size={28} style={{ color: activeAccent }} className="relative z-10" />
              </div>
              <div className="flex flex-col leading-none">
                <span className={`text-2xl font-black tracking-tighter italic ${themeStyles.text}`}>
                  TOON<span style={{ color: activeAccent }}>LORD</span>
                </span>
                <span className={`text-[7px] font-bold tracking-[0.25em] uppercase ${themeStyles.subtext}`}>Premium Mangas</span>
              </div>
            </Link>
          </div>

          {/* CENTER: Search */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-12 relative z-20">
            <div className={`flex items-center w-full rounded-2xl border transition-all group focus-within:ring-2 ${themeStyles.input}`} style={{ "--tw-ring-color": `${activeAccent}33` }}>
              <div className="pl-4 pr-3">
                <Search size={18} className={themeStyles.subtext} />
              </div>
              <input 
                type="text"
                placeholder="EXECUTE GLOBAL COMMAND..."
                className={`w-full bg-transparent py-4 text-[11px] font-bold tracking-widest uppercase outline-none ${themeStyles.text}`}
              />
              <div className="pr-4 flex gap-2">
                <kbd className={`px-2 py-1 rounded-md text-[9px] border font-mono shadow-sm ${themeStyles.kbd}`}>CTRL</kbd>
                <kbd className={`px-2 py-1 rounded-md text-[9px] border font-mono shadow-sm ${themeStyles.kbd}`}>K</kbd>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-2 z-20 relative">
            {/* desktop: always visible */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => toggleRedMode(!isRedMode)}
                className="relative px-6 py-3 rounded-2xl transition-all active:scale-95 shadow-lg group overflow-hidden"
                style={{ backgroundColor: isRedMode ? '#ff003c' : (isLight ? '#000' : '#fff') }}
              >
                <div className="relative z-10 flex items-center gap-2">
                  {isRedMode ? <ShieldAlert size={16} color="white" className="animate-pulse" /> : <Sparkles size={16} className={isLight ? 'text-white' : 'text-black'} />}
                  <span className={`text-[11px] font-black uppercase tracking-tighter ${isLight || isRedMode ? 'text-white' : 'text-black'}`}>
                    {isRedMode ? 'Protocol Red' : 'Enforce Secure'}
                  </span>
                </div>
              </button>
              <IconButton icon={<Bell size={20} />} activeColor={activeAccent} themeStyles={themeStyles} count={3} />
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${themeStyles.input} ${themeStyles.text}`}>
                <UserCircle size={22} />
              </div>
              <button 
                onClick={() => isLoggedIn ? logout() : navigate("/loginlanding")}
                className={`p-3 rounded-2xl transition-all shadow-sm border ${isLoggedIn ? 'bg-red-500/10 border-red-500/20 text-red-500' : `${themeStyles.input} ${themeStyles.text}`}`}
              >
                {isLoggedIn ? <LogOut size={20} /> : <LogIn size={20} />}
              </button>
            </div>

            {/* mobile & md: dropdown toggle */}
            <div className="md:hidden relative">
              <button
                className={`p-2 rounded-2xl border ${themeStyles.input} ${themeStyles.text}`}
                onClick={() => setIsRightDropdownOpen(!isRightDropdownOpen)}
              >
                <List size={24} />
              </button>
              <AnimatePresence>
                {isRightDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute right-0 mt-2 w-44 flex flex-col gap-2 p-2 rounded-2xl border ${themeStyles.glass} z-50`}
                  >
                    <button
                      onClick={() => toggleRedMode(!isRedMode)}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 transition-colors"
                    >
                      {isRedMode ? <ShieldAlert size={16} /> : <Sparkles size={16} />}
                      <span className="text-xs font-bold">{isRedMode ? 'Protocol Red' : 'Enforce Secure'}</span>
                    </button>
                    <IconButton icon={<Bell size={18} />} activeColor={activeAccent} themeStyles={themeStyles} count={3} />
                    
                    <button className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 transition-colors">
                      <UserCircle size={18} />
                      <span className="text-xs font-bold">Profile</span>
                    </button>
                    <button
                      onClick={() => isLoggedIn ? logout() : navigate("/loginlanding")}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 transition-colors"
                    >
                      {isLoggedIn ? <LogOut size={18} /> : <LogIn size={18} />}
                      <span className="text-xs font-bold">{isLoggedIn ? 'Logout' : 'Login'}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.nav>
    </>
  );
}

const IconButton = ({ icon, activeColor, themeStyles, count }) => (
  <button className={`relative p-3 rounded-2xl border transition-all ${themeStyles.input} ${themeStyles.text} hover:scale-110`}>
    {icon}
    {count > 0 && (
      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg" style={{ backgroundColor: activeColor }}>
        {count}
      </span>
    )}
  </button>
);

export default NavBar;
