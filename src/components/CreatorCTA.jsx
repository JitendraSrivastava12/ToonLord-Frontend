import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { CloudUpload, BarChart3, DollarSign, ChevronRight, Rocket, Sparkles } from 'lucide-react';
import { AppContext } from "../UserContext";

const CreatorCTA = () => {
  const { isRedMode, currentTheme } = useContext(AppContext);

  const accent = isRedMode ? '#ef4444' : 'var(--accent)';
  const glow = isRedMode ? 'rgba(239, 68, 68, 0.4)' : 'var(--accent-glow)';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    // Reduced outer vertical padding from py-6 to py-2
    <section className={`container mx-auto px-2 py-2 theme-${currentTheme}`}>
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
        // Changed desktop padding from lg:p-12 to lg:py-8 (decreases height significantly)
        className="relative overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[3rem] p-6 lg:py-8 lg:px-12 shadow-1xl transition-all duration-700"
      >
        
        {/* Background Mesh Gradient Glow */}
        <div 
          className="absolute -top-24 -right-24 w-[400px] h-[400px] blur-[120px] opacity-20 rounded-full transition-all duration-1000 animate-pulse"
          style={{ backgroundColor: accent }}
        />
        
        {/* Reduced gap from gap-20 to gap-12 */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          
          {/* Left Content Column - Tightened space-y-8 to space-y-6 */}
          <div className="text-center lg:text-left space-y-6 flex-1">
            <div className="flex items-center justify-center lg:justify-start gap-3">
               <span 
                 className="px-4 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-primary)] text-[9px] font-black uppercase tracking-[0.4em] flex items-center gap-2"
                 style={{ color: accent }}
               >
                 <Sparkles size={10} /> Creator Studio
               </span>
            </div>
            
            {/* Slightly reduced text size on desktop for compact look */}
            <h2 className="text-5xl lg:text-7xl font-black italic tracking-tighter text-[var(--text-main)] leading-[0.85] uppercase">
              Deploy Your <br />
              <span className="transition-colors duration-700" style={{ color: accent }}>Legacy.</span>
            </h2>
            
            <p className="text-[var(--text-dim)] max-w-lg leading-relaxed text-sm font-medium italic opacity-80">
              Transform your narrative into a global phenomenon. Access real-time analytical dossiers, 
              direct monetization uplinks, and high-fidelity publishing tools.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button 
                className="group flex items-center gap-4 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-2xl text-white"
                style={{ backgroundColor: accent, boxShadow: `0 15px 30px -10px ${glow}` }}
              >
                Start Publishing
                <Rocket size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
              
              <button className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] hover:border-[var(--accent)]/50 transition-all font-black text-[10px] uppercase tracking-widest text-[var(--text-dim)] hover:text-[var(--text-main)] shadow-xl">
                Command Center
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Right Feature Grid - Reduced gaps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:w-auto">
            <FeatureCard 
              variants={itemVariants}
              icon={<CloudUpload size={24} />} 
              title="Fast Sync" 
              desc="Instant deployment."
              accent={accent}
            />
            <FeatureCard 
              variants={itemVariants}
              icon={<BarChart3 size={24} />} 
              title="Intelligence" 
              desc="Behavior metrics."
              accent={accent}
            />
            <FeatureCard 
              variants={itemVariants}
              icon={<DollarSign size={24} />} 
              title="Revenue" 
              desc="Credit conversion."
              accent={accent}
            />
            <motion.div 
              variants={itemVariants}
              className="hidden sm:flex p-6 rounded-[2rem] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-glow)] items-center justify-center text-white italic font-black text-xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500"
            >
              10K+ ARCHITECTS
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

// Reusable Feature Card - Reduced padding from p-10 to p-6
const FeatureCard = ({ icon, title, desc, accent, variants }) => (
  <motion.div 
    variants={variants}
    className="p-6 bg-[var(--bg-primary)]/40 backdrop-blur-3xl rounded-[2rem] border border-[var(--border)] group hover:border-[var(--accent)]/40 transition-all duration-500 shadow-xl"
  >
    <div 
      className="mb-4 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12"
      style={{ color: accent }}
    >
      {icon}
    </div>
    <p className="font-black text-xs uppercase tracking-[0.2em] text-[var(--text-main)] mb-1">{title}</p>
    <p className="text-[10px] text-[var(--text-dim)] font-bold uppercase opacity-60 leading-tight">{desc}</p>
  </motion.div>
);

export default CreatorCTA;