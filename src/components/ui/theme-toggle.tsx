"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className, ...props }: React.ComponentProps<"button">) {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={cn("h-9 w-9", className)} {...props}>
        <div className="h-4 w-4 opacity-0" />
      </Button>
    )
  }

  const isDark = theme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "relative h-9 w-9 overflow-hidden rounded-full transition-all duration-300 hover:scale-105 hover:bg-primary/10",
        "glass border border-white/10 backdrop-blur-md",
        className
      )}
      onClick={toggleTheme}
      {...props}
    >
      <div className="relative h-full w-full">
        {/* Sun Icon */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out",
            isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          )}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-amber-500"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        </div>

        {/* Moon Icon */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out",
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          )}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-400"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </div>

        {/* Animated Background Glow */}
        <div
          className={cn(
            "absolute inset-0 -z-10 rounded-full transition-all duration-500",
            isDark
              ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 opacity-100"
              : "bg-gradient-to-r from-amber-500/20 to-orange-500/20 opacity-100"
          )}
        />
      </div>

      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
    </div>
  )
}