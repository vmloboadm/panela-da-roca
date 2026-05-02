import { fmtBRL } from '@/utils/calculos'

interface EstoqueHeroProps {
  valorTotal:   number
  totalAlertas: number
  totalItens:   number
  metaEstoque:  number
}

export function EstoqueHero({
  valorTotal, totalAlertas, totalItens, metaEstoque,
}: EstoqueHeroProps) {
  const pct = Math.min(100, metaEstoque > 0 ? (valorTotal / metaEstoque) * 100 : 0)

  return (
    <div
      className="text-white px-4 pt-4 pb-5"
      style={{ background: 'linear-gradient(135deg, #C2410C, #7C2D12)' }}
    >
      <p className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-2">
        Estoque · Hoje
      </p>

      {/* Valor + badges */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] opacity-75">valor total</p>
          <p className="text-3xl font-extrabold leading-tight">{fmtBRL(valorTotal)}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {totalAlertas > 0 && (
            <div
              className="rounded-lg px-3 py-1.5 text-center"
              style={{ background: 'rgba(255,255,255,0.15)' }}
            >
              <p className="text-base font-extrabold" style={{ color: '#FCD34D' }}>
                {totalAlertas}
              </p>
              <p className="text-[8px] opacity-85">alertas</p>
            </div>
          )}
          <div
            className="rounded-lg px-3 py-1.5 text-center"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          >
            <p className="text-base font-extrabold">{totalItens}</p>
            <p className="text-[8px] opacity-85">itens</p>
          </div>
        </div>
      </div>

      {/* Barra de meta */}
      <div className="mt-3">
        <div className="flex justify-between text-[9px] opacity-75 mb-1">
          <span>Meta de estoque</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: 'rgba(255,255,255,0.8)' }}
          />
        </div>
      </div>
    </div>
  )
}
