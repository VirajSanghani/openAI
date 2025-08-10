"use client"

import React, { useEffect, useState } from 'react'
import { useWindowManager } from '@/contexts/window-manager'
import { Window } from './window'
import { Taskbar } from './taskbar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { VisualBuilder } from '@/components/builder/visual-builder'

interface DesktopIcon {
  id: string
  name: string
  icon: string
  position: { x: number; y: number }
  type: 'app' | 'file' | 'folder'
  action?: () => void
}

const DEFAULT_DESKTOP_ICONS: DesktopIcon[] = [
  {
    id: 'visual-builder',
    name: 'Visual Builder',
    icon: '🎨',
    position: { x: 50, y: 50 },
    type: 'app'
  },
  {
    id: 'file-manager',
    name: 'File Manager',
    icon: '📁',
    position: { x: 50, y: 150 },
    type: 'app'
  },
  {
    id: 'app-store',
    name: 'App Store',
    icon: '📦',
    position: { x: 50, y: 250 },
    type: 'app'
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: '⚙️',
    position: { x: 50, y: 350 },
    type: 'app'
  }
]

export function Desktop() {
  const { state, openWindow, showDesktop } = useWindowManager()
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [desktopIcons] = useState<DesktopIcon[]>(DEFAULT_DESKTOP_ICONS)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleIconDoubleClick = (icon: DesktopIcon) => {
    if (icon.type === 'app') {
      // Check if window already exists
      const existingWindow = state.windows.find(w => w.appId === icon.id)
      
      if (existingWindow) {
        // Focus existing window if minimized
        if (existingWindow.minimized) {
          // restoreWindow would be called here
        }
      } else {
        // Create new window with proper app components
        const getAppComponent = (appId: string) => {
          switch (appId) {
            case 'visual-builder':
              return <VisualBuilder />
            case 'file-manager':
              return <div className="p-6"><h1 className="text-2xl font-bold">File Manager</h1><p>Manage your files and folders</p></div>
            case 'app-store':
              return <div className="p-6"><h1 className="text-2xl font-bold">App Store</h1><p>Browse and install applications</p></div>
            case 'settings':
              return <div className="p-6"><h1 className="text-2xl font-bold">System Settings</h1><p>Configure your system preferences</p></div>
            default:
              return <div className="p-6"><h1 className="text-2xl font-bold">{icon.name}</h1><p>Application content</p></div>
          }
        }

        openWindow({
          id: `${icon.id}-${Date.now()}`,
          title: icon.name,
          appId: icon.id,
          component: getAppComponent(icon.id),
          position: { x: 200, y: 150 },
          size: { width: 800, height: 600 },
          minimized: false,
          maximized: false,
          resizable: true,
          moveable: true,
          closeable: true,
          minimizable: true,
          maximizable: true
        })
      }
    }
    
    if (icon.action) {
      icon.action()
    }
  }

  const handleDesktopClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedIcon(null)
      showDesktop(true)
    }
  }

  const handleDesktopContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    // Future: Show desktop context menu
  }

  return (
    <div 
      className={cn(
        "fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
        "dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
        "transition-all duration-300"
      )}
      onClick={handleDesktopClick}
      onContextMenu={handleDesktopContextMenu}
    >
      {/* Desktop Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.3) 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Desktop Icons */}
      {desktopIcons.map((icon) => (
        <div
          key={icon.id}
          className={cn(
            "absolute w-16 h-20 flex flex-col items-center justify-center cursor-pointer",
            "hover:bg-white/20 dark:hover:bg-gray-800/20 rounded-lg transition-colors",
            "select-none group",
            selectedIcon === icon.id && "bg-blue-100/50 dark:bg-blue-900/20"
          )}
          style={{ left: icon.position.x, top: icon.position.y }}
          onClick={(e) => {
            e.stopPropagation()
            setSelectedIcon(icon.id)
          }}
          onDoubleClick={() => handleIconDoubleClick(icon)}
        >
          <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">
            {icon.icon}
          </div>
          <span className="text-xs text-center font-medium text-gray-700 dark:text-gray-300 leading-tight px-1">
            {icon.name}
          </span>
        </div>
      ))}

      {/* Desktop Widgets */}
      <div className="absolute top-6 right-6 text-right text-white drop-shadow-lg">
        <div className="text-4xl font-light mb-2">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-lg opacity-80">
          {currentTime.toLocaleDateString([], { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Welcome Message */}
      {state.windows.length === 0 && state.showDesktop && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="text-6xl mb-6">🌟</div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Welcome to Casual OS
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Your AI-powered desktop environment. Double-click an icon to get started or use the app launcher.
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
              onClick={() => {
                openWindow({
                  id: `visual-builder-${Date.now()}`,
                  title: 'Visual Builder',
                  appId: 'visual-builder',
                  component: <VisualBuilder />,
                  position: { x: 100, y: 50 },
                  size: { width: 1200, height: 800 },
                  minimized: false,
                  maximized: false,
                  resizable: true,
                  moveable: true,
                  closeable: true,
                  minimizable: true,
                  maximizable: true
                })
              }}
            >
              🎨 Open Visual Builder
            </Button>
          </div>
        </div>
      )}

      {/* Windows */}
      <div className="relative z-10">
        {state.windows.map((window) => (
          <Window key={window.id} window={window} />
        ))}
      </div>

      {/* Taskbar */}
      <Taskbar />
    </div>
  )
}