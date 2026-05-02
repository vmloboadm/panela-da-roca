import { getSaudacao } from '@/utils/saudacao'

function makeDate(hour: number, dayOfWeek: number): Date {
  const d = new Date(2026, 3, 27) // segunda-feira base
  // Ajustar para o dia da semana desejado: 0=dom, 1=seg...
  d.setDate(d.getDate() + (dayOfWeek - d.getDay() + 7) % 7)
  d.setHours(hour, 0, 0, 0)
  return d
}

describe('getSaudacao', () => {
  it('retorna "Bom dia" antes das 12h', () => {
    expect(getSaudacao(makeDate(9, 1)).texto).toBe('Bom dia')
    expect(getSaudacao(makeDate(9, 1)).emoji).toBe('🌅')
  })

  it('retorna "Boa tarde" entre 12h e 17h59', () => {
    expect(getSaudacao(makeDate(14, 1)).texto).toBe('Boa tarde')
    expect(getSaudacao(makeDate(14, 1)).emoji).toBe('☀️')
  })

  it('retorna "Boa noite" a partir das 18h', () => {
    expect(getSaudacao(makeDate(20, 1)).texto).toBe('Boa noite')
    expect(getSaudacao(makeDate(20, 1)).emoji).toBe('🌙')
  })

  it('adiciona extra no domingo', () => {
    const domingo = makeDate(10, 0)
    expect(getSaudacao(domingo).extra).toBe('Dia de churrasco! 🔥')
  })

  it('sem extra em dias úteis', () => {
    const segunda = makeDate(10, 1)
    expect(getSaudacao(segunda).extra).toBeUndefined()
  })
})
