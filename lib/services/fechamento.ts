import { orderBy, limit as fsLimit } from 'firebase/firestore'
import { getCollection, getDocument, addDocument, updateDocument } from '@/lib/firestore'
import { RegistroDiario } from '@/types'

export async function getRegistros(lim?: number): Promise<RegistroDiario[]> {
  const constraints = [orderBy('data', 'desc'), ...(lim ? [fsLimit(lim)] : [])]
  return getCollection<RegistroDiario>('registros_diarios', constraints)
}

export function getRegistro(id: string): Promise<RegistroDiario | null> {
  return getDocument<RegistroDiario>('registros_diarios', id)
}

export async function getRegistroByData(data: string): Promise<RegistroDiario | null> {
  const todos = await getCollection<RegistroDiario>('registros_diarios')
  return todos.find(r => r.data === data) ?? null
}

export function createRegistro(data: Omit<RegistroDiario, 'id'>): Promise<string> {
  return addDocument('registros_diarios', data)
}

export function updateRegistro(id: string, updates: Partial<RegistroDiario>): Promise<void> {
  return updateDocument('registros_diarios', id, updates)
}
