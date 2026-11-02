import React, { useReducer, useEffect, useCallback, useRef } from 'react';
import { gameReducer, initialState } from './game/reducer';
import {
  SCREENS,
  DUEL_PHASES,
  MESSAGE_TYPES,
  GAME_RULES,
} from './game/constants';
import { useSound } from './hooks/useSound';
import { usePeer, generateRoomCode } from './hooks/usePeer';
import { useMotionShot } from './hooks/useMotionShot';

import DesertBackground from './components/DesertBackground';
import GrainOverlay from './components/GrainOverlay';
import { ErrorBoundary } from './components/ErrorBoundary';
import HomeScreen from './screens/HomeScreen';
import CreateRoomScreen from './screens/CreateRoomScreen';
import JoinRoomScreen from './screens/JoinRoomScreen';
import LobbyScreen from './screens/LobbyScreen';
import DuelScreen from './screens/DuelScreen';
import MatchEndScreen from './screens/MatchEndScreen';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const sound = useSound();

  const holsterTimerRef = useRef(null);
  const waitTimerRef = useRef(null);
  const slowDrawTimerRef = useRef(null);
  const localDrawTimeRef = useRef(null);
  const falseStartOccurredRef = useRef(false);

  // Concrete ref storage for shots to eliminate stale closures
  const playerShotRef = useRef(null);
  const opponentShotRef = useRef(null);
  const roundResolvedRef = useRef(false);

  // Authoritative Host Round Evaluation
  const evaluateRoundHost = useCallback((forceResolve = false) => {
    if (roundResolvedRef.current) return;

    const pShot = playerShotRef.current;
    const oShot = opponentShotRef.current;

    // If neither has fired and not timeout, wait
    if (!pShot && !oShot && !forceResolve) return;

    let winner = null;
    let note = '';

    // Check false starts first
    if (pShot?.falseStart && oShot?.falseStart) {
      winner = 'draw';
      note = 'Both gunslingers drew before the signal!';
    } else if (pShot?.falseStart) {
      winner = 'opponent';
      note = `${state.player.name} drew early! False start forfeit.`;
    } else if (oShot?.falseStart) {
      winner = 'player';
      note = `${state.opponent?.name || 'Rival'} drew early! False start forfeit.`;
    } else if (pShot && oShot) {
      const diff = Math.abs(pShot.reactionMs - oShot.reactionMs);
      if (diff <= GAME_RULES.DRAW_TIE_THRESHOLD_MS) {
        winner = 'draw';
        note = `Simultaneous shots within ${diff}ms! Standoff replay.`;
      } else if (pShot.reactionMs < oShot.reactionMs) {
        winner = 'player';
        note = `${state.player.name} drew faster by ${diff}ms!`;
      } else {
        winner = 'opponent';
        note = `${state.opponent?.name || 'Rival'} drew faster by ${diff}ms!`;
      }
    } else if (forceResolve) {
      // Timeout: one player fired while the other didn't draw in time
      if (pShot && !oShot) {
        winner = 'player';
        note = `${state.player.name} shot while rival was caught sleeping!`;
      } else if (oShot && !pShot) {
        winner = 'opponent';
        note = `${state.opponent?.name || 'Rival'} shot while you were caught sleeping!`;
      } else {
        winner = 'draw';
        note = 'Neither gunslinger took a shot!';
      }
    } else {
      // One has shot; give the other up to 2.5 seconds before auto-resolving
      if (!slowDrawTimerRef.current) {
        slowDrawTimerRef.current = setTimeout(() => {
          evaluateRoundHost(true);
        }, 2500);
      }
      return;
    }

    roundResolvedRef.current = true;
    if (slowDrawTimerRef.current) {
      clearTimeout(slowDrawTimerRef.current);
      slowDrawTimerRef.current = null;
    }

    const resultPayload = {
      winner,
      note,
      playerReaction: pShot?.reactionMs,
      opponentReaction: oShot?.reactionMs,
    };

    // Update Host state (points incremented in reducer)
    dispatch({ type: 'FINALIZE_ROUND_RESULT', payload: resultPayload });

    // Broadcast result to Guest (swapping perspective)
    peer.sendMessage(MESSAGE_TYPES.ROUND_RESULT, {
      winner: winner === 'player' ? 'opponent' : winner === 'opponent' ? 'player' : 'draw',
      note,
      playerReaction: oShot?.reactionMs,
      opponentReaction: pShot?.reactionMs,
    });

    const randomHole = {
      id: Date.now(),
      x: Math.floor(Math.random() * 60) + 20,
      y: Math.floor(Math.random() * 50) + 25,
      angle: Math.floor(Math.random() * 360),
    };
    dispatch({ type: 'ADD_BULLET_HOLE', payload: randomHole });
  }, [state.player.name, state.opponent]);

  // --- PEER MESSAGE HANDLER ---
  const handlePeerMessage = useCallback((msg) => {
    if (!msg || !msg.type) return;

    switch (msg.type) {
      case MESSAGE_TYPES.HELLO: {
        dispatch({ type: 'SET_OPPONENT', payload: msg.payload });
        sound.playHammerCock();
        peer.sendMessage(MESSAGE_TYPES.HELLO_ACK, state.player);
        break;
      }

      case MESSAGE_TYPES.HELLO_ACK: {
        dispatch({ type: 'SET_OPPONENT', payload: msg.payload });
        sound.playHammerCock();
        break;
      }

      case MESSAGE_TYPES.READY: {
        dispatch({ type: 'UPDATE_OPPONENT_READY', payload: msg.payload.ready });
        sound.playHammerCock();
        break;
      }

      case 'CLOCK_SYNC_RESULT': {
        dispatch({ type: 'SET_CLOCK_SYNC', payload: msg.payload });
        break;
      }

      case MESSAGE_TYPES.ROUND_START: {
        const { hostDrawAt, holsterDuration = 3000 } = msg.payload;
        startRoundSequence(hostDrawAt, holsterDuration);
        break;
      }

      case MESSAGE_TYPES.SHOT: {
        const oppShot = msg.payload; // { reactionMs, shotTime }
        opponentShotRef.current = oppShot;
        dispatch({ type: 'REGISTER_OPPONENT_SHOT', payload: oppShot });

        if (state.player.isHost) {
          evaluateRoundHost(false);
        }
        break;
      }

      case MESSAGE_TYPES.FALSE_START: {
        const oppShot = { falseStart: true, reactionMs: null };
        opponentShotRef.current = oppShot;
        dispatch({ type: 'REGISTER_OPPONENT_SHOT', payload: oppShot });
        sound.playFalseStart();

        if (state.player.isHost) {
          evaluateRoundHost(false);
        }
        break;
      }

      case MESSAGE_TYPES.ROUND_RESULT: {
        // Non-host applies official result sent by host
        dispatch({ type: 'FINALIZE_ROUND_RESULT', payload: msg.payload });

        const randomHole = {
          id: Date.now(),
          x: Math.floor(Math.random() * 60) + 20,
          y: Math.floor(Math.random() * 50) + 25,
          angle: Math.floor(Math.random() * 360),
        };
        dispatch({ type: 'ADD_BULLET_HOLE', payload: randomHole });
        break;
      }

      case 'GOTO_MATCH_END': {
        dispatch({ type: 'NEXT_ROUND_OR_FINISH' });
        break;
      }

      case MESSAGE_TYPES.REMATCH: {
        dispatch({ type: 'RESTART_MATCH' });
        sound.playHammerCock();
        break;
      }

      case MESSAGE_TYPES.LEAVE: {
        alert('Your rival fled like a coward into the desert dust!');
        dispatch({ type: 'RESET_TO_HOME' });
        break;
      }

      default:
        break;
    }
  }, [state.player, sound, evaluateRoundHost]);

  // Peer Connection status change
  const handleConnectionChange = useCallback(({ status, isHost }) => {
    if (status === 'connected') {
      dispatch({ type: 'PEER_CONNECTED' });
      if (!isHost) {
        setTimeout(() => {
          peer.sendMessage(MESSAGE_TYPES.HELLO, state.player);
        }, 300);
      }
    } else if (status === 'disconnected') {
      dispatch({ type: 'CONNECTION_ERROR', payload: 'Peer disconnected' });
    }
  }, [state.player]);

  const peer = usePeer({
    onMessage: handlePeerMessage,
    onConnectionChange: handleConnectionChange,
  });

  // Handle local shot from motion or tap
  const handleLocalShoot = useCallback((source = 'tap') => {
    const now = performance.now();
    const currentPhase = state.duel.phase;

    // Shot during WAIT = False start
    if (currentPhase === DUEL_PHASES.WAIT) {
      falseStartOccurredRef.current = true;
      const falseShot = { falseStart: true, reactionMs: null, timestamp: now };
      playerShotRef.current = falseShot;
      dispatch({ type: 'REGISTER_PLAYER_SHOT', payload: falseShot });
      sound.playGunshot();
      sound.playFalseStart();

      peer.sendMessage(MESSAGE_TYPES.FALSE_START, { source });

      if (state.player.isHost) {
        evaluateRoundHost(false);
      }
      return;
    }

    // Shot during DRAW = Valid shot
    if (currentPhase === DUEL_PHASES.DRAW && !playerShotRef.current) {
      const drawTime = localDrawTimeRef.current || now;
      const reactionMs = Math.max(1, Math.round(now - drawTime));
      const validShot = { reactionMs, falseStart: false, timestamp: now };

      playerShotRef.current = validShot;
      dispatch({ type: 'REGISTER_PLAYER_SHOT', payload: validShot });
      sound.playGunshot();

      peer.sendMessage(MESSAGE_TYPES.SHOT, validShot);

      if (state.player.isHost) {
        evaluateRoundHost(false);
      }
    }
  }, [state.duel.phase, state.player.isHost, sound, peer, evaluateRoundHost]);

  // Motion shot hook
  const motionShot = useMotionShot({
    enabled: state.screen === SCREENS.DUEL || state.screen === SCREENS.LOBBY,
    onShoot: ({ source }) => handleLocalShoot(source),
  });

  // Start round sequence for both Host and Guest
  const startRoundSequence = useCallback((hostDrawAt, holsterDuration = 3000) => {
    if (holsterTimerRef.current) clearInterval(holsterTimerRef.current);
    if (waitTimerRef.current) clearTimeout(waitTimerRef.current);
    if (slowDrawTimerRef.current) clearTimeout(slowDrawTimerRef.current);

    falseStartOccurredRef.current = false;
    playerShotRef.current = null;
    opponentShotRef.current = null;
    roundResolvedRef.current = false;

    const offset = state.clockSync.offset || 0;
    const localEstimatedDrawAt = hostDrawAt - offset;

    dispatch({
      type: 'START_DUEL_ROUND',
      payload: { drawScheduledAt: localEstimatedDrawAt },
    });

    let currentCountdown = 3;
    dispatch({ type: 'SET_DUEL_COUNTDOWN', payload: 3 });

    holsterTimerRef.current = setInterval(() => {
      currentCountdown -= 1;
      if (currentCountdown > 0) {
        dispatch({ type: 'SET_DUEL_COUNTDOWN', payload: currentCountdown });
      } else {
        clearInterval(holsterTimerRef.current);
        dispatch({
          type: 'SET_DUEL_PHASE',
          payload: { phase: DUEL_PHASES.WAIT, drawScheduledAt: localEstimatedDrawAt },
        });

        const nowWallClock = Date.now();
        const waitDelayRemaining = Math.max(200, localEstimatedDrawAt - nowWallClock);

        waitTimerRef.current = setTimeout(() => {
          if (!falseStartOccurredRef.current) {
            localDrawTimeRef.current = performance.now();
            dispatch({
              type: 'SET_DUEL_PHASE',
              payload: { phase: DUEL_PHASES.DRAW },
            });
          }
        }, waitDelayRemaining);
      }
    }, 1000);
  }, [state.clockSync.offset]);

  // Host starts duel round
  const hostInitiateRound = useCallback(() => {
    const holsterDuration = 3000;
    const waitDelay =
      Math.floor(Math.random() * (GAME_RULES.MAX_WAIT_DELAY_MS - GAME_RULES.MIN_WAIT_DELAY_MS)) +
      GAME_RULES.MIN_WAIT_DELAY_MS;

    const hostNow = Date.now();
    const hostDrawAt = hostNow + holsterDuration + waitDelay;

    peer.sendMessage(MESSAGE_TYPES.ROUND_START, {
      hostDrawAt,
      holsterDuration,
      waitDelay,
    });

    startRoundSequence(hostDrawAt, holsterDuration);
  }, [peer, startRoundSequence]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (holsterTimerRef.current) clearInterval(holsterTimerRef.current);
      if (waitTimerRef.current) clearTimeout(waitTimerRef.current);
      if (slowDrawTimerRef.current) clearTimeout(slowDrawTimerRef.current);
    };
  }, []);

  // Handle URL invite room parameter: `/?room=X7K2`
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam && roomParam.length >= 4) {
        dispatch({
          type: 'JOIN_ROOM_START',
          payload: { code: roomParam.toUpperCase().slice(0, 4) },
        });
      }
    }
  }, []);

  // Action dispatchers
  const handleCreateRoom = () => {
    const code = generateRoomCode();
    peer.createRoom(code);
    dispatch({ type: 'INIT_ROOM_AS_HOST', payload: { code, peerId: peer.peerId } });
  };

  const handleJoinRoom = (targetCode) => {
    peer.joinRoom(targetCode);
  };

  const handleToggleReady = (readyVal) => {
    dispatch({ type: 'SET_PLAYER_READY', payload: readyVal });
    peer.sendMessage(MESSAGE_TYPES.READY, { ready: readyVal });
  };

  const handleRematch = () => {
    dispatch({ type: 'RESTART_MATCH' });
    peer.sendMessage(MESSAGE_TYPES.REMATCH);
  };

  const handleLeaveRoom = () => {
    peer.disconnect();
    dispatch({ type: 'RESET_TO_HOME' });
  };

  return (
    <main className="relative w-full h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col bg-desert-dark text-desert-sand font-mono select-none">
      {/* 1. Procedural Desert Background with Saguaros & Adobe Wall */}
      <DesertBackground bulletHoles={state.bulletHoles} />

      {/* 2. Vintage 35mm Film Grain + Vignette + Tequila Heatwave Filter */}
      <GrainOverlay tequilaMode={state.tequilaMode} />

      {/* 3. Screen Views Switcher wrapped in ErrorBoundary */}
      <ErrorBoundary>
        {state.screen === SCREENS.HOME && (
          <HomeScreen
            player={state.player}
            onUpdatePlayer={(p) => dispatch({ type: 'UPDATE_PLAYER_PROFILE', payload: p })}
            onCreateRoom={handleCreateRoom}
            onJoinRoomClick={() => dispatch({ type: 'SET_SCREEN', payload: SCREENS.JOIN })}
            sound={sound}
            tequilaMode={state.tequilaMode}
            onToggleTequila={() => dispatch({ type: 'TOGGLE_TEQUILA_MODE' })}
          />
        )}

        {state.screen === SCREENS.CREATE && (
          <CreateRoomScreen
            roomCode={state.roomCode}
            player={state.player}
            peerError={peer.peerError}
            onCancel={handleLeaveRoom}
            sound={sound}
          />
        )}

        {state.screen === SCREENS.JOIN && (
          <JoinRoomScreen
            initialCode={state.roomCode}
            player={state.player}
            peerError={peer.peerError}
            isConnecting={peer.isConnecting}
            onJoin={handleJoinRoom}
            onCancel={() => dispatch({ type: 'SET_SCREEN', payload: SCREENS.HOME })}
            sound={sound}
          />
        )}

        {state.screen === SCREENS.LOBBY && (
          <LobbyScreen
            player={state.player}
            opponent={state.opponent}
            roomCode={state.roomCode}
            isHost={state.player.isHost}
            clockSync={state.clockSync}
            motionShot={motionShot}
            onToggleReady={handleToggleReady}
            onStartMatch={hostInitiateRound}
            onLeaveRoom={handleLeaveRoom}
            sound={sound}
          />
        )}

        {state.screen === SCREENS.DUEL && (
          <DuelScreen
            duel={state.duel}
            match={state.match}
            player={state.player}
            opponent={state.opponent}
            isHost={state.player.isHost}
            onPlayerShoot={handleLocalShoot}
            onNextRound={() => {
              if (state.match.playerScore >= 2 || state.match.opponentScore >= 2) {
                dispatch({ type: 'NEXT_ROUND_OR_FINISH' });
                peer.sendMessage('GOTO_MATCH_END');
              } else {
                dispatch({ type: 'NEXT_ROUND_OR_FINISH' });
                if (state.player.isHost) {
                  setTimeout(hostInitiateRound, 600);
                }
              }
            }}
            sound={sound}
            motionShot={motionShot}
          />
        )}

        {state.screen === SCREENS.MATCH_END && (
          <MatchEndScreen
            match={state.match}
            player={state.player}
            opponent={state.opponent}
            onRematch={handleRematch}
            onLeaveRoom={handleLeaveRoom}
            sound={sound}
          />
        )}
      </ErrorBoundary>
    </main>
  );
}
