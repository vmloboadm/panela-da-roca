import { render, screen } from '@testing-library/react'
import { AlertasCriticos } from '@/components/dashboard/AlertasCriticos'
import { Produto } from '@/types'

const base: Produto = {
  id: '1', nome: 'Fraldinha', categoria: 'Carnes',
  unidade_padrao: 'kg', estoque_atual: 0.3, estoque_minimo: 2,
  custo_medio: 35, ativo: true,
}

describe('AlertasCriticos', () => {
  it('exibe "Tudo ok" quando sem alertas', () => {
    render(<AlertasCriticos produtosAbaixoMinimo={[]} />)
    expect(screen.getByText(/tudo ok/i)).toBeInTheDocument()
  })

  it('exibe produto crítico pelo nome', () => {
    render(<AlertasCriticos produtosAbaixoMinimo={[base]} />)
    expect(screen.getByText(/fraldinha/i)).toBeInTheDocument()
  })

  it('exibe mensagem de baixo estoque quando há produtos baixos', () => {
    // 1.2 >= 0.5 * 2 = 1.0 → baixo (não crítico)
    const baixo: Produto = { ...base, id: '2', nome: 'Costela', estoque_atual: 1.2 }
    render(<AlertasCriticos produtosAbaixoMinimo={[baixo]} />)
    expect(screen.getByText(/estoque baixo/i)).toBeInTheDocument()
    // Produto "baixo" NÃO deve aparecer na seção de críticos pelo nome
    expect(screen.queryByText(/costela/i)).not.toBeInTheDocument()
  })

  it('limita a 3 produtos críticos e exibe contador do restante', () => {
    // 5 produtos críticos: estoque_atual: 0.1 < 0.5 * 2 = 1.0
    const criticos = Array.from({ length: 5 }, (_, i) => ({
      ...base, id: String(i), nome: `Produto ${i}`, estoque_atual: 0.1,
    }))
    render(<AlertasCriticos produtosAbaixoMinimo={criticos} />)
    expect(screen.getByText(/e mais 2 produtos críticos/i)).toBeInTheDocument()
    expect(screen.queryByText(/produto 3/i)).not.toBeInTheDocument()
  })
})
