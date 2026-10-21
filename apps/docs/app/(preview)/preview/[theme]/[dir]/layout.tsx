// The second root layout (S9): one demo on the page background, no shell, noindex, theme and direction from the address.
import '../../../../globals.css'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { TopClassProvider } from 'topclassui/provider'

import { geistMono } from '../../../../../lib/fonts'
import { PREVIEW_DIRS, PREVIEW_LANG, PREVIEW_THEMES, isPreviewDir, isPreviewTheme } from '../../../../../lib/preview'

export const dynamicParams = false

export function generateStaticParams() {
  return PREVIEW_THEMES.flatMap((theme) => PREVIEW_DIRS.map((dir) => ({ theme, dir })))
}

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function PreviewLayout({ children, params }: { children: ReactNode; params: Promise<{ theme: string; dir: string }> }) {
  const { theme, dir } = await params
  if (!isPreviewTheme(theme) || !isPreviewDir(dir)) notFound()
  return (
    <html lang={PREVIEW_LANG[dir]} dir={dir} data-theme={theme} className={geistMono.variable}>
      <body className="bg-page text-body">
        <TopClassProvider direction={dir} locale={PREVIEW_LANG[dir]}>
          <main className="p-8">{children}</main>
        </TopClassProvider>
      </body>
    </html>
  )
}
