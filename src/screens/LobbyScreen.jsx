import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, MousePointer, CheckCircle2, ShieldCheck, Flame, Sliders, AlertTriangle } from 'lucide-react';
import CalaveraAvatar from '../components/CalaveraAvatar';
import PapelPicado from '../components/PapelPicado';

export default function LobbyScreen({
  player,
  opponent,
  roomCode,
  isHost,
  clockSync,
  motionShot,
  onToggleReady,
  onStartMatch,
  onLeaveRoom,
  sound,
}) {
  const [showSensorSettings, setShowSensorSettings] = useState(false);

  const {
    permissionState,
    sensorsSupported,
    sensorValues,
    sensitivity,
    setSensitivity,
    isTapMode,
    setIsTapMode,
    requestPermission,
  } = motionShot;

  const bothReady = player.ready && opponent?.ready;

  const handleReadyClick = () => {
    sound.playHammerCock();
    onToggleReady(!player.ready);
  };

  const handleStartDuelClick = () => {
    sound.playTrumpetDraw();
    onStartMatch();
  };

  const handleEnableSensors = async () => {
    sound.playHammerCock();
    await requestPermission();
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center px-4 py-5 max-w-md mx-auto text-center z-10 overflow-y-auto">
      <PapelPicado className="mb-1" />

      {/* Header Info */}
      <div className="w-full flex items-center justify-between px-1">
        <span className="text-[11px] font-mono uppercase tracking-widest text-amber-500/80">
          ROOM: <strong className="text-amber-300 font-rye text-sm">{roomCode}</strong>
        </span>
        <div className="flex items-center space-x-1.5 text-[11px] font-mono text-desert-sand/70">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>{clockSync?.synced ? `PING: ${clockSync.rtt}ms` : 'SYNCING...'}</span>
        </div>
      </div>

      {/* Main Face-Off Card */}
      <div className="w-full my-auto flex flex-col items-center">
        <span className="text-xs font-mono uppercase tracking-[0.3em] text-amber-400 font-bold mb-2">
          — CANTINA STANDOFF —
        </span>

        {/* Rival vs Player Card */}
        <div className="w-full bg-stone-950/85 border-2 border-amber-900/80 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between">
            {/* Player 1 (You) */}
            <div className="flex-1 flex flex-col items-center">
              <div className="relative">
                <CalaveraAvatar
                  avatar={player.avatar}
                  size="lg"
                  isReady={player.ready}
                />
              </div>
              <span className="text-sm font-rye text-amber-300 mt-2 truncate max-w-[110px]">
                {player.name}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-desert-sand/60">
                (YOU {player.isHost ? '• HOST' : ''})
              </span>
              <span
                className={`mt-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${
                  player.ready
                    ? 'bg-green-950 text-green-300 border border-green-600'
                    : 'bg-stone-900 text-stone-400 border border-stone-700'
                }`}
              >
                {player.ready ? 'LISTO ✓' : 'NOT READY'}
              </span>
            </div>

            {/* VS Emblem */}
            <div className="px-2 flex flex-col items-center">
              <span className="text-2xl font-rye text-amber-500">VS</span>
              <div className="w-8 h-[1px] bg-amber-600/50 my-1" />
              <span className="text-[10px] font-mono text-desert-sand/40">BEST OF 3</span>
            </div>

            {/* Player 2 (Opponent) */}
            <div className="flex-1 flex flex-col items-center">
              {opponent ? (
                <>
                  <div className="relative">
                    <CalaveraAvatar
                      avatar={opponent.avatar}
                      size="lg"
                      isReady={opponent.ready}
                    />
                  </div>
                  <span className="text-sm font-rye text-amber-300 mt-2 truncate max-w-[110px]">
                    {opponent.name}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-desert-sand/60">
                    (RIVAL)
                  </span>
                  <span
                    className={`mt-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${
                      opponent.ready
                        ? 'bg-green-950 text-green-300 border border-green-600'
                        : 'bg-stone-900 text-stone-400 border border-stone-700'
                    }`}
                  >
                    {opponent.ready ? 'LISTO ✓' : 'WAITING...'}
                  </span>
                </>
              ) : (
                <div className="flex flex-col items-center py-4">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-800/60 flex items-center justify-center text-amber-600 text-xl font-mono">
                    ?
                  </div>
                  <span className="text-xs font-mono text-stone-500 mt-2">Connecting...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Motion Sensor Diagnostics & Permission Button */}
        <div className="w-full mt-3 bg-stone-900/80 border border-amber-900/60 rounded-lg p-3 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isTapMode ? (
                <MousePointer size={16} className="text-amber-400" />
              ) : (
                <Smartphone size={16} className="text-amber-400" />
              )}
              <span className="text-xs font-mono font-bold text-amber-300">
                {isTapMode ? 'TAP / SPACE TO SHOOT' : 'POCKET MOTION SENSORS'}
              </span>
            </div>

            <button
              onClick={() => setShowSensorSettings(!showSensorSettings)}
              className="p-1 rounded text-stone-400 hover:text-amber-300"
              title="Calibration & Settings"
            >
              <Sliders size={16} />
            </button>
          </div>

          {/* iOS permission required banner */}
          {permissionState === 'prompt' && !isTapMode && (
            <div className="mt-2.5 p-2 bg-amber-950/70 border border-amber-500/80 rounded flex items-center justify-between">
              <span className="text-[11px] font-mono text-amber-200">
                iOS requires permission for motion quick-draw:
              </span>
              <button
                onClick={handleEnableSensors}
                className="ml-2 px-2.5 py-1 rounded bg-amber-500 text-stone-950 text-xs font-mono font-bold hover:bg-amber-400 active:scale-95"
              >
                ENABLE SENSORS
              </button>
            </div>
          )}

          {/* Real-time Diagnostics Display */}
          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="bg-stone-950/60 px-2 py-1 rounded border border-stone-800">
              <span className="text-desert-sand/60">Pitch / Tilt: </span>
              <span className={`font-bold ${
                sensorValues.pitch >= 50 && sensorValues.pitch <= 130 ? 'text-green-400' : 'text-amber-300'
              }`}>
                {sensorValues.pitch}° {sensorValues.pitch >= 50 && sensorValues.pitch <= 130 ? '(AIMED)' : ''}
              </span>
            </div>
            <div className="bg-stone-950/60 px-2 py-1 rounded border border-stone-800">
              <span className="text-desert-sand/60">Accel: </span>
              <span className="font-bold text-amber-300">{sensorValues.accel} m/s²</span>
            </div>
          </div>

          {/* Expandable calibration slider & fallback toggle */}
          {showSensorSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-3 pt-2 border-t border-stone-800 space-y-2 text-xs font-mono"
            >
              <div className="flex items-center justify-between">
                <span className="text-desert-sand/80">Input Method:</span>
                <button
                  onClick={() => setIsTapMode(!isTapMode)}
                  className="px-2 py-1 rounded bg-stone-800 text-amber-300 border border-stone-700 text-[11px]"
                >
                  Switch to {isTapMode ? 'Motion Sensor' : 'Tap Screen'}
                </button>
              </div>

              {!isTapMode && (
                <div>
                  <div className="flex justify-between text-[11px] text-desert-sand/70 mb-1">
                    <span>Motion Sensitivity:</span>
                    <span className="text-amber-400">{sensitivity} m/s²</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="22"
                    step="0.5"
                    value={sensitivity}
                    onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-stone-500">
                    <span>Sensitive (Light Flick)</span>
                    <span>Stiff (Hard Pull)</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="w-full max-w-xs flex flex-col space-y-2.5 mt-3">
        {/* Toggle Ready Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleReadyClick}
          className={`w-full py-3 px-4 rounded font-rye text-base tracking-wider border shadow-md flex items-center justify-center space-x-2 transition-all ${
            player.ready
              ? 'bg-stone-800 text-amber-400 border-amber-600/70'
              : 'bg-gradient-to-r from-amber-600 to-orange-600 text-desert-bone border-amber-400/50 shadow-[0_4px_14px_rgba(234,88,12,0.5)]'
          }`}
        >
          <CheckCircle2 size={18} />
          <span>{player.ready ? 'UNREADY' : 'READY TO DRAW (LISTO)'}</span>
        </motion.button>

        {/* Start Match Button (Host Only, active when both ready) */}
        {isHost ? (
          <motion.button
            whileHover={bothReady ? { scale: 1.03 } : {}}
            whileTap={bothReady ? { scale: 0.97 } : {}}
            disabled={!bothReady}
            onClick={handleStartDuelClick}
            className={`w-full py-3.5 px-4 rounded font-rye text-lg tracking-wider border shadow-xl flex items-center justify-center space-x-2 transition-all ${
              bothReady
                ? 'bg-gradient-to-r from-red-700 via-orange-600 to-amber-600 text-yellow-100 border-amber-300 shadow-[0_0_25px_rgba(220,38,38,0.7)] animate-pulse cursor-pointer'
                : 'bg-stone-900/60 text-stone-500 border-stone-800 cursor-not-allowed'
            }`}
          >
            <Flame size={20} className={bothReady ? 'text-amber-200 animate-bounce' : 'text-stone-600'} />
            <span>START DUEL MATCH</span>
          </motion.button>
        ) : (
          <div className="text-xs font-mono text-amber-400/80 py-2">
            {bothReady ? 'Awaiting Host to fire starting shot...' : 'Waiting for both gunslingers to get ready...'}
          </div>
        )}

        {/* Leave Room Button */}
        <button
          onClick={onLeaveRoom}
          className="text-xs font-mono text-stone-400 hover:text-stone-200 pt-1"
        >
          Leave Cantina
        </button>
      </div>
    </div>
  );
}

