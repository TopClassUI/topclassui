// One Open Graph image per component page per locale, made at build time.
import { componentOgImage } from '../../../../../../lib/component-og'
import { LOCALES } from '../../../../../../lib/locales'
import { OG_SIZE, OG_TYPE } from '../../../../../../lib/og'
import { sharedRouteSlugs } from '../../../../../../components/component-page/component-route'

export const size = OG_SIZE
export const contentType = OG_TYPE
export const alt = 'A TopClass UI component'
export const dynamicParams = false

// Both segments: an image route is not handed the locale layout's params.
export function generateStaticParams() {
  return LOCALES.flatMap((locale) => sharedRouteSlugs().map((slug) => ({ locale, slug })))
}

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  return componentOgImage(locale, slug)
}
