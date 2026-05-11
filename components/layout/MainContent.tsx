'use client'

import { useSidebar } from '@/contexts/sidebar-context'
import { cn } from '@/utils/cn'

export function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()
  return (
    <div
      className={cn(
        'transition-[margin-left] duration-300 ease-in-out',
        collapsed ? 'md:ml-14' : 'md:ml-60',
      )}
    >
      {children}
    </div>
  )
}
