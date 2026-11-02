import React from 'react';

/**
 * Western carved tally marks on wood / stone
 */
export default function TallyScore({
  score = 0,
  maxScore = 2,
  label = 'PUNTOS',
  color = '#eab308',
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {label && (
        <span className="text-[11px] font-mono uppercase tracking-widest text-desert-sand/70 mb-1">
          {label}
        </span>
      )}
      <div className="flex items-center space-x-2 bg-stone-950/60 px-3 py-1.5 rounded border border-amber-900/60 shadow-inner">
        {Array.from({ length: maxScore }).map((_, i) => {
          const isMarked = i < score;
          return (
            <div
              key={i}
              className="relative w-4 h-7 flex items-center justify-center"
            >
              {isMarked ? (
                // Carved slash mark
                <div
                  className="w-1.5 h-6 rounded-sm shadow-[0_0_8px_rgba(234,179,8,0.7)]"
                  style={{
                    backgroundColor: color,
                    transform: i % 2 === 0 ? 'rotate(-12deg)' : 'rotate(8deg)',
                  }}
                />
              ) : (
                // Faint notch / empty slot
                <div className="w-1.5 h-6 rounded-sm bg-stone-800/80 border border-stone-700/40" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

