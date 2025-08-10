"use client"

import React, { useState, useCallback } from 'react'
import { useGameRuleContext, useGameRules, useRuleParameters, useRuleEnabled, useRuleValidation } from '@/hooks/use-game-rules'
import { GameRule, RuleParameter } from '@/lib/game-rule-engine'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { gameRuleEngine } from '@/lib/game-rule-engine'

interface RuleEditorProps {
  isOpen: boolean
  onClose: () => void
  gameComponent: React.ReactNode
}

export function RuleEditor({ isOpen, onClose, gameComponent }: RuleEditorProps) {
  const { configId, configuration, isModificationMode, setModificationMode } = useGameRuleContext()
  const allRules = useGameRules()
  const validation = useRuleValidation()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set())

  if (!isOpen || !configId || !configuration) return null

  // Group rules by category
  const rulesByCategory = allRules.reduce((acc, rule) => {
    if (!acc[rule.category]) acc[rule.category] = []
    acc[rule.category].push(rule)
    return acc
  }, {} as Record<string, GameRule[]>)

  const categories = ['all', ...Object.keys(rulesByCategory)]

  // Filter rules
  const filteredRules = allRules.filter(rule => {
    const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleRuleExpansion = (ruleId: string) => {
    const newExpanded = new Set(expandedRules)
    if (newExpanded.has(ruleId)) {
      newExpanded.delete(ruleId)
    } else {
      newExpanded.add(ruleId)
    }
    setExpandedRules(newExpanded)
  }

  const exportConfiguration = () => {
    try {
      const configData = gameRuleEngine.exportConfiguration(configId)
      const blob = new Blob([configData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${configuration.name.replace(/\s+/g, '-').toLowerCase()}-rules.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export configuration:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex">
      {/* Game Preview Panel */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-300 dark:border-gray-600">
        <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="font-semibold">Live Game Preview</span>
            <Badge variant="secondary">Real-time</Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModificationMode(!isModificationMode)}
            >
              {isModificationMode ? '🔧 Editing Mode' : '🎮 Play Mode'}
            </Button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          {gameComponent}
        </div>
      </div>

      {/* Rule Editor Panel */}
      <div className="w-96 bg-white dark:bg-gray-800 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold">Rule Editor</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {configuration.name}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icons.x className="w-5 h-5" />
          </Button>
        </div>

        {/* Validation Status */}
        {validation && !validation.valid && (
          <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Icons.alertTriangle className="w-4 h-4 text-red-500" />
              <span className="font-semibold text-red-700 dark:text-red-400">Configuration Issues</span>
            </div>
            <ul className="text-sm text-red-600 dark:text-red-300 space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Search and Filter */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="space-y-3">
            <div className="relative">
              <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category} className="capitalize">
                    {category === 'all' ? 'All Categories' : category.replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rules List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {filteredRules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Icons.search className="w-8 h-8 mx-auto mb-2" />
                <p>No rules found</p>
              </div>
            ) : (
              filteredRules.map(rule => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  isExpanded={expandedRules.has(rule.id)}
                  onToggleExpansion={() => toggleRuleExpansion(rule.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {configuration.activeRules.length} rules active
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={exportConfiguration}>
                <Icons.download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface RuleCardProps {
  rule: GameRule
  isExpanded: boolean
  onToggleExpansion: () => void
}

function RuleCard({ rule, isExpanded, onToggleExpansion }: RuleCardProps) {
  const [isEnabled, setIsEnabled] = useRuleEnabled(rule.id)
  const ruleParams = useRuleParameters(rule.id)

  return (
    <Card className={cn(
      "transition-all duration-200",
      isEnabled && "ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <CardTitle className="text-lg">{rule.name}</CardTitle>
              <Badge variant={isEnabled ? "default" : "secondary"} className="text-xs">
                {rule.category.replace('-', ' ')}
              </Badge>
            </div>
            <CardDescription>{rule.description}</CardDescription>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
              size="sm"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpansion}
              className="p-1"
            >
              {isExpanded ? (
                <Icons.chevronUp className="w-4 h-4" />
              ) : (
                <Icons.chevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && isEnabled && rule.parameters.length > 0 && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {rule.parameters.map(param => (
              <RuleParameterControl key={param.key} ruleId={rule.id} parameter={param} />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

interface RuleParameterControlProps {
  ruleId: string
  parameter: RuleParameter
}

function RuleParameterControl({ ruleId, parameter }: RuleParameterControlProps) {
  const { configId } = useGameRuleContext()
  const currentValue = gameRuleEngine.getRuleParameterValue(configId!, ruleId, parameter.key) ?? parameter.defaultValue

  const handleValueChange = useCallback((newValue: any) => {
    if (configId) {
      gameRuleEngine.setRuleParameter(configId, ruleId, parameter.key, newValue)
    }
  }, [configId, ruleId, parameter.key])

  const renderControl = () => {
    switch (parameter.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">{parameter.name}</Label>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {parameter.description}
              </p>
            </div>
            <Switch
              checked={currentValue}
              onCheckedChange={handleValueChange}
            />
          </div>
        )

      case 'number':
        const hasSlider = parameter.constraints?.min !== undefined && 
                         parameter.constraints?.max !== undefined
        
        if (hasSlider) {
          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{parameter.name}</Label>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentValue}
                </span>
              </div>
              <Slider
                value={[Number(currentValue)]}
                onValueChange={([value]) => handleValueChange(value)}
                min={parameter.constraints.min}
                max={parameter.constraints.max}
                step={parameter.constraints.step || 1}
                className="w-full"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {parameter.description}
              </p>
            </div>
          )
        } else {
          return (
            <div className="space-y-2">
              <Label className="text-sm font-medium">{parameter.name}</Label>
              <Input
                type="number"
                value={currentValue}
                onChange={(e) => handleValueChange(Number(e.target.value))}
                min={parameter.constraints?.min}
                max={parameter.constraints?.max}
                step={parameter.constraints?.step || 1}
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {parameter.description}
              </p>
            </div>
          )
        }

      case 'select':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{parameter.name}</Label>
            <Select value={currentValue} onValueChange={handleValueChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {parameter.constraints?.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {parameter.description}
            </p>
          </div>
        )

      case 'color':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{parameter.name}</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="color"
                value={currentValue}
                onChange={(e) => handleValueChange(e.target.value)}
                className="w-16 h-8 p-1 rounded cursor-pointer"
              />
              <Input
                type="text"
                value={currentValue}
                onChange={(e) => handleValueChange(e.target.value)}
                className="flex-1"
                placeholder="#ffffff"
              />
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {parameter.description}
            </p>
          </div>
        )

      case 'text':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{parameter.name}</Label>
            <Input
              type="text"
              value={currentValue}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={parameter.defaultValue}
            />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {parameter.description}
            </p>
          </div>
        )

      default:
        return (
          <div className="text-sm text-gray-500">
            Unsupported parameter type: {parameter.type}
          </div>
        )
    }
  }

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
      {renderControl()}
    </div>
  )
}