import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renderiza com texto correto', () => {
    render(<Button>Salvar</Button>)
    expect(screen.getByText('Salvar')).toBeInTheDocument()
  })

  it('chama onClick quando clicado', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Salvar</Button>)
    fireEvent.click(screen.getByText('Salvar'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('não chama onClick quando disabled', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick} disabled>Salvar</Button>)
    fireEvent.click(screen.getByText('Salvar'))
    expect(handleClick).not.toHaveBeenCalled()
  })
})
