'use client'

import { useState } from 'react'
import { Produto, Fornecedor, ResultadoVarredura, Cotacao, ConfiancaCotacao } from '@/types'
import { saveCotacoes } from '@/lib/services/cotacoes'
import { fmtBRL } from '@/utils/calculos'
import { Button, Badge } from '@/components/ui'

interface VarreduraWebProps {
  produtos: Produto[]
  fornecedores: Fornecedor[]
  onCotacoesSalvas: () => void
}

const CONFIANCA_COR: Record<ConfiancaCotacao, string> = {
  alta: '#15803D',
  media: '#D97706',
  baixa: '#DC2626',
  estimada: '#6b7280',
}

export function VarreduraWeb({ produtos, fornecedores, onCotacoesSalvas }: VarreduraWebProps) {
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [varrendo, setVarrendo] = useState(false)
  const [resultados, setResultados] = useState<ResultadoVarredura[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [salvando, setSalvando] = useState(false)

  const produtosAtivos = produtos.filter(p => p.ativo)

  function toggleProduto(id: string) {
    setSelecionados(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selecionarTodos() {
    setSelecionados(new Set(produtosAtivos.map(p => p.id)))
  }

  function limparSelecao() {
    setSelecionados(new Set())
  }

  async function varrer() {
    if (selecionados.size === 0) return
    setErro(null)
    setResultados([])
    setVarrendo(true)

    const produtosSelecionados = produtosAtivos
      .filter(p => selecionados.has(p.id))
      .map(p => ({ id: p.id, nome: p.nome, unidade: p.unidade_padrao, sinonimos: p.sinonimos }))

    try {
      const res = await fetch('/api/gemini/varredura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ produtos: produtosSelecionados, cidade: 'Campos dos Goytacazes, RJ' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro na varredura')
      setResultados(data.resultados ?? [])
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setVarrendo(false)
    }
  }

  async function salvarTudo() {
    setSalvando(true)
    const hoje = new Date().toISOString().split('T')[0]
    const cotacoes: Omit<Cotacao, 'id'>[] = []

    for (const res of resultados) {
      for (const c of res.cotacoes) {
        const fornecedorId = fornecedores.find(
          f => f.nome.toLowerCase().includes(c.fornecedor_nome.toLowerCase())
        )?.id ?? ''

        cotacoes.push({
          produto_id: res.produto_id,
          fornecedor_id: fornecedorId,
          preco: c.preco,
          unidade: c.unidade,
          fonte: 'varredura_ia',
          confianca: c.confianca as ConfiancaCotacao,
          data: hoje,
          observacao: c.observacao ?? undefined,
          url_fonte: c.url_fonte ?? undefined,
        })
      }
    }

    try {
      await saveCotacoes(cotacoes)
      onCotacoesSalvas()
      setResultados([])
    } finally {
      setSalvando(false)
    }
  }

  const totalCotacoes = resultados.reduce((acc, r) => acc + r.cotacoes.length, 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Seleção de produtos */}
      {resultados.length === 0 && (
        <>
          <div className="flex gap-2 items-center">
            <p className="text-text-muted text-sm flex-1">
              {selecionados.size} de {produtosAtivos.length} produtos selecionados
            </p>
            <button onClick={selecionarTodos} className="text-brand text-xs hover:underline">Todos</button>
            <button onClick={limparSelecao} className="text-text-muted text-xs hover:underline">Nenhum</button>
          </div>

          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
            {produtosAtivos.map(p => (
              <label
                key={p.id}
                className={[
                  'flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer transition-colors text-sm',
                  selecionados.has(p.id) ? 'border-brand bg-brand/10 text-text-primary' : 'border-border text-text-muted hover:border-border',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  checked={selecionados.has(p.id)}
                  onChange={() => toggleProduto(p.id)}
                  className="w-3.5 h-3.5 accent-brand"
                />
                <span className="truncate">{p.nome}</span>
              </label>
            ))}
          </div>

          {erro && (
            <p className="text-danger text-xs bg-danger/10 rounded-lg px-3 py-2">{erro}</p>
          )}

          <Button
            variant="primary"
            onClick={varrer}
            disabled={selecionados.size === 0 || varrendo}
            className="w-full"
          >
            {varrendo ? (
              <span className="flex items-center gap-2">
                <span className="animate-pulse">🌐</span>
                Varrendo a web... pode levar 30s
              </span>
            ) : (
              `🌐 Varrer ${selecionados.size > 0 ? `${selecionados.size} produto${selecionados.size > 1 ? 's' : ''}` : 'produtos'}`
            )}
          </Button>
        </>
      )}

      {/* Resultados */}
      {resultados.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-text-primary font-bold text-sm">
              {totalCotacoes} cotações encontradas
            </p>
            <button onClick={() => setResultados([])} className="text-text-muted text-xs hover:underline">
              Nova varredura
            </button>
          </div>

          {resultados.map(res => (
            <div key={res.produto_id} className="bg-bg-page border border-border rounded-xl p-3 flex flex-col gap-2">
              <p className="text-text-primary font-bold text-sm">{res.produto_nome}</p>
              {res.cotacoes.length === 0 ? (
                <p className="text-text-muted text-xs">Nenhum preço encontrado na web</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {res.cotacoes.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                        style={{ backgroundColor: `${CONFIANCA_COR[c.confianca as ConfiancaCotacao]}20`, color: CONFIANCA_COR[c.confianca as ConfiancaCotacao] }}
                      >
                        {c.confianca}
                      </span>
                      <span className="text-text-primary text-sm font-bold">{fmtBRL(c.preco)}/{c.unidade}</span>
                      <span className="text-text-muted text-xs">{c.fornecedor_nome}</span>
                      {c.url_fonte && (
                        <a href={c.url_fonte} target="_blank" rel="noopener noreferrer" className="text-brand text-xs hover:underline">ver fonte</a>
                      )}
                      {c.observacao && <span className="text-text-faint text-xs italic">{c.observacao}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Button
            variant="primary"
            onClick={salvarTudo}
            disabled={salvando || totalCotacoes === 0}
            className="w-full"
          >
            {salvando ? 'Salvando...' : `Salvar ${totalCotacoes} cotações`}
          </Button>
        </div>
      )}
    </div>
  )
}
