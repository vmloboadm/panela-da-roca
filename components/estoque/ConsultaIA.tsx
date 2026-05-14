'use client'

import { useState } from 'react'
import { Produto } from '@/types'
import { Button } from '@/components/ui'

const PERGUNTAS_RAPIDAS = [
  'O que está acabando?',
  'Tenho estoque suficiente para o domingo?',
  'O que preciso comprar essa semana?',
  'Quais produtos estão abaixo do mínimo?',
]

interface ConsultaIAProps {
  produtos: Produto[]
}

export function ConsultaIA({ produtos }: ConsultaIAProps) {
  const [pergunta, setPergunta] = useState('')
  const [resposta, setResposta] = useState<string | null>(null)
  const [consultando, setConsultando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function consultar(q?: string) {
    const texto = (q ?? pergunta).trim()
    if (!texto) return
    setConsultando(true)
    setResposta(null)
    setErro(null)

    const estoqueSnapshot = produtos
      .filter(p => p.ativo)
      .map(p => ({
        nome: p.nome,
        quantidade: p.estoque_atual,
        unidade: p.unidade_padrao,
        minimo: p.estoque_minimo,
        custo_medio: p.custo_medio,
      }))

    try {
      const res = await fetch('/api/gemini/consulta-estoque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pergunta: texto, estoque: estoqueSnapshot }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro na consulta')
      setResposta(data.resposta)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setConsultando(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Perguntas rápidas */}
      <div className="flex flex-col gap-2">
        <p className="text-text-muted text-xs font-semibold">Perguntas rápidas</p>
        <div className="flex flex-wrap gap-2">
          {PERGUNTAS_RAPIDAS.map(q => (
            <button
              key={q}
              onClick={() => { setPergunta(q); consultar(q) }}
              disabled={consultando}
              className="text-xs px-3 py-1.5 rounded-full border border-border text-text-muted hover:border-brand hover:text-brand transition-colors disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input livre */}
      <div className="flex gap-2">
        <input
          type="text"
          value={pergunta}
          onChange={e => setPergunta(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !consultando && consultar()}
          placeholder="Faça qualquer pergunta sobre o estoque..."
          className="flex-1 bg-bg-hover border border-border rounded-lg px-3 py-2 text-text-primary text-sm placeholder:text-text-faint focus:border-brand outline-none"
          disabled={consultando}
        />
        <Button
          variant="primary"
          onClick={() => consultar()}
          disabled={!pergunta.trim() || consultando}
        >
          {consultando ? '...' : '🤖'}
        </Button>
      </div>

      {/* Resposta */}
      {consultando && (
        <div className="bg-bg-card border border-border rounded-xl p-4">
          <p className="text-text-muted text-sm animate-pulse">🤖 Analisando estoque...</p>
        </div>
      )}

      {resposta && (
        <div className="bg-bg-card border border-brand/30 rounded-xl p-4 flex flex-col gap-2">
          <p className="text-brand text-xs font-bold">🤖 Assistente de Estoque</p>
          <p className="text-text-primary text-sm leading-relaxed whitespace-pre-wrap">{resposta}</p>
          <button
            onClick={() => { setResposta(null); setPergunta('') }}
            className="text-text-faint text-xs hover:text-text-muted self-end"
          >
            Nova pergunta
          </button>
        </div>
      )}

      {erro && (
        <p className="text-danger text-xs bg-danger/10 rounded-lg px-3 py-2">{erro}</p>
      )}

      <p className="text-text-faint text-[11px] text-center">
        {produtos.filter(p => p.ativo).length} produtos no estoque · Gemini 2.5 Flash
      </p>
    </div>
  )
}
