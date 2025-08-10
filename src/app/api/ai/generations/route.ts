import { NextRequest } from 'next/server'
import { z } from 'zod'
import { asyncHandler, success } from '@/lib/api'
import { requireAuth } from '@/lib/auth-middleware'
import { AIGenerationService } from '@/lib/ai/service'

const GetGenerationsQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  type: z.enum(['app', 'component', 'template']).optional(),
  status: z.enum(['pending', 'completed', 'failed']).optional(),
})

// GET /api/ai/generations - Get user's AI generation history
export const GET = asyncHandler(async (request: NextRequest) => {
  const user = await requireAuth(request)
  
  const url = new URL(request.url)
  const query = Object.fromEntries(url.searchParams)
  
  const validationResult = GetGenerationsQuerySchema.safeParse(query)
  if (!validationResult.success) {
    return success({ error: 'Invalid query parameters' }, 400)
  }
  
  const { page, limit, type, status } = validationResult.data
  
  const result = await AIGenerationService.getGenerationHistory(user.id, {
    page,
    limit,
    type,
    status,
  })
  
  return success(result)
})