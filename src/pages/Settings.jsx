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

  // DEFINING THEME SCHEMES FOR PREVIEW
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
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] pt-12 pb-16 px-6 transition-all duration-700 ">
      <div className="max-w-7xl mx-auto">

        {/* --- DYNAMIC HEADER --- */}
        <header className="mb-12 relative">
          <motion.div 
             initial={{ width: 0 }} animate={{ width: "100px" }}
             className="h-[4px] mb-4" style={{ backgroundColor: isRedMode ? '#ff003c' : 'var(--accent)' }} 
          />
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
            Interface <span className="text-transparent" style={{ WebkitTextStroke: `1px ${isRedMode ? '#ff003c' : 'var(--accent)'}` }}>Config</span>
          </h1>
          <p className="mt-4 text-[var(--text-dim)] uppercase tracking-[0.5em] text-[10px] font-black opacity-50">
            Current Module: {currentTheme.toUpperCase()} // Secure_Uplink
          </p>
        </header>

        {/* --- CATEGORY TABS --- */}
        <nav className="flex gap-4 mb-12">
          <TabButton 
            active={activeCategory === "appearance"} 
            onClick={() => setActiveCategory("appearance")}
            icon={<FaPalette />} 
            label="Visual Matrix" 
          />
          <TabButton 
            active={activeCategory === "security"} 
            onClick={() => setActiveCategory("security")}
            icon={<FaShieldAlt />} 
            label="Core Security" 
          />
        </nav>

        {/* --- MAIN GRID --- */}
        <main>
          <AnimatePresence mode="wait">
            {activeCategory === "appearance" ? (
              <motion.div 
                key="appearance"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
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
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
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

/* ---------- ENHANCED UI COMPONENTS ---------- */

function ThemeButton({ active, onClick, icon, title, desc, bg, acc, text }) {
  return (
    <button
      onClick={onClick}
      className={`group relative p-6 rounded-3xl transition-all duration-500 text-left overflow-hidden border-2 ${
        active ? "scale-105" : "hover:scale-102"
      }`}
      style={{ 
        backgroundColor: bg, 
        borderColor: active ? acc : "transparent",
        boxShadow: active ? `0 0 30px ${acc}44` : "none"
      }}
    >
      {/* Dynamic Background Element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 blur-3xl opacity-20" 
           style={{ backgroundColor: acc }} />

      {/* Content */}
      <div className="relative z-10">
        <div className={`text-4xl mb-6 transition-transform duration-500 ${active ? "scale-110" : "group-hover:translate-x-2"}`} 
             style={{ color: acc }}>
          {icon}
        </div>
        
        <h4 className="font-black text-sm uppercase tracking-widest mb-2" style={{ color: text }}>
          {title}
        </h4>
        
        <p className="text-[10px] opacity-70 leading-relaxed italic" style={{ color: text }}>
          {desc}
        </p>
      </div>

      {/* Visual Indicator of Active State */}
      {active && (
        <motion.div layoutId="active-glow" className="absolute inset-0 border-[3px] rounded-3xl pointer-events-none"
                    style={{ borderColor: acc, opacity: 0.5 }} />
      )}
      
      {active && (
        <div className="absolute bottom-4 right-4" style={{ color: acc }}>
          <FaCheckCircle size={20} />
        </div>
      )}
    </button>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 py-4 px-8 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all border ${
        active 
          ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-[0_0_20px_var(--accent-glow)] scale-105" 
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
          whileHover={{ scale: 1.02 }}
          onClick={toggleRedMode}
          className={`p-8 rounded-[2rem] border-2 transition-all cursor-pointer relative overflow-hidden ${
            isRedMode 
              ? "bg-red-950/20 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]" 
              : "bg-white/5 border-white/10 hover:border-red-500/50"
          }`}
        >
          <div className="absolute top-4 right-4 text-red-500 opacity-20"><FaShieldAlt size={40} /></div>
          <p className="text-[9px] uppercase tracking-widest mb-2 text-red-500 font-black">Security Protocol 01</p>
          <h3 className="text-3xl font-black italic">RED MODE</h3>
          <p className="text-[11px] mt-4 opacity-50 italic">Total amoled immersion. Restricted archives decrypted.</p>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          onClick={toggleFamilyMode}
          className={`p-8 rounded-[2rem] border-2 transition-all cursor-pointer relative overflow-hidden ${
            familyMode 
              ? "bg-blue-950/20 border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.1)]" 
              : "bg-white/5 border-white/10 hover:border-blue-500/50"
          }`}
        >
          <div className="absolute top-4 right-4 text-blue-500 opacity-20"><FaSpaceShuttle size={40} /></div>
          <p className="text-[9px] uppercase tracking-widest mb-2 text-blue-400 font-black">Safety Protocol 02</p>
          <h3 className="text-3xl font-black italic">FAMILY SAFE</h3>
          <p className="text-[11px] mt-4 opacity-50 italic">Neuro-sanitization enabled. Explicit data purged.</p>
        </motion.div>
      </div>

      <div className="bg-white/5 rounded-3xl p-2 border border-white/5">
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
      className="flex items-center justify-between p-6 hover:bg-white/5 transition-all cursor-pointer rounded-2xl group"
    >
      <div className="flex items-center gap-6">
        <div className={`text-2xl p-4 rounded-2xl transition-all ${on ? 'bg-[var(--accent)] text-white' : 'bg-black/20 text-white/20'}`}>
          {icon}
        </div>
        <div>
          <h4 className="font-black uppercase text-xs tracking-widest">{title}</h4>
          <p className="text-[10px] opacity-40 uppercase mt-1">{desc}</p>
        </div>
      </div>
      <div className={`text-4xl transition-colors duration-500 ${on ? "text-[var(--accent)]" : "text-white/5"}`}>
        {on ? <FaToggleOn /> : <FaToggleOff />}
      </div>
    </div>
  );
}