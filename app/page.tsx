'use client'
import { useState, useEffect, useMemo } from 'react'
import { SaudacaoHero }    from '@/components/dashboard/SaudacaoHero'
import { AlertasCriticos } from '@/components/dashboard/AlertasCriticos'
import { KpiStrip }        from '@/components/dashboard/KpiStrip'
import { GraficoSemanal }  from '@/components/dashboard/GraficoSemanal'
import { getProdutos }     from '@/lib/services/estoque'
import { getDocument }     from '@/lib/firestore'
import { seedIfEmpty }     from '@/lib/seed'
import { Produto, RegistroDiario } from '@/types'
import { getRegistros, getRegistroByData } from '@/lib/services/fechamento'

interface ConfigGeral {
  meta_dia_util: number
  meta_domingo:  number
}

export default function DashboardPage() {
  const [produtos,     setProdutos]     = useState<Produto[]>([])
  const [config,       setConfig]       = useState<ConfigGeral | null>(null)
  const [carregando,   setCarregando]   = useState(true)
  const [erro,         setErro]         = useState<string | null>(null)
  const [registroHoje, setRegistroHoje] = useState<RegistroDiario | null>(null)
  const [dadosGrafico,  setDadosGrafico]  = useState<number[]>([])

  useEffect(() => {
    async function init() {
      try {
        await seedIfEmpty()
        const [prods, cfg, regHoje, regs7d] = await Promise.all([
          getProdutos(),
          getDocument<ConfigGeral>('configuracoes', 'geral'),
          getRegistroByData(new Date().toISOString().slice(0, 10)),
          getRegistros(7),
        ])
        setProdutos(prods)
        setConfig(cfg)
        setRegistroHoje(regHoje)

        // Build 7-day chart array (oldest → newest, today at index 6)
        const dados = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().slice(0, 10)
          return regs7d.find((r: RegistroDiario) => r.data === d)?.faturamento_total ?? 0
        })
        setDadosGrafico(dados)
      } catch (e) {
        console.error('[DashboardPage] init falhou', e)
        setErro('Não foi possível carregar o painel. Tente novamente.')
      } finally {
        setCarregando(false)
      }
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

  if (erro) {
    return (
      <div className="fadein flex flex-col gap-3">
        <div className="bg-white rounded-xl shadow-card p-4 text-center text-text-muted">
          {erro}
        </div>
      </div>
    )
  }

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
        faturamento={registroHoje?.faturamento_total ?? null}
        cmv={registroHoje?.cmv_percentual ?? null}
        totalAlertas={produtosAbaixoMinimo.length}
      />
      <GraficoSemanal dados={dadosGrafico} loading={carregando} />
    </div>
  )
}
