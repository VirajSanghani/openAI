// AI Service Providers Integration

export interface AIProvider {
  name: string
  generateCode(prompt: string, options: GenerationOptions): Promise<GenerationResult>
  isAvailable(): boolean
}

export interface GenerationOptions {
  type: 'app' | 'component' | 'template'
  framework: 'react' | 'vue' | 'angular' | 'svelte'
  style: 'modern' | 'minimal' | 'corporate' | 'creative' | 'dashboard'
  complexity: 'simple' | 'medium' | 'complex'
  features: string[]
  maxTokens?: number
  temperature?: number
}

export interface GenerationResult {
  name: string
  description: string
  files: Record<string, string>
  dependencies: Record<string, string>
  setupInstructions: string
  metadata: {
    tokensUsed: number
    processingTime: number
    model: string
    timestamp: string
  }
}

export class OpenAIProvider implements AIProvider {
  name = 'openai'
  private apiKey: string
  private baseUrl = 'https://api.openai.com/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey !== 'your-openai-key-here'
  }

  async generateCode(prompt: string, options: GenerationOptions): Promise<GenerationResult> {
    const startTime = Date.now()
    
    const systemPrompt = this.buildSystemPrompt(options)
    const userPrompt = this.buildUserPrompt(prompt, options)

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
        response_format: { type: 'json_object' }
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const result = JSON.parse(content)
    const processingTime = Date.now() - startTime

    return {
      ...result,
      metadata: {
        tokensUsed: data.usage?.total_tokens || 0,
        processingTime,
        model: 'gpt-4-turbo-preview',
        timestamp: new Date().toISOString(),
      }
    }
  }

  private buildSystemPrompt(options: GenerationOptions): string {
    return `You are an expert software developer who generates complete, production-ready applications.

Your task is to generate a ${options.type} using ${options.framework} with a ${options.style} design style and ${options.complexity} complexity level.

Requirements:
- Framework: ${options.framework}
- Style: ${options.style}
- Complexity: ${options.complexity}
- Features: ${options.features.join(', ') || 'basic functionality'}

You must respond with a valid JSON object containing:
{
  "name": "string (app name)",
  "description": "string (detailed description)",
  "files": {
    "path/to/file.ext": "string (complete file content)"
  },
  "dependencies": {
    "package-name": "version"
  },
  "setupInstructions": "string (markdown formatted setup guide)"
}

Important guidelines:
1. Generate complete, functional code - no placeholders or TODOs
2. Include proper error handling and TypeScript types
3. Follow modern best practices for the chosen framework
4. Include proper styling and responsive design
5. Add meaningful comments only where complex logic requires explanation
6. Ensure all imports and exports are correct
7. Include package.json with all necessary dependencies
8. Generate a comprehensive README.md file

The generated application should be immediately runnable after npm install.`
  }

  private buildUserPrompt(prompt: string, options: GenerationOptions): string {
    return `Create a ${options.complexity} ${options.type} with the following requirements:

${prompt}

Additional specifications:
- Use ${options.framework} as the main framework
- Apply ${options.style} design patterns
- Include these features: ${options.features.join(', ') || 'basic functionality'}

Generate a complete, production-ready application that fulfills all requirements.`
  }
}

export class AnthropicProvider implements AIProvider {
  name = 'anthropic'
  private apiKey: string
  private baseUrl = 'https://api.anthropic.com/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  isAvailable(): boolean {
    return !!this.apiKey && this.apiKey !== 'your-anthropic-key-here'
  }

  async generateCode(prompt: string, options: GenerationOptions): Promise<GenerationResult> {
    const startTime = Date.now()
    
    const systemPrompt = this.buildSystemPrompt(options)
    const userPrompt = this.buildUserPrompt(prompt, options)

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    const content = data.content[0]?.text

    if (!content) {
      throw new Error('No response from Anthropic')
    }

    // Extract JSON from Claude's response (it might have additional text)
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from Claude response')
    }

    const result = JSON.parse(jsonMatch[0])
    const processingTime = Date.now() - startTime

    return {
      ...result,
      metadata: {
        tokensUsed: data.usage?.output_tokens + data.usage?.input_tokens || 0,
        processingTime,
        model: 'claude-3-opus',
        timestamp: new Date().toISOString(),
      }
    }
  }

  private buildSystemPrompt(options: GenerationOptions): string {
    return `You are an expert software developer who generates complete, production-ready applications.

Your task is to generate a ${options.type} using ${options.framework} with a ${options.style} design style and ${options.complexity} complexity level.

Requirements:
- Framework: ${options.framework}
- Style: ${options.style}
- Complexity: ${options.complexity}
- Features: ${options.features.join(', ') || 'basic functionality'}

You must respond with a valid JSON object containing:
{
  "name": "string (app name)",
  "description": "string (detailed description)",
  "files": {
    "path/to/file.ext": "string (complete file content)"
  },
  "dependencies": {
    "package-name": "version"
  },
  "setupInstructions": "string (markdown formatted setup guide)"
}

Important guidelines:
1. Generate complete, functional code - no placeholders or TODOs
2. Include proper error handling and TypeScript types
3. Follow modern best practices for the chosen framework
4. Include proper styling and responsive design
5. Add meaningful comments only where complex logic requires explanation
6. Ensure all imports and exports are correct
7. Include package.json with all necessary dependencies
8. Generate a comprehensive README.md file

The generated application should be immediately runnable after npm install.`
  }

  private buildUserPrompt(prompt: string, options: GenerationOptions): string {
    return `Create a ${options.complexity} ${options.type} with the following requirements:

${prompt}

Additional specifications:
- Use ${options.framework} as the main framework
- Apply ${options.style} design patterns
- Include these features: ${options.features.join(', ') || 'basic functionality'}

Generate a complete, production-ready application that fulfills all requirements. Respond only with the JSON object, no additional text.`
  }
}

// Provider factory
export class AIProviderFactory {
  static create(provider: string): AIProvider | null {
    switch (provider) {
      case 'openai':
      case 'gpt-4':
        return new OpenAIProvider(process.env['OPENAI_API_KEY'] || '')
      
      case 'anthropic':
      case 'claude-3-opus':
        return new AnthropicProvider(process.env['ANTHROPIC_API_KEY'] || '')
      
      default:
        return null
    }
  }

  static getAvailableProviders(): AIProvider[] {
    const providers = [
      this.create('openai'),
      this.create('anthropic'),
    ].filter((p): p is AIProvider => p !== null && p.isAvailable())

    return providers
  }
}