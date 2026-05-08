'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const LS_KEY = 'panela_sidebar_collapsed'

interface SidebarContextValue {
  collapsed: boolean
  toggleCollapse: () => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  // Read from localStorage on mount (client only)
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY)
    if (stored === 'true') setCollapsed(true)
  }, [])

  const toggleCollapse = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem(LS_KEY, String(next))
      return next
    })
  }, [])

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapse }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used inside SidebarProvider')
  return ctx
}
