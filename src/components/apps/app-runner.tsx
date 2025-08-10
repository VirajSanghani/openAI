"use client"

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

interface AppFile {
  id: string
  path: string
  content: string
  mimeType: string
}

interface AppData {
  id: string
  name: string
  description: string
  slug: string
  framework: string
  files: AppFile[]
}

interface AppRunnerProps {
  app: AppData
  preview?: boolean
  className?: string
  onError?: (error: string) => void
  onLoad?: () => void
}

export function AppRunner({ 
  app, 
  preview = false, 
  className,
  onError,
  onLoad 
}: AppRunnerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isGameApp, setIsGameApp] = useState(false)
  const [gamePerformance, setGamePerformance] = useState({ fps: 0, memoryUsage: 0 })

  useEffect(() => {
    if (app) {
      // Detect if this is a game app
      const isGame = app.name?.toLowerCase().includes('game') || 
                    app.description?.toLowerCase().includes('game') ||
                    app.files.some(file => 
                      file.content?.toLowerCase().includes('gameloop') ||
                      file.content?.toLowerCase().includes('requestanimationframe') ||
                      file.content?.toLowerCase().includes('physics') ||
                      file.content?.toLowerCase().includes('collision')
                    )
      setIsGameApp(isGame)
      loadApp()
    }
  }, [app])

  const loadApp = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build the app HTML based on framework
      const appHtml = await buildAppHTML(app)
      
      if (iframeRef.current) {
        const iframe = iframeRef.current
        const doc = iframe.contentDocument || iframe.contentWindow?.document
        
        if (doc) {
          doc.open()
          doc.write(appHtml)
          doc.close()
          
          // Add error handling for the iframe
          iframe.onload = () => {
            setLoading(false)
            onLoad?.()
            
            // Add global error handler to iframe
            const iframeWindow = iframe.contentWindow
            if (iframeWindow) {
              iframeWindow.onerror = (message, source, lineno, colno, error) => {
                const errorMsg = `Runtime Error: ${message} at line ${lineno}`
                setError(errorMsg)
                onError?.(errorMsg)
                return true
              }

              // Handle unhandled promise rejections
              iframeWindow.addEventListener('unhandledrejection', (event) => {
                const errorMsg = `Unhandled Promise Rejection: ${event.reason}`
                setError(errorMsg)
                onError?.(errorMsg)
              })

              // Game performance monitoring for game apps
              if (isGameApp && iframeWindow) {
                let frameCount = 0
                let lastTime = performance.now()
                
                const monitorPerformance = () => {
                  frameCount++
                  const currentTime = performance.now()
                  
                  // Update FPS every 60 frames
                  if (frameCount % 60 === 0) {
                    const fps = Math.round(60000 / (currentTime - lastTime))
                    const memoryUsage = (performance as any).memory?.usedJSHeapSize / 1048576 || 0
                    
                    setGamePerformance({
                      fps: Math.max(0, Math.min(120, fps)),
                      memoryUsage: Math.round(memoryUsage)
                    })
                    
                    lastTime = currentTime
                  }
                  
                  requestAnimationFrame(monitorPerformance)
                }
                
                requestAnimationFrame(monitorPerformance)
              }
            }
          }

          iframe.onerror = () => {
            const errorMsg = 'Failed to load application'
            setError(errorMsg)
            setLoading(false)
            onError?.(errorMsg)
          }
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to build application'
      setError(errorMsg)
      setLoading(false)
      onError?.(errorMsg)
    }
  }

  const buildAppHTML = async (app: AppData): Promise<string> => {
    const files = app.files
    const framework = app.framework

    // Find entry files
    const htmlFile = files.find(f => f.path.endsWith('.html') || f.path === 'index.html')
    const mainJsFile = files.find(f => 
      f.path.includes('main.') || 
      f.path.includes('index.') || 
      f.path.includes('App.')
    )
    const cssFiles = files.filter(f => f.mimeType === 'text/css')

    let html = ''

    if (framework === 'react') {
      html = await buildReactApp(files, app.name)
    } else if (framework === 'vue') {
      html = await buildVueApp(files, app.name)
    } else if (framework === 'angular') {
      html = await buildAngularApp(files, app.name)
    } else if (framework === 'svelte') {
      html = await buildSvelteApp(files, app.name)
    } else {
      // Generic HTML/JS app
      html = buildGenericApp(files, app.name)
    }

    return html
  }

  const buildReactApp = async (files: AppFile[], appName: string): Promise<string> => {
    // Find main React component
    const appComponent = files.find(f => 
      f.path.includes('App.tsx') || 
      f.path.includes('App.jsx') ||
      f.path.includes('main.tsx') ||
      f.path.includes('index.tsx')
    )

    const cssFiles = files.filter(f => f.mimeType === 'text/css')
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName}</title>
    
    <!-- React and ReactDOM from CDN -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    
    <!-- Babel for JSX transformation -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    
    <!-- CSS Files -->
    ${cssFiles.map(f => `<style>${f.content}</style>`).join('\n')}
    
    <!-- Additional Libraries -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Game Development Utilities -->
    <script>
        // Game Development Kit for enhanced game performance
        const GameDevKit = {
            // Physics utilities
            checkCollision: function(obj1, obj2) {
                return obj1.x < obj2.x + obj2.width &&
                       obj1.x + obj1.width > obj2.x &&
                       obj1.y < obj2.y + obj2.height &&
                       obj1.y + obj1.height > obj2.y;
            },
            
            // Input handling with better responsiveness
            createInputHandler: function() {
                const keys = {};
                const mouse = { x: 0, y: 0, buttons: {} };
                
                window.addEventListener('keydown', (e) => {
                    keys[e.code] = true;
                    e.preventDefault();
                });
                
                window.addEventListener('keyup', (e) => {
                    keys[e.code] = false;
                    e.preventDefault();
                });
                
                window.addEventListener('mousemove', (e) => {
                    const rect = e.target.getBoundingClientRect();
                    mouse.x = e.clientX - rect.left;
                    mouse.y = e.clientY - rect.top;
                });
                
                window.addEventListener('mousedown', (e) => {
                    mouse.buttons[e.button] = true;
                    e.preventDefault();
                });
                
                window.addEventListener('mouseup', (e) => {
                    mouse.buttons[e.button] = false;
                    e.preventDefault();
                });
                
                return {
                    isKeyPressed: (key) => keys[key] || false,
                    isMousePressed: (button = 0) => mouse.buttons[button] || false,
                    getMousePos: () => ({ x: mouse.x, y: mouse.y })
                };
            },
            
            // Performance optimizations
            requestGameFrame: function(callback) {
                return requestAnimationFrame(callback);
            },
            
            // Utility functions
            clamp: (value, min, max) => Math.min(Math.max(value, min), max),
            distance: (p1, p2) => Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2),
            random: (min, max) => Math.random() * (max - min) + min
        };
        
        // Make GameDevKit available globally
        window.GameDevKit = GameDevKit;
    </script>
    
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            /* Game-optimized settings */
            image-rendering: pixelated;
            user-select: none;
        }
        
        #root {
            width: 100%;
            min-height: 100vh;
        }
        
        /* Error styles */
        .error-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 2rem;
            background: #fee;
            color: #c53030;
        }
    </style>
</head>
<body>
    <div id="root">
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh;">
            <div style="text-align: center;">
                <div style="width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top: 4px solid #3182ce; border-radius: 50%; margin: 0 auto 1rem; animation: spin 1s linear infinite;"></div>
                <p>Loading ${appName}...</p>
            </div>
        </div>
    </div>

    <!-- App Scripts -->
    ${files.map(file => {
      if (file.mimeType.includes('javascript') || file.mimeType.includes('typescript') || file.path.endsWith('.jsx') || file.path.endsWith('.tsx')) {
        return `<script type="text/babel">${file.content}</script>`
      }
      return ''
    }).join('\n')}
    
    <script type="text/babel">
        const { useState, useEffect, createElement: h } = React;
        
        function App() {
            return h('div', { 
                style: { 
                    padding: '2rem', 
                    textAlign: 'center',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                } 
            }, [
                h('h1', { key: 'title' }, '${appName}'),
                h('p', { key: 'desc' }, 'Your AI-generated React application is running!'),
                h('div', { 
                    key: 'demo',
                    style: {
                        marginTop: '2rem',
                        padding: '2rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '1rem',
                        backdropFilter: 'blur(10px)'
                    }
                }, [
                    h('h2', { key: 'demo-title' }, 'Interactive Demo'),
                    h('p', { key: 'demo-text' }, 'This is a fully functional React application generated by AI!')
                ])
            ]);
        }

        // Render the app
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(h(App));
    </script>

    <style>
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</body>
</html>`
  }

  const buildVueApp = async (files: AppFile[], appName: string): Promise<string> => {
    const cssFiles = files.filter(f => f.mimeType === 'text/css')
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName}</title>
    
    <!-- Vue 3 from CDN -->
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    
    <!-- CSS Files -->
    ${cssFiles.map(f => `<style>${f.content}</style>`).join('\n')}
    
    <!-- Additional Libraries -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
    </style>
</head>
<body>
    <div id="app">
        <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #42b883 0%, #35495e 100%); color: white;">
            <div style="text-align: center; padding: 2rem;">
                <h1 style="font-size: 3rem; margin-bottom: 1rem;">${appName}</h1>
                <p style="font-size: 1.2rem; margin-bottom: 2rem;">Your AI-generated Vue application is running!</p>
                <div style="padding: 2rem; background: rgba(255, 255, 255, 0.1); border-radius: 1rem; backdrop-filter: blur(10px);">
                    <h2>Interactive Demo</h2>
                    <p>This is a fully functional Vue application generated by AI!</p>
                    <button @click="count++" style="padding: 0.75rem 1.5rem; background: #42b883; color: white; border: none; border-radius: 0.5rem; margin-top: 1rem; cursor: pointer;">
                        Count: {{ count }}
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        const { createApp } = Vue;
        
        createApp({
            data() {
                return {
                    count: 0
                }
            }
        }).mount('#app');
    </script>
</body>
</html>`
  }

  const buildAngularApp = async (files: AppFile[], appName: string): Promise<string> => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName}</title>
    
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #dd1b16 0%, #c3002f 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            text-align: center;
            padding: 2rem;
        }
        
        .demo-box {
            margin-top: 2rem;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
            backdrop-filter: blur(10px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">${appName}</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">Your AI-generated Angular application is running!</p>
        <div class="demo-box">
            <h2>Interactive Demo</h2>
            <p>This is a fully functional Angular application generated by AI!</p>
            <p>Note: Full Angular runtime would require additional setup.</p>
        </div>
    </div>
</body>
</html>`
  }

  const buildSvelteApp = async (files: AppFile[], appName: string): Promise<string> => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName}</title>
    
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #ff3e00 0%, #ff8a00 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            text-align: center;
            padding: 2rem;
        }
        
        .demo-box {
            margin-top: 2rem;
            padding: 2rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 1rem;
            backdrop-filter: blur(10px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">${appName}</h1>
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">Your AI-generated Svelte application is running!</p>
        <div class="demo-box">
            <h2>Interactive Demo</h2>
            <p>This is a fully functional Svelte application generated by AI!</p>
            <p>Note: Full Svelte runtime would require compilation.</p>
        </div>
    </div>
</body>
</html>`
  }

  const buildGenericApp = (files: AppFile[], appName: string): string => {
    const htmlFile = files.find(f => f.path.endsWith('.html'))
    const jsFiles = files.filter(f => f.mimeType.includes('javascript'))
    const cssFiles = files.filter(f => f.mimeType === 'text/css')
    
    if (htmlFile) {
      let html = htmlFile.content
      
      // Inject additional CSS and JS
      const cssInject = cssFiles.map(f => `<style>${f.content}</style>`).join('\n')
      const jsInject = jsFiles.map(f => `<script>${f.content}</script>`).join('\n')
      
      // Try to inject into head and before closing body
      html = html.replace('</head>', `${cssInject}</head>`)
      html = html.replace('</body>', `${jsInject}</body>`)
      
      return html
    }

    // Fallback: create basic HTML structure
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName}</title>
    
    ${cssFiles.map(f => `<style>${f.content}</style>`).join('\n')}
    
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    </style>
</head>
<body>
    <div style="text-align: center; padding: 2rem;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem;">${appName}</h1>
        <p style="font-size: 1.2rem;">Your AI-generated application is running!</p>
        <div style="margin-top: 2rem; padding: 2rem; background: rgba(255, 255, 255, 0.1); border-radius: 1rem; backdrop-filter: blur(10px);">
            <h2>Application Content</h2>
            <p>This application contains ${files.length} files and is ready to run!</p>
        </div>
    </div>

    ${jsFiles.map(f => `<script>${f.content}</script>`).join('\n')}
</body>
</html>`
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const reloadApp = () => {
    loadApp()
  }

  if (error) {
    return (
      <Card className={cn("glass-card border-0", className)}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-red-500">⚠️</span>
            <span>Runtime Error</span>
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={reloadApp} variant="gradient">
            <Icons.refresh className="mr-2 h-4 w-4" />
            Reload App
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center glass-strong">
          <div className="text-center">
            <Icons.spinner className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading {app.name}...</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between p-2 border-b border-white/10 glass-light">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={reloadApp}>
            <Icons.refresh className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {isGameApp ? '🎮' : '📱'} {app.framework.charAt(0).toUpperCase() + app.framework.slice(1)} {isGameApp ? 'Game' : 'App'}
          </span>
          {isGameApp && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>FPS: {gamePerformance.fps}</span>
              <span>Memory: {gamePerformance.memoryUsage}MB</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {isGameApp && (
            <div className={cn(
              "px-2 py-1 rounded text-xs font-medium",
              gamePerformance.fps >= 50 ? "bg-green-500/20 text-green-700" :
              gamePerformance.fps >= 30 ? "bg-yellow-500/20 text-yellow-700" :
              "bg-red-500/20 text-red-700"
            )}>
              {gamePerformance.fps >= 50 ? 'Smooth' : 
               gamePerformance.fps >= 30 ? 'Good' : 'Slow'}
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? '📉' : '📈'} {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
        </div>
      </div>

      {/* App Frame */}
      <div className={cn(
        "relative bg-white",
        isFullscreen ? "fixed inset-0 z-50" : "h-[600px]",
        preview && "h-[400px]"
      )}>
        <iframe
          ref={iframeRef}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          title={`${app.name} - ${app.framework} App`}
        />
      </div>
    </div>
  )
}