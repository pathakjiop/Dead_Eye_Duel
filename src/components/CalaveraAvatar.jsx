import React from 'react';

/**
 * Calavera (Sugar Skull) Avatar Component
 * Renders authentic Mexican Day of the Dead / Western skull art
 */
export default function CalaveraAvatar({
  avatar,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  isReady = false,
  showBorder = true,
  className = '',
}) {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const iconType = avatar?.iconType || 'sombrero';
  const color = avatar?.color || '#eab308';
  const secondary = avatar?.secondary || '#1a1412';
  const accent = avatar?.accent || '#ea580c';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full transition-all duration-300 ${sizeMap[size] || sizeMap.md} ${className} ${
        showBorder ? 'p-1' : ''
      }`}
      style={{
        background: showBorder
          ? `radial-gradient(circle, ${color}33 0%, ${secondary} 80%)`
          : 'transparent',
        border: showBorder ? `2px solid ${isReady ? '#22c55e' : color}` : 'none',
        boxShadow: isReady
          ? '0 0 16px rgba(34, 197, 94, 0.6)'
          : `0 0 12px ${color}40`,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-md"
      >
        {/* SKULL BASE */}
        <path
          d="M 28 48 C 28 26, 72 26, 72 48 C 72 60, 65 65, 60 70 L 60 82 L 40 82 L 40 70 C 35 65, 28 60, 28 48 Z"
          fill="#faf8f5"
          stroke={secondary}
          strokeWidth="2.5"
        />

        {/* CHEEKBONE CONTOUR */}
        <path d="M 32 58 Q 40 60 38 70" stroke={secondary} strokeWidth="1.5" fill="none" opacity="0.6" />
        <path d="M 68 58 Q 60 60 62 70" stroke={secondary} strokeWidth="1.5" fill="none" opacity="0.6" />

        {/* CALAVERA EYE SOCKETS */}
        <ellipse cx="40" cy="50" rx="8" ry="9" fill={secondary} />
        <ellipse cx="60" cy="50" rx="8" ry="9" fill={secondary} />

        {/* INNER EYE ACCENTS / FLOWERS */}
        <circle cx="40" cy="50" r="3.5" fill={color} />
        <circle cx="60" cy="50" r="3.5" fill={color} />
        <circle cx="40" cy="50" r="1.5" fill="#faf8f5" />
        <circle cx="60" cy="50" r="1.5" fill="#faf8f5" />

        {/* HEART-SHAPED NOSE CAVITY */}
        <path
          d="M 50 63 L 47 59 C 45 56, 47 54, 50 56 C 53 54, 55 56, 53 59 Z"
          fill={secondary}
        />

        {/* TEETH / JAW DETAILS */}
        <rect x="42" y="74" width="16" height="8" rx="2" fill="#faf8f5" stroke={secondary} strokeWidth="1.5" />
        <line x1="46" y1="74" x2="46" y2="82" stroke={secondary} strokeWidth="1.5" />
        <line x1="50" y1="74" x2="50" y2="82" stroke={secondary} strokeWidth="1.5" />
        <line x1="54" y1="74" x2="54" y2="82" stroke={secondary} strokeWidth="1.5" />

        {/* FOREHEAD ACCENT PATTERN (Marigold Petals) */}
        <circle cx="50" cy="36" r="3" fill={accent} />
        <circle cx="45" cy="38" r="2" fill={color} />
        <circle cx="55" cy="38" r="2" fill={color} />
        <circle cx="50" cy="31" r="2" fill={color} />

        {/* --- ACCESSORIES PER AVATAR TYPE --- */}
        {iconType === 'sombrero' && (
          <g>
            {/* Wide Sombrero Brim */}
            <ellipse cx="50" cy="32" rx="46" ry="11" fill={accent} stroke="#451a03" strokeWidth="2" />
            <ellipse cx="50" cy="31" rx="42" ry="7" fill={color} />
            {/* Sombrero Crown */}
            <path
              d="M 36 30 Q 50 8 64 30 Z"
              fill={secondary}
              stroke="#451a03"
              strokeWidth="2"
            />
            {/* Sombrero Band */}
            <path d="M 36 29 Q 50 33 64 29" stroke={color} strokeWidth="3" fill="none" />
          </g>
        )}

        {iconType === 'floral' && (
          <g>
            {/* Marigold floral crown for La Calavera */}
            <circle cx="32" cy="30" r="7" fill="#ea580c" />
            <circle cx="32" cy="30" r="3.5" fill="#facc15" />
            <circle cx="50" cy="24" r="8" fill="#e11d48" />
            <circle cx="50" cy="24" r="4" fill="#facc15" />
            <circle cx="68" cy="30" r="7" fill="#ea580c" />
            <circle cx="68" cy="30" r="3.5" fill="#facc15" />
          </g>
        )}

        {iconType === 'bandana' && (
          <g>
            {/* Bandit Face Mask / Bandana */}
            <polygon points="34,64 66,64 50,86" fill={color} stroke="#083344" strokeWidth="2" />
            <path d="M 40 70 L 46 76" stroke="#faf8f5" strokeWidth="1" />
            <path d="M 54 70 L 60 76" stroke="#faf8f5" strokeWidth="1" />
          </g>
        )}

        {iconType === 'mustache' && (
          <g>
            {/* Vaquero Handlebar Mustache */}
            <path
              d="M 50 67 C 44 65, 36 65, 30 73 C 34 76, 43 72, 50 70 C 57 72, 66 76, 70 73 C 64 65, 56 65, 50 67 Z"
              fill={secondary}
              stroke="#000000"
              strokeWidth="1.5"
            />
          </g>
        )}

        {iconType === 'hood' && (
          <g>
            {/* La Muerte Hood */}
            <path
              d="M 22 52 C 20 20, 80 20, 78 52 C 78 72, 68 84, 50 88 C 32 84, 22 72, 22 52 Z"
              fill="none"
              stroke={color}
              strokeWidth="4"
            />
          </g>
        )}

        {iconType === 'rose' && (
          <g>
            {/* Señorita Rose in Teeth / Hair */}
            <circle cx="72" cy="42" r="6" fill="#e11d48" />
            <circle cx="72" cy="42" r="3" fill="#be123c" />
            <path d="M 68 46 Q 64 54 58 68" stroke="#15803d" strokeWidth="2" fill="none" />
          </g>
        )}
      </svg>

      {/* Ready Badge */}
      {isReady && (
        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-green-600 text-white tracking-wider border border-green-300">
          ✓
        </span>
      )}
    </div>
  );
}

