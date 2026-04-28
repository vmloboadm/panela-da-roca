'use client'

import { CategoriaConfig } from '@/lib/categorias'
import { fmtBRL } from '@/utils/calculos'

interface CategoriaCardProps {
  config: CategoriaConfig
  totalProdutos: number
  alertas: number
  valorTotal: number
  onClick: () => void
}

export function CategoriaCard({ config, totalProdutos, alertas, valorTotal, onClick }: CategoriaCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-3 bg-white shadow-card border-l-4 transition-all hover:shadow-elevated active:scale-[0.98]"
      style={{ borderLeftColor: config.cor }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none">{config.icon}</span>
          <div>
            <p className="text-text-primary font-bold text-[13px] leading-tight">{config.nome}</p>
            <p className="text-text-faint text-[10px]">{totalProdutos} produto{totalProdutos !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {alertas > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-warning/10 text-warning">
              ⚠️ {alertas}
            </span>
          )}
          {valorTotal > 0 && (
            <span className="text-[11px] text-text-muted font-medium">{fmtBRL(valorTotal)}</span>
          )}
        </div>
      </div>

      {totalProdutos > 0 && (
        <div className="mt-2 h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${alertas > 0 ? Math.max(8, (alertas / totalProdutos) * 100) : 100}%`,
              backgroundColor: alertas > 0 ? config.cor : '#15803D',
              opacity: alertas > 0 ? 0.8 : 0.5,
            }}
          />
        </div>
      )}
    </button>
  )
}
