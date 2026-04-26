import { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('bg-bg-card border border-border rounded-xl p-4', className)} {...props}>
      {children}
    </div>
  )
}
