'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/contexts/sidebar-context'
import { cn } from '@/utils/cn'

const NAV_ITEMS = [
  { href: '/',             icon: '📊', label: 'Dashboard'    },
  { href: '/estoque',      icon: '📦', label: 'Estoque'      },
  { href: '/fornecedores', icon: '🏭', label: 'Fornecedores' },
  { href: '/precos',       icon: '💲', label: 'Preços'       },
  { href: '/compras',      icon: '🛒', label: 'Compras'      },
  { href: '/fechamento',   icon: '📅', label: 'Fechamento'   },
  { href: '/configuracoes',icon: '⚙️', label: 'Config.'      },
]

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggleCollapse } = useSidebar()

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed top-0 left-0 h-screen z-30',
        'bg-bg-card border-r border-border shadow-card',
        'transition-[width] duration-300 ease-in-out overflow-hidden',
        collapsed ? 'w-14' : 'w-60',
      )}
    >
      {/* Logo area */}
      <div className={cn(
        'flex items-center h-14 border-b border-border px-3 gap-2 shrink-0',
        collapsed && 'justify-center',
      )}>
        <span className="text-xl">🍳</span>
        {!collapsed && (
          <span className="text-text-primary font-bold text-sm truncate">Panela da Roça</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 flex flex-col gap-1 overflow-y-auto overflow-x-hidden px-2">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-2 py-2 text-sm transition-colors',
                active
                  ? 'bg-brand text-white font-semibold'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary',
                collapsed && 'justify-center px-0',
              )}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleCollapse}
        aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        className={cn(
          'h-10 border-t border-border text-text-muted hover:text-text-primary hover:bg-bg-hover',
          'flex items-center transition-colors shrink-0',
          collapsed ? 'justify-center' : 'px-4 gap-2',
        )}
      >
        <span className="text-sm">{collapsed ? '→' : '←'}</span>
        {!collapsed && <span className="text-xs">Recolher</span>}
      </button>
    </aside>
  )
}
