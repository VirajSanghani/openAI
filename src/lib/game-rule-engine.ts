/**
 * Universal Game Rule Engine
 * Enables dynamic modification of game rules and mechanics in real-time
 */

// Core Rule System Types
export interface RuleParameter {
  key: string
  name: string
  description: string
  type: 'number' | 'boolean' | 'select' | 'color' | 'sprite' | 'sound' | 'text'
  value: any
  defaultValue: any
  constraints?: {
    min?: number
    max?: number
    step?: number
    options?: Array<{value: any, label: string}>
    required?: boolean
  }
  livePreview?: boolean
  category?: string
}

export interface GameRule {
  id: string
  name: string
  description: string
  category:
    | 'movement'
    | 'physics'
    | 'scoring'
    | 'ai'
    | 'visual'
    | 'audio'
    | 'gameplay'
    | 'win-conditions'
    | 'board'
    | 'players'
    | 'tournament'
    | 'accessibility'
    | 'powerups'
    | 'rules'
    | 'character'
    | 'enemies'
    | 'level'
  gameType: string // 'chess', 'platformer', 'puzzle', etc.
  parameters: RuleParameter[]
  dependencies?: string[] // Other rules this depends on
  conflicts?: string[] // Rules that can't be active with this one
  priority?: number // For conflict resolution
  tags?: string[]
  version: string
  author?: string
}

export interface GameConfiguration {
  gameId: string
  name: string
  description: string
  baseGame: string
  activeRules: string[]
  ruleOverrides: Record<string, Record<string, any>> // ruleId -> parameter overrides
  customAssets?: CustomAsset[]
  metadata: {
    version: string
    author: string
    created: string
    modified: string
    tags: string[]
    featured?: boolean
  }
}

export interface CustomAsset {
  id: string
  name: string
  type: 'sprite' | 'sound' | 'animation' | 'tileset'
  data: string // Base64 or URL
  metadata?: Record<string, any>
}

export interface RuleValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
  suggestions?: string[]
}

export interface GameModification {
  id: string
  name: string
  description: string
  baseGameId: string
  rules: ModifiedRule[]
  assets?: CustomAsset[]
  levels?: any[] // Game-specific level data
  metadata: {
    author: string
    version: string
    created: string
    downloads: number
    rating: number
    tags: string[]
  }
}

export interface ModifiedRule {
  ruleId: string
  enabled: boolean
  parameters: Record<string, any>
}

// Rule Engine Class
export class GameRuleEngine {
  private rules: Map<string, GameRule> = new Map()
  private configurations: Map<string, GameConfiguration> = new Map()
  private validationCache: Map<string, RuleValidationResult> = new Map()
  private listeners: Map<string, Set<(config: GameConfiguration) => void>> = new Map()

  constructor() {
    this.initializeDefaultRules()
  }

  // Rule Management
  registerRule(rule: GameRule): void {
    this.rules.set(rule.id, rule)
    this.invalidateValidationCache()
  }

  getRule(ruleId: string): GameRule | undefined {
    return this.rules.get(ruleId)
  }

  getRulesForGame(gameType: string): GameRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.gameType === gameType)
  }

  getRulesByCategory(gameType: string, category: string): GameRule[] {
    return this.getRulesForGame(gameType).filter(rule => rule.category === category)
  }

  // Configuration Management
  createConfiguration(baseGame: string, name: string, description: string): GameConfiguration {
    const config: GameConfiguration = {
      gameId: `config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      baseGame,
      activeRules: this.getDefaultRulesForGame(baseGame),
      ruleOverrides: {},
      customAssets: [],
      metadata: {
        version: '1.0.0',
        author: 'User',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        tags: []
      }
    }

    this.configurations.set(config.gameId, config)
    return config
  }

  getConfiguration(configId: string): GameConfiguration | undefined {
    return this.configurations.get(configId)
  }

  updateConfiguration(configId: string, updates: Partial<GameConfiguration>): void {
    const config = this.configurations.get(configId)
    if (!config) return

    Object.assign(config, updates)
    config.metadata.modified = new Date().toISOString()
    
    this.configurations.set(configId, config)
    this.notifyConfigurationChange(configId, config)
  }

  // Rule Modification
  enableRule(configId: string, ruleId: string): void {
    const config = this.configurations.get(configId)
    if (!config) return

    if (!config.activeRules.includes(ruleId)) {
      config.activeRules.push(ruleId)
      this.updateConfiguration(configId, { activeRules: config.activeRules })
    }
  }

  disableRule(configId: string, ruleId: string): void {
    const config = this.configurations.get(configId)
    if (!config) return

    config.activeRules = config.activeRules.filter(id => id !== ruleId)
    delete config.ruleOverrides[ruleId]
    this.updateConfiguration(configId, { 
      activeRules: config.activeRules,
      ruleOverrides: config.ruleOverrides
    })
  }

  setRuleParameter(configId: string, ruleId: string, paramKey: string, value: any): void {
    const config = this.configurations.get(configId)
    if (!config) return

    if (!config.ruleOverrides[ruleId]) {
      config.ruleOverrides[ruleId] = {}
    }
    
    config.ruleOverrides[ruleId][paramKey] = value
    this.updateConfiguration(configId, { ruleOverrides: config.ruleOverrides })
  }

  getRuleParameterValue(configId: string, ruleId: string, paramKey: string): any {
    const config = this.configurations.get(configId)
    const rule = this.rules.get(ruleId)
    
    if (!config || !rule) return undefined

    // Check for override first
    const override = config.ruleOverrides[ruleId]?.[paramKey]
    if (override !== undefined) return override

    // Fall back to rule default
    const param = rule.parameters.find(p => p.key === paramKey)
    return param?.defaultValue
  }

  // Validation
  validateConfiguration(configId: string): RuleValidationResult {
    const cacheKey = `config-${configId}`
    const cached = this.validationCache.get(cacheKey)
    if (cached) return cached

    const config = this.configurations.get(configId)
    if (!config) {
      return { valid: false, errors: ['Configuration not found'], warnings: [] }
    }

    const result = this.performValidation(config)
    this.validationCache.set(cacheKey, result)
    return result
  }

  private performValidation(config: GameConfiguration): RuleValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    // Check for rule conflicts
    const conflictMap = new Map<string, string[]>()
    
    for (const ruleId of config.activeRules) {
      const rule = this.rules.get(ruleId)
      if (!rule) {
        errors.push(`Unknown rule: ${ruleId}`)
        continue
      }

      // Check dependencies
      if (rule.dependencies) {
        for (const depId of rule.dependencies) {
          if (!config.activeRules.includes(depId)) {
            errors.push(`Rule '${rule.name}' requires '${this.rules.get(depId)?.name || depId}' to be enabled`)
          }
        }
      }

      // Check conflicts
      if (rule.conflicts) {
        for (const conflictId of rule.conflicts) {
          if (config.activeRules.includes(conflictId)) {
            const conflictRule = this.rules.get(conflictId)
            errors.push(`Rule '${rule.name}' conflicts with '${conflictRule?.name || conflictId}'`)
          }
        }
      }

      // Validate parameter values
      for (const param of rule.parameters) {
        const value = this.getRuleParameterValue(config.gameId, ruleId, param.key)
        const validation = this.validateParameter(param, value)
        if (!validation.valid) {
          errors.push(`Invalid parameter '${param.name}' in rule '${rule.name}': ${validation.error}`)
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions: errors.length === 0 ? suggestions : []
    }
  }

  private validateParameter(param: RuleParameter, value: any): { valid: boolean; error?: string } {
    if (param.constraints?.required && (value === undefined || value === null)) {
      return { valid: false, error: 'Required parameter is missing' }
    }

    if (value === undefined || value === null) return { valid: true }

    switch (param.type) {
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return { valid: false, error: 'Must be a number' }
        }
        if (param.constraints?.min !== undefined && value < param.constraints.min) {
          return { valid: false, error: `Must be at least ${param.constraints.min}` }
        }
        if (param.constraints?.max !== undefined && value > param.constraints.max) {
          return { valid: false, error: `Must be at most ${param.constraints.max}` }
        }
        break

      case 'boolean':
        if (typeof value !== 'boolean') {
          return { valid: false, error: 'Must be true or false' }
        }
        break

      case 'select':
        if (param.constraints?.options) {
          const validValues = param.constraints.options.map(opt => opt.value)
          if (!validValues.includes(value)) {
            return { valid: false, error: 'Invalid option selected' }
          }
        }
        break

      case 'text':
        if (typeof value !== 'string') {
          return { valid: false, error: 'Must be text' }
        }
        break
    }

    return { valid: true }
  }

  // Event System
  onConfigurationChange(configId: string, callback: (config: GameConfiguration) => void): void {
    if (!this.listeners.has(configId)) {
      this.listeners.set(configId, new Set())
    }
    this.listeners.get(configId)!.add(callback)
  }

  private notifyConfigurationChange(configId: string, config: GameConfiguration): void {
    const listeners = this.listeners.get(configId)
    if (listeners) {
      listeners.forEach(callback => callback(config))
    }
  }

  // Utility Methods
  private getDefaultRulesForGame(gameType: string): string[] {
    return Array.from(this.rules.values())
      .filter(rule => rule.gameType === gameType && rule.tags?.includes('default'))
      .map(rule => rule.id)
  }

  private initializeDefaultRules(): void {
    // Will be populated with game-specific rules
  }

  private invalidateValidationCache(): void {
    this.validationCache.clear()
  }

  // Export/Import
  exportConfiguration(configId: string): string {
    const config = this.configurations.get(configId)
    if (!config) throw new Error('Configuration not found')

    return JSON.stringify(config, null, 2)
  }

  importConfiguration(data: string): string {
    try {
      const config = JSON.parse(data) as GameConfiguration
      config.gameId = `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      config.metadata.created = new Date().toISOString()
      config.metadata.modified = new Date().toISOString()
      
      this.configurations.set(config.gameId, config)
      return config.gameId
    } catch (error) {
      throw new Error('Invalid configuration data')
    }
  }

  // Community Features
  createGameModification(configId: string): GameModification {
    const config = this.configurations.get(configId)
    if (!config) throw new Error('Configuration not found')

    const modification: GameModification = {
      id: `mod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: config.name,
      description: config.description,
      baseGameId: config.baseGame,
      rules: config.activeRules.map(ruleId => ({
        ruleId,
        enabled: true,
        parameters: config.ruleOverrides[ruleId] || {}
      })),
      assets: config.customAssets,
      metadata: {
        author: config.metadata.author,
        version: config.metadata.version,
        created: new Date().toISOString(),
        downloads: 0,
        rating: 0,
        tags: config.metadata.tags
      }
    }

    return modification
  }

  applyGameModification(modification: GameModification): string {
    const config = this.createConfiguration(
      modification.baseGameId,
      modification.name,
      modification.description
    )

    // Apply rule modifications
    config.activeRules = modification.rules
      .filter(rule => rule.enabled)
      .map(rule => rule.ruleId)

    config.ruleOverrides = {}
    modification.rules.forEach(rule => {
      if (Object.keys(rule.parameters).length > 0) {
        config.ruleOverrides[rule.ruleId] = rule.parameters
      }
    })

    // Apply custom assets
    if (modification.assets) {
      config.customAssets = [...modification.assets]
    }

    // Update metadata
    config.metadata = {
      ...config.metadata,
      author: modification.metadata.author,
      version: modification.metadata.version,
      tags: modification.metadata.tags
    }

    this.configurations.set(config.gameId, config)
    return config.gameId
  }
}

// Global instance
export const gameRuleEngine = new GameRuleEngine()
