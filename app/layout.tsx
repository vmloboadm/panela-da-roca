import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SidebarProvider } from '@/contexts/sidebar-context'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MainContent } from '@/components/layout/MainContent'

export const metadata: Metadata = {
  title: 'Panela da Roça — Sistema Inteligente',
  description: 'Gestão inteligente de compras, estoque e custos',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: '/logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#111318',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-bg-base text-text-primary min-h-screen">
        <SidebarProvider>
          <Sidebar />
          {/* Main content shifted right on desktop to account for sidebar */}
          <MainContent>
            <Header />
            <main className="p-4 md:p-6">
              {children}
            </main>
          </MainContent>
        </SidebarProvider>
      </body>
    </html>
  )
}
