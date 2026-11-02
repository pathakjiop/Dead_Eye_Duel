import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, ArrowLeft, Skull } from 'lucide-react';
import CalaveraAvatar from '../components/CalaveraAvatar';
import PapelPicado from '../components/PapelPicado';
import TallyScore from '../components/TallyScore';

export default function MatchEndScreen({
  match,
  player,
  opponent,
  onRematch,
  onLeaveRoom,
  sound,
}) {
  const isWinner = match.winner === 'player';

  useEffect(() => {
    if (isWinner) {
      sound.playMariachiWin();
      // Burst celebratory western confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#eab308', '#ea580c', '#dc2626', '#facc15', '#faf8f5'],
        });
      } catch {}
    } else {
      sound.playRicochet();
    }
  }, [isWinner, sound]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center px-4 py-5 max-w-md mx-auto text-center z-10 overflow-y-auto">
      <PapelPicado className="mb-1" />

      {/* Main Title Section */}
      <div className="w-full flex flex-col items-center my-auto">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="flex flex-col items-center"
        >
          {isWinner ? (
            <div className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-amber-500/20 border-2 border-amber-400 mb-2 shadow-[0_0_25px_rgba(245,158,11,0.6)]">
                <Trophy size={42} className="text-amber-400 animate-bounce" />
              </div>
              <span className="text-xs font-mono uppercase tracking-[0.35em] text-amber-300 font-bold mb-1">
                — CHAMPION OF THE DESERT —
              </span>
              <h1 className="text-4xl sm:text-5xl font-rye text-amber-400 drop-shadow-[0_4px_16px_rgba(245,158,11,0.9)] bg-gradient-to-b from-[#fef08a] via-[#f59e0b] to-[#b45309] bg-clip-text text-transparent">
                EL PISTOLERO
              </h1>
              <span className="text-sm font-mono text-desert-sand/90 mt-1">
                {player.name} rules the frontier!
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="p-3 rounded-full bg-red-950/40 border-2 border-red-700 mb-2 shadow-lg">
                <Skull size={42} className="text-red-500" />
              </div>
              <span className="text-xs font-mono uppercase tracking-[0.35em] text-red-400 font-bold mb-1">
                — DEFEATED IN THE DUST —
              </span>
              <h1 className="text-3xl sm:text-4xl font-rye text-stone-300 drop-shadow">
                CAÍDO EN EL POLVO
              </h1>
              <span className="text-sm font-mono text-desert-sand/70 mt-1">
                {opponent?.name || 'Rival'} was faster on the trigger.
              </span>
            </div>
          )}
        </motion.div>

        {/* Avatars & Final Scoreboard Card */}
        <div className="w-full bg-stone-950/85 border-2 border-amber-900/80 rounded-xl p-4 mt-4 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-around mb-3">
            <div className="flex flex-col items-center">
              <CalaveraAvatar avatar={player.avatar} size="md" />
              <span className="text-xs font-rye text-amber-300 mt-1">{player.name}</span>
              <TallyScore score={match.playerScore} maxScore={2} label="" />
            </div>

            <div className="text-2xl font-rye text-amber-500">
              {match.playerScore} - {match.opponentScore}
            </div>

            <div className="flex flex-col items-center">
              {opponent && <CalaveraAvatar avatar={opponent.avatar} size="md" />}
              <span className="text-xs font-rye text-amber-300 mt-1">{opponent?.name || 'Rival'}</span>
              <TallyScore score={match.opponentScore} maxScore={2} label="" color="#ef4444" />
            </div>
          </div>

          {/* Round History Log */}
          <div className="border-t border-stone-800 pt-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-desert-sand/60 block mb-2 text-left">
              STANDOFF ROUND LOG
            </span>
            <div className="space-y-1.5">
              {match.history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-[11px] font-mono bg-stone-900/70 px-2.5 py-1 rounded border border-stone-800"
                >
                  <span className="text-amber-400 font-bold">Round {h.round}:</span>
                  <span className="text-desert-sand/80 truncate max-w-[130px]">{h.note}</span>
                  <span className={h.winner === 'player' ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                    {h.winner === 'player' ? 'YOU WON' : h.winner === 'opponent' ? 'LOST' : 'DRAW'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-xs flex flex-col space-y-2.5 mt-4 pb-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            sound.playHammerCock();
            onRematch();
          }}
          className="w-full py-3.5 px-4 rounded bg-gradient-to-r from-amber-600 to-red-700 text-desert-bone font-rye text-lg tracking-wider border border-amber-300/40 shadow-xl flex items-center justify-center space-x-2 cursor-pointer"
        >
          <RotateCcw size={18} />
          <span>REMATCH (OTRA VEZ)</span>
        </motion.button>

        <button
          onClick={onLeaveRoom}
          className="w-full py-2.5 px-4 rounded bg-stone-900 text-amber-400 font-mono text-xs tracking-wider border border-amber-900/60 flex items-center justify-center space-x-1.5 hover:bg-stone-800 active:scale-95"
        >
          <ArrowLeft size={14} />
          <span>RETURN TO CANTINA</span>
        </button>
      </div>
    </div>
  );
}

