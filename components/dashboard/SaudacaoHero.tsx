'use client'
import { getSaudacao } from '@/utils/saudacao'
import { fmtBRL } from '@/utils/calculos'

interface SaudacaoHeroProps {
  metaDia: number
}

export function SaudacaoHero({ metaDia }: SaudacaoHeroProps) {
  const agora = new Date()
  const { texto, emoji, extra } = getSaudacao(agora)
  const hoje = agora.toLocaleDateString('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'short',
  })

  return (
    <div className="bg-gradient-to-br from-brand to-brand-dark rounded-2xl p-5 text-white">
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
        {hoje.toUpperCase()} · PANELA DA ROÇA
      </p>
      <p className="text-2xl font-extrabold mt-1">{texto}! {emoji}</p>
      {extra && (
        <p className="text-sm opacity-90 mt-0.5">{extra}</p>
      )}
      <p className="text-sm opacity-80 mt-2">
        Meta do dia: <span className="font-bold">{fmtBRL(metaDia)}</span>
      </p>
    </div>
  )
}
