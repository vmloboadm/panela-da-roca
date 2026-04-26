import { ReactNode } from 'react'

interface SectionTitleProps {
  icon: string
  children: ReactNode
}

export function SectionTitle({ icon, children }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-2 mb-[14px]">
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-extrabold text-text-primary tracking-[2px] uppercase">
        {children}
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
    </div>
  )
}
