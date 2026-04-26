import { getCotacoesPorProduto, saveCotacao } from '@/lib/services/cotacoes'
import { addDocument, getCollection } from '@/lib/firestore'

jest.mock('@/lib/firestore')
const mockAddDocument = addDocument as jest.MockedFunction<typeof addDocument>
const mockGetCollection = getCollection as jest.MockedFunction<typeof getCollection>

describe('cotacoes service', () => {
  beforeEach(() => jest.clearAllMocks())

  it('saveCotacao chama addDocument com dados corretos', async () => {
    mockAddDocument.mockResolvedValue('cotacao-id-123')
    const input = {
      produto_id: 'prod-1',
      fornecedor_id: 'forn-1',
      preco: 15.90,
      unidade: 'kg',
      fonte: 'manual' as const,
      confianca: 'alta' as const,
      data: '2026-04-26',
    }
    const id = await saveCotacao(input)
    expect(mockAddDocument).toHaveBeenCalledWith('cotacoes', input)
    expect(id).toBe('cotacao-id-123')
  })

  it('getCotacoesPorProduto retorna cotações filtradas por produto_id', async () => {
    const mockCotacoes = [
      { id: '1', produto_id: 'prod-1', preco: 15.90, fornecedor_id: 'forn-1', unidade: 'kg', fonte: 'manual', confianca: 'alta', data: '2026-04-26' },
      { id: '2', produto_id: 'prod-1', preco: 14.50, fornecedor_id: 'forn-2', unidade: 'kg', fonte: 'varredura_ia', confianca: 'media', data: '2026-04-25' },
    ]
    mockGetCollection.mockResolvedValue(mockCotacoes as any)
    const result = await getCotacoesPorProduto('prod-1')
    expect(result).toHaveLength(2)
    expect(result[0].produto_id).toBe('prod-1')
  })

  it('getCotacoesPorProduto retorna array vazio quando não há cotações', async () => {
    mockGetCollection.mockResolvedValue([])
    const result = await getCotacoesPorProduto('prod-inexistente')
    expect(result).toEqual([])
  })
})
