import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_Arabic } from 'next/font/google'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { ThemeScript } from 'topclassui/theme'

import { LOCALES, isLocale } from '../../../content/pages'
import { TopClassProvider } from '../../../components/shell/provider-island'
import { SkipLink } from '../../../components/shell/skip-link'
import { DIRECTION, labelsFor } from '../../../labels/index'
import { FACTS } from '../../../lib/data'
import { SITE_URL } from '../../../lib/site'
import '../../globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter', display: 'swap' })
// PLAN 14: only Inter is preloaded. On /en the Arabic sample of Home falls back to the system font, so its 160 KB never loads there.
const notoArabic = Noto_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600'], variable: '--font-noto-arabic', display: 'swap', preload: false })

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
    <html lang={locale} dir={DIRECTION[locale]} data-theme="dark" suppressHydrationWarning className={locale === 'ar' ? `${inter.variable} ${notoArabic.variable}` : inter.variable}>
      <head>
        <ThemeScript />
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
