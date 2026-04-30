import { render, screen, fireEvent } from '@testing-library/react'
import { SidebarProvider, useSidebar } from '@/lib/context/sidebar-context'

function Probe() {
  const { isOpen, openSidebar, closeSidebar } = useSidebar()
  return (
    <div>
      <span data-testid="state">{isOpen ? 'open' : 'closed'}</span>
      <button onClick={openSidebar}>abrir</button>
      <button onClick={closeSidebar}>fechar</button>
    </div>
  )
}

describe('SidebarContext', () => {
  it('começa fechado', () => {
    render(<SidebarProvider><Probe /></SidebarProvider>)
    expect(screen.getByTestId('state')).toHaveTextContent('closed')
  })

  it('abre ao chamar openSidebar', () => {
    render(<SidebarProvider><Probe /></SidebarProvider>)
    fireEvent.click(screen.getByText('abrir'))
    expect(screen.getByTestId('state')).toHaveTextContent('open')
  })

  it('fecha ao chamar closeSidebar', () => {
    render(<SidebarProvider><Probe /></SidebarProvider>)
    fireEvent.click(screen.getByText('abrir'))
    fireEvent.click(screen.getByText('fechar'))
    expect(screen.getByTestId('state')).toHaveTextContent('closed')
  })
})
