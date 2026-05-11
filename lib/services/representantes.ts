import { getCollection, getDocument, addDocument, updateDocument, deleteDocument } from '@/lib/firestore'
import { Representante } from '@/types'

export function getRepresentantes(): Promise<Representante[]> {
  return getCollection<Representante>('representantes')
}

export function getRepresentante(id: string): Promise<Representante | null> {
  return getDocument<Representante>('representantes', id)
}

export function createRepresentante(data: Omit<Representante, 'id'>): Promise<string> {
  return addDocument('representantes', data)
}

export function updateRepresentante(id: string, data: Partial<Representante>): Promise<void> {
  return updateDocument('representantes', id, data)
}

export function deleteRepresentante(id: string): Promise<void> {
  return deleteDocument('representantes', id)
}
