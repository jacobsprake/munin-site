import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Munin Systems — Sovereign Orchestration for Critical Infrastructure',
  description: 'Decision support for critical infrastructure operators. Discovers cross-sector dependencies invisible to existing systems. Compresses crisis authorisation from hours to minutes. EU AI Act Article 14 compliant.',
  openGraph: {
    title: 'Munin Systems — Sovereign Orchestration for Critical Infrastructure',
    description: 'Decision support for critical infrastructure operators. Discovers cross-sector dependencies invisible to existing systems. Compresses crisis authorisation from hours to minutes.',
    type: 'website',
    siteName: 'Munin Systems',
    url: 'https://muninsystems.com',
  },
  metadataBase: new URL('https://muninsystems.com'),
  twitter: {
    card: 'summary_large_image',
    title: 'Munin Systems — Sovereign Orchestration for Critical Infrastructure',
    description: 'Discovers cross-sector infrastructure dependencies. Compresses crisis authorisation from hours to minutes.',
  },
  robots: 'index, follow',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
