import React from 'react';
import { motion } from 'framer-motion';

/**
 * Traditional Mexican Papel Picado decorative garland banner
 */
export default function PapelPicado({ className = '' }) {
  const flags = [
    { color: '#dc2626', icon: '💀' },
    { color: '#f59e0b', icon: '🌵' },
    { color: '#16a34a', icon: '⚡' },
    { color: '#0284c7', icon: '🔫' },
    { color: '#ea580c', icon: '☀️' },
    { color: '#c026d3', icon: '💀' },
  ];

  return (
    <div className={`w-full overflow-hidden pointer-events-none select-none ${className}`}>
      {/* String */}
      <div className="w-full h-[2px] bg-amber-200/40 relative">
        <div className="flex justify-around items-start w-full px-2">
          {flags.map((flag, index) => (
            <motion.div
              key={index}
              animate={{
                rotate: [index % 2 === 0 ? -3 : 3, index % 2 === 0 ? 3 : -3],
                skewX: [0, index % 2 === 0 ? 2 : -2, 0],
              }}
              transition={{
                duration: 2.2 + (index % 3) * 0.4,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
              className="origin-top flex flex-col items-center"
            >
              {/* Flag cutout paper */}
              <div
                className="w-10 h-12 shadow-sm flex flex-col items-center justify-center relative rounded-b-sm border-t-2 border-white/30"
                style={{
                  backgroundColor: flag.color,
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%)',
                }}
              >
                {/* Lace cutout hole patterns */}
                <div className="absolute top-1 flex space-x-1 opacity-70">
                  <div className="w-1.5 h-1.5 rounded-full bg-desert-dark/40" />
                  <div className="w-1.5 h-1.5 rounded-full bg-desert-dark/40" />
                </div>
                <span className="text-sm drop-shadow-sm select-none">{flag.icon}</span>
                <div className="absolute bottom-2 flex space-x-1 opacity-70">
                  <div className="w-1 h-1 rounded-full bg-desert-dark/40" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

