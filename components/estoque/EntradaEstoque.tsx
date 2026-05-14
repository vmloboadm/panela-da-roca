'use client'

import { useState } from 'react'
import { Produto, Fornecedor, LeituraIAResultado, MovimentacaoEstoque } from '@/types'
import { salvarEntrada } from '@/lib/services/estoque'
import { LeitorUniversal } from '@/components/precos/LeitorUniversal'
import { ConfirmarEntrada } from '@/components/estoque/ConfirmarEntrada'
import { Button } from '@/components/ui'

type Modo = 'escolha' | 'foto' | 'manual'

interface EntradaEstoqueProps {
  produtos: Produto[]
  fornecedores: Fornecedor[]
  onSalvo: () => void
}

export function EntradaEstoque({ produtos, fornecedores, onSalvo }: EntradaEstoqueProps) {
  const [modo, setModo] = useState<Modo>('escolha')
  const [resultadoLeitura, setResultadoLeitura] = useState<LeituraIAResultado | null>(null)
  const [arquivoAtual, setArquivoAtual] = useState<File | null>(null)

  const [form, setForm] = useState({
    produto_id: '',
    quantidade: '',
    unidade: '',
    preco_unitario: '',
    fornecedor_id: '',
  })
  const [salvandoManual, setSalvandoManual] = useState(false)
  const [sucessoManual, setSucessoManual] = useState(false)
  const [erroManual, setErroManual] = useState<string | null>(null)

  function setFormField(campo: string, valor: string) {
    setForm(prev => {
      const next = { ...prev, [campo]: valor }
      if (campo === 'produto_id') {
        const prod = produtos.find(p => p.id === valor)
        if (prod) next.unidade = prod.unidade_padrao
      }
      return next
    })
    setSucessoManual(false)
  }

  async function salvarManual() {
    if (!form.produto_id || !form.quantidade) return
    const produto = produtos.find(p => p.id === form.produto_id)
    if (!produto) return
    setSalvandoManual(true)
    setErroManual(null)
    try {
      const mov: Omit<MovimentacaoEstoque, 'id'> = {
        produto_id: form.produto_id,
        tipo: 'entrada',
        quantidade: Number(form.quantidade),
        unidade: form.unidade,
        custo_unitario: form.preco_unitario ? Number(form.preco_unitario) : undefined,
        fornecedor_id: form.fornecedor_id,
        origem: 'manual',
        confianca: 'confirmado',
        ia_pre_preenchido: false,
        data: new Date().toISOString().split('T')[0],
        confirmado_em: new Date().toISOString(),
      }
      await salvarEntrada(mov, produto)
      setForm({ produto_id: '', quantidade: '', unidade: '', preco_unitario: '', fornecedor_id: '' })
      setSucessoManual(true)
      onSalvo()
    } catch (e) {
      setErroManual(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvandoManual(false)
    }
  }

  function resetar() {
    setModo('escolha')
    setResultadoLeitura(null)
    setArquivoAtual(null)
  }

  if (modo === 'foto' && resultadoLeitura) {
    return (
      <ConfirmarEntrada
        resultado={resultadoLeitura}
        arquivo={arquivoAtual}
        produtos={produtos}
        fornecedores={fornecedores}
        onSalvo={() => { resetar(); onSalvo() }}
        onDescartar={resetar}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {modo === 'escolha' && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setModo('foto')}
            className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-brand transition-colors"
          >
            <span className="text-3xl">📷</span>
            <p className="text-text-primary text-sm font-bold">Via Foto</p>
            <p className="text-text-muted text-xs text-center">Foto da NF, cupom ou print do pedido</p>
          </button>
          <button
            onClick={() => setModo('manual')}
            className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-brand transition-colors"
          >
            <span className="text-3xl">✏️</span>
            <p className="text-text-primary text-sm font-bold">Manual</p>
            <p className="text-text-muted text-xs text-center">Digitar produto, quantidade e preço</p>
          </button>
        </div>
      )}

      {modo === 'foto' && !resultadoLeitura && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <button onClick={resetar} className="text-text-muted text-xs hover:text-text-primary">← Voltar</button>
            <p className="text-text-primary text-sm font-bold">Entrada por Foto</p>
          </div>
          <LeitorUniversal
            onResultado={resultado => setResultadoLeitura(resultado)}
            onArquivo={file => setArquivoAtual(file)}
            contexto="Esta é uma nota fiscal, cupom fiscal ou pedido de compra de restaurante. Extraia todos os itens com quantidade e preço unitário."
            labels={{
              title: 'Foto da Nota Fiscal ou Cupom',
              subtitle: 'Tire foto da NF, cupom fiscal ou print do pedido de WhatsApp',
            }}
          />
        </div>
      )}

      {modo === 'manual' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <button onClick={resetar} className="text-text-muted text-xs hover:text-text-primary">← Voltar</button>
            <p className="text-text-primary text-sm font-bold">Entrada Manual</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-text-muted text-xs font-semibold">Produto</label>
            <select
              value={form.produto_id}
              onChange={e => setFormField('produto_id', e.target.value)}
              className="bg-bg-hover border border-border rounded-lg px-3 py-2 text-text-primary text-sm"
            >
              <option value="">— Selecione o produto —</option>
              {produtos.filter(p => p.ativo).map(p => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-text-muted text-xs font-semibold">Quantidade</label>
              <input
                type="number" step="0.01" min="0"
                value={form.quantidade}
                onChange={e => setFormField('quantidade', e.target.value)}
                placeholder="0"
                className="bg-bg-hover border border-border rounded-lg px-3 py-2 text-text-primary text-sm"
              />
            </div>
            <div className="flex flex-col gap-1 w-20">
              <label className="text-text-muted text-xs font-semibold">Unid.</label>
              <input
                type="text"
                value={form.unidade}
                onChange={e => setFormField('unidade', e.target.value)}
                placeholder="kg"
                className="bg-bg-hover border border-border rounded-lg px-3 py-2 text-text-primary text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-text-muted text-xs font-semibold">Preço unit. (R$) — opcional</label>
            <input
              type="number" step="0.01" min="0"
              value={form.preco_unitario}
              onChange={e => setFormField('preco_unitario', e.target.value)}
              placeholder="0,00"
              className="bg-bg-hover border border-border rounded-lg px-3 py-2 text-text-primary text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-text-muted text-xs font-semibold">Fornecedor — opcional</label>
            <select
              value={form.fornecedor_id}
              onChange={e => setFormField('fornecedor_id', e.target.value)}
              className="bg-bg-hover border border-border rounded-lg px-3 py-2 text-text-primary text-sm"
            >
              <option value="">— Sem fornecedor —</option>
              {fornecedores.filter(f => f.ativo).map(f => (
                <option key={f.id} value={f.id}>{f.nome}</option>
              ))}
            </select>
          </div>

          {sucessoManual && (
            <p className="text-success text-xs bg-success/10 rounded-lg px-3 py-2">
              ✓ Entrada registrada com sucesso
            </p>
          )}
          {erroManual && (
            <p className="text-danger text-xs bg-danger/10 rounded-lg px-3 py-2">{erroManual}</p>
          )}

          <Button
            variant="primary"
            onClick={salvarManual}
            disabled={!form.produto_id || !form.quantidade || salvandoManual}
            className="w-full"
          >
            {salvandoManual ? 'Salvando...' : 'Registrar Entrada'}
          </Button>
        </div>
      )}
    </div>
  )
}
