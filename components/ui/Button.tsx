import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  children: ReactNode
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-extrabold text-[13px] rounded-lg px-5 py-[10px] cursor-pointer font-sans transition-all whitespace-nowrap disabled:opacity-45 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-gradient-to-br from-brand to-brand-dark text-white border-none',
    ghost:   'bg-bg-hover text-text-muted border border-border hover:text-text-secondary',
    danger:  'bg-danger/20 text-danger-light border border-danger/30 hover:bg-danger/30',
  }
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  )
}
