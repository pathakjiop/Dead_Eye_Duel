import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Smartphone, MousePointer, Sparkles, Flame } from 'lucide-react';
import { AVATARS } from '../game/avatars';
import CalaveraAvatar from '../components/CalaveraAvatar';
import PapelPicado from '../components/PapelPicado';

export default function HomeScreen({
  player,
  onUpdatePlayer,
  onCreateRoom,
  onJoinRoomClick,
  sound,
  tequilaMode,
  onToggleTequila,
}) {
  const [name, setName] = useState(player.name || 'El Tirador');

  const handleNameBlur = () => {
    const trimmed = name.trim() || 'El Tirador';
    setName(trimmed);
    onUpdatePlayer({ name: trimmed });
  };

  const handleAvatarSelect = (avatar) => {
    onUpdatePlayer({ avatar });
    sound.playHammerCock();
  };

  const handleSoundToggle = () => {
    sound.toggleMute();
    if (sound.muted) {
      sound.playWesternWhistle();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center px-4 py-6 max-w-md mx-auto text-center z-10">
      {/* Top Banner & Sound Toggle */}
      <div className="w-full flex flex-col items-center">
        <PapelPicado className="mb-2" />
        <div className="w-full flex justify-between items-center px-2">
          {/* Tequila Mode Button */}
          <button
            onClick={() => {
              onToggleTequila();
              sound.playCylinderSpin();
            }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wider border transition-all ${
              tequilaMode
                ? 'bg-amber-500 text-stone-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.8)] font-bold'
                : 'bg-stone-900/70 text-amber-300/80 border-amber-900/60'
            }`}
            title="Toggle Tequila Heat-Wave Mode"
          >
            <span>🌵</span>
            <span>{tequilaMode ? 'TEQUILA ON!' : 'TEQUILA'}</span>
          </button>

          {/* Sound Mute/Unmute */}
          <button
            onClick={handleSoundToggle}
            className="p-2 rounded-full bg-stone-900/80 border border-amber-700/60 text-amber-400 hover:text-amber-200 shadow-md transition-transform active:scale-95"
            title={sound.muted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {sound.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </div>

      {/* Main Title Hero */}
      <div className="flex flex-col items-center my-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="relative"
        >
          <span className="block text-xs uppercase tracking-[0.35em] text-amber-400 font-mono font-bold mb-1 drop-shadow">
            — MEXICAN STANDOFF QUICK-DRAW —
          </span>
          <h1 className="text-4xl sm:text-6xl font-rye text-desert-sand tracking-wide drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] bg-gradient-to-b from-[#fef08a] via-[#ea580c] to-[#7c2d12] bg-clip-text text-transparent">
            DEAD EYE DUEL
          </h1>
          <div className="flex items-center justify-center space-x-2 my-2">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-500" />
            <span className="text-amber-500 text-sm">💀 🔫 💀</span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-500" />
          </div>
        </motion.div>

        {/* Player Name Card */}
        <div className="w-full max-w-xs mt-3 bg-stone-950/80 p-3 rounded-lg border-2 border-amber-900/80 shadow-2xl backdrop-blur-sm">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-amber-400/90 text-left mb-1">
            Gunslinger Name
          </label>
          <input
            type="text"
            value={name}
            maxLength={16}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            placeholder="El Tirador"
            className="w-full bg-stone-900 border border-amber-700/60 rounded px-3 py-2 text-desert-sand font-rye tracking-wide focus:outline-none focus:border-amber-400 text-center text-lg"
          />

          {/* Calavera Avatar Picker */}
          <div className="mt-3">
            <span className="block text-[10px] font-mono uppercase tracking-wider text-desert-sand/70 mb-2">
              Choose Your Calavera
            </span>
            <div className="flex justify-center space-x-2 overflow-x-auto py-1">
              {AVATARS.map((av) => {
                const isSelected = player.avatar?.id === av.id;
                return (
                  <button
                    key={av.id}
                    onClick={() => handleAvatarSelect(av)}
                    className={`p-1 rounded-full transition-transform ${
                      isSelected
                        ? 'scale-110 ring-2 ring-amber-400 ring-offset-2 ring-offset-stone-950'
                        : 'opacity-65 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <CalaveraAvatar avatar={av} size="sm" showBorder={false} />
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] font-mono text-amber-300 mt-1 italic">
              "{player.avatar?.name}" — {player.avatar?.tagline}
            </div>
          </div>
        </div>
      </div>

      {/* Main Buttons */}
      <div className="w-full max-w-xs flex flex-col space-y-3 pb-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            sound.initAudio();
            sound.playHammerCock();
            onCreateRoom();
          }}
          className="w-full py-3.5 px-4 rounded bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 text-desert-bone font-rye text-lg tracking-wider border border-amber-300/40 shadow-[0_6px_20px_rgba(194,65,12,0.6)] flex items-center justify-center space-x-2"
        >
          <Flame size={20} className="text-amber-200" />
          <span>CREATE ROOM</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            sound.initAudio();
            sound.playHammerCock();
            onJoinRoomClick();
          }}
          className="w-full py-3 px-4 rounded bg-stone-900/90 hover:bg-stone-800 text-amber-400 font-rye text-base tracking-wider border border-amber-700/80 shadow-lg flex items-center justify-center space-x-2"
        >
          <span>JOIN DUEL</span>
        </motion.button>

        {/* Input Mode Indicator */}
        <div className="flex items-center justify-center space-x-2 text-[11px] font-mono text-desert-sand/70 pt-1">
          <Smartphone size={13} className="text-amber-400" />
          <span>Pocket Draw Motion or Tap to Shoot</span>
        </div>
      </div>
    </div>
  );
}

