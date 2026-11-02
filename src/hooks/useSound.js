import { useState, useEffect, useCallback, useMemo } from 'react';
import { soundEngine } from '../game/soundEngine';

export function useSound() {
  const [muted, setMutedState] = useState(() => {
    try {
      return localStorage.getItem('deadeye_muted') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    soundEngine.setMuted(muted);
    try {
      localStorage.setItem('deadeye_muted', String(muted));
    } catch {}
  }, [muted]);

  const toggleMute = useCallback(() => {
    setMutedState((prev) => !prev);
  }, []);

  const playGunshot = useCallback(() => soundEngine.playGunshot(), []);
  const playHammerCock = useCallback(() => soundEngine.playHammerCock(), []);
  const playCylinderSpin = useCallback(() => soundEngine.playCylinderSpin(), []);
  const playHeartbeat = useCallback(() => soundEngine.playSingleHeartbeat(), []);
  const startHeartbeat = useCallback((bpm) => soundEngine.startHeartbeat(bpm), []);
  const stopHeartbeat = useCallback(() => soundEngine.stopHeartbeat(), []);
  const playTrumpetDraw = useCallback(() => soundEngine.playTrumpetDraw(), []);
  const playMariachiWin = useCallback(() => soundEngine.playMariachiWin(), []);
  const playWesternWhistle = useCallback(() => soundEngine.playWesternWhistle(), []);
  const playRicochet = useCallback(() => soundEngine.playRicochet(), []);
  const playFalseStart = useCallback(() => soundEngine.playFalseStart(), []);
  const startWind = useCallback(() => soundEngine.startDesertWind(), []);
  const stopWind = useCallback(() => soundEngine.stopWind(), []);
  const vibrate = useCallback((pattern) => soundEngine.vibrate(pattern), []);
  const initAudio = useCallback(() => soundEngine.init(), []);

  return useMemo(() => ({
    muted,
    toggleMute,
    initAudio,
    playGunshot,
    playHammerCock,
    playCylinderSpin,
    playHeartbeat,
    startHeartbeat,
    stopHeartbeat,
    playTrumpetDraw,
    playMariachiWin,
    playWesternWhistle,
    playRicochet,
    playFalseStart,
    startWind,
    stopWind,
    startDesertWind: startWind,
    stopDesertWind: stopWind,
    vibrate,
  }), [
    muted,
    toggleMute,
    initAudio,
    playGunshot,
    playHammerCock,
    playCylinderSpin,
    playHeartbeat,
    startHeartbeat,
    stopHeartbeat,
    playTrumpetDraw,
    playMariachiWin,
    playWesternWhistle,
    playRicochet,
    playFalseStart,
    startWind,
    stopWind,
    vibrate,
  ]);
}
