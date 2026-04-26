'use client'

import { useState } from 'react'
import { Produto, Fornecedor, Cotacao } from '@/types'
import { saveCotacao } from '@/lib/services/cotacoes'
import { Button, Input, Select } from '@/components/ui'

interface CotacaoManualProps {
  produtos: Produto[]
  fornecedores: Fornecedor[]
  onSalvo: () => void
}

export function CotacaoManual({ produtos, fornecedores, onSalvo }: CotacaoManualProps) {
  const [form, setForm] = useState({
    produto_id: '',
    fornecedor_id: '',
    preco: '',
    unidade: '',
    observacao: '',
  })
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  function set(campo: string, valor: string) {
    setForm(prev => {
      const next = { ...prev, [campo]: valor }
      // Auto-preenche unidade ao selecionar produto
      if (campo === 'produto_id') {
        const prod = produtos.find(p => p.id === valor)
        if (prod) next.unidade = prod.unidade_padrao
      }
      return next
    })
    setSucesso(false)
  }

  async function salvar() {
    if (!form.produto_id || !form.preco) return
    setSalvando(true)
    const cotacao: Omit<Cotacao, 'id'> = {
      produto_id: form.produto_id,
      fornecedor_id: form.fornecedor_id,
      preco: Number(form.preco),
      unidade: form.unidade,
      fonte: 'manual',
      confianca: 'alta',
      data: new Date().toISOString().split('T')[0],
      observacao: form.observacao || undefined,
    }
    try {
      await saveCotacao(cotacao)
      setForm({ produto_id: '', fornecedor_id: '', preco: '', unidade: '', observacao: '' })
      setSucesso(true)
      onSalvo()
    } finally {
      setSalvando(false)
    }
  }

  const produtosAtivos = produtos.filter(p => p.ativo)
  const fornecedoresAtivos = fornecedores.filter(f => f.ativo)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-text-muted text-xs font-semibold">Produto</label>
        <Select
          value={form.produto_id}
          onChange={e => set('produto_id', e.target.value)}
        >
          <option value="">— Selecione o produto —</option>
          {produtosAtivos.map(p => (
            <option key={p.id} value={p.id}>{p.nome}</option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-text-muted text-xs font-semibold">Fornecedor</label>
        <Select
          value={form.fornecedor_id}
          onChange={e => set('fornecedor_id', e.target.value)}
        >
          <option value="">— Selecione o fornecedor —</option>
          {fornecedoresAtivos.map(f => (
            <option key={f.id} value={f.id}>{f.nome}</option>
          ))}
        </Select>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-text-muted text-xs font-semibold">Preço (R$)</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0,00"
            value={form.preco}
            onChange={e => set('preco', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1 w-20">
          <label className="text-text-muted text-xs font-semibold">Unidade</label>
          <Input
            placeholder="kg"
            value={form.unidade}
            onChange={e => set('unidade', e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-text-muted text-xs font-semibold">Observação (opcional)</label>
        <Input
          placeholder="Ex: promoção de fim de semana"
          value={form.observacao}
          onChange={e => set('observacao', e.target.value)}
        />
      </div>

      {sucesso && (
        <p className="text-green-400 text-xs bg-green-400/10 rounded-lg px-3 py-2">
          ✓ Cotação salva com sucesso
        </p>
      )}

      <Button
        variant="primary"
        onClick={salvar}
        disabled={!form.produto_id || !form.preco || salvando}
        className="w-full"
      >
        {salvando ? 'Salvando...' : 'Salvar Cotação'}
      </Button>
    </div>
  )
}
