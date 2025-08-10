"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label: string
}

interface CustomTheme {
  name: string
  primary: string
  primaryMint: string
  primaryViolet: string
  primarySunrise: string
  primaryRose: string
}

const defaultThemes: CustomTheme[] = [
  {
    name: "Casual Ocean",
    primary: "#5865f2",
    primaryMint: "#00d9ff",
    primaryViolet: "#7c3aed",
    primarySunrise: "#f59e0b",
    primaryRose: "#ef4444"
  },
  {
    name: "Forest Grove", 
    primary: "#22c55e",
    primaryMint: "#14b8a6",
    primaryViolet: "#8b5cf6",
    primarySunrise: "#f97316",
    primaryRose: "#ec4899"
  },
  {
    name: "Sunset Blaze",
    primary: "#f97316",
    primaryMint: "#06b6d4",
    primaryViolet: "#a855f7",
    primarySunrise: "#fbbf24",
    primaryRose: "#f43f5e"
  }
]

function ColorInput({ color, onChange, label }: ColorPickerProps) {
  return (
    <div className="flex flex-col space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg border-2 border-white/20 cursor-pointer bg-transparent"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1">
          <input
            type="text"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 text-sm glass-light rounded-lg border border-white/20 bg-background/50 backdrop-blur-sm"
            placeholder="#5865f2"
          />
        </div>
      </div>
    </div>
  )
}

export function ColorPicker() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<CustomTheme>({
    name: "Custom Theme",
    primary: "#5865f2",
    primaryMint: "#4ade80",
    primaryViolet: "#8b5cf6", 
    primarySunrise: "#fbbf24",
    primaryRose: "#f43f5e"
  })

  const [savedThemes, setSavedThemes] = useState<CustomTheme[]>([])

  useEffect(() => {
    // Load saved themes from localStorage
    const saved = localStorage.getItem('casual-os-themes')
    if (saved) {
      setSavedThemes(JSON.parse(saved))
    }
  }, [])

  const applyTheme = (theme: CustomTheme) => {
    // Convert hex colors to HSL for CSS variables
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h = 0, s = 0, l = (max + min) / 2

      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break
          case g: h = (b - r) / d + 2; break
          case b: h = (r - g) / d + 4; break
        }
        h /= 6
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
    }

    const root = document.documentElement
    root.style.setProperty('--primary', hexToHsl(theme.primary))
    root.style.setProperty('--primary-mint', hexToHsl(theme.primaryMint))
    root.style.setProperty('--primary-violet', hexToHsl(theme.primaryViolet))
    root.style.setProperty('--primary-sunrise', hexToHsl(theme.primarySunrise))
    root.style.setProperty('--primary-rose', hexToHsl(theme.primaryRose))
    
    // Save current theme to localStorage
    localStorage.setItem('casual-os-current-theme', JSON.stringify(theme))
    
    setCurrentTheme(theme)
    toast.success(`Applied "${theme.name}" theme`)
  }

  const saveTheme = () => {
    const newTheme = { ...currentTheme, name: `Custom Theme ${savedThemes.length + 1}` }
    const updated = [...savedThemes, newTheme]
    setSavedThemes(updated)
    localStorage.setItem('casual-os-themes', JSON.stringify(updated))
    toast.success('Theme saved successfully!')
  }

  const resetToDefault = () => {
    if (defaultThemes[0]) {
      applyTheme(defaultThemes[0])
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="glass" size="sm" className="gap-2">
          <div className="w-4 h-4 rounded-full" style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.primaryMint})` }} />
          <span>Customize Colors</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-96 p-0 glass-card border-0" 
        align="end"
        sideOffset={8}
      >
        <Card className="border-0 bg-transparent">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary-mint/20 flex items-center justify-center">
                <span className="text-2xl">🎨</span>
              </div>
              <div>
                <CardTitle className="text-lg">Theme Customization</CardTitle>
                <CardDescription>
                  Personalize your Casual OS experience
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Preset Themes */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Preset Themes</Label>
              <div className="grid grid-cols-3 gap-2">
                {defaultThemes.map((theme) => (
                  <Button
                    key={theme.name}
                    variant="ghost"
                    size="sm"
                    onClick={() => applyTheme(theme)}
                    className="h-auto p-2 flex flex-col items-center space-y-2 hover:bg-white/10"
                  >
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primary }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primaryMint }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primaryViolet }} />
                    </div>
                    <span className="text-xs">{theme.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Color Inputs */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Custom Colors</Label>
              
              <ColorInput
                label="Primary"
                color={currentTheme.primary}
                onChange={(color) => setCurrentTheme(prev => ({ ...prev, primary: color }))}
              />
              
              <ColorInput
                label="Mint"
                color={currentTheme.primaryMint}
                onChange={(color) => setCurrentTheme(prev => ({ ...prev, primaryMint: color }))}
              />
              
              <ColorInput
                label="Violet"
                color={currentTheme.primaryViolet}
                onChange={(color) => setCurrentTheme(prev => ({ ...prev, primaryViolet: color }))}
              />
              
              <ColorInput
                label="Sunrise"
                color={currentTheme.primarySunrise}
                onChange={(color) => setCurrentTheme(prev => ({ ...prev, primarySunrise: color }))}
              />
              
              <ColorInput
                label="Rose"
                color={currentTheme.primaryRose}
                onChange={(color) => setCurrentTheme(prev => ({ ...prev, primaryRose: color }))}
              />
            </div>

            {/* Preview */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="p-4 glass-light rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm gradient-text font-semibold">Casual OS</span>
                  <Badge className="bg-gradient-to-r from-primary to-primary-mint text-white">
                    Sample
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={() => applyTheme(currentTheme)} 
                variant="gradient" 
                className="w-full"
              >
                Apply Theme
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={saveTheme} variant="glass" size="sm">
                  Save Theme
                </Button>
                <Button onClick={resetToDefault} variant="glass" size="sm">
                  Reset Default
                </Button>
              </div>
            </div>

            {/* Saved Themes */}
            {savedThemes.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Saved Themes</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {savedThemes.map((theme, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => applyTheme(theme)}
                      className="w-full justify-between h-auto p-2"
                    >
                      <span className="text-sm">{theme.name}</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }} />
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primaryMint }} />
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primaryViolet }} />
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}