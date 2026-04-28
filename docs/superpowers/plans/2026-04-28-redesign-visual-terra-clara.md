# Redesign Visual Terra Clara — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o tema dark frio pelo tema "Terra Clara" (off-white quente + terracota) em todo o sistema, com o dashboard de estoque redesenhado como superdashboard mobile-first.

**Architecture:** A mudança começa pelos tokens Tailwind (uma única fonte de verdade para todas as cores) — trocando o config resolve a maioria dos componentes automaticamente. Componentes com valores hardcoded (`#1e2130`, `text-green-400` etc.) são atualizados na sequência. O layout global recebe um novo `BottomNav` fixo no rodapé substituindo o `Nav` horizontal no topo. A página de estoque é redesenhada por último, aproveitando os componentes já atualizados.

**Tech Stack:** Next.js 14, Tailwind CSS (nested tokens), TypeScript, DM Sans font, Firebase Firestore

---

## Chunk 1: Design Tokens & Globals

### Task 1: Atualizar `tailwind.config.ts` com tokens Terra Clara

**Files:**
- Modify: `tailwind.config.ts`

**Background:** O config atual tem `bg.base`, `brand.dark: '#e76f51'` (nested) e sem `boxShadow`. Vamos reescrever os tokens de cor e adicionar sombras. **Importante:** mantemos aliases de compatibilidade (`bg.card`, `bg.input`, `border.light`) para que componentes ainda não migrados não percam seu estilo — esses aliases são removidos apenas na Task 8 (auditoria final).

- [ ] **Step 1: Abrir e reescrever `tailwind.config.ts`**

Substituir o bloco `colors` e adicionar `boxShadow`:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          page:  '#FFF8F0',  // fundo geral
          card:  '#FFFFFF',  // cards (alias mantido para compatibilidade)
          hover: '#FFF3E8',
          input: '#FFFFFF',  // inputs (alias mantido para compatibilidade)
          base:  '#FFF8F0',  // alias legado → bg-bg-page (removido na Task 8)
        },
        border: {
          DEFAULT: '#F0E6D3',
          focus:   '#C2410C',
          light:   '#F0E6D3', // alias legado → border-border (removido na Task 8)
        },
        text: {
          primary:   '#1C0A00',
          secondary: '#78350F',
          muted:     '#92400E',
          faint:     '#C4884A',
        },
        brand: {
          DEFAULT: '#C2410C',
          dark:    '#7C2D12',
          hover:   '#9A3412',
          light:   '#FED7AA',
        },
        accent: {
          DEFAULT: '#D97706',
        },
        success: {
          DEFAULT: '#15803D',
          light:   '#86efac',
          bg:      'rgba(21,128,61,0.07)',
        },
        danger: {
          DEFAULT: '#DC2626',
          light:   '#fca5a5',
        },
        warning: {
          DEFAULT: '#D97706',
          light:   '#fbbf24',
        },
        info: {
          DEFAULT: '#3b82f6',
          light:   '#60a5fa',
        },
      },
      boxShadow: {
        card:     '0 1px 4px rgba(120,53,15,0.10)',
        elevated: '0 4px 16px rgba(120,53,15,0.15)',
      },
      fontFamily: {
        sans: ['DM Sans', 'Segoe UI', 'sans-serif'],
        mono: ['monospace'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Atualizar `app/globals.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;800&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: #FFF8F0;
  color: #1C0A00;
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
  min-height: 100vh;
}

::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: #FFF8F0; }
::-webkit-scrollbar-thumb { background: #F0E6D3; border-radius: 3px; }

select option { background: #FFFFFF; }

@keyframes fadein {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fadein { animation: fadein 0.35s ease forwards; }
```

- [ ] **Step 3: Verificar compilação**

```bash
cd "panela-da-roca" && npx tsc --noEmit
```
Expected: sem erros de tipo (pode haver avisos de tokens não encontrados que serão corrigidos nas próximas tasks).

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat(theme): add Terra Clara tokens and warm shadows"
```

---

### Task 2: Atualizar `app/layout.tsx` e criar `BottomNav`

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/layout/BottomNav.tsx`
- Modify: `components/layout/Nav.tsx` (aposentar — não deletar ainda, deixar arquivo vazio com redirect)

**Background:** O layout atual tem `<Nav />` horizontal no topo. Vamos criar um `<BottomNav />` fixo no rodapé e remover o `<Nav />` do layout. O `Nav.tsx` pode ficar como um wrapper vazio por ora para não quebrar imports.

- [ ] **Step 1: Criar `components/layout/BottomNav.tsx`**

Mantém as mesmas 5 abas do `Nav.tsx` atual (são as rotas reais do sistema):

```tsx
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
```

- [ ] **Step 2: Atualizar `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './globals.css'
import { Header }    from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

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
        <Header />
        <main className="px-4 py-4 max-w-[1100px] mx-auto pb-20">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
```

Note: `pb-20` (80px) garante breathing room acima do BottomNav fixo de `h-16` (64px).

- [ ] **Step 3: Atualizar `components/layout/Header.tsx`**

Remover date display, `useEffect`, `useState` e hardcoded border. Não precisa mais de `'use client'`:

```tsx
import Image from 'next/image'

export function Header() {
  return (
    <header className="bg-white border-b border-border px-4 py-3 flex items-center gap-3 shadow-sm sticky top-0 z-40">
      <Image src="/logo.png" alt="Panela da Roça" width={38} height={38} className="rounded-lg" />
      <div>
        <div className="font-extrabold text-base text-text-primary leading-tight">Panela da Roça</div>
        <div className="text-[10px] text-text-faint tracking-wide uppercase">Sistema de Gestão</div>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Verificar que o app carrega sem erros de import**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx components/layout/BottomNav.tsx components/layout/Header.tsx
git commit -m "feat(layout): replace top nav with fixed bottom nav, update header"
```

---

## Chunk 2: UI Primitives

### Task 3: Atualizar `Button`, `Input`, `Select`, `Chip`

**Files:**
- Modify: `components/ui/Button.tsx`
- Modify: `components/ui/Input.tsx`
- Modify: `components/ui/Select.tsx`
- Modify: `components/ui/Chip.tsx`
- Modify: `components/ui/Card.tsx`

**Background:** Esses componentes usam tokens antigos. Com o novo tailwind.config os tokens de cor mudaram de valor, mas os nomes de token `bg-bg-card`, `bg-bg-hover`, `border-border`, `border-border-focus`, `text-text-primary` etc. continuam funcionando (os valores mudam automaticamente). O que precisa de mudança manual:
- `Button`: `from-brand to-brand-dark` ainda funciona (brand.dark agora é `#7C2D12`)
- `Button ghost`: `bg-bg-hover` → mantido, mas adicionar `text-text-muted hover:text-brand`
- `Input` / `Select`: `bg-bg-input` → funciona, `border-border-light` → não existe mais, troca por `border-border`
- `Chip`: active state `text-black` → trocar por `text-white`

- [ ] **Step 1: Atualizar `components/ui/Button.tsx`**

```tsx
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  children: ReactNode
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-extrabold text-[13px] rounded-xl px-5 py-[10px] cursor-pointer font-sans transition-all whitespace-nowrap disabled:opacity-45 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-gradient-to-br from-brand to-brand-dark text-white border-none hover:opacity-90',
    secondary: 'bg-brand-light text-brand hover:opacity-90',
    ghost:     'bg-bg-hover text-text-muted border border-border hover:text-brand hover:border-brand',
    danger:    'bg-danger/20 text-danger border border-danger/30 hover:bg-danger/30',
  }
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Atualizar `components/ui/Input.tsx`**

```tsx
import { InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'bg-white border border-border rounded-xl px-[13px] py-[10px]',
        'text-text-primary text-[13px] outline-none font-sans w-full',
        'focus:border-border-focus focus:ring-2 focus:ring-brand/15 transition-colors',
        'placeholder:text-text-faint',
        className
      )}
      {...props}
    />
  )
}
```

- [ ] **Step 3: Atualizar `components/ui/Select.tsx`**

```tsx
import { SelectHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode
}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'bg-white border border-border rounded-xl px-[13px] py-[10px]',
        'text-text-primary text-[13px] outline-none font-sans w-full',
        'focus:border-border-focus focus:ring-2 focus:ring-brand/15 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
```

- [ ] **Step 4: Atualizar `components/ui/Card.tsx`**

Trocar `bg-bg-card` por `bg-white` e `border-border` já funciona (mantido):

```tsx
import { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('bg-white border border-border rounded-xl shadow-card p-4', className)}>
      {children}
    </div>
  )
}
```

- [ ] **Step 5: Atualizar `components/ui/Chip.tsx`**

```tsx
import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
  children: ReactNode
}

export function Chip({ selected = false, className, children, ...props }: ChipProps) {
  return (
    <button
      className={cn(
        'border rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all font-sans',
        selected
          ? 'bg-brand text-white border-brand'
          : 'bg-border/60 border-border text-text-secondary hover:border-brand hover:text-brand',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 6: Rodar testes**

```bash
npx jest --testPathPattern="components/ui" --passWithNoTests
```
Expected: PASS (ou no tests found — não há testes de UI primitivos).

- [ ] **Step 7: Commit**

```bash
git add components/ui/Button.tsx components/ui/Input.tsx components/ui/Select.tsx components/ui/Chip.tsx components/ui/Card.tsx
git commit -m "feat(ui): update Button/Input/Select/Chip/Card for Terra Clara theme"
```

---

## Chunk 3: Estoque Components

### Task 4: Atualizar `CategoriaCard`, `DonutChart`, `ChatEstoque`

**Files:**
- Modify: `components/estoque/CategoriaCard.tsx`
- Modify: `components/estoque/DonutChart.tsx`
- Modify: `components/estoque/ChatEstoque.tsx`

- [ ] **Step 1: Atualizar `components/estoque/CategoriaCard.tsx`**

```tsx
'use client'

import { CategoriaConfig } from '@/lib/categorias'
import { fmtBRL } from '@/utils/calculos'

interface CategoriaCardProps {
  config: CategoriaConfig
  totalProdutos: number
  alertas: number
  valorTotal: number
  onClick: () => void
}

export function CategoriaCard({ config, totalProdutos, alertas, valorTotal, onClick }: CategoriaCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-3 bg-white shadow-card border-l-4 transition-all hover:shadow-elevated active:scale-[0.98]"
      style={{ borderLeftColor: config.cor }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none">{config.icon}</span>
          <div>
            <p className="text-text-primary font-bold text-[13px] leading-tight">{config.nome}</p>
            <p className="text-text-faint text-[10px]">{totalProdutos} produto{totalProdutos !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {alertas > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-warning/10 text-warning">
              ⚠️ {alertas}
            </span>
          )}
          {valorTotal > 0 && (
            <span className="text-[11px] text-text-muted font-medium">{fmtBRL(valorTotal)}</span>
          )}
        </div>
      </div>

      {totalProdutos > 0 && (
        <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
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

- [ ] **Step 2: Atualizar `components/estoque/DonutChart.tsx`**

Mudar apenas o track color e cores de texto:

```tsx
'use client'

import { fmtBRL } from '@/utils/calculos'

export interface DonutSegmento {
  label: string
  value: number
  cor: string
}

interface DonutChartProps {
  segmentos: DonutSegmento[]
  totalLabel?: string
}

export function DonutChart({ segmentos, totalLabel }: DonutChartProps) {
  const total = segmentos.reduce((s, seg) => s + seg.value, 0)
  const ativos = segmentos.filter(s => s.value > 0)

  const cx = 70, cy = 70, r = 52
  const circunferencia = 2 * Math.PI * r

  let offsetAcumulado = 0
  const arcos = ativos.map(seg => {
    const fracao = total > 0 ? seg.value / total : 0
    const dash = fracao * circunferencia
    const arc = {
      ...seg,
      dasharray: `${dash.toFixed(2)} ${(circunferencia - dash).toFixed(2)}`,
      dashoffset: (circunferencia - offsetAcumulado).toFixed(2),
    }
    offsetAcumulado += dash
    return arc
  })

  if (total === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-text-faint text-xs">Nenhum valor calculado ainda</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[140px] h-[140px]">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          {/* Track — cor quente do tema claro */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F0E6D3" strokeWidth={22} />
          {arcos.map((arc, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={arc.cor}
              strokeWidth={22}
              strokeDasharray={arc.dasharray}
              strokeDashoffset={arc.dashoffset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[9px] text-text-faint font-medium leading-tight">
            {totalLabel ?? 'em estoque'}
          </span>
          <span className="text-[13px] text-text-primary font-extrabold leading-tight">
            {fmtBRL(total)}
          </span>
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-x-3 gap-y-1.5">
        {ativos.map(seg => {
          const pct = total > 0 ? ((seg.value / total) * 100).toFixed(0) : '0'
          return (
            <div key={seg.label} className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.cor }} />
              <span className="text-[10px] text-text-muted truncate">{seg.label}</span>
              <span className="text-[10px] text-text-faint ml-auto shrink-0">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Atualizar `components/estoque/ChatEstoque.tsx`**

Aplicar todas as substituições abaixo no arquivo:

| Antigo | Novo |
|---|---|
| `bg-brand/20 border border-brand/30` | `bg-brand/10 border border-brand/20` (balão usuário) |
| `bg-bg-base border border-border` | `bg-white border border-border` (balão IA, loading bubble, input) |
| `bg-bg-card` | `bg-white` (cards internos da compra) |
| `bg-bg-base` | `bg-white` (todos os containers e input) |
| `bg-bg-base rounded-full` | `bg-border/50 rounded-full` (balão sistema — pill cinza quente) |
| `bg-green-600/80 hover:bg-green-600` | `bg-success hover:opacity-90` (botão confirmar compra) |
| `text-green-400` | `text-success` |
| `bg-green-500/20 text-green-400` | `bg-success/20 text-success` (badge confiança alta) |
| `bg-amber-500/20 text-amber-400` | `bg-warning/20 text-warning` (badge confiança média) |
| `bg-red-500/20 text-red-400` | `bg-danger/20 text-danger` (badge confiança baixa) |
| `border-green-500/30` | `border-success/30` |
| `text-amber-400` | `text-warning` (produto não mapeado) |

- [ ] **Step 4: Commit**

```bash
git add components/estoque/CategoriaCard.tsx components/estoque/DonutChart.tsx components/estoque/ChatEstoque.tsx
git commit -m "feat(estoque): update CategoriaCard, DonutChart, ChatEstoque for Terra Clara"
```

---

### Task 5: Atualizar `ProdutoEstoqueCard` e componentes de movimentação

**Files:**
- Modify: `components/estoque/ProdutoEstoqueCard.tsx`
- Modify: `components/estoque/EntradaEstoque.tsx`
- Modify: `components/estoque/BaixaEstoque.tsx`
- Modify: `components/estoque/ConfirmarEntrada.tsx`
- Modify: `components/estoque/RegistroPerda.tsx`
- Modify: `components/estoque/ConsultaIA.tsx`

**Regra geral de substituição para todos esses arquivos:**

| Antigo | Novo |
|---|---|
| `bg-bg-base` | `bg-bg-page` (fundo de página) ou `bg-white` (fundo de card) |
| `bg-bg-card` | `bg-white` |
| `bg-bg-input` | `bg-white` |
| `bg-bg-hover` | `bg-bg-hover` (mantido, novo valor) |
| `border-border-light` | `border-border` |
| `text-green-400` | `text-success` |
| `bg-green-400/10` ou `bg-green-500/10` | `bg-success/10` |
| `text-red-400` | `text-danger` |
| `bg-red-400/10` ou `bg-red-500/10` | `bg-danger/10` |
| `text-amber-400` | `text-warning` |
| `bg-amber-400/10` ou `bg-amber-500/10` | `bg-warning/10` |
| `border-green-500/30` | `border-success/30` |
| `border-red-500/30` ou `border-red-400/30` | `border-danger/30` |
| `border-amber-500/20` | `border-warning/20` |

- [ ] **Step 1: Atualizar `components/estoque/ProdutoEstoqueCard.tsx`**

Substituições específicas:
- `bg-bg-card border rounded-xl` → `bg-white border border-border rounded-xl shadow-card`
- `h-1.5 bg-bg-base rounded-full` → `h-1.5 bg-border rounded-full`
- `text-green-400 border border-green-500/30 bg-green-500/10` (botão entrada) → `text-success border border-success/30 bg-success/10`
- `hover:border-border-light` → `hover:border-brand`
- `corBarra`: manter hex direto no style, mas trocar `'#ef4444'` → `'#DC2626'` e `'#f59e0b'` → `'#D97706'` e `'#22c55e'` → `'#15803D'`

- [ ] **Step 2: Aplicar substituições em `EntradaEstoque.tsx`, `BaixaEstoque.tsx`, `ConfirmarEntrada.tsx`, `RegistroPerda.tsx`, `ConsultaIA.tsx`**

Para cada arquivo, usar a tabela de substituição acima. Os padrões mais comuns nesses arquivos:
- Containers: `bg-bg-card` → `bg-white`, `bg-bg-base` → `bg-bg-page`
- Inputs já usam `<Input />` do componente — serão herdados automaticamente
- Mensagens de sucesso/erro: `text-green-400`/`text-red-400` → `text-success`/`text-danger`
- Botões inline (não usando o componente `<Button />`): aplicar as mesmas classes do tema claro

- [ ] **Step 3: Rodar testes**

```bash
npx jest --passWithNoTests
```
Expected: todos os testes passam (a mudança é visual, não lógica).

- [ ] **Step 4: Commit**

```bash
git add components/estoque/ProdutoEstoqueCard.tsx components/estoque/EntradaEstoque.tsx components/estoque/BaixaEstoque.tsx components/estoque/ConfirmarEntrada.tsx components/estoque/RegistroPerda.tsx components/estoque/ConsultaIA.tsx
git commit -m "feat(estoque): migrate estoque components to Terra Clara tokens"
```

---

## Chunk 4: Superdashboard de Estoque

### Task 6: Redesenhar `app/estoque/page.tsx`

**Files:**
- Modify: `app/estoque/page.tsx`

**Background:** A página atual já tem a lógica de filtro por categoria/subcategoria, busca e o bottom nav de abas (estoque/chat/entrada/baixa). Vamos manter toda a lógica e redesenhar:
1. Metric cards em `grid-cols-3` com `shadow-card`
2. Grid 2 colunas de `CategoriaCard` quando nenhuma categoria selecionada
3. `DonutChart` visível direto (sem toggle) abaixo do grid
4. Lista de produtos quando categoria selecionada (substituindo grid + donut)
5. Bottom nav com estilo Terra Clara

- [ ] **Step 1: Ler o arquivo atual e identificar o que remover**

```bash
cat app/estoque/page.tsx
```

**Remover as seguintes estruturas** (não são mais necessárias no redesign):
- `const [mostrarInsights, setMostrarInsights] = useState(false)` (linha ~39)
- A constante `grupos: Grupo[]` e o tipo `Grupo` que a define (bloco useMemo com ~60 linhas)
- O toggle button "📊 Ver gráfico de valor por categoria" e o bloco `{mostrarInsights && ...}`
- O bloco de renderização que itera `grupos.map(grupo => ...)` com headers de subcategoria

**Manter:**
- `produtosFiltrados` (computed com busca + catFiltro + subFiltro — reutilizado na lista de produtos)
- `donutSegmentos` (usado direto no DonutChart)
- `totalAlertas`, `valorTotal`, `ativos` (usados nos metric cards)
- `selecionarCategoria`, `selecionarSub` (funções de filtro — reutilizadas nos chips)
- `catConfig` (computed de catFiltro → CATEGORIAS.find)

- [ ] **Step 2: Atualizar metric cards**

Localizar a seção de metric cards (3 números: valor, alertas, total). Trocar para:
```tsx
<div className="grid grid-cols-3 gap-2 mb-4">
  <div className="bg-white rounded-xl shadow-card p-3 text-center">
    <p className="text-lg">💰</p>
    <p className="text-base font-extrabold text-text-primary">{fmtBRL(valorTotal)}</p>
    <p className="text-[10px] text-text-muted">em estoque</p>
  </div>
  <div className="bg-white rounded-xl shadow-card p-3 text-center">
    <p className="text-lg">⚠️</p>
    <p className={['text-base font-extrabold', totalAlertas > 0 ? 'text-warning' : 'text-text-primary'].join(' ')}>
      {totalAlertas}
    </p>
    <p className="text-[10px] text-text-muted">alertas</p>
  </div>
  <div className="bg-white rounded-xl shadow-card p-3 text-center">
    <p className="text-lg">📦</p>
    <p className="text-base font-extrabold text-text-primary">{ativos.length}</p>
    <p className="text-[10px] text-text-muted">produtos</p>
  </div>
</div>
```

- [ ] **Step 3: Atualizar search bar**

```tsx
<div className="relative mb-3">
  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint text-sm">🔍</span>
  <input
    type="text"
    value={busca}
    onChange={e => setBusca(e.target.value)}
    placeholder="Buscar produto..."
    className="w-full bg-white border border-border rounded-xl pl-8 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-faint focus:border-border-focus focus:ring-2 focus:ring-brand/15 outline-none transition-colors"
  />
</div>
```

- [ ] **Step 4: Atualizar chips de categoria**

```tsx
<div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-hide">
  {CATEGORIAS.map(cat => {
    const alertasCat = alertasPorCategoria[cat.nome] ?? 0
    return (
      <button
        key={cat.id}
        onClick={() => { setCatFiltro(cat.id === catFiltro ? null : cat.id); setSubFiltro(null) }}
        className={[
          'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
          catFiltro === cat.id
            ? 'bg-brand text-white border-brand'
            : 'bg-white border-border text-text-secondary hover:border-brand hover:text-brand',
        ].join(' ')}
      >
        {cat.icon} {cat.nome}
        {alertasCat > 0 && (
          <span className={['text-[9px] font-bold px-1 rounded-full',
            catFiltro === cat.id ? 'bg-white/20 text-white' : 'bg-warning/20 text-warning',
          ].join(' ')}>
            {alertasCat}
          </span>
        )}
      </button>
    )
  })}
</div>
```

- [ ] **Step 5: Implementar grid de categorias (estado sem filtro ativo)**

**Importante:** usar `donutSegmentos` (nome real na página, não `segmentosDonut`). Substituir o bloco de renderização de `grupos.map(...)` por:

```tsx
{catFiltro === null && busca === '' ? (
  <>
    {/* Grid de categorias — 2 colunas */}
    <div className="grid grid-cols-2 gap-3">
      {CATEGORIAS.map(cat => {
        const prods = ativos.filter(p => p.categoria === cat.nome)
        if (prods.length === 0) return null
        const alertas = prods.filter(p => p.estoque_atual < p.estoque_minimo).length
        const valor = prods.reduce((s, p) => s + p.estoque_atual * p.custo_medio, 0)
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

    {/* Donut chart — sempre visível */}
    {donutSegmentos.some(s => s.value > 0) && (
      <div className="bg-white rounded-xl shadow-card p-4">
        <p className="text-sm font-bold text-text-secondary mb-3">📊 Distribuição por categoria</p>
        <DonutChart segmentos={donutSegmentos} />
      </div>
    )}
  </>
) : (
  /* Lista de produtos filtrados (busca ativa ou categoria selecionada) */
  <div className="flex flex-col gap-2">
    {/* Chips de subcategoria — aparecem quando categoria selecionada sem busca */}
    {!busca && catConfig && (
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {catConfig.subcategorias.map(sub => {
          const prodsSub = ativos.filter(p => p.categoria === catConfig.nome && p.subcategoria === sub.nome)
          if (prodsSub.length === 0) return null
          const alertasSub = prodsSub.filter(p => p.estoque_atual < p.estoque_minimo).length
          const ativo = subFiltro === sub.id
          return (
            <button
              key={sub.id}
              onClick={() => selecionarSub(sub.id)}
              className={[
                'flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all',
                ativo
                  ? 'bg-brand text-white border-brand'
                  : 'bg-white border-border text-text-secondary hover:border-brand hover:text-brand',
              ].join(' ')}
            >
              <span>{sub.nome}</span>
              <span className="text-[9px] opacity-60">{prodsSub.length}</span>
              {alertasSub > 0 && <span className="text-[9px] text-warning">⚠</span>}
            </button>
          )
        })}
      </div>
    )}

    {/* Cards de produto */}
    {produtosFiltrados.length === 0 ? (
      <p className="text-text-faint text-sm text-center py-8">Nenhum produto encontrado</p>
    ) : (
      produtosFiltrados.map(produto => (
        <ProdutoEstoqueCard
          key={produto.id}
          produto={produto}
          onEntrada={() => { setProdutoSelecionado(produto); setAba('entrada') }}
          onBaixa={() => { setProdutoSelecionado(produto); setAba('baixa') }}
        />
      ))
    )}
  </div>
)}
```

Também adicionar `CategoriaCard` ao import no topo do arquivo:
```tsx
import { CategoriaCard } from '@/components/estoque/CategoriaCard'
```

- [ ] **Step 6: Atualizar bottom nav de abas do estoque**

**Localizar o `<div>` do bottom nav de abas** — atualmente tem `fixed bottom-0 left-0 right-0 z-50`. Substituir **completamente** por:

```tsx
<div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-border flex shadow-elevated">
  {ABAS.map(a => (
    <button
      key={a.id}
      onClick={() => setAba(a.id)}
      className={[
        'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition-colors',
        aba === a.id
          ? 'text-brand bg-brand-light/40'
          : 'text-text-faint hover:text-text-muted',
      ].join(' ')}
    >
      <span className="text-base">{a.icon}</span>
      {a.label}
    </button>
  ))}
</div>
```

**Mudanças obrigatórias:** `bottom-0` → `bottom-16`, `z-50` → `z-40`. O BottomNav global está em `z-50 bottom-0`, então o nav do estoque deve ficar em `z-40 bottom-16` (empilhado acima).

- [ ] **Step 7: Ajustar padding do conteúdo da página de estoque**

O conteúdo precisa de `pb-32` para não ficar atrás dos dois navs empilhados (BottomNav global `h-16` + aba estoque `~h-14`).

- [ ] **Step 8: Rodar testes**

```bash
npx jest --passWithNoTests
```

- [ ] **Step 9: Commit**

```bash
git add app/estoque/page.tsx
git commit -m "feat(estoque): redesign superdashboard with category grid and Terra Clara theme"
```

---

## Chunk 5: Demais Componentes

### Task 7: Atualizar componentes de Fornecedores e Preços

**Files:**
- Modify: `components/fornecedores/FornecedorCard.tsx`
- Modify: `components/fornecedores/FornecedorModal.tsx`
- Modify: `components/fornecedores/FiltroFornecedores.tsx`
- Modify: `components/precos/VarreduraWeb.tsx`
- Modify: `components/precos/TabelaCotacoes.tsx`
- Modify: `components/precos/ResultadoLeitura.tsx`
- Modify: `components/precos/LeitorUniversal.tsx`
- Modify: `components/precos/CotacaoManual.tsx`

**Background:** Aplicar a mesma tabela de substituição de tokens da Task 5 em todos esses arquivos. A maioria usa os mesmos padrões: `bg-bg-base/card`, `border-border-light`, `text-green-400/red-400`.

- [ ] **Step 1: Aplicar substituições em arquivos de Fornecedores**

Para cada arquivo em `components/fornecedores/`:
- `bg-bg-base` → `bg-bg-page` ou `bg-white`
- `bg-bg-card` → `bg-white`
- `bg-bg-input` → `bg-white`
- `border-border-light` → `border-border`
- `bg-border-light` → `bg-border`
- `text-danger-light` → `text-danger` (ex: asteriscos de campos obrigatórios, mensagens de erro)
- `text-green-400` → `text-success`
- `text-red-400` → `text-danger`

`FornecedorModal.tsx` especificamente: verificar linhas com `bg-bg-input`, `border-border-light`, `bg-border-light`, e `text-danger-light`.

- [ ] **Step 2: Aplicar substituições em arquivos de Preços**

Para cada arquivo em `components/precos/`:
- Mesmas substituições acima
- `text-amber-400` → `text-warning`
- `bg-amber-500/10` → `bg-warning/10`

**`TabelaCotacoes.tsx`, `VarreduraWeb.tsx`, `ResultadoLeitura.tsx`** — atualizar a constante `CONFIANCA_COR` (valores inline em `style=`):
```ts
// Antes (cores frias de dark mode)
alta:      '#22c55e'
media:     '#f59e0b'
baixa:     '#ef4444'

// Depois (tokens Terra Clara)
alta:      '#15803D'  // success
media:     '#D97706'  // warning
baixa:     '#DC2626'  // danger
```

- [ ] **Step 3: Verificar compilação**

```bash
npx tsc --noEmit
```
Expected: sem erros de tipo.

- [ ] **Step 4: Rodar todos os testes**

```bash
npx jest --passWithNoTests
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/fornecedores/ components/precos/
git commit -m "feat(theme): migrate fornecedores and precos components to Terra Clara"
```

---

### Task 8: Auditoria final — remover hex hardcoded

**Files:**
- Modify: qualquer arquivo com hex hardcoded identificado pelo grep

- [ ] **Step 1: Remover aliases de compatibilidade do `tailwind.config.ts`**

Agora que todos os componentes foram migrados, remover do config:
- `bg.base` (alias legado)
- `border.light` (alias legado)

Manter `bg.card` e `bg.input` pois são nomes semânticos válidos.

- [ ] **Step 3: Buscar token-names legados remanescentes**

```bash
grep -rn "bg-bg-base\|bg-bg-card\|bg-bg-input\|border-border-light\|bg-border-light\|text-danger-light\|text-red-400\|text-green-400\|text-amber-400" --include="*.tsx" --include="*.ts" . | grep -v node_modules | grep -v .next
```
Corrigir cada ocorrência encontrada usando a tabela de substituição da Task 5.

- [ ] **Step 4: Buscar hex hardcoded remanescentes**

```bash
grep -r "#0f1117\|#16181f\|#1a1d25\|#1e2130\|#2a2d3a\|#3a3f55\|#555555\|#aaaaaa\|#f59e0b\|#22c55e\|#ef4444" --include="*.tsx" --include="*.ts" --include="*.css" . | grep -v node_modules | grep -v .next
```

- [ ] **Step 5: Para cada ocorrência de hex, substituir pelo token correto**

Mapeamento:
| Hex antigo | Substituto |
|---|---|
| `#0f1117` | `#FFF8F0` (bg-page) ou remover se em gradiente |
| `#16181f` | `bg-white` |
| `#1a1d25` | `bg-bg-hover` |
| `#1e2130` | `border-border` como classe ou `#F0E6D3` como valor inline |
| `#2a2d3a` | `#F0E6D3` |
| `#3a3f55` | `#F0E6D3` |
| `#555555` | `#C4884A` (text-faint) |
| `#aaaaaa` | `#92400E` (text-muted) |

- [ ] **Step 6: Buscar inline styles dark remanescentes em `app/estoque/page.tsx`**

```bash
grep -n "borderColor\|backgroundColor.*#1e\|stroke.*#1e" app/estoque/page.tsx
```
Substituir qualquer `#1e2130` inline por `#F0E6D3`.

- [ ] **Step 7: Rodar testes finais**

```bash
npx jest --passWithNoTests
```
Expected: PASS

- [ ] **Step 8: Commit final**

```bash
git add -A
git commit -m "fix(theme): remove legacy aliases and hardcoded dark hex values"
```

---

## Verificação Final

Após completar todas as tasks:

- [ ] Iniciar o servidor de desenvolvimento: `npm run dev`
- [ ] Verificar visualmente no celular (ou DevTools mobile): fundo off-white, terracota nos acentos, bottom nav funcional
- [ ] Navegar por todas as abas: Estoque, Preços, Fornecedores, Financeiro
- [ ] Testar o superdashboard: grid de categorias → clicar → lista de produtos
- [ ] Testar o Chat IA: balões com cores corretas
- [ ] Rodar suite completa de testes: `npx jest`
