import { render, screen } from '@testing-library/react'
import { KpiStrip } from '@/components/dashboard/KpiStrip'

describe('KpiStrip', () => {
  it('exibe "—" quando faturamento é null', () => {
    render(<KpiStrip faturamento={null} cmv={null} totalAlertas={0} />)
    // Dois "—" (faturamento e cmv)
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2)
  })

  it('exibe faturamento formatado quando disponível', () => {
    render(<KpiStrip faturamento={4280} cmv={null} totalAlertas={0} />)
    expect(screen.getByText(/4\.280/)).toBeInTheDocument()
  })

  it('exibe CMV em %', () => {
    render(<KpiStrip faturamento={null} cmv={34} totalAlertas={0} />)
    expect(screen.getByText('34%')).toBeInTheDocument()
  })

  it('exibe totalAlertas', () => {
    render(<KpiStrip faturamento={null} cmv={null} totalAlertas={4} />)
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('CMV acima de 35 recebe classe text-warning', () => {
    const { container } = render(<KpiStrip faturamento={null} cmv={36} totalAlertas={0} />)
    const el = screen.getByText('36%')
    expect(el.className).toContain('text-warning')
  })

  it('CMV igual a 35 não recebe classe text-warning', () => {
    render(<KpiStrip faturamento={null} cmv={35} totalAlertas={0} />)
    const el = screen.getByText('35%')
    expect(el.className).not.toContain('text-warning')
  })

  it('zero alertas não recebe classe text-warning', () => {
    render(<KpiStrip faturamento={null} cmv={null} totalAlertas={0} />)
    const el = screen.getByText('0')
    expect(el.className).not.toContain('text-warning')
  })
})
