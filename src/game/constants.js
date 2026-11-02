export const SCREENS = {
  HOME: 'HOME',
  CREATE: 'CREATE',
  JOIN: 'JOIN',
  LOBBY: 'LOBBY',
  DUEL: 'DUEL',
  MATCH_END: 'MATCH_END',
};

export const DUEL_PHASES = {
  HOLSTER: 'HOLSTER',   // Countdown 3, 2, 1 with heartbeat
  WAIT: 'WAIT',         // Dark screen, staring eyes, random 2-6s
  DRAW: 'DRAW',         // ¡FUEGO! Trumpet blast
  RESULT: 'RESULT',     // Round outcome, reaction ms comparison
};

export const MESSAGE_TYPES = {
  HELLO: 'HELLO',
  HELLO_ACK: 'HELLO_ACK',
  READY: 'READY',
  PING: 'PING',
  PONG: 'PONG',
  ROUND_START: 'ROUND_START',
  SHOT: 'SHOT',
  FALSE_START: 'FALSE_START',
  ROUND_RESULT: 'ROUND_RESULT',
  REMATCH: 'REMATCH',
  LEAVE: 'LEAVE',
};

export const GAME_RULES = {
  MATCH_WIN_SCORE: 2, // Best of 3 (first to 2 rounds)
  DRAW_TIE_THRESHOLD_MS: 15, // Within 15ms considered a simultaneous draw
  MIN_WAIT_DELAY_MS: 2200,
  MAX_WAIT_DELAY_MS: 5800,
  PING_SAMPLE_COUNT: 5,
};

export const SENSOR_DEFAULTS = {
  ACCEL_THRESHOLD: 13.5, // Acceleration threshold in m/s^2
  PITCH_MIN: 45,         // Lower pitch boundary (degrees)
  PITCH_MAX: 135,        // Upper pitch boundary (degrees)
};

export const PEER_PREFIX = 'deadeye-';

