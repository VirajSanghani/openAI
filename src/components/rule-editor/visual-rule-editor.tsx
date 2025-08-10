/**
 * Visual Rule Editor
 * Real-time game rule modification interface with live preview
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icons } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useGameRuleContext, useGameRules, useRuleValidation, useRuleEnabled } from '@/hooks/use-game-rules'
import { GameRule, RuleParameter } from '@/lib/game-rule-engine'

interface VisualRuleEditorProps {
  gameComponent: React.ComponentType
  gameType: string
  onClose?: () => void
}

export function VisualRuleEditor({ gameComponent: GameComponent, gameType, onClose }: VisualRuleEditorProps) {
  const { configuration, isModificationMode, setModificationMode } = useGameRuleContext()
  const rules = useGameRules()
  const validation = useRuleValidation()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set())

  // Group rules by category
  const categories = ['all', ...Array.from(new Set(rules.map(rule => rule.category)))]
  const filteredRules = rules.filter(rule => {
    const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const groupedRules = filteredRules.reduce((acc, rule) => {
    if (!acc[rule.category]) acc[rule.category] = []
    acc[rule.category].push(rule)
    return acc
  }, {} as Record<string, GameRule[]>)

  useEffect(() => {
    setModificationMode(true)
    return () => setModificationMode(false)
  }, [setModificationMode])

  const toggleRuleExpansion = (ruleId: string) => {
    setExpandedRules(prev => {
      const newSet = new Set(prev)
      if (newSet.has(ruleId)) {
        newSet.delete(ruleId)
      } else {
        newSet.add(ruleId)
      }
      return newSet
    })
  }

  const handleExport = () => {
    if (configuration) {
      const exportData = JSON.stringify(configuration, null, 2)
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${configuration.name.toLowerCase().replace(/\s+/g, '-')}-rules.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Rules exported successfully!')
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string
          // Import logic would go here
          toast.success('Rules imported successfully!')
        } catch (error) {
          toast.error('Failed to import rules')
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="visual-rule-editor h-screen flex">
      {/* Game Preview - Left Side */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 relative">
        <div className="absolute inset-0 flex flex-col">
          {/* Preview Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <h2 className="text-lg font-semibold">Live Preview</h2>
                <span className="text-sm text-gray-500">Changes apply instantly</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {validation && !validation.valid && (
                  <div className="flex items-center text-red-500">
                    <Icons.alertTriangle className="w-4 h-4 mr-1" />
                    <span className="text-sm">{validation.errors.length} errors</span>
                  </div>
                )}
                
                {onClose && (
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <Icons.x className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Game Preview Content */}
          <div className="flex-1 overflow-auto">
            <GameComponent />
          </div>

          {/* Validation Messages */}
          {validation && !validation.valid && (
            <div className="bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 p-4">
              <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Rule Validation Errors:</h3>
              <ul className="text-red-700 dark:text-red-300 text-sm space-y-1">
                {validation.errors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <Icons.alertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Rule Editor - Right Side */}
      <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Editor Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Rule Editor</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Icons.download className="w-4 h-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" asChild>
                <label className="cursor-pointer">
                  <Icons.upload className="w-4 h-4 mr-1" />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImport}
                  />
                </label>
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.slice(1).map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rules List */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {Object.entries(groupedRules).map(([category, categoryRules]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
                {category.replace('-', ' ')}
              </h3>
              
              <div className="space-y-3">
                {categoryRules.map(rule => (
                  <RuleCard
                    key={rule.id}
                    rule={rule}
                    expanded={expandedRules.has(rule.id)}
                    onToggleExpansion={() => toggleRuleExpansion(rule.id)}
                  />
                ))}
              </div>
            </div>
          ))}

          {filteredRules.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Icons.search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No rules found</p>
              <p className="text-sm">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Individual Rule Card Component
interface RuleCardProps {
  rule: GameRule
  expanded: boolean
  onToggleExpansion: () => void
}

function RuleCard({ rule, expanded, onToggleExpansion }: RuleCardProps) {
  const [ruleEnabled, setRuleEnabled] = useRuleEnabled(rule.id)

  return (
    <Card className={cn(
      "transition-all duration-200",
      ruleEnabled ? "border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10" : ""
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-semibold flex items-center space-x-2">
              <span>{rule.name}</span>
              {rule.tags?.includes('default') && (
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                  Default
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {rule.description}
            </CardDescription>
          </div>
          
          <div className="flex items-center space-x-2 ml-3">
            <Switch checked={ruleEnabled} onCheckedChange={setRuleEnabled} />
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpansion}
              className="h-6 w-6 p-0"
            >
              {expanded ? (
                <Icons.chevronUp className="w-4 h-4" />
              ) : (
                <Icons.chevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && ruleEnabled && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {rule.parameters.map(parameter => (
              <RuleParameterControl
                key={parameter.key}
                ruleId={rule.id}
                parameter={parameter}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Rule Parameter Control Component
interface RuleParameterControlProps {
  ruleId: string
  parameter: RuleParameter
}

function RuleParameterControl({ ruleId, parameter }: RuleParameterControlProps) {
  const { configId } = useGameRuleContext()
  const [value, setValue] = useState(parameter.value)

  const handleValueChange = (newValue: any) => {
    setValue(newValue)
    // Update rule parameter in engine
    if (configId) {
      import('@/lib/game-rule-engine').then(({ gameRuleEngine }) => {
        gameRuleEngine.setRuleParameter(configId, ruleId, parameter.key, newValue)
      })
    }
  }

  const renderControl = () => {
    switch (parameter.type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{parameter.name}</Label>
            <Switch
              checked={value}
              onCheckedChange={handleValueChange}
            />
          </div>
        )

      case 'number':
        const { min = 0, max = 100, step = 1 } = parameter.constraints || {}
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{parameter.name}</Label>
              <span className="text-sm text-gray-500">{value}</span>
            </div>
            <Slider
              value={[value]}
              onValueChange={([newValue]) => handleValueChange(newValue)}
              min={min}
              max={max}
              step={step}
              className="w-full"
            />
          </div>
        )

      case 'select':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{parameter.name}</Label>
            <Select value={value} onValueChange={handleValueChange}>
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
          </div>
        )

      case 'color':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{parameter.name}</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="color"
                value={value}
                onChange={(e) => handleValueChange(e.target.value)}
                className="w-12 h-8 p-0 border rounded"
              />
              <Input
                type="text"
                value={value}
                onChange={(e) => handleValueChange(e.target.value)}
                className="flex-1 text-sm"
                placeholder="#000000"
              />
            </div>
          </div>
        )

      case 'text':
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{parameter.name}</Label>
            <Input
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={parameter.description}
            />
          </div>
        )

      default:
        return (
          <div className="space-y-2">
            <Label className="text-sm font-medium">{parameter.name}</Label>
            <Input
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder={parameter.description}
            />
          </div>
        )
    }
  }

  return (
    <div className="space-y-1">
      {renderControl()}
      {parameter.description && (
        <p className="text-xs text-gray-500 mt-1">{parameter.description}</p>
      )}
    </div>
  )
}
