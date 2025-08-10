"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { Navigation } from '@/components/layout/navigation'
import { AppRunner } from '@/components/apps/app-runner'
import { AppEditor } from '@/components/apps/app-editor'
import { toast } from 'sonner'

interface AppPageProps {
  params: {
    slug: string
  }
}

interface AppData {
  id: string
  name: string
  description: string
  slug: string
  framework: string
  category: string
  tags: string[]
  status: string
  visibility: string
  createdAt: string
  files: Array<{
    id: string
    path: string
    content: string
    mimeType: string
  }>
  owner: {
    id: string
    name: string
    username: string
  }
  _count: {
    likes: number
    views: number
    forks: number
  }
}

export default function AppPage({ params }: AppPageProps) {
  const router = useRouter()
  const [app, setApp] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'run' | 'edit' | 'preview'>('run')
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    fetchApp()
  }, [params.slug])

  const fetchApp = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/apps/${params.slug}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        if (response.status === 404) {
          setError('App not found')
          return
        }
        throw new Error(`Failed to load app: ${response.statusText}`)
      }

      const data = await response.json()
      setApp(data.app)
      setIsOwner(data.isOwner)
      
      // Track view
      await fetch(`/api/apps/${params.slug}/view`, {
        method: 'POST',
        credentials: 'include',
      })

    } catch (err) {
      console.error('Error fetching app:', err)
      setError(err instanceof Error ? err.message : 'Failed to load app')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!app) return

    try {
      const response = await fetch(`/api/apps/${app.slug}/like`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to like app')
      }

      const data = await response.json()
      setApp(prev => prev ? {
        ...prev,
        _count: {
          ...prev._count,
          likes: data.liked ? prev._count.likes + 1 : prev._count.likes - 1
        }
      } : null)

      toast.success(data.liked ? 'App liked!' : 'Like removed')
    } catch (err) {
      toast.error('Failed to like app')
    }
  }

  const handleFork = async () => {
    if (!app) return

    try {
      const response = await fetch(`/api/apps/${app.slug}/fork`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fork app')
      }

      const data = await response.json()
      toast.success('App forked successfully!')
      router.push(`/apps/${data.forkedApp.slug}`)
    } catch (err) {
      toast.error('Failed to fork app')
    }
  }

  const handleShare = async () => {
    if (!app) return

    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('App URL copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy URL')
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <Navigation />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="glass-card border-0 shadow-2xl p-8">
            <div className="flex items-center space-x-4">
              <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Loading App...</h3>
                <p className="text-sm text-muted-foreground">Fetching app data and files</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <Navigation />
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="glass-card border-0 shadow-2xl p-8 text-center">
            <div className="space-y-4">
              <div className="text-6xl">😕</div>
              <h3 className="text-xl font-semibold">App Not Found</h3>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => router.push('/explore')} variant="gradient">
                Browse Other Apps
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!app) return null

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navigation />
      
      {/* App Header */}
      <div className="border-b border-white/10 glass-light">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary-mint/20 flex items-center justify-center">
                <span className="text-2xl">
                  {app.framework === 'react' ? '⚛️' : 
                   app.framework === 'vue' ? '💚' : 
                   app.framework === 'angular' ? '🅰️' : '🔥'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{app.name}</h1>
                <p className="text-muted-foreground">{app.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-muted-foreground">by {app.owner.name}</span>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{app._count.views} views</span>
                    <span>{app._count.likes} likes</span>
                    <span>{app._count.forks} forks</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {['run', 'edit', 'preview'].map((m) => (
                  <Button
                    key={m}
                    variant={mode === m ? 'gradient' : 'glass'}
                    size="sm"
                    onClick={() => setMode(m as any)}
                    disabled={m === 'edit' && !isOwner}
                  >
                    {m === 'run' ? '▶️' : m === 'edit' ? '✏️' : '👁️'} {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="glass" size="sm" onClick={handleLike}>
                  ❤️ Like
                </Button>
                <Button variant="glass" size="sm" onClick={handleFork}>
                  🍴 Fork
                </Button>
                <Button variant="glass" size="sm" onClick={handleShare}>
                  📤 Share
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            {app.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            <Badge variant="outline" className="capitalize">
              {app.framework}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {app.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* App Content */}
      <div className="flex-1">
        {mode === 'run' && (
          <AppRunner 
            app={app}
            onError={(error) => toast.error(`Runtime Error: ${error}`)}
          />
        )}
        
        {mode === 'edit' && isOwner && (
          <AppEditor 
            app={app}
            onSave={(updatedFiles) => {
              setApp(prev => prev ? { ...prev, files: updatedFiles } : null)
              toast.success('App saved successfully!')
            }}
            onError={(error) => toast.error(`Editor Error: ${error}`)}
          />
        )}
        
        {mode === 'preview' && (
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <AppRunner 
                  app={app}
                  preview={true}
                  onError={(error) => toast.error(`Preview Error: ${error}`)}
                />
              </div>
              <div className="space-y-6">
                <Card className="glass-card border-0">
                  <CardHeader>
                    <CardTitle>App Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm font-medium">Framework</div>
                      <div className="text-sm text-muted-foreground capitalize">{app.framework}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Files</div>
                      <div className="text-sm text-muted-foreground">{app.files.length} files</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Created</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}