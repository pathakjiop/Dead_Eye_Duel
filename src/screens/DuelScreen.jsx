import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DUEL_PHASES } from '../game/constants';
import Revolver from '../components/Revolver';
import TallyScore from '../components/TallyScore';
import CalaveraAvatar from '../components/CalaveraAvatar';

export default function DuelScreen({
  duel,
  match,
  player,
  opponent,
  isHost,
  onPlayerShoot,
  onNextRound,
  sound,
  motionShot,
}) {
  const { phase, countdown, playerShot, opponentShot, roundWinner, roundNote } = duel;
  const [screenShake, setScreenShake] = useState(false);
  const [isFired, setIsFired] = useState(false);
  const [shotCount, setShotCount] = useState(0);

  const hasShotThisPhaseRef = useRef(false);

  // Reset shot lockout on new phase
  useEffect(() => {
    if (phase === DUEL_PHASES.HOLSTER || phase === DUEL_PHASES.WAIT) {
      hasShotThisPhaseRef.current = false;
    }
  }, [phase]);

  // Trigger screen shake & recoil on player shot
  useEffect(() => {
    if (playerShot) {
      setIsFired(true);
      setShotCount((c) => c + 1);
      setScreenShake(true);
      const timer = setTimeout(() => {
        setIsFired(false);
        setScreenShake(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [playerShot]);

  // Audio effects linked to phase transitions
  useEffect(() => {
    if (phase === DUEL_PHASES.HOLSTER) {
      sound.startHeartbeat(850);
    } else if (phase === DUEL_PHASES.WAIT) {
      sound.stopHeartbeat();
      sound.startWind();
    } else if (phase === DUEL_PHASES.DRAW) {
      sound.stopWind();
      sound.playHammerCock();
      sound.playTrumpetDraw();
    } else if (phase === DUEL_PHASES.RESULT) {
      sound.stopHeartbeat();
      sound.stopWind();
    }

    return () => {
      sound.stopHeartbeat();
      sound.stopWind();
    };
  }, [phase, sound]);

  // Handle direct instantaneous tap/click/pointer to fire
  const handleTriggerShot = useCallback((e) => {
    if (e && e.target && e.target.closest('button')) {
      return; // Do not fire if clicking UI buttons like Next Round
    }

    if (hasShotThisPhaseRef.current && phase === DUEL_PHASES.DRAW) {
      return; // Already shot this round
    }

    if (phase === DUEL_PHASES.WAIT || phase === DUEL_PHASES.DRAW) {
      hasShotThisPhaseRef.current = true;
      onPlayerShoot('tap');
    }
  }, [phase, onPlayerShoot]);

  return (
    <div
      onPointerDown={handleTriggerShot}
      className={`relative w-full h-full flex flex-col justify-between items-center select-none overflow-hidden touch-none transition-transform duration-75 cursor-crosshair ${
        screenShake ? 'scale-[1.03] translate-x-1.5 -translate-y-1' : ''
      }`}
    >
      {/* --- TOP SCOREBAR & ROUND INDICATOR --- */}
      <div className="w-full flex items-center justify-between px-4 pt-3 pb-2 bg-gradient-to-b from-stone-950/90 to-transparent z-20 pointer-events-none">
        {/* Player Score Tally */}
        <div className="flex items-center space-x-2">
          <CalaveraAvatar avatar={player.avatar} size="sm" showBorder={false} />
          <TallyScore
            score={match.playerScore}
            maxScore={2}
            label={player.name}
            color="#eab308"
          />
        </div>

        {/* Round Badge */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-mono text-amber-500 font-bold uppercase tracking-widest">
            ROUND {match.round}
          </span>
          <span className="text-[10px] font-mono text-desert-sand/50">BEST OF 3</span>
        </div>

        {/* Opponent Score Tally */}
        <div className="flex items-center space-x-2">
          <TallyScore
            score={match.opponentScore}
            maxScore={2}
            label={opponent?.name || 'Rival'}
            color="#ef4444"
          />
          {opponent && (
            <CalaveraAvatar avatar={opponent.avatar} size="sm" showBorder={false} />
          )}
        </div>
      </div>

      {/* --- CENTER STAGE: DYNAMIC DUEL PHASES --- */}
      <div className="flex-1 w-full flex flex-col items-center justify-center relative z-10 px-4 pointer-events-none">
        {/* === PHASE 1: HOLSTER === */}
        {phase === DUEL_PHASES.HOLSTER && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center"
          >
            <div className="p-3 rounded-full bg-stone-900/80 border-2 border-amber-600/60 mb-3 shadow-lg">
              <span className="text-3xl">📱👇</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-rye text-amber-400 drop-shadow mb-1">
              HOLSTER YOUR WEAPON
            </h2>
            <p className="text-xs font-mono text-desert-sand/80 max-w-xs mb-6 uppercase tracking-wider">
              Put phone in your pocket or hands down. Prepare to draw!
            </p>

            {/* Heartbeat Animated Countdown */}
            <motion.div
              key={countdown}
              initial={{ scale: 1.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="w-24 h-24 rounded-full bg-stone-950/90 border-4 border-amber-500 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.5)]"
            >
              <span className="text-5xl font-rye text-amber-400">
                {countdown}
              </span>
            </motion.div>
          </motion.div>
        )}

        {/* === PHASE 2: WAIT (Tense Dark Standoff & Staring Eyes) === */}
        {phase === DUEL_PHASES.WAIT && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-stone-950/95 flex flex-col items-center justify-center px-4"
          >
            <div className="w-full max-w-xs h-28 bg-stone-900 border-y-4 border-amber-800/80 shadow-2xl relative flex items-center justify-around px-4 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-80" />
              
              {/* Left Eye */}
              <motion.div
                animate={{ scaleY: [1, 1, 0.2, 1] }}
                transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}
                className="w-20 h-10 bg-amber-100 rounded-full border-2 border-stone-950 flex items-center justify-center relative overflow-hidden shadow-inner"
              >
                <div className="w-8 h-8 rounded-full bg-amber-900 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white -translate-x-1 -translate-y-1" />
                  </div>
                </div>
              </motion.div>

              <div className="z-10 text-stone-600 font-rye text-lg">VS</div>

              {/* Right Eye */}
              <motion.div
                animate={{ scaleY: [1, 1, 0.2, 1] }}
                transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.9, 0.95, 1] }}
                className="w-20 h-10 bg-amber-100 rounded-full border-2 border-stone-950 flex items-center justify-center relative overflow-hidden shadow-inner"
              >
                <div className="w-8 h-8 rounded-full bg-amber-900 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-white -translate-x-1 -translate-y-1" />
                  </div>
                </div>
              </motion.div>
            </div>

            <span className="text-amber-500/80 font-mono text-xs uppercase tracking-[0.3em] mt-6 animate-pulse">
              STEADY... WAIT FOR THE SIGNAL
            </span>
            <span className="text-red-400/70 font-mono text-[10px] mt-1 uppercase">
              (DO NOT DRAW! FALSE START = INSTANT LOSS)
            </span>
          </motion.div>
        )}

        {/* === PHASE 3: DRAW! (¡FUEGO! Trumpet & Flash) === */}
        {phase === DUEL_PHASES.DRAW && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.8, 1.15, 1], opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center text-center z-30"
          >
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="fixed inset-0 bg-red-600 mix-blend-screen pointer-events-none z-50"
            />

            <h1 className="text-6xl sm:text-7xl font-sancreek text-red-600 tracking-wider drop-shadow-[0_4px_25px_rgba(239,68,68,1)] stroke-amber-200 stroke-2 animate-bounce">
              ¡FUEGO!
            </h1>
            <span className="text-xl sm:text-2xl font-rye text-amber-300 tracking-widest mt-1 drop-shadow">
              DRAW & SHOOT!
            </span>
            <span className="text-xs font-mono text-desert-bone/90 mt-2 bg-stone-950/80 px-3 py-1 rounded-full border border-amber-600/70">
              {motionShot.isTapMode ? 'TAP ANYWHERE TO SHOOT!' : 'PULL & AIM OR TAP SCREEN!'}
            </span>
          </motion.div>
        )}

        {/* === PHASE 4: RESULT === */}
        {phase === DUEL_PHASES.RESULT && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-stone-950/90 border-2 border-amber-600/80 rounded-xl p-4 shadow-2xl flex flex-col items-center text-center z-30 backdrop-blur-md pointer-events-auto"
          >
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-desert-sand/70 mb-1">
              ROUND RESULT
            </span>

            {roundWinner === 'player' && (
              <h2 className="text-3xl font-rye text-green-400 drop-shadow-[0_2px_12px_rgba(34,197,94,0.8)]">
                ¡VICTORIA!
              </h2>
            )}

            {roundWinner === 'opponent' && (
              <h2 className="text-3xl font-rye text-red-500 drop-shadow-[0_2px_12px_rgba(239,68,68,0.8)]">
                CAÍDO EN EL POLVO
              </h2>
            )}

            {roundWinner === 'draw' && (
              <h2 className="text-3xl font-rye text-amber-400 drop-shadow">
                ¡EMPATE! (DRAW)
              </h2>
            )}

            <p className="text-xs font-mono text-amber-200/90 mt-1 max-w-xs">
              {roundNote}
            </p>

            {/* Reaction Times Comparison Box */}
            <div className="w-full bg-stone-900/90 border border-amber-900/80 rounded-lg p-3 my-3">
              <div className="text-[10px] font-mono text-desert-sand/60 uppercase tracking-widest mb-1.5">
                REACTION TIME COMPARISON
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className={`p-2 rounded border ${
                  roundWinner === 'player' ? 'bg-green-950/60 border-green-600/70' : 'bg-stone-950/60 border-stone-800'
                }`}>
                  <span className="text-[10px] font-mono uppercase text-desert-sand/70 block">
                    {player.name} (YOU)
                  </span>
                  <span className={`text-xl font-rye ${
                    playerShot?.falseStart ? 'text-red-500' : 'text-amber-300'
                  }`}>
                    {playerShot?.falseStart ? 'FALSE START' : `${playerShot?.reactionMs ?? '--'} ms`}
                  </span>
                </div>

                <div className={`p-2 rounded border ${
                  roundWinner === 'opponent' ? 'bg-green-950/60 border-green-600/70' : 'bg-stone-950/60 border-stone-800'
                }`}>
                  <span className="text-[10px] font-mono uppercase text-desert-sand/70 block">
                    {opponent?.name || 'Rival'}
                  </span>
                  <span className={`text-xl font-rye ${
                    opponentShot?.falseStart ? 'text-red-500' : 'text-amber-300'
                  }`}>
                    {opponentShot?.falseStart ? 'FALSE START' : `${opponentShot?.reactionMs ?? '--'} ms`}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Round Button (Host controlled) */}
            {isHost ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playHammerCock();
                  onNextRound();
                }}
                className="w-full py-2.5 px-4 rounded bg-gradient-to-r from-amber-600 to-red-700 text-desert-bone font-rye text-base tracking-wider border border-amber-400/50 shadow-md hover:scale-[1.02] active:scale-95 cursor-pointer mt-1"
              >
                {match.playerScore >= 2 || match.opponentScore >= 2 ? 'SEE MATCH OUTCOME' : 'NEXT ROUND →'}
              </button>
            ) : (
              <span className="text-[11px] font-mono text-amber-300/80 animate-pulse mt-1">
                Awaiting Host to call the next round...
              </span>
            )}
          </motion.div>
        )}
      </div>

      {/* --- BOTTOM SECTION: PEACEMAKER SIX-SHOOTER REVOLVER --- */}
      <div className="w-full flex flex-col items-center justify-end z-20 pb-1 pointer-events-none">
        <Revolver
          isCocked={phase === DUEL_PHASES.DRAW}
          isFired={isFired}
          shotCount={shotCount}
          className="w-full max-w-[340px]"
        />

        <div className="w-full py-1.5 bg-stone-950/80 border-t border-amber-900/60 text-center">
          <span className="text-[10px] font-mono uppercase tracking-widest text-desert-sand/60">
            {motionShot.isTapMode
              ? 'TAP SCREEN OR PRESS SPACEBAR TO SHOOT'
              : 'PULL FROM POCKET & AIM FORWARD (OR TAP)'}
          </span>
        </div>
      </div>
    </div>
  );
}
