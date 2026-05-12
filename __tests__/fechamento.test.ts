jest.mock('@/lib/firestore', () => ({
  getCollection:  jest.fn(),
  getDocument:    jest.fn(),
  addDocument:    jest.fn(),
  updateDocument: jest.fn(),
}))

import {
  getRegistros,
  getRegistro,
  getRegistroByData,
  createRegistro,
  updateRegistro,
} from '@/lib/services/fechamento'
import { getCollection, getDocument, addDocument, updateDocument } from '@/lib/firestore'

const mockGetCollection  = getCollection  as jest.MockedFunction<typeof getCollection>
const mockGetDocument    = getDocument    as jest.MockedFunction<typeof getDocument>
const mockAddDocument    = addDocument    as jest.MockedFunction<typeof addDocument>
const mockUpdateDocument = updateDocument as jest.MockedFunction<typeof updateDocument>

const REG_FAKE = {
  id:    'r1',
  data:  '2026-05-07',
  tipo_dia: 'util' as const,
  faturamento_total: 3000,
  cmv_percentual:    32,
  lucro_bruto:       2040,
  custo_producao_calculado: 960,
  preparacoes_do_dia: [],
  kg_selfservice_equivalente: 50,
  meta_dia: 2500,
  atingiu_meta: true,
  modo_fechamento: 'normal' as const,
}

describe('fechamento service', () => {
  beforeEach(() => jest.clearAllMocks())

  it('getRegistros calls getCollection with orderBy constraint', async () => {
    mockGetCollection.mockResolvedValue([REG_FAKE])
    const result = await getRegistros()
    expect(mockGetCollection).toHaveBeenCalledWith('registros_diarios', expect.any(Array))
    expect(result).toHaveLength(1)
  })

  it('getRegistros(1) passes limit constraint and returns at most 1 result', async () => {
    mockGetCollection.mockResolvedValue([REG_FAKE])
    await getRegistros(1)
    const [, constraints] = mockGetCollection.mock.calls[0] as [string, unknown[]]
    expect(constraints).toHaveLength(2) // orderBy + limit
  })

  it('getRegistro delegates to getDocument', async () => {
    mockGetDocument.mockResolvedValueOnce({ id: 'abc', data: '2025-01-01', faturamento_total: 500 })
    const result = await getRegistro('abc')
    expect(mockGetDocument).toHaveBeenCalledWith('registros_diarios', 'abc')
    expect(result).toEqual({ id: 'abc', data: '2025-01-01', faturamento_total: 500 })
  })

  it('getRegistroByData returns matching record', async () => {
    mockGetCollection.mockResolvedValue([REG_FAKE])
    const reg = await getRegistroByData('2026-05-07')
    expect(reg?.data).toBe('2026-05-07')
  })

  it('getRegistroByData returns null when no match', async () => {
    mockGetCollection.mockResolvedValue([REG_FAKE])
    const reg = await getRegistroByData('2099-01-01')
    expect(reg).toBeNull()
  })

  it('createRegistro calls addDocument and returns id', async () => {
    mockAddDocument.mockResolvedValue('reg-id')
    const { id: _id, ...regInput } = REG_FAKE
    const id = await createRegistro(regInput)
    expect(mockAddDocument).toHaveBeenCalledWith('registros_diarios', regInput)
    expect(id).toBe('reg-id')
  })

  it('updateRegistro calls updateDocument', async () => {
    mockUpdateDocument.mockResolvedValue(undefined)
    await updateRegistro('r1', { faturamento_total: 3500 })
    expect(mockUpdateDocument).toHaveBeenCalledWith('registros_diarios', 'r1', { faturamento_total: 3500 })
  })
})
