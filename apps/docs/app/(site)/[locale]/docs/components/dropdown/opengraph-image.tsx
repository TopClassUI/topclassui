// The Dropdown page's Open Graph image, per locale, made at build time.
import { componentOgImage } from '../../../../../../lib/component-og'
import { LOCALES } from '../../../../../../lib/locales'
import { OG_SIZE, OG_TYPE } from '../../../../../../lib/og'

export const size = OG_SIZE
export const contentType = OG_TYPE
export const alt = 'A TopClass UI component'
export const dynamicParams = false

// An image route is not handed the locale layout's params.
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return componentOgImage(locale, 'dropdown')
}
