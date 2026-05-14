import { SelectHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode
}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'bg-bg-hover border border-border rounded-xl px-[13px] py-[10px]',
        'text-text-primary text-[13px] outline-none font-sans w-full',
        'focus:border-border-focus focus:ring-2 focus:ring-brand/15 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
