'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, SectionTitle } from '@/components/ui'
import { ProdutoEstoqueCard } from '@/components/estoque/ProdutoEstoqueCard'
import { EntradaEstoque } from '@/components/estoque/EntradaEstoque'
import { BaixaEstoque } from '@/components/estoque/BaixaEstoque'
import { RegistroPerda } from '@/components/estoque/RegistroPerda'
import { ConsultaIA } from '@/components/estoque/ConsultaIA'
import { Produto, Fornecedor } from '@/types'
import { getProdutos } from '@/lib/services/estoque'
import { getFornecedores } from '@/lib/services/fornecedores'
import { seedIfEmpty } from '@/lib/seed'

type Aba = 'estoque' | 'entrada' | 'baixa' | 'consulta'
type AbaMovimento = 'baixa' | 'perda'

const ABAS: { id: Aba; label: string; icon: string }[] = [
  { id: 'estoque', label: 'Estoque', icon: '📦' },
  { id: 'entrada', label: 'Entrada', icon: '📥' },
  { id: 'baixa', label: 'Baixa/Perda', icon: '📤' },
  { id: 'consulta', label: 'Consulta IA', icon: '🤖' },
]

export default function EstoquePage() {
  const [aba, setAba] = useState<Aba>('estoque')
  const [abaMovimento, setAbaMovimento] = useState<AbaMovimento>('baixa')
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [carregando, setCarregando] = useState(true)
  const [soAlertasAtivos, setSoAlertasAtivos] = useState(false)

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

  const produtosExibidos = soAlertasAtivos
    ? produtos.filter(p => p.ativo && p.estoque_atual < p.estoque_minimo)
    : produtos.filter(p => p.ativo)

  const totalAlertas = produtos.filter(p => p.ativo && p.estoque_atual < p.estoque_minimo).length

  if (carregando) {
    return (
      <div className="fadein flex items-center justify-center py-16">
        <p className="text-text-muted text-sm animate-pulse">Carregando estoque...</p>
      </div>
    )
  }

  return (
    <div className="fadein flex flex-col gap-4">
      <Card>
        <SectionTitle icon="📦">Estoque Inteligente</SectionTitle>
        <p className="text-text-muted text-sm">
          Entrada por foto de NF, baixa de estoque e consulta em linguagem natural.
        </p>
      </Card>

      {/* Abas */}
      <div className="flex gap-1 bg-bg-card rounded-xl p-1 border border-border">
        {ABAS.map(a => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={[
              'flex-1 flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-bold transition-colors relative',
              aba === a.id ? 'bg-brand text-white' : 'text-text-muted hover:text-text-primary',
            ].join(' ')}
          >
            <span>{a.icon}</span>
            <span className="hidden sm:inline">{a.label}</span>
            {a.id === 'estoque' && totalAlertas > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                {totalAlertas}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <Card>
        {aba === 'estoque' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <SectionTitle icon="📦">Estoque Atual</SectionTitle>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-text-muted text-xs">Só alertas</span>
                <input
                  type="checkbox"
                  checked={soAlertasAtivos}
                  onChange={e => setSoAlertasAtivos(e.target.checked)}
                  className="w-4 h-4 accent-brand"
                />
              </label>
            </div>

            {produtosExibidos.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">
                {soAlertasAtivos ? 'Nenhum produto em alerta. 🎉' : 'Nenhum produto cadastrado.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {produtosExibidos.map(p => (
                  <ProdutoEstoqueCard
                    key={p.id}
                    produto={p}
                    onEntrada={() => setAba('entrada')}
                    onBaixa={() => setAba('baixa')}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {aba === 'entrada' && (
          <div className="flex flex-col gap-4">
            <SectionTitle icon="📥">Entrada de Estoque</SectionTitle>
            <EntradaEstoque
              produtos={produtos}
              fornecedores={fornecedores}
              onSalvo={async () => { await recarregarProdutos(); setAba('estoque') }}
            />
          </div>
        )}

        {aba === 'baixa' && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-1 bg-bg-base rounded-lg p-1">
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
                <BaixaEstoque
                  produtos={produtos}
                  onSalvo={async () => { await recarregarProdutos() }}
                />
              </>
            )}

            {abaMovimento === 'perda' && (
              <>
                <SectionTitle icon="🗑️">Registro de Perda</SectionTitle>
                <RegistroPerda
                  produtos={produtos}
                  onSalvo={async () => { await recarregarProdutos() }}
                />
              </>
            )}
          </div>
        )}

        {aba === 'consulta' && (
          <div className="flex flex-col gap-4">
            <SectionTitle icon="🤖">Consulta de Estoque</SectionTitle>
            <p className="text-text-muted text-sm">
              Pergunte qualquer coisa sobre o estoque em linguagem natural.
            </p>
            <ConsultaIA produtos={produtos} />
          </div>
        )}
      </Card>
    </div>
  )
}
