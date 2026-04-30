'use client'
import { SidebarProvider } from '@/lib/context/sidebar-context'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Header />
      <Sidebar />
      <main className="px-4 py-4 max-w-[1100px] mx-auto pb-6">
        {children}
      </main>
    </SidebarProvider>
  )
}
