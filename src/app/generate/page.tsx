"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { Navigation } from '@/components/layout/navigation'
import { AppPreview } from '@/components/ui/app-preview'
import { toast } from 'sonner'

export default function GeneratePage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [framework, setFramework] = useState('react')
  const [style, setStyle] = useState('modern')
  const [complexity, setComplexity] = useState('medium')
  const [features, setFeatures] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const availableFeatures = [
    'routing', 'authentication', 'database', 'state-management',
    'ui-components', 'styling', 'forms', 'charts', 'real-time'
  ]

  const toggleFeature = (feature: string) => {
    setFeatures(prev =>
      prev.includes(feature)
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    )
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe what you want to build')
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          framework,
          style,
          complexity,
          features,
          type: 'app'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error?.message || 'Generation failed')
      }

      toast.success('App generated successfully!')
      
      // Redirect to the generated app
      if (result.data.app) {
        router.push(`/apps/${result.data.app.slug}`)
      }
    } catch (error) {
      console.error('Generation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate app')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navigation />
      
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-primary/20 via-primary-mint/15 to-transparent rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-primary-violet/15 via-primary-rose/10 to-transparent rounded-full blur-3xl animate-bounce-soft" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-primary-sunrise/10 via-primary/5 to-primary-mint/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-7xl flex flex-col items-center">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-primary-mint to-primary-sunrise bg-clip-text text-transparent">
                Generate Your App
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Describe what you want to build and our AI will generate a complete, production-ready application for you
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Column */}
            <div className="space-y-6">
              <Card className="glass-card border-0 shadow-2xl animate-fade-in animate-stagger-1">
                <CardHeader className="pb-8">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary-mint/20 flex items-center justify-center">
                      <span className="text-2xl">✨</span>
                    </div>
                    <CardTitle className="text-2xl gradient-text">AI App Generator</CardTitle>
                  </div>
                  <CardDescription className="text-base leading-relaxed">
                    Transform your ideas into working applications with natural language descriptions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Prompt Input */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="prompt" className="text-base font-medium flex items-center space-x-2">
                        <span className="text-2xl">💭</span>
                        <span>Describe your app</span>
                      </label>
                      <Textarea
                        id="prompt"
                        placeholder="I want to build a todo app with categories, due dates, dark mode support, user authentication, and the ability to share lists with other users..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={5}
                        className="resize-none glass-light border-white/20 bg-background/50 backdrop-blur-sm text-base leading-relaxed focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                      />
                      <p className="text-sm text-muted-foreground">
                        Be specific about features, styling preferences, and functionality you'd like to include
                      </p>
                    </div>
                  </div>

                  {/* Framework Selection */}
                  <div className="space-y-4">
                    <label className="text-base font-medium flex items-center space-x-2">
                      <span className="text-2xl">⚛️</span>
                      <span>Choose Framework</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['react', 'vue', 'angular', 'svelte'].map((fw) => (
                        <Button
                          key={fw}
                          variant={framework === fw ? 'gradient' : 'glass'}
                          size="lg"
                          onClick={() => setFramework(fw)}
                          className={framework === fw ? 'scale-105 shadow-lg' : 'hover:scale-105'}
                        >
                          {fw.charAt(0).toUpperCase() + fw.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Style Selection */}
                  <div className="space-y-4">
                    <label className="text-base font-medium flex items-center space-x-2">
                      <span className="text-2xl">🎨</span>
                      <span>Design Style</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {['modern', 'minimal', 'corporate', 'creative', 'dashboard'].map((s) => (
                        <Button
                          key={s}
                          variant={style === s ? 'gradient' : 'glass'}
                          size="lg"
                          onClick={() => setStyle(s)}
                          className={style === s ? 'scale-105 shadow-lg' : 'hover:scale-105'}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Complexity Selection */}
                  <div className="space-y-4">
                    <label className="text-base font-medium flex items-center space-x-2">
                      <span className="text-2xl">🔧</span>
                      <span>Complexity Level</span>
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { key: 'simple', label: 'Simple', desc: 'Basic functionality, clean UI' },
                        { key: 'medium', label: 'Medium', desc: 'Advanced features, rich interactions' },
                        { key: 'complex', label: 'Complex', desc: 'Full-featured, enterprise-grade' }
                      ].map(({ key, label, desc }) => (
                        <Card 
                          key={key}
                          className={`cursor-pointer transition-all duration-300 border-0 ${
                            complexity === key 
                              ? 'glass-strong shadow-lg scale-105 ring-2 ring-primary/50' 
                              : 'glass-light hover:glass-strong hover:scale-102'
                          }`}
                          onClick={() => setComplexity(key)}
                        >
                          <CardContent className="p-4 text-center">
                            <div className="font-medium text-base mb-2">{label}</div>
                            <div className="text-sm text-muted-foreground">{desc}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Features Selection */}
                  <div className="space-y-4">
                    <label className="text-base font-medium flex items-center space-x-2">
                      <span className="text-2xl">🚀</span>
                      <span>Additional Features</span>
                      <span className="text-sm text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {availableFeatures.map((feature) => (
                        <Badge
                          key={feature}
                          variant={features.includes(feature) ? 'default' : 'outline'}
                          className={`cursor-pointer px-4 py-2 text-sm transition-all duration-300 ${
                            features.includes(feature)
                              ? 'bg-gradient-to-r from-primary to-primary-mint text-white shadow-lg scale-105'
                              : 'hover:bg-primary/10 hover:scale-105 glass-light'
                          }`}
                          onClick={() => toggleFeature(feature)}
                        >
                          {feature.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Select features to include in your generated application
                    </p>
                  </div>

                  {/* Generate Button */}
                  <div className="pt-4">
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt.trim()}
                      variant="gradient"
                      className="w-full h-14 text-lg font-semibold shadow-2xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
                      size="xl"
                    >
                      {isGenerating ? (
                        <>
                          <Icons.spinner className="mr-3 h-5 w-5 animate-spin" />
                          <span>Generating Your App...</span>
                          <div className="ml-3 flex space-x-1">
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" />
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse animate-stagger-1" />
                            <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse animate-stagger-2" />
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="mr-2">✨</span>
                          Generate My App
                          <svg
                            className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </>
                      )}
                    </Button>
                    
                    <div className="mt-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        🚀 Generation typically takes 30-60 seconds
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        We'll create a complete, production-ready application with modern best practices
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Preview Column */}
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <Card className="glass-card border-0 shadow-2xl animate-fade-in animate-stagger-2">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary-mint/20 flex items-center justify-center">
                      <span className="text-2xl">👁️</span>
                    </div>
                    <div>
                      <CardTitle className="text-xl gradient-text">Live Preview</CardTitle>
                      <CardDescription>
                        See your app come to life as you customize
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <AppPreview
                    prompt={prompt}
                    framework={framework}
                    style={style}
                    complexity={complexity}
                    features={features}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}