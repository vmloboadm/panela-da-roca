import { buildLogPayload } from '@/lib/logs'

describe('buildLogPayload', () => {
  it('cria payload com campos obrigatórios', () => {
    const payload = buildLogPayload({ acao: 'entrada_estoque', modulo: 'estoque' })
    expect(payload.acao).toBe('entrada_estoque')
    expect(payload.modulo).toBe('estoque')
    expect(payload.modo).toBe('normal')
    expect(payload.timestamp).toBeDefined()
  })

  it('detecta dispositivo mobile por userAgent', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)',
      configurable: true,
    })
    const payload = buildLogPayload({ acao: 'fechar_dia', modulo: 'financeiro' })
    expect(payload.dispositivo).toBe('mobile')
  })

  it('usa modo rapido quando informado', () => {
    const payload = buildLogPayload({ acao: 'fechar_rapido', modulo: 'financeiro', modo: 'rapido' })
    expect(payload.modo).toBe('rapido')
  })
})
