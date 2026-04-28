'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, SectionTitle } from '@/components/ui'
import { CategoriaCard } from '@/components/estoque/CategoriaCard'
import { ProdutoEstoqueCard } from '@/components/estoque/ProdutoEstoqueCard'
import { EntradaEstoque } from '@/components/estoque/EntradaEstoque'
import { BaixaEstoque } from '@/components/estoque/BaixaEstoque'
import { RegistroPerda } from '@/components/estoque/RegistroPerda'
import { ChatEstoque } from '@/components/estoque/ChatEstoque'
import { DonutChart, DonutSegmento } from '@/components/estoque/DonutChart'
import { Produto, Fornecedor } from '@/types'
import { CATEGORIAS, CategoriaConfig } from '@/lib/categorias'
import { getProdutos } from '@/lib/services/estoque'
import { getFornecedores } from '@/lib/services/fornecedores'
import { seedIfEmpty } from '@/lib/seed'
import { fmtBRL } from '@/utils/calculos'

type Aba = 'estoque' | 'chat' | 'entrada' | 'baixa'
type AbaMovimento = 'baixa' | 'perda'

const ABAS: { id: Aba; icon: string; label: string }[] = [
  { id: 'estoque', icon: '📦', label: 'Estoque' },
  { id: 'chat', icon: '🤖', label: 'Chat IA' },
  { id: 'entrada', icon: '📥', label: 'Entrada' },
  { id: 'baixa', icon: '📤', label: 'Baixa' },
]

export default function EstoquePage() {
  const [aba, setAba] = useState<Aba>('estoque')
  const [abaMovimento, setAbaMovimento] = useState<AbaMovimento>('baixa')
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [carregando, setCarregando] = useState(true)

  // Estoque tab filters
  const [busca, setBusca] = useState('')
  const [catFiltro, setCatFiltro] = useState<string | null>(null)   // categoria.id
  const [subFiltro, setSubFiltro] = useState<string | null>(null)   // subcategoria.id

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

  const ativos = useMemo(() => produtos.filter(p => p.ativo), [produtos])

  // Derived stats
  const totalAlertas = useMemo(
    () => ativos.filter(p => p.estoque_atual < p.estoque_minimo).length,
    [ativos]
  )
  const valorTotal = useMemo(
    () => ativos.reduce((s, p) => s + p.estoque_atual * p.custo_medio, 0),
    [ativos]
  )

  // Donut segments
  const donutSegmentos: DonutSegmento[] = useMemo(
    () => CATEGORIAS.map(cat => ({
      label: cat.nome,
      value: ativos.filter(p => p.categoria === cat.nome).reduce((s, p) => s + p.estoque_atual * p.custo_medio, 0),
      cor: cat.cor,
    })).filter(s => s.value > 0),
    [ativos]
  )

  // Config do filtro atual
  const catConfig: CategoriaConfig | null = catFiltro ? (CATEGORIAS.find(c => c.id === catFiltro) ?? null) : null

  // Produtos filtrados pelo search + categoria + subcategoria
  const produtosFiltrados = useMemo(() => {
    let prods = ativos
    if (busca.trim()) {
      const b = busca.trim().toLowerCase()
      prods = prods.filter(p =>
        p.nome.toLowerCase().includes(b) ||
        p.sinonimos?.some(s => s.toLowerCase().includes(b))
      )
    }
    if (catConfig) {
      prods = prods.filter(p => p.categoria === catConfig.nome)
    }
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
    <div className="fadein flex flex-col gap-0">
      <div className="flex flex-col gap-3 pb-32">

        {/* ══ ABA: ESTOQUE ══ */}
        {aba === 'estoque' && (
          <>
            {/* Summary strip */}
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

            {/* Search */}
            <div className="relative mb-3">
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
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category chips */}
            {!busca && (
              <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-none">
                {CATEGORIAS.map(cat => {
                  const prodsCat = ativos.filter(p => p.categoria === cat.nome)
                  if (prodsCat.length === 0) return null
                  const alertasCat = prodsCat.filter(p => p.estoque_atual < p.estoque_minimo).length
                  const ativo = catFiltro === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => selecionarCategoria(cat.id)}
                      className={[
                        'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                        ativo
                          ? 'bg-brand text-white border-brand'
                          : 'bg-white border-border text-text-secondary hover:border-brand hover:text-brand',
                      ].join(' ')}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.nome}</span>
                      {alertasCat > 0 && (
                        <span className={[
                          'text-[9px] font-bold px-1 rounded-full',
                          ativo ? 'bg-white/20 text-white' : 'bg-warning/20 text-warning',
                        ].join(' ')}>
                          {alertasCat}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Main content: category grid OR product list */}
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
                {donutSegmentos.length > 0 && (
                  <div className="bg-white rounded-xl shadow-card p-4 mt-3">
                    <p className="text-sm font-bold text-text-secondary mb-3">📊 Distribuição por categoria</p>
                    <DonutChart segmentos={donutSegmentos} />
                  </div>
                )}
              </>
            ) : (
              /* Lista de produtos filtrados (busca ativa ou categoria selecionada) */
              <div className="flex flex-col gap-2">
                {/* Context label */}
                {(catConfig || busca) && (
                  <div className="flex items-center gap-2 mb-1">
                    {catConfig && (
                      <button
                        onClick={() => { setCatFiltro(null); setSubFiltro(null) }}
                        className="text-text-faint text-[10px] hover:text-text-muted transition-colors"
                      >
                        ✕ Limpar filtro
                      </button>
                    )}
                    <span className="text-text-faint text-[10px]">
                      {busca
                        ? `${produtosFiltrados.length} resultado${produtosFiltrados.length !== 1 ? 's' : ''} para "${busca}"`
                        : `${produtosFiltrados.length} produto${produtosFiltrados.length !== 1 ? 's' : ''}${catConfig ? ` em ${catConfig.nome}` : ''}`
                      }
                    </span>
                  </div>
                )}

                {/* Chips de subcategoria */}
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
                          {alertasSub > 0 && <span className="text-[9px] text-warning ml-0.5">⚠</span>}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Cards de produto */}
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
            <div className="flex gap-1 bg-bg-page rounded-lg p-1 mb-3">
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

      {/* Bottom nav — estoque tabs, sits above global BottomNav */}
      <div className="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-border flex shadow-elevated">
        {ABAS.map(a => (
          <button
            key={a.id}
            onClick={() => { setAba(a.id); if (a.id === 'estoque') { setCatFiltro(null); setSubFiltro(null); setBusca('') } }}
            className={[
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition-colors relative',
              aba === a.id ? 'text-brand bg-brand-light/40' : 'text-text-faint hover:text-text-muted',
            ].join(' ')}
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
    </div>
  )
}
