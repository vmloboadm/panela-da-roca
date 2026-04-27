'use client'

import { useState } from 'react'
import { Produto, MovimentacaoEstoque } from '@/types'
import { salvarBaixa } from '@/lib/services/estoque'
import { Button } from '@/components/ui'

interface BaixaEstoqueProps {
  produtos: Produto[]
  onSalvo: () => void
}

export function BaixaEstoque({ produtos, onSalvo }: BaixaEstoqueProps) {
  const [produto_id, setProdutoId] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [observacao, setObservacao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const produto = produtos.find(p => p.id === produto_id)

  async function salvar() {
    if (!produto_id || !quantidade || !produto) return
    setSalvando(true)
    setErro(null)
    try {
      const mov: Omit<MovimentacaoEstoque, 'id'> = {
        produto_id,
        tipo: 'saida',
        quantidade: Number(quantidade),
        unidade: produto.unidade_padrao,
        origem: 'manual',
        confianca: 'confirmado',
        ia_pre_preenchido: false,
        data: new Date().toISOString().split('T')[0],
        observacao: observacao || undefined,
        confirmado_em: new Date().toISOString(),
      }
      await salvarBaixa(mov, produto)
      setProdutoId('')
      setQuantidade('')
      setObservacao('')
      setSucesso(true)
      onSalvo()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-text-muted text-xs font-semibold">Produto</label>
        <select
          value={produto_id}
          onChange={e => { setProdutoId(e.target.value); setSucesso(false) }}
          className="bg-bg-base border border-border rounded-lg px-3 py-2 text-text-primary text-sm"
        >
          <option value="">— Selecione o produto —</option>
          {produtos.filter(p => p.ativo).map(p => (
            <option key={p.id} value={p.id}>
              {p.nome} — {p.estoque_atual.toFixed(1)}{p.unidade_padrao} disponíveis
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-text-muted text-xs font-semibold">
            Quantidade a baixar {produto ? `(${produto.unidade_padrao})` : ''}
          </label>
          <input
            type="number" step="0.01" min="0"
            max={produto?.estoque_atual}
            value={quantidade}
            onChange={e => setQuantidade(e.target.value)}
            placeholder="0"
            className="bg-bg-base border border-border rounded-lg px-3 py-2 text-text-primary text-sm"
          />
        </div>
      </div>

      {produto && quantidade && Number(quantidade) > produto.estoque_atual && (
        <p className="text-amber-400 text-xs bg-amber-400/10 rounded-lg px-3 py-2">
          ⚠️ Quantidade maior que o estoque atual ({produto.estoque_atual.toFixed(1)}{produto.unidade_padrao})
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-text-muted text-xs font-semibold">Observação (opcional)</label>
        <input
          type="text"
          value={observacao}
          onChange={e => setObservacao(e.target.value)}
          placeholder="Ex: usado no buffet de hoje"
          className="bg-bg-base border border-border rounded-lg px-3 py-2 text-text-primary text-sm"
        />
      </div>

      {sucesso && (
        <p className="text-green-400 text-xs bg-green-400/10 rounded-lg px-3 py-2">✓ Baixa registrada</p>
      )}
      {erro && (
        <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{erro}</p>
      )}

      <Button
        variant="primary"
        onClick={salvar}
        disabled={!produto_id || !quantidade || salvando}
        className="w-full"
      >
        {salvando ? 'Salvando...' : 'Registrar Baixa'}
      </Button>
    </div>
  )
}
