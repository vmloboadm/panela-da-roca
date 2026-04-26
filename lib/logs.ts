import { addDocument } from './firestore'
import { LogAcao } from '@/types'

interface LogPayloadInput {
  acao: string
  modulo: string
  dados_referencia_id?: string
  dados_referencia_colecao?: string
  modo?: 'normal' | 'rapido'
}

export function buildLogPayload(input: LogPayloadInput): Omit<LogAcao, 'id'> {
  const isMobile = typeof navigator !== 'undefined'
    && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)

  return {
    acao: input.acao,
    modulo: input.modulo,
    dados_referencia_id: input.dados_referencia_id,
    dados_referencia_colecao: input.dados_referencia_colecao,
    timestamp: new Date().toISOString(),
    dispositivo: isMobile ? 'mobile' : 'desktop',
    modo: input.modo ?? 'normal',
  }
}

export async function registrarLog(input: LogPayloadInput): Promise<void> {
  try {
    const payload = buildLogPayload(input)
    await addDocument('logs', payload)
  } catch {
    // Logs não devem quebrar a operação principal
  }
}
