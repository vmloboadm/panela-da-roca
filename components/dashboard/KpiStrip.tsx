import { fmtBRL } from '@/utils/calculos'

interface KpiStripProps {
  faturamento: number | null
  cmv: number | null
  totalAlertas: number
}

export function KpiStrip({ faturamento, cmv, totalAlertas }: KpiStripProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="bg-bg-card rounded-xl shadow-card p-3 text-center">
        <p className="text-lg leading-none mb-1">💰</p>
        <p className="text-base font-extrabold text-text-primary leading-tight">
          {faturamento !== null ? fmtBRL(faturamento) : '—'}
        </p>
        <p className="text-[10px] text-text-muted mt-0.5">faturamento</p>
      </div>

      <div className="bg-bg-card rounded-xl shadow-card p-3 text-center">
        <p className="text-lg leading-none mb-1">📊</p>
        <p className={[
          'text-base font-extrabold leading-tight',
          cmv !== null && cmv > 35 ? 'text-warning' : 'text-text-primary',
        ].join(' ')}>
          {cmv !== null ? `${cmv.toFixed(0)}%` : '—'}
        </p>
        <p className="text-[10px] text-text-muted mt-0.5">CMV</p>
      </div>

      <div className="bg-bg-card rounded-xl shadow-card p-3 text-center">
        <p className="text-lg leading-none mb-1">⚠️</p>
        <p className={[
          'text-base font-extrabold leading-tight',
          totalAlertas > 0 ? 'text-warning' : 'text-text-primary',
        ].join(' ')}>
          {totalAlertas}
        </p>
        <p className="text-[10px] text-text-muted mt-0.5">alertas</p>
      </div>
    </div>
  )
}
