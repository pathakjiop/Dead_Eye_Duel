import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Detailed Old-School Colt Peacemaker .45 Six-Shooter Revolver
 * Features:
 * - Visibly rotating fluted cylinder
 * - Cocking hammer
 * - Recoil kickback animation
 * - Explosive muzzle flash & smoke on shot
 */
export default function Revolver({
  isCocked = false,
  isFired = false,
  shotCount = 0,
  className = '',
}) {
  const [cylinderAngle, setCylinderAngle] = useState(0);

  // Each shot rotates the cylinder by 60 degrees (1 chamber of 6)
  useEffect(() => {
    if (shotCount > 0) {
      setCylinderAngle((prev) => prev + 60);
    }
  }, [shotCount]);

  return (
    <div className={`relative flex flex-col items-center justify-end select-none pointer-events-none ${className}`}>
      {/* --- MUZZLE FLASH & SMOKE --- */}
      <AnimatePresence>
        {isFired && (
          <motion.div
            key="muzzle-flash"
            initial={{ opacity: 0, scale: 0.2, y: 30 }}
            animate={{ opacity: 1, scale: [0.3, 1.35, 0.9], y: 0 }}
            exit={{ opacity: 0, scale: 1.6, transition: { duration: 0.3 } }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-[-90px] z-30 pointer-events-none flex flex-col items-center"
          >
            {/* Flash Starburst SVG */}
            <svg viewBox="0 0 200 200" className="w-56 h-56 drop-shadow-[0_0_35px_rgba(245,158,11,0.9)]">
              <defs>
                <radialGradient id="flashGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="25%" stopColor="#fef08a" />
                  <stop offset="60%" stopColor="#ea580c" />
                  <stop offset="90%" stopColor="#991b1b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#7c2d12" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Flash Spikes */}
              <polygon
                points="100,10 114,75 180,30 130,90 195,100 130,115 175,170 115,130 100,195 85,130 25,170 70,115 5,100 70,90 20,30 86,75"
                fill="url(#flashGlow)"
              />
              <circle cx="100" cy="100" r="28" fill="#ffffff" />
            </svg>

            {/* Smoke puff */}
            <motion.div
              initial={{ opacity: 0.8, scale: 0.6 }}
              animate={{ opacity: 0, scale: 2.2, y: -40 }}
              transition={{ duration: 0.7 }}
              className="absolute top-10 w-24 h-24 rounded-full bg-stone-300 blur-md opacity-40"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- REVOLVER BODY & ANIMATIONS --- */}
      <motion.div
        animate={
          isFired
            ? {
                y: [-4, -32, -8, 0],
                rotate: [0, -18, -4, 0],
                transition: { duration: 0.38, ease: 'easeOut' },
              }
            : isCocked
            ? { y: -3, rotate: -2, transition: { duration: 0.2 } }
            : { y: 0, rotate: 0 }
        }
        className="w-full max-w-[340px] h-[260px] relative origin-bottom-right"
      >
        <svg
          viewBox="0 0 520 400"
          className="w-full h-full drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] overflow-visible"
        >
          <defs>
            {/* Blued Gun Metal Gradient */}
            <linearGradient id="bluedSteel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4b5563" />
              <stop offset="35%" stopColor="#1f2937" />
              <stop offset="70%" stopColor="#374151" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>

            {/* Polished Silver / Steel Highlights */}
            <linearGradient id="steelHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#9ca3af" />
              <stop offset="50%" stopColor="#4b5563" />
              <stop offset="100%" stopColor="#1f2937" />
            </linearGradient>

            {/* Brass / Gold Inlay */}
            <linearGradient id="brassGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#eab308" />
              <stop offset="80%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#713f12" />
            </linearGradient>

            {/* Walnut Wooden Grip Gradient */}
            <linearGradient id="woodGrip" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="30%" stopColor="#451a03" />
              <stop offset="60%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#291004" />
            </linearGradient>
          </defs>

          {/* 1. BARREL (Long Colt Peacemaker octagonal barrel) */}
          <path
            d="M 120 148 L 330 148 L 330 190 L 120 190 Z"
            fill="url(#bluedSteel)"
            stroke="#111827"
            strokeWidth="3"
          />
          {/* Top Rib & Sight Blade */}
          <rect x="120" y="142" width="210" height="7" fill="url(#steelHighlight)" />
          <path d="M 125 142 L 138 128 L 146 142 Z" fill="url(#brassGold)" stroke="#713f12" strokeWidth="1" />
          
          {/* Barrel Rifling Crown Muzzle */}
          <ellipse cx="120" cy="169" rx="8" ry="21" fill="#111827" stroke="#374151" strokeWidth="2" />
          <ellipse cx="120" cy="169" rx="4" ry="12" fill="#000000" />

          {/* Ejector Tube below barrel */}
          <rect x="150" y="190" width="170" height="12" rx="4" fill="url(#bluedSteel)" stroke="#111827" strokeWidth="2" />
          <circle cx="150" cy="196" r="6" fill="url(#brassGold)" />

          {/* 2. REVOLVER FRAME (Receiver with engraved scrollwork) */}
          <path
            d="M 328 140 L 415 140 C 435 140, 448 152, 452 170 L 452 230 C 445 255, 410 262, 380 262 L 328 262 L 328 200 Z"
            fill="url(#bluedSteel)"
            stroke="#111827"
            strokeWidth="3"
          />
          {/* Frame Screws and Decorative Inlay */}
          <circle cx="340" cy="155" r="4" fill="url(#brassGold)" />
          <circle cx="430" cy="195" r="5" fill="url(#brassGold)" />
          <path d="M 335 170 Q 360 160 380 180" stroke="url(#brassGold)" strokeWidth="2" fill="none" opacity="0.6" />

          {/* 3. ROTATING SIX-CHAMBER CYLINDER */}
          <g transform="translate(372, 198)">
            {/* Cylinder Base */}
            <rect
              x="-48"
              y="-52"
              width="96"
              height="104"
              rx="12"
              fill="url(#steelHighlight)"
              stroke="#111827"
              strokeWidth="3"
            />
            {/* Rotating Flutes & Chambers */}
            <motion.g
              animate={{ rotate: cylinderAngle }}
              transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            >
              {/* Cylinder Front/Side Grooves (Flutes) */}
              {[-36, -18, 0, 18, 36].map((offsetY, i) => (
                <rect
                  key={i}
                  x="-42"
                  y={offsetY - 5}
                  width="84"
                  height="10"
                  rx="4"
                  fill="#111827"
                  opacity="0.85"
                />
              ))}
              {/* Center axis pin */}
              <circle cx="0" cy="0" r="9" fill="url(#brassGold)" stroke="#1f2937" strokeWidth="2" />
            </motion.g>
          </g>

          {/* 4. HAMMER (Animated cocking back and slamming forward) */}
          <motion.g
            transform="translate(442, 175)"
            animate={
              isCocked
                ? { rotate: -24 }
                : isFired
                ? { rotate: [ -24, 0 ] }
                : { rotate: 0 }
            }
            transition={{ duration: 0.08 }}
            style={{ originX: '10px', originY: '25px' }}
          >
            <path
              d="M 5 22 L 5 -20 C 5 -28, 18 -32, 22 -24 L 20 -10 C 26 -6, 28 8, 20 22 Z"
              fill="url(#steelHighlight)"
              stroke="#111827"
              strokeWidth="2.5"
            />
            {/* Hammer spur checkering */}
            <line x1="12" y1="-22" x2="18" y2="-18" stroke="#111827" strokeWidth="2" />
            <line x1="10" y1="-18" x2="16" y2="-14" stroke="#111827" strokeWidth="2" />
          </motion.g>

          {/* 5. TRIGGER & TRIGGER GUARD */}
          {/* Trigger Guard Loop */}
          <path
            d="M 370 262 C 370 310, 420 310, 424 262"
            fill="none"
            stroke="url(#bluedSteel)"
            strokeWidth="6"
          />
          {/* Curved Trigger Blade */}
          <path
            d="M 390 264 C 392 282, 384 290, 380 294"
            fill="none"
            stroke="url(#brassGold)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* 6. WALNUT WOODEN GRIP (Classic curved bird's-head / plow grip) */}
          <path
            d="M 425 240 C 445 250, 478 285, 485 320 C 492 355, 470 385, 435 388 C 400 390, 395 365, 400 345 C 405 320, 415 275, 420 248 Z"
            fill="url(#woodGrip)"
            stroke="#1a1412"
            strokeWidth="4"
          />
          {/* Wood Grain Lines */}
          <path d="M 435 270 Q 460 315 455 365" stroke="#291004" strokeWidth="2" fill="none" opacity="0.6" />
          <path d="M 445 285 Q 470 325 468 355" stroke="#5c2607" strokeWidth="1.5" fill="none" opacity="0.7" />

          {/* Brass Medallion in Grip Center */}
          <circle cx="445" cy="325" r="9" fill="url(#brassGold)" stroke="#3f2212" strokeWidth="2" />
          <circle cx="445" cy="325" r="4" fill="#3f2212" />

          {/* Grip Bottom Brass Escutcheon */}
          <circle cx="430" cy="376" r="4" fill="url(#brassGold)" />
        </svg>
      </motion.div>
    </div>
  );
}

