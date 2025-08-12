import React from 'react'
import { cn } from '@/shared/lib/utils'

interface BackgroundProps {
  className?: string
  children?: React.ReactNode
}

export const Background: React.FC<BackgroundProps> = ({ className, children }) => {
  return (
    <div className={cn('relative min-h-screen w-full bg-[#1e1e1e]', className)}>

      <div className="relative z-0">
        {children}
      </div>
    </div>
  )
}
