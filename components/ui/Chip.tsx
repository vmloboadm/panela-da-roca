import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
  children: ReactNode
}

export function Chip({ selected = false, className, children, ...props }: ChipProps) {
  return (
    <button
      className={cn(
        'border rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all font-sans',
        selected
          ? 'bg-brand text-white border-brand'
          : 'bg-border/60 border-border text-text-secondary hover:border-brand hover:text-brand',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
