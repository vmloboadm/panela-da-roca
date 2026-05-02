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

  return (
    <div className="bg-white rounded-xl shadow-card p-4">
      <p className="text-sm font-bold text-text-secondary mb-3">📈 Receita — 7 dias</p>
      <div className="flex items-end gap-1.5 h-16">
        {loading
          ? Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className="flex-1 bg-border animate-pulse rounded-t"
                style={{ height: '40%' }}
              />
            ))
          : Array.from({ length: 7 }, (_, i) => {
              const valor = dados[i] ?? 0
              const pct   = Math.max(4, (valor / max) * 100)
              const isHoje = i === 6
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={[
                      'w-full rounded-t transition-all',
                      isHoje ? 'bg-brand' : 'bg-brand/30',
                    ].join(' ')}
                    style={{ height: `${pct}%` }}
                  />
                  <span className="text-[8px] text-text-faint leading-none">{labels[i]}</span>
                </div>
              )
            })
        }
      </div>
    </div>
  )
}
