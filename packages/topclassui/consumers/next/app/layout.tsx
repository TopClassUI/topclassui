import type { ReactNode } from 'react'
import { TopClassProvider } from 'topclassui/provider'
import { ThemeScript } from 'topclassui/theme'

import './globals.css'

export const metadata = { title: 'TopClass UI consumer' }

// R-13-1: direction and locale come from the layout, never from document.dir in an effect.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <TopClassProvider direction="rtl" locale="ar">{children}</TopClassProvider>
      </body>
    </html>
  )
}
