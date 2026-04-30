'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/cn'
import { useSidebar } from '@/lib/context/sidebar-context'

const LINKS = [
  { href: '/',             icon: '📊', label: 'Dashboard' },
  { href: '/estoque',      icon: '📦', label: 'Estoque' },
  { href: '/compras',      icon: '🛒', label: 'Compras',           soon: true },
  { href: '/fornecedores', icon: '🏪', label: 'Fornecedores' },
  { href: '/precos',       icon: '🔎', label: 'Preços' },
  { href: '/financeiro',   icon: '💰', label: 'Financeiro' },
  { href: '/fichas',       icon: '🍽️',  label: 'Fichas Técnicas',  soon: true },
  { href: '/ia',           icon: '🤖', label: 'IA',                soon: true },
]

export function Sidebar() {
  const { isOpen, closeSidebar } = useSidebar()
  const pathname = usePathname()

  // Fecha ao pressionar Esc — cleanup no unmount e quando isOpen muda
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSidebar() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, closeSidebar])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        role="presentation"
        className="fixed inset-0 z-40 bg-black/40"
        onClick={closeSidebar}
      />
      {/* Drawer */}
      <aside
        aria-label="Menu principal"
        className="fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-elevated flex flex-col"
      >
        {/* Header do drawer */}
        <div className="bg-gradient-to-r from-brand to-brand-dark px-5 h-14 flex items-center shrink-0">
          <span className="text-white font-extrabold text-base">🍳 Panela da Roça</span>
        </div>

        {/* Links */}
        <nav className="flex-1 overflow-y-auto py-3">
          {LINKS.map(link => {
            const ativo = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.soon ? '#' : link.href}
                onClick={link.soon ? undefined : closeSidebar}
                aria-disabled={link.soon}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors',
                  link.soon
                    ? 'opacity-40 cursor-default pointer-events-none text-text-faint'
                    : ativo
                      ? 'text-brand bg-brand/5 border-r-2 border-brand'
                      : 'text-text-secondary hover:bg-bg-page hover:text-text-primary'
                )}
              >
                <span className="text-base leading-none">{link.icon}</span>
                <span className="flex-1">{link.label}</span>
                {link.soon && (
                  <span className="text-[9px] bg-border text-text-faint px-1.5 py-0.5 rounded">
                    em breve
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Configurações */}
        <div className="border-t border-border p-3 shrink-0">
          <Link
            href="/configuracoes"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-3 py-2 text-sm text-text-faint hover:text-text-muted rounded-lg hover:bg-bg-page transition-colors"
          >
            <span>⚙️</span>
            <span>Configurações</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
