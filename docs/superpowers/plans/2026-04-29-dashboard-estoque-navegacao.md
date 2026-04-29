# Dashboard, Estoque e Navegação — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o BottomNav por header fixo + sidebar drawer, implementar dashboard com saudação/alertas/KPIs/gráfico e melhorar o estoque com hero terracota + cards aprimorados.

**Architecture:** React Context (sem libs externas) gerencia o estado do sidebar. Utilitários puros (`utils/saudacao.ts`, `utils/estoque-status.ts`) encapsulam lógica testável. Componentes de dashboard e estoque são client components que lêem Firestore via `useEffect`/`getDocs` seguindo o padrão existente do projeto.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS (tokens Terra Clara), Firebase Firestore, React Testing Library + Jest.

---

## Chunk 1: Navegação Global

### Task 1: SidebarContext

**Files:**
- Create: `lib/context/sidebar-context.tsx`
- Test: `__tests__/lib/sidebar-context.test.tsx`

- [ ] **Step 1: Criar diretório e escrever o teste**

```bash
mkdir -p "__tests__/lib"
```

Criar `__tests__/lib/sidebar-context.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { SidebarProvider, useSidebar } from '@/lib/context/sidebar-context'

function Probe() {
  const { isOpen, openSidebar, closeSidebar } = useSidebar()
  return (
    <div>
      <span data-testid="state">{isOpen ? 'open' : 'closed'}</span>
      <button onClick={openSidebar}>abrir</button>
      <button onClick={closeSidebar}>fechar</button>
    </div>
  )
}

describe('SidebarContext', () => {
  it('começa fechado', () => {
    render(<SidebarProvider><Probe /></SidebarProvider>)
    expect(screen.getByTestId('state')).toHaveTextContent('closed')
  })

  it('abre ao chamar openSidebar', () => {
    render(<SidebarProvider><Probe /></SidebarProvider>)
    fireEvent.click(screen.getByText('abrir'))
    expect(screen.getByTestId('state')).toHaveTextContent('open')
  })

  it('fecha ao chamar closeSidebar', () => {
    render(<SidebarProvider><Probe /></SidebarProvider>)
    fireEvent.click(screen.getByText('abrir'))
    fireEvent.click(screen.getByText('fechar'))
    expect(screen.getByTestId('state')).toHaveTextContent('closed')
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

```bash
npx jest __tests__/lib/sidebar-context.test.tsx --no-coverage
```

Esperado: FAIL — `Cannot find module '@/lib/context/sidebar-context'`

- [ ] **Step 3: Criar `lib/context/sidebar-context.tsx`**

```tsx
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
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

```bash
npx jest __tests__/lib/sidebar-context.test.tsx --no-coverage
```

Esperado: PASS — 3 testes passando

- [ ] **Step 5: Commit**

```bash
git add lib/context/sidebar-context.tsx __tests__/lib/sidebar-context.test.tsx
git commit -m "feat: SidebarContext — React Context para estado do sidebar"
```

---

### Task 2: Sidebar Component

**Files:**
- Create: `components/layout/Sidebar.tsx`
- Test: `__tests__/components/layout/Sidebar.test.tsx`

- [ ] **Step 1: Criar diretório e escrever o teste**

```bash
mkdir -p "__tests__/components/layout"
```

Criar `__tests__/components/layout/Sidebar.test.tsx`:

```tsx
import { useEffect } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { SidebarProvider, useSidebar } from '@/lib/context/sidebar-context'
import { Sidebar } from '@/components/layout/Sidebar'

jest.mock('next/navigation', () => ({ usePathname: () => '/' }))

// Abre o sidebar ao montar — imports no topo, hooks no nível do componente
function OpenHelper() {
  const { openSidebar } = useSidebar()
  useEffect(() => { openSidebar() }, [openSidebar])
  return null
}

function Wrapper({ open = false }: { open?: boolean }) {
  return (
    <SidebarProvider>
      {open && <OpenHelper />}
      <Sidebar />
    </SidebarProvider>
  )
}

describe('Sidebar', () => {
  it('não renderiza quando fechado', () => {
    render(<Wrapper open={false} />)
    expect(screen.queryByRole('navigation')).toBeNull()
  })

  it('renderiza links de navegação quando aberto', () => {
    render(<Wrapper open={true} />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Estoque')).toBeInTheDocument()
    expect(screen.getByText('Fornecedores')).toBeInTheDocument()
  })

  it('fecha ao clicar no overlay', () => {
    render(<Wrapper open={true} />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('presentation'))  // overlay aria-hidden div
    expect(screen.queryByRole('navigation')).toBeNull()
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

```bash
npx jest __tests__/components/layout/Sidebar.test.tsx --no-coverage
```

Esperado: FAIL — `Cannot find module '@/components/layout/Sidebar'`

- [ ] **Step 3: Criar `components/layout/Sidebar.tsx`**

```tsx
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
        className="fixed inset-0 z-40 bg-black/40"
        onClick={closeSidebar}
        aria-hidden="true"
      />
      {/* Drawer */}
      <aside
        role="navigation"
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
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

```bash
npx jest __tests__/components/layout/Sidebar.test.tsx --no-coverage
```

Esperado: PASS

- [ ] **Step 5: Commit**

```bash
git add components/layout/Sidebar.tsx __tests__/components/layout/Sidebar.test.tsx
git commit -m "feat: Sidebar drawer com overlay e Esc handler"
```

---

### Task 3: Header Redesign

**Files:**
- Modify: `components/layout/Header.tsx`
- Test: `__tests__/components/layout/Header.test.tsx`

- [ ] **Step 1: Escrever o teste**

Criar `__tests__/components/layout/Header.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { SidebarProvider, useSidebar } from '@/lib/context/sidebar-context'
import { Header } from '@/components/layout/Header'

jest.mock('next/navigation', () => ({ usePathname: () => '/estoque' }))
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}))

function Wrapper() {
  return <SidebarProvider><Header /></SidebarProvider>
}

describe('Header', () => {
  it('exibe o título da rota atual', () => {
    render(<Wrapper />)
    expect(screen.getByText('Estoque')).toBeInTheDocument()
  })

  it('tem height fixo h-14 via classe', () => {
    render(<Wrapper />)
    const header = screen.getByRole('banner')
    expect(header.className).toContain('h-14')
  })

  it('botão de menu chama openSidebar', () => {
    // Verifica que o botão de menu existe e é clicável
    render(<Wrapper />)
    const menuBtn = screen.getByLabelText('Abrir menu')
    expect(menuBtn).toBeInTheDocument()
    fireEvent.click(menuBtn) // não lança erro
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

```bash
npx jest __tests__/components/layout/Header.test.tsx --no-coverage
```

Esperado: FAIL — testes falham pois Header atual não tem h-14, useSidebar, etc.

- [ ] **Step 3: Substituir `components/layout/Header.tsx` completo**

```tsx
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
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

```bash
npx jest __tests__/components/layout/Header.test.tsx --no-coverage
```

Esperado: PASS — 3 testes passando

- [ ] **Step 5: Commit**

```bash
git add components/layout/Header.tsx __tests__/components/layout/Header.test.tsx
git commit -m "feat: Header redesenhado — h-14, título dinâmico, botões ação"
```

---

### Task 4: AppShell + Migração do Layout

**Files:**
- Create: `components/layout/AppShell.tsx`
- Modify: `app/layout.tsx`
- Delete: `components/layout/BottomNav.tsx`
- Delete: `components/layout/Nav.tsx`

> Nota: O estoque tem sub-tabs em `fixed bottom-16` que ficam temporariamente visíveis no meio da tela após remover o BottomNav. Isso é normalizado na Task 12.

- [ ] **Step 1: Escrever teste mínimo do AppShell**

Criar `__tests__/components/layout/AppShell.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { AppShell } from '@/components/layout/AppShell'

jest.mock('next/navigation', () => ({ usePathname: () => '/' }))
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}))

describe('AppShell', () => {
  it('renderiza o conteúdo filho', () => {
    render(<AppShell><p>conteúdo teste</p></AppShell>)
    expect(screen.getByText('conteúdo teste')).toBeInTheDocument()
  })

  it('renderiza o Header', () => {
    render(<AppShell><span /></AppShell>)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

```bash
npx jest __tests__/components/layout/AppShell.test.tsx --no-coverage
```

Esperado: FAIL — `Cannot find module '@/components/layout/AppShell'`

- [ ] **Step 3: Criar `components/layout/AppShell.tsx`**

```tsx
'use client'
import { SidebarProvider } from '@/lib/context/sidebar-context'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Header />
      <Sidebar />
      <main className="px-4 py-4 max-w-[1100px] mx-auto pb-6">
        {children}
      </main>
    </SidebarProvider>
  )
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

```bash
npx jest __tests__/components/layout/AppShell.test.tsx --no-coverage
```

Esperado: PASS — 2 testes passando

- [ ] **Step 6: Atualizar `app/layout.tsx`**

Substituir o conteúdo por:

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { AppShell } from '@/components/layout/AppShell'

export const metadata: Metadata = {
  title: 'Panela da Roça — Sistema Inteligente',
  description: 'Gestão inteligente de compras, estoque e custos',
  manifest: '/manifest.json',
}

export const viewport = {
  themeColor: '#FFF8F0',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg-page">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
```

- [ ] **Step 7: Verificar imports de BottomNav/Nav ANTES de deletar**

```bash
grep -r "BottomNav\|from.*\/Nav" app/ components/ __tests__/ --include="*.tsx" --include="*.ts"
```

Esperado: nenhum resultado (ou apenas os próprios arquivos que serão deletados)

- [ ] **Step 8: Deletar BottomNav.tsx e Nav.tsx**

```bash
rm components/layout/BottomNav.tsx
rm components/layout/Nav.tsx
```

- [ ] **Step 9: Verificar build sem erros de TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem erros

- [ ] **Step 10: Rodar todos os testes**

```bash
npx jest --no-coverage
```

Esperado: todos passando

- [ ] **Step 11: Commit**

```bash
git add components/layout/AppShell.tsx __tests__/components/layout/AppShell.test.tsx app/layout.tsx
git rm components/layout/BottomNav.tsx components/layout/Nav.tsx
git commit -m "feat: AppShell com Sidebar — remove BottomNav, migra layout global"
```

---

## Chunk 2: Dashboard

### Task 5: Utilitário de Saudação + SaudacaoHero

**Files:**
- Create: `utils/saudacao.ts`
- Test: `__tests__/utils/saudacao.test.ts`
- Create: `components/dashboard/SaudacaoHero.tsx`

- [ ] **Step 1: Escrever o teste da função getSaudacao**

```bash
mkdir -p "__tests__/utils"
mkdir -p "components/dashboard"
```

Criar `__tests__/utils/saudacao.test.ts`:

```ts
import { getSaudacao } from '@/utils/saudacao'

function makeDate(hour: number, dayOfWeek: number): Date {
  const d = new Date(2026, 3, 27) // segunda-feira base
  // Ajustar para o dia da semana desejado: 0=dom, 1=seg...
  d.setDate(d.getDate() + (dayOfWeek - d.getDay() + 7) % 7)
  d.setHours(hour, 0, 0, 0)
  return d
}

describe('getSaudacao', () => {
  it('retorna "Bom dia" antes das 12h', () => {
    expect(getSaudacao(makeDate(9, 1)).texto).toBe('Bom dia')
    expect(getSaudacao(makeDate(9, 1)).emoji).toBe('🌅')
  })

  it('retorna "Boa tarde" entre 12h e 17h59', () => {
    expect(getSaudacao(makeDate(14, 1)).texto).toBe('Boa tarde')
    expect(getSaudacao(makeDate(14, 1)).emoji).toBe('☀️')
  })

  it('retorna "Boa noite" a partir das 18h', () => {
    expect(getSaudacao(makeDate(20, 1)).texto).toBe('Boa noite')
    expect(getSaudacao(makeDate(20, 1)).emoji).toBe('🌙')
  })

  it('adiciona extra no domingo', () => {
    const domingo = makeDate(10, 0)
    expect(getSaudacao(domingo).extra).toBe('Dia de churrasco! 🔥')
  })

  it('sem extra em dias úteis', () => {
    const segunda = makeDate(10, 1)
    expect(getSaudacao(segunda).extra).toBeUndefined()
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

```bash
npx jest __tests__/utils/saudacao.test.ts --no-coverage
```

Esperado: FAIL — `Cannot find module '@/utils/saudacao'`

- [ ] **Step 3: Criar `utils/saudacao.ts`**

```ts
export interface SaudacaoResult {
  texto: string
  emoji: string
  extra?: string
}

export function getSaudacao(date: Date): SaudacaoResult {
  const hora = date.getHours()
  const isDomingo = date.getDay() === 0

  let texto: string
  let emoji: string

  if (hora < 12) {
    texto = 'Bom dia'
    emoji = '🌅'
  } else if (hora < 18) {
    texto = 'Boa tarde'
    emoji = '☀️'
  } else {
    texto = 'Boa noite'
    emoji = '🌙'
  }

  return { texto, emoji, extra: isDomingo ? 'Dia de churrasco! 🔥' : undefined }
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

```bash
npx jest __tests__/utils/saudacao.test.ts --no-coverage
```

Esperado: PASS — 5 testes passando

- [ ] **Step 5: Criar `components/dashboard/SaudacaoHero.tsx`**

```tsx
'use client'
import { getSaudacao } from '@/utils/saudacao'
import { fmtBRL } from '@/utils/calculos'

interface SaudacaoHeroProps {
  metaDia: number
}

export function SaudacaoHero({ metaDia }: SaudacaoHeroProps) {
  const agora = new Date()
  const { texto, emoji, extra } = getSaudacao(agora)
  const hoje = agora.toLocaleDateString('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'short',
  })

  return (
    <div className="bg-gradient-to-br from-brand to-brand-dark rounded-2xl p-5 text-white">
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
        {hoje.toUpperCase()} · PANELA DA ROÇA
      </p>
      <p className="text-2xl font-extrabold mt-1">{texto}! {emoji}</p>
      {extra && (
        <p className="text-sm opacity-90 mt-0.5">{extra}</p>
      )}
      <p className="text-sm opacity-80 mt-2">
        Meta do dia: <span className="font-bold">{fmtBRL(metaDia)}</span>
      </p>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add utils/saudacao.ts __tests__/utils/saudacao.test.ts components/dashboard/SaudacaoHero.tsx
git commit -m "feat: getSaudacao util + SaudacaoHero component"
```

---

### Task 6: AlertasCriticos

**Files:**
- Create: `components/dashboard/AlertasCriticos.tsx`
- Test: `__tests__/components/dashboard/AlertasCriticos.test.tsx`

- [ ] **Step 1: Criar diretório e escrever o teste**

```bash
mkdir -p "__tests__/components/dashboard"
```

Criar `__tests__/components/dashboard/AlertasCriticos.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { AlertasCriticos } from '@/components/dashboard/AlertasCriticos'
import { Produto } from '@/types'

const base: Produto = {
  id: '1', nome: 'Fraldinha', categoria: 'Carnes',
  unidade_padrao: 'kg', estoque_atual: 0.3, estoque_minimo: 2,
  custo_medio: 35, ativo: true,
}

describe('AlertasCriticos', () => {
  it('exibe "Tudo ok" quando sem alertas', () => {
    render(<AlertasCriticos produtosAbaixoMinimo={[]} />)
    expect(screen.getByText(/tudo ok/i)).toBeInTheDocument()
  })

  it('exibe produto crítico pelo nome', () => {
    render(<AlertasCriticos produtosAbaixoMinimo={[base]} />)
    expect(screen.getByText(/fraldinha/i)).toBeInTheDocument()
  })

  it('exibe mensagem de baixo estoque quando há produtos baixos', () => {
    const baixo: Produto = { ...base, id: '2', nome: 'Costela', estoque_atual: 1.2 }
    render(<AlertasCriticos produtosAbaixoMinimo={[baixo]} />)
    expect(screen.getByText(/estoque baixo/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

```bash
npx jest __tests__/components/dashboard/AlertasCriticos.test.tsx --no-coverage
```

Esperado: FAIL

- [ ] **Step 3: Criar `components/dashboard/AlertasCriticos.tsx`**

```tsx
import { Produto } from '@/types'

interface AlertasCriticosProps {
  produtosAbaixoMinimo: Produto[]
}

export function AlertasCriticos({ produtosAbaixoMinimo }: AlertasCriticosProps) {
  // Crítico: abaixo de 50% do mínimo
  const criticos = produtosAbaixoMinimo.filter(
    p => p.estoque_atual < p.estoque_minimo * 0.5
  )
  // Baixo: entre 50% e 100% do mínimo
  const baixos = produtosAbaixoMinimo.filter(
    p => p.estoque_atual >= p.estoque_minimo * 0.5
  )

  return (
    <div className="bg-white rounded-xl shadow-card p-4">
      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wide mb-3">
        O que precisa de atenção
      </p>
      <div className="flex flex-col gap-2">
        {produtosAbaixoMinimo.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span>🟢</span>
            <span>Tudo ok no estoque</span>
          </div>
        ) : (
          <>
            {criticos.slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center gap-2 text-sm text-text-primary">
                <span>🔴</span>
                <span>{p.nome} abaixo do mínimo</span>
              </div>
            ))}
            {criticos.length > 3 && (
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span>🔴</span>
                <span>e mais {criticos.length - 3} produto{criticos.length - 3 > 1 ? 's' : ''} críticos</span>
              </div>
            )}
            {baixos.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-text-primary">
                <span>🟡</span>
                <span>{baixos.length} produto{baixos.length > 1 ? 's' : ''} com estoque baixo</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

```bash
npx jest __tests__/components/dashboard/AlertasCriticos.test.tsx --no-coverage
```

Esperado: PASS — 3 testes passando

- [ ] **Step 5: Commit**

```bash
git add components/dashboard/AlertasCriticos.tsx __tests__/components/dashboard/AlertasCriticos.test.tsx
git commit -m "feat: AlertasCriticos component com estados ok/baixo/crítico"
```

---

### Task 7: KpiStrip + GraficoSemanal

**Files:**
- Create: `components/dashboard/KpiStrip.tsx`
- Create: `components/dashboard/GraficoSemanal.tsx`
- Test: `__tests__/components/dashboard/KpiStrip.test.tsx`

- [ ] **Step 1: Escrever o teste do KpiStrip**

Criar `__tests__/components/dashboard/KpiStrip.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { KpiStrip } from '@/components/dashboard/KpiStrip'

describe('KpiStrip', () => {
  it('exibe "—" quando faturamento é null', () => {
    render(<KpiStrip faturamento={null} cmv={null} totalAlertas={0} />)
    // Dois "—" (faturamento e cmv)
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2)
  })

  it('exibe faturamento formatado quando disponível', () => {
    render(<KpiStrip faturamento={4280} cmv={null} totalAlertas={0} />)
    expect(screen.getByText(/4\.280/)).toBeInTheDocument()
  })

  it('exibe CMV em %', () => {
    render(<KpiStrip faturamento={null} cmv={34} totalAlertas={0} />)
    expect(screen.getByText('34%')).toBeInTheDocument()
  })

  it('exibe totalAlertas', () => {
    render(<KpiStrip faturamento={null} cmv={null} totalAlertas={4} />)
    expect(screen.getByText('4')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

```bash
npx jest __tests__/components/dashboard/KpiStrip.test.tsx --no-coverage
```

Esperado: FAIL

- [ ] **Step 3: Criar `components/dashboard/KpiStrip.tsx`**

```tsx
import { fmtBRL } from '@/utils/calculos'

interface KpiStripProps {
  faturamento: number | null
  cmv: number | null
  totalAlertas: number
}

export function KpiStrip({ faturamento, cmv, totalAlertas }: KpiStripProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="bg-white rounded-xl shadow-card p-3 text-center">
        <p className="text-lg leading-none mb-1">💰</p>
        <p className="text-base font-extrabold text-text-primary leading-tight">
          {faturamento !== null ? fmtBRL(faturamento) : '—'}
        </p>
        <p className="text-[10px] text-text-muted mt-0.5">faturamento</p>
      </div>

      <div className="bg-white rounded-xl shadow-card p-3 text-center">
        <p className="text-lg leading-none mb-1">📊</p>
        <p className={[
          'text-base font-extrabold leading-tight',
          cmv !== null && cmv > 35 ? 'text-warning' : 'text-text-primary',
        ].join(' ')}>
          {cmv !== null ? `${cmv.toFixed(0)}%` : '—'}
        </p>
        <p className="text-[10px] text-text-muted mt-0.5">CMV</p>
      </div>

      <div className="bg-white rounded-xl shadow-card p-3 text-center">
        <p className="text-lg leading-none mb-1">⚠️</p>
        <p className={[
          'text-base font-extrabold leading-tight',
          totalAlertas > 0 ? 'text-warning' : 'text-text-primary',
        ].join(' ')}>
          {totalAlertas}
        </p>
        <p className="text-[10px] text-text-muted mt-0.5">alertas</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

```bash
npx jest __tests__/components/dashboard/KpiStrip.test.tsx --no-coverage
```

Esperado: PASS — 4 testes passando

- [ ] **Step 5: Criar `components/dashboard/GraficoSemanal.tsx`**

> Sem testes automatizados — componente puramente visual com CSS. Validar visualmente após assembly.

```tsx
interface GraficoSemanalProps {
  dados: number[]   // 7 valores, do mais antigo ao mais recente (hoje = dados[6])
  loading: boolean  // quando true, ignorar dados e renderizar skeleton
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function GraficoSemanal({ dados, loading }: GraficoSemanalProps) {
  const hoje = new Date().getDay() // 0=Dom ... 6=Sáb
  const labels = Array.from({ length: 7 }, (_, i) =>
    DIAS_SEMANA[(hoje - 6 + i + 7) % 7]
  )

  const max = dados.length > 0 ? Math.max(...dados, 1) : 1

  return (
    <div className="bg-white rounded-xl shadow-card p-4">
      <p className="text-sm font-bold text-text-secondary mb-3">📈 Receita — 7 dias</p>
      <div className="flex items-end gap-1.5 h-16">
        {loading
          ? Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className="flex-1 bg-border animate-pulse rounded-t"
                style={{ height: '40%' }}
              />
            ))
          : Array.from({ length: 7 }, (_, i) => {
              const valor = dados[i] ?? 0
              const pct   = Math.max(4, (valor / max) * 100)
              const isHoje = i === 6
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={[
                      'w-full rounded-t transition-all',
                      isHoje ? 'bg-brand' : 'bg-brand/30',
                    ].join(' ')}
                    style={{ height: `${pct}%` }}
                  />
                  <span className="text-[8px] text-text-faint leading-none">{labels[i]}</span>
                </div>
              )
            })
        }
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add components/dashboard/KpiStrip.tsx components/dashboard/GraficoSemanal.tsx __tests__/components/dashboard/KpiStrip.test.tsx
git commit -m "feat: KpiStrip e GraficoSemanal do dashboard"
```

---

### Task 8: Dashboard Page Assembly

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Substituir `app/page.tsx` completo**

```tsx
'use client'
import { useState, useEffect, useMemo } from 'react'
import { SaudacaoHero }    from '@/components/dashboard/SaudacaoHero'
import { AlertasCriticos } from '@/components/dashboard/AlertasCriticos'
import { KpiStrip }        from '@/components/dashboard/KpiStrip'
import { GraficoSemanal }  from '@/components/dashboard/GraficoSemanal'
import { getProdutos }     from '@/lib/services/estoque'
import { getDocument }     from '@/lib/firestore'
import { seedIfEmpty }     from '@/lib/seed'
import { Produto }         from '@/types'

interface ConfigGeral {
  meta_dia_util: number
  meta_domingo:  number
}

export default function DashboardPage() {
  const [produtos,     setProdutos]     = useState<Produto[]>([])
  const [config,       setConfig]       = useState<ConfigGeral | null>(null)
  const [carregando,   setCarregando]   = useState(true)

  useEffect(() => {
    async function init() {
      await seedIfEmpty()
      const [prods, cfg] = await Promise.all([
        getProdutos(),
        getDocument<ConfigGeral>('configuracoes', 'geral'),
      ])
      setProdutos(prods)
      setConfig(cfg)
      setCarregando(false)
    }
    init()
  }, [])

  const isDomingo = new Date().getDay() === 0
  const metaDia   = config
    ? (isDomingo ? config.meta_domingo : config.meta_dia_util)
    : 2500

  const ativos = useMemo(() => produtos.filter(p => p.ativo), [produtos])

  const produtosAbaixoMinimo = useMemo(
    () => ativos.filter(p => p.estoque_atual < p.estoque_minimo),
    [ativos]
  )

  if (carregando) {
    return (
      <div className="fadein flex flex-col gap-3">
        <div className="h-28 bg-border/30 rounded-2xl animate-pulse" />
        <div className="h-24 bg-white rounded-xl shadow-card animate-pulse" />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white rounded-xl shadow-card animate-pulse" />
          ))}
        </div>
        <div className="h-28 bg-white rounded-xl shadow-card animate-pulse" />
      </div>
    )
  }

  return (
    <div className="fadein flex flex-col gap-3">
      <SaudacaoHero metaDia={metaDia} />
      <AlertasCriticos produtosAbaixoMinimo={produtosAbaixoMinimo} />
      <KpiStrip
        faturamento={null}
        cmv={null}
        totalAlertas={produtosAbaixoMinimo.length}
      />
      <GraficoSemanal dados={[]} loading={false} />
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npx tsc --noEmit
```

Esperado: sem erros

- [ ] **Step 3: Rodar todos os testes**

```bash
npx jest --no-coverage
```

Esperado: todos passando

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: Dashboard page — saudação, alertas, KPIs e gráfico semanal"
```

---

## Chunk 3: Estoque

### Task 9: Utilitário de Status + ProdutoEstoqueCard

**Files:**
- Create: `utils/estoque-status.ts`
- Test: `__tests__/utils/estoque-status.test.ts`
- Modify: `components/estoque/ProdutoEstoqueCard.tsx`

- [ ] **Step 1: Escrever o teste do utilitário**

```bash
mkdir -p "__tests__/utils"
```

Criar `__tests__/utils/estoque-status.test.ts`:

```ts
import { getStatusEstoque } from '@/utils/estoque-status'

describe('getStatusEstoque', () => {
  it('retorna OK quando estoque_minimo é 0', () => {
    expect(getStatusEstoque(0, 0)).toBe('OK')
  })

  it('retorna CRITICO quando atual < 50% do mínimo', () => {
    expect(getStatusEstoque(0.9, 2)).toBe('CRITICO')  // 0.9 < 2 * 0.5 = 1.0
    expect(getStatusEstoque(0, 2)).toBe('CRITICO')
  })

  it('retorna BAIXO quando entre 50% e 100% do mínimo', () => {
    expect(getStatusEstoque(1.5, 2)).toBe('BAIXO')   // 1.5 >= 1.0 e 1.5 < 2
    expect(getStatusEstoque(1.0, 2)).toBe('BAIXO')   // exatamente 50%
  })

  it('retorna OK quando atual >= mínimo', () => {
    expect(getStatusEstoque(2, 2)).toBe('OK')
    expect(getStatusEstoque(5, 2)).toBe('OK')
  })
})
```

- [ ] **Step 2: Rodar o teste e confirmar falha**

```bash
npx jest __tests__/utils/estoque-status.test.ts --no-coverage
```

Esperado: FAIL

- [ ] **Step 3: Criar `utils/estoque-status.ts`**

```ts
export type StatusEstoque = 'CRITICO' | 'BAIXO' | 'OK'

export function getStatusEstoque(estoqueAtual: number, estoqueMinimo: number): StatusEstoque {
  if (estoqueMinimo <= 0) return 'OK'
  if (estoqueAtual < estoqueMinimo * 0.5) return 'CRITICO'
  if (estoqueAtual < estoqueMinimo)       return 'BAIXO'
  return 'OK'
}

export const STATUS_CONFIG: Record<StatusEstoque, {
  icon:       string
  badgeClass: string
  label:      string
}> = {
  CRITICO: { icon: '🔴', badgeClass: 'bg-danger text-white',       label: 'Crítico' },
  BAIXO:   { icon: '🟡', badgeClass: 'bg-warning/20 text-warning', label: 'Baixo'   },
  OK:      { icon: '🟢', badgeClass: 'bg-success/10 text-success', label: 'Ok'      },
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

```bash
npx jest __tests__/utils/estoque-status.test.ts --no-coverage
```

Esperado: PASS — 4 testes passando

- [ ] **Step 5: Atualizar `components/estoque/ProdutoEstoqueCard.tsx`**

Substituir o arquivo completo:

```tsx
'use client'
import { Produto }        from '@/types'
import { fmtBRL }         from '@/utils/calculos'
import { getStatusEstoque, STATUS_CONFIG } from '@/utils/estoque-status'

interface ProdutoEstoqueCardProps {
  produto:    Produto
  onEntrada?: () => void
  onBaixa?:   () => void
}

export function ProdutoEstoqueCard({ produto, onEntrada, onBaixa }: ProdutoEstoqueCardProps) {
  const status = getStatusEstoque(produto.estoque_atual, produto.estoque_minimo)
  const { icon, badgeClass, label } = STATUS_CONFIG[status]

  const percentual = produto.estoque_minimo > 0
    ? Math.min(100, (produto.estoque_atual / (produto.estoque_minimo * 2)) * 100)
    : produto.estoque_atual > 0 ? 100 : 0

  const corBarra =
    status === 'CRITICO' ? '#DC2626' :
    status === 'BAIXO'   ? '#D97706' : '#15803D'

  return (
    <div className={[
      'bg-white border rounded-xl shadow-card p-3 flex flex-col gap-2 transition-colors',
      status === 'CRITICO' ? 'border-red-500/50' : 'border-border',
    ].join(' ')}>

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-base leading-none">{icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-text-primary font-bold text-sm break-words">{produto.nome}</p>
            <p className="text-text-faint text-[11px]">{produto.categoria}</p>
          </div>
        </div>
        {status !== 'OK' && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${badgeClass}`}>
            {label}
          </span>
        )}
      </div>

      {/* Barra de estoque — h-2 (8px) */}
      <div>
        <div className="flex justify-between text-[10px] text-text-faint mb-1">
          <span>{produto.estoque_atual.toFixed(1)}{produto.unidade_padrao}</span>
          <span>mín: {produto.estoque_minimo}{produto.unidade_padrao}</span>
        </div>
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percentual}%`, backgroundColor: corBarra }}
          />
        </div>
      </div>

      {/* Custo médio */}
      {produto.custo_medio > 0 && (
        <p className="text-text-muted text-[11px]">
          Custo médio:{' '}
          <span className="text-text-secondary font-medium">
            {fmtBRL(produto.custo_medio)}/{produto.unidade_padrao}
          </span>
        </p>
      )}

      {/* Ações */}
      {(onEntrada || onBaixa) && (
        <div className="flex gap-1.5 mt-1">
          {onEntrada && (
            <button
              onClick={onEntrada}
              className="flex-1 text-[11px] font-bold text-success border border-success/30 bg-success/10 rounded-lg py-1 hover:bg-success/20 transition-colors"
            >
              + Entrada
            </button>
          )}
          {onBaixa && (
            <button
              onClick={onBaixa}
              className="flex-1 text-[11px] font-bold text-text-muted border border-border rounded-lg py-1 hover:border-brand transition-colors"
            >
              − Baixa
            </button>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Rodar todos os testes**

```bash
npx jest --no-coverage
```

Esperado: todos passando

- [ ] **Step 7: Commit**

```bash
git add utils/estoque-status.ts __tests__/utils/estoque-status.test.ts components/estoque/ProdutoEstoqueCard.tsx
git commit -m "feat: getStatusEstoque util + ProdutoEstoqueCard com badge e barra h-2"
```

---

### Task 10: CategoriaCard Update

**Files:**
- Modify: `components/estoque/CategoriaCard.tsx`

- [ ] **Step 1: Substituir `components/estoque/CategoriaCard.tsx` completo**

```tsx
'use client'
import { CategoriaConfig } from '@/lib/categorias'
import { fmtBRL }          from '@/utils/calculos'

interface CategoriaCardProps {
  config:        CategoriaConfig
  totalProdutos: number
  alertas:       number
  valorTotal:    number
  onClick:       () => void
}

export function CategoriaCard({
  config, totalProdutos, alertas, valorTotal, onClick,
}: CategoriaCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-3 bg-white shadow-elevated border-l-4 transition-all hover:shadow-elevated active:scale-[0.98]"
      style={{ borderLeftColor: config.cor }}
    >
      {/* Topo: ícone + nome + badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl leading-none">{config.icon}</span>
          <div>
            <p className="text-text-primary font-bold text-[13px] leading-tight">{config.nome}</p>
            <p className="text-text-faint text-[10px]">
              {totalProdutos} produto{totalProdutos !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          {alertas > 0 ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning/15 text-warning">
              ⚠ {alertas} alerta{alertas > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/10 text-success">
              ✓ ok
            </span>
          )}
          {valorTotal > 0 && (
            <span className="text-sm font-bold text-text-primary">{fmtBRL(valorTotal)}</span>
          )}
        </div>
      </div>

      {/* Barra de progresso — h-2 (8px) */}
      {totalProdutos > 0 && (
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${alertas > 0 ? Math.max(8, (alertas / totalProdutos) * 100) : 100}%`,
              backgroundColor: alertas > 0 ? config.cor : '#15803D',
              opacity: alertas > 0 ? 0.8 : 0.5,
            }}
          />
        </div>
      )}
    </button>
  )
}
```

- [ ] **Step 2: Verificar build**

```bash
npx tsc --noEmit
```

Esperado: sem erros

- [ ] **Step 3: Commit**

```bash
git add components/estoque/CategoriaCard.tsx
git commit -m "feat: CategoriaCard — ícone 3xl, badge inline, shadow-elevated, barra h-2"
```

---

### Task 11: EstoqueHero + seed update

**Files:**
- Create: `components/estoque/EstoqueHero.tsx`
- Modify: `lib/seed.ts`

- [ ] **Step 1: Criar `components/estoque/EstoqueHero.tsx`**

```tsx
import { fmtBRL } from '@/utils/calculos'

interface EstoqueHeroProps {
  valorTotal:   number
  totalAlertas: number
  totalItens:   number
  metaEstoque:  number
}

export function EstoqueHero({
  valorTotal, totalAlertas, totalItens, metaEstoque,
}: EstoqueHeroProps) {
  const pct = Math.min(100, metaEstoque > 0 ? (valorTotal / metaEstoque) * 100 : 0)

  return (
    <div
      className="text-white px-4 pt-4 pb-5"
      style={{ background: 'linear-gradient(135deg, #C2410C, #7C2D12)' }}
    >
      <p className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-2">
        Estoque · Hoje
      </p>

      {/* Valor + badges */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] opacity-75">valor total</p>
          <p className="text-3xl font-extrabold leading-tight">{fmtBRL(valorTotal)}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {totalAlertas > 0 && (
            <div
              className="rounded-lg px-3 py-1.5 text-center"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <p className="text-base font-extrabold" style={{ color: '#FCD34D' }}>
                {totalAlertas}
              </p>
              <p className="text-[8px] opacity-85">alertas</p>
            </div>
          )}
          <div
            className="rounded-lg px-3 py-1.5 text-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <p className="text-base font-extrabold">{totalItens}</p>
            <p className="text-[8px] opacity-85">itens</p>
          </div>
        </div>
      </div>

      {/* Barra de meta */}
      <div className="mt-3">
        <div className="flex justify-between text-[9px] opacity-75 mb-1">
          <span>Meta de estoque</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: 'rgba(255,255,255,0.8)' }}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Adicionar `meta_estoque_valor` ao tipo `Configuracoes` em `types/index.ts`**

Localizar a interface `Configuracoes` (ou o objeto `CONFIGURACOES_PADRAO`) em `types/index.ts` e adicionar:

```ts
meta_estoque_valor?: number  // valor alvo de estoque — default 2000 no componente
```

Se o tipo não existir, apenas documentar com um comentário inline na Task 12 (`interface ConfigGeral { meta_estoque_valor?: number }`).

- [ ] **Step 3: Adicionar `meta_estoque_valor` ao seed**

Em `lib/seed.ts`, localizar o bloco `setDocument('configuracoes', 'geral', {` e adicionar o campo:

```ts
await setDocument('configuracoes', 'geral', {
  custo_por_km: 1.20,
  meta_dia_util: 2500,
  meta_domingo: 5000,
  cmv_ideal_percentual: 35,
  preco_kg_semana: 76.90,
  preco_kg_domingo: 82.90,
  preco_coma_vontade: 54.90,
  alerta_validade_dias_antecedencia: 3,
  alerta_preco_variacao_percentual: 10,
  alerta_compra_acima_media_percentual: 50,
  meta_estoque_valor: 2000,  // ← NOVO
})
```

- [ ] **Step 4: Verificar build**

```bash
npx tsc --noEmit
```

Esperado: sem erros

- [ ] **Step 5: Commit**

```bash
git add components/estoque/EstoqueHero.tsx lib/seed.ts types/index.ts
git commit -m "feat: EstoqueHero A1 + meta_estoque_valor no seed e types"
```

---

### Task 12: Estoque Page Restructure

**Files:**
- Modify: `app/estoque/page.tsx`

> Esta task remove o `fixed bottom-16` das sub-tabs e as reposiciona no topo (sticky top-14), e integra o EstoqueHero. É a task de maior impacto — verificar visualmente após o commit.

- [ ] **Step 1: Atualizar `app/estoque/page.tsx`**

Substituir o arquivo completo. As mudanças chave em relação ao original:

1. Hero `<EstoqueHero>` renderizado com `-mx-4 -mt-4` para cancelar o padding do AppShell (fullwidth)
2. Sub-tabs como `sticky top-14 z-30` logo abaixo do hero (não mais `fixed bottom-16`)
3. Import de `EstoqueHero`
4. `meta_estoque_valor` lido de `configuracoes/geral`
5. `pb-32` → `pb-6`

```tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, SectionTitle }       from '@/components/ui'
import { CategoriaCard }            from '@/components/estoque/CategoriaCard'
import { ProdutoEstoqueCard }       from '@/components/estoque/ProdutoEstoqueCard'
import { EstoqueHero }              from '@/components/estoque/EstoqueHero'
import { EntradaEstoque }           from '@/components/estoque/EntradaEstoque'
import { BaixaEstoque }             from '@/components/estoque/BaixaEstoque'
import { RegistroPerda }            from '@/components/estoque/RegistroPerda'
import { ChatEstoque }              from '@/components/estoque/ChatEstoque'
import { DonutChart, DonutSegmento } from '@/components/estoque/DonutChart'
import { Produto, Fornecedor }      from '@/types'
import { CATEGORIAS, CategoriaConfig } from '@/lib/categorias'
import { getProdutos }              from '@/lib/services/estoque'
import { getFornecedores }          from '@/lib/services/fornecedores'
import { getDocument }              from '@/lib/firestore'
import { seedIfEmpty }              from '@/lib/seed'
import { fmtBRL }                   from '@/utils/calculos'
import { cn }                       from '@/utils/cn'

type Aba        = 'estoque' | 'chat' | 'entrada' | 'baixa'
type AbaMovimento = 'baixa' | 'perda'

const ABAS: { id: Aba; icon: string; label: string }[] = [
  { id: 'estoque',  icon: '📦', label: 'Estoque'  },
  { id: 'chat',     icon: '🤖', label: 'Chat IA'  },
  { id: 'entrada',  icon: '📥', label: 'Entrada'  },
  { id: 'baixa',    icon: '📤', label: 'Baixa'    },
]

interface ConfigGeral { meta_estoque_valor?: number }

export default function EstoquePage() {
  const [aba,           setAba]           = useState<Aba>('estoque')
  const [abaMovimento,  setAbaMovimento]  = useState<AbaMovimento>('baixa')
  const [produtos,      setProdutos]      = useState<Produto[]>([])
  const [fornecedores,  setFornecedores]  = useState<Fornecedor[]>([])
  const [metaEstoque,   setMetaEstoque]   = useState(2000)
  const [carregando,    setCarregando]    = useState(true)

  const [busca,     setBusca]     = useState('')
  const [catFiltro, setCatFiltro] = useState<string | null>(null)
  const [subFiltro, setSubFiltro] = useState<string | null>(null)

  const recarregarProdutos = useCallback(async () => {
    setProdutos(await getProdutos())
  }, [])

  useEffect(() => {
    async function init() {
      await seedIfEmpty()
      const [prods, forn, cfg] = await Promise.all([
        getProdutos(),
        getFornecedores(),
        getDocument<ConfigGeral>('configuracoes', 'geral'),
      ])
      setProdutos(prods)
      setFornecedores(forn)
      if (cfg?.meta_estoque_valor) setMetaEstoque(cfg.meta_estoque_valor)
      setCarregando(false)
    }
    init()
  }, [])

  const ativos = useMemo(() => produtos.filter(p => p.ativo), [produtos])

  const totalAlertas = useMemo(
    () => ativos.filter(p => p.estoque_atual < p.estoque_minimo).length,
    [ativos]
  )
  const valorTotal = useMemo(
    () => ativos.reduce((s, p) => s + p.estoque_atual * (p.custo_medio ?? 0), 0),
    [ativos]
  )

  const donutSegmentos: DonutSegmento[] = useMemo(
    () => CATEGORIAS.map(cat => ({
      label: cat.nome,
      value: ativos
        .filter(p => p.categoria === cat.nome)
        .reduce((s, p) => s + p.estoque_atual * (p.custo_medio ?? 0), 0),
      cor: cat.cor,
    })).filter(s => s.value > 0),
    [ativos]
  )

  const catConfig = useMemo(
    () => catFiltro ? (CATEGORIAS.find(c => c.id === catFiltro) ?? null) : null,
    [catFiltro]
  )

  const produtosFiltrados = useMemo(() => {
    let prods = ativos
    if (busca.trim()) {
      const b = busca.trim().toLowerCase()
      prods = prods.filter(p =>
        p.nome.toLowerCase().includes(b) ||
        p.sinonimos?.some(s => s.toLowerCase().includes(b))
      )
    }
    if (catConfig) prods = prods.filter(p => p.categoria === catConfig.nome)
    if (subFiltro && catConfig) {
      const sub = catConfig.subcategorias.find(s => s.id === subFiltro)
      if (sub) prods = prods.filter(p => p.subcategoria === sub.nome)
    }
    return prods
  }, [ativos, busca, catConfig, subFiltro])

  function selecionarCategoria(id: string) {
    if (catFiltro === id) { setCatFiltro(null); setSubFiltro(null) }
    else { setCatFiltro(id); setSubFiltro(null) }
    setBusca('')
  }

  function selecionarSub(id: string) {
    setSubFiltro(prev => prev === id ? null : id)
  }

  if (carregando) {
    return (
      <div className="fadein flex items-center justify-center py-20">
        <p className="text-text-muted text-sm animate-pulse">Carregando estoque...</p>
      </div>
    )
  }

  return (
    <div className="fadein flex flex-col">
      {/* ── Hero A1 — fullwidth (cancela padding do AppShell) ── */}
      <div className="-mx-4 -mt-4">
        <EstoqueHero
          valorTotal={valorTotal}
          totalAlertas={totalAlertas}
          totalItens={ativos.length}
          metaEstoque={metaEstoque}
        />
      </div>

      {/* ── Sub-tabs — sticky abaixo do Header (h-14 = top-14) ── */}
      <div className="sticky top-14 z-30 -mx-4 bg-white border-b border-border flex shadow-sm">
        {ABAS.map(a => (
          <button
            key={a.id}
            onClick={() => {
              setAba(a.id)
              if (a.id === 'estoque') { setCatFiltro(null); setSubFiltro(null); setBusca('') }
            }}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors relative',
              aba === a.id
                ? 'text-brand border-b-2 border-brand'
                : 'text-text-faint hover:text-text-muted'
            )}
          >
            <span className="text-base leading-none">{a.icon}</span>
            <span>{a.label}</span>
            {a.id === 'estoque' && totalAlertas > 0 && (
              <span className="absolute top-1.5 right-[18%] w-3.5 h-3.5 bg-danger text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                {totalAlertas > 9 ? '9+' : totalAlertas}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Conteúdo ── */}
      <div className="flex flex-col gap-3 pt-3 pb-6">

        {/* ABA: ESTOQUE */}
        {aba === 'estoque' && (
          <>
            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint text-sm pointer-events-none">🔍</span>
              <input
                type="text"
                value={busca}
                onChange={e => { setBusca(e.target.value); setCatFiltro(null); setSubFiltro(null) }}
                placeholder="Buscar produto..."
                className="w-full bg-white border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-faint focus:border-border-focus focus:ring-2 focus:ring-brand/15 outline-none transition-colors"
              />
              {busca && (
                <button
                  onClick={() => setBusca('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint text-xs hover:text-text-primary"
                >✕</button>
              )}
            </div>

            {/* Chips de categoria */}
            {!busca && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIAS.map(cat => {
                  const prodsCat   = ativos.filter(p => p.categoria === cat.nome)
                  if (prodsCat.length === 0) return null
                  const alertasCat = prodsCat.filter(p => p.estoque_atual < p.estoque_minimo).length
                  const ativo      = catFiltro === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => selecionarCategoria(cat.id)}
                      className={cn(
                        'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                        ativo
                          ? 'bg-brand text-white border-brand'
                          : 'bg-white border-border text-text-secondary hover:border-brand hover:text-brand'
                      )}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.nome}</span>
                      {alertasCat > 0 && (
                        <span className={cn(
                          'text-[9px] font-bold px-1 rounded-full',
                          ativo ? 'bg-white/20 text-white' : 'bg-warning/20 text-warning'
                        )}>
                          {alertasCat}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Grid de categorias ou lista de produtos */}
            {catFiltro === null && busca === '' ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {CATEGORIAS.map(cat => {
                    const prods   = ativos.filter(p => p.categoria === cat.nome)
                    if (prods.length === 0) return null
                    const alertas = prods.filter(p => p.estoque_atual < p.estoque_minimo).length
                    const valor   = prods.reduce((s, p) => s + p.estoque_atual * (p.custo_medio ?? 0), 0)
                    return (
                      <CategoriaCard
                        key={cat.id}
                        config={cat}
                        totalProdutos={prods.length}
                        alertas={alertas}
                        valorTotal={valor}
                        onClick={() => selecionarCategoria(cat.id)}
                      />
                    )
                  })}
                </div>
                {donutSegmentos.length > 0 && (
                  <div className="bg-white rounded-xl shadow-card p-4">
                    <p className="text-sm font-bold text-text-secondary mb-3">📊 Distribuição por categoria</p>
                    <DonutChart segmentos={donutSegmentos} />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-2">
                {(catConfig || busca) && (
                  <div className="flex items-center gap-2 mb-1">
                    {catConfig && (
                      <button
                        onClick={() => { setCatFiltro(null); setSubFiltro(null) }}
                        className="text-text-faint text-[10px] hover:text-text-muted transition-colors"
                      >✕ Limpar filtro</button>
                    )}
                    <span className="text-text-faint text-[10px]">
                      {busca
                        ? `${produtosFiltrados.length} resultado${produtosFiltrados.length !== 1 ? 's' : ''} para "${busca}"`
                        : `${produtosFiltrados.length} produto${produtosFiltrados.length !== 1 ? 's' : ''}${catConfig ? ` em ${catConfig.nome}` : ''}`
                      }
                    </span>
                  </div>
                )}
                {!busca && catConfig && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {catConfig.subcategorias.map(sub => {
                      const prodsSub   = ativos.filter(p => p.categoria === catConfig.nome && p.subcategoria === sub.nome)
                      if (prodsSub.length === 0) return null
                      const alertasSub = prodsSub.filter(p => p.estoque_atual < p.estoque_minimo).length
                      const ativo      = subFiltro === sub.id
                      return (
                        <button
                          key={sub.id}
                          onClick={() => selecionarSub(sub.id)}
                          className={cn(
                            'flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all',
                            ativo
                              ? 'bg-brand text-white border-brand'
                              : 'bg-white border-border text-text-secondary hover:border-brand hover:text-brand'
                          )}
                        >
                          <span>{sub.nome}</span>
                          <span className="text-[9px] opacity-60">{prodsSub.length}</span>
                          {alertasSub > 0 && <span className="text-[9px] text-warning ml-0.5">⚠</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
                {produtosFiltrados.length === 0 ? (
                  <div className="bg-white rounded-xl border border-border p-8 flex flex-col items-center gap-2">
                    <span className="text-3xl">🔍</span>
                    <p className="text-text-muted text-sm">
                      {busca ? `Nenhum produto com "${busca}"` : 'Nenhum produto nesta categoria'}
                    </p>
                  </div>
                ) : (
                  produtosFiltrados.map(produto => (
                    <ProdutoEstoqueCard
                      key={produto.id}
                      produto={produto}
                      onEntrada={() => setAba('entrada')}
                      onBaixa={() => setAba('baixa')}
                    />
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* ABA: CHAT IA */}
        {aba === 'chat' && (
          <Card>
            <SectionTitle icon="🤖">Chat de Estoque</SectionTitle>
            <p className="text-text-muted text-sm mb-3">
              Diga o que comprou ou faça perguntas — por texto ou áudio.
            </p>
            <ChatEstoque produtos={produtos} onEstoqueAtualizado={recarregarProdutos} />
          </Card>
        )}

        {/* ABA: ENTRADA */}
        {aba === 'entrada' && (
          <Card>
            <SectionTitle icon="📥">Entrada de Estoque</SectionTitle>
            <EntradaEstoque
              produtos={produtos}
              fornecedores={fornecedores}
              onSalvo={async () => { await recarregarProdutos(); setAba('estoque') }}
            />
          </Card>
        )}

        {/* ABA: BAIXA */}
        {aba === 'baixa' && (
          <Card>
            <div className="flex gap-1 bg-bg-page rounded-lg p-1 mb-3">
              {(['baixa', 'perda'] as AbaMovimento[]).map(sub => (
                <button
                  key={sub}
                  onClick={() => setAbaMovimento(sub)}
                  className={cn(
                    'flex-1 rounded py-1.5 text-xs font-bold transition-colors',
                    abaMovimento === sub ? 'bg-bg-card text-text-primary' : 'text-text-muted'
                  )}
                >
                  {sub === 'baixa' ? '📤 Baixa' : '🗑️ Perda'}
                </button>
              ))}
            </div>
            {abaMovimento === 'baixa' && (
              <>
                <SectionTitle icon="📤">Baixa de Estoque</SectionTitle>
                <BaixaEstoque produtos={produtos} onSalvo={recarregarProdutos} />
              </>
            )}
            {abaMovimento === 'perda' && (
              <>
                <SectionTitle icon="🗑️">Registro de Perda</SectionTitle>
                <RegistroPerda produtos={produtos} onSalvo={recarregarProdutos} />
              </>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verificar build sem erros**

```bash
npx tsc --noEmit
```

Esperado: sem erros

- [ ] **Step 3: Rodar todos os testes**

```bash
npx jest --no-coverage
```

Esperado: todos passando

- [ ] **Step 4: Commit**

```bash
git add app/estoque/page.tsx
git commit -m "feat: Estoque page — hero A1, sub-tabs no topo sticky, sem BottomNav"
```

---

## Verificação Final

- [ ] **Rodar build completo**

```bash
npm run build
```

Esperado: build sem erros

- [ ] **Checklist visual (abrir em browser local `npm run dev`)**

  - [ ] Header mostra `h-14`, botões 🤖 🔔 ≡ visíveis
  - [ ] Clicar ≡ abre sidebar com overlay
  - [ ] Clicar fora do sidebar fecha
  - [ ] Pressionar Esc fecha o sidebar
  - [ ] Links do sidebar navegam corretamente (Dashboard, Estoque, Fornecedores, Preços, Financeiro)
  - [ ] Dashboard mostra saudação dinâmica, seção de alertas, 3 KPIs, gráfico
  - [ ] Estoque mostra hero terracota fullwidth no topo
  - [ ] Sub-tabs do estoque estão sticky abaixo do header, não no rodapé
  - [ ] CategoriaCard tem ícone grande, badge colorido, sombra pronunciada
  - [ ] ProdutoEstoqueCard mostra 🔴🟡🟢 e barra mais grossa

- [ ] **Commit final (apenas se houver arquivos não commitados)**

```bash
git status
# Se houver arquivos pendentes, adicionar explicitamente (não usar -A para evitar artefatos de build):
git add docs/superpowers/plans/2026-04-29-dashboard-estoque-navegacao.md
git commit -m "chore: checklist visual completo — redesign dashboard/estoque/nav"
```
