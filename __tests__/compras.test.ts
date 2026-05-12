jest.mock('@/lib/firestore', () => ({
  getCollection:  jest.fn(),
  getDocument:    jest.fn(),
  addDocument:    jest.fn(),
  updateDocument: jest.fn(),
}))

import {
  getListasCompra,
  getListaCompra,
  createListaCompra,
  addItemLista,
  removeItemLista,
  updateItemLista,
  concluirLista,
  descartarLista,
} from '@/lib/services/compras'
import { getCollection, getDocument, addDocument, updateDocument } from '@/lib/firestore'

const mockGetCollection  = getCollection  as jest.MockedFunction<typeof getCollection>
const mockGetDocument    = getDocument    as jest.MockedFunction<typeof getDocument>
const mockAddDocument    = addDocument    as jest.MockedFunction<typeof addDocument>
const mockUpdateDocument = updateDocument as jest.MockedFunction<typeof updateDocument>

const LISTA_FAKE = {
  id: 'l1',
  status: 'ativa' as const,
  itens: [{ produto_id: 'p1', quantidade_sugerida: 2, unidade: 'kg' }],
  criada_em: '2026-05-07T00:00:00Z',
}

describe('compras service', () => {
  beforeEach(() => jest.clearAllMocks())

  it('getListasCompra calls getCollection("listas_compra")', async () => {
    mockGetCollection.mockResolvedValue([])
    await getListasCompra()
    expect(mockGetCollection).toHaveBeenCalledWith('listas_compra')
  })

  it('createListaCompra calls addDocument and returns id', async () => {
    mockAddDocument.mockResolvedValue('lista-id')
    const id = await createListaCompra()
    expect(mockAddDocument).toHaveBeenCalledWith('listas_compra', expect.objectContaining({ status: 'ativa', itens: [] }))
    expect(id).toBe('lista-id')
  })

  it('createListaCompra includes observacao when provided', async () => {
    mockAddDocument.mockResolvedValue('lista-id')
    await createListaCompra('Compra urgente')
    expect(mockAddDocument).toHaveBeenCalledWith('listas_compra', expect.objectContaining({ observacao: 'Compra urgente' }))
  })

  it('addItemLista appends item via updateDocument', async () => {
    mockGetDocument.mockResolvedValue(LISTA_FAKE)
    mockUpdateDocument.mockResolvedValue(undefined)
    const novoItem = { produto_id: 'p2', quantidade_sugerida: 1, unidade: 'un' }
    await addItemLista('l1', novoItem)
    const chamada = mockUpdateDocument.mock.calls[0]
    expect(chamada[0]).toBe('listas_compra')
    expect(chamada[1]).toBe('l1')
    const itensEnviados = chamada[2].itens as typeof LISTA_FAKE.itens
    expect(itensEnviados).toHaveLength(2)
    expect(itensEnviados[1].produto_id).toBe('p2')
  })

  it('concluirLista sets status to concluida', async () => {
    mockUpdateDocument.mockResolvedValue(undefined)
    await concluirLista('l1')
    expect(mockUpdateDocument).toHaveBeenCalledWith('listas_compra', 'l1', { status: 'concluida' })
  })

  it('descartarLista sets status to descartada', async () => {
    mockUpdateDocument.mockResolvedValue(undefined)
    await descartarLista('l1')
    expect(mockUpdateDocument).toHaveBeenCalledWith('listas_compra', 'l1', { status: 'descartada' })
  })
})
