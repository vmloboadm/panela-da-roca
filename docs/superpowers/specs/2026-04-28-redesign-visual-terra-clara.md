# Redesign Visual — Terra Clara

## Goal

Substituir o tema dark frio atual por um tema claro quente ("Terra Clara") em todo o sistema, com o dashboard de estoque como a página mais completa e visualmente elaborada.

## Context

Sistema Panela da Roça — Next.js 14, Tailwind CSS, TypeScript, mobile-first. Usado principalmente no celular em ambiente de restaurante. O tema atual usa fundo `#0d1117` (preto-azulado frio). O novo tema usa tons terrosos, off-white e terracota. A fonte atual é **DM Sans** e deve ser mantida.

---

## Design System

### Tokens de Cor — Tailwind Config (estrutura aninhada)

O `tailwind.config.ts` usa objetos aninhados. A tabela abaixo mostra o caminho no config e a classe CSS gerada:

| Caminho no config | Classe CSS gerada | Valor Hex | Uso |
|---|---|---|---|
| `colors.bg.page` | `bg-bg-page` | `#FFF8F0` | Fundo geral de todas as páginas |
| `colors.bg.card` | `bg-bg-card` | `#FFFFFF` | Cards, painéis, modais |
| `colors.bg.hover` | `bg-bg-hover` | `#FFF3E8` | Hover em cards clicáveis (substitui antigo `bg.hover`) |
| `colors.border.DEFAULT` | `border-border` | `#F0E6D3` | Bordas sutis (valor padrão) |
| `colors.border.focus` | `border-border-focus` | `#C2410C` | Borda em foco (inputs) |
| `colors.brand` | `bg-brand / text-brand` | `#C2410C` | Terracota — cor primária |
| `colors.brand-light` | `bg-brand-light` | `#FED7AA` | Fundo de badges/chips |
| `colors.brand-hover` | `bg-brand-hover` | `#9A3412` | Hover do botão primário |
| `colors.brand-dark` | `bg-brand-dark` | `#7C2D12` | Gradiente escuro do botão primário |
| `colors.accent` | `text-accent` | `#D97706` | Âmbar — alertas secundários |
| `colors.text.primary` | `text-text-primary` | `#1C0A00` | Títulos, texto principal |
| `colors.text.secondary` | `text-text-secondary` | `#78350F` | Subtítulos, labels |
| `colors.text.muted` | `text-text-muted` | `#92400E` | Texto de apoio |
| `colors.text.faint` | `text-text-faint` | `#C4884A` | Placeholders, infos secundárias |
| `colors.success` | `text-success / bg-success` | `#15803D` | Estoque ok / confirmações |
| `colors.warning` | `text-warning` | `#D97706` | Alerta de estoque baixo |
| `colors.danger` | `text-danger / bg-danger` | `#DC2626` | Crítico / ações destrutivas |

**Remoção:** remover `colors.bg.base` (substituído por `bg.page`) e o antigo `colors.bg.hover` (substituído pelo novo valor warm). Remover `colors.border.light` (substituído por `border.DEFAULT`).

**Mapeamento de tokens antigos → novos** (para busca e substituição em todos os arquivos):
| Token antigo | Token novo |
|---|---|
| `bg-bg-base` | `bg-bg-page` ou `bg-white` (cards usam `bg-white`, fundo de página usa `bg-bg-page`) |
| `bg-bg-card` | `bg-white` |
| `bg-bg-input` | `bg-white` |
| `bg-bg-hover` | `bg-bg-hover` (mantido, mas com novo valor warm) |
| `border-border-light` | `border-border` |
| `border-border-focus` | `border-border-focus` (mantido) |
| `text-text-primary` | `text-text-primary` (mantido, novo valor) |
| `text-text-secondary` | `text-text-secondary` (mantido, novo valor) |
| `text-text-muted` | `text-text-muted` (mantido, novo valor) |
| `text-text-faint` | `text-text-faint` (mantido, novo valor) |
| `text-green-400 / bg-green-400/10` | `text-success / bg-success/10` |
| `text-red-400 / bg-red-400/10` | `text-danger / bg-danger/10` |
| `text-amber-400 / bg-amber-400/10` | `text-warning / bg-warning/10` |

### Sombras — `theme.extend.boxShadow`

Adicionar ao Tailwind config:
```js
boxShadow: {
  card: '0 1px 4px rgba(120,53,15,0.10)',
  elevated: '0 4px 16px rgba(120,53,15,0.15)',
}
```
Isso habilita as classes `shadow-card` e `shadow-elevated`.

### `globals.css`

- Atualizar `background-color` do `body` para `#FFF8F0`
- Atualizar `color` do `body` para `#1C0A00`
- Atualizar `themeColor` no `viewport` export de `app/layout.tsx` para `#FFF8F0`

### Tipografia
- Família: **DM Sans** (mantida — não alterar)
- Título de página: `text-xl font-bold text-text-primary`
- Subtítulo: `text-sm font-semibold text-text-secondary`
- Corpo: `text-sm text-text-primary`
- Caption/label: `text-xs text-text-muted`

### Inputs
- Borda padrão: `border-border`
- Foco: `border-border-focus ring-2 ring-brand/15`
- Background: `bg-white`
- Placeholder: `text-text-faint`

### Botões
- **Primário**: `bg-gradient-to-br from-brand to-brand-dark hover:opacity-90 text-white rounded-xl` (mantém o gradiente, troca as cores)
- **Secundário**: `bg-brand-light text-brand hover:opacity-90 rounded-xl`
- **Ghost**: `text-text-muted hover:text-brand hover:bg-bg-hover rounded-xl`
- **Danger**: `bg-danger text-white hover:opacity-90 rounded-xl`

### Chips de Filtro
- Inativo: `bg-border text-text-secondary rounded-full`
- Ativo: `bg-brand text-white rounded-full`

---

## Layout Global

### `app/layout.tsx`
- Remover `<Nav />` do topo
- Adicionar `<BottomNav />` fixo no rodapé
- Atualizar `<main>` para `pb-16` (espaço para o bottom nav fixo)
- Atualizar `themeColor` no viewport export: `#FFF8F0`
- Fundo do body: `bg-bg-page`

### Header Fixo (topo) — `components/layout/Header.tsx`
- Fundo: `bg-white border-b border-border shadow-sm` (remover hardcoded `border-[#1e2130]`)
- Manter logo (`/logo.png`) e nome do restaurante; remover subtitle e date display (info redundante no mobile)
- Direita: ícone de configurações em `text-text-muted`
- Altura: `h-14` (56px)

### Bottom Navigation — `components/layout/BottomNav.tsx` (novo componente)
Substitui o `Nav.tsx` atual (que pode ser aposentado ou reescrito).
- Fundo: `bg-white border-t border-border`
- 4 abas: Início (`/`) · Estoque (`/estoque`) · Compras (`/compras`) · Mais (`/config`)
- Aba ativa: ícone + label em `text-brand font-semibold`
- Aba inativa: ícone + label em `text-text-faint`
- Altura fixa `h-16`, `fixed bottom-0 left-0 right-0 z-50`

---

## Superdashboard de Estoque — `app/estoque/page.tsx`

### Estrutura da Página (scroll vertical)

```
┌─────────────────────────────┐
│ Header: "Estoque"  [🔔 3]   │  ← h-14 fixo
├─────────────────────────────┤
│ [💰 R$1.240] [⚠️ 4] [📦 82] │  ← 3 metric cards, grid-cols-3 (não scroll)
├─────────────────────────────┤
│ 🔍 Buscar produto...        │  ← search bar
├─────────────────────────────┤
│ [🥩 Carnes ⚠2] [🌾 Secos]  │  ← chips de categoria (scroll horizontal)
├─────────────────────────────┤
│ Grid 2 colunas de categoria │  ← visível quando NENHUMA categoria selecionada
│ ┌─────────┐  ┌─────────┐   │
│ │🥩 Carnes│  │🌾 Secos │   │
│ └─────────┘  └─────────┘   │
├─────────────────────────────┤
│ 📊 Donut chart (visível)    │  ← abaixo do grid, sempre visível
├─────────────────────────────┤
│ ──── quando categoria ────  │  ← substitui grid+donut quando categoria ativa
│ [Sub1] [Sub2] [Sub3]        │  ← chips de subcategoria
│ Lista de produtos...        │  ← ProdutoEstoqueCard compactos
└─────────────────────────────┘
│   [📦 Estoque] [🤖 Chat] [➕] [➖]  │  ← bottom nav do estoque
```

**Transição estado:** quando o usuário toca um `CategoriaCard`, a página substitui o grid + donut pelo painel de subcategorias + lista de produtos (sem animação de slide, apenas re-render). O chip de categoria ativo fica destacado. Botão "✕ Limpar filtro" aparece ao lado dos chips.

### Metric Cards (faixa 3 colunas fixas — `grid grid-cols-3`)
- `bg-white rounded-xl shadow-card p-3 text-center`
- Ícone (emoji 20px) + valor numérico `text-lg font-bold text-text-primary` + label `text-[10px] text-text-muted`
- Card de alertas: número em `text-warning font-bold` se > 0

### CategoriaCard — `components/estoque/CategoriaCard.tsx`
- `bg-white rounded-xl shadow-card p-3`
- Borda esquerda colorida `border-l-4` na cor de `config.cor` (manter cores existentes de `lib/categorias.ts` — já são saturadas e funcionam bem em fundo branco)
- Ícone (24px) + nome `font-bold text-text-primary`
- Badge de alertas: `bg-warning/10 text-warning text-[10px] rounded-full px-1.5`
- Valor: `text-xs text-text-muted`
- Mini barra: fundo `bg-border`, preenchimento na cor da categoria

### DonutChart — `components/estoque/DonutChart.tsx`
- Track circle: mudar `stroke="#1e2130"` para `stroke="#F0E6D3"` (cor do border token)
- Texto central: `text-text-primary` e `text-text-faint`
- Legenda: `text-text-muted`
- Sempre visível na página principal (remover toggle "📊 Ver gráfico")

### Lista de Produtos (estado com categoria selecionada)
- Header: nome da categoria + "✕ Limpar filtro"
- Chips de subcategoria (inativo `bg-border`, ativo `bg-brand text-white`)
- `ProdutoEstoqueCard` adaptado ao novo tema

### ProdutoEstoqueCard — `components/estoque/ProdutoEstoqueCard.tsx`
- Fundo: `bg-white border border-border rounded-xl shadow-card`
- Nome: `text-text-primary font-semibold`
- Estoque atual vs mínimo: `text-text-muted text-xs`
- Badge status: `ok` → `bg-success/10 text-success` · `baixo` → `bg-warning/10 text-warning` · `crítico` → `bg-danger/10 text-danger`
- Custo médio: `text-text-faint text-xs`

### ChatEstoque — `components/estoque/ChatEstoque.tsx`
- Balão usuário: `bg-brand/10 border border-brand/20` texto `text-text-primary`
- Balão IA: `bg-white border border-border` texto `text-text-primary`
- Balão sistema: `bg-border/50 text-text-muted`
- Chips de perguntas rápidas: `border-border text-text-muted hover:border-brand hover:text-brand`
- Input: `bg-white border-border focus:border-border-focus`

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---|---|
| `tailwind.config.ts` | Substituir todos os tokens dark pelos tokens Terra Clara; adicionar `boxShadow.card` e `boxShadow.elevated` |
| `app/globals.css` | Atualizar `body` background e color |
| `app/layout.tsx` | Remover `<Nav />` do topo; adicionar `<BottomNav />`; atualizar `themeColor`; adicionar `pb-16` no `<main>` |
| `components/layout/Nav.tsx` | Reescrever como `BottomNav.tsx` fixo no rodapé, ou aposentar e criar novo arquivo |
| `app/estoque/page.tsx` | Redesign completo: grid de categorias, donut sempre visível, transição categoria→produtos |
| `components/estoque/CategoriaCard.tsx` | Adaptar para tema claro |
| `components/estoque/DonutChart.tsx` | Corrigir cor do track; tornar sempre visível |
| `components/estoque/ChatEstoque.tsx` | Adaptar cores dos balões |
| `components/estoque/ProdutoEstoqueCard.tsx` | Adaptar para tema claro |
| `components/ui/Button.tsx` | Atualizar variantes com novos tokens |
| `components/ui/Input.tsx` | Atualizar tokens de borda e foco |
| `components/ui/Select.tsx` | Atualizar tokens (`bg-bg-input` → `bg-white`, `border-border-light` → `border-border`) |
| `components/ui/Chip.tsx` | Active state: trocar `text-black` por `text-white` para contraste sobre `bg-brand` |
| `components/layout/Header.tsx` | Remover `border-[#1e2130]` hardcoded; remover subtitle/date; adaptar ao tema claro |
| `components/estoque/BaixaEstoque.tsx` | Substituir `bg-bg-base`, `border-border-light`, `text-green-400/red-400/amber-400` pelos tokens novos |
| `components/estoque/EntradaEstoque.tsx` | Mesmas substituições de tokens |
| `components/estoque/ConfirmarEntrada.tsx` | Mesmas substituições de tokens |
| `components/estoque/ConsultaIA.tsx` | Mesmas substituições de tokens |
| `components/estoque/RegistroPerda.tsx` | Mesmas substituições de tokens |
| `components/fornecedores/FornecedorCard.tsx` | Substituir `bg-bg-base`, `border-border-light` pelos tokens novos |
| `components/fornecedores/FornecedorModal.tsx` | Mesmas substituições de tokens |
| `components/precos/VarreduraWeb.tsx` | Mesmas substituições de tokens |
| `components/precos/TabelaCotacoes.tsx` | Mesmas substituições de tokens |
| `components/precos/ResultadoLeitura.tsx` | Mesmas substituições de tokens |
| `components/precos/LeitorUniversal.tsx` | Mesmas substituições de tokens |
| Demais páginas (`/financeiro`, `/fornecedores`, `/precos`, etc.) | Auditar e remover qualquer hex hardcoded (ex: `#1e2130`) substituindo por tokens |

---

## O que NÃO muda

- Lógica de negócio (estoque, custo médio, movimentações)
- Estrutura de dados Firestore
- Endpoints de API
- Seed e migração
- Funcionalidade do Chat IA
- Fonte (DM Sans mantida)
