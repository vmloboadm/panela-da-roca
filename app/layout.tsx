import type { Metadata } from 'next'
import './globals.css'
import { Header }    from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

export const metadata: Metadata = {
  title: 'Panela da Roça — Sistema Inteligente',
  description: 'Gestão inteligente de compras, estoque e custos',
  manifest: '/manifest.json',
}

export const viewport = {
  themeColor: '#FFF8F0',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg-page">
        <Header />
        <main className="px-4 py-4 max-w-[1100px] mx-auto pb-20">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
