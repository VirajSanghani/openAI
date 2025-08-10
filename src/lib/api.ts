import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Response helpers
export function success(data: any, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function error(message: string, status = 400, code?: string) {
  return NextResponse.json(
    { 
      success: false, 
      error: { message, code } 
    },
    { status }
  )
}

// Validation helper
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { data }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        error: error(
          'Invalid request data',
          400,
          'VALIDATION_ERROR'
        )
      }
    }
    return {
      error: error('Invalid JSON', 400, 'PARSE_ERROR')
    }
  }
}

// Rate limiting
const rateLimits = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): boolean {
  const now = Date.now()
  const key = identifier
  
  const current = rateLimits.get(key)
  
  if (!current || now > current.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= limit) {
    return false
  }
  
  current.count++
  return true
}

// Auth helpers
export function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

// Error types
export class AppError extends Error {
  constructor(
    message: string,
    public status: number = 400,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'AUTH_ERROR')
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not found') {
    super(message, 404, 'NOT_FOUND_ERROR')
  }
}

// Async handler wrapper
export function asyncHandler(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context)
    } catch (err) {
      console.error('API Error:', err)
      
      if (err instanceof AppError) {
        return error(err.message, err.status, err.code)
      }
      
      return error('Internal server error', 500, 'INTERNAL_ERROR')
    }
  }
}