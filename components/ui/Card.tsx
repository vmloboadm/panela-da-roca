import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-bg-card border border-border rounded-xl shadow-card p-4', className)}>
      {children}
    </div>
  )
}
