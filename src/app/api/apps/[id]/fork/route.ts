import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { asyncHandler, success, error, NotFoundError, validateRequest } from '@/lib/api'
import { requireAuth } from '@/lib/auth-middleware'

interface RouteParams {
  params: {
    id: string
  }
}

const ForkAppSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  visibility: z.enum(['private', 'public', 'unlisted']).default('private'),
})

// POST /api/apps/[id]/fork - Fork an app
export const POST = asyncHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const user = await requireAuth(request)
  const { id } = params
  
  const validationResult = await validateRequest(request, ForkAppSchema)
  if (validationResult.error) return validationResult.error
  
  const forkData = validationResult.data
  const where = id.length === 25 ? { id } : { slug: id }
  
  // Get original app with all files
  const originalApp = await db.app.findUnique({
    where,
    include: {
      files: {
        select: {
          path: true,
          content: true,
          size: true,
          mimeType: true,
          isDirectory: true,
          parentPath: true,
        }
      },
      owner: {
        select: {
          id: true,
          username: true,
          displayName: true
        }
      }
    }
  })
  
  if (!originalApp) {
    throw new NotFoundError('App not found')
  }
  
  // Check if app is public or user has access
  if (originalApp.visibility === 'private' && originalApp.ownerId !== user.id) {
    return error('You do not have permission to fork this app', 403, 'INSUFFICIENT_PERMISSIONS')
  }
  
  // Generate unique slug for forked app
  const baseName = forkData.name || `${originalApp.name} (Fork)`
  const baseSlug = baseName.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  
  let slug = baseSlug
  let counter = 1
  
  while (await db.app.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }
  
  // Create forked app with all files
  const forkedApp = await db.app.create({
    data: {
      name: baseName,
      description: forkData.description || `Forked from ${originalApp.name} by ${originalApp.owner.displayName || originalApp.owner.username}`,
      slug,
      ownerId: user.id,
      framework: originalApp.framework,
      buildTool: originalApp.buildTool,
      category: originalApp.category,
      tags: [...(originalApp.tags || []), 'forked'],
      visibility: forkData.visibility,
      status: 'draft',
      forkedFromId: originalApp.id,
      aiModel: originalApp.aiModel,
      generationConfig: originalApp.generationConfig,
      dependencies: originalApp.dependencies,
      // Create all files from original
      files: {
        create: originalApp.files.map(file => ({
          path: file.path,
          content: file.content,
          size: file.size,
          mimeType: file.mimeType,
          isDirectory: file.isDirectory,
          parentPath: file.parentPath,
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
      forkedFromId: true,
      _count: {
        select: {
          files: true
        }
      }
    }
  })
  
  // Increment fork count on original app
  await db.app.update({
    where: { id: originalApp.id },
    data: { 
      forks: { increment: 1 }
    }
  })
  
  // Create notification for original app owner (if different user)
  if (originalApp.ownerId !== user.id) {
    await db.notification.create({
      data: {
        userId: originalApp.ownerId,
        type: 'app_forked',
        title: 'Your app was forked!',
        message: `${user.displayName || user.username} forked your app "${originalApp.name}"`,
        metadata: {
          originalAppId: originalApp.id,
          forkedAppId: forkedApp.id,
          forkedBy: user.id
        }
      }
    }).catch(console.error) // Ignore notification failures
  }
  
  // Track usage metric
  await db.usageMetric.create({
    data: {
      userId: user.id,
      type: 'app_fork',
      value: 1,
      unit: 'fork',
      metadata: {
        originalAppId: originalApp.id,
        forkedAppId: forkedApp.id,
        framework: originalApp.framework
      }
    }
  }).catch(console.error)
  
  return success({
    forkedApp,
    originalApp: {
      id: originalApp.id,
      name: originalApp.name,
      slug: originalApp.slug,
      owner: originalApp.owner
    },
    message: `Successfully forked "${originalApp.name}"`
  })
})