/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react'

// Must mock localStorage before importing the module
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  configurable: true,
  writable: true,
})

import React from 'react'
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-context'

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(SidebarProvider, null, children)
}

describe('SidebarProvider', () => {
  beforeEach(() => localStorageMock.clear())

  it('starts expanded by default', () => {
    const { result } = renderHook(() => useSidebar(), { wrapper })
    expect(result.current.collapsed).toBe(false)
  })

  it('toggleCollapse flips collapsed state', () => {
    const { result } = renderHook(() => useSidebar(), { wrapper })
    act(() => result.current.toggleCollapse())
    expect(result.current.collapsed).toBe(true)
    act(() => result.current.toggleCollapse())
    expect(result.current.collapsed).toBe(false)
  })

  it('persists collapsed state to localStorage', () => {
    const { result } = renderHook(() => useSidebar(), { wrapper })
    act(() => result.current.toggleCollapse())
    expect(localStorageMock.getItem('panela_sidebar_collapsed')).toBe('true')
  })

  it('reads initial state from localStorage', () => {
    localStorageMock.setItem('panela_sidebar_collapsed', 'true')
    const { result } = renderHook(() => useSidebar(), { wrapper })
    expect(result.current.collapsed).toBe(true)
  })
})
