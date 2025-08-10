"use client"

import { WindowManagerProvider } from '@/contexts/window-manager'
import { Desktop } from '@/components/desktop/desktop'

export default function DesktopPage() {
  return (
    <WindowManagerProvider>
      <Desktop />
    </WindowManagerProvider>
  )
}