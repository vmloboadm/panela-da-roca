import { getDocument, updateDocument } from '@/lib/firestore'
import { Configuracoes } from '@/types'

export function getConfiguracoes(): Promise<Configuracoes | null> {
  return getDocument<Configuracoes>('configuracoes', 'geral')
}

export function updateConfiguracoes(data: Partial<Configuracoes>): Promise<void> {
  return updateDocument('configuracoes', 'geral', data)
}
