'use client'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSidebar } from '@/contexts/sidebar-context'

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
  const { toggleCollapse } = useSidebar()
  const title = PAGE_TITLES[pathname] ?? 'Panela da Roça'

  return (
    <header
      role="banner"
      className="bg-bg-card border-b border-border px-4 h-14 flex items-center gap-3 shadow-card sticky top-0 z-40"
    >
      <button
        onClick={toggleCollapse}
        aria-label="Abrir menu"
        className="md:hidden p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
      >
        ☰
      </button>

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
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-bg-hover text-text-muted text-lg transition-colors"
          aria-label="Chat IA"
        >
          🤖
        </button>
        <button
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-bg-hover text-text-muted text-lg transition-colors"
          aria-label="Alertas"
        >
          🔔
        </button>
      </div>
    </header>
  )
}
