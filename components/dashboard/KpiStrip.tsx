import { fmtBRL } from '@/utils/calculos'

interface KpiStripProps {
  faturamento: number | null
  cmv: number | null
  totalAlertas: number
}

export function KpiStrip({ faturamento, cmv, totalAlertas }: KpiStripProps) {
  const cmvAlto = cmv !== null && cmv > 35
  const temAlertas = totalAlertas > 0

  return (
    <div className="grid grid-cols-3 gap-2">
      {/* Faturamento */}
      <div className="bg-bg-card rounded-xl shadow-card p-3 text-center border border-border card-hover">
        <div className="w-6 h-6 rounded-lg bg-brand/15 flex items-center justify-center mx-auto mb-2">
          <svg viewBox="0 0 16 16" className="w-3 h-3 text-brand" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm.75 10.5h-1.5v-1h1.5v1zM9.3 8.6C8.9 8.9 8.75 9 8.75 9.5h-1.5c0-1.1.6-1.6 1.05-1.9.4-.3.7-.5.7-.9 0-.5-.45-.95-1-.95s-1 .4-1 .95H5.5C5.5 5.6 6.6 4.7 8 4.7s2.5.9 2.5 2c0 1-.7 1.5-1.2 1.9z"/>
          </svg>
        </div>
        <p className="text-sm font-extrabold text-text-primary leading-tight tabular-nums">
          {faturamento !== null ? fmtBRL(faturamento) : '—'}
        </p>
        <p className="text-[9px] text-text-muted mt-0.5 uppercase tracking-wide">Faturamento</p>
      </div>

      {/* CMV */}
      <div className={[
        'bg-bg-card rounded-xl shadow-card p-3 text-center border card-hover',
        cmvAlto ? 'border-warning/30' : 'border-border',
      ].join(' ')}>
        <div className={[
          'w-6 h-6 rounded-lg flex items-center justify-center mx-auto mb-2',
          cmvAlto ? 'bg-warning/15' : 'bg-brand/15',
        ].join(' ')}>
          <svg viewBox="0 0 16 16" className={['w-3 h-3', cmvAlto ? 'text-warning' : 'text-brand'].join(' ')} fill="currentColor">
            <path d="M2 12l3-4 2 2 3-5 4 7H2z"/>
          </svg>
        </div>
        <p className={[
          'text-sm font-extrabold leading-tight tabular-nums',
          cmvAlto ? 'text-warning' : 'text-text-primary',
        ].join(' ')}>
          {cmv !== null ? `${cmv.toFixed(0)}%` : '—'}
        </p>
        <p className="text-[9px] text-text-muted mt-0.5 uppercase tracking-wide">CMV</p>
      </div>

      {/* Alertas */}
      <div className={[
        'bg-bg-card rounded-xl shadow-card p-3 text-center border card-hover',
        temAlertas ? 'border-danger/30' : 'border-border',
      ].join(' ')}>
        <div className={[
          'w-6 h-6 rounded-lg flex items-center justify-center mx-auto mb-2',
          temAlertas ? 'bg-danger/15' : 'bg-brand/15',
        ].join(' ')}>
          <svg viewBox="0 0 16 16" className={['w-3 h-3', temAlertas ? 'text-danger' : 'text-brand'].join(' ')} fill="currentColor">
            <path d="M8 1L1 14h14L8 1zm0 3l4.5 8h-9L8 4zm-.75 3v2.5h1.5V7h-1.5zm0 3.5v1.5h1.5v-1.5h-1.5z"/>
          </svg>
        </div>
        <p className={[
          'text-sm font-extrabold leading-tight tabular-nums',
          temAlertas ? 'text-danger' : 'text-text-primary',
        ].join(' ')}>
          {totalAlertas}
        </p>
        <p className="text-[9px] text-text-muted mt-0.5 uppercase tracking-wide">Alertas</p>
      </div>
    </div>
  )
}
