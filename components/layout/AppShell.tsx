'use client'
import type { ReactNode } from 'react'
import { SidebarProvider } from '@/lib/context/sidebar-context'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Header />
      <Sidebar />
      <main className="px-4 pt-4 pb-6 max-w-[1100px] mx-auto">
        {children}
      </main>
    </SidebarProvider>
  )
}
