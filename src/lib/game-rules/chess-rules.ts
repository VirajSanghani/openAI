/**
 * Chess Game Rules for Dynamic Modification
 * Enables real-time modification of chess game mechanics
 */

import { GameRule, gameRuleEngine } from '@/lib/game-rule-engine'

// Chess-specific rule definitions
export const CHESS_RULES: GameRule[] = [
  // Board Configuration Rules
  {
    id: 'chess-board-size',
    name: 'Board Size',
    description: 'Configure the chess board dimensions',
    category: 'gameplay',
    gameType: 'chess',
    parameters: [
      {
        key: 'width',
        name: 'Board Width',
        description: 'Number of squares horizontally',
        type: 'number',
        value: 8,
        defaultValue: 8,
        constraints: { min: 4, max: 12, step: 1 },
        livePreview: true,
        category: 'board'
      },
      {
        key: 'height',
        name: 'Board Height',
        description: 'Number of squares vertically',
        type: 'number',
        value: 8,
        defaultValue: 8,
        constraints: { min: 4, max: 12, step: 1 },
        livePreview: true,
        category: 'board'
      }
    ],
    version: '1.0.0',
    tags: ['default', 'board'],
    priority: 1
  },

  // Piece Movement Rules
  {
    id: 'chess-piece-movement',
    name: 'Piece Movement',
    description: 'Modify how chess pieces move',
    category: 'movement',
    gameType: 'chess',
    parameters: [
      {
        key: 'pawnDoubleMove',
        name: 'Pawn Double Move',
        description: 'Allow pawns to move two squares on first move',
        type: 'boolean',
        value: true,
        defaultValue: true,
        livePreview: true,
        category: 'pawn'
      },
      {
        key: 'pawnBackward',
        name: 'Pawn Backward Movement',
        description: 'Allow pawns to move backward',
        type: 'boolean',
        value: false,
        defaultValue: false,
        livePreview: true,
        category: 'pawn'
      },
      {
        key: 'knightDistance',
        name: 'Knight Move Distance',
        description: 'Modify knight L-shape distance',
        type: 'select',
        value: 'normal',
        defaultValue: 'normal',
        constraints: {
          options: [
            { value: 'normal', label: 'Normal (2+1)' },
            { value: 'extended', label: 'Extended (3+1)' },
            { value: 'short', label: 'Short (1+1)' },
            { value: 'super', label: 'Super Knight (2+2)' }
          ]
        },
        livePreview: true,
        category: 'knight'
      },
      {
        key: 'bishopMaxDistance',
        name: 'Bishop Max Distance',
        description: 'Maximum squares bishop can move in one turn',
        type: 'number',
        value: 8,
        defaultValue: 8,
        constraints: { min: 1, max: 12, step: 1 },
        livePreview: true,
        category: 'bishop'
      },
      {
        key: 'rookMaxDistance',
        name: 'Rook Max Distance',
        description: 'Maximum squares rook can move in one turn',
        type: 'number',
        value: 8,
        defaultValue: 8,
        constraints: { min: 1, max: 12, step: 1 },
        livePreview: true,
        category: 'rook'
      },
      {
        key: 'queenPowerLevel',
        name: 'Queen Power Level',
        description: 'Modify queen movement capabilities',
        type: 'select',
        value: 'normal',
        defaultValue: 'normal',
        constraints: {
          options: [
            { value: 'weak', label: 'Weak Queen (King movement)' },
            { value: 'normal', label: 'Normal Queen' },
            { value: 'super', label: 'Super Queen (+ Knight moves)' },
            { value: 'ultimate', label: 'Ultimate Queen (Teleport)' }
          ]
        },
        livePreview: true,
        category: 'queen'
      }
    ],
    version: '1.0.0',
    tags: ['default', 'movement'],
    priority: 2
  },

  // Special Move Rules
  {
    id: 'chess-special-moves',
    name: 'Special Moves',
    description: 'Enable or disable special chess moves',
    category: 'movement',
    gameType: 'chess',
    parameters: [
      {
        key: 'castling',
        name: 'Castling',
        description: 'Allow castling moves',
        type: 'boolean',
        value: true,
        defaultValue: true,
        livePreview: true,
        category: 'special'
      },
      {
        key: 'enPassant',
        name: 'En Passant',
        description: 'Allow en passant captures',
        type: 'boolean',
        value: true,
        defaultValue: true,
        livePreview: true,
        category: 'special'
      },
      {
        key: 'pawnPromotion',
        name: 'Pawn Promotion',
        description: 'Allow pawn promotion at end of board',
        type: 'boolean',
        value: true,
        defaultValue: true,
        livePreview: true,
        category: 'special'
      },
      {
        key: 'promotionPieces',
        name: 'Promotion Pieces',
        description: 'Which pieces pawns can promote to',
        type: 'select',
        value: 'traditional',
        defaultValue: 'traditional',
        constraints: {
          options: [
            { value: 'queen-only', label: 'Queen Only' },
            { value: 'traditional', label: 'Queen, Rook, Bishop, Knight' },
            { value: 'any', label: 'Any Piece (except King)' },
            { value: 'super', label: 'Including Super Pieces' }
          ]
        },
        livePreview: true,
        category: 'special'
      }
    ],
    version: '1.0.0',
    tags: ['default', 'special-moves'],
    priority: 3
  },

  // Win Condition Rules
  {
    id: 'chess-win-conditions',
    name: 'Win Conditions',
    description: 'Modify how the game is won',
    category: 'win-conditions',
    gameType: 'chess',
    parameters: [
      {
        key: 'winCondition',
        name: 'Primary Win Condition',
        description: 'How to win the game',
        type: 'select',
        value: 'checkmate',
        defaultValue: 'checkmate',
        constraints: {
          options: [
            { value: 'checkmate', label: 'Traditional Checkmate' },
            { value: 'capture-king', label: 'Capture Enemy King' },
            { value: 'king-of-hill', label: 'King of the Hill' },
            { value: 'capture-all', label: 'Capture All Pieces' },
            { value: 'time-based', label: 'Time-Based Points' },
            { value: 'territory', label: 'Territory Control' }
          ]
        },
        livePreview: false,
        category: 'victory'
      },
      {
        key: 'hillPosition',
        name: 'Hill Position',
        description: 'Center squares for King of the Hill',
        type: 'text',
        value: 'center',
        defaultValue: 'center',
        livePreview: true,
        category: 'victory'
      },
      {
        key: 'allowDraw',
        name: 'Allow Draw',
        description: 'Enable draw conditions',
        type: 'boolean',
        value: true,
        defaultValue: true,
        livePreview: true,
        category: 'victory'
      },
      {
        key: 'moveLimit',
        name: 'Move Limit',
        description: 'Maximum moves before draw (0 = no limit)',
        type: 'number',
        value: 0,
        defaultValue: 0,
        constraints: { min: 0, max: 200, step: 10 },
        livePreview: false,
        category: 'victory'
      }
    ],
    version: '1.0.0',
    tags: ['default', 'win-conditions'],
    priority: 4
  },

  // Time Control Rules
  {
    id: 'chess-time-control',
    name: 'Time Control',
    description: 'Configure game timing and pace',
    category: 'gameplay',
    gameType: 'chess',
    parameters: [
      {
        key: 'timeEnabled',
        name: 'Enable Time Control',
        description: 'Use chess clock for moves',
        type: 'boolean',
        value: false,
        defaultValue: false,
        livePreview: true,
        category: 'time'
      },
      {
        key: 'timePerPlayer',
        name: 'Time Per Player',
        description: 'Minutes each player gets',
        type: 'number',
        value: 10,
        defaultValue: 10,
        constraints: { min: 1, max: 60, step: 1 },
        livePreview: true,
        category: 'time'
      },
      {
        key: 'timeIncrement',
        name: 'Time Increment',
        description: 'Seconds added per move',
        type: 'number',
        value: 0,
        defaultValue: 0,
        constraints: { min: 0, max: 30, step: 1 },
        livePreview: true,
        category: 'time'
      },
      {
        key: 'moveTimeLimit',
        name: 'Move Time Limit',
        description: 'Maximum seconds per move (0 = no limit)',
        type: 'number',
        value: 0,
        defaultValue: 0,
        constraints: { min: 0, max: 300, step: 5 },
        livePreview: true,
        category: 'time'
      }
    ],
    version: '1.0.0',
    tags: ['time-control'],
    priority: 5
  },

  // AI Behavior Rules
  {
    id: 'chess-ai-behavior',
    name: 'AI Behavior',
    description: 'Modify computer opponent behavior',
    category: 'ai',
    gameType: 'chess',
    parameters: [
      {
        key: 'difficulty',
        name: 'AI Difficulty',
        description: 'Computer opponent strength',
        type: 'select',
        value: 'medium',
        defaultValue: 'medium',
        constraints: {
          options: [
            { value: 'beginner', label: 'Beginner' },
            { value: 'easy', label: 'Easy' },
            { value: 'medium', label: 'Medium' },
            { value: 'hard', label: 'Hard' },
            { value: 'expert', label: 'Expert' },
            { value: 'random', label: 'Random Moves' }
          ]
        },
        livePreview: true,
        category: 'ai'
      },
      {
        key: 'thinkTime',
        name: 'AI Think Time',
        description: 'Seconds AI takes to think',
        type: 'number',
        value: 1,
        defaultValue: 1,
        constraints: { min: 0.1, max: 10, step: 0.1 },
        livePreview: true,
        category: 'ai'
      },
      {
        key: 'aiPersonality',
        name: 'AI Personality',
        description: 'AI playing style preference',
        type: 'select',
        value: 'balanced',
        defaultValue: 'balanced',
        constraints: {
          options: [
            { value: 'aggressive', label: 'Aggressive Attacker' },
            { value: 'defensive', label: 'Defensive Player' },
            { value: 'balanced', label: 'Balanced' },
            { value: 'tactical', label: 'Tactical Player' },
            { value: 'positional', label: 'Positional Player' },
            { value: 'chaotic', label: 'Chaotic/Unpredictable' }
          ]
        },
        livePreview: true,
        category: 'ai'
      }
    ],
    version: '1.0.0',
    tags: ['ai', 'opponent'],
    priority: 6
  },

  // Visual and Theme Rules
  {
    id: 'chess-visual-theme',
    name: 'Visual Theme',
    description: 'Customize the chess board appearance',
    category: 'visual',
    gameType: 'chess',
    parameters: [
      {
        key: 'boardStyle',
        name: 'Board Style',
        description: 'Visual style of the chess board',
        type: 'select',
        value: 'classic',
        defaultValue: 'classic',
        constraints: {
          options: [
            { value: 'classic', label: 'Classic Wood' },
            { value: 'modern', label: 'Modern Minimalist' },
            { value: 'marble', label: 'Marble Luxury' },
            { value: 'neon', label: 'Neon Cyberpunk' },
            { value: 'medieval', label: 'Medieval Stone' },
            { value: 'space', label: 'Space Theme' }
          ]
        },
        livePreview: true,
        category: 'appearance'
      },
      {
        key: 'pieceSet',
        name: 'Piece Set',
        description: 'Style of chess pieces',
        type: 'select',
        value: 'traditional',
        defaultValue: 'traditional',
        constraints: {
          options: [
            { value: 'traditional', label: 'Traditional Staunton' },
            { value: 'modern', label: 'Modern Geometric' },
            { value: 'fantasy', label: 'Fantasy Characters' },
            { value: 'animals', label: 'Animal Kingdom' },
            { value: 'robots', label: 'Robot Warriors' },
            { value: 'medieval', label: 'Medieval Army' }
          ]
        },
        livePreview: true,
        category: 'appearance'
      },
      {
        key: 'boardFlipped',
        name: 'Board Orientation',
        description: 'Show board from which player\'s perspective',
        type: 'select',
        value: 'white-bottom',
        defaultValue: 'white-bottom',
        constraints: {
          options: [
            { value: 'white-bottom', label: 'White at Bottom' },
            { value: 'black-bottom', label: 'Black at Bottom' },
            { value: 'auto-flip', label: 'Auto-flip for Current Player' }
          ]
        },
        livePreview: true,
        category: 'layout'
      },
      {
        key: 'showCoordinates',
        name: 'Show Coordinates',
        description: 'Display rank and file labels',
        type: 'boolean',
        value: true,
        defaultValue: true,
        livePreview: true,
        category: 'layout'
      },
      {
        key: 'highlightMoves',
        name: 'Highlight Valid Moves',
        description: 'Show possible moves when piece selected',
        type: 'boolean',
        value: true,
        defaultValue: true,
        livePreview: true,
        category: 'assistance'
      },
      {
        key: 'animationSpeed',
        name: 'Animation Speed',
        description: 'Speed of piece movement animations',
        type: 'select',
        value: 'normal',
        defaultValue: 'normal',
        constraints: {
          options: [
            { value: 'instant', label: 'Instant (No Animation)' },
            { value: 'fast', label: 'Fast' },
            { value: 'normal', label: 'Normal' },
            { value: 'slow', label: 'Slow' },
            { value: 'dramatic', label: 'Dramatic' }
          ]
        },
        livePreview: true,
        category: 'animation'
      }
    ],
    version: '1.0.0',
    tags: ['visual', 'theme'],
    priority: 7
  },

  // Game Assistance Rules
  {
    id: 'chess-assistance',
    name: 'Game Assistance',
    description: 'Configure help and learning features',
    category: 'gameplay',
    gameType: 'chess',
    parameters: [
      {
        key: 'showHints',
        name: 'Show Hints',
        description: 'Provide move suggestions',
        type: 'boolean',
        value: false,
        defaultValue: false,
        livePreview: true,
        category: 'help'
      },
      {
        key: 'preventBlunders',
        name: 'Prevent Blunders',
        description: 'Warn about obviously bad moves',
        type: 'boolean',
        value: false,
        defaultValue: false,
        livePreview: true,
        category: 'help'
      },
      {
        key: 'allowTakebacks',
        name: 'Allow Takebacks',
        description: 'Allow players to undo moves',
        type: 'boolean',
        value: false,
        defaultValue: false,
        livePreview: true,
        category: 'help'
      },
      {
        key: 'maxTakebacks',
        name: 'Max Takebacks',
        description: 'Maximum number of moves that can be undone',
        type: 'number',
        value: 1,
        defaultValue: 1,
        constraints: { min: 1, max: 10, step: 1 },
        livePreview: true,
        category: 'help'
      },
      {
        key: 'analysisMode',
        name: 'Analysis Mode',
        description: 'Enable post-game analysis',
        type: 'boolean',
        value: true,
        defaultValue: true,
        livePreview: false,
        category: 'analysis'
      }
    ],
    version: '1.0.0',
    tags: ['assistance', 'learning'],
    priority: 8
  }
]

// Initialize chess rules in the engine
export function initializeChessRules() {
  CHESS_RULES.forEach(rule => {
    gameRuleEngine.registerRule(rule)
  })
}

// Utility functions for chess rule access
export function getChessRuleCategories(): string[] {
  return [...new Set(CHESS_RULES.map(rule => rule.category))]
}

export function getChessRulesByCategory(category: string): GameRule[] {
  return CHESS_RULES.filter(rule => rule.category === category)
}

export function getDefaultChessConfiguration(): string {
  const config = gameRuleEngine.createConfiguration('chess', 'Standard Chess', 'Traditional chess with standard rules')
  return config.gameId
}

// Chess rule validation helpers
export function validateChessConfiguration(configId: string): boolean {
  const validation = gameRuleEngine.validateConfiguration(configId)
  return validation.valid
}

export function getChessConfigurationErrors(configId: string): string[] {
  const validation = gameRuleEngine.validateConfiguration(configId)
  return validation.errors
}