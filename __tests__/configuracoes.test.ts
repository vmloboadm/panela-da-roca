jest.mock('@/lib/firestore', () => ({
  getDocument:    jest.fn(),
  updateDocument: jest.fn(),
}))

import { getConfiguracoes, updateConfiguracoes } from '@/lib/services/configuracoes'
import { getDocument, updateDocument } from '@/lib/firestore'

const mockGetDocument    = getDocument    as jest.MockedFunction<typeof getDocument>
const mockUpdateDocument = updateDocument as jest.MockedFunction<typeof updateDocument>

describe('configuracoes service', () => {
  beforeEach(() => jest.clearAllMocks())

  it('getConfiguracoes reads from configuracoes/geral', async () => {
    const mockData = { meta_dia_util: 2500, meta_domingo: 5000 }
    mockGetDocument.mockResolvedValue(mockData)
    const result = await getConfiguracoes()
    expect(mockGetDocument).toHaveBeenCalledWith('configuracoes', 'geral')
    expect(result).toEqual(mockData)
  })

  it('updateConfiguracoes writes to configuracoes/geral', async () => {
    mockUpdateDocument.mockResolvedValue(undefined)
    await updateConfiguracoes({ meta_dia_util: 3000 })
    expect(mockUpdateDocument).toHaveBeenCalledWith('configuracoes', 'geral', { meta_dia_util: 3000 })
  })
})
