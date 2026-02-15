import React, { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaMoon, FaSun, FaLaptopCode, FaBookOpen, FaLeaf, FaCheckCircle, 
  FaPalette, FaShieldAlt, FaLock, FaEyeSlash, FaToggleOn, 
  FaToggleOff, FaGhost, FaMeteor, FaSpaceShuttle, FaCrown, 
  FaHeart, FaIceCream 
} from "react-icons/fa";
import { AppContext } from "../UserContext";

export default function Settings() {
  const { currentTheme, setTheme, isRedMode, toggleRedMode, familyMode, toggleFamilyMode } = useContext(AppContext);
  const [activeCategory, setActiveCategory] = useState("appearance");

  const themes = [
    { id: "default", title: "Amoled Black", icon: <FaMoon />, desc: "Pure darkness for OLED focus.", bg: "#000000", acc: "#3b82f6", text: "#ffffff" },
    { id: "light", title: "Pure Light", icon: <FaSun />, desc: "Crisp white interface for daylight.", bg: "#ffffff", acc: "#2563eb", text: "#1a1a1a" },
    { id: "cream", title: "Vintage Paper", icon: <FaBookOpen />, desc: "Warm tones for reduced eye strain.", bg: "#f5f5dc", acc: "#8b4513", text: "#2c2c2c" },
    { id: "cyberpunk", title: "Cyber Neon", icon: <FaLaptopCode />, desc: "High-energy aesthetic protocols.", bg: "#0d0221", acc: "#00ffcc", text: "#ff00ff" },
    { id: "emerald", title: "Forest Green", icon: <FaLeaf />, desc: "Organic, deep woodland tones.", bg: "#062c16", acc: "#10b981", text: "#ecfdf5" },
    { id: "ghost", title: "Ghost Shell", icon: <FaGhost />, desc: "Ultra-minimal slate and violet accents.", bg: "#1e1e2e", acc: "#cba6f7", text: "#cdd6f4" },
    { id: "nova", title: "Supernova", icon: <FaMeteor />, desc: "Deep space black with solar flare orange.", bg: "#050505", acc: "#fb923c", text: "#ffffff" },
    { id: "synthwave", title: "Retro Synth", icon: <FaSpaceShuttle />, desc: "80s sunset: Deep purple and hot pink.", bg: "#2d0b5a", acc: "#ff007f", text: "#00ffff" },
    { id: "royal", title: "Midnight Gold", icon: <FaCrown />, desc: "Premium obsidian with gold-leaf highlights.", bg: "#0a0a0a", acc: "#d4af37", text: "#f8f8f8" },
    { id: "sakura", title: "Sakura Bloom", icon: <FaHeart />, desc: "Soft pinks and deep plum for an elegant finish.", bg: "#fff5f7", acc: "#db2777", text: "#500724" },
    { id: "rose", title: "Rose Quartz", icon: <FaIceCream />, desc: "A bright, clean strawberry-milk aesthetic.", bg: "#ffd1dc", acc: "#ff69b4", text: "#ffffff" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] pt-4 md:pt-12 pb-16 px-6 transition-all duration-700">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <header className="mb-12 relative">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: "100px" }}
            className="h-[3px] mb-4" 
            style={{ backgroundColor: isRedMode ? '#ff003c' : 'var(--accent)' }} 
          />
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            Interface <span className="text-transparent" style={{ WebkitTextStroke: `1px ${isRedMode ? '#ff003c' : 'var(--accent)'}` }}>Config</span>
          </h1>
          <p className="mt-4 text-[var(--text-dim)] tracking-widest text-xs font-medium opacity-60">
            Current Module: {currentTheme.toUpperCase()}
          </p>
        </header>

        {/* TABS */}
        <nav className="flex gap-4 mb-12">
          <TabButton 
            active={activeCategory === "appearance"} 
            onClick={() => setActiveCategory("appearance")}
            icon={<FaPalette />} 
            label="Appearance" 
          />
          <TabButton 
            active={activeCategory === "security"} 
            onClick={() => setActiveCategory("security")}
            icon={<FaShieldAlt />} 
            label="Security" 
          />
        </nav>

        <main>
          <AnimatePresence mode="wait">
            {activeCategory === "appearance" ? (
              <motion.div 
                key="appearance"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {themes.map((t) => (
                  <ThemeButton 
                    key={t.id} 
                    {...t} 
                    active={currentTheme === t.id} 
                    onClick={() => setTheme(t.id)} 
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl space-y-8"
              >
                <SecurityPanel 
                  isRedMode={isRedMode} 
                  toggleRedMode={toggleRedMode} 
                  familyMode={familyMode}
                  toggleFamilyMode={toggleFamilyMode}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function ThemeButton({ active, onClick, icon, title, desc, bg, acc, text }) {
  return (
    <button
      onClick={onClick}
      className={`group relative p-6 rounded-3xl transition-all duration-300 text-left overflow-hidden border ${
        active ? "scale-100" : "hover:scale-[1.01]"
      }`}
      style={{ 
        backgroundColor: bg, 
        borderColor: active ? acc : "transparent",
        boxShadow: active ? `0 0 8px ${acc}22` : "none"
      }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 blur-2xl opacity-10" style={{ backgroundColor: acc }} />

      <div className="relative z-10">
        <div className={`text-3xl mb-4 transition-transform ${active ? "scale-105" : "group-hover:translate-x-1"}`} style={{ color: acc }}>
          {icon}
        </div>
        <h4 className="font-semibold text-sm tracking-wide mb-2" style={{ color: text }}>
          {title}
        </h4>
        <p className="text-xs opacity-70 leading-relaxed" style={{ color: text }}>
          {desc}
        </p>
      </div>

      {active && (
        <div className="absolute bottom-4 right-4" style={{ color: acc }}>
          <FaCheckCircle size={18} />
        </div>
      )}
    </button>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 py-3 px-6 rounded-xl font-medium text-sm transition border ${
        active 
          ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm" 
          : "bg-transparent text-[var(--text-dim)] border-[var(--border)] hover:border-[var(--accent)]/50"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function SecurityPanel({ isRedMode, toggleRedMode, familyMode, toggleFamilyMode }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          whileHover={{ scale: 1.01 }}
          onClick={toggleRedMode}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            isRedMode 
              ? "bg-red-950/10 border-red-500/50" 
              : "bg-white/5 border-white/10 hover:border-red-500/30"
          }`}
        >
          <h3 className="text-lg font-semibold">Red Mode</h3>
          <p className="text-sm opacity-60 mt-2">High contrast AMOLED experience.</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.01 }}
          onClick={toggleFamilyMode}
          className={`p-6 rounded-2xl border transition-all cursor-pointer ${
            familyMode 
              ? "bg-blue-950/10 border-blue-500/50" 
              : "bg-white/5 border-white/10 hover:border-blue-500/30"
          }`}
        >
          <h3 className="text-lg font-semibold">Family Safe</h3>
          <p className="text-sm opacity-60 mt-2">Filters explicit content automatically.</p>
        </motion.div>
      </div>

      <div className="bg-white/5 rounded-2xl p-2 border border-white/10">
        <SecurityOption icon={<FaLock />} title="Neural Encryption" desc="Multi-factor biometric handshake." enabled />
        <SecurityOption icon={<FaEyeSlash />} title="Ghost Mode" desc="Stealth browsing enabled." />
      </div>
    </div>
  );
}

function SecurityOption({ icon, title, desc, enabled = false }) {
  const [on, setOn] = useState(enabled);
  return (
    <div 
      onClick={() => setOn(!on)}
      className="flex items-center justify-between p-4 hover:bg-white/5 transition cursor-pointer rounded-xl"
    >
      <div className="flex items-center gap-4">
        <div className={`text-xl p-3 rounded-xl ${on ? 'bg-[var(--accent)] text-white' : 'bg-black/20 text-white/30'}`}>
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-sm">{title}</h4>
          <p className="text-xs opacity-50 mt-1">{desc}</p>
        </div>
      </div>
      <div className={`text-3xl transition-colors ${on ? "text-[var(--accent)]" : "text-white/10"}`}>
        {on ? <FaToggleOn /> : <FaToggleOff />}
      </div>
    </div>
  );
}
