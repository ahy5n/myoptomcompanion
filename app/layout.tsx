import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AppProvider } from '@/components/AppProvider'
import { Shell } from '@/components/Shell'
import { ThemeSync } from '@/components/useTheme'
import { THEME_SCRIPT } from '@/lib/theme'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'optom companion', template: '%s · optom companion' },
  description: 'A study companion for UK optometry students.',
  applicationName: 'optom companion',
  appleWebApp: { capable: true, title: 'optom companion', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The head script sets data-palette / data-mode before React loads.
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Amiri:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppProvider>
          <ThemeSync />
          <Shell>{children}</Shell>
        </AppProvider>
        <Analytics />
      </body>
    </html>
  )
}
