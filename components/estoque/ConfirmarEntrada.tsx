'use client'

import { useState } from 'react'
import { LeituraIAResultado, Produto, Fornecedor, MovimentacaoEstoque } from '@/types'
import { salvarEntrada } from '@/lib/services/estoque'
import { uploadFotoMovimentacao } from '@/lib/services/storage'
import { addDocument, updateDocument } from '@/lib/firestore'
import { Button } from '@/components/ui'
import { fmtBRL } from '@/utils/calculos'

interface ItemEntrada {
  nome_original: string
  produto_id: string
  quantidade: number | string
  unidade: string
  preco_unitario: number | string
}

interface ConfirmarEntradaProps {
  resultado: LeituraIAResultado
  arquivo: File | null
  produtos: Produto[]
  fornecedores: Fornecedor[]
  onSalvo: () => void
  onDescartar: () => void
}

export function ConfirmarEntrada({
  resultado, arquivo, produtos, fornecedores, onSalvo, onDescartar
}: ConfirmarEntradaProps) {
  const [itens, setItens] = useState<ItemEntrada[]>(() =>
    resultado.itens.map(item => ({
      nome_original: item.nome_normalizado,
      produto_id: '',
      quantidade: item.quantidade ?? '',
      unidade: item.unidade,
      preco_unitario: item.preco_unitario ?? '',
    }))
  )
  const [fornecedorId, setFornecedorId] = useState(
    resultado.fornecedor_principal
      ? fornecedores.find(f => f.nome.toLowerCase().includes(resultado.fornecedor_principal!.toLowerCase()))?.id ?? ''
      : ''
  )
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function atualizarItem(index: number, campo: keyof ItemEntrada, valor: string) {
    setItens(prev => prev.map((item, i) => i === index ? { ...item, [campo]: valor } : item))
  }

  const itensMapeados = itens.filter(
    item => item.produto_id && Number(item.quantidade) > 0 && Number(item.preco_unitario) >= 0
  )

  async function handleSalvar() {
    if (itensMapeados.length === 0) return
    setErro(null)
    setSalvando(true)

    try {
      const hoje = new Date().toISOString().split('T')[0]

      for (const item of itensMapeados) {
        const produto = produtos.find(p => p.id === item.produto_id)
        if (!produto) continue

        const movData: Omit<MovimentacaoEstoque, 'id'> = {
          produto_id: item.produto_id,
          tipo: 'entrada',
          quantidade: Number(item.quantidade),
          unidade: item.unidade,
          custo_unitario: Number(item.preco_unitario),
          fornecedor_id: fornecedorId,
          origem: arquivo ? 'foto_nota' : 'manual',
          confianca: 'confirmado',
          ia_pre_preenchido: resultado.itens.length > 0,
          ia_dados_originais: { nome_original: item.nome_original },
          data: hoje,
          confirmado_em: new Date().toISOString(),
        }

        const movId = await addDocument('movimentacoes_estoque', movData)

        if (arquivo) {
          try {
            const fotoUrl = await uploadFotoMovimentacao(arquivo, movId)
            await updateDocument('movimentacoes_estoque', movId, { foto_url: fotoUrl })
          } catch {
            // Upload falhou — continua sem foto
          }
        }

        await salvarEntrada(movData, produto)
      }

      onSalvo()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar entrada')
    } finally {
      setSalvando(false)
    }
  }

  if (resultado.itens.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 flex flex-col gap-3">
        <p className="text-text-muted text-sm">
          🤔 Não foi possível extrair itens desta imagem.
        </p>
        <Button variant="ghost" onClick={onDescartar}>Tentar outra foto</Button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-text-primary font-bold text-sm">
          {resultado.itens.length} {resultado.itens.length === 1 ? 'item extraído' : 'itens extraídos'}
        </p>
        {resultado.data_documento && (
          <span className="text-text-faint text-xs">Data: {resultado.data_documento}</span>
        )}
      </div>

      {/* Fornecedor */}
      <div className="flex flex-col gap-1">
        <label className="text-text-muted text-xs font-semibold">Fornecedor</label>
        <select
          value={fornecedorId}
          onChange={e => setFornecedorId(e.target.value)}
          className="bg-white border border-border rounded-lg px-3 py-2 text-text-primary text-sm"
        >
          <option value="">— Sem fornecedor —</option>
          {fornecedores.map(f => (
            <option key={f.id} value={f.id}>{f.nome}</option>
          ))}
        </select>
      </div>

      {/* Itens */}
      <div className="flex flex-col gap-3">
        {itens.map((item, i) => (
          <div key={i} className="border border-border rounded-xl p-3 flex flex-col gap-2 bg-white">
            <p className="text-text-muted text-xs font-semibold">Extraído: &quot;{item.nome_original}&quot;</p>

            <div className="flex flex-col gap-1">
              <label className="text-text-faint text-[10px]">Produto no sistema (obrigatório)</label>
              <select
                value={item.produto_id}
                onChange={e => atualizarItem(i, 'produto_id', e.target.value)}
                className={[
                  'bg-white border rounded-lg px-3 py-2 text-text-primary text-sm',
                  !item.produto_id ? 'border-warning/50' : 'border-border',
                ].join(' ')}
              >
                <option value="">— Selecione o produto —</option>
                {produtos.filter(p => p.ativo).map(p => (
                  <option key={p.id} value={p.id}>{p.nome} ({p.unidade_padrao})</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-text-faint text-[10px]">Quantidade</label>
                <input
                  type="number" step="0.01" min="0"
                  value={item.quantidade}
                  onChange={e => atualizarItem(i, 'quantidade', e.target.value)}
                  placeholder="0"
                  className="bg-white border border-border rounded px-2 py-1.5 text-text-primary text-sm"
                />
              </div>
              <div className="flex flex-col gap-1 w-16">
                <label className="text-text-faint text-[10px]">Unid.</label>
                <input
                  type="text"
                  value={item.unidade}
                  onChange={e => atualizarItem(i, 'unidade', e.target.value)}
                  className="bg-white border border-border rounded px-2 py-1.5 text-text-primary text-sm"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-text-faint text-[10px]">Preço unit. (R$)</label>
                <input
                  type="number" step="0.01" min="0"
                  value={item.preco_unitario}
                  onChange={e => atualizarItem(i, 'preco_unitario', e.target.value)}
                  placeholder="0,00"
                  className="bg-white border border-border rounded px-2 py-1.5 text-text-primary text-sm"
                />
              </div>
            </div>

            {Number(item.quantidade) > 0 && Number(item.preco_unitario) > 0 && (
              <p className="text-text-faint text-[10px]">
                Total: {fmtBRL(Number(item.quantidade) * Number(item.preco_unitario))}
              </p>
            )}
          </div>
        ))}
      </div>

      {erro && (
        <p className="text-danger text-xs bg-danger/10 rounded-lg px-3 py-2">{erro}</p>
      )}

      {itensMapeados.length < itens.length && (
        <p className="text-warning text-xs bg-warning/10 rounded-lg px-3 py-2">
          ⚠️ {itens.length - itensMapeados.length} {itens.length - itensMapeados.length === 1 ? 'item sem produto mapeado' : 'itens sem produto mapeado'} — não serão salvos.
        </p>
      )}

      <div className="flex gap-2 justify-between items-center">
        <p className="text-text-muted text-xs">{itensMapeados.length} {itensMapeados.length === 1 ? 'item' : 'itens'} para salvar</p>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onDescartar}>Descartar</Button>
          <Button
            variant="primary"
            onClick={handleSalvar}
            disabled={salvando || itensMapeados.length === 0}
          >
            {salvando ? 'Salvando...' : `Confirmar ${itensMapeados.length} entr.`}
          </Button>
        </div>
      </div>
    </div>
  )
}
