// Layout.jsx
import React, { useState, useContext } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Home, Compass, Library, LayoutDashboard, User, FileUp,
  BarChart3, Settings as SettingsIcon, Cpu
} from "lucide-react";
import NavBar from "./NavBar";
import { AppContext } from "../UserContext";
import { useAlert } from "../context/AlertContext";

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
          {/* Pass theme context to pages via Outlet */}
          <Outlet context={[isRedMode, familyMode, currentTheme]} key={location.pathname} />
        </main>
      </div>

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
