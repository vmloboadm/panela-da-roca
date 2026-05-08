import { render, screen, fireEvent } from '@testing-library/react'
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-context'

function Probe() {
  const { collapsed, toggleCollapse } = useSidebar()
  return (
    <div>
      <span data-testid="state">{collapsed ? 'collapsed' : 'expanded'}</span>
      <button onClick={toggleCollapse}>toggle</button>
    </div>
  )
}

describe('SidebarContext', () => {
  beforeEach(() => localStorage.clear())

  it('começa expandido', () => {
    render(<SidebarProvider><Probe /></SidebarProvider>)
    expect(screen.getByTestId('state')).toHaveTextContent('expanded')
  })

  it('recolhe ao chamar toggleCollapse', () => {
    render(<SidebarProvider><Probe /></SidebarProvider>)
    fireEvent.click(screen.getByText('toggle'))
    expect(screen.getByTestId('state')).toHaveTextContent('collapsed')
  })

  it('expande novamente ao chamar toggleCollapse uma segunda vez', () => {
    render(<SidebarProvider><Probe /></SidebarProvider>)
    fireEvent.click(screen.getByText('toggle'))
    fireEvent.click(screen.getByText('toggle'))
    expect(screen.getByTestId('state')).toHaveTextContent('expanded')
  })
})
