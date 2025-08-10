"use client"

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { GameRuleProvider, useRuleParameter, useRuleParameters, useGameLoop, RuleAwareGame } from '@/hooks/use-game-rules'
import { initializePlatformerRules } from '@/lib/game-rules/platformer-rules'
import { cn } from '@/lib/utils'

// Initialize platformer rules
initializePlatformerRules()

interface PlatformerGameProps {
  rules: Record<string, any>
}

interface GameObject {
  x: number
  y: number
  width: number
  height: number
  velocityX: number
  velocityY: number
  onGround: boolean
  type: 'player' | 'enemy' | 'coin' | 'platform' | 'powerup'
  color: string
}

interface Player extends GameObject {
  type: 'player'
  lives: number
  score: number
  hasDoubleJump: boolean
  dashCooldown: number
  invulnerable: number
  powerState: 'small' | 'big' | 'fire'
}

export function PlatformerGameCore({ rules }: PlatformerGameProps) {
  // Extract rule parameters
  const physics = rules['platformer-gravity'] || {}
  const movement = rules['platformer-character-movement'] || {}
  const jumping = rules['platformer-jump-mechanics'] || {}
  const powerups = rules['platformer-powerups'] || {}
  const enemies = rules['platformer-enemies'] || {}
  const level = rules['platformer-level-design'] || {}
  const collectibles = rules['platformer-collectibles'] || {}
  const visual = rules['platformer-visual-effects'] || {}
  const audio = rules['platformer-audio'] || {}
  const difficulty = rules['platformer-difficulty'] || {}

  // Game state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameLoopRef = useRef<number>()
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  
  // Player state
  const [player, setPlayer] = useState<Player>({
    x: 100,
    y: 300,
    width: 32,
    height: 32,
    velocityX: 0,
    velocityY: 0,
    onGround: false,
    type: 'player',
    color: '#ff6b6b',
    lives: difficulty.lives || 3,
    score: 0,
    hasDoubleJump: true,
    dashCooldown: 0,
    invulnerable: 0,
    powerState: 'small'
  })

  // Level objects
  const [platforms, setPlatforms] = useState<GameObject[]>([])
  const [coins, setCoins] = useState<GameObject[]>([])
  const [enemyObjects, setEnemyObjects] = useState<GameObject[]>([])
  
  // Input state
  const keysRef = useRef<Record<string, boolean>>({})
  const [cameraX, setCameraX] = useState(0)

  // Game constants
  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 400
  const TILE_SIZE = 32

  // Generate level based on rules
  const generateLevel = useCallback(() => {
    const levelWidth = level.levelWidth || 200
    const levelHeight = level.levelHeight || 15
    const platformDensity = level.platformDensity || 'normal'
    
    const newPlatforms: GameObject[] = []
    const newCoins: GameObject[] = []
    const newEnemies: GameObject[] = []

    // Ground platforms
    for (let x = 0; x < levelWidth; x += 2) {
      newPlatforms.push({
        x: x * TILE_SIZE,
        y: CANVAS_HEIGHT - TILE_SIZE,
        width: TILE_SIZE * 2,
        height: TILE_SIZE,
        velocityX: 0,
        velocityY: 0,
        onGround: true,
        type: 'platform',
        color: '#8B4513'
      })
    }

    // Generate platforms based on density
    const densityMultiplier = {
      sparse: 0.3,
      normal: 0.6,
      dense: 0.9,
      maze: 1.2
    }[platformDensity as string] || 0.6

    for (let i = 0; i < levelWidth * densityMultiplier; i++) {
      const x = Math.random() * (levelWidth * TILE_SIZE)
      const y = 100 + Math.random() * 200
      const width = TILE_SIZE * (1 + Math.floor(Math.random() * 4))
      
      newPlatforms.push({
        x,
        y,
        width,
        height: TILE_SIZE,
        velocityX: 0,
        velocityY: 0,
        onGround: false,
        type: 'platform',
        color: '#654321'
      })
    }

    // Generate coins based on density
    const coinDensityMultiplier = {
      rare: 0.2,
      normal: 0.5,
      abundant: 0.8,
      everywhere: 1.5
    }[collectibles.coinDensity as string] || 0.5

    for (let i = 0; i < levelWidth * coinDensityMultiplier; i++) {
      const x = Math.random() * (levelWidth * TILE_SIZE)
      const y = Math.random() * (CANVAS_HEIGHT - 100)
      
      newCoins.push({
        x,
        y,
        width: 24,
        height: 24,
        velocityX: 0,
        velocityY: 0,
        onGround: false,
        type: 'coin',
        color: '#FFD700'
      })
    }

    // Generate enemies
    for (let i = 0; i < Math.floor(levelWidth * 0.1); i++) {
      const x = 200 + Math.random() * (levelWidth * TILE_SIZE - 400)
      const y = CANVAS_HEIGHT - TILE_SIZE * 2
      
      newEnemies.push({
        x,
        y,
        width: 28,
        height: 28,
        velocityX: (Math.random() > 0.5 ? 1 : -1) * (enemies.enemySpeed || 2),
        velocityY: 0,
        onGround: true,
        type: 'enemy',
        color: '#ff4757'
      })
    }

    setPlatforms(newPlatforms)
    setCoins(newCoins)
    setEnemyObjects(newEnemies)
  }, [level, collectibles, enemies])

  // Collision detection
  const checkCollision = (obj1: GameObject, obj2: GameObject): boolean => {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y
  }

  // Physics update
  const updatePhysics = (obj: GameObject, deltaTime: number) => {
    const gravity = physics.gravity || 0.8
    const airResistance = physics.airResistance || 0.98
    const terminalVelocity = physics.terminalVelocity || 15

    // Apply gravity
    if (!obj.onGround) {
      obj.velocityY += gravity * deltaTime * 60
      obj.velocityY = Math.min(obj.velocityY, terminalVelocity)
    }

    // Air resistance
    if (!obj.onGround) {
      obj.velocityX *= airResistance
    }

    // Update position
    obj.x += obj.velocityX * deltaTime * 60
    obj.y += obj.velocityY * deltaTime * 60

    // Ground collision
    obj.onGround = false
    platforms.forEach(platform => {
      if (checkCollision(obj, platform) && obj.velocityY > 0 && 
          obj.y < platform.y) {
        obj.y = platform.y - obj.height
        obj.velocityY = 0
        obj.onGround = true
        
        // Ground friction
        const friction = physics.friction || 0.85
        obj.velocityX *= friction
      }
    })
  }

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameStarted || gameOver) return

    const deltaTime = 1/60
    const keys = keysRef.current

    setPlayer(prevPlayer => {
      const newPlayer = { ...prevPlayer }

      // Reduce cooldowns
      if (newPlayer.dashCooldown > 0) {
        newPlayer.dashCooldown -= deltaTime
      }
      if (newPlayer.invulnerable > 0) {
        newPlayer.invulnerable -= deltaTime
      }

      // Movement input
      const walkSpeed = movement.walkSpeed || 4
      const runSpeed = movement.runSpeed || 7
      const acceleration = movement.acceleration || 0.5
      const deceleration = movement.deceleration || 0.8

      let targetSpeed = 0
      if (keys['arrowleft'] || keys['a']) {
        targetSpeed = -(keys['shift'] ? runSpeed : walkSpeed)
      } else if (keys['arrowright'] || keys['d']) {
        targetSpeed = keys['shift'] ? runSpeed : walkSpeed
      }

      // Apply acceleration/deceleration
      if (targetSpeed !== 0) {
        newPlayer.velocityX += (targetSpeed - newPlayer.velocityX) * acceleration
      } else {
        newPlayer.velocityX *= deceleration
      }

      // Jumping
      const jumpHeight = jumping.jumpHeight || 12
      const canJump = newPlayer.onGround || (movement.doubleJump && newPlayer.hasDoubleJump)
      
      if ((keys['space'] || keys['arrowup'] || keys['w']) && canJump) {
        newPlayer.velocityY = -jumpHeight
        if (!newPlayer.onGround) {
          newPlayer.hasDoubleJump = false
        }
      }

      // Reset double jump when landing
      if (newPlayer.onGround) {
        newPlayer.hasDoubleJump = true
      }

      // Dash ability
      if (powerups.dashAbility && keys['x'] && newPlayer.dashCooldown <= 0) {
        const dashDistance = powerups.dashDistance || 8
        const dashDirection = newPlayer.velocityX >= 0 ? 1 : -1
        newPlayer.velocityX = dashDirection * dashDistance
        newPlayer.dashCooldown = powerups.dashCooldown || 1.0
      }

      // Apply physics
      updatePhysics(newPlayer, deltaTime)

      // Coin collection
      setCoins(prevCoins => {
        return prevCoins.filter(coin => {
          if (checkCollision(newPlayer, coin)) {
            newPlayer.score += collectibles.coinValue || 100
            setScore(prev => prev + (collectibles.coinValue || 100))
            return false
          }
          return true
        })
      })

      // Enemy collision
      setEnemyObjects(prevEnemies => {
        return prevEnemies.filter(enemy => {
          if (checkCollision(newPlayer, enemy) && newPlayer.invulnerable <= 0) {
            if (newPlayer.velocityY > 0 && newPlayer.y < enemy.y - 10) {
              // Jump on enemy
              newPlayer.velocityY = -8
              newPlayer.score += 200
              setScore(prev => prev + 200)
              return false
            } else {
              // Take damage
              newPlayer.lives -= 1
              newPlayer.invulnerable = 2.0
              
              if (newPlayer.lives <= 0) {
                setGameOver(true)
              }
            }
          }
          return true
        })
      })

      // Update camera to follow player
      setCameraX(Math.max(0, newPlayer.x - CANVAS_WIDTH / 2))

      return newPlayer
    })

    // Update enemies
    setEnemyObjects(prevEnemies => {
      return prevEnemies.map(enemy => {
        const newEnemy = { ...enemy }
        updatePhysics(newEnemy, deltaTime)
        
        // Simple AI: change direction at platform edges
        const futureX = newEnemy.x + newEnemy.velocityX * 2
        const onPlatform = platforms.some(platform => 
          futureX > platform.x - newEnemy.width &&
          futureX < platform.x + platform.width &&
          Math.abs((newEnemy.y + newEnemy.height) - platform.y) < 5
        )
        
        if (!onPlatform) {
          newEnemy.velocityX *= -1
        }
        
        return newEnemy
      })
    })

    gameLoopRef.current = requestAnimationFrame(gameLoop)
  }, [gameStarted, gameOver, platforms, physics, movement, jumping, powerups, collectibles])

  // Start game loop
  useEffect(() => {
    if (gameStarted && !gameOver) {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [gameStarted, gameOver, gameLoop])

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Set camera offset
    ctx.save()
    ctx.translate(-cameraX, 0)

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT)
    const theme = visual.visualTheme || 'classic'
    
    switch (theme) {
      case 'space':
        gradient.addColorStop(0, '#1a1a2e')
        gradient.addColorStop(1, '#16213e')
        break
      case 'nature':
        gradient.addColorStop(0, '#87CEEB')
        gradient.addColorStop(1, '#98FB98')
        break
      case 'neon':
        gradient.addColorStop(0, '#2d1b69')
        gradient.addColorStop(1, '#11051e')
        break
      default:
        gradient.addColorStop(0, '#87CEEB')
        gradient.addColorStop(1, '#98FB98')
    }
    
    ctx.fillStyle = gradient
    ctx.fillRect(cameraX, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw platforms
    platforms.forEach(platform => {
      ctx.fillStyle = platform.color
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height)
      
      // Add platform border for better visibility
      ctx.strokeStyle = '#5a4037'
      ctx.lineWidth = 2
      ctx.strokeRect(platform.x, platform.y, platform.width, platform.height)
    })

    // Draw coins
    coins.forEach(coin => {
      ctx.fillStyle = coin.color
      ctx.beginPath()
      ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2)
      ctx.fill()
      
      // Coin sparkle effect
      ctx.strokeStyle = '#FFED4E'
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // Draw enemies
    enemyObjects.forEach(enemy => {
      ctx.fillStyle = enemy.color
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height)
      
      // Enemy eyes
      ctx.fillStyle = 'white'
      ctx.fillRect(enemy.x + 6, enemy.y + 6, 4, 4)
      ctx.fillRect(enemy.x + 18, enemy.y + 6, 4, 4)
      ctx.fillStyle = 'black'
      ctx.fillRect(enemy.x + 8, enemy.y + 7, 2, 2)
      ctx.fillRect(enemy.x + 20, enemy.y + 7, 2, 2)
    })

    // Draw player
    ctx.fillStyle = player.invulnerable > 0 && Math.floor(Date.now() / 100) % 2 ? 
      'rgba(255, 107, 107, 0.5)' : player.color
    ctx.fillRect(player.x, player.y, player.width, player.height)
    
    // Player face
    ctx.fillStyle = 'white'
    ctx.fillRect(player.x + 8, player.y + 8, 4, 4)
    ctx.fillRect(player.x + 20, player.y + 8, 4, 4)
    ctx.fillStyle = 'black'
    ctx.fillRect(player.x + 9, player.y + 9, 2, 2)
    ctx.fillRect(player.x + 21, player.y + 9, 2, 2)
    
    // Smile
    ctx.strokeStyle = 'black'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(player.x + 16, player.y + 20, 6, 0, Math.PI)
    ctx.stroke()

    ctx.restore()
  }, [player, platforms, coins, enemyObjects, cameraX, visual])

  // Initialize level when game starts
  useEffect(() => {
    if (gameStarted) {
      generateLevel()
    }
  }, [gameStarted, generateLevel])

  // Start game screen
  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gradient-to-br from-blue-100 to-green-100 dark:from-gray-900 dark:to-gray-800 rounded-lg">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-3xl font-bold mb-2">Rule-Enhanced Platformer</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Experience classic 2D platforming with customizable physics and gameplay
          </p>
          <div className="text-sm space-y-1 text-gray-500">
            <p>Gravity: {physics.gravity || 0.8} | Jump: {jumping.jumpHeight || 12}</p>
            <p>Lives: {difficulty.lives || 3} | Dash: {powerups.dashAbility ? 'Enabled' : 'Disabled'}</p>
          </div>
        </div>
        
        <button
          onClick={() => setGameStarted(true)}
          className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors mb-4"
        >
          Start Adventure
        </button>
        
        <div className="text-sm text-gray-500 text-center">
          <p>Controls: Arrow Keys or WASD to move, Space/Up to jump</p>
          <p>Hold Shift to run • X to dash (if enabled) • Collect coins and avoid enemies!</p>
        </div>
      </div>
    )
  }

  // Game over screen
  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-gradient-to-br from-red-100 to-orange-100 dark:from-gray-900 dark:to-gray-800 rounded-lg">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💀</div>
          <h1 className="text-3xl font-bold mb-2">Game Over</h1>
          <p className="text-xl mb-4">Final Score: {score}</p>
        </div>
        
        <button
          onClick={() => {
            setGameStarted(false)
            setGameOver(false)
            setScore(0)
            setPlayer(prev => ({
              ...prev,
              x: 100,
              y: 300,
              velocityX: 0,
              velocityY: 0,
              lives: difficulty.lives || 3,
              score: 0,
              invulnerable: 0
            }))
          }}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Play Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Game HUD */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-4 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-6">
          <div className="font-mono">Score: {score}</div>
          <div className="font-mono">Lives: {"❤️".repeat(player.lives)}</div>
        </div>
        
        <div className="flex items-center space-x-4">
          {player.dashCooldown > 0 && powerups.dashAbility && (
            <div className="text-sm text-gray-500">
              Dash: {player.dashCooldown.toFixed(1)}s
            </div>
          )}
          {player.invulnerable > 0 && (
            <div className="text-sm text-red-500 animate-pulse">
              Invulnerable
            </div>
          )}
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative border-4 border-gray-800 rounded-lg overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block"
        />
        
        {/* Overlay controls hint */}
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded text-sm">
          Arrow Keys: Move • Space: Jump • Shift: Run {powerups.dashAbility && '• X: Dash'}
        </div>
      </div>
      
      {/* Rule display */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center max-w-2xl">
        <p>Physics Rules Active: Gravity {physics.gravity || 0.8}, Jump Height {jumping.jumpHeight || 12}</p>
        <p>{movement.doubleJump ? 'Double Jump Enabled' : 'Single Jump Only'} • {powerups.dashAbility ? 'Dash Available' : 'No Dash'}</p>
      </div>
    </div>
  )
}

// Main component with rule integration
export function RuleEnabledPlatformer() {
  return (
    <GameRuleProvider defaultGame="platformer">
      <RuleAwareGame gameType="platformer">
        {(rules) => <PlatformerGameCore rules={rules} />}
      </RuleAwareGame>
    </GameRuleProvider>
  )
}
