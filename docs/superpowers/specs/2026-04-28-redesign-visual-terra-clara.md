# Redesign Visual — Terra Clara

## Goal

Substituir o tema dark frio atual por um tema claro quente ("Terra Clara") em todo o sistema, com o dashboard de estoque como a página mais completa e visualmente elaborada.

## Context

Sistema Panela da Roça — Next.js 14, Tailwind CSS, mobile-first. Usado principalmente no celular em ambiente de restaurante. O tema atual usa fundo `#0d1117` (preto-azulado frio) que não transmite acolhimento. O novo tema usa tons terrosos, off-white e terracota.

---

## Design System

### Paleta de Cores (CSS tokens via Tailwind config)

| Token Tailwind | Valor Hex | Uso |
|---|---|---|
| `bg-page` | `#FFF8F0` | Fundo geral de todas as páginas |
| `bg-card` | `#FFFFFF` | Cards, painéis, modais |
| `bg-card-hover` | `#FFF3E8` | Hover em cards clicáveis |
| `border` | `#F0E6D3` | Bordas sutis |
| `brand` | `#C2410C` | Terracota — cor primária, botões, acentos |
| `brand-light` | `#FED7AA` | Fundo de badges/chips da brand |
| `brand-hover` | `#9A3412` | Hover do botão primário |
| `accent` | `#D97706` | Âmbar — alertas, destaques secundários |
| `text-primary` | `#1C0A00` | Títulos, texto principal |
| `text-secondary` | `#78350F` | Subtítulos, labels |
| `text-muted` | `#92400E` | Texto de apoio |
| `text-faint` | `#C4884A` | Placeholders, infos secundárias |
| `success` | `#15803D` | Estoque ok / confirmações |
| `warning` | `#D97706` | Alerta de estoque baixo |
| `danger` | `#DC2626` | Crítico / ações destrutivas |

### Sombras
- Card padrão: `0 1px 4px rgba(120,53,15,0.10)`
- Card elevado (modal, dropdown): `0 4px 16px rgba(120,53,15,0.15)`

### Tipografia
- Família: Inter (mantida)
- Título de página: `text-xl font-bold text-text-primary`
- Subtítulo: `text-sm font-semibold text-text-secondary`
- Corpo: `text-sm text-text-primary`
- Caption/label: `text-xs text-text-muted`

### Inputs
- Borda padrão: `border-border`
- Foco: `border-brand ring-2 ring-brand/15`
- Background: `bg-white`
- Placeholder: `text-text-faint`

### Botões
- **Primário**: `bg-brand hover:bg-brand-hover text-white rounded-xl`
- **Secundário**: `bg-brand-light text-brand hover:bg-brand-light/80 rounded-xl`
- **Ghost**: `text-text-muted hover:text-brand hover:bg-bg-card-hover rounded-xl`
- **Danger**: `bg-danger text-white hover:opacity-90 rounded-xl`

### Chips de Filtro
- Inativo: `bg-border text-text-secondary rounded-full`
- Ativo: `bg-brand text-white rounded-full`

---

## Layout Global

### Header Fixo (topo)
- Fundo: `bg-white` com `border-b border-border shadow-sm`
- Esquerda: logo/nome do restaurante em `text-text-primary font-bold`
- Direita: ícone de configurações em `text-text-muted`
- Altura: 56px

### Bottom Navigation (fixo)
- Fundo: `bg-white border-t border-border`
- 4-5 abas: Início · Estoque · Compras · Financeiro · Mais
- Aba ativa: ícone + label em `text-brand`
- Aba inativa: ícone + label em `text-text-faint`

---

## Superdashboard de Estoque

### Estrutura da Página (scroll vertical, mobile)

```
┌─────────────────────────────┐
│ Header: "Estoque"  [🔔 3]   │
├─────────────────────────────┤
│ [💰 R$1.240]  [⚠️ 4]  [📦 82] │  ← 3 metric cards scroll horizontal
├─────────────────────────────┤
│ 🔍 Buscar produto...        │  ← search bar
├─────────────────────────────┤
│ [🥩 Carnes ⚠2] [🌾 Secos]  │  ← chips de categoria
│ [🥦 Horti ⚠1]  [🍺 Bebidas]│
├─────────────────────────────┤
│ (subcategory chips - aparecem│
│  ao selecionar categoria)   │
├─────────────────────────────┤
│ Grid 2 colunas:             │
│ ┌─────────┐  ┌─────────┐   │
│ │🥩 Carnes│  │🌾 Secos │   │  ← CategoriaCard
│ │ 12 prod │  │ 8 prod  │   │
│ │ R$ 420  │  │ R$ 180  │   │
│ └─────────┘  └─────────┘   │
│ ...                         │
├─────────────────────────────┤
│ 📊 Distribuição por categoria│  ← Donut chart visível direto
│ [SVG donut + legenda]       │
├─────────────────────────────┤
│ (quando categoria selecionada│
│  substitui grid por lista   │
│  de produtos filtrados)     │
└─────────────────────────────┘
│ [Estoque] [Chat IA] [+Entrada] [−Baixa] │  ← bottom nav
```

### Metric Cards (faixa de resumo)
- Scroll horizontal com 3 cards
- Cada card: `bg-white rounded-xl shadow-card p-3`
- Ícone grande colorido + valor numérico bold + label pequeno
- Card de alertas: número em `text-warning` se > 0

### CategoriaCard (grid 2 colunas)
- `bg-white rounded-xl shadow-card`
- Barra colorida à esquerda (3px) na cor da categoria
- Ícone (24px) + nome bold
- Badge de alertas em âmbar (se houver)
- Valor em estoque
- Mini barra de progresso horizontal: verde se tudo ok, âmbar/vermelho proporcional aos alertas

### Lista de Produtos (após selecionar categoria)
- Header: nome da categoria + botão "✕ voltar"
- Chips de subcategoria no topo
- Cards compactos por produto:
  - Nome + unidade
  - Estoque atual vs mínimo: `"12 kg / mín 5 kg"`
  - Badge de status: `ok` (verde) / `baixo` (âmbar) / `crítico` (vermelho)
  - Custo médio: `R$ 8,50/kg`

### Donut Chart
- Visível na página principal (não colapsado)
- Segmentos na cor de cada categoria
- Legenda em 2 colunas abaixo com % e valor

### Bottom Navigation do Estoque
- 4 abas: **Estoque** (ícone 📦) · **Chat IA** (ícone 🤖) · **Entrada** (ícone ➕) · **Baixa** (ícone ➖)
- Aba ativa: fundo `bg-brand-light` texto `text-brand` rounded-xl
- Estilo consistente com bottom nav global

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---|---|
| `tailwind.config.ts` | Substituir tokens de cor dark pelos tokens Terra Clara |
| `app/globals.css` | Ajustar variáveis CSS base (bg, text) |
| `app/estoque/page.tsx` | Redesign completo do dashboard |
| `components/estoque/CategoriaCard.tsx` | Adaptar para novo tema |
| `components/estoque/DonutChart.tsx` | Tornar visível por padrão, ajustar cores |
| `components/estoque/ChatEstoque.tsx` | Ajustar cores dos balões de chat |
| Demais componentes (`Button`, `Input`, etc.) | Ajustar classes para novos tokens |

---

## O que NÃO muda

- Lógica de negócio (estoque, custo médio, movimentações)
- Estrutura de dados Firestore
- Endpoints de API
- Seed e migração
- Funcionalidade do Chat IA
