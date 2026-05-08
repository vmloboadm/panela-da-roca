import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AppShell } from '@/components/layout/AppShell'

export const metadata: Metadata = {
  title: 'Panela da Roça — Sistema Inteligente',
  description: 'Gestão inteligente de compras, estoque e custos',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#111318',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg-base text-text-primary min-h-screen">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
