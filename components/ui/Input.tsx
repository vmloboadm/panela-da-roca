import { InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'bg-white border border-border rounded-xl px-[13px] py-[10px]',
        'text-text-primary text-[13px] outline-none font-sans w-full',
        'focus:border-border-focus focus:ring-2 focus:ring-brand/15 transition-colors',
        'placeholder:text-text-faint',
        className
      )}
      {...props}
    />
  )
}
