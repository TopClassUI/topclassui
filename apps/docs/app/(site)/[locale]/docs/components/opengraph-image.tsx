// The catalog's Open Graph image, one per locale, made at build time.
import { labelsFor } from '../../../../../labels/index'
import { pagedComponents } from '../../../../../lib/components'
import { LOCALES, isLocale } from '../../../../../lib/locales'
import { OG_SIZE, OG_TYPE, ogImage, ogLineOf } from '../../../../../lib/og'

export const size = OG_SIZE
export const contentType = OG_TYPE
export const alt = 'TopClass UI components'
export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : 'en'
  const cards = pagedComponents().filter((entry) => entry.card).length
  return ogImage({
    name: labelsFor('en').catalog.title,
    chip: `${String(cards)} components`,
    line: ogLineOf(locale, `/${locale}/docs/components`, labelsFor('en').catalog.description),
  })
}
