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

const FileSchema = z.object({
  id: z.string().optional(),
  path: z.string().min(1),
  content: z.string(),
  mimeType: z.string().optional(),
  isDirectory: z.boolean().default(false),
  parentPath: z.string().optional(),
})

const UpdateFilesSchema = z.object({
  files: z.array(FileSchema).min(1),
})

// GET /api/apps/[id]/files - Get all files for an app
export const GET = asyncHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = params
  const url = new URL(request.url)
  const path = url.searchParams.get('path')
  
  const where = id.length === 25 ? { id } : { slug: id }
  
  // Check if app exists and user has access
  const app = await db.app.findUnique({
    where,
    select: {
      id: true,
      name: true,
      ownerId: true,
      visibility: true,
      collaborators: {
        select: {
          userId: true,
          role: true
        }
      }
    }
  })
  
  if (!app) {
    throw new NotFoundError('App not found')
  }
  
  // Check access permissions
  const user = await requireAuth(request).catch(() => null)
  const hasAccess = app.visibility === 'public' || 
                   (user && (
                     app.ownerId === user.id ||
                     app.collaborators.some(c => c.userId === user.id)
                   ))
  
  if (!hasAccess) {
    return error('You do not have permission to access these files', 403, 'INSUFFICIENT_PERMISSIONS')
  }
  
  // Get files (optionally filtered by path)
  const fileWhere: any = { appId: app.id }
  if (path) {
    if (path.endsWith('/')) {
      // Get files in directory
      fileWhere.parentPath = path.slice(0, -1) || null
    } else {
      // Get specific file
      fileWhere.path = path
    }
  }
  
  const files = await db.appFile.findMany({
    where: fileWhere,
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
  })
  
  return success({
    files,
    count: files.length,
    app: {
      id: app.id,
      name: app.name
    }
  })
})

// PUT /api/apps/[id]/files - Update multiple files
export const PUT = asyncHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const user = await requireAuth(request)
  const { id } = params
  
  const validationResult = await validateRequest(request, UpdateFilesSchema)
  if (validationResult.error) return validationResult.error
  
  const { files: filesToUpdate } = validationResult.data
  const where = id.length === 25 ? { id } : { slug: id }
  
  // Check if app exists and user has edit access
  const app = await db.app.findUnique({
    where,
    select: {
      id: true,
      name: true,
      ownerId: true,
      collaborators: {
        where: {
          userId: user.id,
          role: { in: ['editor', 'admin'] }
        }
      }
    }
  })
  
  if (!app) {
    throw new NotFoundError('App not found')
  }
  
  const hasEditAccess = app.ownerId === user.id || app.collaborators.length > 0
  if (!hasEditAccess) {
    return error('You do not have permission to edit this app', 403, 'INSUFFICIENT_PERMISSIONS')
  }
  
  // Process file updates in transaction
  const result = await db.$transaction(async (tx) => {
    const updatedFiles = []
    
    for (const fileData of filesToUpdate) {
      // Calculate file size
      const size = new Blob([fileData.content]).size
      
      // Determine MIME type if not provided
      let mimeType = fileData.mimeType
      if (!mimeType) {
        const ext = fileData.path.split('.').pop()?.toLowerCase()
        const mimeTypes: Record<string, string> = {
          'ts': 'application/typescript',
          'tsx': 'application/typescript',
          'js': 'application/javascript',
          'jsx': 'application/javascript',
          'json': 'application/json',
          'css': 'text/css',
          'scss': 'text/scss',
          'html': 'text/html',
          'md': 'text/markdown',
          'vue': 'text/x-vue',
          'svelte': 'text/x-svelte',
        }
        mimeType = mimeTypes[ext || ''] || 'text/plain'
      }
      
      let file
      if (fileData.id && fileData.id.startsWith('new-')) {
        // Create new file
        file = await tx.appFile.create({
          data: {
            appId: app.id,
            path: fileData.path,
            content: fileData.content,
            size,
            mimeType,
            isDirectory: fileData.isDirectory,
            parentPath: fileData.parentPath,
          },
          select: {
            id: true,
            path: true,
            content: true,
            size: true,
            mimeType: true,
            isDirectory: true,
            parentPath: true,
            updatedAt: true,
          }
        })
      } else if (fileData.id) {
        // Update existing file
        file = await tx.appFile.update({
          where: {
            id: fileData.id,
            appId: app.id, // Ensure file belongs to this app
          },
          data: {
            path: fileData.path,
            content: fileData.content,
            size,
            mimeType,
            isDirectory: fileData.isDirectory,
            parentPath: fileData.parentPath,
          },
          select: {
            id: true,
            path: true,
            content: true,
            size: true,
            mimeType: true,
            isDirectory: true,
            parentPath: true,
            updatedAt: true,
          }
        })
      } else {
        // Create file without temporary ID
        file = await tx.appFile.create({
          data: {
            appId: app.id,
            path: fileData.path,
            content: fileData.content,
            size,
            mimeType,
            isDirectory: fileData.isDirectory,
            parentPath: fileData.parentPath,
          },
          select: {
            id: true,
            path: true,
            content: true,
            size: true,
            mimeType: true,
            isDirectory: true,
            parentPath: true,
            updatedAt: true,
          }
        })
      }
      
      updatedFiles.push(file)
    }
    
    // Update app's updatedAt timestamp
    await tx.app.update({
      where: { id: app.id },
      data: { updatedAt: new Date() }
    })
    
    return updatedFiles
  })
  
  // Track usage metric
  await db.usageMetric.create({
    data: {
      userId: user.id,
      type: 'file_edit',
      value: filesToUpdate.length,
      unit: 'files',
      metadata: {
        appId: app.id,
        fileCount: filesToUpdate.length
      }
    }
  }).catch(console.error)
  
  return success({
    files: result,
    message: `Updated ${result.length} file(s) successfully`,
    app: {
      id: app.id,
      name: app.name
    }
  })
})

// POST /api/apps/[id]/files - Create new file(s)
export const POST = asyncHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const user = await requireAuth(request)
  const { id } = params
  
  const validationResult = await validateRequest(request, z.object({
    files: z.array(FileSchema.omit({ id: true })).min(1)
  }))
  if (validationResult.error) return validationResult.error
  
  const { files: filesToCreate } = validationResult.data
  const where = id.length === 25 ? { id } : { slug: id }
  
  // Check if app exists and user has edit access
  const app = await db.app.findUnique({
    where,
    select: {
      id: true,
      name: true,
      ownerId: true,
      collaborators: {
        where: {
          userId: user.id,
          role: { in: ['editor', 'admin'] }
        }
      }
    }
  })
  
  if (!app) {
    throw new NotFoundError('App not found')
  }
  
  const hasEditAccess = app.ownerId === user.id || app.collaborators.length > 0
  if (!hasEditAccess) {
    return error('You do not have permission to edit this app', 403, 'INSUFFICIENT_PERMISSIONS')
  }
  
  // Create files
  const createdFiles = await db.$transaction(
    filesToCreate.map(fileData => {
      const size = new Blob([fileData.content]).size
      
      // Determine MIME type
      const ext = fileData.path.split('.').pop()?.toLowerCase()
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
      const mimeType = fileData.mimeType || mimeTypes[ext || ''] || 'text/plain'
      
      return db.appFile.create({
        data: {
          appId: app.id,
          path: fileData.path,
          content: fileData.content,
          size,
          mimeType,
          isDirectory: fileData.isDirectory,
          parentPath: fileData.parentPath,
        }
      })
    })
  )
  
  return success({
    files: createdFiles,
    message: `Created ${createdFiles.length} file(s) successfully`
  })
})