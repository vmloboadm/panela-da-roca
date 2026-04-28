'use client'

import { Produto } from '@/types'
import { fmtBRL } from '@/utils/calculos'

interface ProdutoEstoqueCardProps {
  produto: Produto
  onEntrada?: () => void
  onBaixa?: () => void
}

export function ProdutoEstoqueCard({ produto, onEntrada, onBaixa }: ProdutoEstoqueCardProps) {
  const abaixoMinimo = produto.estoque_atual < produto.estoque_minimo
  const percentual = produto.estoque_minimo > 0
    ? Math.min(100, (produto.estoque_atual / (produto.estoque_minimo * 2)) * 100)
    : produto.estoque_atual > 0 ? 100 : 0

  const corBarra = abaixoMinimo ? '#DC2626' : percentual < 60 ? '#D97706' : '#15803D'

  return (
    <div className={[
      'bg-white border border-border rounded-xl shadow-card p-3 flex flex-col gap-2 transition-colors',
      abaixoMinimo ? 'border-red-500/50' : 'border-border',
    ].join(' ')}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-text-primary font-bold text-sm break-words">{produto.nome}</p>
          <p className="text-text-faint text-[11px]">{produto.categoria}</p>
        </div>
        {abaixoMinimo && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-danger/10 text-danger font-bold shrink-0">
            ⚠️ Baixo
          </span>
        )}
      </div>

      {/* Estoque */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <div className="flex justify-between text-[10px] text-text-faint mb-1">
            <span>{produto.estoque_atual.toFixed(1)}{produto.unidade_padrao}</span>
            <span>mín: {produto.estoque_minimo}{produto.unidade_padrao}</span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${percentual}%`, backgroundColor: corBarra }}
            />
          </div>
        </div>
      </div>

      {/* Custo médio */}
      {produto.custo_medio > 0 && (
        <p className="text-text-muted text-[11px]">
          Custo médio: <span className="text-text-secondary font-medium">{fmtBRL(produto.custo_medio)}/{produto.unidade_padrao}</span>
        </p>
      )}

      {/* Actions */}
      {(onEntrada || onBaixa) && (
        <div className="flex gap-1.5 mt-1">
          {onEntrada && (
            <button
              onClick={onEntrada}
              className="flex-1 text-[11px] font-bold text-success border border-success/30 bg-success/10 rounded-lg py-1 hover:bg-success/20 transition-colors"
            >
              + Entrada
            </button>
          )}
          {onBaixa && (
            <button
              onClick={onBaixa}
              className="flex-1 text-[11px] font-bold text-text-muted border border-border rounded-lg py-1 hover:border-brand transition-colors"
            >
              − Baixa
            </button>
          )}
        </div>
      )}
    </div>
  )
}
