import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, Bell, UserCircle, Sun, Moon, Flame, LogIn, LogOut } from "lucide-react";
import ToonLordLogo from "./ToonLordLogo";
import { AppContext } from "../UserContext";
import { useAlert } from "../context/AlertContext";

const animationStyles = `
  @keyframes shine {
    0% { left: -100%; }
    100% { left: 100%; }
  }
  .animate-shine {
    position: absolute;
    top: 0;
    width: 50%;
    height: 100%;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: skewX(-20deg);
    animation: shine 3s infinite;
  }
`;

function PointsCard() {
  const { isRedMode, points = 420 } = useContext(AppContext);
  const navigate = useNavigate();
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRotate({ x: y * -15, y: x * 15 });
  };

  return (
    <div className="relative group" style={{ perspective: "1000px" }}>
      <div
        className={`absolute -inset-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 blur-md ${
          isRedMode ? "bg-red-500/20" : "bg-orange-500/20"
        }`}
      />
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setRotate({ x: 0, y: 0 })}
        onClick={() => navigate("/points")}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: "transform 0.1s ease-out",
        }}
        className="relative cursor-pointer flex items-center gap-1.5 px-2 py-1.5 sm:px-2.5 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all overflow-hidden"
      >
        <div className="animate-shine opacity-0 group-hover:opacity-100" />
        <Flame
          size={16}
          className={`${isRedMode ? "text-red-500" : "text-orange-500"} fill-current`}
        />
        <span className="font-bold text-sm text-gray-200 group-hover:text-white">
          {points}
        </span>
      </div>
    </div>
  );
}

function NavBar({ isSidebarOpen, setIsSidebarOpen }) {
  const navigate = useNavigate();
  const { isLoggedIn, logout, isRedMode, toggleTheme } = useContext(AppContext);
  const { showAlert } = useAlert();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const controlNavbar = useCallback(() => {
    const currentScrollY = window.scrollY;
    if (currentScrollY < 50) {
      setIsVisible(true);
      setLastScrollY(currentScrollY);
      return;
    }
    const scrollDelta = Math.abs(currentScrollY - lastScrollY);
    if (scrollDelta < 10) return;
    setIsVisible(currentScrollY <= lastScrollY);
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [controlNavbar]);

  // Advanced Alert for Logout
  const handleAuthAction = () => {
    if (isLoggedIn) {
      logout();
      showAlert("Logged out successfully. See you soon!", "info", 4000);
      navigate("/");
    } else {
      navigate("/loginlanding");
    }
  };

  // Advanced Alert for Protected Routes
  const handleProtectedClick = (e, path) => {
    if (!isLoggedIn) {
      e.preventDefault();
      showAlert("Identity needed! Please login to continue.", "error", 5000);
    } else {
      navigate(path);
    }
  };

  // Aesthetic Alert for Theme Toggle
  const handleThemeChange = () => {
    toggleTheme();
    const themeName = !isRedMode ? "RED MODE" : "FAMILY MODE";
    showAlert(`${themeName} Activated`, "success", 2500);
  };

  return (
    <>
      <style>{animationStyles}</style>

      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-[#05060b]/90 backdrop-blur-xl border-b border-white/5 px-3 sm:px-4 lg:px-10 py-4 flex items-center justify-between transition-all duration-300 ease-in-out ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {/* LEFT */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all ${
              isSidebarOpen ? "hidden" : "block"
            }`}
          >
            <Menu size={20} />
          </button>

          <Link to="/" className="shrink-0">
            <ToonLordLogo isRedMode={isRedMode} />
          </Link>
        </div>

        {/* CENTER SEARCH */}
        <div className="hidden md:block w-full max-w-sm lg:max-w-xl mx-8 relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white"
            size={16}
          />
          <input
            placeholder="Search manga..."
            className="w-full bg-white/5 pl-10 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-1 focus:ring-red-500/50 text-sm text-white"
          />
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={handleAuthAction}
            className={`hidden md:flex items-center gap-4 px-4 py-3 rounded-xl ${
              isLoggedIn
                ? "text-red-500 hover:bg-red-500/10"
                : "text-green-500 hover:bg-green-500/10"
            } transition-all`}
          >
            {isLoggedIn ? (
              <><LogOut size={16} /><span>Logout</span></>
            ) : (
              <><LogIn size={16} /><span>Login/Signup</span></>
            )}
          </button>

          <button
            onClick={handleThemeChange}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold border flex items-center gap-2 transition-all ${
              isRedMode
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-green-500/10 border-green-500/20 text-green-400"
            }`}
          >
            {isRedMode ? <Sun size={14} /> : <Moon size={14} />}
            <span className="hidden lg:inline">{isRedMode ? "RED" : "FAMILY"}</span>
          </button>

          {/* 🔔 Bell (protected) */}
          <button
            onClick={(e) => handleProtectedClick(e, "/notifications")}
            className="hidden sm:flex p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 relative"
          >
            <Bell size={18} />
            {isLoggedIn && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* 👤 Profile (protected) */}
          <button
            onClick={(e) => handleProtectedClick(e, "/profile")}
            className="hidden sm:flex p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
          >
            <UserCircle size={20} />
          </button>

          <PointsCard />
        </div>
      </nav>

      <div className="h-[73px] w-full" />
    </>
  );
}

export default NavBar;