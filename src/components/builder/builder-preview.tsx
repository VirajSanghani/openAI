"use client"

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface PreviewProps {
  code: string
  elements: any[]
  className?: string
}

type DeviceSize = 'desktop' | 'tablet' | 'mobile'

const DEVICE_SIZES = {
  desktop: { width: '100%', height: '100%', scale: 1 },
  tablet: { width: '768px', height: '1024px', scale: 0.75 },
  mobile: { width: '375px', height: '812px', scale: 0.6 }
}

export function BuilderPreview({ code, elements, className }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [deviceSize, setDeviceSize] = useState<DeviceSize>('desktop')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const generatePreviewHTML = () => {
    // Convert elements to HTML
    const generateElementHTML = (element: any): string => {
      const { componentId, props, children } = element
      
      // Map component ID to actual HTML tag
      const tagMap: Record<string, string> = {
        container: 'div',
        row: 'div',
        column: 'div',
        grid: 'div',
        button: 'button',
        input: 'input',
        select: 'select',
        checkbox: 'input',
        heading: 'h2',
        paragraph: 'p',
        image: 'img',
        card: 'div',
        navbar: 'nav',
        link: 'a'
      }

      const tag = tagMap[componentId] || 'div'
      const styleStr = props.style ? Object.entries(props.style)
        .map(([key, value]) => {
          // Convert camelCase to kebab-case
          const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
          return `${kebabKey}: ${value}`
        })
        .join('; ') : ''

      // Self-closing tags
      if (['input', 'img'].includes(tag)) {
        const attributes = Object.entries(props)
          .filter(([key]) => key !== 'style' && key !== 'children')
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ')
        return `<${tag} ${attributes} style="${styleStr}" />`
      }

      // Tags with children
      const openTag = `<${tag} style="${styleStr}">`
      const closeTag = `</${tag}>`
      
      let content = ''
      if (typeof props.children === 'string') {
        content = props.children
      } else if (children && children.length > 0) {
        content = children.map(generateElementHTML).join('')
      }

      return `${openTag}${content}${closeTag}`
    }

    const bodyContent = elements.map(generateElementHTML).join('')

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Builder Preview</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }
        
        /* Responsive utilities */
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        /* Default styles for common elements */
        button {
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        button:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
        
        input, select {
            outline: none;
            transition: all 0.3s ease;
        }
        
        input:focus, select:focus {
            box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.3);
        }
        
        a {
            transition: all 0.3s ease;
        }
        
        a:hover {
            opacity: 0.8;
        }
        
        /* Animation classes */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .fade-in {
            animation: fadeIn 0.5s ease-out;
        }
        
        /* Grid system */
        .grid {
            display: grid;
        }
        
        .flex {
            display: flex;
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
            body {
                padding: 10px;
            }
            
            .grid {
                grid-template-columns: 1fr !important;
            }
            
            .flex {
                flex-direction: column !important;
            }
        }
    </style>
</head>
<body>
    <div class="preview-container fade-in">
        ${bodyContent}
    </div>
    
    <script>
        // Add interactivity
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Button clicked:', e.target.textContent);
                
                // Visual feedback
                e.target.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    e.target.style.transform = '';
                }, 100);
            });
        });
        
        // Form handling
        document.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', (e) => {
                console.log('Input changed:', e.target.value);
            });
        });
        
        // Link handling
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Link clicked:', e.target.href);
            });
        });
        
        // Add resize observer for responsive behavior
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                console.log('Container resized:', entry.contentRect.width);
            }
        });
        
        const container = document.querySelector('.preview-container');
        if (container) {
            resizeObserver.observe(container);
        }
    </script>
</body>
</html>`
  }

  const refreshPreview = () => {
    setIsRefreshing(true)
    
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document
      if (doc) {
        doc.open()
        doc.write(generatePreviewHTML())
        doc.close()
      }
    }
    
    setTimeout(() => setIsRefreshing(false), 500)
  }

  useEffect(() => {
    refreshPreview()
  }, [elements])

  const handleDeviceChange = (device: DeviceSize) => {
    setDeviceSize(device)
  }

  const deviceConfig = DEVICE_SIZES[deviceSize]

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Preview Controls */}
      <div className="bg-white border-b border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="font-semibold">Live Preview</h3>
            
            {/* Device Selector */}
            <div className="flex items-center space-x-2">
              <Button
                variant={deviceSize === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDeviceChange('desktop')}
              >
                <Icons.monitor className="w-4 h-4" />
              </Button>
              <Button
                variant={deviceSize === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDeviceChange('tablet')}
              >
                <Icons.tablet className="w-4 h-4" />
              </Button>
              <Button
                variant={deviceSize === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDeviceChange('mobile')}
              >
                <Icons.smartphone className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshPreview}
              disabled={isRefreshing}
            >
              <Icons.refresh className={cn(
                "w-4 h-4",
                isRefreshing && "animate-spin"
              )} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const iframe = iframeRef.current
                if (iframe?.contentWindow) {
                  const newWindow = window.open('', '_blank')
                  if (newWindow) {
                    newWindow.document.write(generatePreviewHTML())
                    newWindow.document.close()
                  }
                }
              }}
            >
              <Icons.externalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 bg-gray-100 p-4 flex items-center justify-center overflow-auto">
        <div 
          className={cn(
            "bg-white rounded-lg shadow-2xl transition-all duration-300",
            deviceSize === 'mobile' && "border-8 border-gray-800 rounded-3xl",
            deviceSize === 'tablet' && "border-8 border-gray-700 rounded-2xl"
          )}
          style={{
            width: deviceConfig.width,
            height: deviceConfig.height === '100%' ? 'calc(100% - 2rem)' : deviceConfig.height,
            transform: `scale(${deviceConfig.scale})`,
            transformOrigin: 'center center'
          }}
        >
          <iframe
            ref={iframeRef}
            className="w-full h-full rounded-lg"
            style={{
              border: 'none',
              borderRadius: deviceSize === 'mobile' ? '1rem' : '0.5rem'
            }}
            title="Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-gray-800 text-white px-3 py-1 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            Live Preview
          </span>
          <span>{elements.length} components</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>{deviceSize === 'desktop' ? '100%' : DEVICE_SIZES[deviceSize].width}</span>
          <span>Auto-refresh: ON</span>
        </div>
      </div>
    </div>
  )
}