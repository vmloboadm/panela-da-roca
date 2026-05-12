'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { RegistroDiario, Configuracoes, Preparacao, Produto } from '@/types'
import { getRegistros, getRegistroByData, createRegistro } from '@/lib/services/fechamento'
import { getConfiguracoes } from '@/lib/services/configuracoes'
import { getCollection } from '@/lib/firestore'

// ── Types ──────────────────────────────────────────────────────────────────
interface ItemForm {
  preparacao_id: string
  kg_produzidos: number
}

type Passo = 1 | 2 | 3 | 4

// ── Helpers ────────────────────────────────────────────────────────────────
function hoje(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ── Component ─────────────────────────────────────────────────────────────
export default function FechamentoPage() {
  // ── Data ──
  const [registros,    setRegistros]    = useState<RegistroDiario[]>([])
  const [config,       setConfig]       = useState<Configuracoes | null>(null)
  const [preparacoes,  setPreparacoes]  = useState<Preparacao[]>([])
  const [produtosMap,  setProdutosMap]  = useState<Map<string, Produto>>(new Map())
  const [loading,      setLoading]      = useState(true)
  const [registroHoje, setRegistroHoje] = useState<RegistroDiario | null>(null)

  // ── Error state ──
  const [erroCarregar, setErroCarregar] = useState<string | null>(null)

  // ── Modal / Form ──
  const [modalAberto, setModalAberto] = useState(false)
  const [passo,       setPasso]       = useState<Passo>(1)
  const [salvando,    setSalvando]    = useState(false)
  const [detalhe,     setDetalhe]     = useState<RegistroDiario | null>(null)

  // ── Form fields ──
  const [data,        setData]        = useState(hoje())
  const [tipoDia,     setTipoDia]     = useState<'util' | 'domingo'>('util')
  const [modo,        setModo]        = useState<'normal' | 'rapido'>('normal')
  const [fatTotal,    setFatTotal]    = useState<number>(0)
  const [fatSelf,     setFatSelf]     = useState<number>(0)
  const [fatComa,     setFatComa]     = useState<number>(0)
  const [fatBebidas,  setFatBebidas]  = useState<number>(0)
  const [fatQuent,    setFatQuent]    = useState<number>(0)
  const [fatExtras,   setFatExtras]   = useState<number>(0)
  const [comaQtde,    setComaQtde]    = useState<number>(0)
  const [itensPrep,   setItensPrep]   = useState<ItemForm[]>([{ preparacao_id: '', kg_produzidos: 0 }])

  // ── Load data ──
  const carregar = useCallback(async () => {
    setErroCarregar(null)
    setLoading(true)
    try {
      const [regs, cfg, preps, prods, regHoje] = await Promise.all([
        getRegistros(10),
        getConfiguracoes(),
        getCollection<Preparacao>('preparacoes'),
        getCollection<Produto>('produtos'),
        getRegistroByData(hoje()),
      ])
      setRegistros(regs)
      setConfig(cfg)
      setPreparacoes(preps.filter(p => p.ativo))
      const map = new Map<string, Produto>()
      prods.forEach(p => map.set(p.id, p))
      setProdutosMap(map)
      setRegistroHoje(regHoje)
    } catch (e) {
      console.error('[Fechamento] carregar falhou', e)
      setErroCarregar('Não foi possível carregar os dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // ── CMV calculation ──
  const calculos = useMemo(() => {
    if (modo === 'rapido') return {
      custo: 0,
      lucro: fatTotal,
      cmv:   0,
      metaDia: config ? (tipoDia === 'domingo' ? config.meta_domingo : config.meta_dia_util) : 0,
    }

    let custo = 0
    for (const item of itensPrep) {
      const prep = preparacoes.find(p => p.id === item.preparacao_id)
      if (!prep) continue
      const custoLote = prep.ingredientes.reduce((acc, ing) => {
        const produto = produtosMap.get(ing.produto_id)
        const custoUni = produto?.custo_medio ?? 0
        return acc + custoUni * ing.quantidade_entrada
      }, 0)
      custo += custoLote
    }

    const metaDia = config
      ? (tipoDia === 'domingo' ? config.meta_domingo : config.meta_dia_util)
      : 0

    return {
      custo,
      lucro:   fatTotal - custo,
      cmv:     fatTotal > 0 ? (custo / fatTotal) * 100 : 0,
      metaDia,
    }
  }, [modo, fatTotal, itensPrep, preparacoes, produtosMap, config, tipoDia])

  // ── Save ──
  async function handleSalvar() {
    setSalvando(true)
    try {
      const registro: Omit<RegistroDiario, 'id'> = {
        data,
        tipo_dia:                   tipoDia,
        faturamento_total:          fatTotal,
        faturamento_selfservice:    fatSelf   || undefined,
        faturamento_coma_vontade:   fatComa   || undefined,
        faturamento_bebidas:        fatBebidas || undefined,
        faturamento_quentinhas:     fatQuent  || undefined,
        faturamento_extras:         fatExtras || undefined,
        coma_vontade_pessoas:       comaQtde  || undefined,
        preparacoes_do_dia:         modo === 'rapido'
          ? []
          : itensPrep
              .filter(i => i.preparacao_id)
              .map(i => ({ preparacao_id: i.preparacao_id, kg_produzidos: i.kg_produzidos })),
        custo_producao_calculado:   calculos.custo,
        lucro_bruto:                calculos.lucro,
        cmv_percentual:             calculos.cmv,
        kg_selfservice_equivalente: fatSelf / (config?.preco_kg_semana ?? 76.9) || 0,
        meta_dia:                   calculos.metaDia,
        atingiu_meta:               fatTotal >= calculos.metaDia,
        modo_fechamento:            modo,
      }
      await createRegistro(registro)
      setModalAberto(false)
      await carregar()
    } catch (e) {
      console.error(e)
      alert('Erro ao salvar fechamento. Tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  function abrirModal() {
    setData(hoje())
    setTipoDia(new Date().getDay() === 0 ? 'domingo' : 'util')
    setModo('normal')
    setFatTotal(0); setFatSelf(0); setFatComa(0)
    setFatBebidas(0); setFatQuent(0); setFatExtras(0); setComaQtde(0)
    setItensPrep([{ preparacao_id: '', kg_produzidos: 0 }])
    setPasso(1)
    setModalAberto(true)
  }

  function addLinhaPrep() {
    setItensPrep(prev => [...prev, { preparacao_id: '', kg_produzidos: 0 }])
  }

  function updatePrep(idx: number, field: keyof ItemForm, value: string | number) {
    setItensPrep(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-10 bg-bg-card rounded-xl animate-pulse w-48" />
        <div className="h-48 bg-bg-card rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (erroCarregar) {
    return (
      <div className="fadein flex flex-col gap-3">
        <div className="bg-card rounded-xl shadow-card p-4 text-center text-text-muted">
          {erroCarregar}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-text-primary font-extrabold text-xl">Fechamento Diário</h1>
        <button
          onClick={abrirModal}
          disabled={!!registroHoje}
          title={registroHoje ? 'Já existe fechamento para hoje' : ''}
          className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          📅 Fechar Hoje
        </button>
      </div>

      {registroHoje && (
        <div className="bg-success/10 border border-success/30 rounded-xl px-4 py-3 text-success text-sm font-semibold">
          ✅ Fechamento de hoje já registrado — {formatBRL(registroHoje.faturamento_total)} · CMV {registroHoje.cmv_percentual.toFixed(1)}%
        </div>
      )}

      {/* Histórico */}
      <section className="bg-bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-text-secondary font-bold text-sm uppercase tracking-wide">Histórico Recente</h2>
        </div>
        {registros.length === 0 ? (
          <p className="text-text-muted text-sm p-6 text-center">Nenhum registro ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-faint text-xs text-left">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Faturamento</th>
                  <th className="px-4 py-3">CMV%</th>
                  <th className="px-4 py-3">Lucro</th>
                  <th className="px-4 py-3">Meta</th>
                </tr>
              </thead>
              <tbody>
                {registros.map(reg => (
                  <tr
                    key={reg.id}
                    onClick={() => setDetalhe(reg)}
                    className="border-t border-border hover:bg-bg-hover cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-text-primary">{reg.data}</td>
                    <td className="px-4 py-3 text-text-secondary capitalize">{reg.tipo_dia}</td>
                    <td className="px-4 py-3 text-text-primary font-semibold">{formatBRL(reg.faturamento_total)}</td>
                    <td className="px-4 py-3 text-text-secondary">{reg.cmv_percentual.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-success">{formatBRL(reg.lucro_bruto)}</td>
                    <td className="px-4 py-3 text-center text-lg">{reg.atingiu_meta ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Fechamento modal ─────────────────────────────── */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="bg-bg-card border border-border rounded-2xl shadow-elevated w-full max-w-lg flex flex-col gap-0 my-auto">
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-text-primary font-bold">Fechamento do Dia — Passo {passo} de {modo === 'rapido' ? 2 : 4}</h2>
              <button onClick={() => setModalAberto(false)} className="text-text-faint hover:text-text-primary text-xl">✕</button>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">

              {/* Passo 1: Informações do dia */}
              {passo === 1 && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-text-secondary font-semibold uppercase tracking-wide">Data</label>
                    <input
                      type="date"
                      value={data}
                      onChange={e => setData(e.target.value)}
                      className="bg-bg-page border border-border focus:border-border-focus rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-text-secondary font-semibold uppercase tracking-wide">Tipo de dia</label>
                    <div className="flex gap-2">
                      {(['util', 'domingo'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setTipoDia(t)}
                          className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                            tipoDia === t
                              ? 'bg-brand text-white border-brand'
                              : 'border-border text-text-secondary hover:bg-bg-hover'
                          }`}
                        >
                          {t === 'util' ? '📅 Dia útil' : '☀️ Domingo'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-text-secondary font-semibold uppercase tracking-wide">Modo</label>
                    <div className="flex gap-2">
                      {(['normal', 'rapido'] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => setModo(m)}
                          className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                            modo === m
                              ? 'bg-brand text-white border-brand'
                              : 'border-border text-text-secondary hover:bg-bg-hover'
                          }`}
                        >
                          {m === 'normal' ? '📋 Normal' : '⚡ Rápido'}
                        </button>
                      ))}
                    </div>
                    {modo === 'rapido' && (
                      <p className="text-xs text-text-faint mt-1">Modo rápido: apenas faturamento total, sem detalhamento de custos.</p>
                    )}
                  </div>
                </>
              )}

              {/* Passo 2: Faturamento */}
              {passo === 2 && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-text-secondary font-semibold uppercase tracking-wide">Faturamento total *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={fatTotal || ''}
                      onChange={e => setFatTotal(parseFloat(e.target.value) || 0)}
                      placeholder="0,00"
                      className="bg-bg-page border border-border focus:border-border-focus rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
                    />
                  </div>

                  {modo === 'normal' && (
                    <>
                      <p className="text-xs text-text-faint -mb-2">Breakdown opcional:</p>
                      {([
                        ['Self-service', fatSelf,    setFatSelf],
                        ['Coma à vontade', fatComa,  setFatComa],
                        ['Bebidas', fatBebidas,       setFatBebidas],
                        ['Quentinhas', fatQuent,      setFatQuent],
                        ['Extras', fatExtras,         setFatExtras],
                      ] as [string, number, (v: number) => void][]).map(([label, val, setter]) => (
                        <div key={label} className="flex items-center gap-3">
                          <label className="flex-1 text-sm text-text-secondary">{label}</label>
                          <input
                            type="number" min="0" step="0.01"
                            value={val || ''}
                            onChange={e => setter(parseFloat(e.target.value) || 0)}
                            placeholder="0,00"
                            className="w-28 bg-bg-page border border-border focus:border-border-focus rounded-lg px-3 py-1.5 text-sm text-text-primary outline-none text-right"
                          />
                        </div>
                      ))}
                      <div className="flex items-center gap-3">
                        <label className="flex-1 text-sm text-text-secondary">Pessoas coma à vontade</label>
                        <input
                          type="number" min="0"
                          value={comaQtde || ''}
                          onChange={e => setComaQtde(parseInt(e.target.value) || 0)}
                          className="w-28 bg-bg-page border border-border focus:border-border-focus rounded-lg px-3 py-1.5 text-sm text-text-primary outline-none text-right"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Passo 3: Preparações (normal only) */}
              {passo === 3 && modo === 'normal' && (
                <>
                  <p className="text-sm text-text-secondary">Informe o que foi produzido hoje:</p>
                  {itensPrep.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-end">
                      <div className="flex-1 flex flex-col gap-1">
                        <label className="text-xs text-text-faint">Preparação</label>
                        <select
                          value={item.preparacao_id}
                          onChange={e => updatePrep(idx, 'preparacao_id', e.target.value)}
                          className="bg-bg-page border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary outline-none"
                        >
                          <option value="">Selecione…</option>
                          {preparacoes.map(p => (
                            <option key={p.id} value={p.id}>{p.nome}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24 flex flex-col gap-1">
                        <label className="text-xs text-text-faint">kg produzidos</label>
                        <input
                          type="number" min="0" step="0.1"
                          value={item.kg_produzidos || ''}
                          onChange={e => updatePrep(idx, 'kg_produzidos', parseFloat(e.target.value) || 0)}
                          className="bg-bg-page border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary outline-none"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addLinhaPrep}
                    className="text-brand text-sm hover:underline self-start"
                  >
                    + Adicionar preparação
                  </button>
                </>
              )}

              {/* Passo 4: Resumo */}
              {passo === 4 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-text-primary font-bold text-base">Resumo do fechamento</h3>
                  {[
                    ['Faturamento total',  formatBRL(fatTotal)],
                    ['Custo de produção',  formatBRL(calculos.custo)],
                    ['Lucro bruto',        formatBRL(calculos.lucro)],
                    ['CMV%',              `${calculos.cmv.toFixed(1)}%`],
                    ['Meta do dia',        formatBRL(calculos.metaDia)],
                    ['Meta atingida?',     fatTotal >= calculos.metaDia ? '✅ Sim' : '❌ Não'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-text-secondary text-sm">{label}</span>
                      <span className="text-text-primary font-semibold text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="px-6 py-4 border-t border-border flex gap-2 justify-between">
              <button
                onClick={() => {
                  if (passo > 1) {
                    setPasso(p => {
                      if (modo === 'rapido' && p === 4) return 2
                      return (p - 1) as Passo
                    })
                  } else {
                    setModalAberto(false)
                  }
                }}
                className="px-4 py-2 border border-border rounded-xl text-text-secondary text-sm font-semibold hover:bg-bg-hover transition-colors"
              >
                {passo === 1 ? 'Cancelar' : '← Voltar'}
              </button>

              {passo < 4 && !(modo === 'rapido' && passo === 2) ? (
                <button
                  onClick={() => setPasso(p => {
                    if (modo === 'rapido' && p === 2) return 4
                    return (p + 1) as Passo
                  })}
                  disabled={passo === 2 && fatTotal <= 0}
                  className="flex-1 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40"
                >
                  Próximo →
                </button>
              ) : null}

              {(passo === 4 || (modo === 'rapido' && passo === 2)) && (
                <button
                  onClick={passo < 4 ? () => setPasso(4) : handleSalvar}
                  disabled={salvando || fatTotal <= 0}
                  className="flex-1 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-40"
                >
                  {passo === 4
                    ? (salvando ? 'Salvando…' : '✓ Confirmar fechamento')
                    : 'Ver resumo →'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detalhe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setDetalhe(null)}>
          <div className="bg-bg-card border border-border rounded-2xl shadow-elevated w-full max-w-sm p-6 flex flex-col gap-3" onClick={e => e.stopPropagation()}>
            <h2 className="text-text-primary font-bold text-base">Detalhes — {detalhe.data}</h2>
            {[
              ['Tipo',        detalhe.tipo_dia],
              ['Faturamento', formatBRL(detalhe.faturamento_total)],
              ['Custo',       formatBRL(detalhe.custo_producao_calculado)],
              ['Lucro',       formatBRL(detalhe.lucro_bruto)],
              ['CMV%',        `${detalhe.cmv_percentual.toFixed(1)}%`],
              ['Meta atingida', detalhe.atingiu_meta ? '✅' : '❌'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm border-b border-border pb-2">
                <span className="text-text-secondary">{label}</span>
                <span className="text-text-primary font-semibold">{value}</span>
              </div>
            ))}
            <button onClick={() => setDetalhe(null)} className="mt-2 py-2 border border-border rounded-xl text-text-secondary text-sm hover:bg-bg-hover transition-colors">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
