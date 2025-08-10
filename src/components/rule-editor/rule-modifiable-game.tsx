/**
 * Rule-Modifiable Game Wrapper
 * Provides "Modify Rules" functionality to any game
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { GameRuleProvider } from '@/hooks/use-game-rules'
import { VisualRuleEditor } from './visual-rule-editor'

interface RuleModifiableGameProps {
  gameComponent: React.ComponentType<any>
  gameType: string
  gameName: string
  children?: React.ReactNode
  className?: string
  defaultInModificationMode?: boolean
}

export function RuleModifiableGame({
  gameComponent: GameComponent,
  gameType,
  gameName,
  children,
  className,
  defaultInModificationMode = false
}: RuleModifiableGameProps) {
  const [isModificationMode, setIsModificationMode] = useState(defaultInModificationMode)

  if (isModificationMode) {
    return (
      <GameRuleProvider defaultGame={gameType}>
        <VisualRuleEditor
          gameComponent={(props: any) => (
            <RuleAwareGame gameType={gameType}>
              {(rules) => <GameComponent {...props} rules={rules} />}
            </RuleAwareGame>
          )}
          gameType={gameType}
          onClose={() => setIsModificationMode(false)}
        />
      </GameRuleProvider>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* Game Content */}
      <div className="relative">
        {children || (
          <GameRuleProvider defaultGame={gameType}>
            <RuleAwareGame gameType={gameType}>
              {(rules) => <GameComponent rules={rules} />}
            </RuleAwareGame>
          </GameRuleProvider>
        )}
      </div>

      {/* Modify Rules Button */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          onClick={() => setIsModificationMode(true)}
          className="bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 shadow-lg"
          size="sm"
        >
          <Icons.settings className="w-4 h-4 mr-2" />
          Modify Rules
        </Button>
      </div>

      {/* Game Info Overlay (Optional) */}
      <div className="absolute bottom-4 left-4 z-40">
        <div className="bg-black/50 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <Icons.gamepad2 className="w-4 h-4" />
            <span className="text-sm font-medium">{gameName}</span>
            <span className="text-xs opacity-75">• Rule-Enhanced</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Quick Rule Toggle Component (for simpler rule modifications)
interface QuickRuleToggleProps {
  gameType: string
  ruleId: string
  ruleName: string
  children: (enabled: boolean, toggle: (enabled: boolean) => void) => React.ReactNode
}

export function QuickRuleToggle({ gameType, ruleId, ruleName, children }: QuickRuleToggleProps) {
  return (
    <GameRuleProvider defaultGame={gameType}>
      <QuickRuleToggleCore ruleId={ruleId} ruleName={ruleName}>
        {children}
      </QuickRuleToggleCore>
    </GameRuleProvider>
  )
}

function QuickRuleToggleCore({ ruleId, ruleName, children }: Omit<QuickRuleToggleProps, 'gameType'>) {
  // This would use the useRuleEnabled hook
  const [enabled, setEnabled] = useState(false) // Placeholder
  
  return <>{children(enabled, setEnabled)}</>
}

// Rule-Aware Component Wrapper
interface RuleAwareComponentProps {
  gameType: string
  ruleId: string
  parameterKey: string
  children: (value: any) => React.ReactNode
}

export function RuleAwareComponent({ gameType, ruleId, parameterKey, children }: RuleAwareComponentProps) {
  return (
    <GameRuleProvider defaultGame={gameType}>
      <RuleAwareComponentCore ruleId={ruleId} parameterKey={parameterKey}>
        {children}
      </RuleAwareComponentCore>
    </GameRuleProvider>
  )
}

function RuleAwareComponentCore({ ruleId, parameterKey, children }: Omit<RuleAwareComponentProps, 'gameType'>) {
  // This would use the useRuleParameter hook
  const [value] = useState(null) // Placeholder
  
  return <>{children(value)}</>
}

// Game Rule Status Indicator
interface RuleStatusIndicatorProps {
  gameType: string
  className?: string
}

export function RuleStatusIndicator({ gameType, className }: RuleStatusIndicatorProps) {
  return (
    <GameRuleProvider defaultGame={gameType}>
      <div className={cn('flex items-center space-x-1 text-xs', className)}>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span>Rules Active</span>
      </div>
    </GameRuleProvider>
  )
}

// Enhanced Game Card with Rule Modification
interface RuleEnhancedGameCardProps {
  gameName: string
  gameType: string
  description: string
  gameComponent: React.ComponentType
  onPlay?: () => void
  onModifyRules?: () => void
  className?: string
}

export function RuleEnhancedGameCard({
  gameName,
  gameType,
  description,
  gameComponent,
  onPlay,
  onModifyRules,
  className
}: RuleEnhancedGameCardProps) {
  return (
    <div className={cn(
      'group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700',
      'hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200',
      'overflow-hidden', className
    )}>
      {/* Game Preview */}
      <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl opacity-20">🎮</div>
        </div>
        <div className="absolute top-2 right-2">
          <RuleStatusIndicator gameType={gameType} />
        </div>
      </div>

      {/* Game Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{gameName}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              onClick={onPlay}
              className="bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700"
            >
              <Icons.play className="w-4 h-4 mr-2" />
              Play
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onModifyRules}
            className="border-purple-200 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            <Icons.settings className="w-4 h-4 mr-1" />
            Rules
          </Button>
        </div>
      </div>

      {/* Rule Enhancement Badge */}
      <div className="absolute top-3 left-3">
        <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
          Rule-Enhanced
        </div>
      </div>
    </div>
  )
}

// Demo Component showing rule integration
interface RuleModificationDemoProps {
  gameType: string
  gameName: string
}

export function RuleModificationDemo({ gameType, gameName }: RuleModificationDemoProps) {
  const [showDemo, setShowDemo] = useState(false)

  if (!showDemo) {
    return (
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🎮</div>
        <h2 className="text-2xl font-bold mb-2">Rule Modification System</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Experience {gameName} with customizable rules and real-time modifications
        </p>
        <Button
          onClick={() => setShowDemo(true)}
          className="bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700"
          size="lg"
        >
          <Icons.zap className="w-5 h-5 mr-2" />
          Try Rule Modification
        </Button>
      </div>
    )
  }

  return (
    <div className="h-screen">
      <RuleModifiableGame
        gameComponent={() => (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-8xl mb-4">🎲</div>
              <h1 className="text-3xl font-bold mb-2">{gameName}</h1>
              <p className="text-gray-600">Game would render here with live rule modifications</p>
            </div>
          </div>
        )}
        gameType={gameType}
        gameName={gameName}
        defaultInModificationMode={true}
      />
    </div>
  )
}

export default RuleModifiableGame
