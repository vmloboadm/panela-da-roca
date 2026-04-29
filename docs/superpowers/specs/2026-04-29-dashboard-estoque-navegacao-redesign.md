# Dashboard, Estoque e Navegação — Redesign Visual

## Goal

Substituir o `BottomNav` por um sistema de navegação com **header fixo + sidebar drawer**, redesenhar completamente o **Dashboard** (saudação + alertas + KPIs + gráfico semanal) e o **Estoque** (hero terracota + sub-tabs no topo + CategoriaCard e ProdutoEstoqueCard melhorados).

## Context

**Estado atual:**
- `app/layout.tsx` usa `Header` (simples, só logo+nome) + `BottomNav` (5 abas fixas no rodapé)
- `components/layout/Nav.tsx` — segundo componente de nav horizontal (tabs no topo), atualmente inativo (não importado no layout)
- `app/page.tsx` é um placeholder vazio (Server Component)
- `app/estoque/page.tsx` tem sub-tabs fixas em `bottom-16` (acima do BottomNav global)
- `components/layout/Header.tsx` — apenas logo + nome, sem botões de ação, sem altura fixa
- `components/layout/BottomNav.tsx` — 5 links: Dashboard, Fornecedores, Preços, Estoque, Financeiro
- `components/ui/Badge.tsx` — interface: `{ color: string; children }` (cor hex, não variant)

**Problemas identificados:**
1. BottomNav ocupa espaço valioso, não tem personalidade
2. Dashboard é um placeholder, sem dados úteis
3. Estoque não tem hero/banner — começa diretamente nos cards
4. CategoriaCard tem ícone pequeno, sombra fraca
5. ProdutoEstoqueCard tem progress bar de 6px (h-1.5), status badge pequeno
6. Sub-tabs do estoque ficam em baixo, escondidas

---

## Design Decisions

### 1. Nova Navegação Global — Header + Sidebar

**Remove:** `BottomNav.tsx` e `Nav.tsx` (ambos deletados após migração)

**`Header.tsx` redesenhado:**
```
┌─ 🍳 Panela da Roça ─────────────── [🤖] [🔔] [≡] ─┐
```
- **Altura fixa: `h-14` (56px)** — constraint obrigatória; nenhuma adição deve aumentar essa altura
- Título dinâmico: `usePathname()` + mapa estático de rotas → nomes (ex: `/estoque` → `"Estoque"`)
- `[🤖]` → abre chat IA global (modal ou rota /ia)
- `[🔔]` → dropdown de alertas críticos de estoque
- `[≡]` → chama `openSidebar()` do `SidebarContext`

**Estado do sidebar — React Context (sem libs externas):**

Arquivo: `lib/context/sidebar-context.tsx`
```tsx
'use client'
import { createContext, useContext, useState } from 'react'

interface SidebarContextValue {
  isOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
}

const SidebarContext = createContext<SidebarContextValue>(...)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <SidebarContext.Provider value={{
      isOpen,
      openSidebar: () => setIsOpen(true),
      closeSidebar: () => setIsOpen(false),
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)
```

`Header` e `Sidebar` consomem `useSidebar()` diretamente — sem prop drilling.

**`AppShell.tsx`** — wrapper que engloba `SidebarProvider`:
```tsx
'use client'
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

**`Sidebar.tsx`** — drawer da esquerda:
```
┌──────────────────┐
│ 🍳 Panela da Roça│
│ ──────────────── │
│ 📊 Dashboard     │
│ 📦 Estoque       │
│ 🛒 Compras  *    │  ← * "Em breve" → text-text-faint, href="#", cursor-default
│ 🏪 Fornecedores  │
│ 🔎 Preços        │
│ 💰 Financeiro    │
│ 🍽️ Fichas    *   │  ← * "Em breve"
│ 🤖 IA        *   │  ← * "Em breve"
│ ──────────────── │
│ ⚙️ Configurações │
└──────────────────┘
```
- Overlay escuro ao abrir (`bg-black/40`) — clicar no overlay chama `closeSidebar()`
- **Esc key:** `useEffect` dentro de `Sidebar.tsx` com `document.addEventListener('keydown', handler)`. O listener deve verificar `isOpen` antes de agir e deve ser **removido no cleanup** (`return () => document.removeEventListener(...)`). O `useEffect` deve ter `[isOpen]` como dep para que o listener seja re-registrado corretamente.
- Link ativo destacado: `text-brand font-bold` baseado em `usePathname()`
- Links "Em breve": `opacity-50 cursor-default pointer-events-none text-text-faint`

**`app/layout.tsx`:**
```tsx
import { AppShell } from '@/components/layout/AppShell'

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg-page">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
```
- Remove `<Header />`, `<BottomNav />`, `<main>` direto — tudo dentro de `AppShell`

---

### 2. Dashboard Redesign

**Arquivo:** `app/page.tsx` → converter para **Client Component** (`'use client'` no topo)

**Razão:** saudação depende de `new Date()` (horário do cliente) e dados do Firestore via `useEffect`/`getDocs`.

**Estrutura visual:**
```
┌─────────────────────────────────────┐
│  CARD SAUDAÇÃO (terracota gradient) │
│  "Bom dia, Panela da Roça! 🌅"      │
│  Seg, 29 Abr · Meta: R$2.500        │
├─────────────────────────────────────┤
│  "O que precisa de atenção"         │  ← SEMPRE visível
│  🔴 Fraldinha abaixo do mínimo      │  (quando há alertas)
│  🟡 3 produtos com estoque baixo    │
│  🟢 Tudo ok no estoque              │  (quando sem alertas)
├─────────────────────────────────────┤
│  [💰 Faturamento] [📊 CMV] [⚠️ Alt] │
├─────────────────────────────────────┤
│  📈 Receita — 7 dias                │
│  ████ bar chart simples             │
└─────────────────────────────────────┘
```

**Saudação dinâmica:**
- Manhã (< 12h): "Bom dia!" + 🌅
- Tarde (12-18h): "Boa tarde!" + ☀️
- Noite (≥ 18h): "Boa noite!" + 🌙
- Domingo: adicionar linha "Dia de churrasco! 🔥"

**AlertasCriticos — sempre visível:**
- `totalAlertas === 0` → exibe apenas `🟢 Tudo ok no estoque`
- `totalAlertas > 0` → exibe produtos críticos (abaixo do mínimo) individuais até 3, depois "e mais N"

**Dados:**
| Campo | Fonte | Fallback |
|-------|-------|---------|
| Meta do dia | `configuracoes/geral.meta_dia_util` / `meta_domingo` | `2500` |
| Alertas de estoque | `produtos` collection (estoque_atual < estoque_minimo) | `[]` |
| Faturamento | `financeiro` collection (não existe ainda) | `"—"` |
| CMV | `financeiro` collection (não existe ainda) | `"—"` |
| Gráfico 7 dias | `financeiro` collection (não existe ainda) | barras skeleton |

**GraficoSemanal skeleton state:** quando dados não disponíveis, renderizar 7 barras com `bg-border animate-pulse` e altura fixa de 40% cada — o mesmo componente, sem branch separado.

**Componentes novos:**
- `components/dashboard/SaudacaoHero.tsx` — card terracota com saudação + meta (props: `saudacao`, `emoji`, `meta`, `diaLabel`)
- `components/dashboard/AlertasCriticos.tsx` — lista com bullet colorido (props: `alertas: string[]`, `totalAlertas: number`)
- `components/dashboard/KpiStrip.tsx` — 3 cards: Faturamento, CMV, Alertas (props: `faturamento`, `cmv`, `totalAlertas: number`)
- `components/dashboard/GraficoSemanal.tsx` — 7 barras CSS puro, dados reais ou skeleton (props: `dados: number[]`, `loading: boolean`). Quando `loading === true`, ignorar `dados` e renderizar 7 barras placeholder `bg-border animate-pulse` com altura 40%.

---

### 3. Estoque Redesign

#### 3A — Hero A1 (novo componente)

**`components/estoque/EstoqueHero.tsx`** — banner fullwidth terracota:
```
┌─────────────────────────────────────┐  bg: gradient #C2410C → #7C2D12
│  Estoque · Hoje           text white │
│  R$1.240              [4⚠] [82 itens]│
│  Meta ████████░░  65%               │
└─────────────────────────────────────┘
```
- `valorTotal = sum(p.estoque_atual * p.custo_medio)` — inclui todos os produtos ativos; `custo_medio === 0` ou `undefined` tratados como `0` (produto contribui R$0 ao total, nunca NaN)
- `metaEstoque`: lida de `configuracoes/geral.meta_estoque_valor`; **default R$2.000 aplicado no componente** se o campo for `undefined`
- Percentual barra: `Math.min(100, (valorTotal / metaEstoque) * 100)`
- Badge alertas: fundo `rgba(255,255,255,0.15)`, texto `#FCD34D`
- Badge itens: fundo `rgba(255,255,255,0.15)`, texto branco

**Seed update:** adicionar `meta_estoque_valor: 2000` no objeto do `setDocument('configuracoes', 'geral', ...)` em `lib/seed.ts`

**`app/estoque/page.tsx` — sub-tabs movem para o topo:**
```
[Hero A1 — fullwidth, sem padding lateral]
[📦 Estoque] [🤖 Chat IA] [📥 Entrada] [📤 Baixa]  ← sticky top-14
[busca + chips + conteúdo]
```
- Sub-tabs: `sticky top-14 z-30 bg-white border-b border-border` — `top-14` corresponde ao `h-14` fixo do Header
- Remove o bloco `fixed bottom-16 left-0 right-0 z-40` atual
- `pb-6` no conteúdo (era `pb-32`)
- Hero renderizado fora do `div.fadein` de padding — fullwidth até a borda

#### 3B — CategoriaCard melhorado

**Mudanças em `components/estoque/CategoriaCard.tsx`:**
- Ícone: `text-3xl` (era `text-2xl`), envolvido em `<span className="text-3xl leading-none">`
- Sombra: `shadow-elevated` (era `shadow-card`)
- **`border-l-4` colorido mantido** com `style={{ borderLeftColor: config.cor }}`
- Badge de alertas: **inline className** (sem `Badge` component — interface incompatível):
  ```tsx
  {alertas > 0 ? (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning/15 text-warning">
      ⚠ {alertas} alerta{alertas > 1 ? 's' : ''}
    </span>
  ) : (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/10 text-success">
      ✓ ok
    </span>
  )}
  ```
- Progress bar: `h-2` (8px, era `h-1.5`)
- Valor total: `text-sm font-bold text-text-primary` (era `text-[11px] text-text-muted`)

#### 3C — ProdutoEstoqueCard melhorado

**Mudanças em `components/estoque/ProdutoEstoqueCard.tsx`:**

Status definidos:
- `CRÍTICO`: `estoque_atual < estoque_minimo * 0.5` → ícone `🔴`, badge `bg-danger text-white`
- `BAIXO`: `estoque_atual < estoque_minimo && estoque_atual >= estoque_minimo * 0.5` → ícone `🟡`, badge `bg-warning/20 text-warning`
- `OK`: demais → ícone `🟢`, sem badge (ou badge verde discreto)

Mudanças visuais:
- Ícone de status antes do nome: `🔴` / `🟡` / `🟢`
- Badge de status: pill no canto direito, maior e mais proeminente (inline className, não `Badge` component)
- Progress bar: `h-2` (8px, era `h-1.5`)
- Hint de mínimo na linha da barra: `mín: {produto.estoque_minimo}{produto.unidade_padrao}` à direita

```tsx
// Layout do card melhorado
<div className="bg-white border border-border rounded-xl shadow-card p-3 flex flex-col gap-2 ...">
  {/* Header */}
  <div className="flex items-start justify-between gap-2">
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <span className="text-base leading-none">{statusIcon}</span>  {/* 🔴🟡🟢 */}
      <div className="flex-1 min-w-0">
        <p className="text-text-primary font-bold text-sm break-words">{produto.nome}</p>
        <p className="text-text-faint text-[11px]">{produto.categoria}</p>
      </div>
    </div>
    {status !== 'OK' && (
      <span className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${badgeClass}`}>
        {status === 'CRITICO' ? '🔴 Crítico' : '🟡 Baixo'}
      </span>
    )}
  </div>

  {/* Barra de estoque */}
  <div>
    <div className="flex justify-between text-[10px] text-text-faint mb-1">
      <span>{produto.estoque_atual.toFixed(1)}{produto.unidade_padrao}</span>
      <span>mín: {produto.estoque_minimo}{produto.unidade_padrao}</span>
    </div>
    <div className="h-2 bg-border rounded-full overflow-hidden">  {/* h-2 = 8px */}
      <div className="h-full rounded-full transition-all" style={{ width: `${percentual}%`, backgroundColor: corBarra }} />
    </div>
  </div>

  {/* Custo médio + ações */}
  ...
</div>
```

---

## Files to Create / Modify / Delete

| Ação | Arquivo |
|------|---------|
| CREATE | `lib/context/sidebar-context.tsx` — React Context para estado do sidebar |
| CREATE | `components/layout/AppShell.tsx` — SidebarProvider + Header + Sidebar + main |
| CREATE | `components/layout/Sidebar.tsx` — drawer com links de navegação |
| MODIFY | `components/layout/Header.tsx` — h-14 fixo, botões [🤖][🔔][≡], título via usePathname |
| DELETE | `components/layout/BottomNav.tsx` |
| DELETE | `components/layout/Nav.tsx` — inativo, substituído pelo Sidebar |
| MODIFY | `app/layout.tsx` — usar `<AppShell>`, remover Header/BottomNav diretos |
| MODIFY | `app/page.tsx` — adicionar `'use client'`, implementar dashboard completo |
| CREATE | `components/dashboard/SaudacaoHero.tsx` |
| CREATE | `components/dashboard/AlertasCriticos.tsx` |
| CREATE | `components/dashboard/KpiStrip.tsx` |
| CREATE | `components/dashboard/GraficoSemanal.tsx` |
| CREATE | `components/estoque/EstoqueHero.tsx` |
| MODIFY | `app/estoque/page.tsx` — hero A1, sub-tabs sticky top-14, remove fixed bottom |
| MODIFY | `components/estoque/CategoriaCard.tsx` — ícone 3xl, badges inline, shadow-elevated, h-2 bar |
| MODIFY | `components/estoque/ProdutoEstoqueCard.tsx` — status badge, ícone 🔴🟡🟢, h-2 bar |
| MODIFY | `lib/seed.ts` — adicionar `meta_estoque_valor: 2000` no setDocument configuracoes/geral |

---

## Title Map para Header (usePathname → label)

```ts
const PAGE_TITLES: Record<string, string> = {
  '/':             'Dashboard',
  '/estoque':      'Estoque',
  '/fornecedores': 'Fornecedores',
  '/precos':       'Preços',
  '/financeiro':   'Financeiro',
  '/compras':      'Compras',
}
// Fallback: 'Panela da Roça'
```

---

## Data Contracts

### `configuracoes/geral` (Firestore)
Campos existentes usados:
- `meta_dia_util: number` — meta de faturamento dias úteis
- `meta_domingo: number` — meta de faturamento domingos
- `cmv_ideal_percentual: number` — CMV alvo

Novo campo:
- `meta_estoque_valor: number` — valor alvo de estoque; default `2000` no componente se `undefined`; adicionar em `lib/seed.ts`

### `financeiro` collection (não existe ainda)
Dashboard mostra `"—"` para faturamento e CMV. `GraficoSemanal` renderiza barras skeleton (`bg-border animate-pulse`). **Não bloquear MVP.** Fórmula do CMV (COGS / Receita) será definida quando a collection for criada.

### `produtos` collection
Já existente — usado para alertas no dashboard e hero do estoque. Produtos com `custo_medio === 0` incluídos no valorTotal do hero (contribuição R$0).

---

## Constraints

- **Sem novas libs** — sidebar usa React Context (`lib/context/sidebar-context.tsx`). Gráfico em CSS puro (divs com `height` %).
- **Header `h-14` fixo** — não adicionar padding/margin que aumente a altura; sub-tabs do estoque dependem de `sticky top-14`
- **Mobile-first** — sidebar funciona em 375px; overlay cobre tela toda
- **Terra Clara tokens** — usar apenas tokens existentes (`bg-bg-page`, `shadow-card`, `shadow-elevated`, `text-brand`, etc.)
- **`Badge` component não usado** — interface existente é `color: string` (hex). Usar inline classNames nos cards.
- **Sem quebrar módulos existentes** — Fornecedores, Preços, Financeiro continuam funcionando após troca de nav

---

## Success Criteria

1. BottomNav e Nav.tsx removidos, sem regressão de navegação em nenhuma rota existente
2. Sidebar abre/fecha com overlay, fecha ao clicar fora e ao pressionar Esc
3. Header tem altura fixa `h-14`, com botões de ação e título dinâmico por rota
4. Dashboard mostra saudação dinâmica, seção de alertas (sempre visível), KPIs (`—` ou real), gráfico 7 dias (skeleton ou real)
5. Estoque tem hero terracota com valor total + alertas + barra de progresso
6. Sub-tabs do estoque estão sticky `top-14`, não no rodapé
7. CategoriaCard com ícone `text-3xl`, badge inline de status, `shadow-elevated`, `border-l-4` colorido, `h-2` progress bar
8. ProdutoEstoqueCard com `h-2` progress bar, badge de status proeminente, ícone `🔴🟡🟢`
9. `lib/seed.ts` inclui `meta_estoque_valor: 2000`
