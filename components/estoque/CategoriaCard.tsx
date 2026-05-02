'use client'
import { CategoriaConfig } from '@/lib/categorias'
import { fmtBRL }          from '@/utils/calculos'

interface CategoriaCardProps {
  config:        CategoriaConfig
  totalProdutos: number
  alertas:       number
  valorTotal:    number
  onClick:       () => void
}

export function CategoriaCard({
  config, totalProdutos, alertas, valorTotal, onClick,
}: CategoriaCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-3 bg-white shadow-elevated border-l-4 transition-all hover:shadow-elevated active:scale-[0.98]"
      style={{ borderLeftColor: config.cor }}
    >
      {/* Topo: ícone + nome + badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-3xl leading-none">{config.icon}</span>
          <div>
            <p className="text-text-primary font-bold text-[13px] leading-tight">{config.nome}</p>
            <p className="text-text-faint text-[10px]">
              {totalProdutos} produto{totalProdutos !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          {alertas > 0 ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warning/15 text-warning">
              ⚠ {alertas} alerta{alertas > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/10 text-success">
              ✓ ok
            </span>
          )}
          {valorTotal > 0 && (
            <span className="text-sm font-bold text-text-primary">{fmtBRL(valorTotal)}</span>
          )}
        </div>
      </div>

      {/* Barra de progresso — h-2 (8px) */}
      {totalProdutos > 0 && (
        <div className="h-2 bg-border rounded-full overflow-hidden">
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
