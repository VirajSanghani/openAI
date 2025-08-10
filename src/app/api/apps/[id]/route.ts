import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { asyncHandler, success, validateRequest, NotFoundError } from '@/lib/api'

// Schema definitions
const UpdateAppSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  framework: z.string().optional(),
  isPublic: z.boolean().optional(),
  visibility: z.enum(['private', 'public', 'unlisted']).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  version: z.string().optional(),
  icon: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  deploymentUrl: z.string().url().optional(),
  repositoryUrl: z.string().url().optional(),
})

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/apps/[id] - Get app by ID or slug
export const GET = asyncHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = params
  const url = new URL(request.url)
  const includeFiles = url.searchParams.get('include_files') === 'true'
  
  // Try to find by ID first, then by slug
  const where = id.length === 25 ? { id } : { slug: id } // cuid is 25 chars
  
  const app = await db.app.findUnique({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      slug: true,
      icon: true,
      coverImage: true,
      category: true,
      tags: true,
      framework: true,
      buildTool: true,
      version: true,
      status: true,
      isPublic: true,
      visibility: true,
      deploymentUrl: true,
      repositoryUrl: true,
      prompt: true,
      aiModel: true,
      generationConfig: true,
      views: true,
      downloads: true,
      likes: true,
      rating: true,
      dependencies: true,
      createdAt: true,
      updatedAt: true,
      publishedAt: true,
      owner: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          isVerified: true,
        }
      },
      collaborators: {
        select: {
          id: true,
          role: true,
          acceptedAt: true,
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            }
          }
        }
      },
      files: includeFiles ? {
        select: {
          id: true,
          path: true,
          content: true,
          size: true,
          mimeType: true,
          isDirectory: true,
          parentPath: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: [
          { isDirectory: 'desc' },
          { path: 'asc' }
        ]
      } : false,
      versions: {
        select: {
          id: true,
          version: true,
          changelog: true,
          isStable: true,
          downloadCount: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5, // Latest 5 versions
      },
      components: {
        select: {
          id: true,
          instanceName: true,
          config: true,
          component: {
            select: {
              id: true,
              name: true,
              category: true,
              framework: true,
            }
          }
        }
      },
      _count: {
        select: {
          reviews: true,
          comments: true,
          likes: true,
          files: true,
          versions: true,
          deployments: true,
        }
      }
    }
  })
  
  if (!app) {
    throw new NotFoundError('App not found')
  }
  
  // Increment view count (fire and forget)
  db.app.update({
    where: { id: app.id },
    data: { views: { increment: 1 } }
  }).catch(console.error)
  
  return success(app)
})

// PATCH /api/apps/[id] - Update app
export const PATCH = asyncHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = params
  
  // TODO: Add authentication and authorization middleware
  // Verify user owns this app or is a collaborator with edit permissions
  
  const validationResult = await validateRequest(request, UpdateAppSchema)
  if (validationResult.error) return validationResult.error
  
  const updateData = validationResult.data
  const where = id.length === 25 ? { id } : { slug: id }
  
  // Check if app exists
  const existingApp = await db.app.findUnique({
    where,
    select: { id: true, status: true }
  })
  
  if (!existingApp) {
    throw new NotFoundError('App not found')
  }
  
  // Handle status changes
  const finalUpdateData: any = { ...updateData }
  if (updateData.status === 'published' && existingApp.status !== 'published') {
    finalUpdateData.publishedAt = new Date()
  }
  
  // Update app
  const updatedApp = await db.app.update({
    where,
    data: finalUpdateData,
    select: {
      id: true,
      name: true,
      description: true,
      slug: true,
      category: true,
      tags: true,
      framework: true,
      version: true,
      status: true,
      isPublic: true,
      visibility: true,
      updatedAt: true,
      publishedAt: true,
    }
  })
  
  return success(updatedApp)
})

// DELETE /api/apps/[id] - Delete app
export const DELETE = asyncHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = params
  
  // TODO: Add authentication and authorization middleware
  // Verify user owns this app
  
  const where = id.length === 25 ? { id } : { slug: id }
  
  const existingApp = await db.app.findUnique({
    where,
    select: { id: true, name: true }
  })
  
  if (!existingApp) {
    throw new NotFoundError('App not found')
  }
  
  // Delete app and all related data (cascade delete)
  await db.app.delete({ where: { id: existingApp.id } })
  
  return success({ 
    message: `App "${existingApp.name}" deleted successfully` 
  })
})