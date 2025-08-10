"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AppPreviewProps {
  prompt?: string
  framework?: string
  style?: string
  complexity?: string
  features?: string[]
}

const frameworkIcons = {
  react: '⚛️',
  vue: '💚', 
  angular: '🅰️',
  svelte: '🔥'
}

const styleVariants = {
  modern: {
    bg: 'bg-gradient-to-br from-slate-50 to-white',
    card: 'bg-white shadow-xl border border-gray-100',
    accent: 'bg-blue-500',
    text: 'text-gray-900'
  },
  minimal: {
    bg: 'bg-gray-50', 
    card: 'bg-white shadow-sm border border-gray-200',
    accent: 'bg-gray-800',
    text: 'text-gray-800'
  },
  corporate: {
    bg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    card: 'bg-white shadow-lg border border-blue-100',
    accent: 'bg-blue-600',
    text: 'text-blue-900'
  },
  creative: {
    bg: 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50',
    card: 'bg-white shadow-xl border border-purple-100',
    accent: 'bg-gradient-to-r from-purple-500 to-pink-500',
    text: 'text-purple-900'
  },
  dashboard: {
    bg: 'bg-slate-900',
    card: 'bg-slate-800 shadow-xl border border-slate-700',
    accent: 'bg-emerald-500',
    text: 'text-slate-100'
  }
}

const complexityFeatures = {
  simple: ['Home Page', 'About Section', 'Contact Form'],
  medium: ['Navigation', 'User Dashboard', 'Data Tables', 'Forms', 'Charts'],
  complex: ['Authentication', 'Real-time Updates', 'Admin Panel', 'API Integration', 'Analytics', 'Notifications']
}

export function AppPreview({ 
  prompt = "A modern web application", 
  framework = "react", 
  style = "modern", 
  complexity = "medium",
  features = [] 
}: AppPreviewProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')
  
  const styleConfig = styleVariants[style as keyof typeof styleVariants] || styleVariants.modern
  const complexityFeatureList = complexityFeatures[complexity as keyof typeof complexityFeatures] || complexityFeatures.medium
  
  // Extract app name from prompt
  const getAppName = () => {
    const words = prompt.toLowerCase().split(' ')
    if (words.includes('todo') || words.includes('task')) return 'TaskFlow'
    if (words.includes('chat') || words.includes('message')) return 'ChatHub'
    if (words.includes('shop') || words.includes('store') || words.includes('ecommerce')) return 'ShopZone'
    if (words.includes('blog') || words.includes('news')) return 'BlogSpace'
    if (words.includes('dashboard') || words.includes('admin')) return 'Dashboard Pro'
    return 'MyApp'
  }

  const mockPages = ['home', 'dashboard', 'profile', 'settings']
  
  useEffect(() => {
    // Simulate loading when props change
    setIsLoading(true)
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [prompt, framework, style, complexity, features])

  if (isLoading) {
    return (
      <div className="relative h-full min-h-[400px] glass-card rounded-xl overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">{frameworkIcons[framework as keyof typeof frameworkIcons] || '⚛️'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Generating Preview...</p>
              <p className="text-xs text-muted-foreground">Building your {framework} application</p>
            </div>
            <div className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse animate-stagger-1" />
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse animate-stagger-2" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full glass-card rounded-xl overflow-hidden border-0 shadow-2xl">
      {/* Browser Chrome */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="ml-4 flex items-center space-x-2">
            <span className="text-xs text-gray-500">🔒</span>
            <span className="text-xs text-gray-600 font-mono">localhost:3000</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            {frameworkIcons[framework as keyof typeof frameworkIcons]} {framework}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {style}
          </Badge>
        </div>
      </div>

      {/* App Content */}
      <div className={cn("relative h-96 transition-all duration-500", styleConfig.bg)}>
        {/* Navigation Bar */}
        <div className={cn("flex items-center justify-between px-6 py-4", styleConfig.card)}>
          <div className="flex items-center space-x-4">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold", styleConfig.accent)}>
              {getAppName().charAt(0)}
            </div>
            <h1 className={cn("text-lg font-bold", styleConfig.text)}>{getAppName()}</h1>
          </div>
          
          <nav className="hidden sm:flex items-center space-x-6">
            {mockPages.map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "text-sm transition-colors capitalize",
                  currentPage === page 
                    ? cn("font-medium border-b-2", style === 'dashboard' ? 'text-emerald-400 border-emerald-400' : 'text-blue-600 border-blue-600')
                    : cn(styleConfig.text, "hover:opacity-75")
                )}
              >
                {page}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <div className={cn("w-8 h-8 rounded-full", styleConfig.accent)} />
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className={cn("text-3xl font-bold", styleConfig.text)}>
              {currentPage === 'home' && 'Welcome to Your App'}
              {currentPage === 'dashboard' && 'Dashboard Overview'} 
              {currentPage === 'profile' && 'User Profile'}
              {currentPage === 'settings' && 'Application Settings'}
            </h2>
            <p className={cn("text-lg opacity-75", styleConfig.text)}>
              {prompt || "A beautifully designed application built with modern technologies"}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {complexityFeatureList.slice(0, 6).map((feature, index) => (
              <div 
                key={feature}
                className={cn(
                  "p-4 rounded-lg transition-all duration-300 hover:scale-105 cursor-pointer",
                  styleConfig.card,
                  "animate-fade-in"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", styleConfig.accent)}>
                    <span className="text-white text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className={cn("font-medium", styleConfig.text)}>{feature}</h3>
                    <p className={cn("text-xs opacity-60", styleConfig.text)}>Feature module</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Features */}
          {features.length > 0 && (
            <div className="space-y-3">
              <h3 className={cn("text-sm font-medium opacity-75", styleConfig.text)}>Additional Features:</h3>
              <div className="flex flex-wrap gap-2">
                {features.map((feature) => (
                  <Badge 
                    key={feature} 
                    variant="secondary"
                    className="text-xs capitalize"
                  >
                    {feature.replace('-', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/10 to-transparent">
          <div className="flex items-center justify-between text-xs opacity-60">
            <span>Built with {framework.charAt(0).toUpperCase() + framework.slice(1)}</span>
            <span>Complexity: {complexity}</span>
          </div>
        </div>
      </div>

      {/* Update Indicator */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center space-x-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
          <div className="w-2 h-2 bg-green-200 rounded-full animate-pulse" />
          <span>Live Preview</span>
        </div>
      </div>
    </div>
  )
}