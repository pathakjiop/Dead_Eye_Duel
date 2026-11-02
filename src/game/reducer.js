import { SCREENS, DUEL_PHASES, GAME_RULES } from './constants';
import { AVATARS } from './avatars';

export const initialState = {
  screen: SCREENS.HOME,
  player: {
    id: '',
    name: 'El Tirador',
    avatar: AVATARS[0],
    isHost: false,
    ready: false,
    tapMode: false,
  },
  opponent: null, // { id, name, avatar, ready, tapMode }
  roomCode: '',
  peerConnected: false,
  connectionError: null,

  // Clock synchronization
  clockSync: {
    offset: 0,
    rtt: 0,
    synced: false,
  },

  // Match State (Best of 3)
  match: {
    round: 1,
    playerScore: 0,
    opponentScore: 0,
    winner: null, // 'player' | 'opponent'
    history: [],
  },

  // Current Duel Round State
  duel: {
    phase: DUEL_PHASES.HOLSTER,
    countdown: 3,
    drawScheduledAt: null,
    playerShot: null,   // { reactionMs, falseStart, timestamp }
    opponentShot: null, // { reactionMs, falseStart, timestamp }
    roundWinner: null,  // 'player' | 'opponent' | 'draw'
    roundNote: '',
  },

  // Visual effects
  bulletHoles: [],
  tequilaMode: false,
};

export function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.payload };

    case 'UPDATE_PLAYER_PROFILE':
      return {
        ...state,
        player: { ...state.player, ...action.payload },
      };

    case 'INIT_ROOM_AS_HOST':
      return {
        ...state,
        screen: SCREENS.CREATE,
        roomCode: action.payload.code,
        player: {
          ...state.player,
          id: action.payload.peerId,
          isHost: true,
          ready: false,
        },
        opponent: null,
      };

    case 'JOIN_ROOM_START':
      return {
        ...state,
        screen: SCREENS.JOIN,
        roomCode: action.payload?.code || state.roomCode,
        player: {
          ...state.player,
          isHost: false,
          ready: false,
        },
      };

    case 'PEER_CONNECTED':
      return {
        ...state,
        peerConnected: true,
        connectionError: null,
      };

    case 'SET_OPPONENT':
      return {
        ...state,
        screen: SCREENS.LOBBY,
        opponent: action.payload,
      };

    case 'UPDATE_OPPONENT_READY':
      return {
        ...state,
        opponent: state.opponent ? { ...state.opponent, ready: action.payload } : null,
      };

    case 'SET_PLAYER_READY':
      return {
        ...state,
        player: { ...state.player, ready: action.payload },
      };

    case 'SET_CLOCK_SYNC':
      return {
        ...state,
        clockSync: {
          offset: action.payload.offset,
          rtt: action.payload.rtt,
          synced: true,
        },
      };

    case 'START_DUEL_ROUND':
      return {
        ...state,
        screen: SCREENS.DUEL,
        duel: {
          phase: DUEL_PHASES.HOLSTER,
          countdown: 3,
          drawScheduledAt: action.payload?.drawScheduledAt || null,
          playerShot: null,
          opponentShot: null,
          roundWinner: null,
          roundNote: '',
        },
      };

    case 'SET_DUEL_COUNTDOWN':
      return {
        ...state,
        duel: {
          ...state.duel,
          countdown: action.payload,
        },
      };

    case 'SET_DUEL_PHASE':
      return {
        ...state,
        duel: {
          ...state.duel,
          phase: action.payload.phase,
          drawScheduledAt: action.payload.drawScheduledAt !== undefined 
            ? action.payload.drawScheduledAt 
            : state.duel.drawScheduledAt,
        },
      };

    case 'REGISTER_PLAYER_SHOT':
      return {
        ...state,
        duel: {
          ...state.duel,
          playerShot: action.payload,
        },
      };

    case 'REGISTER_OPPONENT_SHOT':
      return {
        ...state,
        duel: {
          ...state.duel,
          opponentShot: action.payload,
        },
      };

    case 'FINALIZE_ROUND_RESULT': {
      const { winner, note, playerReaction, opponentReaction } = action.payload;
      let newPlayerScore = state.match.playerScore;
      let newOpponentScore = state.match.opponentScore;

      if (winner === 'player') newPlayerScore += 1;
      if (winner === 'opponent') newOpponentScore += 1;

      const isMatchOver =
        newPlayerScore >= GAME_RULES.MATCH_WIN_SCORE ||
        newOpponentScore >= GAME_RULES.MATCH_WIN_SCORE;

      const matchWinner = isMatchOver
        ? newPlayerScore > newOpponentScore
          ? 'player'
          : 'opponent'
        : null;

      const historyItem = {
        round: state.match.round,
        winner,
        playerReaction,
        opponentReaction,
        note,
      };

      return {
        ...state,
        match: {
          ...state.match,
          playerScore: newPlayerScore,
          opponentScore: newOpponentScore,
          winner: matchWinner,
          history: [...state.match.history, historyItem],
        },
        duel: {
          ...state.duel,
          phase: DUEL_PHASES.RESULT,
          roundWinner: winner,
          roundNote: note,
        },
      };
    }

    case 'NEXT_ROUND_OR_FINISH': {
      if (state.match.winner) {
        return {
          ...state,
          screen: SCREENS.MATCH_END,
        };
      }
      return {
        ...state,
        match: {
          ...state.match,
          round: state.match.round + 1,
        },
        duel: {
          phase: DUEL_PHASES.HOLSTER,
          countdown: 3,
          drawScheduledAt: null,
          playerShot: null,
          opponentShot: null,
          roundWinner: null,
          roundNote: '',
        },
      };
    }

    case 'RESTART_MATCH':
      return {
        ...state,
        screen: SCREENS.LOBBY,
        player: { ...state.player, ready: false },
        opponent: state.opponent ? { ...state.opponent, ready: false } : null,
        match: {
          round: 1,
          playerScore: 0,
          opponentScore: 0,
          winner: null,
          history: [],
        },
        duel: {
          phase: DUEL_PHASES.HOLSTER,
          countdown: 3,
          drawScheduledAt: null,
          playerShot: null,
          opponentShot: null,
          roundWinner: null,
          roundNote: '',
        },
      };

    case 'ADD_BULLET_HOLE':
      return {
        ...state,
        bulletHoles: [...state.bulletHoles.slice(-12), action.payload], // keep up to 12 holes
      };

    case 'TOGGLE_TEQUILA_MODE':
      return {
        ...state,
        tequilaMode: !state.tequilaMode,
      };

    case 'CONNECTION_ERROR':
      return {
        ...state,
        connectionError: action.payload,
      };

    case 'RESET_TO_HOME':
      return {
        ...initialState,
        player: {
          ...initialState.player,
          name: state.player.name,
          avatar: state.player.avatar,
        },
        tequilaMode: state.tequilaMode,
      };

    default:
      return state;
  }
}

