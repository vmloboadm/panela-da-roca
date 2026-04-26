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
        'border rounded-[20px] px-3 py-1 text-xs font-semibold cursor-pointer transition-all font-sans',
        selected
          ? 'bg-brand text-black border-brand'
          : 'bg-brand/[0.13] border-brand/[0.33] text-brand hover:bg-brand/[0.27]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
