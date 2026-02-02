import React, { useState, useContext } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Home, Compass, Library, LayoutDashboard, User, FileUp,
  BarChart3, Settings as SettingsIcon, Cpu, Twitter, Facebook, Youtube, Github
} from "lucide-react";
import NavBar from "./NavBar";
import { AppContext } from "../UserContext";
import { useAlert } from "../context/AlertContext";
import ToonLordLogo from "./ToonLordLogo";

// Fixed: Added the missing SocialIcon component helper
const SocialIcon = ({ icon, accent }) => (
  <a 
    href="#" 
    className="p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all"
    style={{ '--hover-accent': accent }}
    onMouseEnter={(e) => e.currentTarget.style.color = accent}
    onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
  >
    {icon}
  </a>
);

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isLoggedIn, logout, isRedMode, familyMode, currentTheme } = useContext(AppContext);
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();

  const isLight = currentTheme === "light";

  // Dynamic accent color
  const activeAccent = isRedMode
    ? "#ff003c"
    : isLight
      ? "#6366f1"
      : "#60a5fa";

  // Dynamic theme styles
  const themeStyles = {
    sidebarBg: isLight ? "bg-white/70 backdrop-blur-xl" : "bg-black/60 backdrop-blur-xl",
    border: isLight ? "border-black/10" : "border-white/10",
    text: isLight ? "text-slate-900" : "text-white",
    dim: isLight ? "text-slate-500" : "text-slate-400",
    itemHover: isLight ? "hover:bg-black/5" : "hover:bg-white/5",
    mainBg: isLight ? "bg-slate-50" : "bg-[#050505]"
  };

  const protectedRoutes = [
    "/profile", "/library", "/dashboard", "/my-series", "/upload", "/analytics"
  ];

  const navSections = [
    {
      title: "Navigation",
      items: [
        { icon: <Home size={18} />, to: "/home", label: "Home" },
        { icon: <Compass size={18} />, to: "/browse", label: "Browse" },
        { icon: <Library size={18} />, to: "/library", label: "Library" },
        { icon: <User size={18} />, to: "/profile", label: "Profile" },
        { icon: <SettingsIcon size={18} />, to: "/settings", label: "Settings" },
      ]
    },
    {
      title: "Creator",
      items: [
        { icon: <LayoutDashboard size={18} />, to: "/dashboard", label: "Dashboard" },
        { icon: <Library size={18} />, to: "/my-series", label: "My Series" },
        { icon: <FileUp size={18} />, to: "/upload", label: "Upload" },
        { icon: <BarChart3 size={18} />, to: "/analytics", label: "Analytics" },
      ]
    }
  ];

  const authClick = () => {
    if (isLoggedIn) {
      logout();
      showAlert("Logged out", "info", 3000);
      navigate("/");
    } else {
      navigate("/loginlanding");
    }
    setIsSidebarOpen(false);
  };

  return (
    <div className={`min-h-screen ${themeStyles.mainBg} ${themeStyles.text}`}>

      {/* SIDEBAR */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 220 }}
            className={`
              fixed top-0 left-0 z-[1001] h-full
              w-[240px] sm:w-[260px] md:w-[280px]
              border-r ${themeStyles.border}
              ${themeStyles.sidebarBg}
              shadow-2xl
              flex flex-col
            `}
          >
            {/* Accent Glow */}
            <div
              className="h-[2px] w-full"
              style={{ background: `linear-gradient(90deg, transparent, ${activeAccent}, transparent)` }}
            />

            <div className="flex flex-col h-full px-4 py-5 sm:px-5">

              {/* HEADER */}
              <div className="flex items-center justify-between mb-4">
                <Link to="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-2">
                  <Cpu size={22} style={{ color: activeAccent }} />
                  <span className="font-black tracking-tight text-base">
                    Toon<span style={{ color: activeAccent }}>Lord</span>
                  </span>
                </Link>

                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-black/10 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* NAVIGATION */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {navSections.map((section, sIdx) => (
                  <div key={sIdx}>
                    <p className="text-[11px] uppercase tracking-widest opacity-40 mb-2 px-2">
                      {section.title}
                    </p>
                    <div className="space-y-1">
                      {section.items.map((item, idx) => {
                        const isActive = location.pathname === item.to;
                        const isProtected = protectedRoutes.includes(item.to);

                        return (
                          <Link
                            key={idx}
                            to={isLoggedIn || !isProtected ? item.to : "/loginlanding"}
                            onClick={(e) => {
                              if (!isLoggedIn && isProtected) {
                                e.preventDefault();
                                showAlert("Login required", "error", 3000);
                              }
                              setIsSidebarOpen(false);
                            }}
                            className={`
                              flex items-center gap-3
                              px-3 py-2.5 rounded-xl text-sm font-medium
                              transition-all
                              ${isActive
                                ? "text-white shadow-md"
                                : `${themeStyles.dim} ${themeStyles.itemHover}`}
                            `}
                            style={isActive ? {
                              backgroundColor: activeAccent,
                              boxShadow: `0 8px 20px ${activeAccent}40`
                            } : {}}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* FOOTER */}
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={authClick}
                  className={`
                    w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest
                    transition-all
                    ${isLoggedIn
                      ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                      : "bg-slate-900 text-white hover:bg-slate-800"}
                  `}
                >
                  {isLoggedIn ? "Logout" : "Login"}
                </button>
              </div>

            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <div className="flex flex-col min-h-screen">
        <NavBar setIsSidebarOpen={setIsSidebarOpen} />
        <main className="flex-1 px-3 sm:px-6">
          <Outlet context={[isRedMode, familyMode, currentTheme]} key={location.pathname} />
        </main>
      </div>

      {/* FOOTER SECTION */}
      <footer className={`mt-20 border-t ${themeStyles.border} ${themeStyles.sidebarBg}`}>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <Cpu size={35} color="blue" />
                <span className="font-black tracking-tighter text-xl uppercase italic">
                  Toon<span style={{ color: activeAccent }}>Lord</span>
                </span>
              </div>
              <p className={`text-sm leading-relaxed font-medium ${themeStyles.dim}`}>
                The ultimate destination for digital creators. 
                Experience stories in a whole new dimension of interactivity.
              </p>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-30">Platform</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link to="/browse" className="hover:opacity-60 transition-opacity">Browse</Link></li>
                <li><Link to="/library" className="hover:opacity-60 transition-opacity">Library</Link></li>
                <li><Link to="/dashboard" className="hover:opacity-60 transition-opacity">Creator Studio</Link></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-30">Security</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li><Link to="/help" className="hover:opacity-60 transition-opacity">Neural Link Support</Link></li>
                <li><Link to="/terms" className="hover:opacity-60 transition-opacity">User Protocols</Link></li>
                <li><Link to="/privacy" className="hover:opacity-60 transition-opacity">Data Encryption</Link></li>
              </ul>
            </div>

            {/* Connect Section */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-30">Neural Net</h4>
              <div className="flex gap-3">
                <SocialIcon icon={<Twitter size={18} />} accent={activeAccent} />
                <SocialIcon icon={<Github size={18} />} accent={activeAccent} />
                <SocialIcon icon={<Youtube size={18} />} accent={activeAccent} />
              </div>
            </div>
          </div>

          <div className={`mt-16 pt-8 border-t ${themeStyles.border} flex flex-col md:flex-row justify-between items-center gap-6`}>
            <p className={`text-[10px] font-black uppercase tracking-widest ${themeStyles.dim}`}>
              © 2026 ToonLord AI // All Rights Reserved. 
            </p>
            <p className={`text-[10px] font-black uppercase tracking-widest ${themeStyles.dim}`}>
               Created By:- Jitendra Srivastava
            </p>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest bg-black/20 px-4 py-2 rounded-full border border-white/5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Systems: Nominal
            </div>
          </div>
        </div>
      </footer>

      {/* BACKDROP */}
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