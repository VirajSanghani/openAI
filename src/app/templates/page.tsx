"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { TemplateGallery } from '@/components/templates/template-gallery'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { AppTemplate } from '@/lib/app-templates'

export default function TemplatesPage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<AppTemplate | null>(null)

  const handleSelectTemplate = async (template: AppTemplate) => {
    try {
      setIsCreating(true)
      setSelectedTemplate(template)
      
      // Create the app from template
      const response = await fetch('/api/apps/from-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          templateId: template.id,
          name: template.name,
          description: template.description,
          framework: template.framework,
          category: template.category,
          tags: template.tags,
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create app from template')
      }

      const result = await response.json()
      
      toast.success(
        `🎉 Created "${template.name}" successfully!`,
        {
          description: 'Your app is ready to customize and deploy.',
          action: {
            label: 'Open App',
            onClick: () => router.push(`/apps/${result.data.slug}`)
          }
        }
      )

      // Navigate to the new app
      router.push(`/apps/${result.data.slug}`)
      
    } catch (error) {
      console.error('Failed to create app from template:', error)
      toast.error('Failed to create app from template', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setIsCreating(false)
      setSelectedTemplate(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center space-x-2 mb-6">
            <Icons.arrowLeft 
              className="h-5 w-5 cursor-pointer hover:text-primary transition-colors" 
              onClick={() => router.back()}
            />
            <span className="text-sm text-muted-foreground">Back</span>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
            App Templates
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Jump-start your development with our collection of production-ready app templates. 
            Each template includes full source code, modern UI components, and best practices.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push('/generate')}
              className="glass-card"
            >
              <Icons.sparkles className="mr-2 h-4 w-4" />
              Custom AI Generation
            </Button>
            
            <Button
              variant="outline"
              onClick={() => router.push('/apps')}
              className="glass-card"
            >
              <Icons.folder className="mr-2 h-4 w-4" />
              My Apps
            </Button>
          </div>
        </motion.div>

        {/* Template Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <TemplateGallery onSelectTemplate={handleSelectTemplate} />
        </motion.div>

        {/* Features Section */}
        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold mb-8">Why Use Templates?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="glass-card p-6 rounded-xl">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Instant Deployment</h3>
              <p className="text-muted-foreground">
                Get your app running in seconds with pre-configured templates and dependencies
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-xl">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Fully Customizable</h3>
              <p className="text-muted-foreground">
                Modify layouts, styles, and functionality to match your vision perfectly
              </p>
            </div>
            
            <div className="glass-card p-6 rounded-xl">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold mb-2">Production Ready</h3>
              <p className="text-muted-foreground">
                Built with best practices, modern frameworks, and optimized performance
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Loading Modal */}
      {isCreating && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div 
            className="glass-card p-8 rounded-xl text-center max-w-md mx-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="text-6xl mb-4">{selectedTemplate.icon}</div>
            <h3 className="text-xl font-semibold mb-2">Creating "{selectedTemplate.name}"</h3>
            <p className="text-muted-foreground mb-6">
              Setting up your app with all the files and configurations...
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Icons.spinner className="h-5 w-5 animate-spin" />
              <span>Please wait...</span>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}