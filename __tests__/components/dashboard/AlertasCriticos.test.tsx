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
    const baixo: Produto = { ...base, id: '2', nome: 'Costela', estoque_atual: 1.2 }
    render(<AlertasCriticos produtosAbaixoMinimo={[baixo]} />)
    expect(screen.getByText(/estoque baixo/i)).toBeInTheDocument()
  })
})
