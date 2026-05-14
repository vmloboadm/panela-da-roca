import { fmtBRL } from '@/utils/calculos'

interface GraficoSemanalProps {
  dados: number[]   // 7 valores, do mais antigo ao mais recente (hoje = dados[6])
  loading: boolean  // quando true, ignorar dados e renderizar skeleton
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function GraficoSemanal({ dados, loading }: GraficoSemanalProps) {
  const hoje = new Date().getDay() // 0=Dom ... 6=Sáb
  const labels = Array.from({ length: 7 }, (_, i) =>
    DIAS_SEMANA[(hoje - 6 + i + 7) % 7]
  )

  const max = dados.length > 0 ? Math.max(...dados, 1) : 1
  const total = dados.reduce((s, v) => s + v, 0)

  return (
    <div className="bg-bg-card rounded-xl shadow-card p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">◈ Receita — 7 dias</p>
        {!loading && total > 0 && (
          <p className="text-[10px] font-bold text-brand tabular-nums">{fmtBRL(total)}</p>
        )}
      </div>
      <div className="flex items-end gap-1.5 h-20">
        {loading
          ? Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full bg-border/50 animate-pulse rounded-t"
                  style={{ height: `${30 + Math.random() * 40}%` }}
                />
                <span className="text-[8px] text-text-muted/50 leading-none">···</span>
              </div>
            ))
          : Array.from({ length: 7 }, (_, i) => {
              const valor = dados[i] ?? 0
              const pct   = Math.max(4, (valor / max) * 100)
              const isHoje = i === 6
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className={[
                      'w-full rounded-t bar-grow transition-colors',
                      isHoje
                        ? 'bg-brand brand-glow'
                        : 'bg-brand/25 group-hover:bg-brand/50',
                    ].join(' ')}
                    style={{
                      height: `${pct}%`,
                      animationDelay: `${i * 50}ms`,
                    }}
                  />
                  <span className={[
                    'text-[8px] leading-none transition-colors',
                    isHoje ? 'text-brand font-bold' : 'text-text-muted',
                  ].join(' ')}>{labels[i]}</span>
                </div>
              )
            })
        }
      </div>
    </div>
  )
}
