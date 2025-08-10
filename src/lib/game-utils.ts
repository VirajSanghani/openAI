// Game Development Utilities for Casual OS
// Provides common game development functions and classes

export interface Vector2D {
  x: number
  y: number
}

export interface GameObject {
  x: number
  y: number
  width: number
  height: number
  vx?: number
  vy?: number
  active?: boolean
}

export interface SpriteData {
  image: HTMLImageElement | string
  width: number
  height: number
  frames?: number
  frameRate?: number
}

// Physics Engine Utilities
export class PhysicsEngine {
  gravity: number = 0.5
  friction: number = 0.8

  constructor(gravity: number = 0.5, friction: number = 0.8) {
    this.gravity = gravity
    this.friction = friction
  }

  // Apply gravity to an object
  applyGravity(obj: GameObject): void {
    if (obj.vy !== undefined) {
      obj.vy += this.gravity
    }
  }

  // Apply friction to an object
  applyFriction(obj: GameObject): void {
    if (obj.vx !== undefined) {
      obj.vx *= this.friction
    }
  }

  // Update object position based on velocity
  updatePosition(obj: GameObject): void {
    if (obj.vx !== undefined) obj.x += obj.vx
    if (obj.vy !== undefined) obj.y += obj.vy
  }

  // Check collision between two rectangular objects
  checkCollision(obj1: GameObject, obj2: GameObject): boolean {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y
  }

  // Get collision direction (useful for platformers)
  getCollisionDirection(moving: GameObject, stationary: GameObject): string {
    const overlapX = Math.min(moving.x + moving.width, stationary.x + stationary.width) - 
                     Math.max(moving.x, stationary.x)
    const overlapY = Math.min(moving.y + moving.height, stationary.y + stationary.height) - 
                     Math.max(moving.y, stationary.y)

    if (overlapX < overlapY) {
      return moving.x < stationary.x ? 'left' : 'right'
    } else {
      return moving.y < stationary.y ? 'top' : 'bottom'
    }
  }

  // Resolve collision by moving object out of collision
  resolveCollision(moving: GameObject, stationary: GameObject): void {
    const direction = this.getCollisionDirection(moving, stationary)
    
    switch (direction) {
      case 'left':
        moving.x = stationary.x - moving.width
        if (moving.vx && moving.vx > 0) moving.vx = 0
        break
      case 'right':
        moving.x = stationary.x + stationary.width
        if (moving.vx && moving.vx < 0) moving.vx = 0
        break
      case 'top':
        moving.y = stationary.y - moving.height
        if (moving.vy && moving.vy > 0) moving.vy = 0
        break
      case 'bottom':
        moving.y = stationary.y + stationary.height
        if (moving.vy && moving.vy < 0) moving.vy = 0
        break
    }
  }
}

// Sprite Management System
export class SpriteManager {
  private sprites: Map<string, SpriteData> = new Map()
  private loadedImages: Map<string, HTMLImageElement> = new Map()

  // Load a sprite image
  async loadSprite(name: string, src: string, width: number, height: number, frames: number = 1): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        this.loadedImages.set(name, img)
        this.sprites.set(name, {
          image: img,
          width,
          height,
          frames
        })
        resolve()
      }
      img.onerror = reject
      img.src = src
    })
  }

  // Get sprite data
  getSprite(name: string): SpriteData | undefined {
    return this.sprites.get(name)
  }

  // Draw sprite on canvas context
  drawSprite(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, frame: number = 0): void {
    const sprite = this.sprites.get(name)
    if (!sprite || typeof sprite.image === 'string') return

    const frameWidth = sprite.width / (sprite.frames || 1)
    const sourceX = frame * frameWidth

    ctx.drawImage(
      sprite.image,
      sourceX, 0, frameWidth, sprite.height,
      x, y, frameWidth, sprite.height
    )
  }
}

// Animation System
export class AnimationFrame {
  frame: number = 0
  maxFrames: number
  speed: number
  private frameCount: number = 0

  constructor(maxFrames: number, speed: number = 0.2) {
    this.maxFrames = maxFrames
    this.speed = speed
  }

  update(): void {
    this.frameCount += this.speed
    if (this.frameCount >= 1) {
      this.frame = (this.frame + 1) % this.maxFrames
      this.frameCount = 0
    }
  }

  reset(): void {
    this.frame = 0
    this.frameCount = 0
  }
}

// Sound Management System
export class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private volume: number = 1.0
  private muted: boolean = false

  // Load a sound
  loadSound(name: string, src: string): void {
    const audio = new Audio(src)
    audio.preload = 'auto'
    this.sounds.set(name, audio)
  }

  // Play a sound
  playSound(name: string, loop: boolean = false): void {
    if (this.muted) return
    
    const sound = this.sounds.get(name)
    if (sound) {
      sound.volume = this.volume
      sound.loop = loop
      sound.currentTime = 0
      sound.play().catch(console.error)
    }
  }

  // Stop a sound
  stopSound(name: string): void {
    const sound = this.sounds.get(name)
    if (sound) {
      sound.pause()
      sound.currentTime = 0
    }
  }

  // Set volume (0-1)
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    this.sounds.forEach(sound => {
      sound.volume = this.volume
    })
  }

  // Toggle mute
  toggleMute(): void {
    this.muted = !this.muted
    if (this.muted) {
      this.sounds.forEach(sound => sound.pause())
    }
  }
}

// Game State Management
export class GameStateManager {
  private states: Map<string, any> = new Map()
  private currentState: string = 'menu'

  setState(name: string, state: any): void {
    this.states.set(name, state)
  }

  getState(name: string): any {
    return this.states.get(name)
  }

  setCurrentState(name: string): void {
    if (this.states.has(name)) {
      this.currentState = name
    }
  }

  getCurrentState(): string {
    return this.currentState
  }

  isCurrentState(name: string): boolean {
    return this.currentState === name
  }
}

// Input Handler
export class InputHandler {
  private keys: Map<string, boolean> = new Map()
  private mousePos: Vector2D = { x: 0, y: 0 }
  private mouseButtons: Map<number, boolean> = new Map()

  constructor() {
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      this.keys.set(e.code, true)
    })

    window.addEventListener('keyup', (e) => {
      this.keys.set(e.code, false)
    })

    // Mouse events
    window.addEventListener('mousemove', (e) => {
      this.mousePos.x = e.clientX
      this.mousePos.y = e.clientY
    })

    window.addEventListener('mousedown', (e) => {
      this.mouseButtons.set(e.button, true)
    })

    window.addEventListener('mouseup', (e) => {
      this.mouseButtons.set(e.button, false)
    })
  }

  isKeyPressed(keyCode: string): boolean {
    return this.keys.get(keyCode) || false
  }

  isMouseButtonPressed(button: number = 0): boolean {
    return this.mouseButtons.get(button) || false
  }

  getMousePosition(): Vector2D {
    return { ...this.mousePos }
  }

  // Helper methods for common keys
  isLeftPressed(): boolean {
    return this.isKeyPressed('KeyA') || this.isKeyPressed('ArrowLeft')
  }

  isRightPressed(): boolean {
    return this.isKeyPressed('KeyD') || this.isKeyPressed('ArrowRight')
  }

  isUpPressed(): boolean {
    return this.isKeyPressed('KeyW') || this.isKeyPressed('ArrowUp')
  }

  isDownPressed(): boolean {
    return this.isKeyPressed('KeyS') || this.isKeyPressed('ArrowDown')
  }

  isSpacePressed(): boolean {
    return this.isKeyPressed('Space')
  }
}

// Particle System
export interface Particle extends GameObject {
  life: number
  maxLife: number
  color: string
  size: number
}

export class ParticleSystem {
  private particles: Particle[] = []
  maxParticles: number

  constructor(maxParticles: number = 100) {
    this.maxParticles = maxParticles
  }

  // Add a particle
  addParticle(x: number, y: number, vx: number, vy: number, life: number, color: string = '#ffffff', size: number = 2): void {
    if (this.particles.length < this.maxParticles) {
      this.particles.push({
        x, y, vx, vy,
        width: size,
        height: size,
        life,
        maxLife: life,
        color,
        size,
        active: true
      })
    }
  }

  // Update all particles
  update(): void {
    this.particles = this.particles.filter(particle => {
      if (!particle.active) return false

      // Update position
      particle.x += particle.vx || 0
      particle.y += particle.vy || 0

      // Update life
      particle.life--
      if (particle.life <= 0) {
        particle.active = false
        return false
      }

      return true
    })
  }

  // Draw all particles
  draw(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(particle => {
      if (!particle.active) return

      const alpha = particle.life / particle.maxLife
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.fillStyle = particle.color
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size)
      ctx.restore()
    })
  }

  // Clear all particles
  clear(): void {
    this.particles = []
  }
}

// Utility Functions
export class GameUtils {
  // Generate random number between min and max
  static random(min: number, max: number): number {
    return Math.random() * (max - min) + min
  }

  // Generate random integer between min and max
  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  // Clamp value between min and max
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
  }

  // Linear interpolation
  static lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor
  }

  // Distance between two points
  static distance(point1: Vector2D, point2: Vector2D): number {
    const dx = point2.x - point1.x
    const dy = point2.y - point1.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Angle between two points
  static angle(from: Vector2D, to: Vector2D): number {
    return Math.atan2(to.y - from.y, to.x - from.x)
  }

  // Normalize angle to 0-2π
  static normalizeAngle(angle: number): number {
    while (angle < 0) angle += 2 * Math.PI
    while (angle >= 2 * Math.PI) angle -= 2 * Math.PI
    return angle
  }

  // Check if point is inside rectangle
  static pointInRect(point: Vector2D, rect: GameObject): boolean {
    return point.x >= rect.x &&
           point.x <= rect.x + rect.width &&
           point.y >= rect.y &&
           point.y <= rect.y + rect.height
  }

  // Get random element from array
  static randomFromArray<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }

  // Shuffle array
  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}

// AI Utilities for Game NPCs
export class GameAI {
  // Simple pathfinding (A* algorithm would be more complex)
  static findPath(start: Vector2D, end: Vector2D, obstacles: GameObject[]): Vector2D[] {
    // Simple direct path - in a real implementation, you'd use A* or similar
    const path: Vector2D[] = []
    const dx = end.x - start.x
    const dy = end.y - start.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const steps = Math.ceil(distance / 32) // 32px steps
    
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      path.push({
        x: start.x + dx * t,
        y: start.y + dy * t
      })
    }
    
    return path
  }

  // Simple chase AI
  static chaseTarget(chaser: GameObject, target: GameObject, speed: number): void {
    const dx = target.x - chaser.x
    const dy = target.y - chaser.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance > 0) {
      chaser.vx = (dx / distance) * speed
      chaser.vy = (dy / distance) * speed
    }
  }

  // Simple flee AI
  static fleeFromTarget(fleer: GameObject, target: GameObject, speed: number): void {
    const dx = fleer.x - target.x
    const dy = fleer.y - target.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    if (distance > 0) {
      fleer.vx = (dx / distance) * speed
      fleer.vy = (dy / distance) * speed
    }
  }

  // Wander AI (random movement)
  static wander(entity: GameObject, speed: number, bounds: GameObject): void {
    // Change direction occasionally
    if (Math.random() < 0.02) {
      entity.vx = GameUtils.random(-speed, speed)
      entity.vy = GameUtils.random(-speed, speed)
    }

    // Keep within bounds
    if (entity.x <= bounds.x || entity.x + entity.width >= bounds.x + bounds.width) {
      entity.vx = entity.vx ? -entity.vx : 0
    }
    if (entity.y <= bounds.y || entity.y + entity.height >= bounds.y + bounds.height) {
      entity.vy = entity.vy ? -entity.vy : 0
    }
  }
}

// Performance Monitor
export class PerformanceMonitor {
  private frameCount: number = 0
  private fps: number = 0
  private lastTime: number = 0
  private frameTime: number = 0

  update(): void {
    const now = performance.now()
    this.frameTime = now - this.lastTime
    this.lastTime = now
    this.frameCount++

    // Update FPS every second
    if (this.frameCount % 60 === 0) {
      this.fps = Math.round(1000 / this.frameTime)
    }
  }

  getFPS(): number {
    return this.fps
  }

  getFrameTime(): number {
    return this.frameTime
  }
}

// Export all utilities as a single game development toolkit
export const GameDevKit = {
  PhysicsEngine,
  SpriteManager,
  AnimationFrame,
  SoundManager,
  GameStateManager,
  InputHandler,
  ParticleSystem,
  GameUtils,
  GameAI,
  PerformanceMonitor
}