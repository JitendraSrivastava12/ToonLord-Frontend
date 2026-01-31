import React from 'react';

const ToonLordLogo = ({ isRedMode = false }) => {
  // Logic: Use Red if RedMode is active, otherwise use the theme's accent color
  const accentColor = isRedMode ? '#dc2626' : 'var(--accent, #3b82f6)';
  const glowColor = isRedMode ? 'rgba(220, 38, 38, 0.4)' : 'var(--accent-glow, rgba(59, 130, 246, 0.3))';
  
  return (
    <div className="flex items-center gap-3 group cursor-pointer select-none">
      {/* --- ICON SECTION (PURE CSS) --- */}
      <div className="relative w-11 h-11 flex items-center justify-center">
        {/* Main Glass Square */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl transition-all duration-500 group-hover:rotate-[10deg] group-hover:scale-110 group-hover:bg-white/15" />
        
        {/* Inner Content: The "T" Shape made with CSS Divs */}
        <div className="relative z-10 w-5 h-5">
           {/* Horizontal bar of the T */}
          <div className="absolute top-0 left-0 w-full h-[6px] bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
          {/* Vertical bar of the T */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[6px] h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
        </div>

        {/* The "Action" Corner (Page Fold) */}
        <div 
          className="absolute bottom-1 right-1 w-3 h-3 rounded-br-lg rounded-tl-sm transition-all duration-500"
          style={{ 
            backgroundColor: accentColor,
            boxShadow: `0 0 10px ${glowColor}`,
            clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' 
          }}
        />

        {/* Ambient Glow Orb behind the icon */}
        <div 
          className="absolute inset-2 rounded-full blur-xl opacity-40 transition-all duration-700 group-hover:opacity-70"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      {/* --- TEXT SECTION --- */}
      <div className="flex flex-col leading-none">
        <h2 className="text-[var(--text-main, #fff)] font-black text-2xl tracking-tighter uppercase italic flex items-center">
          TOON
          <span 
            className="transition-all duration-700" 
            style={{ 
              color: accentColor, 
              textShadow: `0 0 15px ${glowColor}` 
            }}
          >
            LORD
          </span>
        </h2>
        
        <div className="flex items-center gap-1.5 opacity-50">
          <div 
            className="h-[1px] w-3 transition-colors duration-500" 
            style={{ backgroundColor: accentColor }}
          />
          <span className="text-[7px] text-[var(--text-dim, #94a3b8)] font-black tracking-[0.5em] uppercase">
            {isRedMode ? "Security Active" : "Premium Manga"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ToonLordLogo;