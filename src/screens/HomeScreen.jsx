import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Smartphone, Target, Flame } from 'lucide-react';
import { AVATARS } from '../game/avatars';
import CalaveraAvatar from '../components/CalaveraAvatar';
import PapelPicado from '../components/PapelPicado';

export default function HomeScreen({
  player,
  onUpdatePlayer,
  onCreateRoom,
  onJoinRoomClick,
  onPracticeClick,
  motionShot,
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
    <div className="relative w-full h-full flex flex-col justify-between items-center px-4 py-5 max-w-md mx-auto text-center z-10 overflow-y-auto">
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
      <div className="flex flex-col items-center my-auto py-2">
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
        <div className="w-full max-w-xs mt-2 bg-stone-950/80 p-3 rounded-lg border-2 border-amber-900/80 shadow-2xl backdrop-blur-sm">
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
            className="w-full bg-stone-900 border border-amber-700/60 rounded px-3 py-1.5 text-desert-sand font-rye tracking-wide focus:outline-none focus:border-amber-400 text-center text-base"
          />

          {/* Calavera Avatar Picker */}
          <div className="mt-2.5">
            <span className="block text-[10px] font-mono uppercase tracking-wider text-desert-sand/70 mb-1.5">
              Choose Your Calavera
            </span>
            <div className="flex justify-center space-x-2 overflow-x-auto py-1">
              {AVATARS.map((av) => {
                const isSelected = player.avatar?.id === av.id;
                return (
                  <button
                    key={av.id}
                    onClick={() => handleAvatarSelect(av)}
                    className={`p-1 rounded-full transition-transform cursor-pointer ${
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
            <div className="text-[11px] font-mono text-amber-300 mt-1 italic truncate max-w-[260px] mx-auto">
              "{player.avatar?.name}" — {player.avatar?.tagline}
            </div>
          </div>
        </div>
      </div>

      {/* Main Buttons */}
      <div className="w-full max-w-xs flex flex-col space-y-2.5 pb-2">
        {/* Create Room Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            sound.initAudio();
            sound.playHammerCock();
            onCreateRoom();
          }}
          className="w-full py-3 px-4 rounded bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 text-desert-bone font-rye text-base tracking-wider border border-amber-300/40 shadow-[0_4px_16px_rgba(194,65,12,0.6)] flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Flame size={18} className="text-amber-200" />
          <span>CREATE MULTIPLAYER ROOM</span>
        </motion.button>

        {/* Join Duel Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            sound.initAudio();
            sound.playHammerCock();
            onJoinRoomClick();
          }}
          className="w-full py-2.5 px-4 rounded bg-stone-900/90 hover:bg-stone-800 text-amber-400 font-rye text-sm tracking-wider border border-amber-700/80 shadow-md flex items-center justify-center space-x-2 cursor-pointer"
        >
          <span>JOIN RIVAL ROOM</span>
        </motion.button>

        {/* Solo Practice Mode Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            sound.initAudio();
            sound.playHammerCock();
            onPracticeClick();
          }}
          className="w-full py-2.5 px-4 rounded bg-stone-950 text-amber-300/90 hover:text-amber-200 font-mono text-xs tracking-wider border border-amber-900/60 flex items-center justify-center space-x-1.5 shadow"
        >
          <Target size={14} className="text-amber-500" />
          <span>PRACTICE STANDOFF (SOLO VS BOT)</span>
        </motion.button>

        {/* Motion Sensor / Tap Mode Status */}
        <div className="flex items-center justify-center space-x-1 text-[11px] font-mono text-desert-sand/70 pt-0.5">
          <Smartphone size={13} className="text-amber-400" />
          <span>Tap anywhere to shoot (or pull phone from pocket)</span>
        </div>
      </div>
    </div>
  );
}
