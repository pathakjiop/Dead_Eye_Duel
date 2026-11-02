import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Share2, ArrowLeft, Loader2 } from 'lucide-react';
import CalaveraAvatar from '../components/CalaveraAvatar';
import PapelPicado from '../components/PapelPicado';

export default function CreateRoomScreen({
  roomCode = '',
  player,
  peerError,
  onCancel,
  sound,
}) {
  const [copied, setCopied] = useState(false);

  // Start desert wind on mount, stop on unmount
  useEffect(() => {
    if (sound?.startWind) {
      sound.startWind();
    }
    return () => {
      if (sound?.stopWind) {
        sound.stopWind();
      }
    };
  }, []); // Run only on mount/unmount

  const safeCode = String(roomCode || '????').toUpperCase();

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?room=${safeCode}`
    : `/?room=${safeCode}`;

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
      }
      setCopied(true);
      if (sound?.playHammerCock) sound.playHammerCock();
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'DEAD EYE DUEL — Quick-Draw Challenge',
          text: `Draw your six-shooter! Join room [${safeCode}] for a quick-draw duel:`,
          url: inviteUrl,
        });
      } catch {}
    } else {
      handleCopy();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center px-4 py-6 max-w-md mx-auto text-center z-10 overflow-y-auto">
      <PapelPicado className="mb-2" />

      {/* Top Header */}
      <div className="w-full flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center space-x-1 text-amber-400 font-mono text-xs px-2.5 py-1.5 rounded bg-stone-900/80 border border-amber-900/60 active:scale-95"
        >
          <ArrowLeft size={14} />
          <span>BACK</span>
        </button>
        <span className="text-xs font-mono uppercase tracking-widest text-amber-500 font-bold">
          HOSTING STANDOFF
        </span>
        <div className="w-14" />
      </div>

      {/* Center Room Code Card */}
      <div className="flex flex-col items-center my-auto w-full py-2">
        <CalaveraAvatar avatar={player?.avatar} size="lg" className="mb-3" />
        <span className="text-xs font-mono uppercase tracking-widest text-desert-sand/70">
          YOUR SECRET ROOM CODE
        </span>

        {/* Big 4-Character Code Box */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="mt-2 px-8 py-4 bg-stone-950/90 border-2 border-amber-500 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center justify-center space-x-3"
        >
          {safeCode.split('').map((char, index) => (
            <motion.span
              key={index}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, delay: index * 0.15, repeat: Infinity }}
              className="text-4xl sm:text-5xl font-rye text-amber-400 drop-shadow-[0_2px_10px_rgba(245,158,11,0.8)]"
            >
              {char}
            </motion.span>
          ))}
        </motion.div>

        {/* Action Buttons: Copy link & Native Share */}
        <div className="flex space-x-2 mt-4 w-full max-w-xs justify-center">
          <button
            onClick={handleCopy}
            className={`flex-1 py-2.5 px-3 rounded text-xs font-mono uppercase tracking-wider flex items-center justify-center space-x-1.5 border transition-all ${
              copied
                ? 'bg-green-700 text-white border-green-500'
                : 'bg-stone-900 text-amber-400 border-amber-700/70 hover:bg-stone-800'
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'LINK COPIED!' : 'COPY INVITE LINK'}</span>
          </button>

          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              onClick={handleShare}
              className="py-2.5 px-3 rounded bg-amber-600 text-stone-950 border border-amber-400 font-mono text-xs flex items-center justify-center hover:bg-amber-500 active:scale-95"
              title="Share Invite"
            >
              <Share2 size={16} />
            </button>
          )}
        </div>

        {/* Error notice if peer failed */}
        {peerError && (
          <div className="mt-3 p-2 bg-red-950/80 border border-red-500 text-red-200 text-xs font-mono rounded max-w-xs">
            {peerError}
          </div>
        )}

        {/* Waiting animation */}
        <div className="mt-6 flex flex-col items-center">
          <div className="flex items-center space-x-2 text-amber-300 font-mono text-xs tracking-wider">
            <Loader2 size={16} className="animate-spin text-amber-500" />
            <span>WAITING FOR RIVAL TO ENTER CANTINA...</span>
          </div>

          <motion.div
            animate={{ rotate: 360, x: [-20, 20, -20] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
            className="text-2xl mt-3 select-none"
          >
            🌾
          </motion.div>
          <span className="text-[11px] font-mono text-desert-sand/50 mt-2">
            Share the 4-letter code or invite link with your opponent
          </span>
        </div>
      </div>

      <div className="pb-2">
        <button
          onClick={onCancel}
          className="text-xs font-mono text-red-400/80 hover:text-red-300 underline"
        >
          Cancel Standoff
        </button>
      </div>
    </div>
  );
}
