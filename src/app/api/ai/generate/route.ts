import { NextRequest } from 'next/server'
import { z } from 'zod'
import { asyncHandler, success, error, validateRequest } from '@/lib/api'
import { requireAuth, rateLimitByUser } from '@/lib/auth-middleware'
import { AIGenerationService } from '@/lib/ai/service'

// Schema definitions
const GenerateAppSchema = z.object({
  prompt: z.string().min(10).max(2000),
  type: z.enum(['app', 'component', 'template']).default('app'),
  framework: z.enum(['react', 'vue', 'angular', 'svelte']).default('react'),
  style: z.enum(['modern', 'minimal', 'corporate', 'creative', 'dashboard']).default('modern'),
  complexity: z.enum(['simple', 'medium', 'complex']).default('medium'),
  features: z.array(z.string()).default([]),
  model: z.enum(['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet']).default('gpt-4'),
})


// POST /api/ai/generate - Generate app/component/template using AI
export const POST = asyncHandler(async (request: NextRequest) => {
  // Require authentication
  const user = await requireAuth(request)
  
  // User-specific rate limiting
  if (!rateLimitByUser(user.id, 10, 60 * 60 * 1000)) { // 10 requests per hour for authenticated users
    return error('AI generation rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED')
  }
  
  const validationResult = await validateRequest(request, GenerateAppSchema)
  if (validationResult.error) return validationResult.error
  
  const generateParams = validationResult.data
  
  try {
    const result = await AIGenerationService.generateApp(user.id, generateParams.prompt, {
      ...generateParams,
      type: generateParams.type || 'app',
      framework: generateParams.framework || 'react',
      style: generateParams.style || 'modern',
      complexity: generateParams.complexity || 'medium',
      features: generateParams.features || [],
      model: generateParams.model
    })
    
    return success({
      generation: {
        id: result.generation.id,
        status: result.generation.status,
        tokensUsed: result.generation.tokensUsed,
        processingTime: result.generation.processingTime,
      },
      result: result.result,
      app: result.app,
    })
    
  } catch (err) {
    if (err instanceof Error) {
      return error(err.message, 400, 'GENERATION_ERROR')
    }
    throw err
  }
})

