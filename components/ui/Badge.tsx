import { ReactNode } from 'react'

interface BadgeProps {
  color: string
  children: ReactNode
}

export function Badge({ color, children }: BadgeProps) {
  return (
    <span
      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
      className="rounded-[20px] px-[9px] py-[2px] text-[10px] font-extrabold tracking-[0.8px] uppercase"
    >
      {children}
    </span>
  )
}
