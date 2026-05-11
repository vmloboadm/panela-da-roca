// IMPORTANT: jest.mock MUST come before all imports
jest.mock('@/lib/firestore', () => ({
  getDocument: jest.fn(),
  updateDocument: jest.fn(),
  setDocument: jest.fn(),
  addDocument: jest.fn(),
  getCollection: jest.fn(),
  deleteDocument: jest.fn(),
}))

import { getDocument, updateDocument, setDocument } from '@/lib/firestore'
import { runMigrations, runFullSeed } from '@/lib/seed'

const mockGetDocument = getDocument as jest.Mock
const mockUpdateDocument = updateDocument as jest.Mock
const mockSetDocument = setDocument as jest.Mock

describe('seed v3 migrations', () => {
  beforeEach(() => jest.clearAllMocks())

  it('runs migration when version < 3', async () => {
    mockGetDocument.mockResolvedValue({ version: 2 })
    mockSetDocument.mockResolvedValue(undefined)
    mockUpdateDocument.mockResolvedValue(undefined)
    await runMigrations()
    expect(mockSetDocument).toHaveBeenCalled()
    expect(mockUpdateDocument).toHaveBeenCalledWith('_meta', 'seed', { version: 3 })
  })

  it('skips migration when version >= 3', async () => {
    mockGetDocument.mockResolvedValue({ version: 3 })
    await runMigrations()
    expect(mockSetDocument).not.toHaveBeenCalled()
    expect(mockUpdateDocument).not.toHaveBeenCalled()
  })

  it('seeds representantes on first-time install (runFullSeed)', async () => {
    mockGetDocument.mockResolvedValue(null)
    mockSetDocument.mockResolvedValue(undefined)
    mockUpdateDocument.mockResolvedValue(undefined)
    ;(require('@/lib/firestore').addDocument as jest.Mock).mockResolvedValue('id')
    ;(require('@/lib/firestore').getCollection as jest.Mock).mockResolvedValue([])
    await runFullSeed()
    expect(mockSetDocument).toHaveBeenCalled()
  })
})
