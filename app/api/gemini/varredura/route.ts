import { NextRequest, NextResponse } from 'next/server'
import { ResultadoVarredura } from '@/types'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

interface VarreduraRequest {
  produtos: { id: string; nome: string; unidade: string; sinonimos?: string[] }[]
  cidade: string  // ex: "Campos dos Goytacazes, RJ"
}

function buildPrompt(produtos: VarreduraRequest['produtos'], cidade: string): string {
  const lista = produtos.map(p => {
    const sinonimos = p.sinonimos?.length ? ` (também chamado: ${p.sinonimos.join(', ')})` : ''
    return `- ${p.nome}${sinonimos} (unidade: ${p.unidade})`
  }).join('\n')

  return `Você é um assistente de compras para o Restaurante Panela da Roça, em ${cidade}.

Pesquise os preços atuais dos seguintes produtos em supermercados e atacadistas da região (Assaí, Atacadão, redes locais de ${cidade}):

${lista}

Para cada produto encontrado, retorne o melhor preço disponível com fonte verificável.

Retorne SOMENTE um JSON válido (sem markdown):
{
  "resultados": [
    {
      "produto_id": "id do produto da lista acima",
      "produto_nome": "nome do produto",
      "cotacoes": [
        {
          "fornecedor_nome": "nome do supermercado/atacadista",
          "preco": 15.90,
          "unidade": "kg",
          "confianca": "alta",
          "url_fonte": "https://... ou null",
          "observacao": "promoção até X data ou null"
        }
      ]
    }
  ]
}

Regras:
- confianca="alta": preço em site oficial verificável (assai.com.br, atacadao.com.br, etc.)
- confianca="media": preço em comparadores de preço ou sites regionais
- confianca="baixa": estimativa sem fonte direta verificável
- NUNCA invente preços — marque confianca="baixa" com observacao="estimativa regional" quando não encontrar fonte direta
- Se não encontrar nenhum preço para um produto, inclua cotacoes:[] para ele`
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY não configurada.' }, { status: 500 })
  }

  let body: VarreduraRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido.' }, { status: 400 })
  }

  if (!body.produtos?.length) {
    return NextResponse.json({ error: 'Envie pelo menos um produto.' }, { status: 400 })
  }

  const geminiBody = {
    contents: [
      { parts: [{ text: buildPrompt(body.produtos, body.cidade ?? 'Campos dos Goytacazes, RJ') }] },
    ],
    tools: [{ google_search: {} }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
  }

  try {
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiBody),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.error?.message ?? `Erro Gemini: ${res.status}` },
        { status: res.status }
      )
    }

    const text = data?.candidates?.[0]?.content?.parts?.find(
      (p: { text?: string }) => p.text
    )?.text ?? '{}'

    let resultado: { resultados: ResultadoVarredura[] }
    try {
      resultado = JSON.parse(text)
    } catch {
      return NextResponse.json(
        { error: 'Gemini retornou resposta não-JSON.', raw: text },
        { status: 502 }
      )
    }

    return NextResponse.json(resultado)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
