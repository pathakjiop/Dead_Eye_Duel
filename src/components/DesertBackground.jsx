import React from 'react';
import { motion } from 'framer-motion';

/**
 * Sun-baked Mexican desert scene background with saguaros, adobe ruins,
 * tumbleweed, sun glare, and cracked ground.
 */
export default function DesertBackground({ bulletHoles = [] }) {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0">
      {/* 1. SKY GRADIENT (Terracotta / Burnt Orange / Sun Gold) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#7c2d12] via-[#c2410c] to-[#d97706] opacity-95" />

      {/* 2. BLAZING DESERT SUN */}
      <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-gradient-to-b from-[#fef08a] to-[#f59e0b] opacity-80 blur-[2px] shadow-[0_0_90px_rgba(245,158,11,0.7)]" />

      {/* 3. DISTANT MESAS & MOUNTAIN SILHOUETTES */}
      <svg
        className="absolute bottom-[24%] left-0 w-full h-32 opacity-40"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
      >
        <path
          d="M 0 200 L 0 120 L 120 120 L 220 90 L 340 90 L 400 130 L 520 80 L 680 80 L 740 140 L 890 100 L 1020 100 L 1110 140 L 1200 110 L 1200 200 Z"
          fill="#451a03"
        />
      </svg>

      {/* 4. MIDGROUND ADOBE WALL & SAGUARO CACTI SILHOUETTES */}
      <svg
        className="absolute bottom-[16%] left-0 w-full h-44 opacity-85"
        viewBox="0 0 1000 240"
        preserveAspectRatio="none"
      >
        {/* Adobe mission / church silhouette on left */}
        <path
          d="M 40 240 L 40 130 L 70 130 L 70 110 C 70 95, 95 95, 95 110 L 95 130 L 140 130 L 140 240 Z"
          fill="#1c0b05"
        />
        {/* Adobe bell opening */}
        <ellipse cx="82" cy="118" rx="6" ry="9" fill="#c2410c" />

        {/* Cacti left */}
        <g fill="#140703">
          {/* Main trunk */}
          <rect x="220" y="70" width="16" height="170" rx="8" />
          {/* Left arm */}
          <path d="M 220 140 H 195 V 95 H 207 V 130 H 220 Z" />
          {/* Right arm */}
          <path d="M 236 125 H 260 V 85 H 248 V 115 H 236 Z" />

          {/* Small Saguaro right */}
          <rect x="820" y="90" width="14" height="150" rx="7" />
          <path d="M 820 150 H 800 V 110 H 810 V 140 H 820 Z" />
          <path d="M 834 135 H 855 V 100 H 845 V 125 H 834 Z" />

          {/* Nopal / Prickly Pear Cactus right */}
          <ellipse cx="730" cy="205" rx="14" ry="18" />
          <ellipse cx="718" cy="180" rx="11" ry="14" transform="rotate(-15 718 180)" />
          <ellipse cx="744" cy="178" rx="12" ry="15" transform="rotate(20 744 178)" />
        </g>
      </svg>

      {/* 5. FOREGROUND CRACKED DRY EARTH */}
      <div className="absolute bottom-0 left-0 w-full h-[22%] bg-gradient-to-t from-[#140c08] via-[#241108] to-[#3a1b0d]">
        <svg
          viewBox="0 0 1000 120"
          className="w-full h-full opacity-35"
          preserveAspectRatio="none"
        >
          <path
            d="M 10 120 L 70 80 L 130 95 L 210 60 L 260 90 L 320 70 L 410 100 L 490 75 L 560 95 L 640 60 L 720 90 L 810 70 L 890 105 L 980 65 L 1000 120 Z"
            fill="#0d0705"
          />
          <path
            d="M 120 120 L 160 85 L 195 92 L 230 65 M 340 120 L 380 90 L 420 98 M 670 120 L 710 85 L 755 92 L 790 68"
            stroke="#eab308"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* 6. ANIMATED TUMBLEWEED */}
      <motion.div
        animate={{
          x: ['-10vw', '110vw'],
          y: [0, -18, 0, -24, 0, -15, 0],
          rotate: [0, 1080],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 5,
        }}
        className="absolute bottom-[18%] left-0 z-10 opacity-75"
      >
        <svg viewBox="0 0 60 60" className="w-11 h-11">
          <circle cx="30" cy="30" r="24" fill="none" stroke="#78350f" strokeWidth="2.5" strokeDasharray="4 3" />
          <path d="M 12 25 Q 30 40 48 20" stroke="#92400e" strokeWidth="2" fill="none" />
          <path d="M 18 42 Q 32 15 42 38" stroke="#78350f" strokeWidth="2" fill="none" />
          <path d="M 28 8 Q 15 32 38 48" stroke="#a16207" strokeWidth="2" fill="none" />
          <circle cx="30" cy="30" r="14" fill="none" stroke="#78350f" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      </motion.div>

      {/* 7. PERSISTENT BULLET HOLES ON SCREEN */}
      {bulletHoles && bulletHoles.map((hole) => (
        <div
          key={hole.id}
          className="absolute z-20 pointer-events-none"
          style={{
            left: `${hole.x}%`,
            top: `${hole.y}%`,
            transform: `translate(-50%, -50%) rotate(${hole.angle || 0}deg)`,
          }}
        >
          <svg viewBox="0 0 60 60" className="w-12 h-12 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            <circle cx="30" cy="30" r="12" fill="#262626" stroke="#0a0a0a" strokeWidth="3" />
            <circle cx="30" cy="30" r="6" fill="#000000" />
            <path d="M 30 18 L 28 8 L 32 4" stroke="#d4d4d8" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M 42 30 L 52 28 L 58 32" stroke="#d4d4d8" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M 30 42 L 33 52 L 29 57" stroke="#d4d4d8" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M 18 30 L 8 33 L 3 29" stroke="#d4d4d8" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M 22 22 L 14 14" stroke="#d4d4d8" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
            <path d="M 38 38 L 48 48" stroke="#d4d4d8" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6" />
          </svg>
        </div>
      ))}
    </div>
  );
}
