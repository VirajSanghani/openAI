/**
 * 2D Platformer Game Rules
 * Comprehensive rule system for side-scrolling platform games like Mario
 */

import { GameRule, gameRuleEngine } from '../game-rule-engine'

export const PLATFORMER_RULES: GameRule[] = [
  // === Physics Configuration ===
  {
    id: 'platformer-gravity',
    name: 'Gravity & Physics',
    description: 'Control the fundamental physics that govern movement and falling',
    category: 'physics',
    gameType: 'platformer',
    version: '1.0.0',
    parameters: [
      {
        key: 'gravity',
        name: 'Gravity Strength',
        type: 'number',
        defaultValue: 0.8,
        value: 0.8,
        constraints: { min: 0.1, max: 3.0, step: 0.1 },
        description: 'How fast objects fall (lower = floating, higher = heavy)'
      },
      {
        key: 'friction',
        name: 'Ground Friction',
        type: 'number',
        defaultValue: 0.85,
        value: 0.85,
        constraints: { min: 0.1, max: 1.0, step: 0.05 },
        description: 'How slippery surfaces are (lower = ice-like, higher = grippy)'
      },
      {
        key: 'airResistance',
        name: 'Air Resistance',
        type: 'number',
        defaultValue: 0.98,
        value: 0.98,
        constraints: { min: 0.8, max: 1.0, step: 0.01 },
        description: 'Drag force while airborne (lower = more drag)'
      },
      {
        key: 'terminalVelocity',
        name: 'Terminal Velocity',
        type: 'number',
        defaultValue: 15,
        value: 15,
        constraints: { min: 5, max: 30, step: 1 },
        description: 'Maximum falling speed'
      }
    ],
    tags: ['core', 'physics'],
    dependencies: [],
    conflicts: []
  },

  // === Character Movement ===
  {
    id: 'platformer-character-movement',
    name: 'Character Movement',
    description: 'Customize how the player character moves and responds',
    category: 'character',
    gameType: 'platformer',
    version: '1.0.0',
    parameters: [
      {
        key: 'walkSpeed',
        name: 'Walking Speed',
        type: 'number',
        defaultValue: 4,
        value: 4,
        constraints: { min: 1, max: 12, step: 0.5 },
        description: 'Base horizontal movement speed'
      },
      {
        key: 'runSpeed',
        name: 'Running Speed',
        type: 'number',
        defaultValue: 7,
        value: 7,
        constraints: { min: 2, max: 20, step: 0.5 },
        description: 'Maximum horizontal movement speed when running'
      },
      {
        key: 'acceleration',
        name: 'Acceleration',
        type: 'number',
        defaultValue: 0.5,
        value: 0.5,
        constraints: { min: 0.1, max: 2.0, step: 0.1 },
        description: 'How quickly character reaches top speed'
      },
      {
        key: 'deceleration',
        name: 'Deceleration',
        type: 'number',
        defaultValue: 0.8,
        value: 0.8,
        constraints: { min: 0.1, max: 2.0, step: 0.1 },
        description: 'How quickly character stops moving'
      },
      {
        key: 'doubleJump',
        name: 'Double Jump',
        type: 'boolean',
        defaultValue: true,
        value: true,
        description: 'Allow jumping again while in mid-air'
      },
      {
        key: 'wallJump',
        name: 'Wall Jump',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Enable jumping off walls'
      },
      {
        key: 'wallSlide',
        name: 'Wall Slide',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Slide down walls slowly when touching them'
      }
    ],
    tags: ['core', 'character'],
    dependencies: [],
    conflicts: []
  },

  // === Jump Mechanics ===
  {
    id: 'platformer-jump-mechanics',
    name: 'Jump Mechanics',
    description: 'Fine-tune jumping behavior and feel',
    category: 'character',
    gameType: 'platformer',
    version: '1.0.0',
    parameters: [
      {
        key: 'jumpHeight',
        name: 'Jump Height',
        type: 'number',
        defaultValue: 12,
        value: 12,
        constraints: { min: 5, max: 25, step: 1 },
        description: 'How high the character can jump'
      },
      {
        key: 'jumpVariableHeight',
        name: 'Variable Jump Height',
        type: 'boolean',
        defaultValue: true,
        value: true,
        description: 'Allow shorter jumps by releasing button early'
      },
      {
        key: 'coyoteTime',
        name: 'Coyote Time',
        type: 'number',
        defaultValue: 0.15,
        value: 0.15,
        constraints: { min: 0, max: 0.5, step: 0.05 },
        description: 'Grace period to jump after leaving ground (seconds)'
      },
      {
        key: 'jumpBuffer',
        name: 'Jump Buffer',
        type: 'number',
        defaultValue: 0.1,
        value: 0.1,
        constraints: { min: 0, max: 0.3, step: 0.05 },
        description: 'Early jump input window (seconds)'
      },
      {
        key: 'floatyJump',
        name: 'Floaty Jump',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Reduce gravity while jump button is held'
      }
    ],
    tags: ['core', 'feel'],
    dependencies: ['platformer-gravity'],
    conflicts: []
  },

  // === Power-ups and Abilities ===
  {
    id: 'platformer-powerups',
    name: 'Power-ups & Abilities',
    description: 'Special abilities and temporary power-ups',
    category: 'gameplay',
    gameType: 'platformer',
    version: '1.0.0',
    parameters: [
      {
        key: 'dashAbility',
        name: 'Dash Ability',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Enable air dash ability'
      },
      {
        key: 'dashDistance',
        name: 'Dash Distance',
        type: 'number',
        defaultValue: 8,
        value: 8,
        constraints: { min: 3, max: 20, step: 1 },
        description: 'How far the dash travels'
      },
      {
        key: 'dashCooldown',
        name: 'Dash Cooldown',
        type: 'number',
        defaultValue: 1.0,
        value: 1.0,
        constraints: { min: 0.2, max: 5.0, step: 0.2 },
        description: 'Time between dash uses (seconds)'
      },
      {
        key: 'groundPound',
        name: 'Ground Pound',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Enable downward slam attack'
      },
      {
        key: 'glideAbility',
        name: 'Glide Ability',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Glide slowly while holding jump'
      },
      {
        key: 'swimAbility',
        name: 'Swimming',
        type: 'boolean',
        defaultValue: true,
        value: true,
        description: 'Character can swim in water'
      }
    ],
    tags: ['abilities', 'powerups'],
    dependencies: [],
    conflicts: []
  },

  // === Enemy Behavior ===
  {
    id: 'platformer-enemies',
    name: 'Enemy Behavior',
    description: 'Control how enemies move and behave',
    category: 'enemies',
    gameType: 'platformer',
    version: '1.0.0',
    parameters: [
      {
        key: 'enemySpeed',
        name: 'Enemy Movement Speed',
        type: 'number',
        defaultValue: 2,
        value: 2,
        constraints: { min: 0.5, max: 8, step: 0.5 },
        description: 'Base speed for enemy movement'
      },
      {
        key: 'enemyAggression',
        name: 'Enemy Aggression',
        type: 'select',
        defaultValue: 'normal',
        value: 'normal',
        constraints: {
          options: [
            { value: 'passive', label: 'Passive' },
            { value: 'normal', label: 'Normal' },
            { value: 'aggressive', label: 'Aggressive' },
            { value: 'hostile', label: 'Hostile' }
          ]
        },
        description: 'How actively enemies pursue the player'
      },
      {
        key: 'enemyRespawn',
        name: 'Enemy Respawn',
        type: 'boolean',
        defaultValue: true,
        value: true,
        description: 'Defeated enemies respawn when off-screen'
      },
      {
        key: 'enemyVariants',
        name: 'Enemy Variants',
        type: 'boolean',
        defaultValue: false,
        value: false,
        description: 'Enable different colored enemy variants'
      }
    ],
    tags: ['enemies', 'difficulty'],
    dependencies: [],
    conflicts: []
  },

  // === Level Design ===
  {
    id: 'platformer-level-design',
    name: 'Level Design',
    description: 'Modify level layout and generation parameters',
    category: 'level',
    gameType: 'platformer',
    version: '1.0.0',
    parameters: [
      {
        key: 'levelWidth',
        name: 'Level Width',
        type: 'number',
        defaultValue: 200,
        value: 200,
        constraints: { min: 50, max: 500, step: 10 },
        description: 'Total level width in tiles'
      },
      {
        key: 'levelHeight',
        name: 'Level Height',
        type: 'number',
        defaultValue: 15,
        value: 15,
        constraints: { min: 10, max: 30, step: 1 },
        description: 'Level height in tiles'
      },
      {
        key: 'platformDensity',
        name: 'Platform Density',
        type: 'select',
        defaultValue: 'normal',
        value: 'normal',
        constraints: {
          options: [
            { value: 'sparse', label: 'Sparse' },
            { value: 'normal', label: 'Normal' },
            { value: 'dense', label: 'Dense' },
            { value: 'maze', label: 'Maze-like' }
          ]
        },
        description: 'How many platforms and obstacles to generate'
      },
      {
        key: 'scrollingSpeed',
        name: 'Auto-scroll Speed',
        type: 'number',
        defaultValue: 0,
        value: 0,
        constraints: { min: 0, max: 5, step: 0.2 },
        description: 'Level auto-scroll speed (0 = disabled)'
      },
      {
        key: 'parallaxLayers',
        name: 'Parallax Layers',
        type: 'boolean',
        defaultValue: true,
        value: true,
        description: 'Enable background parallax scrolling'
      }
    ],
    tags: ['level', 'generation'],
    dependencies: [],
    conflicts: []
  },

  // === Collectibles and Scoring ===
  {
    id: 'platformer-collectibles',
    name: 'Collectibles & Scoring',
    description: 'Configure coins, items, and scoring system',
    category: 'gameplay',
    gameType: 'platformer',
    version: '1.0.0',
    parameters: [
      {
        key: 'coinValue',
        name: 'Coin Value',
        type: 'number',
        defaultValue: 100,
        value: 100,
        constraints: { min: 10, max: 1000, step: 10 },
        description: 'Points awarded per coin collected'
      },
      {
        key: 'coinDensity',
        name: 'Coin Density',
        type: 'select',
        defaultValue: 'normal',
        value: 'normal',
        constraints: {
          options: [
            { value: 'rare', label: 'Rare' },
            { value: 'normal', label: 'Normal' },
            { value: 'abundant', label: 'Abundant' },
            { value: 'everywhere', label: 'Everywhere' }
          ]
        },
        description: 'How many coins to place in levels'
      },
      {
        key: 'extraLife',
        name: 'Extra Life Threshold',
        type: 'number',
        defaultValue: 10000,
        value: 10000,
        constraints: { min: 1000, max: 50000, step: 1000 },
        description: 'Score needed for extra life'
      },
      {
        key: 'secretAreas',
        name: 'Secret Areas',
        type: 'boolean',
        defaultValue: true,
        value: true,
        description: 'Include hidden areas with bonus items'
      },
      {
        key: 'powerUpFrequency',
        name: 'Power-up Frequency',
        type: 'select',
        defaultValue: 'normal',
        value: 'normal',
        constraints: {
          options: [
            { value: 'never', label: 'Never' },
            { value: 'rare', label: 'Rare' },
            { value: 'normal', label: 'Normal' },
            { value: 'frequent', label: 'Frequent' }
          ]
        },
        description: 'How often power-ups appear'
      }
    ],
    tags: ['scoring', 'collectibles'],
    dependencies: [],
    conflicts: []
  },

  // === Visual Effects ===
  {
    id: 'platformer-visual-effects',
    name: 'Visual Effects',
    description: 'Control particle effects and visual feedback',
    category: 'visual',
    gameType: 'platformer',
    version: '1.0.0',
    parameters: [
      {
        key: 'particleEffects',
        name: 'Particle Effects',
        type: 'boolean',
        defaultValue: true,
        value: true,
        description: 'Enable particle effects for jumps, impacts, etc.'
      },
      {
        key: 'screenShake',
        name: 'Screen Shake',
        type: 'boolean',
        defaultValue: true,
        value: true,
        description: 'Screen shake on impacts and explosions'
      },
      {
        key: 'animationSpeed',
        name: 'Animation Speed',
        type: 'select',
        defaultValue: 'normal',
        value: 'normal',
        constraints: {
          options: [
            { value: 'slow', label: 'Slow Motion' },
            { value: 'normal', label: 'Normal' },
            { value: 'fast', label: 'Fast' },
            { value: 'turbo', label: 'Turbo' }
          ]
        },
        description: 'Overall animation playback speed'
      },
      {
        key: 'visualTheme',
        name: 'Visual Theme',
        type: 'select',
        defaultValue: 'classic',
        value: 'classic',
        constraints: {
          options: [
            { value: 'classic', label: 'Classic Mario' },
            { value: 'modern', label: 'Modern' },
            { value: 'retro', label: 'Retro Pixel' },
            { value: 'neon', label: 'Neon Cyber' },
            { value: 'nature', label: 'Forest Theme' },
            { value: 'space', label: 'Space Theme' }
          ]
        },
        description: 'Overall visual style and color palette'
      },
      {
        key: 'weatherEffects',
        name: 'Weather Effects',
        type: 'select',
        defaultValue: 'none',
        value: 'none',
        constraints: {
          options: [
            { value: 'none', label: 'None' },
            { value: 'rain', label: 'Rain' },
            { value: 'snow', label: 'Snow' },
            { value: 'wind', label: 'Wind' },
            { value: 'storm', label: 'Storm' }
          ]
        },
        description: 'Environmental weather effects'
      }
    ],
    tags: ['visual', 'effects'],
    dependencies: [],
    conflicts: []
  },

  // === Audio Settings ===
  {
    id: 'platformer-audio',
    name: 'Audio Settings',
    description: 'Configure music and sound effects',
    category: 'audio',
    gameType: 'platformer',
    version: '1.0.0',
    parameters: [
      {
        key: 'musicTheme',
        name: 'Music Theme',
        type: 'select',
        defaultValue: 'upbeat',
        value: 'upbeat',
        constraints: {
          options: [
            { value: 'classic', label: 'Classic Chiptune' },
            { value: 'upbeat', label: 'Upbeat Adventure' },
            { value: 'atmospheric', label: 'Atmospheric' },
            { value: 'electronic', label: 'Electronic' },
            { value: 'orchestral', label: 'Orchestral' }
          ]
        },
        description: 'Background music style'
      },
      {
        key: 'soundEffectVolume',
        name: 'Sound Effect Volume',
        type: 'number',
        defaultValue: 0.8,
        value: 0.8,
        constraints: { min: 0, max: 1.0, step: 0.1 },
        description: 'Volume level for sound effects'
      },
      {
        key: 'musicVolume',
        name: 'Music Volume',
        type: 'number',
        defaultValue: 0.6,
        value: 0.6,
        constraints: { min: 0, max: 1.0, step: 0.1 },
        description: 'Volume level for background music'
      },
      {
        key: 'dynamicMusic',
        name: 'Dynamic Music',
        type: 'boolean',
        defaultValue: true,
        value: true,
        description: 'Music changes based on gameplay situations'
      }
    ],
    tags: ['audio', 'music'],
    dependencies: [],
    conflicts: []
  },

  // === Difficulty Settings ===
  {
    id: 'platformer-difficulty',
    name: 'Difficulty Settings',
    description: 'Adjust overall game challenge',
    category: 'gameplay',
    gameType: 'platformer',
    version: '1.0.0',
    parameters: [
      {
        key: 'lives',
        name: 'Starting Lives',
        type: 'number',
        defaultValue: 3,
        value: 3,
        constraints: { min: 1, max: 10, step: 1 },
        description: 'Number of lives player starts with'
      },
      {
        key: 'checkpoints',
        name: 'Checkpoint Frequency',
        type: 'select',
        defaultValue: 'normal',
        value: 'normal',
        constraints: {
          options: [
            { value: 'none', label: 'No Checkpoints' },
            { value: 'rare', label: 'Rare' },
            { value: 'normal', label: 'Normal' },
            { value: 'frequent', label: 'Frequent' }
          ]
        },
        description: 'How often checkpoints appear'
      },
      {
        key: 'damageMode',
        name: 'Damage Mode',
        type: 'select',
        defaultValue: 'traditional',
        value: 'traditional',
        constraints: {
          options: [
            { value: 'invincible', label: 'Invincible' },
            { value: 'traditional', label: 'Traditional (Shrink)' },
            { value: 'health', label: 'Health Bar' },
            { value: 'one-hit', label: 'One Hit Death' }
          ]
        },
        description: 'How damage affects the player'
      },
      {
        key: 'timeLimit',
        name: 'Level Time Limit',
        type: 'number',
        defaultValue: 300,
        value: 300,
        constraints: { min: 60, max: 999, step: 30 },
        description: 'Time limit per level (seconds, 0 = unlimited)'
      }
    ],
    tags: ['difficulty', 'challenge'],
    dependencies: [],
    conflicts: []
  }
]

// Initialize platformer rules in the rule engine
export function initializePlatformerRules() {
  PLATFORMER_RULES.forEach(rule => {
    gameRuleEngine.registerRule(rule)
  })

  // Create a default platformer configuration
  const defaultConfig = gameRuleEngine.createConfiguration(
    'platformer',
    'Default Platformer',
    'Classic 2D platformer experience'
  )

  // Enable core rules by default
  const coreRules = PLATFORMER_RULES.filter(rule => (rule.tags ?? []).includes('core'))
  coreRules.forEach(rule => {
    gameRuleEngine.enableRule(defaultConfig.gameId, rule.id)
  })

  return defaultConfig
}
