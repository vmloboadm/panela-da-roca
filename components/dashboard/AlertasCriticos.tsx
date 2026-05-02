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
    <div className="bg-white rounded-xl shadow-card p-4">
      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wide mb-3">
        O que precisa de atenção
      </p>
      <div className="flex flex-col gap-2">
        {produtosAbaixoMinimo.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span>🟢</span>
            <span>Tudo ok no estoque</span>
          </div>
        ) : (
          <>
            {criticos.slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center gap-2 text-sm text-text-primary">
                <span>🔴</span>
                <span>{p.nome} abaixo do mínimo</span>
              </div>
            ))}
            {criticos.length > 3 && (
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span>🔴</span>
                <span>e mais {criticos.length - 3} produto{criticos.length - 3 > 1 ? 's' : ''} críticos</span>
              </div>
            )}
            {baixos.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-text-primary">
                <span>🟡</span>
                <span>{baixos.length} produto{baixos.length > 1 ? 's' : ''} com estoque baixo</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
