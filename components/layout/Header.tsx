'use client'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/lib/context/sidebar-context'

const PAGE_TITLES: Record<string, string> = {
  '/':             'Dashboard',
  '/estoque':      'Estoque',
  '/fornecedores': 'Fornecedores',
  '/precos':       'Preços',
  '/financeiro':   'Financeiro',
  '/compras':      'Compras',
}

export function Header() {
  const pathname  = usePathname()
  const { openSidebar } = useSidebar()
  const title = PAGE_TITLES[pathname] ?? 'Panela da Roça'

  return (
    <header
      role="banner"
      className="bg-white border-b border-border px-4 h-14 flex items-center gap-3 shadow-sm sticky top-0 z-40"
    >
      <Image
        src="/logo.png"
        alt="Panela da Roça"
        width={32}
        height={32}
        className="rounded-lg shrink-0"
      />
      <span className="font-extrabold text-base text-text-primary flex-1 truncate">{title}</span>

      <div className="flex items-center gap-0.5">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-bg-page text-text-muted text-lg transition-colors"
          aria-label="Chat IA"
        >
          🤖
        </button>
        <button
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-bg-page text-text-muted text-lg transition-colors"
          aria-label="Alertas"
        >
          🔔
        </button>
        <button
          onClick={openSidebar}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-bg-page text-text-muted transition-colors"
          aria-label="Abrir menu"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M2 4.5h14M2 9h14M2 13.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </header>
  )
}
