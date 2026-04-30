import { render, screen } from '@testing-library/react'
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
})
