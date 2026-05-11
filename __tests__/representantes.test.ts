// IMPORTANT: jest.mock MUST come before all imports
jest.mock('@/lib/firestore', () => ({
  getCollection: jest.fn(),
  getDocument: jest.fn(),
  addDocument: jest.fn(),
  setDocument: jest.fn(),
  updateDocument: jest.fn(),
  deleteDocument: jest.fn(),
}))

import { getCollection, getDocument, addDocument, updateDocument, deleteDocument } from '@/lib/firestore'
import {
  getRepresentantes,
  getRepresentante,
  createRepresentante,
  updateRepresentante,
  deleteRepresentante,
} from '@/lib/services/representantes'

const mockGetCollection = getCollection as jest.Mock
const mockGetDocument = getDocument as jest.Mock
const mockAddDocument = addDocument as jest.Mock
const mockUpdateDocument = updateDocument as jest.Mock
const mockDeleteDocument = deleteDocument as jest.Mock

const REP_FAKE = { id: 'rep1', empresa: 'Minerva Foods', ativo: true }

describe('representantes service', () => {
  beforeEach(() => jest.clearAllMocks())

  it('getRepresentantes calls getCollection("representantes")', async () => {
    mockGetCollection.mockResolvedValue([REP_FAKE])
    const result = await getRepresentantes()
    expect(mockGetCollection).toHaveBeenCalledWith('representantes')
    expect(result).toHaveLength(1)
  })

  it('getRepresentante calls getDocument with correct id', async () => {
    mockGetDocument.mockResolvedValue(REP_FAKE)
    const result = await getRepresentante('rep1')
    expect(mockGetDocument).toHaveBeenCalledWith('representantes', 'rep1')
    expect(result?.empresa).toBe('Minerva Foods')
  })

  it('createRepresentante calls addDocument and returns id', async () => {
    mockAddDocument.mockResolvedValue('new-id')
    const id = await createRepresentante({ empresa: 'BRF', ativo: true })
    expect(mockAddDocument).toHaveBeenCalledWith('representantes', { empresa: 'BRF', ativo: true })
    expect(id).toBe('new-id')
  })

  it('updateRepresentante calls updateDocument', async () => {
    mockUpdateDocument.mockResolvedValue(undefined)
    await updateRepresentante('rep1', { nome: 'João' })
    expect(mockUpdateDocument).toHaveBeenCalledWith('representantes', 'rep1', { nome: 'João' })
  })

  it('deleteRepresentante calls deleteDocument', async () => {
    mockDeleteDocument.mockResolvedValue(undefined)
    await deleteRepresentante('rep1')
    expect(mockDeleteDocument).toHaveBeenCalledWith('representantes', 'rep1')
  })
})
