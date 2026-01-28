import React from 'react';

const ToonLordLogo = ({ isRedMode = false }) => {
  // Theme colors: Red-600 vs Green-400
  const primaryColor = isRedMode ? '#dc2626' : '#4ade80'; 
  
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="relative flex items-center justify-center">
        {/* Glassmorphism Background Layer */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl transition-all duration-500 group-hover:bg-white/10" />
        
        <svg
          width="48"
          height="48"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 p-1 transition-transform duration-500 group-hover:scale-110 "
        >
          <defs>
            {/* Glass Effect Gradient */}
            <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.2" />
              <stop offset="100%" stopColor="white" stopOpacity="0.05" />
            </linearGradient>
            
            {/* Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Main Logo Shape: Stylized Crown/Shield */}
          <path
            d="M30 25L50 15L70 25V45L50 55L30 45V25Z"
            fill="url(#glassGradient)"
            stroke="white"
            strokeOpacity="0.3"
            strokeWidth="1.5"
          />
          
          {/* Accent Lightning / Zap - Now Green-400 or Red */}
          <path
            d="M50 30L40 45H50L45 60L60 40H50L55 30H50Z"
            fill={primaryColor}
            filter="url(#glow)"
            className="transition-colors duration-500"
          />

          {/* Bottom Glass Plate */}
          <rect
            x="20"
            y="65"
            width="60"
            height="8"
            rx="4"
            fill="white"
            fillOpacity="0.1"
            stroke="white"
            strokeOpacity="0.1"
          />
        </svg>

        {/* Outer Glow Orb (Ambient light behind glass) */}
        <div 
          className="absolute inset-1 rounded-full blur-2xl opacity-20 transition-colors duration-500"
          style={{ backgroundColor: primaryColor }}
        />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col leading-none">
        <span className="text-white font-black text-2xl tracking-tighter uppercase italic">
          Toon<span className="transition-colors duration-500" style={{ color: primaryColor }}>Lord</span>
        </span>
        <span className="text-[8px] text-gray-500 font-black tracking-[0.4em] uppercase ml-1">
          Premium Manga
        </span>
      </div>
    </div>
  );
};

export default ToonLordLogo;