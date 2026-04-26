import { InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'bg-bg-input border border-border-light rounded-lg px-[13px] py-[10px]',
        'text-text-primary text-[13px] outline-none font-sans w-full',
        'focus:border-border-focus transition-colors',
        className
      )}
      {...props}
    />
  )
}
