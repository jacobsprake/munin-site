import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Munin — Sovereign Infrastructure Orchestration',
  description: 'Decision support for critical infrastructure. Discovers cross-sector dependencies. Compresses authorization latency from hours to minutes.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
