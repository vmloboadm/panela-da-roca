'use client'
import { useState, useEffect } from 'react'
import { Configuracoes } from '@/types'
import { getConfiguracoes, updateConfiguracoes } from '@/lib/services/configuracoes'

const DEFAULTS: Configuracoes = {
  meta_dia_util:                      2500,
  meta_domingo:                       5000,
  preco_kg_semana:                    76.90,
  preco_kg_domingo:                   82.90,
  preco_coma_vontade:                 54.90,
  cmv_ideal_percentual:               35,
  custo_por_km:                       1.20,
  meta_estoque_valor:                 2000,
  alerta_validade_dias_antecedencia:  3,
  alerta_preco_variacao_percentual:   10,
  alerta_compra_acima_media_percentual: 50,
}

interface FieldDef {
  key: keyof Configuracoes
  label: string
  unit: string
}

const SECOES: Array<{ titulo: string; campos: FieldDef[] }> = [
  {
    titulo: 'Metas de faturamento',
    campos: [
      { key: 'meta_dia_util', label: 'Meta dia útil',   unit: 'R$' },
      { key: 'meta_domingo',  label: 'Meta domingo',     unit: 'R$' },
    ],
  },
  {
    titulo: 'Preços de venda',
    campos: [
      { key: 'preco_kg_semana',     label: 'Preço/kg semana',          unit: 'R$/kg' },
      { key: 'preco_kg_domingo',    label: 'Preço/kg domingo',         unit: 'R$/kg' },
      { key: 'preco_coma_vontade',  label: 'Preço coma à vontade',     unit: 'R$/pessoa' },
    ],
  },
  {
    titulo: 'Controle de custos',
    campos: [
      { key: 'cmv_ideal_percentual', label: 'CMV ideal',               unit: '%' },
      { key: 'custo_por_km',         label: 'Custo por km',            unit: 'R$/km' },
      { key: 'meta_estoque_valor',   label: 'Meta valor em estoque',   unit: 'R$' },
    ],
  },
  {
    titulo: 'Alertas',
    campos: [
      { key: 'alerta_validade_dias_antecedencia',      label: 'Alerta validade antecedência', unit: 'dias' },
      { key: 'alerta_preco_variacao_percentual',       label: 'Alerta variação de preço',     unit: '%' },
      { key: 'alerta_compra_acima_media_percentual',   label: 'Alerta compra acima da média', unit: '%' },
    ],
  },
]

export default function ConfiguracoesPage() {
  const [form,      setForm]      = useState<Configuracoes>(DEFAULTS)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [mensagem,  setMensagem]  = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  useEffect(() => {
    getConfiguracoes().then(cfg => {
      if (cfg) setForm({ ...DEFAULTS, ...cfg })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function updateField(key: keyof Configuracoes, value: string) {
    setForm(prev => ({ ...prev, [key]: parseFloat(value) || 0 }))
  }

  async function handleSave() {
    setSaving(true)
    setMensagem(null)
    try {
      await updateConfiguracoes(form)
      setMensagem({ tipo: 'ok', texto: 'Configurações salvas com sucesso!' })
    } catch (e) {
      console.error(e)
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar. Tente novamente.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 max-w-xl">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-bg-card rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <h1 className="text-text-primary font-extrabold text-xl">Configurações</h1>

      {SECOES.map(secao => (
        <section key={secao.titulo} className="bg-bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="text-text-secondary font-bold text-sm uppercase tracking-wide">{secao.titulo}</h2>
          {secao.campos.map(campo => (
            <div key={campo.key} className="flex items-center gap-3">
              <label className="flex-1 text-sm text-text-primary">{campo.label}</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form[campo.key] as number}
                  onChange={e => updateField(campo.key, e.target.value)}
                  className="w-28 bg-bg-page border border-border focus:border-border-focus rounded-lg px-3 py-1.5 text-sm text-text-primary outline-none text-right"
                />
                <span className="text-xs text-text-muted w-16">{campo.unit}</span>
              </div>
            </div>
          ))}
        </section>
      ))}

      {mensagem && (
        <p className={`text-sm font-semibold ${mensagem.tipo === 'ok' ? 'text-success' : 'text-danger'}`}>
          {mensagem.texto}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="self-start px-6 py-2.5 bg-brand hover:bg-brand-hover text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50"
      >
        {saving ? 'Salvando…' : 'Salvar configurações'}
      </button>
    </div>
  )
}
