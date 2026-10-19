// One Open Graph image per guide page per locale, made at build time.
import { notFound } from 'next/navigation'

import { LIVE_GUIDES, LOCALES, hrefOf, isLocale } from '../../../../../content/pages'
import { labelsFor } from '../../../../../labels/index'
import { OG_SIZE, OG_TYPE, ogImage, ogLineOf } from '../../../../../lib/og'

export const size = OG_SIZE
export const contentType = OG_TYPE
export const alt = 'A TopClass UI guide'
export const dynamicParams = false

// Both segments: an image route is not handed the locale layout's params.
export function generateStaticParams() {
  return LOCALES.flatMap((locale) => LIVE_GUIDES.map((page) => ({ locale, page: page.slug })))
}

export default async function Image({ params }: { params: Promise<{ locale: string; page: string }> }) {
  const { locale: raw, page } = await params
  const locale = isLocale(raw) ? raw : 'en'
  const entry = LIVE_GUIDES.find((guide) => guide.slug === page)
  if (entry === undefined) notFound()
  // The English chip on both: Satori cannot shape Arabic (lib/og.tsx).
  return ogImage({
    name: entry.title.en,
    chip: labelsFor('en').shell.groups[entry.group],
    line: ogLineOf(locale, hrefOf(entry, locale), entry.description.en),
  })
}
