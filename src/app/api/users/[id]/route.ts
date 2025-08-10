import { NextRequest } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { asyncHandler, success, error, validateRequest, NotFoundError } from '@/lib/api'

// Schema definitions
const UpdateUserSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().max(100).optional(),
  avatar: z.string().url().optional(),
})

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/users/[id] - Get user by ID
export const GET = asyncHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = params
  
  const user = await db.user.findUnique({
    where: { id },
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
          templates: true,
          components: true,
          followers: true,
          follows: true,
          reviews: true,
        }
      },
      apps: {
        where: {
          isPublic: true,
          status: 'published',
        },
        select: {
          id: true,
          name: true,
          description: true,
          slug: true,
          icon: true,
          category: true,
          tags: true,
          views: true,
          likes: true,
          rating: true,
          createdAt: true,
          publishedAt: true,
        },
        orderBy: {
          publishedAt: 'desc',
        },
        take: 6, // Latest 6 published apps
      }
    }
  })
  
  if (!user) {
    throw new NotFoundError('User not found')
  }
  
  return success(user)
})

// PATCH /api/users/[id] - Update user profile
export const PATCH = asyncHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = params
  
  // TODO: Add authentication middleware to verify user owns this profile
  // For now, we'll allow any update for development
  
  const validationResult = await validateRequest(request, UpdateUserSchema)
  if (validationResult.error) return validationResult.error
  
  const updateData = validationResult.data
  
  // Check if user exists
  const existingUser = await db.user.findUnique({
    where: { id },
    select: { id: true }
  })
  
  if (!existingUser) {
    throw new NotFoundError('User not found')
  }
  
  // Update user
  const updatedUser = await db.user.update({
    where: { id },
    data: {
      ...updateData,
      // Clean up empty strings
      website: updateData.website === '' ? null : updateData.website,
    },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatar: true,
      bio: true,
      website: true,
      location: true,
      updatedAt: true,
    }
  })
  
  return success(updatedUser)
})

// DELETE /api/users/[id] - Delete user account
export const DELETE = asyncHandler(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { id } = params
  
  // TODO: Add authentication middleware to verify user owns this account
  // TODO: Add proper cascade deletion logic for user data
  
  const existingUser = await db.user.findUnique({
    where: { id },
    select: { id: true }
  })
  
  if (!existingUser) {
    throw new NotFoundError('User not found')
  }
  
  // For now, we'll just mark the user as inactive
  // In production, you'd want to handle data retention policies
  await db.user.update({
    where: { id },
    data: {
      // Anonymize user data
      email: `deleted-${id}@example.com`,
      username: `deleted-${id}`,
      displayName: 'Deleted User',
      bio: null,
      website: null,
      location: null,
      avatar: null,
    }
  })
  
  return success({ message: 'User account deleted successfully' })
})