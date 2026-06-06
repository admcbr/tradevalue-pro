import type { Metadata } from 'next'
import './globals.css'
import { LangProvider } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'TradeValue Pro',
  description: 'Система оцінки б/у техніки для магазинів та ломбардів.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  )
}
