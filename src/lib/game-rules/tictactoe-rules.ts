/**
 * Tic Tac Toe Game Rules
 * Comprehensive rule system for customizable tic-tac-toe variations
 */

import { GameRule, gameRuleEngine } from '../game-rule-engine'

export const TICTACTOE_RULES: GameRule[] = [
  // === Board Configuration ===
  {
    id: 'tictactoe-board-setup',
    name: 'Board Configuration',
    description: 'Customize the game board size and layout',
    category: 'board',
    gameType: 'tictactoe',
    version: '1.0.0',
    parameters: [
      {
        key: 'boardSize',
        name: 'Board Size',
        type: 'number',
        defaultValue: 3,
        value: 3,
        constraints: { min: 3, max: 10, step: 1 },
        description: 'Size of the game board (3 = 3x3, 4 = 4x4, etc.)'
      },
      {
        key: 'boardShape',
        name: 'Board Shape',
        type: 'select',
        defaultValue: 'square',
        value: 'square',
        constraints: {
          options: [
            { value: 'square', label: 'Square' },
            { value: 'rectangle', label: 'Rectangle' },
            { value: 'circle', label: 'Circle' },
            { value: 'diamond', label: 'Diamond' }
          ]
        },
        description: 'Overall shape of the game board'
      },
      {
        key: 'rectangleWidth',
        name: 'Rectangle Width',
        type: 'number',
        defaultValue: 4,
        value: 4,
        constraints: { min: 3, max: 8, step: 1 },
        description: 'Width for rectangle boards (only if rectangle selected)'
      },
      {
        key: 'rectangleHeight',
        name: 'Rectangle Height',
        type: 'number',
        defaultValue: 3,
        value: 3,
        constraints: { min: 3, max: 8, step: 1 },
        description: 'Height for rectangle boards (only if rectangle selected)'
      },
      {
        key: 'cellAnimation',
        name: 'Cell Animation',
        type: 'boolean',
        defaultValue: true,
        value: true,
        description: 'Animate cells when placing marks'
      }
    ],
    tags: ['core', 'board', 'default'],
    dependencies: [],
    conflicts: []
  },

  // === Win Conditions ===
  {
    id: 'tictactoe-win-conditions',
    name: 'Win Conditions',
    description: 'Define how players can win the game',
    category: 'rules',
    gameType: 'tictactoe',
    version: '1.0.0',
    parameters: [
      {
        key: 'winLength',
        name: 'Win Length',
        type: 'number',
        defaultValue: 3,
        value: 3,
        constraints: { min: 3, max: 10, step: 1 },
        description: 'Number of marks in a row needed to win'
      },
      {
        key: 'allowDiagonal',
        name: 'Diagonal Wins',
        type: 'boolean',
        defaultValue: true,
        value: true,
        description: 'Allow diagonal lines to count as wins'
      },
      {
        key: 'allowVertical',
        name: 'Vertical Wins',
        type: 'boolean',
        defaultValue: true,
        value: true,
        description: 'Allow vertical lines to count as wins'
      },
      {
        key: 'allowHorizontal',
        name: 'Horizontal Wins',
        type: 'boolean',
        defaultValue: true,
        value: true,
        description: 'Allow horizontal lines to count as wins'
      },
      {
        key: 'multipleWins',
        name: 'Multiple Win Lines',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Allow multiple simultaneous win conditions'
      },
      {
        key: 'cornerWin',
        name: 'Corner Win',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Win by controlling all four corners'
      },
      {
        key: 'centerWin',
        name: 'Center Control Win',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Win by controlling the center and specific patterns'
      }
    ],
    tags: ['core', 'winning', 'default'],
    dependencies: ['tictactoe-board-setup'],
    conflicts: []
  },

  // === Player Configuration ===
  {
    id: 'tictactoe-players',
    name: 'Player Configuration',
    description: 'Configure number of players and their symbols',
    category: 'players',
    gameType: 'tictactoe',
    version: '1.0.0',
    parameters: [
      {
        key: 'numPlayers',
        name: 'Number of Players',
        type: 'number',
        defaultValue: 2,
        value: 2,
        constraints: { min: 2, max: 6, step: 1 },
        description: 'How many players can play simultaneously'
      },
      {
        key: 'playerSymbols',
        name: 'Player Symbols',
        type: 'select',
        defaultValue: 'classic',
        value: 'classic',
        constraints: {
          options: [
            { value: 'classic', label: 'X and O' },
            { value: 'shapes', label: 'Geometric Shapes' },
            { value: 'colors', label: 'Colored Dots' },
            { value: 'numbers', label: 'Numbers' },
            { value: 'letters', label: 'Letters' },
            { value: 'emojis', label: 'Emojis' },
            { value: 'custom', label: 'Custom Symbols' }
          ]
        },
        description: 'Visual style for player marks'
      },
      {
        key: 'turnTimer',
        name: 'Turn Timer',
        type: 'number',
        defaultValue: 0,
        value: 0,
        constraints: { min: 0, max: 60, step: 5 },
        description: 'Time limit per turn in seconds (0 = no limit)'
      },
      {
        key: 'aiOpponent',
        name: 'AI Opponent',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Enable AI opponent for single player'
      },
      {
        key: 'aiDifficulty',
        name: 'AI Difficulty',
        type: 'select',
        defaultValue: 'normal',
        value: 'normal',
        constraints: {
          options: [
            { value: 'easy', label: 'Easy' },
            { value: 'normal', label: 'Normal' },
            { value: 'hard', label: 'Hard' },
            { value: 'impossible', label: 'Impossible' }
          ]
        },
        description: 'AI intelligence level'
      }
    ],
    tags: ['core', 'players', 'default'],
    dependencies: [],
    conflicts: []
  },

  // === Game Mechanics ===
  {
    id: 'tictactoe-mechanics',
    name: 'Game Mechanics',
    description: 'Special gameplay mechanics and variations',
    category: 'gameplay',
    gameType: 'tictactoe',
    version: '1.0.0',
    parameters: [
      {
        key: 'gravityMode',
        name: 'Gravity Mode',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Pieces fall down due to gravity (like Connect 4)'
      },
      {
        key: 'slideMode',
        name: 'Sliding Pieces',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Allow moving pieces after placement'
      },
      {
        key: 'stackMode',
        name: 'Piece Stacking',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Allow placing pieces on top of others'
      },
      {
        key: 'rotatingBoard',
        name: 'Rotating Board',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Board rotates after each move'
      },
      {
        key: 'limitedPieces',
        name: 'Limited Pieces',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Players have limited number of pieces'
      },
      {
        key: 'pieceLimit',
        name: 'Piece Limit',
        type: 'number',
        defaultValue: 3,
        value: 3,
        constraints: { min: 2, max: 9, step: 1 },
        description: 'Maximum pieces per player (if limited pieces enabled)'
      },
      {
        key: 'misereMode',
        name: 'Misère Mode',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Player who gets line first loses instead of wins'
      }
    ],
    tags: ['advanced', 'mechanics'],
    dependencies: ['tictactoe-board-setup'],
    conflicts: []
  },

  // === Power-ups and Special Moves ===
  {
    id: 'tictactoe-powerups',
    name: 'Power-ups & Special Moves',
    description: 'Special abilities and power-ups that change gameplay',
    category: 'powerups',
    gameType: 'tictactoe',
    version: '1.0.0',
    parameters: [
      {
        key: 'enablePowerups',
        name: 'Enable Power-ups',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Add special power-ups to the game'
      },
      {
        key: 'bombPowerup',
        name: 'Bomb Power-up',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Remove opponent pieces in an area'
      },
      {
        key: 'blockPowerup',
        name: 'Block Power-up',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Prevent opponent from using a cell'
      },
      {
        key: 'swapPowerup',
        name: 'Swap Power-up',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Swap positions of two pieces'
      },
      {
        key: 'extraTurnPowerup',
        name: 'Extra Turn Power-up',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Get an additional turn'
      },
      {
        key: 'wildcardPowerup',
        name: 'Wildcard Power-up',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Piece counts as any player\'s symbol for winning'
      },
      {
        key: 'powerupFrequency',
        name: 'Power-up Frequency',
        type: 'select',
        defaultValue: 'normal',
        value: 'normal',
        constraints: {
          options: [
            { value: 'rare', label: 'Rare' },
            { value: 'normal', label: 'Normal' },
            { value: 'frequent', label: 'Frequent' }
          ]
        },
        description: 'How often power-ups appear'
      }
    ],
    tags: ['powerups', 'special'],
    dependencies: ['tictactoe-mechanics'],
    conflicts: []
  },

  // === Visual Themes ===
  {
    id: 'tictactoe-visual-theme',
    name: 'Visual Theme',
    description: 'Customize the visual appearance and animations',
    category: 'visual',
    gameType: 'tictactoe',
    version: '1.0.0',
    parameters: [
      {
        key: 'boardTheme',
        name: 'Board Theme',
        type: 'select',
        defaultValue: 'classic',
        value: 'classic',
        constraints: {
          options: [
            { value: 'classic', label: 'Classic Lines' },
            { value: 'modern', label: 'Modern Flat' },
            { value: 'neon', label: 'Neon Glow' },
            { value: 'wooden', label: 'Wooden Board' },
            { value: 'space', label: 'Space Theme' },
            { value: 'paper', label: 'Paper & Pencil' },
            { value: 'digital', label: 'Digital Grid' }
          ]
        },
        description: 'Overall visual style of the board'
      },
      {
        key: 'gridColor',
        name: 'Grid Color',
        type: 'color',
        defaultValue: '#333333',
        value: '#333333',
        description: 'Color of the board grid lines'
      },
      {
        key: 'backgroundColor',
        name: 'Background Color',
        type: 'color',
        defaultValue: '#ffffff',
        value: '#ffffff',
        description: 'Background color of the game board'
      },
      {
        key: 'animationSpeed',
        name: 'Animation Speed',
        type: 'select',
        defaultValue: 'normal',
        value: 'normal',
        constraints: {
          options: [
            { value: 'instant', label: 'Instant' },
            { value: 'fast', label: 'Fast' },
            { value: 'normal', label: 'Normal' },
            { value: 'slow', label: 'Slow' },
            { value: 'dramatic', label: 'Dramatic' }
          ]
        },
        description: 'Speed of animations and transitions'
      },
      {
        key: 'particleEffects',
        name: 'Particle Effects',
        type: 'boolean',
        defaultValue: true,
        value: true,
        description: 'Show particle effects for wins and special moves'
      },
      {
        key: 'soundEffects',
        name: 'Sound Effects',
        type: 'boolean',
        defaultValue: true,
        value: true,
        description: 'Play sound effects for moves and wins'
      }
    ],
    tags: ['visual', 'theme'],
    dependencies: [],
    conflicts: []
  },

  // === Tournament Mode ===
  {
    id: 'tictactoe-tournament',
    name: 'Tournament Mode',
    description: 'Multi-game tournament and scoring system',
    category: 'tournament',
    gameType: 'tictactoe',
    version: '1.0.0',
    parameters: [
      {
        key: 'enableTournament',
        name: 'Tournament Mode',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Enable multi-game tournament play'
      },
      {
        key: 'bestOf',
        name: 'Best Of Games',
        type: 'number',
        defaultValue: 3,
        value: 3,
        constraints: { min: 1, max: 21, step: 2 },
        description: 'Number of games in match (best of X)'
      },
      {
        key: 'scoringSystem',
        name: 'Scoring System',
        type: 'select',
        defaultValue: 'standard',
        value: 'standard',
        constraints: {
          options: [
            { value: 'standard', label: 'Win/Loss/Draw' },
            { value: 'points', label: 'Point System' },
            { value: 'speed', label: 'Speed Bonus' },
            { value: 'style', label: 'Style Points' }
          ]
        },
        description: 'How to calculate match scores'
      },
      {
        key: 'winPoints',
        name: 'Points for Win',
        type: 'number',
        defaultValue: 3,
        value: 3,
        constraints: { min: 1, max: 10, step: 1 },
        description: 'Points awarded for winning a game'
      },
      {
        key: 'drawPoints',
        name: 'Points for Draw',
        type: 'number',
        defaultValue: 1,
        value: 1,
        constraints: { min: 0, max: 5, step: 1 },
        description: 'Points awarded for a draw/tie'
      },
      {
        key: 'lossPoints',
        name: 'Points for Loss',
        type: 'number',
        defaultValue: 0,
        value: 0,
        constraints: { min: 0, max: 3, step: 1 },
        description: 'Points awarded for losing a game'
      }
    ],
    tags: ['tournament', 'scoring'],
    dependencies: ['tictactoe-players'],
    conflicts: []
  },

  // === Accessibility ===
  {
    id: 'tictactoe-accessibility',
    name: 'Accessibility Options',
    description: 'Make the game more accessible to all players',
    category: 'accessibility',
    gameType: 'tictactoe',
    version: '1.0.0',
    parameters: [
      {
        key: 'highContrast',
        name: 'High Contrast Mode',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Use high contrast colors for better visibility'
      },
      {
        key: 'largeSymbols',
        name: 'Large Symbols',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Use larger symbols for better readability'
      },
      {
        key: 'keyboardNav',
        name: 'Keyboard Navigation',
        type: 'boolean',
        defaultValue: true,
        value: true,
        description: 'Enable keyboard navigation controls'
      },
      {
        key: 'screenReader',
        name: 'Screen Reader Support',
        type: 'boolean',
        defaultValue: true,
        value: true,
        description: 'Provide screen reader announcements'
      },
      {
        key: 'colorBlind',
        name: 'Color Blind Friendly',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Use patterns and shapes instead of just colors'
      },
      {
        key: 'reduceMotion',
        name: 'Reduce Motion',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Minimize animations for motion sensitivity'
      }
    ],
    tags: ['accessibility', 'inclusive'],
    dependencies: ['tictactoe-visual-theme'],
    conflicts: []
  }
]

// Initialize tic-tac-toe rules in the rule engine
export function initializeTicTacToeRules() {
  TICTACTOE_RULES.forEach(rule => {
    gameRuleEngine.registerRule(rule)
  })

  // Create a default tic-tac-toe configuration
  const defaultConfig = gameRuleEngine.createConfiguration(
    'tictactoe',
    'Classic Tic Tac Toe',
    'Traditional 3x3 tic-tac-toe experience'
  )

  // Enable core rules by default
  const coreRules = TICTACTOE_RULES.filter(rule => (rule.tags ?? []).includes('core'))
  coreRules.forEach(rule => {
    gameRuleEngine.enableRule(defaultConfig.gameId, rule.id)
  })

  return defaultConfig
}
