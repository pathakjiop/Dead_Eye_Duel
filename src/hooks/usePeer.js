import { useState, useEffect, useRef, useCallback } from 'react';
import * as PeerModule from 'peerjs';
import { MESSAGE_TYPES, PEER_PREFIX, GAME_RULES } from '../game/constants';

// Clean constructor resolution for PeerJS across ESM, Vite, and CJS
const Peer = PeerModule.Peer || PeerModule.default?.Peer || PeerModule.default || PeerModule;

const ROOM_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += ROOM_CHARS.charAt(Math.floor(Math.random() * ROOM_CHARS.length));
  }
  return code;
}

// Always lowercase for PeerJS ID to avoid case mismatch on public broker
export function formatPeerId(code) {
  return `${PEER_PREFIX}${String(code || '').trim().toLowerCase()}`;
}

// Streamlined 2 ICE servers (1 fast Google STUN + 1 OpenRelay TURN) to avoid discovery slowdown
const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: 'turn:openrelay.metered.ca:80',
    username: 'openrelay',
    credential: 'openrelay',
  },
];

export function usePeer({
  playerProfile,
  onOpponentConnected,
  onMessage,
  onConnectionChange,
}) {
  const [peerId, setPeerId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [peerError, setPeerError] = useState(null);

  const peerRef = useRef(null);
  const connRef = useRef(null);
  const pingSamplesRef = useRef([]);
  const handshakeIntervalRef = useRef(null);
  const joinRetryTimerRef = useRef(null);
  const joinAttemptsRef = useRef(0);

  const playerProfileRef = useRef(playerProfile);
  const onOpponentConnectedRef = useRef(onOpponentConnected);
  const onMessageRef = useRef(onMessage);
  const onConnectionChangeRef = useRef(onConnectionChange);

  useEffect(() => {
    playerProfileRef.current = playerProfile;
  }, [playerProfile]);

  useEffect(() => {
    onOpponentConnectedRef.current = onOpponentConnected;
  }, [onOpponentConnected]);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onConnectionChangeRef.current = onConnectionChange;
  }, [onConnectionChange]);

  const clearHandshake = () => {
    if (handshakeIntervalRef.current) {
      clearInterval(handshakeIntervalRef.current);
      handshakeIntervalRef.current = null;
    }
  };

  const clearRetry = () => {
    if (joinRetryTimerRef.current) {
      clearTimeout(joinRetryTimerRef.current);
      joinRetryTimerRef.current = null;
    }
    joinAttemptsRef.current = 0;
  };

  // Safe disconnect
  const disconnect = useCallback(() => {
    clearHandshake();
    clearRetry();

    if (connRef.current) {
      try {
        if (connRef.current.open && connRef.current.dataChannel?.readyState === 'open') {
          connRef.current.send({ type: MESSAGE_TYPES.LEAVE });
        }
        connRef.current.close();
      } catch {}
      connRef.current = null;
    }

    if (peerRef.current) {
      try {
        peerRef.current.destroy();
      } catch {}
      peerRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  // Safe message sending (never throws "Connection is not open")
  const sendMessage = useCallback((type, payload = {}) => {
    try {
      const conn = connRef.current;
      if (conn && conn.open && conn.dataChannel && conn.dataChannel.readyState === 'open') {
        conn.send({ type, payload, timestamp: Date.now() });
        return true;
      }
    } catch (err) {
      console.warn('Failed to send peer message safely:', err);
    }
    return false;
  }, []);

  // Ping-Pong clock sync routine (Host side)
  const runClockSync = useCallback(() => {
    pingSamplesRef.current = [];
    let samplesCollected = 0;

    const sendPing = () => {
      if (samplesCollected >= GAME_RULES.PING_SAMPLE_COUNT) {
        const offsets = pingSamplesRef.current.map((s) => s.offset).sort((a, b) => a - b);
        const rtts = pingSamplesRef.current.map((s) => s.rtt);
        const medianOffset = offsets[Math.floor(offsets.length / 2)] || 0;
        const avgRtt = Math.round(rtts.reduce((a, b) => a + b, 0) / (rtts.length || 1)) || 0;

        sendMessage('CLOCK_SYNC_RESULT', { offset: medianOffset, rtt: avgRtt });
        if (onMessageRef.current) {
          onMessageRef.current({
            type: 'CLOCK_SYNC_RESULT',
            payload: { offset: medianOffset, rtt: avgRtt },
          });
        }
        return;
      }

      const t0 = Date.now();
      sendMessage(MESSAGE_TYPES.PING, { t0 });
      samplesCollected++;
      setTimeout(sendPing, 100);
    };

    sendPing();
  }, [sendMessage]);

  // Setup connection handlers
  const setupConnection = useCallback(
    (conn, isHost) => {
      connRef.current = conn;

      conn.on('open', () => {
        clearRetry();
        setIsConnected(true);
        setIsConnecting(false);
        setPeerError(null);

        if (onConnectionChangeRef.current) {
          onConnectionChangeRef.current({ status: 'connected', isHost });
        }

        // Automated Handshake: Guest sends HELLO and retries until ACK
        if (!isHost) {
          clearHandshake();

          const sendHello = () => {
            try {
              if (conn && conn.open && conn.dataChannel && conn.dataChannel.readyState === 'open') {
                conn.send({
                  type: 'HANDSHAKE_HELLO',
                  payload: playerProfileRef.current,
                  timestamp: Date.now(),
                });
              }
            } catch (e) {
              console.warn('sendHello error:', e);
            }
          };

          // Send first handshake after 100ms when dataChannel is fully ready
          setTimeout(sendHello, 100);
          handshakeIntervalRef.current = setInterval(sendHello, 1000);
        } else {
          setTimeout(runClockSync, 400);
        }
      });

      conn.on('data', (data) => {
        if (!data || !data.type) return;

        // Automated Handshake Handling
        if (data.type === 'HANDSHAKE_HELLO') {
          try {
            if (conn && conn.open && conn.dataChannel && conn.dataChannel.readyState === 'open') {
              conn.send({
                type: 'HANDSHAKE_ACK',
                payload: playerProfileRef.current,
                timestamp: Date.now(),
              });
            }
          } catch {}
          if (onOpponentConnectedRef.current) {
            onOpponentConnectedRef.current(data.payload);
          }
          return;
        }

        if (data.type === 'HANDSHAKE_ACK') {
          clearHandshake();
          if (onOpponentConnectedRef.current) {
            onOpponentConnectedRef.current(data.payload);
          }
          return;
        }

        // Ping-Pong handling
        if (data.type === MESSAGE_TYPES.PING) {
          try {
            if (conn && conn.open && conn.dataChannel?.readyState === 'open') {
              conn.send({
                type: MESSAGE_TYPES.PONG,
                payload: { t0: data.payload.t0, t1: Date.now() },
              });
            }
          } catch {}
          return;
        }

        if (data.type === MESSAGE_TYPES.PONG) {
          const t2 = Date.now();
          const { t0, t1 } = data.payload;
          const rtt = t2 - t0;
          const offset = t1 - (t0 + rtt / 2);
          pingSamplesRef.current.push({ rtt, offset });
          return;
        }

        // Forward message to reducer
        if (onMessageRef.current) {
          onMessageRef.current(data);
        }
      });

      conn.on('close', () => {
        clearHandshake();
        setIsConnected(false);
        connRef.current = null;
        if (onConnectionChangeRef.current) {
          onConnectionChangeRef.current({ status: 'disconnected' });
        }
      });

      conn.on('error', (err) => {
        clearHandshake();
        console.warn('Peer connection error:', err);
        setPeerError(err.message || 'Connection error');
      });
    },
    [runClockSync]
  );

  // Host creates a room
  const createRoom = useCallback(
    (roomCode) => {
      disconnect();
      setIsConnecting(true);
      setPeerError(null);

      const targetPeerId = formatPeerId(roomCode);

      try {
        const PeerClass = Peer;
        const peer = new PeerClass(targetPeerId, {
          debug: 1,
          config: {
            iceServers: ICE_SERVERS,
          },
        });

        peerRef.current = peer;

        peer.on('open', (id) => {
          setPeerId(id);
          setIsConnecting(false);
        });

        peer.on('connection', (conn) => {
          setupConnection(conn, true);
        });

        // Mobile background tab keep-alive: auto-reconnect if signaling drops
        peer.on('disconnected', () => {
          console.log('Peer disconnected from signaling server, reconnecting...');
          if (peer && !peer.destroyed) {
            peer.reconnect();
          }
        });

        peer.on('error', (err) => {
          console.warn('PeerJS Host error:', err);
          setIsConnecting(false);
          setPeerError(
            err.type === 'unavailable-id'
              ? 'Room code already in use! Try creating again.'
              : err.message || 'Could not create room'
          );
        });
      } catch (err) {
        console.error('Failed to create Peer instance:', err);
        setIsConnecting(false);
        setPeerError('Failed to initialize WebRTC Peer');
      }
    },
    [disconnect, setupConnection]
  );

  // Guest joins an existing room with automatic retry
  const joinRoom = useCallback(
    (targetRoomCode) => {
      disconnect();
      setIsConnecting(true);
      setPeerError(null);

      const targetHostId = formatPeerId(targetRoomCode);

      const attemptConnect = () => {
        try {
          const PeerClass = Peer;
          const peer = new PeerClass({
            debug: 1,
            config: {
              iceServers: ICE_SERVERS,
            },
          });

          peerRef.current = peer;

          peer.on('open', (id) => {
            setPeerId(id);
            const conn = peer.connect(targetHostId, {
              reliable: true,
            });
            setupConnection(conn, false);
          });

          peer.on('error', (err) => {
            console.warn('PeerJS Guest attempt error:', err);

            // Auto-retry up to 3 times if host is still propagating on broker
            if (err.type === 'peer-unavailable' && joinAttemptsRef.current < 3) {
              joinAttemptsRef.current += 1;
              setPeerError(`Connecting to rival... (attempt ${joinAttemptsRef.current}/3)`);
              joinRetryTimerRef.current = setTimeout(attemptConnect, 1400);
            } else {
              setIsConnecting(false);
              setPeerError(
                err.type === 'peer-unavailable'
                  ? 'Room not found! Verify host has room open.'
                  : err.message || 'Could not connect to rival'
              );
            }
          });
        } catch (err) {
          console.error('Failed to join Peer instance:', err);
          setIsConnecting(false);
          setPeerError('Failed to initialize WebRTC Peer');
        }
      };

      attemptConnect();
    },
    [disconnect, setupConnection]
  );

  // Mobile visibility change: reconnect peer if disconnected while in background
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (peerRef.current && peerRef.current.disconnected && !peerRef.current.destroyed) {
          console.log('Tab returned to foreground: reconnecting peer...');
          peerRef.current.reconnect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      disconnect();
    };
  }, [disconnect]);

  return {
    peerId,
    isConnected,
    isConnecting,
    peerError,
    createRoom,
    joinRoom,
    sendMessage,
    disconnect,
  };
}
