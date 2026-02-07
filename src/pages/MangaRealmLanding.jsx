import React, { useContext } from 'react';
import { 
  Glasses, 
  ShieldCheck, 
  ArrowRight, 
  Lock,
  Globe,
  Zap,
  Activity,
  Cpu,
  Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppContext } from "../UserContext";

const MangaRealmLanding = () => {
  const { currentTheme, isRedMode } = useContext(AppContext);

  const accentColor = isRedMode ? '#f43f5e' : 'var(--accent)'; 
  
  return (
    <div className={`relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans selection:bg-rose-500/30 overflow-x-hidden theme-${currentTheme}` }>
      
      {/* BACKGROUND AMBIENCE */}
      <div className="absolute top-32 left-32 w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.08] pointer-events-none" style={{ backgroundColor: accentColor }} />
      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* --- HERO SECTION --- */}
      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center z-10">

        {/* Protocol Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[9px] font-black uppercase tracking-[0.3em] mb-8 shadow-md backdrop-blur-lg"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          Protocol v2.0 Live
        </motion.div>
        
        {/* Hero Title */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-snug tracking-tighter max-w-3xl mx-auto italic uppercase"
        >
          The Nexus for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--text-main)] via-[var(--text-dim)] to-transparent opacity-80">
            Creators & Readers
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[var(--text-dim)] max-w-xl mx-auto text-sm md:text-base font-medium leading-relaxed mb-12 italic"
        >
          Deploy reading protocols, unlock premium archives with points, or initialize your own creator uplink to monetize your craft.
        </motion.p>

        {/* --- DUAL PORTAL CARDS --- */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
          
          <PortalCard 
            title="User Portal"
            icon={<Glasses size={24} />}
            desc="Access the manga archive, synchronize points, and engage with creator content."
            features={[
              "Adaptive Theme Sync",
              "Point-Based Archive Unlock",
              "Creator Uplink & Revenue"
            ]}
            link="/Userlogin"
            btnText="Initialize Session"
            accent={accentColor}
            isPrimary
          />

          <PortalCard 
            title="Admin Console"
            icon={<ShieldCheck size={24} />}
            desc="System-level access only. Oversee moderation and platform metrics."
            features={[
              "Platform Management",
              "Moderation Oversight",
              "Analytics & Reports"
            ]}
            link="/adminlogin"
            btnText="Command Login"
            accent="#3b82f6"
          />
        </div>
      </main>

      {/* --- REAL-TIME STATS --- */}
      <section className="relative bg-[var(--bg-secondary)]/30 backdrop-blur-2xl py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative z-10">
          <StatItem label="Global Series" value="12k+" icon={<Globe size={14}/>} />
          <StatItem label="Active Uplinks" value="850k" icon={<Activity size={14}/>}/>
          <StatItem label="Data Archives" value="2.4M" icon={<Zap size={14}/>}/>
          <StatItem label="Creator Flow" value="$140k+" icon={<Lock size={14}/>}/>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

// --- HELPER COMPONENTS ---
const PortalCard = ({ title, icon, desc, features, link, btnText, accent, isPrimary }) => (
  <motion.div 
    whileHover={{ y: -4, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300 }}
    className={`relative group bg-[var(--bg-secondary)]/50 backdrop-blur-xl border border-[var(--border)] p-6 md:p-8 rounded-2xl text-left transition-all hover:border-[var(--accent)]/30 overflow-hidden shadow-md`}
  >
    <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full blur-2xl opacity-10 transition-opacity" style={{ backgroundColor: accent }} />
    
    <div className="relative space-y-4 md:space-y-6">
      <motion.div 
        whileHover={{ rotate: 8, scale: 1.05 }}
        className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center border border-white/5 bg-[var(--bg-primary)] shadow-lg`} 
        style={{ color: accent }}
      >
        {icon}
      </motion.div>

      <div>
        <h2 className="text-xl md:text-2xl font-black tracking-tight italic uppercase text-[var(--text-main)] mb-1 md:mb-2">{title}</h2>
        <p className="text-[var(--text-dim)] text-sm md:text-sm font-medium leading-relaxed italic">{desc}</p>
      </div>

      <ul className="space-y-1.5 md:space-y-2">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[var(--text-dim)]">
            <ArrowRight size={12} style={{ color: accent }} /> {f}
          </li>
        ))}
      </ul>

      <Link to={link} className={`w-full py-2.5 md:py-3 rounded-xl font-black uppercase tracking-widest text-xs md:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm ${isPrimary ? 'text-white' : 'bg-[var(--bg-primary)] text-[var(--text-dim)] border border-[var(--border)] hover:text-white'}`} 
        style={isPrimary ? { backgroundColor: accent, boxShadow: `0 8px 20px -6px ${accent}40` } : {}}
      >
        {btnText} <ArrowRight size={14} />
      </Link> 
    </div>
  </motion.div>
);

const StatItem = ({ label, value, icon }) => (
  <div className="text-center group">
    <div className="flex items-center justify-center gap-1 text-[var(--text-dim)] mb-1">
      {icon} <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em]">{label}</span>
    </div>
    <div className="text-2xl md:text-3xl font-black italic tracking-tighter text-[var(--text-main)] group-hover:scale-105 transition-transform">
      {value}
    </div>
  </div>
);

export default MangaRealmLanding;
