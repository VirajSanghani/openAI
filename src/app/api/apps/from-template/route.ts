import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { asyncHandler, success, error, validateRequest } from '@/lib/api'
import { requireAuth } from '@/lib/auth-middleware'
import { getTemplateById } from '@/lib/app-templates'
import { slugify } from '@/lib/utils'

const CreateFromTemplateSchema = z.object({
  templateId: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  framework: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(['private', 'public', 'unlisted']).default('private'),
})

// POST /api/apps/from-template - Create a new app from a template
export const POST = asyncHandler(async (request: NextRequest) => {
  const user = await requireAuth(request)
  
  const validationResult = await validateRequest(request, CreateFromTemplateSchema)
  if (validationResult.error) return validationResult.error
  
  const { templateId, name, description, framework, category, tags, visibility } = validationResult.data
  
  // Get the template
  const template = getTemplateById(templateId)
  if (!template) {
    return error('Template not found', 404, 'TEMPLATE_NOT_FOUND')
  }
  
  // Generate unique slug
  const appName = name || template.name
  const baseSlug = slugify(appName)
  let slug = baseSlug
  let counter = 1
  
  while (await db.app.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }
  
  // Create the app with template data
  const app = await db.app.create({
    data: {
      name: appName,
      description: description || template.description,
      slug,
      ownerId: user.id,
      framework: framework || template.framework,
      buildTool: 'vite', // Default build tool
      category: category || template.category,
      tags: tags || template.tags,
      visibility,
      status: 'draft',
      aiModel: 'template', // Mark as template-created
      generationConfig: JSON.parse(JSON.stringify({
        templateId,
        templateName: template.name,
        createdFrom: 'template'
      })),
      dependencies: template.dependencies ? JSON.parse(JSON.stringify(template.dependencies)) : null,
      // Create all template files
      files: {
        create: template.files.map(file => ({
          path: file.path,
          content: file.content,
          size: new Blob([file.content]).size,
          mimeType: file.mimeType,
          isDirectory: file.isDirectory || false,
          parentPath: file.path.includes('/') ? file.path.substring(0, file.path.lastIndexOf('/')) : null,
        }))
      }
    },
    select: {
      id: true,
      name: true,
      description: true,
      slug: true,
      framework: true,
      category: true,
      tags: true,
      visibility: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          files: true
        }
      }
    }
  })
  
  // Track usage metric
  await db.usageMetric.create({
    data: {
      userId: user.id,
      type: 'template_app_created',
      value: 1,
      unit: 'app',
      metadata: JSON.parse(JSON.stringify({
        templateId,
        templateName: template.name,
        appId: app.id,
        framework: template.framework,
        category: template.category
      }))
    }
  }).catch(console.error)
  
  return success({
    app,
    template: {
      id: template.id,
      name: template.name,
      category: template.category
    },
    message: `App "${appName}" created successfully from template`
  })
})