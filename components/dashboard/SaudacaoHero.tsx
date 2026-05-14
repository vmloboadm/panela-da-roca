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
    <div
      className="rounded-2xl p-5 text-white relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, hsl(25 95% 50%) 0%, hsl(25 95% 38%) 100%)',
        boxShadow: '0 4px 24px hsl(25 95% 55% / 0.25)',
      }}
    >
      {/* Decorative grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, white 0px, white 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, white 0px, white 1px, transparent 1px, transparent 24px)',
        }}
      />
      {/* Decorative glow blob */}
      <div
        className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: 'hsl(25 95% 70% / 0.2)', filter: 'blur(20px)' }}
      />

      <div className="relative">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
          {hoje.toUpperCase()} · PANELA DA ROÇA
        </p>
        <p className="text-2xl font-extrabold mt-1">{texto}! {emoji}</p>
        {extra && (
          <p className="text-sm opacity-90 mt-0.5">{extra}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <p className="text-sm opacity-80">
            Meta do dia: <span className="font-bold">{fmtBRL(metaDia)}</span>
          </p>
          <div className="flex items-center gap-1 bg-white/15 rounded-lg px-2 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wide">Ao vivo</span>
          </div>
        </div>
      </div>
    </div>
  )
}
