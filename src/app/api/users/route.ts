import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { asyncHandler, success, error, validateRequest, rateLimit } from '@/lib/api'
import bcrypt from 'bcryptjs'

// Schema definitions
const CreateUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(8),
  displayName: z.string().optional(),
})

const GetUsersQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
})

// GET /api/users - List users with pagination and search
export const GET = asyncHandler(async (request: NextRequest) => {
  const url = new URL(request.url)
  const query = Object.fromEntries(url.searchParams)
  
  const validationResult = GetUsersQuerySchema.safeParse(query)
  if (!validationResult.success) {
    return error('Invalid query parameters', 400)
  }
  
  const { page, limit, search } = validationResult.data
  const offset = (page - 1) * limit
  
  // Build where clause
  const where = search ? {
    OR: [
      { username: { contains: search, mode: 'insensitive' as const } },
      { displayName: { contains: search, mode: 'insensitive' as const } },
      { email: { contains: search, mode: 'insensitive' as const } },
    ]
  } : {}
  
  // Get users with pagination
  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        website: true,
        location: true,
        isVerified: true,
        isPremium: true,
        createdAt: true,
        lastActiveAt: true,
        _count: {
          select: {
            apps: true,
            followers: true,
            follows: true,
          }
        }
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    db.user.count({ where }),
  ])
  
  return success({
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    }
  })
})

// POST /api/users - Create new user
export const POST = asyncHandler(async (request: NextRequest) => {
  // Rate limiting
  const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
  if (!rateLimit(`user-creation-${clientIP}`, 5, 60 * 60 * 1000)) {
    return error('Too many user creation attempts', 429, 'RATE_LIMIT_EXCEEDED')
  }
  
  const validationResult = await validateRequest(request, CreateUserSchema)
  if (validationResult.error) return validationResult.error
  
  const { email, username, password, displayName } = validationResult.data
  
  // Check if user already exists
  const existingUser = await db.user.findFirst({
    where: {
      OR: [
        { email },
        { username },
      ]
    }
  })
  
  if (existingUser) {
    return error('User already exists with this email or username', 409, 'USER_EXISTS')
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 12)
  
  // Create user
  const user = await db.user.create({
    data: {
      email,
      username,
      passwordHash,
      displayName: displayName || username,
      preferences: {
        create: {
          theme: 'system',
          language: 'en',
          timezone: 'UTC',
        }
      },
      subscription: {
        create: {
          plan: 'free',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        }
      }
    },
    select: {
      id: true,
      username: true,
      email: true,
      displayName: true,
      createdAt: true,
    }
  })
  
  return success(user, 201)
})