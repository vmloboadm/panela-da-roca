import { getCollection, getDocument, addDocument, updateDocument } from '@/lib/firestore'
import { ListaCompra, ItemListaCompra } from '@/types'

export function getListasCompra(): Promise<ListaCompra[]> {
  return getCollection<ListaCompra>('listas_compra')
}

export function getListaCompra(id: string): Promise<ListaCompra | null> {
  return getDocument<ListaCompra>('listas_compra', id)
}

export function createListaCompra(observacao?: string): Promise<string> {
  const data: Omit<ListaCompra, 'id'> = {
    status:    'ativa',
    itens:     [],
    criada_em: new Date().toISOString(),
    ...(observacao ? { observacao } : {}),
  }
  return addDocument('listas_compra', data)
}

export async function addItemLista(listaId: string, item: ItemListaCompra): Promise<void> {
  const lista = await getListaCompra(listaId)
  if (!lista) throw new Error(`Lista ${listaId} não encontrada`)
  const itens = [...(lista.itens ?? []), item]
  return updateDocument('listas_compra', listaId, { itens })
}

export async function removeItemLista(listaId: string, produtoId: string): Promise<void> {
  const lista = await getListaCompra(listaId)
  if (!lista) throw new Error(`Lista ${listaId} não encontrada`)
  const idx = lista.itens.findIndex(i => i.produto_id === produtoId)
  if (idx === -1) return
  const itens = [...lista.itens.slice(0, idx), ...lista.itens.slice(idx + 1)]
  return updateDocument('listas_compra', listaId, { itens })
}

export async function updateItemLista(
  listaId: string,
  produtoId: string,
  updates: Partial<ItemListaCompra>,
): Promise<void> {
  const lista = await getListaCompra(listaId)
  if (!lista) throw new Error(`Lista ${listaId} não encontrada`)
  const itens = lista.itens.map(i =>
    i.produto_id === produtoId ? { ...i, ...updates } : i
  )
  return updateDocument('listas_compra', listaId, { itens })
}

export function concluirLista(id: string): Promise<void> {
  return updateDocument('listas_compra', id, { status: 'concluida' })
}

export function descartarLista(id: string): Promise<void> {
  return updateDocument('listas_compra', id, { status: 'descartada' })
}
