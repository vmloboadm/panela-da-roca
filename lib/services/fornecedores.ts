import { getCollection, addDocument, updateDocument } from '@/lib/firestore'
import { Fornecedor } from '@/types'
import { orderBy } from 'firebase/firestore'

export async function getFornecedores(): Promise<Fornecedor[]> {
  return getCollection<Fornecedor>('fornecedores', [orderBy('nome')])
}

export async function saveFornecedor(data: Omit<Fornecedor, 'id'>): Promise<string> {
  return addDocument('fornecedores', data)
}

export async function updateFornecedor(id: string, data: Partial<Fornecedor>): Promise<void> {
  return updateDocument('fornecedores', id, data)
}
