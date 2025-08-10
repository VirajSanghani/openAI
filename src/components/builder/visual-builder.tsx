"use client"

import React, { useState, useCallback, useRef } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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
import { BuilderPreview } from './builder-preview'

// Component Types
export interface ComponentDefinition {
  id: string
  type: string
  category: 'layout' | 'form' | 'display' | 'navigation' | 'media'
  name: string
  icon: string
  defaultProps: Record<string, any>
  children?: ComponentDefinition[]
  acceptsChildren?: boolean
}

// Canvas Element (placed component)
export interface CanvasElement {
  id: string
  componentId: string
  props: Record<string, any>
  children?: CanvasElement[]
  parent?: string
}

// Component Palette
const COMPONENT_LIBRARY: ComponentDefinition[] = [
  // Layout Components
  {
    id: 'container',
    type: 'div',
    category: 'layout',
    name: 'Container',
    icon: '📦',
    defaultProps: {
      style: { padding: '20px', minHeight: '100px', border: '1px dashed #ccc' }
    },
    acceptsChildren: true
  },
  {
    id: 'row',
    type: 'div',
    category: 'layout',
    name: 'Row',
    icon: '↔️',
    defaultProps: {
      style: { display: 'flex', flexDirection: 'row', gap: '10px', minHeight: '50px' }
    },
    acceptsChildren: true
  },
  {
    id: 'column',
    type: 'div',
    category: 'layout',
    name: 'Column',
    icon: '↕️',
    defaultProps: {
      style: { display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '50px' }
    },
    acceptsChildren: true
  },
  {
    id: 'grid',
    type: 'div',
    category: 'layout',
    name: 'Grid',
    icon: '⚏',
    defaultProps: {
      style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', minHeight: '100px' }
    },
    acceptsChildren: true
  },

  // Form Components
  {
    id: 'button',
    type: 'button',
    category: 'form',
    name: 'Button',
    icon: '🔘',
    defaultProps: {
      children: 'Click Me',
      style: { padding: '10px 20px', borderRadius: '5px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }
    }
  },
  {
    id: 'input',
    type: 'input',
    category: 'form',
    name: 'Input',
    icon: '📝',
    defaultProps: {
      placeholder: 'Enter text...',
      style: { padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '100%' }
    }
  },
  {
    id: 'select',
    type: 'select',
    category: 'form',
    name: 'Dropdown',
    icon: '📋',
    defaultProps: {
      style: { padding: '8px', borderRadius: '4px', border: '1px solid #ddd', width: '100%' }
    },
    acceptsChildren: true
  },
  {
    id: 'checkbox',
    type: 'input',
    category: 'form',
    name: 'Checkbox',
    icon: '☑️',
    defaultProps: {
      type: 'checkbox',
      style: { width: '20px', height: '20px' }
    }
  },

  // Display Components
  {
    id: 'heading',
    type: 'h2',
    category: 'display',
    name: 'Heading',
    icon: '📑',
    defaultProps: {
      children: 'Heading Text',
      style: { fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }
    }
  },
  {
    id: 'paragraph',
    type: 'p',
    category: 'display',
    name: 'Paragraph',
    icon: '📄',
    defaultProps: {
      children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      style: { lineHeight: '1.6' }
    }
  },
  {
    id: 'image',
    type: 'img',
    category: 'media',
    name: 'Image',
    icon: '🖼️',
    defaultProps: {
      src: 'https://via.placeholder.com/300x200',
      alt: 'Placeholder',
      style: { maxWidth: '100%', height: 'auto', borderRadius: '8px' }
    }
  },
  {
    id: 'card',
    type: 'div',
    category: 'display',
    name: 'Card',
    icon: '🎴',
    defaultProps: {
      style: { padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', background: 'white' }
    },
    acceptsChildren: true
  },

  // Navigation Components
  {
    id: 'navbar',
    type: 'nav',
    category: 'navigation',
    name: 'Navbar',
    icon: '🧭',
    defaultProps: {
      style: { display: 'flex', padding: '15px', background: '#333', color: 'white' }
    },
    acceptsChildren: true
  },
  {
    id: 'link',
    type: 'a',
    category: 'navigation',
    name: 'Link',
    icon: '🔗',
    defaultProps: {
      href: '#',
      children: 'Link Text',
      style: { color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }
    }
  }
]

// Draggable Component from Palette
function DraggableComponent({ component }: { component: ComponentDefinition }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${component.id}`,
    data: { component, isNew: true }
  })

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "p-3 bg-white rounded-lg border-2 border-gray-200 cursor-move hover:border-blue-400 transition-colors",
        "flex items-center space-x-2",
        isDragging && "opacity-50"
      )}
    >
      <span className="text-2xl">{component.icon}</span>
      <span className="text-sm font-medium">{component.name}</span>
    </div>
  )
}

// Droppable Canvas Area
function DroppableCanvas({ 
  elements, 
  onElementClick,
  selectedElement 
}: { 
  elements: CanvasElement[]
  onElementClick: (element: CanvasElement) => void
  selectedElement: CanvasElement | null
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-root',
    data: { isCanvas: true }
  })

  const renderElement = (element: CanvasElement, depth: number = 0) => {
    const component = COMPONENT_LIBRARY.find(c => c.id === element.componentId)
    if (!component) return null

    const ElementTag = component.type as any
    const isSelected = selectedElement?.id === element.id

    const elementContent = (
      <ElementTag
        {...element.props}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
          onElementClick(element)
        }}
        className={cn(
          isSelected && "ring-2 ring-blue-500 ring-offset-2",
          "relative"
        )}
        style={{
          ...element.props.style,
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        {element.props.children}
        {element.children?.map(child => renderElement(child, depth + 1))}
        {component.acceptsChildren && element.children?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
            Drop components here
          </div>
        )}
      </ElementTag>
    )

    if (component.acceptsChildren) {
      return (
        <DroppableElement key={element.id} element={element}>
          {elementContent}
        </DroppableElement>
      )
    }

    return <div key={element.id}>{elementContent}</div>
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "w-full h-full min-h-[600px] bg-gray-50 rounded-lg p-4",
        isOver && "bg-blue-50 border-2 border-blue-300 border-dashed"
      )}
      onClick={() => onElementClick(null)}
    >
      {elements.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-400">
          <div className="text-center">
            <Icons.package className="w-16 h-16 mx-auto mb-4" />
            <p className="text-lg font-medium">Drag components here to start building</p>
            <p className="text-sm mt-2">Components will appear here as you add them</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {elements.map(element => renderElement(element))}
        </div>
      )}
    </div>
  )
}

// Droppable Element (for nested drops)
function DroppableElement({ element, children }: { element: CanvasElement, children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `element-${element.id}`,
    data: { element, isElement: true }
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        isOver && "bg-blue-100/50"
      )}
    >
      {children}
    </div>
  )
}

// Property Panel for editing selected element
function PropertyPanel({ 
  element, 
  onUpdate, 
  onDelete 
}: { 
  element: CanvasElement | null
  onUpdate: (id: string, props: Record<string, any>) => void
  onDelete: (id: string) => void
}) {
  if (!element) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Icons.settings className="w-12 h-12 mx-auto mb-2" />
        <p>Select an element to edit its properties</p>
      </div>
    )
  }

  const component = COMPONENT_LIBRARY.find(c => c.id === element.componentId)
  if (!component) return null

  const handleStyleChange = (key: string, value: any) => {
    onUpdate(element.id, {
      ...element.props,
      style: {
        ...element.props.style,
        [key]: value
      }
    })
  }

  const handlePropChange = (key: string, value: any) => {
    onUpdate(element.id, {
      ...element.props,
      [key]: value
    })
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center space-x-2">
          <span className="text-2xl">{component.icon}</span>
          <span>{component.name}</span>
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(element.id)}
          className="text-red-500 hover:text-red-700"
        >
          <Icons.trash className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Content Properties */}
        {element.props.children && typeof element.props.children === 'string' && (
          <div>
            <Label>Content</Label>
            <Input
              value={element.props.children}
              onChange={(e) => handlePropChange('children', e.target.value)}
              className="mt-1"
            />
          </div>
        )}

        {/* Special Properties */}
        {component.type === 'input' && (
          <div>
            <Label>Placeholder</Label>
            <Input
              value={element.props.placeholder || ''}
              onChange={(e) => handlePropChange('placeholder', e.target.value)}
              className="mt-1"
            />
          </div>
        )}

        {component.type === 'img' && (
          <div>
            <Label>Image URL</Label>
            <Input
              value={element.props.src || ''}
              onChange={(e) => handlePropChange('src', e.target.value)}
              className="mt-1"
            />
          </div>
        )}

        {component.type === 'a' && (
          <div>
            <Label>Link URL</Label>
            <Input
              value={element.props.href || ''}
              onChange={(e) => handlePropChange('href', e.target.value)}
              className="mt-1"
            />
          </div>
        )}

        {/* Style Properties */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-700">Styling</h4>
          
          <div>
            <Label>Background Color</Label>
            <Input
              type="color"
              value={element.props.style?.background || '#ffffff'}
              onChange={(e) => handleStyleChange('background', e.target.value)}
              className="mt-1 h-10"
            />
          </div>

          <div>
            <Label>Text Color</Label>
            <Input
              type="color"
              value={element.props.style?.color || '#000000'}
              onChange={(e) => handleStyleChange('color', e.target.value)}
              className="mt-1 h-10"
            />
          </div>

          <div>
            <Label>Padding (px)</Label>
            <Slider
              value={[parseInt(element.props.style?.padding) || 0]}
              onValueChange={([value]) => handleStyleChange('padding', `${value}px`)}
              max={50}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Border Radius (px)</Label>
            <Slider
              value={[parseInt(element.props.style?.borderRadius) || 0]}
              onValueChange={([value]) => handleStyleChange('borderRadius', `${value}px`)}
              max={30}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Font Size (px)</Label>
            <Slider
              value={[parseInt(element.props.style?.fontSize) || 16]}
              onValueChange={([value]) => handleStyleChange('fontSize', `${value}px`)}
              min={10}
              max={48}
              className="mt-1"
            />
          </div>

          {component.acceptsChildren && (
            <>
              <div>
                <Label>Layout Direction</Label>
                <Select
                  value={element.props.style?.flexDirection || 'row'}
                  onValueChange={(value) => {
                    handleStyleChange('display', 'flex')
                    handleStyleChange('flexDirection', value)
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="row">Horizontal</SelectItem>
                    <SelectItem value="column">Vertical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Gap (px)</Label>
                <Slider
                  value={[parseInt(element.props.style?.gap) || 0]}
                  onValueChange={([value]) => handleStyleChange('gap', `${value}px`)}
                  max={30}
                  className="mt-1"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Visual Builder Component
export function VisualBuilder() {
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([])
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [generatedCode, setGeneratedCode] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'design' | 'preview'>('design')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    // Adding new component from palette
    if (activeData?.isNew && activeData?.component) {
      const newElement: CanvasElement = {
        id: `element-${Date.now()}`,
        componentId: activeData.component.id,
        props: { ...activeData.component.defaultProps }
      }

      // Add to canvas root or nested element
      if (overData?.isCanvas) {
        setCanvasElements([...canvasElements, newElement])
      } else if (overData?.isElement && overData?.element) {
        const targetElement = overData.element
        const component = COMPONENT_LIBRARY.find(c => c.id === targetElement.componentId)
        
        if (component?.acceptsChildren) {
          addChildToElement(targetElement.id, newElement)
        }
      }
    }

    setActiveId(null)
  }

  const addChildToElement = (parentId: string, child: CanvasElement) => {
    const updateElements = (elements: CanvasElement[]): CanvasElement[] => {
      return elements.map(el => {
        if (el.id === parentId) {
          return {
            ...el,
            children: [...(el.children || []), child]
          }
        }
        if (el.children) {
          return {
            ...el,
            children: updateElements(el.children)
          }
        }
        return el
      })
    }

    setCanvasElements(updateElements(canvasElements))
  }

  const updateElement = (id: string, props: Record<string, any>) => {
    const updateElements = (elements: CanvasElement[]): CanvasElement[] => {
      return elements.map(el => {
        if (el.id === id) {
          return { ...el, props }
        }
        if (el.children) {
          return {
            ...el,
            children: updateElements(el.children)
          }
        }
        return el
      })
    }

    setCanvasElements(updateElements(canvasElements))
  }

  const deleteElement = (id: string) => {
    const removeElement = (elements: CanvasElement[]): CanvasElement[] => {
      return elements
        .filter(el => el.id !== id)
        .map(el => ({
          ...el,
          children: el.children ? removeElement(el.children) : undefined
        }))
    }

    setCanvasElements(removeElement(canvasElements))
    setSelectedElement(null)
  }

  const generateCode = () => {
    const generateElementCode = (element: CanvasElement, indent: number = 0): string => {
      const component = COMPONENT_LIBRARY.find(c => c.id === element.componentId)
      if (!component) return ''

      const indentStr = '  '.repeat(indent)
      const tag = component.type
      const props = element.props
      
      const styleStr = props.style ? 
        `style={${JSON.stringify(props.style)}}` : ''
      
      const otherProps = Object.entries(props)
        .filter(([key]) => key !== 'style' && key !== 'children')
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ')

      const openTag = `${indentStr}<${tag} ${otherProps} ${styleStr}>`.trim() + '>'
      const closeTag = `</${tag}>`

      if (element.children && element.children.length > 0) {
        const childrenCode = element.children
          .map(child => generateElementCode(child, indent + 1))
          .join('\n')
        return `${openTag}\n${childrenCode}\n${indentStr}${closeTag}`
      } else if (props.children) {
        return `${openTag}${props.children}${closeTag}`
      } else {
        return `${indentStr}<${tag} ${otherProps} ${styleStr} />`
      }
    }

    const code = canvasElements.map(el => generateElementCode(el)).join('\n\n')
    
    const fullCode = `import React from 'react'

export default function GeneratedComponent() {
  return (
    <div className="generated-component">
${code.split('\n').map(line => '      ' + line).join('\n')}
    </div>
  )
}`

    setGeneratedCode(fullCode)
    toast.success('Code generated successfully!')
  }

  const clearCanvas = () => {
    setCanvasElements([])
    setSelectedElement(null)
    toast.success('Canvas cleared')
  }

  const exportAsApp = () => {
    if (canvasElements.length === 0) {
      toast.error('Add components before exporting')
      return
    }

    generateCode()
    
    // Create app template structure
    const appTemplate = {
      name: 'Visual Builder App',
      description: 'Created with Visual Builder',
      framework: 'react',
      files: [
        {
          path: 'App.tsx',
          content: generatedCode || generateElementCode(),
          mimeType: 'text/typescript'
        },
        {
          path: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Builder App</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel" src="App.tsx"></script>
</body>
</html>`,
          mimeType: 'text/html'
        }
      ]
    }

    // Download as JSON file
    const blob = new Blob([JSON.stringify(appTemplate, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'visual-builder-app.json'
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('App exported successfully!')
  }

  const generateElementCode = () => {
    const generateElementCode = (element: CanvasElement, indent: number = 0): string => {
      const component = COMPONENT_LIBRARY.find(c => c.id === element.componentId)
      if (!component) return ''

      const indentStr = '  '.repeat(indent)
      const tag = component.type
      const props = element.props
      
      const styleStr = props.style ? 
        `style={${JSON.stringify(props.style)}}` : ''
      
      const otherProps = Object.entries(props)
        .filter(([key]) => key !== 'style' && key !== 'children')
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ')

      const openTag = `${indentStr}<${tag} ${otherProps} ${styleStr}>`.trim() + '>'
      const closeTag = `</${tag}>`

      if (element.children && element.children.length > 0) {
        const childrenCode = element.children
          .map(child => generateElementCode(child, indent + 1))
          .join('\n')
        return `${openTag}\n${childrenCode}\n${indentStr}${closeTag}`
      } else if (props.children) {
        return `${openTag}${props.children}${closeTag}`
      } else {
        return `${indentStr}<${tag} ${otherProps} ${styleStr} />`
      }
    }

    const code = canvasElements.map(el => generateElementCode(el)).join('\n\n')
    
    return `import React from 'react'

export default function GeneratedComponent() {
  return (
    <div className="generated-component">
${code.split('\n').map(line => '      ' + line).join('\n')}
    </div>
  )
}`
  }

  const filteredComponents = selectedCategory === 'all' 
    ? COMPONENT_LIBRARY 
    : COMPONENT_LIBRARY.filter(c => c.category === selectedCategory)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex bg-gray-100">
        {/* Component Palette */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold mb-4">Components</h2>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Components</SelectItem>
                <SelectItem value="layout">Layout</SelectItem>
                <SelectItem value="form">Form</SelectItem>
                <SelectItem value="display">Display</SelectItem>
                <SelectItem value="navigation">Navigation</SelectItem>
                <SelectItem value="media">Media</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="p-4 grid grid-cols-1 gap-3">
            {filteredComponents.map(component => (
              <DraggableComponent key={component.id} component={component} />
            ))}
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Visual Builder</h1>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={clearCanvas}>
                  <Icons.trash className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button variant="outline" size="sm" onClick={generateCode}>
                  <Icons.code className="w-4 h-4 mr-2" />
                  Generate Code
                </Button>
                <Button variant="outline" size="sm" onClick={exportAsApp}>
                  <Icons.download className="w-4 h-4 mr-2" />
                  Export App
                </Button>
                <Button 
                  variant={viewMode === 'preview' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'design' ? 'preview' : 'design')}
                >
                  <Icons.eye className="w-4 h-4 mr-2" />
                  {viewMode === 'preview' ? 'Design' : 'Preview'}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex">
            {viewMode === 'design' ? (
              <>
                {/* Canvas */}
                <div className="flex-1 p-6 overflow-auto">
                  <DroppableCanvas 
                    elements={canvasElements}
                    onElementClick={setSelectedElement}
                    selectedElement={selectedElement}
                  />
                </div>

                {/* Properties Panel */}
                <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
                  <Tabs defaultValue="properties" className="h-full">
                    <TabsList className="w-full rounded-none border-b">
                      <TabsTrigger value="properties" className="flex-1">Properties</TabsTrigger>
                      <TabsTrigger value="code" className="flex-1">Code</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="properties" className="mt-0">
                      <PropertyPanel
                        element={selectedElement}
                        onUpdate={updateElement}
                        onDelete={deleteElement}
                      />
                    </TabsContent>
                    
                    <TabsContent value="code" className="mt-0 p-4">
                      {generatedCode ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Generated Code</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(generatedCode)
                                toast.success('Code copied to clipboard!')
                              }}
                            >
                              <Icons.copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                            <code>{generatedCode}</code>
                          </pre>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">
                          <Icons.code className="w-12 h-12 mx-auto mb-2" />
                          <p>Click "Generate Code" to see the React code</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            ) : (
              /* Preview Mode */
              <BuilderPreview 
                code={generatedCode}
                elements={canvasElements}
                className="flex-1"
              />
            )}
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && activeId.startsWith('palette-') && (
          <div className="p-3 bg-white rounded-lg border-2 border-blue-400 shadow-lg opacity-80">
            <span className="text-2xl">
              {COMPONENT_LIBRARY.find(c => `palette-${c.id}` === activeId)?.icon}
            </span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}