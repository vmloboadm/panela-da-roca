import { NextRequest, NextResponse } from 'next/server'
import { LeituraIAResultado } from '@/types'

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const PROMPT_LEITURA = `Você é um assistente especializado em leitura de documentos para restaurantes.
Analise o conteúdo fornecido (pode ser nota fiscal, folheto de mercado, print de WhatsApp, print de Instagram, foto de produto, áudio ou qualquer outro).
Extraia TODOS os produtos com preços que conseguir identificar.

Retorne SOMENTE um JSON válido no seguinte formato (sem markdown, sem explicações):
{
  "itens": [
    {
      "nome_original": "exatamente como aparece na fonte",
      "nome_normalizado": "nome padronizado em português",
      "preco_unitario": 15.90,
      "unidade": "kg",
      "quantidade": 10,
      "fornecedor": "nome do fornecedor ou null",
      "confianca": "alta",
      "observacao": "promoção válida até sábado ou null"
    }
  ],
  "tipo_documento": "nota_fiscal",
  "data_documento": "2026-04-26 ou null",
  "fornecedor_principal": "nome do fornecedor principal ou null",
  "observacao_geral": "observação geral sobre o documento ou null"
}

Regras:
- confianca deve ser: "alta" (preço claramente visível), "media" (preço legível mas contexto incerto), "baixa" (estimativa ou difícil leitura)
- tipo_documento deve ser: "nota_fiscal", "folheto", "print_whatsapp", "print_instagram", "foto_produto", "audio", "outro"
- preco_unitario deve ser number (ex: 15.90) ou null se não encontrar
- quantidade deve ser number ou null
- Se não encontrar nenhum produto com preço, retorne {"itens":[],"tipo_documento":"outro","data_documento":null,"fornecedor_principal":null,"observacao_geral":"Não foi possível extrair preços deste conteúdo"}
- NUNCA invente preços — só extraia o que está explícito na fonte`

interface LeituraRequest {
  base64: string
  mimeType: string
  contextoAdicional?: string   // ex: "Fornecedor: Assaí Atacadista"
}


const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/heic',
  'application/pdf',
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac', 'audio/webm',
])

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY não configurada.' }, { status: 500 })
  }

  let body: LeituraRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido.' }, { status: 400 })
  }

  if (!body.base64 || !body.mimeType) {
    return NextResponse.json({ error: 'base64 e mimeType são obrigatórios.' }, { status: 400 })
  }

  if (!ALLOWED_MIME_TYPES.has(body.mimeType)) {
    return NextResponse.json({ error: 'Tipo de arquivo não suportado.' }, { status: 400 })
  }

  const MAX_BASE64_MB = 10
  if (body.base64.length > MAX_BASE64_MB * 1024 * 1024) {
    return NextResponse.json({ error: `Arquivo muito grande. Máximo ${MAX_BASE64_MB} MB.` }, { status: 413 })
  }

  const contextoSanitizado = body.contextoAdicional
    ?.replace(/[\r\n]+/g, ' ')
    .slice(0, 200)

  const promptTexto = contextoSanitizado
    ? `${PROMPT_LEITURA}\n\nContexto adicional: ${contextoSanitizado}`
    : PROMPT_LEITURA

  const geminiBody = {
    contents: [
      {
        parts: [
          { text: promptTexto },
          { inline_data: { mime_type: body.mimeType, data: body.base64 } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json',
    },
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

      // Retry on overload/rate-limit
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
      let resultado: LeituraIAResultado
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
      lastError = err instanceof Error ? err.message : 'Erro desconhecido'
      if (attempt < RETRIES) await new Promise(r => setTimeout(r, attempt * 1500))
    }
  }
  return NextResponse.json({ error: lastError || 'Erro ao processar imagem' }, { status: 500 })
}
