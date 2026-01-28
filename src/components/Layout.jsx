import React, { useState, useContext } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import {
  X, Home, Compass, Library, LayoutDashboard, User, FileUp,
  BarChart3, LogOut, LogIn
} from "lucide-react";
import NavBar from "./NavBar";
import ToonLordLogo from './ToonLordLogo';
import { AppContext } from "../UserContext";
import { useAlert } from "../context/AlertContext";

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isLoggedIn, logout, isRedMode } = useContext(AppContext);
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  // Aesthetic Alert for Logout
  const authClick = () => {
    if (isLoggedIn) {
      logout();
      // Using 'info' type for the Sky Blue glassmorphic look
      showAlert("Logged out successfully. See you soon!", "info", 4000);
      navigate("/");
    } else {
      navigate("/loginlanding");
    }
    setIsSidebarOpen(false);
  };

  const protectedRoutes = ["/profile", "/library", "/dashboard", "/my-series", "/upload", "/analytics"];

  const navSections = [
    {
      title: "Menu",
      items: [
        { icon: <Home size={20} />, to: '/home', label: 'Home' },
        { icon: <Compass size={20} />, to: '/browse', label: 'Browse' },
        { icon: <Library size={20} />, to: '/library', label: 'Library' },
        { icon: <User size={20} />, to: '/profile', label: 'Profile' },
      ]
    },
    {
      title: "Creator Studio",
      items: [
        { icon: <LayoutDashboard size={20} />, to: '/dashboard', label: 'Dashboard' },
        { icon: <Library size={20} />, to: '/my-series', label: 'My Series' },
        { icon: <FileUp size={20} />, to: '/upload', label: 'Upload' },
        { icon: <BarChart3 size={20} />, to: '/analytics', label: 'Analytics' },
      ]
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#05060b] text-white overflow-x-hidden font-sans">
      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 z-[100] h-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] bg-gradient-to-b from-[#0b0d16] to-[#05060b] backdrop-blur-2xl border-r border-white/10 w-[280px] shadow-[20px_0_60px_rgba(0,0,0,0.8)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full p-6 relative">
          <div className="flex items-center justify-between mb-10">
            <Link to="/" onClick={() => setIsSidebarOpen(false)}>
              <ToonLordLogo isRedMode={isRedMode} />
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 space-y-10 overflow-y-auto no-scrollbar">
            {navSections.map((section, sIdx) => (
              <div key={sIdx}>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.35em] mb-4 px-2">{section.title}</p>
                <div className="space-y-2">
                  {section.items.map((item, idx) => {
                    const isProtected = protectedRoutes.includes(item.to);
                    return (
                      <Link
                        key={idx}
                        to={isLoggedIn || !isProtected ? item.to : "/loginlanding"}
                        onClick={(e) => {
                          if (!isLoggedIn && isProtected) {
                            e.preventDefault();
                            // Aesthetic Error Alert (Rose/Red) with longer duration
                            showAlert("Acknowledge Required: Please login to explore this realm.", "error", 4500);
                            setIsSidebarOpen(false);
                          } else {
                            setIsSidebarOpen(false);
                          }
                        }}
                        className="group relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-white/5"
                      >
                        <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-full opacity-0 group-hover:opacity-100 transition ${isRedMode ? 'bg-red-500' : 'bg-green-400'}`} />
                        <span className={`transition-transform duration-300 group-hover:scale-110 ${isRedMode ? 'text-red-400/70' : 'text-green-400/70'}`}>
                          {item.icon}
                        </span>
                        <span className="text-sm font-semibold tracking-tight text-gray-300 group-hover:text-white">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* AUTH (MOBILE) */}
          <div className="pt-6 border-t border-white/10 md:hidden">
            <button
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl ${isLoggedIn ? "text-red-500 hover:bg-red-500/10" : "text-green-500 hover:bg-green-500/10"} transition-all`}
              onClick={authClick}
            >
              {isLoggedIn ? <LogOut size={20} /> : <LogIn size={20} />}
              <span className="text-sm font-black uppercase tracking-widest">{isLoggedIn ? "Logout" : "Login"}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col min-h-screen w-full">
        <NavBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        <main className="flex-1">
          <Outlet context={[isRedMode]} />
        </main>

        {/* FOOTER */}
        <footer className="relative mt-auto overflow-hidden border-t border-white/10 bg-gradient-to-b from-[#070814] to-[#05060b]">
          <div className={`absolute inset-0 opacity-20 blur-3xl ${isRedMode ? 'bg-red-500/10' : 'bg-green-400/10'}`} />
          <div className="relative max-w-7xl mx-auto px-6 py-14 grid gap-10 md:grid-cols-4">
            
            {/* BRAND */}
            <div className="space-y-4">
              <Link to="/" className="inline-block scale-90">
                <ToonLordLogo isRedMode={isRedMode} />
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                ToonLord is a next-gen comic platform for creators and readers. Discover, support, and unlock premium manga experiences.
              </p>
            </div>

            {/* LINKS */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-5 text-gray-300">Platform</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                {['Home', 'Browse', 'Library', 'Premium', 'Creator Studio'].map((item) => (
                  <li key={item}><Link to={`/${item.toLowerCase().replace(' ', '-')}`} className="hover:text-white transition-colors">{item}</Link></li>
                ))}
              </ul>
            </div>

            {/* LEGAL */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-5 text-gray-300">Legal</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                {['Terms', 'Privacy', 'Cookies', 'Licensing'].map((item) => (
                  <li key={item}><Link to={`/${item.toLowerCase()}`} className="hover:text-white transition-colors">{item} Policy</Link></li>
                ))}
              </ul>
            </div>

            {/* SOCIAL / CTA */}
            <div className="space-y-5">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-300">Join the Realm</h3>
              <div className="flex gap-3">
                {['🐦', '📸', '🎮', '💬'].map((icon, i) => (
                  <button key={i} className={`w-11 h-11 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 transition-all hover:scale-105 ${isRedMode ? 'hover:text-red-400' : 'hover:text-green-400'}`}>{icon}</button>
                ))}
              </div>
              <button className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg ${isRedMode ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30' : 'bg-green-500 hover:bg-green-600 text-black shadow-green-500/30'}`}>Become VIP 👑</button>
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="border-t border-white/5 py-5 text-center relative">
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} ToonLord. All rights reserved.</p>
            <p className={`text-[11px] font-black uppercase tracking-[0.3em] mt-2 transition-colors ${isRedMode ? 'text-red-500/60' : 'text-green-400/60'}`}>
              Forged by <span className="text-white">Jitendra Srivastava</span>
            </p>
          </div>
        </footer>
      </div>

      {/* BACKDROP */}
      <div
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity duration-500 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
    </div>
  );
}

export default Layout;