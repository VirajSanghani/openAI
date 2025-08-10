"use client"

import React from 'react'
import { Button } from '@/components/ui/button'

export default function TestPage() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold text-center mb-8">Game Rule System Test</h1>
      <div className="text-center">
        <Button>Test Button</Button>
        <p className="mt-4">If you see this page, basic components are working.</p>
      </div>
    </div>
  )
}