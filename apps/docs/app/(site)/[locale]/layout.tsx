// First, so globals.css's <link> leads next/font's: over HTTP/1.1 the first stylesheet reuses the connection the HTML warmed (DECISIONS 2026-10-22).
import '../../globals.css'

import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { ThemeScript } from 'topclassui/theme'

import { LOCALES, isLocale } from '../../../content/pages'
import { TopClassProvider } from '../../../components/shell/provider-island'
import { SkipLink } from '../../../components/shell/skip-link'
import { DIRECTION, labelsFor } from '../../../labels/index'
import { ARABIC_PRELOAD_SCRIPT } from '../../../lib/arabic-preload'
import { FACTS } from '../../../lib/data'
import { fontClassOf } from '../../../lib/fonts'
import { SITE_URL } from '../../../lib/site'

export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: FACTS.page.dark },
    { media: '(prefers-color-scheme: light)', color: FACTS.page.light },
  ],
}

/** The root layout: html lang, dir and data-theme from the route, never read in an effect (R-13-1, PLAN 15.3). */
export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const labels = labelsFor(locale)
  return (
    <html lang={locale} dir={DIRECTION[locale]} data-theme="dark" suppressHydrationWarning className={fontClassOf(locale)}>
      <head>
        <ThemeScript />
        {locale === 'ar' ? <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: ARABIC_PRELOAD_SCRIPT }} /> : null}
      </head>
      <body className="min-h-dvh bg-page font-sans text-body antialiased">
        <SkipLink label={labels.shell.skip} />
        <TopClassProvider direction={DIRECTION[locale]} locale={locale}>
          {children}
        </TopClassProvider>
        {/* Vercel serves this script on its own deployments only; on next start it would answer 404. */}
        {process.env['VERCEL'] === '1' ? <SpeedInsights /> : null}
      </body>
    </html>
  )
}
