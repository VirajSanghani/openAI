/**
 * React Integration for Game Rule Engine
 * Provides hooks and components for hot-reloading game rules
 */

import { useState, useEffect, useCallback, useContext, createContext, ReactNode, useRef } from 'react'
import { gameRuleEngine, GameConfiguration, GameRule, RuleValidationResult } from '@/lib/game-rule-engine'

interface GameRuleContextType {
  configId: string | null
  configuration: GameConfiguration | null
  setConfiguration: (configId: string) => void
  createConfiguration: (baseGame: string, name: string, description: string) => string
  clearConfiguration: () => void
  isModificationMode: boolean
  setModificationMode: (enabled: boolean) => void
}

const GameRuleContext = createContext<GameRuleContextType | undefined>(undefined)

// Provider Component
interface GameRuleProviderProps {
  children: ReactNode
  defaultGame?: string
}

export function GameRuleProvider({ children, defaultGame }: GameRuleProviderProps) {
  const [configId, setConfigId] = useState<string | null>(null)
  const [configuration, setConfigurationState] = useState<GameConfiguration | null>(null)
  const [isModificationMode, setModificationMode] = useState(false)

  const setConfiguration = useCallback((newConfigId: string) => {
    const config = gameRuleEngine.getConfiguration(newConfigId)
    if (config) {
      setConfigId(newConfigId)
      setConfigurationState(config)
      
      // Subscribe to changes
      gameRuleEngine.onConfigurationChange(newConfigId, (updatedConfig) => {
        setConfigurationState({ ...updatedConfig })
      })
    }
  }, [])

  const createConfiguration = useCallback((baseGame: string, name: string, description: string) => {
    const config = gameRuleEngine.createConfiguration(baseGame, name, description)
    setConfiguration(config.gameId)
    return config.gameId
  }, [setConfiguration])

  const clearConfiguration = useCallback(() => {
    setConfigId(null)
    setConfigurationState(null)
    setModificationMode(false)
  }, [])

  // Initialize with default game if provided
  useEffect(() => {
    if (defaultGame && !configId) {
      const defaultConfigId = createConfiguration(defaultGame, `${defaultGame} Game`, `Custom ${defaultGame} configuration`)
      setConfiguration(defaultConfigId)
    }
  }, [defaultGame, configId, createConfiguration, setConfiguration])

  return (
    <GameRuleContext.Provider value={{
      configId,
      configuration,
      setConfiguration,
      createConfiguration,
      clearConfiguration,
      isModificationMode,
      setModificationMode
    }}>
      {children}
    </GameRuleContext.Provider>
  )
}

// Hook to access game rule context
export function useGameRuleContext() {
  const context = useContext(GameRuleContext)
  if (context === undefined) {
    throw new Error('useGameRuleContext must be used within a GameRuleProvider')
  }
  return context
}

// Hook for accessing rule parameters with hot-reload
export function useRuleParameter<T = any>(ruleId: string, paramKey: string, defaultValue?: T): [T, (value: T) => void] {
  const { configId, configuration } = useGameRuleContext()
  const [value, setValue] = useState<T>(() => {
    if (configId) {
      return gameRuleEngine.getRuleParameterValue(configId, ruleId, paramKey) ?? defaultValue
    }
    return defaultValue
  })

  useEffect(() => {
    if (configId) {
      const newValue = gameRuleEngine.getRuleParameterValue(configId, ruleId, paramKey) ?? defaultValue
      setValue(newValue)
    }
  }, [configId, ruleId, paramKey, defaultValue, configuration])

  const setParameter = useCallback((newValue: T) => {
    if (configId) {
      gameRuleEngine.setRuleParameter(configId, ruleId, paramKey, newValue)
    }
  }, [configId, ruleId, paramKey])

  return [value, setParameter]
}

// Hook for accessing multiple rule parameters
export function useRuleParameters(ruleId: string): Record<string, any> {
  const { configId, configuration } = useGameRuleContext()
  const [parameters, setParameters] = useState<Record<string, any>>({})

  useEffect(() => {
    if (configId) {
      const rule = gameRuleEngine.getRule(ruleId)
      if (rule) {
        const newParams: Record<string, any> = {}
        rule.parameters.forEach(param => {
          newParams[param.key] = gameRuleEngine.getRuleParameterValue(configId, ruleId, param.key) ?? param.defaultValue
        })
        setParameters(newParams)
      }
    }
  }, [configId, ruleId, configuration])

  return parameters
}

// Hook for checking if a rule is enabled
export function useRuleEnabled(ruleId: string): [boolean, (enabled: boolean) => void] {
  const { configId, configuration } = useGameRuleContext()
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (configuration) {
      setEnabled(configuration.activeRules.includes(ruleId))
    }
  }, [ruleId, configuration])

  const setRuleEnabled = useCallback((newEnabled: boolean) => {
    if (configId) {
      if (newEnabled) {
        gameRuleEngine.enableRule(configId, ruleId)
      } else {
        gameRuleEngine.disableRule(configId, ruleId)
      }
    }
  }, [configId, ruleId])

  return [enabled, setRuleEnabled]
}

// Hook for getting all rules for current game
export function useGameRules(): GameRule[] {
  const { configuration } = useGameRuleContext()
  const [rules, setRules] = useState<GameRule[]>([])

  useEffect(() => {
    if (configuration) {
      const gameRules = gameRuleEngine.getRulesForGame(configuration.baseGame)
      setRules(gameRules)
    }
  }, [configuration])

  return rules
}

// Hook for rule validation
export function useRuleValidation(): RuleValidationResult | null {
  const { configId, configuration } = useGameRuleContext()
  const [validation, setValidation] = useState<RuleValidationResult | null>(null)

  useEffect(() => {
    if (configId) {
      const result = gameRuleEngine.validateConfiguration(configId)
      setValidation(result)
    }
  }, [configId, configuration])

  return validation
}

// Hook for game loop integration with rule changes
export function useGameLoop(
  gameUpdate: (deltaTime: number, rules: Record<string, any>) => void,
  enabled: boolean = true
) {
  const { configuration } = useGameRuleContext()
  const animationFrameRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  const rulesRef = useRef<Record<string, any>>({})

  // Update rules cache when configuration changes
  useEffect(() => {
    if (configuration) {
      const currentRules: Record<string, any> = {}
      
      configuration.activeRules.forEach(ruleId => {
        const rule = gameRuleEngine.getRule(ruleId)
        if (rule) {
          const ruleParams: Record<string, any> = {}
          rule.parameters.forEach(param => {
            ruleParams[param.key] = gameRuleEngine.getRuleParameterValue(
              configuration.gameId, 
              ruleId, 
              param.key
            ) ?? param.defaultValue
          })
          currentRules[ruleId] = ruleParams
        }
      })
      
      rulesRef.current = currentRules
    }
  }, [configuration])

  useEffect(() => {
    if (!enabled) return

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current
      lastTimeRef.current = currentTime

      gameUpdate(deltaTime, rulesRef.current)
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [enabled, gameUpdate])
}

// Hook for rule change notifications
export function useRuleChangeNotification(callback: (config: GameConfiguration) => void) {
  const { configId } = useGameRuleContext()

  useEffect(() => {
    if (configId) {
      gameRuleEngine.onConfigurationChange(configId, callback)
    }
  }, [configId, callback])
}

// Component for rule-aware game wrapper
interface RuleAwareGameProps {
  gameType: string
  children: (rules: Record<string, any>) => ReactNode
  autoStart?: boolean
}

export function RuleAwareGame({ gameType, children, autoStart = true }: RuleAwareGameProps) {
  const { configId, createConfiguration } = useGameRuleContext()
  const [rules, setRules] = useState<Record<string, any>>({})

  useEffect(() => {
    if (!configId && autoStart) {
      createConfiguration(gameType, `${gameType} Game`, `Custom ${gameType} game`)
    }
  }, [configId, gameType, autoStart, createConfiguration])

  useEffect(() => {
    if (configId) {
      const config = gameRuleEngine.getConfiguration(configId)
      if (config) {
        const currentRules: Record<string, any> = {}
        
        config.activeRules.forEach(ruleId => {
          const rule = gameRuleEngine.getRule(ruleId)
          if (rule) {
            const ruleParams: Record<string, any> = {}
            rule.parameters.forEach(param => {
              ruleParams[param.key] = gameRuleEngine.getRuleParameterValue(
                configId, 
                ruleId, 
                param.key
              ) ?? param.defaultValue
            })
            currentRules[ruleId] = ruleParams
          }
        })
        
        setRules(currentRules)
      }
    }
  }, [configId])

  return <>{children(rules)}</>
}

// Utility functions
export function exportGameConfiguration(): string | null {
  const { configId } = useGameRuleContext()
  if (configId) {
    return gameRuleEngine.exportConfiguration(configId)
  }
  return null
}

export function importGameConfiguration(data: string): boolean {
  const { setConfiguration } = useGameRuleContext()
  try {
    const newConfigId = gameRuleEngine.importConfiguration(data)
    setConfiguration(newConfigId)
    return true
  } catch (error) {
    console.error('Failed to import configuration:', error)
    return false
  }
}
