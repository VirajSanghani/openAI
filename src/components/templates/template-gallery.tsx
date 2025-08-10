"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/ui/icons'
import { cn } from '@/lib/utils'
import { APP_TEMPLATES, AppTemplate, getTemplatesByCategory, searchTemplates } from '@/lib/app-templates'

interface TemplateGalleryProps {
  onSelectTemplate: (template: AppTemplate) => void
  className?: string
}

export function TemplateGallery({ onSelectTemplate, className }: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { id: 'all', name: 'All Templates', icon: '🎯' },
    { id: 'productivity', name: 'Productivity', icon: '⚡' },
    { id: 'utility', name: 'Utilities', icon: '🔧' },
    { id: 'game', name: 'Games', icon: '🎮' },
    { id: 'social', name: 'Social', icon: '👥' },
    { id: 'creative', name: 'Creative', icon: '🎨' }
  ]

  const getFilteredTemplates = () => {
    let templates = APP_TEMPLATES

    if (searchQuery.trim()) {
      templates = searchTemplates(searchQuery)
    } else if (selectedCategory !== 'all') {
      templates = getTemplatesByCategory(selectedCategory)
    }

    return templates
  }

  const filteredTemplates = getFilteredTemplates()

  const getFrameworkIcon = (framework: string) => {
    switch (framework) {
      case 'react': return '⚛️'
      case 'vue': return '💚'
      case 'angular': return '🅰️'
      case 'vanilla': return '🟡'
      default: return '📦'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'productivity': return 'bg-blue-500/20 text-blue-700 border-blue-200'
      case 'utility': return 'bg-green-500/20 text-green-700 border-green-200'
      case 'game': return 'bg-purple-500/20 text-purple-700 border-purple-200'
      case 'social': return 'bg-pink-500/20 text-pink-700 border-pink-200'
      case 'creative': return 'bg-orange-500/20 text-orange-700 border-orange-200'
      default: return 'bg-gray-500/20 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">📱 App Templates</h2>
        <p className="text-muted-foreground">
          Choose from our collection of ready-made apps that you can customize and deploy instantly
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Icons.search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedCategory(category.id)
                setSearchQuery('') // Clear search when selecting category
              }}
              className="flex items-center space-x-2"
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
              {category.id !== 'all' && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {getTemplatesByCategory(category.id).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card 
            key={template.id} 
            className="group hover:shadow-lg transition-all duration-200 cursor-pointer relative overflow-hidden glass-card"
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{template.icon}</div>
                  <div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {template.name}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {getFrameworkIcon(template.framework)} {template.framework}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getCategoryColor(template.category))}
                      >
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
              <CardDescription className="mt-2">
                {template.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Features */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Key Features:
                  </p>
                  <div className="space-y-1">
                    {template.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <Icons.check className="h-3 w-3 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {template.features.length > 3 && (
                      <div className="text-xs text-muted-foreground mt-2">
                        +{template.features.length - 3} more features
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="text-xs bg-muted/50"
                    >
                      #{tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs bg-muted/50">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <Button 
                className="w-full mt-4 group-hover:bg-primary/90 transition-colors"
                size="sm"
              >
                <Icons.zap className="mr-2 h-4 w-4" />
                Create App from Template
              </Button>
            </CardContent>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? `No templates match "${searchQuery}". Try a different search term.`
              : `No templates available in the ${selectedCategory} category yet.`
            }
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}
          >
            Show All Templates
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 glass-card rounded-xl">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{APP_TEMPLATES.length}</div>
          <div className="text-sm text-muted-foreground">Total Templates</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {categories.filter(c => c.id !== 'all').length}
          </div>
          <div className="text-sm text-muted-foreground">Categories</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {Array.from(new Set(APP_TEMPLATES.map(t => t.framework))).length}
          </div>
          <div className="text-sm text-muted-foreground">Frameworks</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">∞</div>
          <div className="text-sm text-muted-foreground">Possibilities</div>
        </div>
      </div>
    </div>
  )
}