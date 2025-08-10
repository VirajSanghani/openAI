import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { asyncHandler, success, error, validateRequest, rateLimit } from '@/lib/api'

// Schema definitions
const CreateAppSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  framework: z.string().optional(),
  isPublic: z.boolean().default(false),
  visibility: z.enum(['private', 'public', 'unlisted']).default('private'),
  prompt: z.string().optional(), // AI generation prompt
  aiModel: z.string().optional(),
  generationConfig: z.any().optional(),
})

const GetAppsQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 12),
  search: z.string().optional(),
  category: z.string().optional(),
  framework: z.string().optional(),
  tags: z.string().optional().transform(val => val ? val.split(',') : undefined),
  sort: z.enum(['latest', 'popular', 'trending', 'rating']).default('latest'),
  visibility: z.enum(['public', 'all']).default('public'),
  ownerId: z.string().optional(), // Filter by owner
})

// GET /api/apps - List apps with filtering, search, and pagination
export const GET = asyncHandler(async (request: NextRequest) => {
  const url = new URL(request.url)
  const query = Object.fromEntries(url.searchParams)
  
  const validationResult = GetAppsQuerySchema.safeParse(query)
  if (!validationResult.success) {
    return error('Invalid query parameters', 400)
  }
  
  const { page, limit, search, category, framework, tags, sort, visibility, ownerId } = validationResult.data
  const offset = (page - 1) * limit
  
  // Build where clause
  const where: any = {}
  
  // Visibility filter
  if (visibility === 'public') {
    where.isPublic = true
    where.status = 'published'
  }
  
  // Owner filter
  if (ownerId) {
    where.ownerId = ownerId
  }
  
  // Search filter
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { hasSome: [search] } },
    ]
  }
  
  // Category filter
  if (category && category !== 'all') {
    where.category = category
  }
  
  // Framework filter
  if (framework && framework !== 'all') {
    where.framework = framework
  }
  
  // Tags filter
  if (tags && tags.length > 0) {
    where.tags = { hasSome: tags }
  }
  
  // Sort configuration
  let orderBy: any = { createdAt: 'desc' } // default
  
  switch (sort) {
    case 'popular':
      orderBy = [{ views: 'desc' }, { likes: 'desc' }]
      break
    case 'trending':
      // Simple trending algorithm - could be improved
      orderBy = [{ views: 'desc' }, { createdAt: 'desc' }]
      break
    case 'rating':
      orderBy = [{ rating: 'desc' }, { likes: 'desc' }]
      break
    case 'latest':
    default:
      orderBy = { publishedAt: 'desc' }
      break
  }
  
  // Get apps with pagination
  const [apps, total] = await Promise.all([
    db.app.findMany({
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
        version: true,
        status: true,
        views: true,
        downloads: true,
        likes: true,
        rating: true,
        createdAt: true,
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
        _count: {
          select: {
            reviews: true,
            comments: true,
          }
        }
      },
      skip: offset,
      take: limit,
      orderBy,
    }),
    db.app.count({ where }),
  ])
  
  // Get popular categories for sidebar/filtering
  const categories = await db.app.groupBy({
    by: ['category'],
    where: {
      isPublic: true,
      status: 'published',
      category: { not: null },
    },
    _count: {
      category: true,
    },
    orderBy: {
      _count: {
        category: 'desc',
      }
    },
    take: 10,
  })
  
  return success({
    apps,
    categories: categories.map((c: any) => ({
      name: c.category,
      count: c._count.category,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    }
  })
})

// POST /api/apps - Create new app
export const POST = asyncHandler(async (request: NextRequest) => {
  // Rate limiting
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
  if (!rateLimit(`app-creation-${clientIP}`, 10, 60 * 60 * 1000)) {
    return error('Too many app creation attempts', 429, 'RATE_LIMIT_EXCEEDED')
  }
  
  const validationResult = await validateRequest(request, CreateAppSchema)
  if (validationResult.error) return validationResult.error
  
  const appData = validationResult.data
  
  // TODO: Get userId from authenticated session
  // For development, we'll use a dummy user ID
  const ownerId = 'dummy-user-id'
  
  // Generate unique slug
  const baseSlug = appData.name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  
  let slug = baseSlug
  let counter = 1
  
  while (await db.app.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }
  
  // Create app
  const app = await db.app.create({
    data: {
      ...appData,
      slug,
      ownerId,
      // Initialize with empty dependencies array
      dependencies: [],
    },
    select: {
      id: true,
      name: true,
      description: true,
      slug: true,
      category: true,
      tags: true,
      framework: true,
      isPublic: true,
      visibility: true,
      createdAt: true,
      owner: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
        }
      }
    }
  })
  
  return success(app, 201)
})