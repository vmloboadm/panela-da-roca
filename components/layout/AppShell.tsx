'use client'
import type { ReactNode } from 'react'
import { SidebarProvider } from '@/contexts/sidebar-context'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar />
      <div className="md:ml-60 transition-[margin-left] duration-300 ease-in-out">
        <Header />
        <main className="px-4 pt-4 pb-6 max-w-[1100px] mx-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
