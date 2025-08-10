"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ColorPicker } from "@/components/ui/color-picker"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

const navigation = [
  { name: "Home", href: "/" },
  { name: "Generate", href: "/generate" },
  { name: "Builder", href: "/builder" },
  { name: "Desktop", href: "/desktop" },
  { name: "Templates", href: "/templates" },
  { name: "Game Rules", href: "/game-rules" },
  { name: "Explore", href: "/explore" },
  { name: "Docs", href: "/docs" },
]

export function Navigation() {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 ease-in-out",
        isScrolled
          ? "glass-strong shadow-lg shadow-black/5 border-b border-white/10"
          : "glass-light border-b border-white/5"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center space-x-3">
            <div className="relative">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary via-primary-mint to-primary-sunrise p-0.5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <div className="h-full w-full rounded-md bg-background/90 flex items-center justify-center">
                  <span className="text-sm font-bold gradient-text">C</span>
                </div>
              </div>
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-primary via-primary-mint to-primary-sunrise opacity-20 blur transition-all duration-300 group-hover:opacity-40 group-hover:blur-md" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Casual OS
              </span>
              <span className="text-xs text-muted-foreground -mt-1">AI-Powered</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "relative px-4 py-2 transition-all duration-200 hover:bg-white/10",
                    pathname === item.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.name}
                  {pathname === item.href && (
                    <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                  )}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:block">
              <ColorPicker />
            </div>
            <ThemeToggle />
            
            <div className="hidden sm:flex items-center space-x-2">
              <Link href="/auth/signin">
                <Button variant="ghost" className="hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button 
                  variant="gradient" 
                  className="shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:shadow-xl transition-all duration-300"
                >
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className="relative h-4 w-4">
                <span
                  className={cn(
                    "absolute block h-0.5 w-4 bg-current transition-all duration-300 ease-out",
                    isMobileMenuOpen ? "top-2 rotate-45" : "top-0"
                  )}
                />
                <span
                  className={cn(
                    "absolute top-1.5 block h-0.5 w-4 bg-current transition-all duration-300 ease-out",
                    isMobileMenuOpen ? "opacity-0" : "opacity-100"
                  )}
                />
                <span
                  className={cn(
                    "absolute block h-0.5 w-4 bg-current transition-all duration-300 ease-out",
                    isMobileMenuOpen ? "top-2 -rotate-45" : "top-3"
                  )}
                />
              </div>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isMobileMenuOpen ? "max-h-64 opacity-100 pb-4" : "max-h-0 opacity-0"
          )}
        >
          <nav className="flex flex-col space-y-2 pt-2 border-t border-white/10">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start hover:bg-white/10",
                    pathname === item.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
            
            <div className="flex flex-col space-y-2 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm text-muted-foreground">Customize</span>
                <ColorPicker />
              </div>
              <Link href="/auth/signin">
                <Button variant="ghost" className="w-full justify-start hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="gradient" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
