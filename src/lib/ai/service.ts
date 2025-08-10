import { db } from '@/lib/db'
import { AIProviderFactory, type GenerationOptions, type GenerationResult } from './providers'
import { getSubscriptionLimits } from '@/lib/auth-middleware'

export class AIGenerationService {
  static async generateApp(
    userId: string,
    prompt: string,
    options: GenerationOptions & {
      model?: string
    }
  ): Promise<{
    generation: any
    result: GenerationResult
    app?: any
  }> {
    // Check user subscription and limits
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const limits = getSubscriptionLimits(user.subscription?.plan || 'free')
    
    // Check if user has exceeded AI generation limits
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const monthlyGenerations = await db.aiGeneration.count({
      where: {
        userId,
        createdAt: {
          gte: currentMonth
        },
        status: 'completed'
      }
    })

    if (monthlyGenerations >= limits.aiGenerations) {
      throw new Error('Monthly AI generation limit exceeded. Please upgrade your subscription.')
    }

    // Create generation record
    const generation = await db.aiGeneration.create({
      data: {
        userId,
        prompt,
        type: options.type,
        model: options.model || 'gpt-4',
        parameters: JSON.parse(JSON.stringify(options)),
        status: 'pending',
      }
    })

    try {
      // Get AI provider
      const providerName = options.model?.startsWith('claude') ? 'anthropic' : 'openai'
      const provider = AIProviderFactory.create(providerName)

      if (!provider || !provider.isAvailable()) {
        throw new Error(`AI provider ${providerName} is not available`)
      }

      // Generate using AI
      const result = await provider.generateCode(prompt, options)

      // Update generation record with results
      const completedGeneration = await db.aiGeneration.update({
        where: { id: generation.id },
        data: {
          status: 'completed',
          result: JSON.parse(JSON.stringify(result)),
          tokensUsed: result.metadata.tokensUsed,
          processingTime: result.metadata.processingTime,
          completedAt: new Date(),
        }
      })

      // Track usage metrics
      await db.usageMetric.create({
        data: {
          userId,
          type: 'ai_generation',
          value: 1,
          unit: 'request',
          metadata: {
            model: options.model || 'gpt-4',
            tokensUsed: result.metadata.tokensUsed,
            type: options.type,
          }
        }
      })

      await db.usageMetric.create({
        data: {
          userId,
          type: 'ai_tokens',
          value: result.metadata.tokensUsed,
          unit: 'tokens',
          metadata: {
            model: options.model || 'gpt-4',
            generationId: generation.id,
          }
        }
      })

      // Create app if generation type is 'app'
      let createdApp = null
      if (options.type === 'app') {
        createdApp = await this.createAppFromGeneration(userId, result, options, generation.id)
      }

      return {
        generation: completedGeneration,
        result,
        app: createdApp,
      }

    } catch (error) {
      // Update generation record with error
      await db.aiGeneration.update({
        where: { id: generation.id },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
        }
      })

      throw error
    }
  }

  private static async createAppFromGeneration(
    userId: string,
    result: GenerationResult,
    options: GenerationOptions,
    generationId: string
  ) {
    // Generate unique slug
    const baseSlug = result.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    
    let slug = baseSlug
    let counter = 1
    
    while (await db.app.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Create app with files
    const app = await db.app.create({
      data: {
        name: result.name,
        description: result.description,
        slug,
        ownerId: userId,
        framework: options.framework,
        category: 'ai-generated',
        tags: ['ai-generated', options.framework, options.style],
        prompt: options.type === 'app' ? `Generated from: ${generationId}` : undefined,
        aiModel: result.metadata.model,
        generationConfig: JSON.parse(JSON.stringify(options)),
        dependencies: Object.keys(result.dependencies || {}),
        status: 'draft',
        visibility: 'private',
        // Create app files
        files: {
          create: Object.entries(result.files).map(([path, content]) => ({
            path,
            content,
            size: content.length,
            mimeType: this.getMimeType(path),
            isDirectory: false,
          }))
        }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        framework: true,
        tags: true,
        createdAt: true,
        _count: {
          select: {
            files: true
          }
        }
      }
    })

    return app
  }

  static async getGenerationHistory(
    userId: string,
    options: {
      page?: number
      limit?: number
      type?: string
      status?: string
    } = {}
  ) {
    const { page = 1, limit = 10, type, status } = options
    const offset = (page - 1) * limit

    const where: any = { userId }
    if (type) where.type = type
    if (status) where.status = status

    const [generations, total] = await Promise.all([
      db.aiGeneration.findMany({
        where,
        select: {
          id: true,
          prompt: true,
          type: true,
          model: true,
          status: true,
          tokensUsed: true,
          processingTime: true,
          error: true,
          createdAt: true,
          completedAt: true,
          result: true,
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.aiGeneration.count({ where }),
    ])

    return {
      generations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    }
  }

  static async getUsageStats(userId: string, period: 'day' | 'week' | 'month' = 'month') {
    const now = new Date()
    let startDate = new Date()

    switch (period) {
      case 'day':
        startDate.setDate(now.getDate() - 1)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
    }

    const [generations, tokens, user] = await Promise.all([
      db.aiGeneration.count({
        where: {
          userId,
          createdAt: { gte: startDate },
          status: 'completed'
        }
      }),
      db.usageMetric.aggregate({
        where: {
          userId,
          type: 'ai_tokens',
          timestamp: { gte: startDate }
        },
        _sum: { value: true }
      }),
      db.user.findUnique({
        where: { id: userId },
        include: { subscription: true }
      })
    ])

    const limits = getSubscriptionLimits(user?.subscription?.plan || 'free')

    return {
      period,
      usage: {
        generations: {
          used: generations,
          limit: limits.aiGenerations,
          remaining: Math.max(0, limits.aiGenerations - generations)
        },
        tokens: {
          used: tokens._sum.value || 0,
          // Tokens don't have hard limits, but we track them
        }
      },
      subscription: {
        plan: user?.subscription?.plan || 'free',
        status: user?.subscription?.status || 'active'
      }
    }
  }

  private static getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
      'ts': 'application/typescript',
      'tsx': 'application/typescript',
      'js': 'application/javascript',
      'jsx': 'application/javascript',
      'json': 'application/json',
      'css': 'text/css',
      'scss': 'text/scss',
      'sass': 'text/sass',
      'html': 'text/html',
      'md': 'text/markdown',
      'vue': 'text/x-vue',
      'svelte': 'text/x-svelte',
      'py': 'text/x-python',
      'java': 'text/x-java',
      'go': 'text/x-go',
      'rs': 'text/x-rust',
      'php': 'text/x-php',
      'rb': 'text/x-ruby',
      'yml': 'application/yaml',
      'yaml': 'application/yaml',
      'xml': 'application/xml',
      'svg': 'image/svg+xml',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'ico': 'image/x-icon',
    }
    return mimeTypes[ext || ''] || 'text/plain'
  }
}