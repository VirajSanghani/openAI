"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

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

interface AppEditorProps {
  app: AppData
  className?: string
  onSave?: (files: AppFile[]) => void
  onError?: (error: string) => void
}

export function AppEditor({ 
  app, 
  className,
  onSave,
  onError 
}: AppEditorProps) {
  const [files, setFiles] = useState<AppFile[]>(app.files)
  const [selectedFile, setSelectedFile] = useState<AppFile | null>(files[0] || null)
  const [isModified, setIsModified] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setFiles(app.files)
    if (!selectedFile && app.files[0]) {
      setSelectedFile(app.files[0])
    }
  }, [app.files])

  const handleFileContentChange = (content: string) => {
    if (!selectedFile) return

    const updatedFiles = files.map(file => 
      file.id === selectedFile.id 
        ? { ...file, content }
        : file
    )
    
    setFiles(updatedFiles)
    setSelectedFile({ ...selectedFile, content })
    setIsModified(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const response = await fetch(`/api/apps/${app.slug}/files`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          files: files.map(file => ({
            id: file.id,
            path: file.path,
            content: file.content
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save files')
      }

      setIsModified(false)
      onSave?.(files)
      toast.success('Files saved successfully!')

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save files'
      onError?.(errorMsg)
      toast.error(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      toast.error('Please enter a file name')
      return
    }

    if (files.some(f => f.path === newFileName)) {
      toast.error('File already exists')
      return
    }

    const newFile: AppFile = {
      id: `new-${Date.now()}`,
      path: newFileName,
      content: getDefaultFileContent(newFileName),
      mimeType: getMimeType(newFileName)
    }

    setFiles([...files, newFile])
    setSelectedFile(newFile)
    setNewFileName('')
    setShowNewFileDialog(false)
    setIsModified(true)
    toast.success('File created!')
  }

  const handleDeleteFile = (file: AppFile) => {
    if (files.length <= 1) {
      toast.error('Cannot delete the last file')
      return
    }

    const updatedFiles = files.filter(f => f.id !== file.id)
    setFiles(updatedFiles)
    
    if (selectedFile?.id === file.id) {
      setSelectedFile(updatedFiles[0])
    }
    
    setIsModified(true)
    toast.success('File deleted!')
  }

  const handleRenameFile = (file: AppFile, newPath: string) => {
    if (!newPath.trim()) return

    if (files.some(f => f.path === newPath && f.id !== file.id)) {
      toast.error('File already exists')
      return
    }

    const updatedFiles = files.map(f => 
      f.id === file.id 
        ? { ...f, path: newPath, mimeType: getMimeType(newPath) }
        : f
    )
    
    setFiles(updatedFiles)
    
    if (selectedFile?.id === file.id) {
      setSelectedFile({ ...selectedFile, path: newPath })
    }
    
    setIsModified(true)
    toast.success('File renamed!')
  }

  const getDefaultFileContent = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    
    switch (ext) {
      case 'tsx':
      case 'jsx':
        return `import React from 'react'

export default function Component() {
  return (
    <div>
      <h1>New Component</h1>
      <p>Edit this file to customize your component.</p>
    </div>
  )
}`
      
      case 'ts':
      case 'js':
        return `// ${fileName}

export function hello() {
  console.log('Hello from ${fileName}!')
}
`
      
      case 'css':
        return `/* ${fileName} */

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}
`
      
      case 'html':
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Page</title>
</head>
<body>
    <h1>Hello World</h1>
    <p>This is a new HTML file.</p>
</body>
</html>`
      
      default:
        return `// ${fileName}

// Edit this file...
`
    }
  }

  const getMimeType = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      'ts': 'application/typescript',
      'tsx': 'application/typescript',
      'js': 'application/javascript',
      'jsx': 'application/javascript',
      'json': 'application/json',
      'css': 'text/css',
      'html': 'text/html',
      'md': 'text/markdown',
    }
    return mimeTypes[ext || ''] || 'text/plain'
  }

  const getFileIcon = (file: AppFile): string => {
    const ext = file.path.split('.').pop()?.toLowerCase()
    
    switch (ext) {
      case 'tsx':
      case 'jsx': return '⚛️'
      case 'ts': return '📘'
      case 'js': return '📜'
      case 'css': return '🎨'
      case 'html': return '🌐'
      case 'json': return '📋'
      case 'md': return '📝'
      default: return '📄'
    }
  }

  const formatFileSize = (content: string): string => {
    const bytes = new Blob([content]).size
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={cn("flex h-screen", className)}>
      {/* File Explorer */}
      <div className="w-80 border-r border-white/10 glass-light">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Files</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowNewFileDialog(true)}
            >
              <Icons.plus className="h-4 w-4" />
            </Button>
          </div>
          
          {showNewFileDialog && (
            <div className="space-y-2 mb-4">
              <Input
                placeholder="filename.tsx"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateFile()
                  if (e.key === 'Escape') setShowNewFileDialog(false)
                }}
                autoFocus
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleCreateFile}>
                  Create
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowNewFileDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-2">
          {files.map((file) => (
            <div
              key={file.id}
              className={cn(
                "flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors group",
                selectedFile?.id === file.id 
                  ? "bg-primary/20 text-primary" 
                  : "hover:bg-white/5"
              )}
              onClick={() => setSelectedFile(file)}
            >
              <span className="text-sm">{getFileIcon(file)}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {file.path}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(file.content)}
                </div>
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    const newPath = prompt('Rename file:', file.path)
                    if (newPath) handleRenameFile(file, newPath)
                  }}
                >
                  <Icons.edit className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Delete this file?')) {
                      handleDeleteFile(file)
                    }
                  }}
                >
                  <Icons.trash className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <>
            {/* Editor Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 glass-light">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getFileIcon(selectedFile)}</span>
                <div>
                  <div className="font-medium">{selectedFile.path}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedFile.mimeType} • {formatFileSize(selectedFile.content)}
                  </div>
                </div>
                {isModified && (
                  <Badge variant="outline" className="text-xs">
                    Modified
                  </Badge>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (editorRef.current) {
                      editorRef.current.focus()
                    }
                  }}
                >
                  <Icons.code className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={handleSave}
                  disabled={!isModified || saving}
                >
                  {saving ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Icons.save className="mr-2 h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 relative">
              <textarea
                ref={editorRef}
                value={selectedFile.content}
                onChange={(e) => handleFileContentChange(e.target.value)}
                className="w-full h-full p-4 bg-transparent border-0 outline-0 resize-none font-mono text-sm leading-relaxed"
                placeholder="Start typing..."
                spellCheck={false}
                style={{
                  tabSize: 2,
                  fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace'
                }}
              />
              
              {/* Line numbers (simplified) */}
              <div className="absolute left-0 top-0 p-4 pointer-events-none text-muted-foreground text-sm font-mono leading-relaxed">
                {selectedFile.content.split('\n').map((_, index) => (
                  <div key={index} className="text-right w-8">
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Editor Footer */}
            <div className="flex items-center justify-between p-2 border-t border-white/10 glass-light text-xs text-muted-foreground">
              <div className="flex space-x-4">
                <span>Lines: {selectedFile.content.split('\n').length}</span>
                <span>Characters: {selectedFile.content.length}</span>
                <span>Size: {formatFileSize(selectedFile.content)}</span>
              </div>
              
              <div className="flex space-x-4">
                <span>{selectedFile.mimeType}</span>
                <span>{app.framework}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-semibold mb-2">No file selected</h3>
              <p className="text-muted-foreground">
                Select a file from the explorer to start editing
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}