// A minimal locale root layout until the shell (S2) lands on feat/site-shell; the shell's layout replaces it.
import '../../globals.css'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { TopClassProvider } from 'topclassui/provider'
import { ThemeScript } from 'topclassui/theme'

import { DIRECTION, LOCALES, isLocale } from '../../../lib/locales'
import { SITE_URL } from '../../../lib/site'

export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export const metadata: Metadata = { metadataBase: new URL(SITE_URL) }

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return (
    <html lang={locale} dir={DIRECTION[locale]} data-theme="dark" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-page text-body">
        <TopClassProvider direction={DIRECTION[locale]} locale={locale}>
          <main id="main" className="mx-auto grid w-full max-w-[59rem] min-w-0 gap-8 px-4 pt-9 pb-14 md:px-10.75">{children}</main>
        </TopClassProvider>
      </body>
    </html>
  )
}
