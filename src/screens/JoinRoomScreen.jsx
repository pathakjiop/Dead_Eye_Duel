import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Crosshair, Loader2 } from 'lucide-react';
import CalaveraAvatar from '../components/CalaveraAvatar';
import PapelPicado from '../components/PapelPicado';

export default function JoinRoomScreen({
  initialCode = '',
  player,
  peerError,
  isConnecting,
  onJoin,
  onCancel,
  sound,
}) {
  const [code, setCode] = useState(initialCode.toUpperCase().slice(0, 4));

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode.toUpperCase().slice(0, 4));
    }
  }, [initialCode]);

  const handleInputChange = (e) => {
    const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    setCode(clean);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (code.length === 4) {
      sound.playHammerCock();
      onJoin(code);
    }
  };

  const handleKeypadPress = (char) => {
    if (code.length < 4) {
      sound.playHammerCock();
      setCode((prev) => (prev + char).slice(0, 4));
    }
  };

  const handleBackspace = () => {
    sound.playHammerCock();
    setCode((prev) => prev.slice(0, -1));
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center px-4 py-6 max-w-md mx-auto text-center z-10">
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
          JOIN STANDOFF
        </span>
        <div className="w-14" />
      </div>

      {/* Code Input Section */}
      <div className="flex flex-col items-center my-auto w-full">
        <CalaveraAvatar avatar={player.avatar} size="md" className="mb-2" />
        <span className="text-xs font-mono uppercase tracking-widest text-desert-sand/70 mb-1">
          ENTER 4-DIGIT ROOM CODE
        </span>

        {/* 4-Slot Character Display */}
        <div className="flex space-x-3 my-3">
          {[0, 1, 2, 3].map((index) => {
            const char = code[index] || '';
            const isActive = code.length === index;
            return (
              <div
                key={index}
                className={`w-14 h-16 rounded-lg bg-stone-950/90 border-2 flex items-center justify-center text-3xl font-rye transition-all ${
                  isActive
                    ? 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] text-amber-300'
                    : char
                    ? 'border-amber-700 text-amber-400'
                    : 'border-stone-800 text-stone-600'
                }`}
              >
                {char || '•'}
              </div>
            );
          })}
        </div>

        {/* Hidden or real input for hardware keyboard support */}
        <input
          type="text"
          value={code}
          onChange={handleInputChange}
          maxLength={4}
          autoFocus
          className="w-48 bg-transparent border-b border-amber-600/50 text-center font-mono text-sm tracking-widest text-amber-300 focus:outline-none mb-3"
          placeholder="TYPE CODE HERE"
        />

        {/* Peer error alert */}
        {peerError && (
          <div className="mt-2 p-2 bg-red-950/80 border border-red-500 text-red-200 text-xs font-mono rounded max-w-xs">
            {peerError}
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={code.length !== 4 || isConnecting}
          onClick={handleSubmit}
          className={`w-full max-w-xs mt-4 py-3.5 px-4 rounded font-rye text-lg tracking-wider border shadow-lg flex items-center justify-center space-x-2 transition-all ${
            code.length === 4 && !isConnecting
              ? 'bg-gradient-to-r from-amber-600 to-red-700 text-desert-bone border-amber-300/40 shadow-[0_4px_16px_rgba(194,65,12,0.6)] cursor-pointer'
              : 'bg-stone-900/60 text-stone-500 border-stone-800 cursor-not-allowed'
          }`}
        >
          {isConnecting ? (
            <>
              <Loader2 size={20} className="animate-spin text-amber-400" />
              <span>CALLING RIVAL...</span>
            </>
          ) : (
            <>
              <Crosshair size={20} className="text-amber-300" />
              <span>STEP INTO CANTINA</span>
            </>
          )}
        </motion.button>
      </div>

      <div className="pb-2">
        <span className="text-[11px] font-mono text-desert-sand/50">
          Ask the host for their 4-character duel room code
        </span>
      </div>
    </div>
  );
}

