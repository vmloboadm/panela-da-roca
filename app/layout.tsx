import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Nav }    from '@/components/layout/Nav'

export const metadata: Metadata = {
  title: 'Panela da Roça — Sistema Inteligente',
  description: 'Gestão inteligente de compras, estoque e custos',
  manifest: '/manifest.json',
}

export const viewport = {
  themeColor: '#0f1117',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <Nav />
        <main className="px-6 py-[22px] max-w-[1100px] mx-auto">
          {children}
        </main>
      </body>
    </html>
  )
}
