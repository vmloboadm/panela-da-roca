'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/cn'

const ABAS = [
  { href: '/',             icon: '🏠', label: 'Dashboard' },
  { href: '/fornecedores', icon: '🏪', label: 'Fornec.' },
  { href: '/precos',       icon: '🔎', label: 'Preços' },
  { href: '/estoque',      icon: '📦', label: 'Estoque' },
  { href: '/financeiro',   icon: '💰', label: 'Financ.' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border h-16 flex items-center shadow-elevated">
      {ABAS.map(aba => {
        const ativo = pathname === aba.href
        return (
          <Link
            key={aba.href}
            href={aba.href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors',
              ativo ? 'text-brand' : 'text-text-faint hover:text-text-muted'
            )}
          >
            <span className="text-lg leading-none">{aba.icon}</span>
            <span className={cn('text-[10px] font-semibold', ativo && 'font-bold')}>{aba.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
