import { getStatusEstoque } from '@/utils/estoque-status'

describe('getStatusEstoque', () => {
  it('retorna OK quando estoque_minimo é 0', () => {
    expect(getStatusEstoque(0, 0)).toBe('OK')
  })

  it('retorna CRITICO quando atual < 50% do mínimo', () => {
    expect(getStatusEstoque(0.9, 2)).toBe('CRITICO')  // 0.9 < 2 * 0.5 = 1.0
    expect(getStatusEstoque(0, 2)).toBe('CRITICO')
  })

  it('retorna BAIXO quando entre 50% e 100% do mínimo', () => {
    expect(getStatusEstoque(1.5, 2)).toBe('BAIXO')   // 1.5 >= 1.0 e 1.5 < 2
    expect(getStatusEstoque(1.0, 2)).toBe('BAIXO')   // exatamente 50%
  })

  it('retorna OK quando atual >= mínimo', () => {
    expect(getStatusEstoque(2, 2)).toBe('OK')
    expect(getStatusEstoque(5, 2)).toBe('OK')
  })
})
