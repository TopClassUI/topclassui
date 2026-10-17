// createMetadata (docs-site S6): title, description, canonical, the hreflang alternates, Open Graph and the Twitter card.
import type { Metadata } from 'next'

import { LOCALES, hrefOf, type Locale, type PageEntry } from '../content/pages'
import { labelsFor } from '../labels/index'

/** The title a page carries in a locale: Home has its own, a guide page "{Title} - TopClass UI". */
export function titleOf(entry: PageEntry, locale: Locale): string {
  const labels = labelsFor(locale)
  return entry.kind === 'home' ? labels.meta.homeTitle : labels.meta.guideTitle(entry.title[locale])
}

/** en, ar and x-default (the English URL), each the same page in that language. */
export function alternatesOf(entry: Pick<PageEntry, 'path'>): Record<string, string> {
  return {
    ...Object.fromEntries(LOCALES.map((locale) => [locale, hrefOf(entry, locale)])),
    'x-default': hrefOf(entry, 'en'),
  }
}

export function createMetadata(entry: PageEntry, locale: Locale): Metadata {
  const title = titleOf(entry, locale)
  const description = entry.description[locale]
  const url = hrefOf(entry, locale)
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages: alternatesOf(entry) },
    openGraph: {
      type: entry.kind === 'home' ? 'website' : 'article',
      url,
      title,
      description,
      siteName: labelsFor(locale).meta.siteName,
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      alternateLocale: locale === 'ar' ? ['en_US'] : ['ar_SA'],
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}
