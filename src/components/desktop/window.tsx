"use client"

import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useWindowManager, WindowState } from '@/contexts/window-manager'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

interface WindowProps {
  window: WindowState
}

export function Window({ window }: WindowProps) {
  const {
    closeWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    moveWindow,
    resizeWindow
  } = useWindowManager()

  const windowRef = useRef<HTMLDivElement>(null)
  const titleBarRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string>('')
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 })
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 })

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === titleBarRef.current || titleBarRef.current?.contains(e.target as Node)) {
      if (window.moveable !== false) {
        setIsDragging(true)
        setDragStart({
          x: e.clientX - window.position.x,
          y: e.clientY - window.position.y
        })
        focusWindow(window.id)
        e.preventDefault()
      }
    }
  }, [window.position, window.id, window.moveable, focusWindow])

  const handleResizeStart = useCallback((e: React.MouseEvent, direction: string) => {
    if (window.resizable !== false && !window.maximized) {
      setIsResizing(true)
      setResizeDirection(direction)
      setDragStart({ x: e.clientX, y: e.clientY })
      setInitialSize({ ...window.size })
      setInitialPosition({ ...window.position })
      focusWindow(window.id)
      e.preventDefault()
      e.stopPropagation()
    }
  }, [window.size, window.position, window.id, window.resizable, window.maximized, focusWindow])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && window.moveable !== false && !window.maximized) {
        const newX = Math.max(0, Math.min(e.clientX - dragStart.x, window.innerWidth - window.size.width))
        const newY = Math.max(0, Math.min(e.clientY - dragStart.y, window.innerHeight - 100))
        
        moveWindow(window.id, { x: newX, y: newY })
      }

      if (isResizing && window.resizable !== false) {
        const deltaX = e.clientX - dragStart.x
        const deltaY = e.clientY - dragStart.y

        let newWidth = initialSize.width
        let newHeight = initialSize.height
        let newX = initialPosition.x
        let newY = initialPosition.y

        if (resizeDirection.includes('right')) {
          newWidth = Math.max(300, initialSize.width + deltaX)
        }
        if (resizeDirection.includes('left')) {
          newWidth = Math.max(300, initialSize.width - deltaX)
          newX = initialPosition.x + (initialSize.width - newWidth)
        }
        if (resizeDirection.includes('bottom')) {
          newHeight = Math.max(200, initialSize.height + deltaY)
        }
        if (resizeDirection.includes('top')) {
          newHeight = Math.max(200, initialSize.height - deltaY)
          newY = initialPosition.y + (initialSize.height - newHeight)
        }

        resizeWindow(window.id, { width: newWidth, height: newHeight })
        if (newX !== initialPosition.x || newY !== initialPosition.y) {
          moveWindow(window.id, { x: newX, y: newY })
        }
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      setIsResizing(false)
      setResizeDirection('')
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none'
      document.body.style.cursor = isDragging ? 'move' : getResizeCursor(resizeDirection)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.userSelect = ''
        document.body.style.cursor = ''
      }
    }
  }, [isDragging, isResizing, resizeDirection, dragStart, initialSize, initialPosition, window, moveWindow, resizeWindow])

  const getResizeCursor = (direction: string) => {
    if (direction.includes('top') && direction.includes('left')) return 'nw-resize'
    if (direction.includes('top') && direction.includes('right')) return 'ne-resize'
    if (direction.includes('bottom') && direction.includes('left')) return 'sw-resize'
    if (direction.includes('bottom') && direction.includes('right')) return 'se-resize'
    if (direction.includes('top') || direction.includes('bottom')) return 'ns-resize'
    if (direction.includes('left') || direction.includes('right')) return 'ew-resize'
    return 'default'
  }

  const handleClose = () => closeWindow(window.id)
  const handleMinimize = () => minimizeWindow(window.id)
  const handleMaximize = () => {
    if (window.maximized) {
      restoreWindow(window.id)
    } else {
      maximizeWindow(window.id)
    }
  }

  const handleDoubleClick = () => {
    if (window.maximizable !== false) {
      handleMaximize()
    }
  }

  if (window.minimized) {
    return null
  }

  const windowStyle: React.CSSProperties = window.maximized
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: 'calc(100vh - 48px)', // Account for taskbar height
        zIndex: window.zIndex
      }
    : {
        position: 'fixed',
        left: window.position.x,
        top: window.position.y,
        width: window.size.width,
        height: window.size.height,
        zIndex: window.zIndex
      }

  return (
    <div
      ref={windowRef}
      style={windowStyle}
      className={cn(
        "bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden",
        "transition-all duration-200 ease-out",
        window.focused && "ring-2 ring-blue-500/20",
        window.maximized && "rounded-none"
      )}
      onClick={() => focusWindow(window.id)}
    >
      {/* Title Bar */}
      <div
        ref={titleBarRef}
        className={cn(
          "h-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700",
          "flex items-center justify-between px-3 cursor-move select-none",
          window.focused ? "bg-blue-50 dark:bg-blue-900/20" : ""
        )}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <div className="w-4 h-4 flex-shrink-0">
            {window.appId && (
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-sm" />
            )}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
            {window.title}
          </span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          {window.minimizable !== false && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation()
                handleMinimize()
              }}
            >
              <Icons.minus className="h-3 w-3" />
            </Button>
          )}
          
          {window.maximizable !== false && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation()
                handleMaximize()
              }}
            >
              {window.maximized ? (
                <Icons.minimize2 className="h-3 w-3" />
              ) : (
                <Icons.maximize2 className="h-3 w-3" />
              )}
            </Button>
          )}
          
          {window.closeable !== false && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
              onClick={(e) => {
                e.stopPropagation()
                handleClose()
              }}
            >
              <Icons.x className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Window Content */}
      <div className="h-[calc(100%-2.5rem)] overflow-auto bg-white dark:bg-gray-900">
        {window.component}
      </div>

      {/* Resize Handles */}
      {window.resizable !== false && !window.maximized && (
        <>
          {/* Corner handles */}
          <div
            className="absolute top-0 left-0 w-2 h-2 cursor-nw-resize"
            onMouseDown={(e) => handleResizeStart(e, 'top-left')}
          />
          <div
            className="absolute top-0 right-0 w-2 h-2 cursor-ne-resize"
            onMouseDown={(e) => handleResizeStart(e, 'top-right')}
          />
          <div
            className="absolute bottom-0 left-0 w-2 h-2 cursor-sw-resize"
            onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
          />
          <div
            className="absolute bottom-0 right-0 w-2 h-2 cursor-se-resize"
            onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
          />

          {/* Edge handles */}
          <div
            className="absolute top-0 left-2 right-2 h-1 cursor-ns-resize"
            onMouseDown={(e) => handleResizeStart(e, 'top')}
          />
          <div
            className="absolute bottom-0 left-2 right-2 h-1 cursor-ns-resize"
            onMouseDown={(e) => handleResizeStart(e, 'bottom')}
          />
          <div
            className="absolute left-0 top-2 bottom-2 w-1 cursor-ew-resize"
            onMouseDown={(e) => handleResizeStart(e, 'left')}
          />
          <div
            className="absolute right-0 top-2 bottom-2 w-1 cursor-ew-resize"
            onMouseDown={(e) => handleResizeStart(e, 'right')}
          />
        </>
      )}
    </div>
  )
}