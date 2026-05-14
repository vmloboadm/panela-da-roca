import { Produto } from '@/types'

interface AlertasCriticosProps {
  produtosAbaixoMinimo: Produto[]
}

export function AlertasCriticos({ produtosAbaixoMinimo }: AlertasCriticosProps) {
  // Crítico: abaixo de 50% do mínimo
  const criticos = produtosAbaixoMinimo.filter(
    p => p.estoque_atual < p.estoque_minimo * 0.5
  )
  // Baixo: entre 50% e 100% do mínimo
  const baixos = produtosAbaixoMinimo.filter(
    p => p.estoque_atual >= p.estoque_minimo * 0.5
  )

  return (
    <div className="bg-bg-card rounded-xl shadow-card p-4 border border-border">
      <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">
        ◈ Atenção ao estoque
      </p>
      <div className="flex flex-col gap-1.5">
        {produtosAbaixoMinimo.length === 0 ? (
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" style={{ boxShadow: '0 0 6px hsl(142 71% 45% / 0.6)' }} />
            <span className="text-sm text-text-secondary">Estoque normalizado</span>
          </div>
        ) : (
          <>
            {criticos.slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" style={{ boxShadow: '0 0 6px hsl(0 84% 60% / 0.6)' }} />
                <span className="text-sm text-text-primary truncate">{p.nome}</span>
                <span className="ml-auto text-[10px] font-bold text-danger bg-danger/10 px-1.5 py-0.5 rounded-md shrink-0">CRÍTICO</span>
              </div>
            ))}
            {criticos.length > 3 && (
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-danger/50 shrink-0" />
                <span className="text-xs text-text-muted">+{criticos.length - 3} produto{criticos.length - 3 > 1 ? 's' : ''} críticos</span>
              </div>
            )}
            {baixos.length > 0 && (
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" style={{ boxShadow: '0 0 6px hsl(38 92% 50% / 0.5)' }} />
                <span className="text-sm text-text-primary">{baixos.length} produto{baixos.length > 1 ? 's' : ''} com estoque baixo</span>
                <span className="ml-auto text-[10px] font-bold text-warning bg-warning/10 px-1.5 py-0.5 rounded-md shrink-0">BAIXO</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
