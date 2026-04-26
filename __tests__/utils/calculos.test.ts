import { custoReal, fmtBRL, kgEquivalente, cmvPercentual } from '@/utils/calculos'

describe('custoReal', () => {
  it('retorna o preço quando distância é zero', () => {
    expect(custoReal(10.0, 0)).toBe(10.0)
  })
  it('adiciona custo de frete ida e volta', () => {
    // 5km × R$1,20/km × 2 = R$12,00
    expect(custoReal(50.0, 5)).toBeCloseTo(62.0)
  })
  it('usa custo por km customizado', () => {
    expect(custoReal(10.0, 2, 2.0)).toBeCloseTo(18.0)
  })
  it('retorna apenas o preço se distância for undefined', () => {
    expect(custoReal(25.0, undefined)).toBe(25.0)
  })
})

describe('fmtBRL', () => {
  it('formata valor em reais', () => {
    expect(fmtBRL(1234.56)).toMatch(/1\.234,56/)
  })
  it('retorna traço quando valor é null', () => {
    expect(fmtBRL(null)).toBe('—')
  })
  it('retorna traço quando valor é undefined', () => {
    expect(fmtBRL(undefined)).toBe('—')
  })
})

describe('kgEquivalente', () => {
  it('calcula kg equivalente dividindo pelo preço por kg', () => {
    expect(kgEquivalente(769.0, 76.90)).toBeCloseTo(10.0)
  })
  it('retorna 0 quando faturamento é 0', () => {
    expect(kgEquivalente(0, 76.90)).toBe(0)
  })
})

describe('cmvPercentual', () => {
  it('calcula CMV corretamente', () => {
    expect(cmvPercentual(850, 2300)).toBeCloseTo(36.96, 1)
  })
  it('retorna 0 quando faturamento é 0', () => {
    expect(cmvPercentual(100, 0)).toBe(0)
  })
})
