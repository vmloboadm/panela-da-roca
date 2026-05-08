import { render, screen, fireEvent } from '@testing-library/react'
import { AppShell } from '@/components/layout/AppShell'

jest.mock('next/navigation', () => ({ usePathname: () => '/' }))
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}))

describe('AppShell', () => {
  it('renderiza o conteúdo filho', () => {
    render(<AppShell><p>conteúdo teste</p></AppShell>)
    expect(screen.getByText('conteúdo teste')).toBeInTheDocument()
  })

  it('renderiza o Header', () => {
    render(<AppShell><span /></AppShell>)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renderiza a sidebar com links de navegação', () => {
    render(<AppShell><span /></AppShell>)
    expect(screen.getByRole('complementary')).toBeInTheDocument()
    expect(screen.getByText('Estoque')).toBeInTheDocument()
    expect(screen.getByText('Fornecedores')).toBeInTheDocument()
  })

  it('botão recolher alterna o aria-label da sidebar', () => {
    render(<AppShell><span /></AppShell>)
    const collapseBtn = screen.getByLabelText('Recolher menu')
    fireEvent.click(collapseBtn)
    expect(screen.getByLabelText('Expandir menu')).toBeInTheDocument()
  })
})
