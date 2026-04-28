'use client'

import { fmtBRL } from '@/utils/calculos'

export interface DonutSegmento {
  label: string
  value: number
  cor: string
}

interface DonutChartProps {
  segmentos: DonutSegmento[]
  totalLabel?: string
}

export function DonutChart({ segmentos, totalLabel }: DonutChartProps) {
  const total = segmentos.reduce((s, seg) => s + seg.value, 0)
  const ativos = segmentos.filter(s => s.value > 0)

  const cx = 70, cy = 70, r = 52
  const circunferencia = 2 * Math.PI * r

  let offsetAcumulado = 0
  const arcos = ativos.map(seg => {
    const fracao = total > 0 ? seg.value / total : 0
    const dash = fracao * circunferencia
    const arc = {
      ...seg,
      dasharray: `${dash.toFixed(2)} ${(circunferencia - dash).toFixed(2)}`,
      dashoffset: (circunferencia - offsetAcumulado).toFixed(2),
    }
    offsetAcumulado += dash
    return arc
  })

  if (total === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-text-faint text-xs">Nenhum valor calculado ainda</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-[140px] h-[140px]">
        <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F0E6D3" strokeWidth={22} />
          {arcos.map((arc, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={arc.cor}
              strokeWidth={22}
              strokeDasharray={arc.dasharray}
              strokeDashoffset={arc.dashoffset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[9px] text-text-faint font-medium leading-tight">
            {totalLabel ?? 'em estoque'}
          </span>
          <span className="text-[13px] text-text-primary font-extrabold leading-tight">
            {fmtBRL(total)}
          </span>
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-x-3 gap-y-1.5">
        {ativos.map(seg => {
          const pct = total > 0 ? ((seg.value / total) * 100).toFixed(0) : '0'
          return (
            <div key={seg.label} className="flex items-center gap-1.5 min-w-0">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seg.cor }} />
              <span className="text-[10px] text-text-muted truncate">{seg.label}</span>
              <span className="text-[10px] text-text-faint ml-auto shrink-0">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
