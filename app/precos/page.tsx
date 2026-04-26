'use client'

import { useState, useEffect } from 'react'
import { Card, SectionTitle } from '@/components/ui'
import { LeitorUniversal } from '@/components/precos/LeitorUniversal'
import { ResultadoLeitura } from '@/components/precos/ResultadoLeitura'
import { VarreduraWeb } from '@/components/precos/VarreduraWeb'
import { CotacaoManual } from '@/components/precos/CotacaoManual'
import { TabelaCotacoes } from '@/components/precos/TabelaCotacoes'
import { LeituraIAResultado, Produto, Fornecedor, Cotacao } from '@/types'
import { getFornecedores } from '@/lib/services/fornecedores'
import { getCotacoesRecentes, saveCotacoes } from '@/lib/services/cotacoes'
import { getCollection } from '@/lib/firestore'
import { seedIfEmpty } from '@/lib/seed'
import { orderBy } from 'firebase/firestore'

type Aba = 'leitura' | 'varredura' | 'manual' | 'historico'

const ABAS: { id: Aba; label: string; icon: string }[] = [
  { id: 'leitura', label: 'Leitura IA', icon: '📷' },
  { id: 'varredura', label: 'Varredura Web', icon: '🌐' },
  { id: 'manual', label: 'Manual', icon: '✏️' },
  { id: 'historico', label: 'Histórico', icon: '📊' },
]

export default function PrecosPage() {
  const [aba, setAba] = useState<Aba>('leitura')
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [cotacoes, setCotacoes] = useState<Cotacao[]>([])
  const [resultadoLeitura, setResultadoLeitura] = useState<{ resultado: LeituraIAResultado; nomeArquivo: string } | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function init() {
      await seedIfEmpty()
      const [forn, prods, cots] = await Promise.all([
        getFornecedores(),
        getCollection<Produto>('produtos', [orderBy('nome')]),
        getCotacoesRecentes(100),
      ])
      setFornecedores(forn)
      setProdutos(prods)
      setCotacoes(cots)
      setCarregando(false)
    }
    init()
  }, [])

  async function recarregarCotacoes() {
    const cots = await getCotacoesRecentes(100)
    setCotacoes(cots)
  }

  async function onSalvarLeitura(novasCotacoes: Omit<Cotacao, 'id'>[]) {
    await saveCotacoes(novasCotacoes)
    setResultadoLeitura(null)
    await recarregarCotacoes()
    setAba('historico')
  }

  if (carregando) {
    return (
      <div className="fadein flex items-center justify-center py-16">
        <p className="text-text-muted text-sm animate-pulse">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="fadein flex flex-col gap-4">
      <Card>
        <SectionTitle icon="🔎">Varredura de Preços</SectionTitle>
        <p className="text-text-muted text-sm">
          Jogue qualquer mídia ou faça uma varredura na web para encontrar os melhores preços.
        </p>
      </Card>

      {/* Abas */}
      <div className="flex gap-1 bg-bg-card rounded-xl p-1 border border-border">
        {ABAS.map(a => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={[
              'flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition-colors',
              aba === a.id
                ? 'bg-brand text-white'
                : 'text-text-muted hover:text-text-primary',
            ].join(' ')}
          >
            <span>{a.icon}</span>
            <span className="hidden sm:inline">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <Card>
        {aba === 'leitura' && (
          <div className="flex flex-col gap-4">
            <SectionTitle icon="📷">Leitura IA Universal</SectionTitle>
            <p className="text-text-muted text-sm">
              Foto, print de WhatsApp, print de Instagram, folheto, PDF ou áudio — o Gemini lê e extrai os preços.
            </p>

            {resultadoLeitura ? (
              <ResultadoLeitura
                resultado={resultadoLeitura.resultado}
                fornecedores={fornecedores}
                onSalvar={onSalvarLeitura}
                onDescartar={() => setResultadoLeitura(null)}
              />
            ) : (
              <LeitorUniversal
                onResultado={(resultado, nomeArquivo) => setResultadoLeitura({ resultado, nomeArquivo })}
              />
            )}
          </div>
        )}

        {aba === 'varredura' && (
          <div className="flex flex-col gap-4">
            <SectionTitle icon="🌐">Varredura Web</SectionTitle>
            <p className="text-text-muted text-sm">
              Selecione os produtos e o Gemini pesquisa preços nos sites dos atacadistas e supermercados.
            </p>
            <VarreduraWeb
              produtos={produtos}
              fornecedores={fornecedores}
              onCotacoesSalvas={async () => { await recarregarCotacoes(); setAba('historico') }}
            />
          </div>
        )}

        {aba === 'manual' && (
          <div className="flex flex-col gap-4">
            <SectionTitle icon="✏️">Cotação Manual</SectionTitle>
            <p className="text-text-muted text-sm">
              Digite o preço que você viu no Instagram ou recebeu por WhatsApp.
            </p>
            <CotacaoManual
              produtos={produtos}
              fornecedores={fornecedores}
              onSalvo={recarregarCotacoes}
            />
          </div>
        )}

        {aba === 'historico' && (
          <div className="flex flex-col gap-4">
            <SectionTitle icon="📊">Histórico de Cotações</SectionTitle>
            <TabelaCotacoes
              cotacoes={cotacoes}
              produtos={produtos}
              fornecedores={fornecedores}
            />
          </div>
        )}
      </Card>
    </div>
  )
}
