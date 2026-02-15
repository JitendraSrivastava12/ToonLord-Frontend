import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, ArrowLeft, ShieldAlert, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from "../UserContext";

const NotFound = () => {
  const navigate = useNavigate();
  const { isRedMode, currentTheme } = useContext(AppContext);

  const theme = {
    text: isRedMode ? 'text-red-500' : 'text-emerald-500',
    primary: isRedMode ? 'bg-red-500' : 'bg-emerald-500',
    border: isRedMode ? 'border-red-500/30' : 'border-emerald-500/30',
    glow: isRedMode ? 'shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'shadow-[0_0_30px_rgba(16,185,129,0.2)]'
  };

  return (
    <div className={`min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6 overflow-hidden relative theme-${currentTheme}`}>
      
      {/* CORRUPTED BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            opacity: [0.05, 0.1, 0.05],
            scale: [1, 1.2, 1] 
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full ${theme.primary} blur-[120px] opacity-10`}
        />
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* GLITCHING ERROR CODE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <h1 className="text-[12rem] font-black leading-none tracking-tighter italic opacity-10 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <AlertTriangle size={120} className={`${theme.text} drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]`} />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* SYSTEM STATUS MESSAGE */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
             <span className={`px-3 py-1 rounded-full bg-[var(--text-main)]/5 border ${theme.border} text-[10px] font-black uppercase tracking-[0.3em] ${theme.text}`}>
                Status: Link_Severed
             </span>
          </div>
          
          <h2 className="text-4xl font-black uppercase tracking-tighter italic text-[var(--text-main)]">
            Neural Link <span className={theme.text}>Corrupted</span>
          </h2>
          
          <p className="text-sm text-[var(--text-muted)] font-medium max-w-md mx-auto leading-relaxed uppercase tracking-widest opacity-70">
            The data fragment you are looking for has been purged from the ToonLord vault or moved to a restricted sector.
          </p>
        </motion.div>

        {/* RECOVERY ACTIONS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate(-1)}
            className={`w-full sm:w-auto px-8 py-4 rounded-2xl bg-[var(--text-main)]/5 border ${theme.border} text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[var(--text-main)]/10 transition-all flex items-center justify-center gap-3`}
          >
            <ArrowLeft size={16} /> Re-route Previous
          </button>

          <button
            onClick={() => navigate('/')}
            className={`w-full sm:w-auto px-8 py-4 ${theme.primary} text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl ${theme.glow} hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3`}
          >
            <Home size={16} /> Emergency Home Link
          </button>
        </motion.div>

        {/* SYSTEM LOG FOOTER */}
        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col items-center gap-4 opacity-30">
          <div className="flex gap-8 text-[9px] font-mono uppercase tracking-[0.3em]">
            <span className="flex items-center gap-2"><Cpu size={12}/> Sector: 0x404</span>
            <span className="flex items-center gap-2"><ShieldAlert size={12}/> Firewall: Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;