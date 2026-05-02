'use client'
import { useState, useEffect, useMemo } from 'react'
import { SaudacaoHero }    from '@/components/dashboard/SaudacaoHero'
import { AlertasCriticos } from '@/components/dashboard/AlertasCriticos'
import { KpiStrip }        from '@/components/dashboard/KpiStrip'
import { GraficoSemanal }  from '@/components/dashboard/GraficoSemanal'
import { getProdutos }     from '@/lib/services/estoque'
import { getDocument }     from '@/lib/firestore'
import { seedIfEmpty }     from '@/lib/seed'
import { Produto }         from '@/types'

interface ConfigGeral {
  meta_dia_util: number
  meta_domingo:  number
}

export default function DashboardPage() {
  const [produtos,     setProdutos]     = useState<Produto[]>([])
  const [config,       setConfig]       = useState<ConfigGeral | null>(null)
  const [carregando,   setCarregando]   = useState(true)

  useEffect(() => {
    async function init() {
      await seedIfEmpty()
      const [prods, cfg] = await Promise.all([
        getProdutos(),
        getDocument<ConfigGeral>('configuracoes', 'geral'),
      ])
      setProdutos(prods)
      setConfig(cfg)
      setCarregando(false)
    }
    init()
  }, [])

  const isDomingo = new Date().getDay() === 0
  const metaDia   = config
    ? (isDomingo ? config.meta_domingo : config.meta_dia_util)
    : 2500

  const ativos = useMemo(() => produtos.filter(p => p.ativo), [produtos])

  const produtosAbaixoMinimo = useMemo(
    () => ativos.filter(p => p.estoque_atual < p.estoque_minimo),
    [ativos]
  )

  if (carregando) {
    return (
      <div className="fadein flex flex-col gap-3">
        <div className="h-28 bg-border/30 rounded-2xl animate-pulse" />
        <div className="h-24 bg-white rounded-xl shadow-card animate-pulse" />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white rounded-xl shadow-card animate-pulse" />
          ))}
        </div>
        <div className="h-28 bg-white rounded-xl shadow-card animate-pulse" />
      </div>
    )
  }

  return (
    <div className="fadein flex flex-col gap-3">
      <SaudacaoHero metaDia={metaDia} />
      <AlertasCriticos produtosAbaixoMinimo={produtosAbaixoMinimo} />
      <KpiStrip
        faturamento={null}
        cmv={null}
        totalAlertas={produtosAbaixoMinimo.length}
      />
      <GraficoSemanal dados={[]} loading={false} />
    </div>
  )
}
