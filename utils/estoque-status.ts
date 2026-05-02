export type StatusEstoque = 'CRITICO' | 'BAIXO' | 'OK'

export function getStatusEstoque(estoqueAtual: number, estoqueMinimo: number): StatusEstoque {
  if (estoqueMinimo <= 0) return 'OK'
  if (estoqueAtual < estoqueMinimo * 0.5) return 'CRITICO'
  if (estoqueAtual < estoqueMinimo)       return 'BAIXO'
  return 'OK'
}

export const STATUS_CONFIG: Record<StatusEstoque, {
  icon:       string
  badgeClass: string
  label:      string
}> = {
  CRITICO: { icon: '🔴', badgeClass: 'bg-danger text-white',       label: 'Crítico' },
  BAIXO:   { icon: '🟡', badgeClass: 'bg-warning/20 text-warning', label: 'Baixo'   },
  OK:      { icon: '🟢', badgeClass: 'bg-success/10 text-success', label: 'Ok'      },
}
