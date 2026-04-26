import { lerMidia, fileToBase64 } from '@/lib/services/leitura-ia'

// Mock do fetch global
global.fetch = jest.fn()
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('leitura-ia service', () => {
  beforeEach(() => jest.clearAllMocks())

  it('lerMidia chama /api/gemini/leitura e retorna LeituraIAResultado', async () => {
    const mockResultado = {
      itens: [{ nome_original: 'Frango', nome_normalizado: 'Frango', preco_unitario: 12.90, unidade: 'kg', quantidade: null, fornecedor: null, confianca: 'alta', observacao: null }],
      tipo_documento: 'folheto',
      data_documento: null,
      fornecedor_principal: null,
      observacao_geral: null,
    }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResultado,
    } as Response)

    const resultado = await lerMidia('base64string', 'image/jpeg')
    expect(mockFetch).toHaveBeenCalledWith('/api/gemini/leitura', expect.objectContaining({
      method: 'POST',
    }))
    expect(resultado.itens).toHaveLength(1)
    expect(resultado.itens[0].preco_unitario).toBe(12.90)
  })

  it('lerMidia lança erro quando API retorna erro', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Erro da API' }),
    } as Response)

    await expect(lerMidia('base64', 'image/jpeg')).rejects.toThrow('Erro da API')
  })

  it('fileToBase64 converte File para base64 string', async () => {
    const content = 'hello'
    const file = new File([content], 'test.txt', { type: 'text/plain' })
    const base64 = await fileToBase64(file)
    expect(typeof base64).toBe('string')
    expect(base64.length).toBeGreaterThan(0)
  })
})
