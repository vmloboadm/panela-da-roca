import { NextRequest, NextResponse } from 'next/server'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

interface ProdutoInfo {
  id: string
  nome: string
  categoria: string
  subcategoria?: string
  sinonimos?: string[]
  unidade_padrao: string
  estoque_atual: number
  estoque_minimo: number
  custo_medio: number
}

interface ProcessarCompraRequest {
  mensagem?: string
  base64?: string
  mimeType?: string
  produtos: ProdutoInfo[]
}

export interface ItemCompraIA {
  texto_original: string
  produto_id: string | null
  produto_nome: string
  quantidade: number
  unidade: string
  preco_unitario: number | null
  confianca_match: 'alta' | 'media' | 'baixa'
}

export interface ResultadoProcessarCompra {
  tipo: 'compra' | 'consulta'
  itens?: ItemCompraIA[]
  observacao?: string | null
  resposta?: string
}

const ALLOWED_AUDIO = new Set(['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/aac'])

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY não configurada.' }, { status: 500 })

  let body: ProcessarCompraRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido.' }, { status: 400 })
  }

  if (!body.mensagem && !body.base64) {
    return NextResponse.json({ error: 'mensagem ou base64 obrigatório.' }, { status: 400 })
  }

  if (body.base64 && body.mimeType && !ALLOWED_AUDIO.has(body.mimeType)) {
    return NextResponse.json({ error: 'Tipo de áudio não suportado.' }, { status: 400 })
  }

  const listaProdutos = body.produtos
    .map(p => `  {"id":"${p.id}","nome":"${p.nome}","sinonimos":${JSON.stringify(p.sinonimos ?? [])},"unidade":"${p.unidade_padrao}","estoque":${p.estoque_atual},"minimo":${p.estoque_minimo}}`)
    .join(',\n')

  const estoqueResumo = body.produtos
    .map(p => `- ${p.nome}: ${p.estoque_atual}${p.unidade_padrao} (mín: ${p.estoque_minimo}, custo médio: R$${p.custo_medio.toFixed(2)})`)
    .join('\n')

  const prompt = `Você é o assistente de compras do Restaurante Panela da Roça, em Campos dos Goytacazes, RJ.

PRODUTOS CADASTRADOS NO SISTEMA:
[
${listaProdutos}
]

ESTOQUE ATUAL (para perguntas):
${estoqueResumo}

INSTRUÇÃO:
Analise a mensagem/áudio do usuário. Determine SE é:
1. Uma comunicação de COMPRA (ex: "comprei", "comprou", "chegou", "recebi", "peguei" — mencionou produtos adquiridos)
2. Uma PERGUNTA ou consulta sobre o estoque

Se for COMPRA:
- Extraia cada produto mencionado
- Encontre o melhor produto correspondente no sistema (por nome, sinônimos ou similaridade)
- Extraia quantidade, unidade e preço se mencionados
- produto_id deve ser o "id" exato do produto no sistema, ou null se não encontrar correspondência

Se for PERGUNTA:
- Responda de forma direta e prática, em português
- Use apenas os dados do estoque acima

Retorne SOMENTE JSON válido, sem markdown:

Se COMPRA:
{"tipo":"compra","itens":[{"texto_original":"como foi dito","produto_id":"id_ou_null","produto_nome":"nome no sistema ou extraído","quantidade":10.0,"unidade":"kg","preco_unitario":3.50,"confianca_match":"alta"}],"observacao":"obs ou null"}

Se PERGUNTA:
{"tipo":"consulta","resposta":"texto da resposta em português"}`

  const parts: { text?: string; inline_data?: { mime_type: string; data: string } }[] = [{ text: prompt }]
  if (body.base64 && body.mimeType) {
    parts.push({ inline_data: { mime_type: body.mimeType, data: body.base64 } })
  }

  const geminiBody = {
    contents: [{ parts }],
    generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
  }

  const RETRIES = 3
  let lastError = ''
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody),
      })

      const data = await res.json()

      if ((res.status === 503 || res.status === 429) && attempt < RETRIES) {
        await new Promise(r => setTimeout(r, attempt * 1500))
        lastError = data?.error?.message ?? `Gemini ${res.status}`
        continue
      }

      if (!res.ok) {
        return NextResponse.json(
          { error: data?.error?.message ?? `Erro Gemini: ${res.status}` },
          { status: res.status }
        )
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'
      let resultado: ResultadoProcessarCompra
      try {
        resultado = JSON.parse(text)
      } catch {
        return NextResponse.json({ error: 'Gemini retornou resposta não-JSON.', raw: text }, { status: 502 })
      }

      return NextResponse.json(resultado)
    } catch (err) {
      lastError = err instanceof Error ? err.message : 'Erro desconhecido'
      if (attempt < RETRIES) await new Promise(r => setTimeout(r, attempt * 1500))
    }
  }
  return NextResponse.json({ error: lastError || 'Erro ao processar mensagem' }, { status: 500 })
}
