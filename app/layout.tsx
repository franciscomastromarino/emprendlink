import type { Metadata, Viewport } from 'next'
import { Montserrat } from 'next/font/google'
import { Providers } from './providers'
import { Navbar } from '@/components/navbar'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'EmprendLink (no oficial)',
  description: 'Networking para miembros de EmprendLink (no oficial)',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EmprendLink',
  },
  openGraph: {
    title: 'EmprendLink (no oficial)',
    description: 'Conectá con emprendedores de tu comunidad',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#2E5EA6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={montserrat.variable}>
      <body suppressHydrationWarning style={{ background: '#FFFFFF' }}>
        <Providers>
          {children}
          <Navbar />
        </Providers>
      </body>
    </html>
  )
}
