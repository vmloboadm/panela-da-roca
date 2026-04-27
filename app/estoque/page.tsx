'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, SectionTitle } from '@/components/ui'
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
  const [mostrarInsights, setMostrarInsights] = useState(false)

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

  // Group products by subcategory for display
  type Grupo = { titulo: string; cor: string; produtos: Produto[] }
  const grupos: Grupo[] = useMemo(() => {
    const buscaAtiva = busca.trim().length > 0

    if (buscaAtiva) {
      // Flat list when searching, group by category for context
      const byCat = new Map<string, Produto[]>()
      for (const p of produtosFiltrados) {
        const label = p.subcategoria ? `${p.categoria} · ${p.subcategoria}` : p.categoria
        if (!byCat.has(label)) byCat.set(label, [])
        byCat.get(label)!.push(p)
      }
      return Array.from(byCat.entries()).map(([titulo, prods]) => {
        const cat = CATEGORIAS.find(c => c.nome === prods[0]?.categoria)
        return { titulo, cor: cat?.cor ?? '#888', produtos: prods }
      })
    }

    if (catConfig && subFiltro) {
      // Single subcategory selected
      const sub = catConfig.subcategorias.find(s => s.id === subFiltro)
      return [{
        titulo: sub?.nome ?? 'Produtos',
        cor: catConfig.cor,
        produtos: produtosFiltrados,
      }]
    }

    if (catConfig) {
      // Category selected → group by subcategory
      return catConfig.subcategorias
        .map(sub => ({
          titulo: sub.nome,
          cor: catConfig.cor,
          produtos: produtosFiltrados.filter(p => p.subcategoria === sub.nome),
        }))
        .concat([{
          titulo: 'Outros',
          cor: catConfig.cor,
          produtos: produtosFiltrados.filter(p => !p.subcategoria),
        }])
        .filter(g => g.produtos.length > 0)
    }

    // No filter → group by category, then subcategory
    const result: Grupo[] = []
    for (const cat of CATEGORIAS) {
      const prodsCat = produtosFiltrados.filter(p => p.categoria === cat.nome)
      if (prodsCat.length === 0) continue
      for (const sub of cat.subcategorias) {
        const prodsSub = prodsCat.filter(p => p.subcategoria === sub.nome)
        if (prodsSub.length > 0) result.push({ titulo: `${cat.icon} ${cat.nome}  ›  ${sub.nome}`, cor: cat.cor, produtos: prodsSub })
      }
      const sem = prodsCat.filter(p => !p.subcategoria)
      if (sem.length > 0) result.push({ titulo: `${cat.icon} ${cat.nome}`, cor: cat.cor, produtos: sem })
    }
    return result
  }, [produtosFiltrados, busca, catConfig, subFiltro])

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
      <div className="flex flex-col gap-3 pb-20">

        {/* ══ ABA: ESTOQUE ══ */}
        {aba === 'estoque' && (
          <>
            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-bg-card rounded-xl p-3 border border-border flex flex-col gap-0.5">
                <p className="text-text-faint text-[10px]">Produtos</p>
                <p className="text-text-primary font-extrabold text-xl leading-tight">{ativos.length}</p>
              </div>
              <div className={['rounded-xl p-3 border flex flex-col gap-0.5', totalAlertas > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-bg-card border-border'].join(' ')}>
                <p className="text-text-faint text-[10px]">Alertas</p>
                <p className={['font-extrabold text-xl leading-tight', totalAlertas > 0 ? 'text-red-400' : 'text-text-primary'].join(' ')}>{totalAlertas}</p>
              </div>
              <div className="bg-bg-card rounded-xl p-3 border border-border flex flex-col gap-0.5">
                <p className="text-text-faint text-[10px]">Em estoque</p>
                <p className="text-text-primary font-extrabold text-sm leading-tight">{fmtBRL(valorTotal)}</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-faint text-sm pointer-events-none">🔍</span>
              <input
                type="text"
                value={busca}
                onChange={e => { setBusca(e.target.value); setCatFiltro(null); setSubFiltro(null) }}
                placeholder="Buscar produto por nome..."
                className="w-full bg-bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-text-primary text-sm placeholder:text-text-faint focus:border-brand outline-none transition-colors"
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
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIAS.map(cat => {
                  const prodsCat = ativos.filter(p => p.categoria === cat.nome)
                  if (prodsCat.length === 0) return null
                  const alertasCat = prodsCat.filter(p => p.estoque_atual < p.estoque_minimo).length
                  const ativo = catFiltro === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => selecionarCategoria(cat.id)}
                      className="flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-bold border transition-all"
                      style={{
                        backgroundColor: ativo ? cat.cor : 'transparent',
                        borderColor: ativo ? cat.cor : '#1e2130',
                        color: ativo ? '#fff' : cat.cor,
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.nome}</span>
                      {alertasCat > 0 && (
                        <span
                          className="text-[9px] font-extrabold px-1 rounded-full"
                          style={{
                            backgroundColor: ativo ? 'rgba(255,255,255,0.3)' : `${cat.cor}33`,
                            color: ativo ? '#fff' : cat.cor,
                          }}
                        >
                          {alertasCat}⚠
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Subcategory chips */}
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
                      className="flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all"
                      style={{
                        backgroundColor: ativo ? `${catConfig.cor}33` : 'transparent',
                        borderColor: ativo ? catConfig.cor : '#1e2130',
                        color: ativo ? catConfig.cor : '#888',
                      }}
                    >
                      <span>{sub.nome}</span>
                      <span className="text-[9px] opacity-60">{prodsSub.length}</span>
                      {alertasSub > 0 && <span className="text-[9px]" style={{ color: catConfig.cor }}>⚠</span>}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Context label when browsing */}
            {!busca && (catConfig || subFiltro) && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setCatFiltro(null); setSubFiltro(null) }}
                  className="text-text-faint text-[10px] hover:text-text-muted"
                >
                  ✕ Limpar filtro
                </button>
                <span className="text-text-faint text-[10px]">·</span>
                <span className="text-text-muted text-[10px]">
                  {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? 's' : ''}
                  {catConfig ? ` em ${catConfig.nome}` : ''}
                  {subFiltro && catConfig ? ` › ${catConfig.subcategorias.find(s => s.id === subFiltro)?.nome}` : ''}
                </span>
              </div>
            )}

            {/* Search result label */}
            {busca && (
              <p className="text-text-muted text-[11px]">
                {produtosFiltrados.length} resultado{produtosFiltrados.length !== 1 ? 's' : ''} para &quot;{busca}&quot;
              </p>
            )}

            {/* Products grouped */}
            {grupos.length === 0 ? (
              <div className="bg-bg-card rounded-xl border border-border p-8 flex flex-col items-center gap-2">
                <span className="text-3xl">🔍</span>
                <p className="text-text-muted text-sm">
                  {busca ? `Nenhum produto com "${busca}"` : 'Nenhum produto nesta categoria'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {grupos.map(grupo => (
                  <div key={grupo.titulo} className="flex flex-col gap-2">
                    {/* Group header */}
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-border" />
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ color: grupo.cor, backgroundColor: `${grupo.cor}15` }}
                      >
                        {grupo.titulo}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    {/* Product cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {grupo.produtos.map(p => (
                        <ProdutoEstoqueCard
                          key={p.id}
                          produto={p}
                          onEntrada={() => setAba('entrada')}
                          onBaixa={() => setAba('baixa')}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Insights toggle */}
            <button
              onClick={() => setMostrarInsights(v => !v)}
              className="w-full text-center text-text-faint text-xs py-2 hover:text-text-muted transition-colors"
            >
              {mostrarInsights ? '▲ Ocultar insights' : '📊 Ver gráfico de valor por categoria'}
            </button>

            {mostrarInsights && donutSegmentos.length > 0 && (
              <Card>
                <SectionTitle icon="📊">Valor por Categoria</SectionTitle>
                <DonutChart segmentos={donutSegmentos} />
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

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg-card border-t border-border flex z-50">
        {ABAS.map(a => (
          <button
            key={a.id}
            onClick={() => { setAba(a.id); if (a.id === 'estoque') { setCatFiltro(null); setSubFiltro(null); setBusca('') } }}
            className={[
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-bold transition-colors relative',
              aba === a.id ? 'text-brand' : 'text-text-faint hover:text-text-muted',
            ].join(' ')}
          >
            <span className="text-lg leading-none">{a.icon}</span>
            <span>{a.label}</span>
            {a.id === 'estoque' && totalAlertas > 0 && (
              <span className="absolute top-1.5 right-[18%] w-3.5 h-3.5 bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                {totalAlertas > 9 ? '9+' : totalAlertas}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
