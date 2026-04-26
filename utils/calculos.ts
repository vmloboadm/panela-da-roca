import { CONFIGURACOES_PADRAO } from '@/types'

export function custoReal(
  preco: number,
  distancia_km: number | undefined,
  custo_por_km: number = CONFIGURACOES_PADRAO.custo_por_km
): number {
  if (!distancia_km) return preco
  return preco + distancia_km * custo_por_km * 2
}

export function fmtBRL(valor: number | null | undefined): string {
  if (valor == null) return '—'
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function kgEquivalente(faturamento: number, preco_por_kg: number): number {
  if (preco_por_kg === 0) return 0
  return faturamento / preco_por_kg
}

export function cmvPercentual(custo: number, faturamento: number): number {
  if (faturamento === 0) return 0
  return (custo / faturamento) * 100
}
