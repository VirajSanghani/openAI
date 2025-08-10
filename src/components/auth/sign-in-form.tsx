"use client"

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Icons } from '@/components/ui/icons'
import { toast } from 'sonner'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignInValues = z.infer<typeof signInSchema>

interface SignInFormProps {
  callbackUrl?: string
}

export function SignInForm({ callbackUrl = '/' }: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInValues) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else if (result?.ok) {
        // Refresh session and redirect
        await getSession()
        toast.success('Signed in successfully!')
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      setError('An unexpected error occurred')
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    setError(null)

    try {
      await signIn(provider, { callbackUrl })
    } catch (error) {
      setError(`Failed to sign in with ${provider}`)
      console.error(`${provider} sign in error:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="glass-card border-0 shadow-2xl w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-6">
        <div className="mb-4">
          <div className="h-12 w-12 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary-mint/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
            <span className="text-2xl">🔐</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold gradient-text">Welcome Back</CardTitle>
        <CardDescription className="text-base">
          Sign in to your Casual OS account
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                disabled={isLoading}
                className="glass-light border-white/20 bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 h-12"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                disabled={isLoading}
                className="glass-light border-white/20 bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 h-12"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-500 flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            variant="gradient"
            className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-300" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
                Signing you in...
              </>
            ) : (
              <>
                <span className="mr-2">🚀</span>
                Sign In
              </>
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="glass"
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
            className="h-12 hover:scale-105 transition-all duration-300"
          >
            <Icons.google className="mr-2 h-5 w-5" />
            Google
          </Button>
          <Button
            variant="glass"
            onClick={() => handleOAuthSignIn('github')}
            disabled={isLoading}
            className="h-12 hover:scale-105 transition-all duration-300"
          >
            <Icons.github className="mr-2 h-5 w-5" />
            GitHub
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2 text-center text-sm">
        <p className="text-muted-foreground">
          Don&apos;t have an account?{' '}
          <a
            href="/auth/signup"
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </a>
        </p>
        <a
          href="/auth/forgot-password"
          className="text-muted-foreground hover:underline"
        >
          Forgot your password?
        </a>
      </CardFooter>
    </Card>
  )
}