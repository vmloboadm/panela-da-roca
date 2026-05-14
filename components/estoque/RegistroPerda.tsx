'use client'

import { useState } from 'react'
import { Produto, MovimentacaoEstoque } from '@/types'
import { salvarPerda } from '@/lib/services/estoque'
import { Button } from '@/components/ui'

const MOTIVOS = ['Vencimento', 'Queda / Acidente', 'Sobra do buffet', 'Deterioração', 'Outro']

interface RegistroPerdaProps {
  produtos: Produto[]
  onSalvo: () => void
}

export function RegistroPerda({ produtos, onSalvo }: RegistroPerdaProps) {
  const [produto_id, setProdutoId] = useState('')
  const [quantidade, setQuantidade] = useState('')
  const [motivo, setMotivo] = useState('')
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
        tipo: 'perda',
        quantidade: Number(quantidade),
        unidade: produto.unidade_padrao,
        origem: 'perda_manual',
        confianca: 'confirmado',
        ia_pre_preenchido: false,
        data: new Date().toISOString().split('T')[0],
        observacao: motivo || undefined,
        confirmado_em: new Date().toISOString(),
      }
      await salvarPerda(mov, produto)
      setProdutoId('')
      setQuantidade('')
      setMotivo('')
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
        <label className="text-text-muted text-xs font-semibold">Produto perdido</label>
        <select
          value={produto_id}
          onChange={e => { setProdutoId(e.target.value); setSucesso(false) }}
          className="bg-bg-hover border border-border rounded-lg px-3 py-2 text-text-primary text-sm"
        >
          <option value="">— Selecione o produto —</option>
          {produtos.filter(p => p.ativo).map(p => (
            <option key={p.id} value={p.id}>{p.nome} ({p.estoque_atual.toFixed(1)}{p.unidade_padrao})</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-text-muted text-xs font-semibold">
          Quantidade perdida {produto ? `(${produto.unidade_padrao})` : ''}
        </label>
        <input
          type="number" step="0.01" min="0"
          value={quantidade}
          onChange={e => setQuantidade(e.target.value)}
          placeholder="0"
          className="bg-bg-hover border border-border rounded-lg px-3 py-2 text-text-primary text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-text-muted text-xs font-semibold">Motivo</label>
        <div className="flex flex-wrap gap-1.5">
          {MOTIVOS.map(m => (
            <button
              key={m}
              onClick={() => setMotivo(motivo === m ? '' : m)}
              className={[
                'text-xs px-3 py-1.5 rounded-full border transition-colors font-medium',
                motivo === m
                  ? 'border-danger/60 bg-danger/10 text-danger'
                  : 'border-border text-text-muted hover:border-brand',
              ].join(' ')}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {sucesso && (
        <p className="text-success text-xs bg-success/10 rounded-lg px-3 py-2">✓ Perda registrada</p>
      )}
      {erro && (
        <p className="text-danger text-xs bg-danger/10 rounded-lg px-3 py-2">{erro}</p>
      )}

      <Button
        variant="danger"
        onClick={salvar}
        disabled={!produto_id || !quantidade || salvando}
        className="w-full"
      >
        {salvando ? 'Salvando...' : '🗑️ Registrar Perda'}
      </Button>
    </div>
  )
}
