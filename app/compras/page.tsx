'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { ListaCompra, ItemListaCompra, Produto } from '@/types'
import {
  getListasCompra,
  createListaCompra,
  addItemLista,
  removeItemLista,
  concluirLista,
  descartarLista,
} from '@/lib/services/compras'
import { getProdutos } from '@/lib/services/estoque'

// Duck-type guard for Firestore Timestamp (avoids import issues at build time)
const isTimestamp = (v: unknown): v is { toDate(): Date } =>
  typeof v === 'object' && v !== null && typeof (v as { toDate?: unknown }).toDate === 'function'

// Safely convert criada_em (may be Firestore Timestamp at runtime)
function formatDate(criada_em: unknown): string {
  if (!criada_em) return '—'
  if (isTimestamp(criada_em)) return criada_em.toDate().toLocaleDateString('pt-BR')
  if (typeof criada_em === 'string') return new Date(criada_em).toLocaleDateString('pt-BR')
  return '—'
}

const STATUS_LABELS: Record<ListaCompra['status'], string> = {
  ativa:       '🟢 Ativa',
  concluida:   '✅ Concluída',
  descartada:  '🗑️ Descartada',
}

export default function ComprasPage() {
  const [listas,     setListas]     = useState<ListaCompra[]>([])
  const [produtos,   setProdutos]   = useState<Produto[]>([])
  const [loading,    setLoading]    = useState(true)
  const [expandida,  setExpandida]  = useState<string | null>(null)
  const [addForm,    setAddForm]    = useState<Record<string, { busca: string; produtoId: string; qty: number; unidade: string }>>({})

  const carregarListas = useCallback(async () => {
    const [ls, prods] = await Promise.all([getListasCompra(), getProdutos()])
    setListas(ls)
    setProdutos(prods.filter(p => p.ativo))
  }, [])

  useEffect(() => {
    carregarListas().finally(() => setLoading(false))
  }, [carregarListas])

  async function handleNovaLista() {
    const id = await createListaCompra()
    setExpandida(id)
    await carregarListas()
  }

  async function handleConcluir(id: string) {
    await concluirLista(id)
    await carregarListas()
  }

  async function handleDescartar(id: string) {
    if (!confirm('Descartar esta lista?')) return
    await descartarLista(id)
    await carregarListas()
  }

  async function handleAddItem(listaId: string) {
    const f = addForm[listaId]
    if (!f?.produtoId) return
    const produto = produtos.find(p => p.id === f.produtoId)
    if (!produto) return
    const item: ItemListaCompra = {
      produto_id:           f.produtoId,
      quantidade_sugerida:  f.qty,
      unidade:              f.unidade || produto.unidade_padrao || 'un',
    }
    await addItemLista(listaId, item)
    setAddForm(prev => ({ ...prev, [listaId]: { busca: '', produtoId: '', qty: 1, unidade: '' } }))
    await carregarListas()
  }

  async function handleRemoveItem(listaId: string, produtoId: string) {
    await removeItemLista(listaId, produtoId)
    await carregarListas()
  }

  const ativas   = useMemo(() => listas.filter(l => l.status === 'ativa'),    [listas])
  const recentes = useMemo(() => listas.filter(l => l.status !== 'ativa').slice(0, 5), [listas])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2].map(i => <div key={i} className="h-28 bg-bg-card rounded-2xl animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-text-primary font-extrabold text-xl">Listas de Compra</h1>
        <button
          onClick={handleNovaLista}
          className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl transition-colors"
        >
          + Nova Lista
        </button>
      </div>

      {ativas.length === 0 ? (
        <p className="text-text-muted text-sm py-6 text-center">Nenhuma lista ativa. Crie uma nova!</p>
      ) : (
        ativas.map(lista => {
          const aberta = expandida === lista.id
          const f = addForm[lista.id] ?? { busca: '', produtoId: '', qty: 1, unidade: '' }
          const produtosFiltrados = f.busca
            ? produtos.filter(p => p.nome.toLowerCase().includes(f.busca.toLowerCase())).slice(0, 8)
            : []

          return (
            <div key={lista.id} className="bg-bg-card border border-border rounded-2xl overflow-hidden">
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-bg-hover transition-colors"
                onClick={() => setExpandida(aberta ? null : lista.id)}
              >
                <span className="text-xs text-text-muted flex-1">
                  Criada em {formatDate(lista.criada_em)}
                  {lista.observacao && ` — ${lista.observacao}`}
                </span>
                <span className="text-xs font-semibold text-success">{STATUS_LABELS.ativa}</span>
                <span className="text-xs text-text-faint">{lista.itens.length} item(ns)</span>
                <span className="text-text-faint text-sm">{aberta ? '▲' : '▼'}</span>
              </div>

              {aberta && (
                <div className="border-t border-border px-4 pb-4 flex flex-col gap-3">
                  {lista.itens.length > 0 && (
                    <div className="overflow-x-auto mt-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-text-faint text-xs text-left">
                            <th className="pb-2 pr-4">Produto</th>
                            <th className="pb-2 pr-4">Qtd</th>
                            <th className="pb-2 pr-4">Unidade</th>
                            <th className="pb-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {lista.itens.map((item, idx) => {
                            const prod = produtos.find(p => p.id === item.produto_id)
                            return (
                              <tr key={idx} className="border-t border-border hover:bg-bg-hover">
                                <td className="py-2 pr-4 text-text-primary">{prod?.nome ?? item.produto_id}</td>
                                <td className="py-2 pr-4 text-text-secondary">{item.quantidade_sugerida}</td>
                                <td className="py-2 pr-4 text-text-secondary">{item.unidade}</td>
                                <td className="py-2">
                                  <button
                                    onClick={() => handleRemoveItem(lista.id, item.produto_id)}
                                    className="text-danger hover:text-danger/80 text-xs"
                                  >
                                    ✕
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap items-end pt-2 relative">
                    <div className="flex flex-col gap-1 flex-1 min-w-[160px] relative">
                      <label className="text-xs text-text-secondary">Produto</label>
                      <input
                        value={f.busca}
                        onChange={e => setAddForm(prev => ({
                          ...prev,
                          [lista.id]: { ...f, busca: e.target.value, produtoId: '' },
                        }))}
                        placeholder="Buscar produto…"
                        className="bg-bg-page border border-border focus:border-border-focus rounded-lg px-3 py-1.5 text-sm text-text-primary outline-none"
                      />
                      {produtosFiltrados.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-bg-card border border-border rounded-lg shadow-elevated z-10 mt-0.5 max-h-44 overflow-y-auto">
                          {produtosFiltrados.map(p => (
                            <button
                              key={p.id}
                              onClick={() => setAddForm(prev => ({
                                ...prev,
                                [lista.id]: {
                                  ...f,
                                  busca:     p.nome,
                                  produtoId: p.id,
                                  unidade:   p.unidade_padrao || 'un',
                                  qty: Math.max(0, (p.estoque_minimo ?? 0) - (p.estoque_atual ?? 0)) || 1,
                                },
                              }))}
                              className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-bg-hover transition-colors"
                            >
                              {p.nome}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 w-20">
                      <label className="text-xs text-text-secondary">Qtd</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={f.qty}
                        onChange={e => setAddForm(prev => ({ ...prev, [lista.id]: { ...f, qty: parseFloat(e.target.value) || 0 } }))}
                        className="bg-bg-page border border-border focus:border-border-focus rounded-lg px-3 py-1.5 text-sm text-text-primary outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1 w-20">
                      <label className="text-xs text-text-secondary">Unidade</label>
                      <input
                        value={f.unidade}
                        onChange={e => setAddForm(prev => ({ ...prev, [lista.id]: { ...f, unidade: e.target.value } }))}
                        placeholder="kg"
                        className="bg-bg-page border border-border focus:border-border-focus rounded-lg px-3 py-1.5 text-sm text-text-primary outline-none"
                      />
                    </div>
                    <button
                      onClick={() => handleAddItem(lista.id)}
                      disabled={!f.produtoId}
                      className="py-1.5 px-4 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-40"
                    >
                      + Adicionar
                    </button>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleConcluir(lista.id)}
                      className="px-4 py-1.5 bg-success/10 text-success border border-success/30 text-sm font-semibold rounded-lg hover:bg-success/20 transition-colors"
                    >
                      ✓ Fechar lista
                    </button>
                    <button
                      onClick={() => handleDescartar(lista.id)}
                      className="px-4 py-1.5 bg-danger/10 text-danger border border-danger/30 text-sm font-semibold rounded-lg hover:bg-danger/20 transition-colors"
                    >
                      🗑 Descartar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}

      {recentes.length > 0 && (
        <details className="mt-2">
          <summary className="text-text-muted text-sm cursor-pointer select-none hover:text-text-secondary transition-colors">
            Listas recentes ({recentes.length})
          </summary>
          <div className="flex flex-col gap-2 mt-3">
            {recentes.map(lista => (
              <div key={lista.id} className="bg-bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                <span className="text-xs text-text-muted flex-1">Criada em {formatDate(lista.criada_em)}</span>
                <span className="text-xs text-text-faint">{lista.itens.length} item(ns)</span>
                <span className="text-xs font-semibold text-text-faint">{STATUS_LABELS[lista.status]}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
