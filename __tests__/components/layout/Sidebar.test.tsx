import { useEffect } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { SidebarProvider, useSidebar } from '@/lib/context/sidebar-context'
import { Sidebar } from '@/components/layout/Sidebar'

jest.mock('next/navigation', () => ({ usePathname: () => '/' }))

// Abre o sidebar ao montar — imports no topo, hooks no nível do componente
function OpenHelper() {
  const { openSidebar } = useSidebar()
  useEffect(() => { openSidebar() }, [openSidebar])
  return null
}

function Wrapper({ open = false }: { open?: boolean }) {
  return (
    <SidebarProvider>
      {open && <OpenHelper />}
      <Sidebar />
    </SidebarProvider>
  )
}

describe('Sidebar', () => {
  it('não renderiza quando fechado', () => {
    render(<Wrapper open={false} />)
    expect(screen.queryByRole('navigation')).toBeNull()
  })

  it('renderiza links de navegação quando aberto', () => {
    render(<Wrapper open={true} />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Estoque')).toBeInTheDocument()
    expect(screen.getByText('Fornecedores')).toBeInTheDocument()
  })

  it('fecha ao clicar no overlay', () => {
    render(<Wrapper open={true} />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('presentation'))  // overlay aria-hidden div
    expect(screen.queryByRole('navigation')).toBeNull()
  })
})
