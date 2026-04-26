import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'

export default function DashboardPage() {
  return (
    <div className="fadein">
      <Card className="mb-5">
        <SectionTitle icon="🏠">Dashboard</SectionTitle>
        <p className="text-text-muted text-sm">
          Sistema Panela da Roça rodando com sucesso. 🎉
        </p>
        <p className="text-text-faint text-xs mt-2">
          Módulos sendo construídos — volte em breve.
        </p>
      </Card>
    </div>
  )
}
