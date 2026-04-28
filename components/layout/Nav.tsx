'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/cn'

const ABAS = [
  { href: '/',             label: '🏠 Dashboard' },
  { href: '/fornecedores', label: '🏪 Fornecedores' },
  { href: '/precos',       label: '🔎 Preços' },
  { href: '/estoque',      label: '📦 Estoque' },
  { href: '/financeiro',   label: '💰 Financeiro' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="bg-bg-card border-b border-border px-6 flex overflow-x-auto">
      {ABAS.map(aba => (
        <Link
          key={aba.href}
          href={aba.href}
          className={cn(
            'border-b-2 px-[18px] py-3 text-[13px] font-bold whitespace-nowrap transition-colors',
            pathname === aba.href
              ? 'text-brand border-brand'
              : 'text-text-faint border-transparent hover:text-text-muted'
          )}
        >
          {aba.label}
        </Link>
      ))}
    </nav>
  )
}
