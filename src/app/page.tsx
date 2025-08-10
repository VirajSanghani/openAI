import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/layout/navigation"

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Navigation */}
      <Navigation />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10">
        {/* Primary gradient orb */}
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-primary/30 via-primary-mint/20 to-transparent blur-3xl animate-pulse-glow" />
        
        {/* Secondary gradient orb */}
        <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-primary-violet/20 via-primary-sunrise/10 to-transparent blur-3xl animate-float" />
        
        {/* Tertiary accent orb */}
        <div className="absolute bottom-10 right-1/3 w-64 h-64 rounded-full bg-gradient-to-br from-primary-rose/25 via-primary-mint/15 to-transparent blur-2xl animate-bounce-soft" />
        
        {/* Liquid background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="liquid-bg h-full w-full bg-gradient-to-br from-primary via-primary-mint to-primary-sunrise" />
        </div>
      </div>

      {/* Hero Section */}
      <main className="flex-1 relative">
        <section className="container mx-auto px-4 py-24 lg:py-32">
          <div className="mx-auto max-w-5xl text-center relative flex flex-col items-center justify-center">
            {/* Floating decorative elements */}
            <div className="absolute -top-12 left-1/4 w-20 h-20 bg-gradient-to-br from-primary-mint/30 to-primary/20 rounded-full blur-xl animate-float animate-stagger-1" />
            <div className="absolute top-8 right-1/4 w-16 h-16 bg-gradient-to-br from-primary-violet/40 to-primary-rose/20 rounded-full blur-lg animate-bounce-soft animate-stagger-3" />
            <div className="absolute -bottom-8 left-1/3 w-12 h-12 bg-gradient-to-br from-primary-sunrise/50 to-primary-mint/30 rounded-full blur-md animate-float animate-stagger-2" />
            
            <div className="animate-fade-in">
              <h1 className="text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl mb-8">
                <span className="block animate-slide-up">Build Apps with</span>
                <span className="block mt-2 animate-slide-up animate-stagger-2">
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-primary via-primary-mint to-primary-sunrise bg-clip-text text-transparent animate-pulse-glow">
                      Natural Language
                    </span>
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary-mint/20 to-primary-sunrise/20 rounded-lg blur-xl -z-10" />
                  </span>
                </span>
              </h1>
            </div>
            
            <div className="animate-fade-in animate-stagger-3">
              <p className="mx-auto max-w-3xl text-xl sm:text-2xl text-muted-foreground leading-relaxed font-light">
                Create sophisticated, production-ready applications through natural language descriptions. 
                <br className="hidden sm:block" />
                <span className="text-primary/80 font-medium">Democratizing software creation</span> with the power of AI.
              </p>
            </div>
            
            <div className="mt-12 flex flex-col items-center gap-6 sm:flex-row sm:justify-center animate-fade-in animate-stagger-4">
              <Link href="/generate">
                <Button 
                  size="xl" 
                  variant="gradient" 
                  className="group w-full sm:w-auto text-lg px-10 py-4 shadow-2xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
                >
                  <span className="mr-2">✨</span>
                  Generate an App Now
                  <svg
                    className="ml-2 -mr-1 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </Link>
              
              <Link href="/auth/signup">
                <Button 
                  size="xl" 
                  variant="glass"
                  className="w-full sm:w-auto text-lg px-10 py-4 hover:scale-105 transition-all duration-300"
                >
                  Start Free Trial
                </Button>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-16 animate-fade-in animate-stagger-5">
              <p className="text-sm text-muted-foreground mb-6">Trusted by developers worldwide</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm">Live</span>
                </div>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm">1000+ Apps Generated</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm">99.9% Uptime</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="relative py-24 overflow-hidden">
          {/* Section background */}
          <div className="absolute inset-0 glass-light" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary-violet/10 via-primary/5 to-primary-mint/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative flex flex-col items-center">
            <div className="mx-auto max-w-3xl text-center animate-fade-in">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                <span className="bg-gradient-to-r from-foreground via-primary to-primary-mint bg-clip-text text-transparent">
                  How It Works
                </span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Transform your ideas into working applications in three simple steps
              </p>
            </div>
            
            <div className="mx-auto mt-20 grid max-w-6xl gap-8 lg:grid-cols-3">
              {/* Step 1 */}
              <div className="group relative animate-fade-in animate-stagger-1">
                <Card className="glass-card border-0 p-8 h-full relative overflow-hidden">
                  {/* Card glow effect */}
                  <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-primary-mint/20 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardHeader className="relative z-10 pb-6">
                    <div className="relative mb-6">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-mint/20 to-primary/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <span className="text-3xl">💭</span>
                      </div>
                      <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-primary-mint/30 to-primary/20 opacity-0 group-hover:opacity-100 blur-lg transition-all duration-500" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 rounded-full bg-primary-mint/20 flex items-center justify-center text-xs font-bold text-primary-mint">1</div>
                        <CardTitle className="text-xl">Describe Your App</CardTitle>
                      </div>
                      <CardDescription className="text-base leading-relaxed">
                        Tell us what you want to build using natural language
                      </CardDescription>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    <div className="rounded-lg bg-background/50 backdrop-blur-sm border border-white/10 p-4">
                      <p className="text-sm text-muted-foreground italic">
                        &ldquo;I want a todo app with dark mode, categories, and due dates&rdquo;
                      </p>
                    </div>
                  </CardContent>
                  
                  {/* Step connector */}
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                    <svg className="w-8 h-8 text-primary/40" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </Card>
              </div>

              {/* Step 2 */}
              <div className="group relative animate-fade-in animate-stagger-2">
                <Card className="glass-card border-0 p-8 h-full relative overflow-hidden">
                  <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-primary/20 via-primary-violet/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardHeader className="relative z-10 pb-6">
                    <div className="relative mb-6">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary-violet/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <span className="text-3xl">🤖</span>
                      </div>
                      <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-primary/30 to-primary-violet/20 opacity-0 group-hover:opacity-100 blur-lg transition-all duration-500" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">2</div>
                        <CardTitle className="text-xl">AI Generates Code</CardTitle>
                      </div>
                      <CardDescription className="text-base leading-relaxed">
                        Our AI creates complete, production-ready code
                      </CardDescription>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    <div className="rounded-lg bg-background/50 backdrop-blur-sm border border-white/10 p-4">
                      <p className="text-sm text-muted-foreground">
                        React, TypeScript, styling, and all necessary files
                      </p>
                      <div className="mt-3 flex space-x-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                        <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse animate-stagger-1" />
                        <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse animate-stagger-2" />
                      </div>
                    </div>
                  </CardContent>
                  
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                    <svg className="w-8 h-8 text-primary/40" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </Card>
              </div>

              {/* Step 3 */}
              <div className="group relative animate-fade-in animate-stagger-3">
                <Card className="glass-card border-0 p-8 h-full relative overflow-hidden">
                  <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-primary-sunrise/20 via-primary-rose/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardHeader className="relative z-10 pb-6">
                    <div className="relative mb-6">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-sunrise/20 to-primary-rose/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <span className="text-3xl">🚀</span>
                      </div>
                      <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-primary-sunrise/30 to-primary-rose/20 opacity-0 group-hover:opacity-100 blur-lg transition-all duration-500" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-6 rounded-full bg-primary-sunrise/20 flex items-center justify-center text-xs font-bold text-primary-sunrise">3</div>
                        <CardTitle className="text-xl">Deploy & Share</CardTitle>
                      </div>
                      <CardDescription className="text-base leading-relaxed">
                        Deploy instantly or download source code
                      </CardDescription>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    <div className="rounded-lg bg-background/50 backdrop-blur-sm border border-white/10 p-4">
                      <p className="text-sm text-muted-foreground">
                        One-click deployment or export to GitHub
                      </p>
                      <div className="mt-3 flex items-center space-x-2 text-xs text-green-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span>Ready to deploy</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Templates Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 glass-dark" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-primary-rose/10 via-primary-sunrise/5 to-primary-violet/10 rounded-full blur-3xl" />
          
          <div className="container mx-auto px-4 relative">
            <div className="mx-auto max-w-3xl text-center animate-fade-in">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                <span className="bg-gradient-to-r from-primary-sunrise via-primary-rose to-primary-violet bg-clip-text text-transparent">
                  Ready-Made Templates
                </span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                Don't want to start from scratch? Choose from our collection of production-ready app templates
              </p>
            </div>
            
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
              {/* Todo App Template */}
              <div className="group animate-fade-in animate-stagger-1">
                <Card className="glass-card border-0 p-6 h-full relative overflow-hidden group-hover:scale-105 transition-all duration-300">
                  <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-primary-mint/20 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardHeader className="relative z-10 text-center pb-4">
                    <div className="text-5xl mb-4">✅</div>
                    <CardTitle className="text-xl">Todo Manager</CardTitle>
                    <CardDescription className="text-sm">
                      Full-featured task management with priorities and categories
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative z-10 text-center">
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">React</Badge>
                      <Badge variant="outline" className="text-xs">Local Storage</Badge>
                      <Badge variant="outline" className="text-xs">Dark Mode</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Instant deployment • Fully customizable
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Note Taking Template */}
              <div className="group animate-fade-in animate-stagger-2">
                <Card className="glass-card border-0 p-6 h-full relative overflow-hidden group-hover:scale-105 transition-all duration-300">
                  <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-primary/20 to-primary-violet/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardHeader className="relative z-10 text-center pb-4">
                    <div className="text-5xl mb-4">📝</div>
                    <CardTitle className="text-xl">Note Taker</CardTitle>
                    <CardDescription className="text-sm">
                      Rich text editor with markdown support and search
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative z-10 text-center">
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">Markdown</Badge>
                      <Badge variant="outline" className="text-xs">Export</Badge>
                      <Badge variant="outline" className="text-xs">Categories</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Auto-save • Favorites • Tags
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Calculator Template */}
              <div className="group animate-fade-in animate-stagger-3">
                <Card className="glass-card border-0 p-6 h-full relative overflow-hidden group-hover:scale-105 transition-all duration-300">
                  <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-primary-sunrise/20 to-primary-rose/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardHeader className="relative z-10 text-center pb-4">
                    <div className="text-5xl mb-4">🔢</div>
                    <CardTitle className="text-xl">Calculator</CardTitle>
                    <CardDescription className="text-sm">
                      Scientific calculator with history and themes
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative z-10 text-center">
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">Scientific</Badge>
                      <Badge variant="outline" className="text-xs">Memory</Badge>
                      <Badge variant="outline" className="text-xs">Keyboard</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      History tracking • Multiple themes
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="text-center mt-12 animate-fade-in animate-stagger-4">
              <Link href="/templates">
                <Button 
                  size="lg" 
                  variant="glass"
                  className="text-lg px-8 py-3 hover:scale-105 transition-all duration-300"
                >
                  <span className="mr-2">📱</span>
                  Browse All Templates
                  <svg
                    className="ml-2 -mr-1 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </Link>
              
              <p className="text-sm text-muted-foreground mt-4">
                More templates added regularly • All source code included
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative glass-light border-t border-white/10 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-4">
              {/* Brand */}
              <div className="lg:col-span-2">
                <Link href="/" className="flex items-center space-x-3 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary via-primary-mint to-primary-sunrise p-0.5">
                    <div className="h-full w-full rounded-md bg-background/90 flex items-center justify-center">
                      <span className="text-sm font-bold gradient-text">C</span>
                    </div>
                  </div>
                  <span className="text-xl font-bold gradient-text">Casual OS</span>
                </Link>
                <p className="text-muted-foreground max-w-md leading-relaxed">
                  The future of application development. Create sophisticated, production-ready apps through natural language with the power of AI.
                </p>
                <div className="flex space-x-4 mt-6">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-white/10">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-white/10">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.887 2.750.099.120.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.167-1.507-.7-2.448-2.78-2.448-4.958 0-3.771 2.737-7.229 7.892-7.229 4.144 0 7.365 2.953 7.365 6.899 0 4.117-2.595 7.431-6.199 7.431-1.211 0-2.348-.63-2.738-1.378 0 0-.599 2.282-.744 2.840-.282 1.084-1.064 2.456-1.549 3.235C9.584 23.815 10.77 24.001 12.017 24.001c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.017z"/>
                    </svg>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-white/10">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.5.75C6.146.75 1 5.896 1 12.25c0 5.089 3.292 9.387 7.863 10.91.575-.11.575-.7.575-.927v-3.3c-3.225.697-3.9-1.55-3.9-1.55-.525-1.325-1.275-1.675-1.275-1.675-1.050-.7.075-.7.075-.7 1.150.075 1.775 1.175 1.775 1.175 1.025 1.775 2.725 1.275 3.375.975.1-.75.425-1.275.775-1.55-2.575-.275-5.275-1.275-5.275-5.75 0-1.275.475-2.325 1.175-3.125-.125-.275-.525-1.425.1-2.975 0 0 .975-.3 3.2 1.175.925-.25 1.925-.375 2.925-.375s2 .125 2.925.375c2.225-1.475 3.2-1.175 3.2-1.175.625 1.55.225 2.7.1 2.975.725.8 1.175 1.85 1.175 3.125 0 4.5-2.725 5.475-5.325 5.75.425.375.8 1.1.8 2.225v3.3c0 .225 0 .825.575.925C20.708 21.637 24 17.339 24 12.25 24 5.896 18.854.75 12.5.75z"/>
                    </svg>
                  </Button>
                </div>
              </div>
              
              {/* Quick Links */}
              <div>
                <h3 className="font-semibold mb-4 text-foreground">Platform</h3>
                <ul className="space-y-3 text-sm">
                  <li><Link href="/generate" className="text-muted-foreground hover:text-primary transition-colors">Generate Apps</Link></li>
                  <li><Link href="/explore" className="text-muted-foreground hover:text-primary transition-colors">Explore Gallery</Link></li>
                  <li><Link href="/templates" className="text-muted-foreground hover:text-primary transition-colors">Templates</Link></li>
                  <li><Link href="/components" className="text-muted-foreground hover:text-primary transition-colors">Components</Link></li>
                </ul>
              </div>
              
              {/* Resources */}
              <div>
                <h3 className="font-semibold mb-4 text-foreground">Resources</h3>
                <ul className="space-y-3 text-sm">
                  <li><Link href="/docs" className="text-muted-foreground hover:text-primary transition-colors">Documentation</Link></li>
                  <li><Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
                  <li><Link href="/community" className="text-muted-foreground hover:text-primary transition-colors">Community</Link></li>
                  <li><Link href="/support" className="text-muted-foreground hover:text-primary transition-colors">Support</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
              <p className="text-sm text-muted-foreground">
                © 2024 Casual OS. Built with AI for the future of software development.
              </p>
              <div className="flex space-x-6 mt-4 sm:mt-0 text-sm">
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link>
                <Link href="/security" className="text-muted-foreground hover:text-primary transition-colors">Security</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}