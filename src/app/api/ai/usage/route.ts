import { NextRequest } from 'next/server'
import { z } from 'zod'
import { asyncHandler, success } from '@/lib/api'
import { requireAuth } from '@/lib/auth-middleware'
import { AIGenerationService } from '@/lib/ai/service'

const GetUsageQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month']).default('month'),
})

// GET /api/ai/usage - Get user's AI usage statistics
export const GET = asyncHandler(async (request: NextRequest) => {
  const user = await requireAuth(request)
  
  const url = new URL(request.url)
  const query = Object.fromEntries(url.searchParams)
  
  const validationResult = GetUsageQuerySchema.safeParse(query)
  if (!validationResult.success) {
    return success({ error: 'Invalid query parameters' }, 400)
  }
  
  const { period } = validationResult.data
  
  const stats = await AIGenerationService.getUsageStats(user.id, period)
  
  return success(stats)
})