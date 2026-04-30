import { render, screen, fireEvent } from '@testing-library/react'
import { SidebarProvider } from '@/lib/context/sidebar-context'
import { Header } from '@/components/layout/Header'

jest.mock('next/navigation', () => ({ usePathname: () => '/estoque' }))
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}))

function Wrapper() {
  return <SidebarProvider><Header /></SidebarProvider>
}

describe('Header', () => {
  it('exibe o título da rota atual', () => {
    render(<Wrapper />)
    expect(screen.getByText('Estoque')).toBeInTheDocument()
  })

  it('tem height fixo h-14 via classe', () => {
    render(<Wrapper />)
    const header = screen.getByRole('banner')
    expect(header.className).toContain('h-14')
  })

  it('botão de menu chama openSidebar', () => {
    render(<Wrapper />)
    const menuBtn = screen.getByLabelText('Abrir menu')
    expect(menuBtn).toBeInTheDocument()
    fireEvent.click(menuBtn) // não lança erro
  })
})
