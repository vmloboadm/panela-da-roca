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
      className="w-full text-left rounded-xl p-3 border transition-all hover:scale-[1.01] active:scale-[0.99]"
      style={{
        borderColor: alertas > 0 ? `${config.cor}66` : '#1e2130',
        backgroundColor: config.corBg,
        borderLeftWidth: 3,
        borderLeftColor: config.cor,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{config.icon}</span>
          <div>
            <p className="text-text-primary font-bold text-[13px] leading-tight">{config.nome}</p>
            <p className="text-text-faint text-[10px]">{totalProdutos} produto{totalProdutos !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {alertas > 0 && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${config.cor}33`, color: config.cor }}
            >
              ⚠️ {alertas}
            </span>
          )}
          {valorTotal > 0 && (
            <span className="text-[11px] text-text-muted font-medium">{fmtBRL(valorTotal)}</span>
          )}
        </div>
      </div>

      {/* Mini bar showing alert proportion */}
      {totalProdutos > 0 && (
        <div className="mt-2 h-1 bg-bg-base rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${alertas > 0 ? Math.max(8, (alertas / totalProdutos) * 100) : 100}%`,
              backgroundColor: alertas > 0 ? config.cor : '#22c55e',
              opacity: alertas > 0 ? 0.8 : 0.4,
            }}
          />
        </div>
      )}
    </button>
  )
}
