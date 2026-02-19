import React, { useContext } from 'react';
import { 
  Glasses, 
  ShieldCheck, 
  ArrowRight, 
  Lock,
  Globe,
  Zap,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppContext } from "../UserContext";

const MangaRealmLanding = () => {
  const { currentTheme, isRedMode } = useContext(AppContext);

  const accentColor = isRedMode ? '#f43f5e' : 'var(--accent)'; 
  
  return (
    <div className={`relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-main)] font-sans overflow-x-hidden theme-${currentTheme}`}>
      
      {/* BACKGROUND DECOR */}
      <div 
        className="absolute top-32 left-32 w-[360px] h-[360px] rounded-full blur-[120px] opacity-[0.06] pointer-events-none" 
        style={{ backgroundColor: accentColor }} 
      />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* HERO */}
      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-2 md:pt-10 pb-16 text-center z-10">
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 leading-tight tracking-tight max-w-3xl mx-auto"
        >
          A Home for Manga  
          <span className="block text-[var(--text-dim)] font-medium">
            Readers and Creators
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[var(--text-dim)] max-w-xl mx-auto text-sm md:text-base leading-relaxed mb-12"
        >
          Read manga, support creators, and unlock premium chapters using reward points.  
          Creators can publish their work and earn from their audience.
        </motion.p>

        {/* CARDS */}
        <div className="grid md:grid-cols-2 gap-5 md:gap-6 max-w-4xl mx-auto">
          
          <PortalCard 
            title="Reader Account"
            icon={<Glasses size={22} />}
            desc="Browse manga, collect reward points, and support your favorite creators."
            features={[
              "Light and Dark Mode",
              "Premium Chapters",
              "Creator Subscriptions"
            ]}
            link="/Userlogin"
            btnText="Continue as Reader"
            accent={accentColor}
            isPrimary
          />

          <PortalCard 
            title="Admin Panel"
            icon={<ShieldCheck size={22} />}
            desc="Manage content, users, and platform operations and manage user reports and premium requests."
            features={[
              "Content Moderation",
              "User Management",
              "Usage Reports"
            ]}
            link="/adminlogin"
            btnText="Admin Login"
            accent="#3b82f6"
          />
        </div>
      </main>

      {/* STATS */}
      <section className="relative bg-[var(--bg-secondary)]/40 backdrop-blur-xl py-12 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          <StatItem label="Total Series" value="300+" icon={<Globe size={14}/>} />
          <StatItem label="Active Users" value="50+" icon={<Activity size={14}/>}/>
          <StatItem label="Chapters Read" value="500+" icon={<Zap size={14}/>}/>
          <StatItem label="Creator Earnings" value="₹10k+" icon={<Lock size={14}/>}/>
        </div>
      </section>

    </div>
  );
};

const PortalCard = ({ title, icon, desc, features, link, btnText, accent, isPrimary }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    transition={{ type: "spring", stiffness: 200, damping: 20 }}
    className="relative group bg-[var(--bg-secondary)]/60 backdrop-blur-xl border border-[var(--border)] p-6 md:p-8 rounded-2xl text-left transition-all hover:border-[var(--accent)]/20 overflow-hidden shadow-sm"
  >
    <div 
      className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-10" 
      style={{ backgroundColor: accent }} 
    />
    
    <div className="relative space-y-5">
      <div 
        className="w-14 h-14 rounded-xl flex items-center justify-center border border-white/5 bg-[var(--bg-primary)] shadow-sm" 
        style={{ color: accent }}
      >
        {icon}
      </div>

      <div>
        <h2 className="text-lg md:text-xl font-semibold tracking-tight text-[var(--text-main)] mb-1">
          {title}
        </h2>
        <p className="text-[var(--text-dim)] text-sm leading-relaxed">
          {desc}
        </p>
      </div>

      <ul className="space-y-2">
        {features.map((f, i) => (
          <li 
            key={i} 
            className="flex items-center gap-2 text-xs text-[var(--text-dim)]"
          >
            <ArrowRight size={12} style={{ color: accent }} /> {f}
          </li>
        ))}
      </ul>

      <Link 
        to={link} 
        className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-95
        ${isPrimary 
          ? 'text-white' 
          : 'bg-[var(--bg-primary)] text-[var(--text-dim)] border border-[var(--border)] hover:text-[var(--text-main)]'
        }`} 
        style={isPrimary ? { backgroundColor: accent } : {}}
      >
        {btnText} <ArrowRight size={14} />
      </Link> 
    </div>
  </motion.div>
);

const StatItem = ({ label, value, icon }) => (
  <div className="text-center group">
    <div className="flex items-center justify-center gap-1 text-[var(--text-dim)] mb-1">
      {icon} 
      <span className="text-[10px] font-medium tracking-wide">
        {label}
      </span>
    </div>
    <div className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--text-main)] group-hover:scale-105 transition-transform">
      {value}
    </div>
  </div>
);

export default MangaRealmLanding;
