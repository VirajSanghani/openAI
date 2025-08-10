"use client"

import React, { createContext, useContext, useReducer, ReactNode, useCallback } from 'react'

export interface WindowState {
  id: string
  title: string
  appId?: string
  appData?: any
  component: ReactNode
  position: { x: number; y: number }
  size: { width: number; height: number }
  minimized: boolean
  maximized: boolean
  focused: boolean
  zIndex: number
  resizable?: boolean
  moveable?: boolean
  closeable?: boolean
  minimizable?: boolean
  maximizable?: boolean
}

interface WindowManagerState {
  windows: WindowState[]
  focusedWindowId: string | null
  highestZIndex: number
  showDesktop: boolean
}

type WindowManagerAction =
  | { type: 'OPEN_WINDOW'; payload: Omit<WindowState, 'zIndex' | 'focused'> }
  | { type: 'CLOSE_WINDOW'; payload: { id: string } }
  | { type: 'FOCUS_WINDOW'; payload: { id: string } }
  | { type: 'MINIMIZE_WINDOW'; payload: { id: string } }
  | { type: 'MAXIMIZE_WINDOW'; payload: { id: string } }
  | { type: 'RESTORE_WINDOW'; payload: { id: string } }
  | { type: 'MOVE_WINDOW'; payload: { id: string; position: { x: number; y: number } } }
  | { type: 'RESIZE_WINDOW'; payload: { id: string; size: { width: number; height: number } } }
  | { type: 'UPDATE_WINDOW'; payload: { id: string; updates: Partial<WindowState> } }
  | { type: 'SHOW_DESKTOP'; payload: { show: boolean } }
  | { type: 'CLOSE_ALL_WINDOWS' }

const initialState: WindowManagerState = {
  windows: [],
  focusedWindowId: null,
  highestZIndex: 1000,
  showDesktop: true
}

function windowManagerReducer(state: WindowManagerState, action: WindowManagerAction): WindowManagerState {
  switch (action.type) {
    case 'OPEN_WINDOW': {
      const newWindow: WindowState = {
        ...action.payload,
        zIndex: state.highestZIndex + 1,
        focused: true
      }

      return {
        ...state,
        windows: [
          ...state.windows.map(w => ({ ...w, focused: false })),
          newWindow
        ],
        focusedWindowId: newWindow.id,
        highestZIndex: state.highestZIndex + 1,
        showDesktop: false
      }
    }

    case 'CLOSE_WINDOW': {
      const remainingWindows = state.windows.filter(w => w.id !== action.payload.id)
      const wasFocused = state.focusedWindowId === action.payload.id
      
      let newFocusedId = state.focusedWindowId
      if (wasFocused && remainingWindows.length > 0) {
        // Focus the window with highest z-index
        const highestWindow = remainingWindows.reduce((prev, current) => 
          prev.zIndex > current.zIndex ? prev : current
        )
        newFocusedId = highestWindow.id
      } else if (remainingWindows.length === 0) {
        newFocusedId = null
      }

      return {
        ...state,
        windows: remainingWindows.map(w => ({
          ...w,
          focused: w.id === newFocusedId
        })),
        focusedWindowId: newFocusedId,
        showDesktop: remainingWindows.length === 0
      }
    }

    case 'FOCUS_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w => ({
          ...w,
          focused: w.id === action.payload.id,
          zIndex: w.id === action.payload.id ? state.highestZIndex + 1 : w.zIndex
        })),
        focusedWindowId: action.payload.id,
        highestZIndex: state.highestZIndex + 1,
        showDesktop: false
      }
    }

    case 'MINIMIZE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id
            ? { ...w, minimized: true, focused: false }
            : w
        ),
        focusedWindowId: state.focusedWindowId === action.payload.id ? null : state.focusedWindowId
      }
    }

    case 'MAXIMIZE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id
            ? { 
                ...w, 
                maximized: !w.maximized,
                focused: true,
                zIndex: state.highestZIndex + 1
              }
            : { ...w, focused: false }
        ),
        focusedWindowId: action.payload.id,
        highestZIndex: state.highestZIndex + 1
      }
    }

    case 'RESTORE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id
            ? { 
                ...w, 
                minimized: false, 
                maximized: false,
                focused: true,
                zIndex: state.highestZIndex + 1
              }
            : { ...w, focused: false }
        ),
        focusedWindowId: action.payload.id,
        highestZIndex: state.highestZIndex + 1
      }
    }

    case 'MOVE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id
            ? { ...w, position: action.payload.position }
            : w
        )
      }
    }

    case 'RESIZE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id
            ? { ...w, size: action.payload.size }
            : w
        )
      }
    }

    case 'UPDATE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id
            ? { ...w, ...action.payload.updates }
            : w
        )
      }
    }

    case 'SHOW_DESKTOP': {
      return {
        ...state,
        showDesktop: action.payload.show,
        windows: action.payload.show 
          ? state.windows.map(w => ({ ...w, focused: false }))
          : state.windows,
        focusedWindowId: action.payload.show ? null : state.focusedWindowId
      }
    }

    case 'CLOSE_ALL_WINDOWS': {
      return {
        ...state,
        windows: [],
        focusedWindowId: null,
        showDesktop: true
      }
    }

    default:
      return state
  }
}

interface WindowManagerContextType {
  state: WindowManagerState
  openWindow: (window: Omit<WindowState, 'zIndex' | 'focused'>) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  moveWindow: (id: string, position: { x: number; y: number }) => void
  resizeWindow: (id: string, size: { width: number; height: number }) => void
  updateWindow: (id: string, updates: Partial<WindowState>) => void
  showDesktop: (show: boolean) => void
  closeAllWindows: () => void
  getWindow: (id: string) => WindowState | undefined
}

const WindowManagerContext = createContext<WindowManagerContextType | undefined>(undefined)

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(windowManagerReducer, initialState)

  const openWindow = useCallback((window: Omit<WindowState, 'zIndex' | 'focused'>) => {
    dispatch({ type: 'OPEN_WINDOW', payload: window })
  }, [])

  const closeWindow = useCallback((id: string) => {
    dispatch({ type: 'CLOSE_WINDOW', payload: { id } })
  }, [])

  const focusWindow = useCallback((id: string) => {
    dispatch({ type: 'FOCUS_WINDOW', payload: { id } })
  }, [])

  const minimizeWindow = useCallback((id: string) => {
    dispatch({ type: 'MINIMIZE_WINDOW', payload: { id } })
  }, [])

  const maximizeWindow = useCallback((id: string) => {
    dispatch({ type: 'MAXIMIZE_WINDOW', payload: { id } })
  }, [])

  const restoreWindow = useCallback((id: string) => {
    dispatch({ type: 'RESTORE_WINDOW', payload: { id } })
  }, [])

  const moveWindow = useCallback((id: string, position: { x: number; y: number }) => {
    dispatch({ type: 'MOVE_WINDOW', payload: { id, position } })
  }, [])

  const resizeWindow = useCallback((id: string, size: { width: number; height: number }) => {
    dispatch({ type: 'RESIZE_WINDOW', payload: { id, size } })
  }, [])

  const updateWindow = useCallback((id: string, updates: Partial<WindowState>) => {
    dispatch({ type: 'UPDATE_WINDOW', payload: { id, updates } })
  }, [])

  const showDesktop = useCallback((show: boolean) => {
    dispatch({ type: 'SHOW_DESKTOP', payload: { show } })
  }, [])

  const closeAllWindows = useCallback(() => {
    dispatch({ type: 'CLOSE_ALL_WINDOWS' })
  }, [])

  const getWindow = useCallback((id: string) => {
    return state.windows.find(w => w.id === id)
  }, [state.windows])

  return (
    <WindowManagerContext.Provider value={{
      state,
      openWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      moveWindow,
      resizeWindow,
      updateWindow,
      showDesktop,
      closeAllWindows,
      getWindow
    }}>
      {children}
    </WindowManagerContext.Provider>
  )
}

export function useWindowManager() {
  const context = useContext(WindowManagerContext)
  if (context === undefined) {
    throw new Error('useWindowManager must be used within a WindowManagerProvider')
  }
  return context
}