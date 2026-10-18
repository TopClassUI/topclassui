// One Open Graph image per component page per locale, made at build time.
import { notFound } from 'next/navigation'

import { COMPONENT_PAGE_LABELS } from '../../../../../../labels/component-page'
import { chipOf } from '../../../../../../lib/chip'
import { pagedComponentOf, pagedComponents } from '../../../../../../lib/components'
import { LOCALES } from '../../../../../../lib/locales'
import { OG_SIZE, OG_TYPE, ogImage, ogLineOf } from '../../../../../../lib/og'

export const size = OG_SIZE
export const contentType = OG_TYPE
export const alt = 'A TopClass UI component'
export const dynamicParams = false

// Both segments: an image route is not handed the locale layout's params.
export function generateStaticParams() {
  return LOCALES.flatMap((locale) => pagedComponents().map((entry) => ({ locale, slug: entry.slug })))
}

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  const entry = pagedComponentOf(slug)
  if (entry === null) notFound()
  return ogImage({
    name: entry.content.title.en,
    chip: chipOf(entry.rendering, entry.slug, COMPONENT_PAGE_LABELS.en.chip),
    line: ogLineOf(locale, `/${locale}/docs/components/${slug}`, entry.content.description.en),
  })
}
