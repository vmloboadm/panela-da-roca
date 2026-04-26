'use client'

import { useState } from 'react'
import { LeituraIAResultado, ItemExtraido, Fornecedor, Cotacao } from '@/types'
import { fmtBRL } from '@/utils/calculos'
import { Button, Badge } from '@/components/ui'

interface ResultadoLeituraProps {
  resultado: LeituraIAResultado
  fornecedores: Fornecedor[]
  onSalvar: (cotacoes: Omit<Cotacao, 'id'>[]) => Promise<void>
  onDescartar: () => void
}

const CONFIANCA_COR: Record<string, string> = {
  alta: '#22c55e',
  media: '#f59e0b',
  baixa: '#ef4444',
  estimada: '#6b7280',
}

export function ResultadoLeitura({ resultado, fornecedores, onSalvar, onDescartar }: ResultadoLeituraProps) {
  const [itens, setItens] = useState<ItemExtraido[]>(resultado.itens)
  const [fornecedorGlobal, setFornecedorGlobal] = useState(resultado.fornecedor_principal ?? '')
  const [salvando, setSalvando] = useState(false)
  const [selecionados, setSelecionados] = useState<Set<number>>(
    new Set(resultado.itens.map((_, i) => i))
  )

  function toggleItem(index: number) {
    setSelecionados(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function atualizarItem(index: number, campo: keyof ItemExtraido, valor: unknown) {
    setItens(prev => prev.map((item, i) => i === index ? { ...item, [campo]: valor } : item))
  }

  async function handleSalvar() {
    setSalvando(true)
    const hoje = new Date().toISOString().split('T')[0]
    const fornecedorId = fornecedores.find(
      f => f.nome.toLowerCase().includes(fornecedorGlobal.toLowerCase())
    )?.id ?? ''

    const cotacoes: Omit<Cotacao, 'id'>[] = itens
      .filter((_, i) => selecionados.has(i))
      .filter(item => item.preco_unitario !== null && !!item.produto_id)
      .map(item => ({
        produto_id: item.produto_id!,
        fornecedor_id: fornecedorId,
        preco: item.preco_unitario!,
        unidade: item.unidade,
        fonte: 'varredura_ia' as const,
        confianca: item.confianca,
        data: hoje,
        observacao: [item.observacao, `Extraído de: ${resultado.tipo_documento}`].filter(Boolean).join(' · ') || undefined,
      }))

    try {
      await onSalvar(cotacoes)
    } finally {
      setSalvando(false)
    }
  }

  const itensSelecionadosComPreco = itens.filter((item, i) => selecionados.has(i) && item.preco_unitario !== null && !!item.produto_id)

  if (resultado.itens.length === 0) {
    return (
      <div className="bg-bg-card rounded-xl p-4 flex flex-col gap-3">
        <p className="text-text-muted text-sm">
          🤔 Não foi possível extrair preços deste arquivo.
          {resultado.observacao_geral && ` ${resultado.observacao_geral}`}
        </p>
        <Button variant="ghost" onClick={onDescartar}>Tentar outro arquivo</Button>
      </div>
    )
  }

  return (
    <div className="bg-bg-card rounded-xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <p className="text-text-primary font-bold text-sm">
            {resultado.itens.length} {resultado.itens.length === 1 ? 'item encontrado' : 'itens encontrados'}
          </p>
          {resultado.data_documento && (
            <p className="text-text-muted text-xs">Data do documento: {resultado.data_documento}</p>
          )}
        </div>
        <Badge color="#6366f1">{resultado.tipo_documento.replace('_', ' ')}</Badge>
      </div>

      {/* Fornecedor global */}
      <div>
        <label className="text-text-muted text-xs block mb-1">Fornecedor (para todos os itens)</label>
        <select
          value={fornecedorGlobal}
          onChange={e => setFornecedorGlobal(e.target.value)}
          className="w-full bg-bg-base border border-border rounded-lg px-3 py-2 text-text-primary text-sm"
        >
          <option value="">— Sem fornecedor —</option>
          {fornecedores.map(f => (
            <option key={f.id} value={f.nome}>{f.nome}</option>
          ))}
        </select>
      </div>

      {/* Itens */}
      <div className="flex flex-col gap-2">
        {itens.map((item, i) => (
          <div
            key={i}
            className={[
              'border rounded-lg p-3 flex flex-col gap-2 transition-colors',
              selecionados.has(i) ? 'border-border-light bg-bg-base' : 'border-border opacity-50',
            ].join(' ')}
          >
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selecionados.has(i)}
                onChange={() => toggleItem(i)}
                className="w-4 h-4 accent-brand"
              />
              <span className="text-text-primary text-sm font-medium flex-1">{item.nome_normalizado}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ backgroundColor: `${CONFIANCA_COR[item.confianca]}20`, color: CONFIANCA_COR[item.confianca] }}
              >
                {item.confianca}
              </span>
            </div>

            {item.nome_original !== item.nome_normalizado && (
              <p className="text-text-faint text-xs ml-6">Original: "{item.nome_original}"</p>
            )}

            <div className="flex gap-2 ml-6 flex-wrap">
              <div className="flex flex-col gap-0.5">
                <label className="text-text-faint text-[10px]">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={item.preco_unitario ?? ''}
                  onChange={e => atualizarItem(i, 'preco_unitario', e.target.value ? Number(e.target.value) : null)}
                  className="w-24 bg-bg-card border border-border rounded px-2 py-1 text-text-primary text-sm"
                  placeholder="0,00"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-text-faint text-[10px]">Unidade</label>
                <input
                  type="text"
                  value={item.unidade}
                  onChange={e => atualizarItem(i, 'unidade', e.target.value)}
                  className="w-16 bg-bg-card border border-border rounded px-2 py-1 text-text-primary text-sm"
                />
              </div>
              {item.quantidade !== null && (
                <div className="flex flex-col gap-0.5">
                  <label className="text-text-faint text-[10px]">Qtd</label>
                  <input
                    type="number"
                    value={item.quantidade ?? ''}
                    onChange={e => atualizarItem(i, 'quantidade', e.target.value ? Number(e.target.value) : null)}
                    className="w-16 bg-bg-card border border-border rounded px-2 py-1 text-text-primary text-sm"
                  />
                </div>
              )}
            </div>

            {item.observacao && (
              <p className="text-text-muted text-xs ml-6 italic">{item.observacao}</p>
            )}
          </div>
        ))}
      </div>

      {itens.some(item => !item.produto_id) && (
        <p className="text-amber-400 text-xs bg-amber-400/10 rounded-lg px-3 py-2">
          ⚠️ Itens sem produto cadastrado no sistema não serão salvos. Cadastre o produto primeiro na aba Fornecedores.
        </p>
      )}

      {/* Footer */}
      <div className="flex gap-2 justify-between items-center flex-wrap">
        <p className="text-text-muted text-xs">
          {itensSelecionadosComPreco.length} {itensSelecionadosComPreco.length === 1 ? 'item' : 'itens'} para salvar
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onDescartar}>Descartar</Button>
          <Button
            variant="primary"
            onClick={handleSalvar}
            disabled={salvando || itensSelecionadosComPreco.length === 0}
          >
            {salvando ? 'Salvando...' : `Salvar ${itensSelecionadosComPreco.length} cot.`}
          </Button>
        </div>
      </div>
    </div>
  )
}
