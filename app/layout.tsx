import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Munin — Sovereign Infrastructure Orchestration',
  description: 'Decision support for critical infrastructure. Discovers cross-sector dependencies. Compresses crisis authorization from hours to minutes. Post-quantum cryptography. Byzantine multi-ministry approval.',
  openGraph: {
    title: 'Munin — Sovereign Infrastructure Orchestration',
    description: 'Decision support for critical infrastructure. Discovers cross-sector dependencies invisible to existing systems. Compresses crisis authorization from hours to minutes.',
    type: 'website',
    siteName: 'Munin',
    url: 'https://munin-site.vercel.app',
  },
  metadataBase: new URL('https://munin-site.vercel.app'),
  twitter: {
    card: 'summary_large_image',
    title: 'Munin — Sovereign Infrastructure Orchestration',
    description: 'Discovers cross-sector infrastructure dependencies. Compresses crisis authorization from hours to minutes.',
  },
  robots: 'index, follow',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
