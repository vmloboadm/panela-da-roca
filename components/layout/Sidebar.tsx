'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/contexts/sidebar-context'
import { cn } from '@/utils/cn'

const NAV_ITEMS = [
  { href: '/',             icon: '⊞', label: 'Dashboard'    },
  { href: '/estoque',      icon: '◫', label: 'Estoque'      },
  { href: '/fornecedores', icon: '⬡', label: 'Fornecedores' },
  { href: '/precos',       icon: '◈', label: 'Preços'       },
  { href: '/compras',      icon: '⊕', label: 'Compras'      },
  { href: '/fechamento',   icon: '◷', label: 'Fechamento'   },
  { href: '/configuracoes',icon: '◎', label: 'Config.'      },
]

export function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggleCollapse } = useSidebar()

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed top-0 left-0 h-screen z-30',
        'bg-bg-card border-r border-border',
        'transition-[width] duration-300 ease-in-out overflow-hidden',
        collapsed ? 'w-14' : 'w-56',
      )}
      style={{ boxShadow: '4px 0 24px hsl(0 0% 0% / 0.3)' }}
    >
      {/* Logo area */}
      <div className={cn(
        'flex items-center h-14 border-b border-border px-3 gap-2.5 shrink-0',
        collapsed && 'justify-center',
      )}>
        <div className={cn(
          'shrink-0 rounded-lg overflow-hidden',
          collapsed ? 'w-8 h-8' : 'w-8 h-8',
        )}>
          <Image
            src="/logo.png"
            alt="Panela da Roça"
            width={32}
            height={32}
            className="object-cover w-full h-full"
            priority
          />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-text-primary font-extrabold text-[13px] leading-tight truncate">Panela da Roça</p>
            <p className="text-text-muted text-[10px] leading-tight">Gestão inteligente</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden px-2">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm transition-all duration-200 group',
                active
                  ? 'bg-brand/15 text-brand font-semibold'
                  : 'text-text-muted hover:bg-bg-hover hover:text-text-primary',
                collapsed && 'justify-center px-0',
              )}
            >
              {active && (
                <span className="absolute left-0 h-6 w-0.5 bg-brand rounded-r-full" />
              )}
              <span className={cn(
                'text-[15px] font-mono shrink-0 transition-transform duration-200',
                active ? 'text-brand' : 'group-hover:scale-110',
              )}>{item.icon}</span>
              {!collapsed && <span className="truncate text-[13px]">{item.label}</span>}
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
        <svg
          viewBox="0 0 16 16"
          className={cn(
            'w-3.5 h-3.5 transition-transform duration-300',
            collapsed ? 'rotate-0' : 'rotate-180',
          )}
          fill="currentColor"
        >
          <path d="M6 8l4-4v8L6 8z" />
        </svg>
        {!collapsed && <span className="text-[11px]">Recolher</span>}
      </button>
    </aside>
  )
}
