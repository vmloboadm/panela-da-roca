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
})
