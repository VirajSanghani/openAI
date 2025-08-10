"use client"

import React, { useState } from 'react'
import { useWindowManager } from '@/contexts/window-manager'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { AppLauncher } from './app-launcher'


export function Taskbar() {
  const { state, focusWindow, minimizeWindow, restoreWindow, showDesktop } = useWindowManager()
  const [showAppLauncher, setShowAppLauncher] = useState(false)

  const handleWindowClick = (windowId: string) => {
    const window = state.windows.find(w => w.id === windowId)
    if (window) {
      if (window.minimized) {
        restoreWindow(windowId)
      } else if (window.focused) {
        minimizeWindow(windowId)
      } else {
        focusWindow(windowId)
      }
    }
  }


  return (
    <>
      {/* Enhanced App Launcher */}
      <AppLauncher 
        isOpen={showAppLauncher}
        onClose={() => setShowAppLauncher(false)}
      />

      {/* Taskbar */}
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 z-30">
        <div className="flex items-center h-full px-4">
          {/* Start Button */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-3 mr-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700",
              showAppLauncher && "from-blue-600 to-purple-700"
            )}
            onClick={() => setShowAppLauncher(!showAppLauncher)}
          >
            <Icons.grid3X3 className="h-4 w-4 mr-1" />
            Apps
          </Button>

          {/* Window Buttons */}
          <div className="flex items-center space-x-1 flex-1 min-w-0">
            {state.windows.map((window) => (
              <Button
                key={window.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 px-3 max-w-48 justify-start",
                  window.focused 
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800",
                  window.minimized && "opacity-60"
                )}
                onClick={() => handleWindowClick(window.id)}
              >
                <div className="w-4 h-4 mr-2 flex-shrink-0">
                  {window.appId && (
                    <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm" />
                  )}
                </div>
                <span className="truncate text-sm">{window.title}</span>
              </Button>
            ))}
          </div>

          {/* System Tray */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Show Desktop */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => showDesktop(!state.showDesktop)}
              title="Show Desktop"
            >
              <Icons.monitor className="h-4 w-4" />
            </Button>

            {/* System Time */}
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 px-2">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}