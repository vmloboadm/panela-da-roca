'use client'

import { Cotacao, Produto, Fornecedor, ConfiancaCotacao } from '@/types'
import { fmtBRL } from '@/utils/calculos'

interface TabelaCotacoesProps {
  cotacoes: Cotacao[]
  produtos: Produto[]
  fornecedores: Fornecedor[]
  alertaPercentual?: number  // % de variação para mostrar badge de alerta (default 10)
}

const CONFIANCA_COR: Record<ConfiancaCotacao, string> = {
  alta: '#22c55e',
  media: '#f59e0b',
  baixa: '#ef4444',
  estimada: '#6b7280',
}

const CONFIANCA_LABEL: Record<ConfiancaCotacao, string> = {
  alta: 'alta',
  media: 'média',
  baixa: 'baixa',
  estimada: 'est.',
}

const FONTE_LABEL: Record<string, string> = {
  varredura_ia: '🤖 IA',
  manual: '✏️ Manual',
  representante: '👤 Rep.',
}

function calcularVariacao(cotacoes: Cotacao[]): number | null {
  if (cotacoes.length < 2) return null
  const ordenadas = [...cotacoes].sort((a, b) => a.data.localeCompare(b.data))
  const ultima = ordenadas[ordenadas.length - 1].preco
  const penultima = ordenadas[ordenadas.length - 2].preco
  if (penultima === 0) return null
  return ((ultima - penultima) / penultima) * 100
}

export function TabelaCotacoes({ cotacoes, produtos, fornecedores, alertaPercentual = 10 }: TabelaCotacoesProps) {
  // Agrupar por produto_id
  const porProduto = new Map<string, Cotacao[]>()
  for (const c of cotacoes) {
    if (!porProduto.has(c.produto_id)) porProduto.set(c.produto_id, [])
    porProduto.get(c.produto_id)!.push(c)
  }

  if (porProduto.size === 0) {
    return (
      <div className="text-text-muted text-sm text-center py-8">
        Nenhuma cotação registrada ainda. Use a Leitura IA ou a Varredura Web acima.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {Array.from(porProduto.entries()).map(([prodId, cots]) => {
        const produto = produtos.find(p => p.id === prodId)
        const variacao = calcularVariacao(cots)
        const temAlerta = variacao !== null && Math.abs(variacao) >= alertaPercentual
        const cotsOrdenadas = [...cots].sort((a, b) => b.data.localeCompare(a.data))
        const menorPreco = Math.min(...cots.map(c => c.preco))

        return (
          <div key={prodId} className="bg-bg-base border border-border rounded-xl overflow-hidden">
            {/* Header do produto */}
            <div className="px-3 py-2 flex items-center gap-2 border-b border-border">
              <span className="text-text-primary font-bold text-sm flex-1">
                {produto?.nome ?? prodId}
              </span>
              {temAlerta && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${variacao! > 0 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                  {variacao! > 0 ? '↑' : '↓'} {Math.abs(variacao!).toFixed(1)}%
                </span>
              )}
              <span className="text-text-muted text-xs">{cots.length} cot.</span>
            </div>

            {/* Cotações */}
            <div className="divide-y divide-border">
              {cotsOrdenadas.slice(0, 5).map(c => {
                const fornecedor = fornecedores.find(f => f.id === c.fornecedor_id)
                const eMenor = c.preco === menorPreco && cots.length > 1

                return (
                  <div key={c.id} className="px-3 py-2 flex items-center gap-2 flex-wrap">
                    <span className="text-text-muted text-xs w-20 shrink-0">{c.data}</span>
                    <span
                      className={`font-bold text-sm ${eMenor ? 'text-green-400' : 'text-text-primary'}`}
                    >
                      {fmtBRL(c.preco)}/{c.unidade}
                      {eMenor && <span className="ml-1 text-[10px] text-green-400">★ menor</span>}
                    </span>
                    <span className="text-text-muted text-xs flex-1">{fornecedor?.nome ?? '—'}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${CONFIANCA_COR[c.confianca]}20`, color: CONFIANCA_COR[c.confianca] }}
                    >
                      {CONFIANCA_LABEL[c.confianca]}
                    </span>
                    <span className="text-text-faint text-[10px]">{FONTE_LABEL[c.fonte] ?? c.fonte}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
