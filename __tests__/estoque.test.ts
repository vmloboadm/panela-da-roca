import { salvarEntrada, salvarPerda, getProdutos } from '@/lib/services/estoque'
import { addDocument, updateDocument, getCollection } from '@/lib/firestore'
import { Produto } from '@/types'

jest.mock('@/lib/firestore')
const mockAdd = addDocument as jest.MockedFunction<typeof addDocument>
const mockUpdate = updateDocument as jest.MockedFunction<typeof updateDocument>
const mockGet = getCollection as jest.MockedFunction<typeof getCollection>

const mockProduto: Produto = {
  id: 'prod-1',
  nome: 'Frango',
  categoria: 'Aves',
  unidade_padrao: 'kg',
  estoque_atual: 10,
  estoque_minimo: 5,
  custo_medio: 12.00,
  ativo: true,
}

describe('estoque service', () => {
  beforeEach(() => jest.clearAllMocks())

  it('salvarEntrada chama addDocument e updateDocument com custo médio ponderado', async () => {
    mockAdd.mockResolvedValue('mov-id-1')
    const mov = {
      produto_id: 'prod-1',
      tipo: 'entrada' as const,
      quantidade: 5,
      unidade: 'kg',
      custo_unitario: 14.00,
      fornecedor_id: '',
      origem: 'foto_nota' as const,
      confianca: 'confirmado' as const,
      ia_pre_preenchido: true,
      data: '2026-04-27',
    }
    await salvarEntrada(mov, mockProduto)

    expect(mockAdd).toHaveBeenCalledWith('movimentacoes_estoque', mov)
    // custo_medio = (10 * 12 + 5 * 14) / (10 + 5) = (120 + 70) / 15 = 190/15 ≈ 12.67
    const chamadaUpdate = mockUpdate.mock.calls[0]
    expect(chamadaUpdate[0]).toBe('produtos')
    expect(chamadaUpdate[1]).toBe('prod-1')
    expect(chamadaUpdate[2].estoque_atual).toBeCloseTo(15)
    expect(chamadaUpdate[2].custo_medio).toBeCloseTo(12.67, 1)
  })

  it('salvarEntrada com estoque zero usa só o novo preço como custo_medio', async () => {
    mockAdd.mockResolvedValue('mov-id-2')
    const produtoVazio = { ...mockProduto, estoque_atual: 0, custo_medio: 0 }
    const mov = {
      produto_id: 'prod-1',
      tipo: 'entrada' as const,
      quantidade: 10,
      unidade: 'kg',
      custo_unitario: 15.00,
      fornecedor_id: '',
      origem: 'manual' as const,
      confianca: 'confirmado' as const,
      ia_pre_preenchido: false,
      data: '2026-04-27',
    }
    await salvarEntrada(mov, produtoVazio)

    const chamadaUpdate = mockUpdate.mock.calls[0]
    expect(chamadaUpdate[2].custo_medio).toBeCloseTo(15.00)
    expect(chamadaUpdate[2].estoque_atual).toBeCloseTo(10)
  })

  it('salvarPerda reduz estoque e não vai abaixo de zero', async () => {
    mockAdd.mockResolvedValue('mov-id-3')
    const mov = {
      produto_id: 'prod-1',
      tipo: 'perda' as const,
      quantidade: 99,
      unidade: 'kg',
      origem: 'perda_manual' as const,
      confianca: 'confirmado' as const,
      ia_pre_preenchido: false,
      data: '2026-04-27',
    }
    await salvarPerda(mov, mockProduto)

    const chamadaUpdate = mockUpdate.mock.calls[0]
    expect(chamadaUpdate[2].estoque_atual).toBe(0)
  })

  it('getProdutos retorna lista ordenada', async () => {
    const mockProds = [mockProduto]
    mockGet.mockResolvedValue(mockProds as any)
    const result = await getProdutos()
    expect(result).toHaveLength(1)
    expect(result[0].nome).toBe('Frango')
  })
})
