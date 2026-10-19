// The changelog's Open Graph image, one per locale, made at build time.
import { notFound } from 'next/navigation'

import { LIVE_PAGES, LOCALES, hrefOf, isLocale } from '../../../../content/pages'
import { OG_SIZE, OG_TYPE, ogImage, ogLineOf } from '../../../../lib/og'
import { VERSION } from '../../../../lib/site'

export const size = OG_SIZE
export const contentType = OG_TYPE
export const alt = 'The TopClass UI changelog'
export const dynamicParams = false

export function generateStaticParams() {
  return LIVE_PAGES.some((page) => page.kind === 'changelog') ? LOCALES.map((locale) => ({ locale })) : []
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : 'en'
  const entry = LIVE_PAGES.find((page) => page.kind === 'changelog')
  if (entry === undefined) notFound()
  return ogImage({ name: entry.title.en, chip: `v${VERSION}`, line: ogLineOf(locale, hrefOf(entry, locale), entry.description.en) })
}
