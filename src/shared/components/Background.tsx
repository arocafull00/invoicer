import React from 'react'
import { cn } from '@/shared/lib/utils'

interface BackgroundProps {
  className?: string
  children?: React.ReactNode
}

export const Background: React.FC<BackgroundProps> = ({ className, children }) => {
  return (
    <div className={cn('relative min-h-screen w-full', className)}>
      {/* Radial gradient background using theme colors */}
      <div
        className="pointer-events-none absolute top-0 z-[-2] h-screen w-screen bg-background"
        style={
          {
            ['--radial-start' as any]: 'oklch(from var(--primary) l c h / 0.30)',
            ['--radial-end' as any]: 'oklch(from var(--background) l c h / 0)',
          } as React.CSSProperties
        }
      >
        <div className="h-full w-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,var(--radial-start),var(--radial-end))]" />
      </div>

      <div className="relative z-0">
        {children}
      </div>
    </div>
  )
}


