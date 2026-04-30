'use client'
import { createContext, useContext, useState, useCallback } from 'react'

interface SidebarContextValue {
  isOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
}

const SidebarContext = createContext<SidebarContextValue>({
  isOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
})

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const openSidebar  = useCallback(() => setIsOpen(true),  [])
  const closeSidebar = useCallback(() => setIsOpen(false), [])
  return (
    <SidebarContext.Provider value={{ isOpen, openSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)
