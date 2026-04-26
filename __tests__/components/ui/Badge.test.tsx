import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/Badge'

describe('Badge', () => {
  it('renderiza o texto', () => {
    render(<Badge color="#16a34a">alta</Badge>)
    expect(screen.getByText('alta')).toBeInTheDocument()
  })
})
