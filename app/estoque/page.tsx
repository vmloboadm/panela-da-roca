'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, SectionTitle } from '@/components/ui'
import { ProdutoEstoqueCard } from '@/components/estoque/ProdutoEstoqueCard'
import { EntradaEstoque } from '@/components/estoque/EntradaEstoque'
import { BaixaEstoque } from '@/components/estoque/BaixaEstoque'
import { RegistroPerda } from '@/components/estoque/RegistroPerda'
import { ChatEstoque } from '@/components/estoque/ChatEstoque'
import { DonutChart, DonutSegmento } from '@/components/estoque/DonutChart'
import { CategoriaCard } from '@/components/estoque/CategoriaCard'
import { Produto, Fornecedor } from '@/types'
import { CATEGORIAS } from '@/lib/categorias'
import { getProdutos } from '@/lib/services/estoque'
import { getFornecedores } from '@/lib/services/fornecedores'
import { seedIfEmpty } from '@/lib/seed'
import { fmtBRL } from '@/utils/calculos'

type Aba = 'estoque' | 'chat' | 'entrada' | 'baixa'
type AbaMovimento = 'baixa' | 'perda'

// Navigation state for drill-down
type DrillView =
  | { tipo: 'dashboard' }
  | { tipo: 'categoria'; categoriaId: string }
  | { tipo: 'subcategoria'; categoriaId: string; subcategoriaId: string }

const ABAS: { id: Aba; icon: string; label: string }[] = [
  { id: 'estoque', icon: '📦', label: 'Estoque' },
  { id: 'chat', icon: '🤖', label: 'Chat IA' },
  { id: 'entrada', icon: '📥', label: 'Entrada' },
  { id: 'baixa', icon: '📤', label: 'Baixa' },
]

export default function EstoquePage() {
  const [aba, setAba] = useState<Aba>('estoque')
  const [abaMovimento, setAbaMovimento] = useState<AbaMovimento>('baixa')
  const [drill, setDrill] = useState<DrillView>({ tipo: 'dashboard' })
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [carregando, setCarregando] = useState(true)

  const recarregarProdutos = useCallback(async () => {
    const prods = await getProdutos()
    setProdutos(prods)
  }, [])

  useEffect(() => {
    async function init() {
      await seedIfEmpty()
      const [prods, forn] = await Promise.all([getProdutos(), getFornecedores()])
      setProdutos(prods)
      setFornecedores(forn)
      setCarregando(false)
    }
    init()
  }, [])

  const ativos = produtos.filter(p => p.ativo)

  // Derived stats
  const totalAlertas = ativos.filter(p => p.estoque_atual < p.estoque_minimo).length
  const valorTotal = ativos.reduce((s, p) => s + p.estoque_atual * p.custo_medio, 0)

  // Donut segments — value per main category
  const donutSegmentos: DonutSegmento[] = CATEGORIAS.map(cat => {
    const valor = ativos
      .filter(p => p.categoria === cat.nome)
      .reduce((s, p) => s + p.estoque_atual * p.custo_medio, 0)
    return { label: cat.nome, value: valor, cor: cat.cor }
  }).filter(s => s.value > 0)

  // Stats per category
  function getStatsCategoria(catNome: string) {
    const prods = ativos.filter(p => p.categoria === catNome)
    return {
      total: prods.length,
      alertas: prods.filter(p => p.estoque_atual < p.estoque_minimo).length,
      valor: prods.reduce((s, p) => s + p.estoque_atual * p.custo_medio, 0),
    }
  }

  // Current drill-down category config
  const drillCategoria = drill.tipo !== 'dashboard'
    ? CATEGORIAS.find(c => c.id === drill.categoriaId)
    : undefined

  const drillSubcategoria = drill.tipo === 'subcategoria' && drillCategoria
    ? drillCategoria.subcategorias.find(s => s.id === drill.subcategoriaId)
    : undefined

  // Products to show in subcategory drill
  const produtosDrillSubcat = drill.tipo === 'subcategoria' && drillCategoria && drillSubcategoria
    ? ativos.filter(p => p.categoria === drillCategoria.nome && p.subcategoria === drillSubcategoria.nome)
    : []

  // Products in a category (for subcategory list)
  function getProdutosPorSubcategoria(catNome: string, subNome: string) {
    return ativos.filter(p => p.categoria === catNome && p.subcategoria === subNome)
  }

  if (carregando) {
    return (
      <div className="fadein flex items-center justify-center py-20">
        <p className="text-text-muted text-sm animate-pulse">Carregando estoque...</p>
      </div>
    )
  }

  return (
    <div className="fadein flex flex-col gap-0">
      {/* ── Conteúdo principal ── */}
      <div className="flex flex-col gap-4 pb-20">

        {/* ══ ABA: ESTOQUE ══ */}
        {aba === 'estoque' && (
          <>
            {/* Dashboard view */}
            {drill.tipo === 'dashboard' && (
              <>
                {/* Summary bar */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-bg-card rounded-xl p-3 border border-border flex flex-col gap-0.5">
                    <p className="text-text-faint text-[10px]">Produtos</p>
                    <p className="text-text-primary font-extrabold text-lg leading-tight">{ativos.length}</p>
                  </div>
                  <div className={['rounded-xl p-3 border flex flex-col gap-0.5', totalAlertas > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-bg-card border-border'].join(' ')}>
                    <p className="text-text-faint text-[10px]">Alertas</p>
                    <p className={['font-extrabold text-lg leading-tight', totalAlertas > 0 ? 'text-red-400' : 'text-text-primary'].join(' ')}>{totalAlertas}</p>
                  </div>
                  <div className="bg-bg-card rounded-xl p-3 border border-border flex flex-col gap-0.5">
                    <p className="text-text-faint text-[10px]">Valor est.</p>
                    <p className="text-text-primary font-extrabold text-sm leading-tight">{fmtBRL(valorTotal)}</p>
                  </div>
                </div>

                {/* Donut chart */}
                {donutSegmentos.length > 0 && (
                  <Card>
                    <SectionTitle icon="📊">Valor por Categoria</SectionTitle>
                    <DonutChart segmentos={donutSegmentos} />
                  </Card>
                )}

                {/* Alertas em destaque */}
                {totalAlertas > 0 && (
                  <Card>
                    <SectionTitle icon="⚠️">Produtos em Alerta</SectionTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {ativos
                        .filter(p => p.estoque_atual < p.estoque_minimo)
                        .map(p => (
                          <ProdutoEstoqueCard
                            key={p.id}
                            produto={p}
                            onEntrada={() => setAba('entrada')}
                            onBaixa={() => setAba('baixa')}
                          />
                        ))}
                    </div>
                  </Card>
                )}

                {/* Category grid */}
                <Card>
                  <SectionTitle icon="📦">Por Categoria</SectionTitle>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIAS.map(cat => {
                      const stats = getStatsCategoria(cat.nome)
                      if (stats.total === 0) return null
                      return (
                        <CategoriaCard
                          key={cat.id}
                          config={cat}
                          totalProdutos={stats.total}
                          alertas={stats.alertas}
                          valorTotal={stats.valor}
                          onClick={() => setDrill({ tipo: 'categoria', categoriaId: cat.id })}
                        />
                      )
                    })}
                  </div>
                </Card>
              </>
            )}

            {/* Categoria drill-down */}
            {drill.tipo === 'categoria' && drillCategoria && (
              <Card>
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => setDrill({ tipo: 'dashboard' })}
                    className="text-text-muted text-xs hover:text-text-primary"
                  >
                    ← Categorias
                  </button>
                  <span className="text-text-faint text-xs">/</span>
                  <span className="text-text-primary text-xs font-bold">
                    {drillCategoria.icon} {drillCategoria.nome}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {drillCategoria.subcategorias.map(sub => {
                    const prods = getProdutosPorSubcategoria(drillCategoria.nome, sub.nome)
                    if (prods.length === 0) return null
                    const alertas = prods.filter(p => p.estoque_atual < p.estoque_minimo).length
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setDrill({ tipo: 'subcategoria', categoriaId: drillCategoria.id, subcategoriaId: sub.id })}
                        className="flex items-center justify-between rounded-xl border border-border px-3 py-3 hover:bg-bg-hover transition-colors text-left"
                      >
                        <div>
                          <p className="text-text-primary text-sm font-semibold">{sub.nome}</p>
                          <p className="text-text-faint text-[10px]">{prods.length} produto{prods.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {alertas > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold">
                              ⚠️ {alertas}
                            </span>
                          )}
                          <span className="text-text-faint text-sm">›</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </Card>
            )}

            {/* Subcategoria drill-down */}
            {drill.tipo === 'subcategoria' && drillCategoria && drillSubcategoria && (
              <Card>
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <button
                    onClick={() => setDrill({ tipo: 'dashboard' })}
                    className="text-text-muted text-xs hover:text-text-primary"
                  >
                    ← Categorias
                  </button>
                  <span className="text-text-faint text-xs">/</span>
                  <button
                    onClick={() => setDrill({ tipo: 'categoria', categoriaId: drillCategoria.id })}
                    className="text-text-muted text-xs hover:text-text-primary"
                  >
                    {drillCategoria.nome}
                  </button>
                  <span className="text-text-faint text-xs">/</span>
                  <span className="text-text-primary text-xs font-bold">{drillSubcategoria.nome}</span>
                </div>

                {produtosDrillSubcat.length === 0 ? (
                  <p className="text-text-muted text-sm text-center py-6">Nenhum produto nesta subcategoria.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {produtosDrillSubcat.map(p => (
                      <ProdutoEstoqueCard
                        key={p.id}
                        produto={p}
                        onEntrada={() => setAba('entrada')}
                        onBaixa={() => setAba('baixa')}
                      />
                    ))}
                  </div>
                )}
              </Card>
            )}
          </>
        )}

        {/* ══ ABA: CHAT IA ══ */}
        {aba === 'chat' && (
          <Card>
            <SectionTitle icon="🤖">Chat de Estoque</SectionTitle>
            <p className="text-text-muted text-sm mb-3">
              Diga o que comprou ou faça perguntas — por texto ou áudio.
            </p>
            <ChatEstoque
              produtos={produtos}
              onEstoqueAtualizado={recarregarProdutos}
            />
          </Card>
        )}

        {/* ══ ABA: ENTRADA ══ */}
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

        {/* ══ ABA: BAIXA ══ */}
        {aba === 'baixa' && (
          <Card>
            <div className="flex gap-1 bg-bg-base rounded-lg p-1 mb-3">
              {(['baixa', 'perda'] as AbaMovimento[]).map(sub => (
                <button
                  key={sub}
                  onClick={() => setAbaMovimento(sub)}
                  className={[
                    'flex-1 rounded py-1.5 text-xs font-bold transition-colors',
                    abaMovimento === sub ? 'bg-bg-card text-text-primary' : 'text-text-muted',
                  ].join(' ')}
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

      {/* ── Bottom nav (fixed) ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-card border-t border-border flex z-50">
        {ABAS.map(a => (
          <button
            key={a.id}
            onClick={() => { setAba(a.id); if (a.id === 'estoque') setDrill({ tipo: 'dashboard' }) }}
            className={[
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-bold transition-colors relative',
              aba === a.id ? 'text-brand' : 'text-text-faint hover:text-text-muted',
            ].join(' ')}
          >
            <span className="text-lg leading-none">{a.icon}</span>
            <span>{a.label}</span>
            {a.id === 'estoque' && totalAlertas > 0 && (
              <span className="absolute top-1.5 right-[20%] w-3.5 h-3.5 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                {totalAlertas > 9 ? '9+' : totalAlertas}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
