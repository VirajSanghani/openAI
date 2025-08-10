import { SignInForm } from '@/components/auth/sign-in-form'
import { Navigation } from '@/components/layout/navigation'
import { Suspense } from 'react'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navigation />
      
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 right-20 w-64 h-64 bg-gradient-to-br from-primary/30 via-primary-mint/20 to-transparent rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 left-20 w-80 h-80 bg-gradient-to-br from-primary-violet/20 via-primary-rose/15 to-transparent rounded-full blur-3xl animate-bounce-soft" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-primary-sunrise/10 via-primary/5 to-primary-mint/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center py-12">
        <div className="mx-auto flex w-full max-w-md flex-col justify-center space-y-8">
          {/* Header */}
          <div className="text-center animate-fade-in">
            <Link href="/" className="inline-flex items-center space-x-2 mb-8">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary-mint to-primary-sunrise p-0.5">
                <div className="h-full w-full rounded-lg bg-background/90 flex items-center justify-center">
                  <span className="text-lg font-bold gradient-text">C</span>
                </div>
              </div>
              <span className="text-2xl font-bold gradient-text">Casual OS</span>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to continue building amazing applications
            </p>
          </div>
          
          <div className="animate-fade-in animate-stagger-1">
            <Suspense fallback={
              <div className="glass-card rounded-xl p-8">
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </div>
            }>
              <SignInForm />
            </Suspense>
          </div>
          
          {/* Footer Links */}
          <div className="text-center text-sm text-muted-foreground animate-fade-in animate-stagger-2">
            <p>
              Don't have an account?{' '}
              <Link href="/auth/signup" className="font-medium text-primary hover:underline">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}