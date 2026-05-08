import { render, screen, fireEvent } from '@testing-library/react'
import { SidebarProvider } from '@/contexts/sidebar-context'
import { Sidebar } from '@/components/layout/Sidebar'

jest.mock('next/navigation', () => ({ usePathname: () => '/' }))

function Wrapper() {
  return (
    <SidebarProvider>
      <Sidebar />
    </SidebarProvider>
  )
}

describe('Sidebar', () => {
  it('renderiza links de navegação', () => {
    render(<Wrapper />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Estoque')).toBeInTheDocument()
    expect(screen.getByText('Fornecedores')).toBeInTheDocument()
  })

  it('renderiza botão de recolher', () => {
    render(<Wrapper />)
    expect(screen.getByLabelText('Recolher menu')).toBeInTheDocument()
  })

  it('botão de recolher alterna o estado ao ser clicado', () => {
    render(<Wrapper />)
    const btn = screen.getByLabelText('Recolher menu')
    fireEvent.click(btn)
    expect(screen.getByLabelText('Expandir menu')).toBeInTheDocument()
  })
})
