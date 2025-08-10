"use client"

import React, { useState } from 'react'
import { useWindowManager } from '@/contexts/window-manager'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { AppRunner } from '@/components/apps/app-runner'
import { VisualBuilder } from '@/components/builder/visual-builder'
import { APP_TEMPLATES } from '@/lib/app-templates'

interface EnhancedApp {
  id: string
  name: string
  icon: string
  description: string
  category: 'productivity' | 'development' | 'entertainment' | 'system' | 'games'
  component?: React.ComponentType
  template?: any
  featured?: boolean
}

// Enhanced app collection including templates and built-in apps
const ENHANCED_APPS: EnhancedApp[] = [
  // Built-in System Apps
  {
    id: 'visual-builder',
    name: 'Visual Builder',
    icon: '🎨',
    description: 'Create beautiful interfaces with drag and drop',
    category: 'development',
    component: VisualBuilder,
    featured: true
  },
  {
    id: 'file-manager',
    name: 'File Manager',
    icon: '📁',
    description: 'Manage your files and folders',
    category: 'system'
  },
  {
    id: 'settings',
    name: 'System Settings',
    icon: '⚙️',
    description: 'Configure system preferences',
    category: 'system'
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: '⌨️',
    description: 'Command line interface',
    category: 'development'
  },

  // App Templates from our library
  ...APP_TEMPLATES.map(template => ({
    id: template.id,
    name: template.name,
    icon: getTemplateIcon(template.id, template.category),
    description: template.description,
    category: template.category === 'game' ? 'games' as const : 'productivity' as const,
    template: template,
    featured: ['todo-app', 'calculator', 'tic-tac-toe', 'chess-game'].includes(template.id)
  }))
]

function getTemplateIcon(id: string, category: string): string {
  // Game icons
  if (category === 'game') {
    switch (id) {
      case 'tic-tac-toe': return '🎯'
      case '2d-platformer': return '🎮'
      case 'sudoku-puzzle': return '🧩'
      case 'chess-game': return '♗'
      case 'match3-puzzle': return '💎'
      default: return '🎮'
    }
  }

  // Productivity app icons
  switch (id) {
    case 'todo-app': return '✅'
    case 'weather-app': return '🌤️'
    case 'note-taking-app': return '📝'
    case 'timer-app': return '⏲️'
    case 'expense-tracker': return '💰'
    case 'habit-tracker': return '📊'
    case 'password-manager': return '🔐'
    case 'url-shortener': return '🔗'
    case 'qr-code-generator': return '📱'
    case 'calculator': return '🧮'
    default: return '📱'
  }
}

interface AppLauncherProps {
  isOpen: boolean
  onClose: () => void
}

export function AppLauncher({ isOpen, onClose }: AppLauncherProps) {
  const { openWindow } = useWindowManager()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  if (!isOpen) return null

  const filteredApps = ENHANCED_APPS.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...Array.from(new Set(ENHANCED_APPS.map(app => app.category)))]
  const featuredApps = filteredApps.filter(app => app.featured)

  const handleAppClick = (app: EnhancedApp) => {
    let component: React.ReactNode

    if (app.component) {
      // Built-in component
      const AppComponent = app.component
      component = <AppComponent />
    } else if (app.template) {
      // Template-based app
      component = (
        <AppRunner 
          app={{
            id: app.template.id,
            name: app.template.name,
            description: app.template.description,
            slug: app.template.id,
            framework: app.template.framework,
            files: app.template.files
          }}
        />
      )
    } else {
      // Placeholder for system apps
      component = (
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">{app.icon}</div>
          <h1 className="text-2xl font-bold mb-2">{app.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{app.description}</p>
          <p className="text-sm text-gray-500">This app is coming soon!</p>
        </div>
      )
    }

    const baseSize = app.category === 'games' ? { width: 800, height: 600 } : { width: 900, height: 700 }
    const isVisualBuilder = app.id === 'visual-builder'
    
    openWindow({
      id: `${app.id}-${Date.now()}`,
      title: app.name,
      appId: app.id,
      component,
      position: { x: 100 + Math.random() * 200, y: 50 + Math.random() * 100 },
      size: isVisualBuilder ? { width: 1200, height: 800 } : baseSize,
      minimized: false,
      maximized: false,
      resizable: true,
      moveable: true,
      closeable: true,
      minimizable: true,
      maximizable: true
    })

    onClose()
  }

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">App Launcher</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icons.x className="h-5 w-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
              autoFocus
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category === 'all' ? 'All Apps' : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {/* Featured Apps */}
          {featuredApps.length > 0 && selectedCategory === 'all' && (
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                ⭐ Featured Apps
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {featuredApps.map(app => (
                  <AppCard key={app.id} app={app} onClick={() => handleAppClick(app)} featured />
                ))}
              </div>
            </div>
          )}

          {/* All Apps Grid */}
          <div className="p-6">
            {filteredApps.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No apps found
                </h3>
                <p className="text-gray-500">Try adjusting your search or category filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredApps.map(app => (
                  <AppCard key={app.id} app={app} onClick={() => handleAppClick(app)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface AppCardProps {
  app: EnhancedApp
  onClick: () => void
  featured?: boolean
}

function AppCard({ app, onClick, featured }: AppCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group p-4 rounded-xl border transition-all duration-200 text-left hover:shadow-lg",
        "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
        "hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20",
        featured && "ring-2 ring-blue-500/20"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
          {app.icon}
        </div>
        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {app.name}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 flex-1">
          {app.description}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full capitalize">
            {app.category}
          </span>
          {featured && (
            <div className="text-yellow-500">⭐</div>
          )}
        </div>
      </div>
    </button>
  )
}