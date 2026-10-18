import type { Metadata } from 'next'
import { Inter, Noto_Sans_Arabic } from 'next/font/google'

import { TEXT_LINK } from '../components/classes'
import { ar } from '../labels/ar'
import { en } from '../labels/en'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-inter', display: 'swap' })
const notoArabic = Noto_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '600'], variable: '--font-noto-arabic', display: 'swap', preload: false })

export const metadata: Metadata = {
  title: en.meta.notFoundTitle,
  robots: { index: false },
}

/** A URL outside both root layouts, such as /fr/x or /random (docs-site page 20). The page cannot know the reader's
 * language, so it says it once in each, with a link to each Home. */
export default function GlobalNotFound() {
  return (
    <html lang="en" dir="ltr" data-theme="dark" className={`${inter.variable} ${notoArabic.variable}`}>
      <body className="min-h-dvh bg-page font-sans text-body">
        <main className="mx-auto flex max-w-(--docs-column) flex-col gap-10 px-4 py-16">
          <div className="flex flex-col items-start gap-3">
            <h1 className="text-4xl font-semibold">{en.notFound.title}</h1>
            <a href="/en" className={TEXT_LINK}>{en.notFound.home}</a>
          </div>
          <div lang="ar" dir="rtl" className="flex flex-col items-start gap-3">
            <p className="text-2xl font-semibold">{ar.notFound.title}</p>
            <a href="/ar" className={TEXT_LINK}>{ar.notFound.home}</a>
          </div>
        </main>
      </body>
    </html>
  )
}
