import React from 'react';

/**
 * Gritty 35mm film grain, warm desert vignette, and optional Tequila Mode screen wobble
 * Safe for all mobile aspect ratios (never blacks out the screen).
 */
export default function GrainOverlay({ tequilaMode = false }) {
  return (
    <>
      {/* 1. Cinematic Mobile-Safe Vignette (Gentle edge darkening only) */}
      <div
        className="fixed inset-0 pointer-events-none z-30 select-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 50%, rgba(20, 12, 8, 0.4) 85%, rgba(10, 6, 4, 0.7) 100%)',
        }}
      />

      {/* 2. Micro Noise Layer (Safe SVG filter with low opacity) */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-20 opacity-[0.06] select-none">
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="2"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      {/* 3. Tequila Mode Heat-Wave / Drunk Distortion */}
      {tequilaMode && (
        <div
          className="fixed inset-0 pointer-events-none z-35 mix-blend-color-dodge opacity-25 animate-heatwave"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(234, 179, 8, 0.3) 0%, rgba(220, 38, 38, 0.3) 100%)',
          }}
        />
      )}
    </>
  );
}
