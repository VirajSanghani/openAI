import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { AuthError, ForbiddenError } from '@/lib/api'

export interface AuthUser {
  id: string
  email: string
  username: string
  isPremium: boolean
  isEnterprise: boolean
  plan: string
}

// Middleware to require authentication
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const token = await getToken({ 
    req: request, 
    secret: process.env['NEXTAUTH_SECRET']
  })

  if (!token || !token.userId) {
    throw new AuthError('Authentication required')
  }

  return {
    id: token.userId as string,
    email: token.email as string,
    username: token.username as string,
    isPremium: token.isPremium as boolean,
    isEnterprise: token.isEnterprise as boolean,
    plan: token.plan as string,
  }
}

// Middleware to require premium subscription
export async function requirePremium(request: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(request)

  if (!user.isPremium && !user.isEnterprise) {
    throw new ForbiddenError('Premium subscription required')
  }

  return user
}

// Middleware to require enterprise subscription
export async function requireEnterprise(request: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(request)

  if (!user.isEnterprise) {
    throw new ForbiddenError('Enterprise subscription required')
  }

  return user
}

// Helper to check if user owns a resource
export async function requireOwnership(
  request: NextRequest,
  resourceUserId: string
): Promise<AuthUser> {
  const user = await requireAuth(request)

  if (user.id !== resourceUserId) {
    throw new ForbiddenError('You do not own this resource')
  }

  return user
}

// Rate limiting by user
const userRateLimits = new Map<string, { count: number; resetTime: number }>()

export function rateLimitByUser(
  userId: string,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now()
  const key = `user-${userId}`
  
  const current = userRateLimits.get(key)
  
  if (!current || now > current.resetTime) {
    userRateLimits.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= limit) {
    return false
  }
  
  current.count++
  return true
}

// Subscription-based rate limiting
export function getSubscriptionLimits(plan: string) {
  switch (plan) {
    case 'enterprise':
      return {
        apiCalls: 10000,
        aiGenerations: 1000,
        storageGB: 1000,
        collaborators: -1, // unlimited
      }
    case 'pro':
      return {
        apiCalls: 1000,
        aiGenerations: 100,
        storageGB: 10,
        collaborators: 10,
      }
    case 'free':
    default:
      return {
        apiCalls: 100,
        aiGenerations: 10,
        storageGB: 1,
        collaborators: 3,
      }
  }
}