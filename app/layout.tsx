import type { Metadata, Viewport } from 'next'
import { AppProvider } from '@/components/AppProvider'
import { Shell } from '@/components/Shell'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'myoptomcompanion', template: '%s · myoptomcompanion' },
  description: 'A study companion for UK optometry students.',
  applicationName: 'myoptomcompanion',
  appleWebApp: { capable: true, title: 'myoptomcompanion', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#f6f7f9',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Amiri:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppProvider>
          <Shell>{children}</Shell>
        </AppProvider>
      </body>
    </html>
  )
}
