import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from "../UserContext";

// --- THE GOD-LEVEL LOGO ---
export const ToonLordLogo = ({ size = 60 }) => {
  const { isRedMode } = useContext(AppContext);
  const accent = isRedMode ? '#FF003C' : '#00F2FF';

  return (
    <div className="relative group cursor-pointer" style={{ width: size, height: size }}>
      {/* Background Pulse Aura */}
      <div className="absolute inset-0 bg-[var(--accent)] opacity-20 blur-2xl rounded-full group-hover:opacity-40 transition-opacity" />
      
      <motion.svg 
        viewBox="0 0 100 100" 
        className="relative z-10 w-full h-full"
        animate={{ filter: [`drop-shadow(0 0 2px ${accent})`, `drop-shadow(0 0 10px ${accent})`, `drop-shadow(0 0 2px ${accent})`] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor="#fff" />
          </linearGradient>
        </defs>

        {/* Outer Ring Segment - Alien Tech Style */}
        <motion.path
          d="M 50,2 A 48,48 0 0,1 98,50"
          fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {/* The 'T' and 'L' Intersection */}
        <path 
          d="M30 35 H70 M50 35 V75 M40 75 H60" 
          fill="none" stroke="url(#logoGrad)" strokeWidth="8" strokeLinecap="square"
        />
      </motion.svg>
    </div>
  );
};

// --- THE BACKGROUND SCANLINES & GLITCH FILTERS ---
export const GlobalSVGFilters = () => (
  <svg className="absolute w-0 h-0 invisible">
    <defs>
      <filter id="hologram">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
        <feComponentTransfer in="blur" result="glow">
          <feFuncA type="linear" slope="2" />
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="glow" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  </svg>
);