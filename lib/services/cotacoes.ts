import { getCollection, addDocument } from '@/lib/firestore'
import { Cotacao } from '@/types'
import { where, orderBy } from 'firebase/firestore'

export async function getCotacoesPorProduto(produto_id: string): Promise<Cotacao[]> {
  return getCollection<Cotacao>('cotacoes', [
    where('produto_id', '==', produto_id),
    orderBy('data', 'desc'),
  ])
}

export async function getCotacoesRecentes(limite = 50): Promise<Cotacao[]> {
  return getCollection<Cotacao>('cotacoes', [orderBy('data', 'desc')])
}

export async function saveCotacao(data: Omit<Cotacao, 'id'>): Promise<string> {
  return addDocument('cotacoes', data)
}

export async function saveCotacoes(lista: Omit<Cotacao, 'id'>[]): Promise<void> {
  await Promise.all(lista.map(c => addDocument('cotacoes', c)))
}
