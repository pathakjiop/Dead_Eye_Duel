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

export function formatPeerId(code) {
  return `${PEER_PREFIX}${String(code || '').trim().toUpperCase()}`;
}

export function usePeer({ onMessage, onConnectionChange }) {
  const [peerId, setPeerId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [peerError, setPeerError] = useState(null);

  const peerRef = useRef(null);
  const connRef = useRef(null);
  const pingSamplesRef = useRef([]);

  // Store latest callbacks in refs to eliminate stale closure bugs
  const onMessageRef = useRef(onMessage);
  const onConnectionChangeRef = useRef(onConnectionChange);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onConnectionChangeRef.current = onConnectionChange;
  }, [onConnectionChange]);

  // Destroy connection safely
  const disconnect = useCallback(() => {
    if (connRef.current) {
      try {
        connRef.current.send({ type: MESSAGE_TYPES.LEAVE });
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

  // Send message over WebRTC DataChannel
  const sendMessage = useCallback((type, payload = {}) => {
    if (connRef.current && connRef.current.open) {
      try {
        connRef.current.send({ type, payload, timestamp: Date.now() });
        return true;
      } catch (err) {
        console.error('Failed to send peer message:', err);
        return false;
      }
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

  // Setup data connection handlers
  const setupConnection = useCallback(
    (conn, isHost) => {
      connRef.current = conn;

      conn.on('open', () => {
        setIsConnected(true);
        setIsConnecting(false);
        setPeerError(null);
        if (onConnectionChangeRef.current) {
          onConnectionChangeRef.current({ status: 'connected', isHost });
        }
        if (isHost) {
          setTimeout(runClockSync, 400);
        }
      });

      conn.on('data', (data) => {
        if (!data || !data.type) return;

        if (data.type === MESSAGE_TYPES.PING) {
          conn.send({
            type: MESSAGE_TYPES.PONG,
            payload: { t0: data.payload.t0, t1: Date.now() },
          });
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

        // Always invoke the freshest onMessage callback
        if (onMessageRef.current) {
          onMessageRef.current(data);
        }
      });

      conn.on('close', () => {
        setIsConnected(false);
        connRef.current = null;
        if (onConnectionChangeRef.current) {
          onConnectionChangeRef.current({ status: 'disconnected' });
        }
      });

      conn.on('error', (err) => {
        console.error('Peer connection error:', err);
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
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' },
            ],
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

        peer.on('error', (err) => {
          console.error('PeerJS Host error:', err);
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

  // Guest joins an existing room
  const joinRoom = useCallback(
    (targetRoomCode) => {
      disconnect();
      setIsConnecting(true);
      setPeerError(null);

      const targetHostId = formatPeerId(targetRoomCode);

      try {
        const PeerClass = Peer;
        const peer = new PeerClass({
          debug: 1,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' },
            ],
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
          console.error('PeerJS Guest error:', err);
          setIsConnecting(false);
          setPeerError(
            err.type === 'peer-unavailable'
              ? 'Room not found! Verify the 4-letter code.'
              : err.message || 'Could not connect to rival'
          );
        });
      } catch (err) {
        console.error('Failed to join Peer instance:', err);
        setIsConnecting(false);
        setPeerError('Failed to initialize WebRTC Peer');
      }
    },
    [disconnect, setupConnection]
  );

  useEffect(() => {
    return () => {
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
