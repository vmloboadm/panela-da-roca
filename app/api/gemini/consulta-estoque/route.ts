import { NextRequest, NextResponse } from 'next/server'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

interface ConsultaEstoqueRequest {
  pergunta: string
  estoque: {
    nome: string
    quantidade: number
    unidade: string
    minimo: number
    custo_medio: number
  }[]
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY não configurada.' }, { status: 500 })
  }

  let body: ConsultaEstoqueRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido.' }, { status: 400 })
  }

  if (!body.pergunta?.trim()) {
    return NextResponse.json({ error: 'Pergunta obrigatória.' }, { status: 400 })
  }

  const estoqueTexto = body.estoque
    .map(p => `- ${p.nome}: ${p.quantidade}${p.unidade} (mín: ${p.minimo}${p.unidade}, custo médio: R$${p.custo_medio.toFixed(2)}/${p.unidade})`)
    .join('\n')

  const prompt = `Você é o assistente de estoque do Restaurante Panela da Roça, em Campos dos Goytacazes, RJ.

Estoque atual:
${estoqueTexto}

Pergunta do usuário: ${body.pergunta.slice(0, 500)}

Responda de forma direta e prática, em português, com no máximo 3 parágrafos curtos. Foque em informações acionáveis. Se um produto estiver abaixo do mínimo, destaque isso. Não invente dados — use apenas o que está no estoque acima.`

  const geminiBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3 },
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

    const resposta = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Não foi possível gerar resposta.'
    return NextResponse.json({ resposta })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
