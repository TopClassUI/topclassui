import { LOCALES, isLocale, pageBySlug } from '../../../content/pages'
import { labelsFor } from '../../../labels'
import { OG_SIZE, ogImage } from '../../../lib/og'
import { PRERELEASE, SITE_URL, VERSION } from '../../../lib/site'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'TopClass UI'
export const dynamicParams = false

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

/** Home's Open Graph image, one per locale, both made at build time. */
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : 'en'
  const labels = labelsFor(locale)
  const [major = '0', minor = '0'] = VERSION.split('.')
  return ogImage({
    name: labels.meta.siteName,
    chip: `v${major}.${minor}${PRERELEASE ? ' beta' : ''}`,
    line: locale === 'ar' ? `${SITE_URL.replace('https://', '')}/ar` : pageBySlug('home')?.description.en ?? '',
  })
}
