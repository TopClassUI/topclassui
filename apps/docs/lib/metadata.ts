// createMetadata (docs-site S6): title, description, canonical, the hreflang alternates, Open Graph and the Twitter card.
import type { Metadata } from 'next'
// Next's own naming of an image route under a route group (a hash suffix); check:static proves every URL it gives was prerendered.
import { fillMetadataSegment } from 'next/dist/lib/metadata/get-metadata-route'

import { META_DESCRIPTIONS } from '../content/descriptions'
import { LOCALES, hrefOf, type Locale, type PageEntry } from '../content/pages'
import { labelsFor } from '../labels/index'
import { ACTION_ROUTES, type PagedComponent } from './components'

export const OG_SIZE = { width: 1200, height: 630 }

export const DESCRIPTION_MIN = 120
export const DESCRIPTION_MAX = 160

/** A registry page or a component's page: what createMetadata describes. */
export type MetaSubject = PageEntry | PagedComponent

const isPage = (subject: MetaSubject): subject is PageEntry => 'kind' in subject

/** The route of a subject without its locale: `/docs/css`, `/docs/components/button`. */
export function pathOf(subject: MetaSubject): string {
  return isPage(subject) ? subject.path : `/docs/components/${subject.slug}`
}

/** The name a page carries in a locale: its registry title, or the component's name in that language. */
export function nameOf(subject: MetaSubject, locale: Locale): string {
  return isPage(subject) ? subject.title[locale] : subject.content.title[locale]
}

/** Home has its own title; every other page, a component's included, is "{Name} - TopClass UI". */
export function titleOf(subject: MetaSubject, locale: Locale): string {
  const labels = labelsFor(locale)
  return isPage(subject) && subject.kind === 'home' ? labels.meta.homeTitle : labels.meta.guideTitle(nameOf(subject, locale))
}

/** A lead that is too short takes the longest tail that keeps it inside 120 to 160 characters. */
export function fitDescription(lead: string, tails: readonly string[]): string {
  const plain = lead.replaceAll('`', '')
  if (plain.length >= DESCRIPTION_MIN && plain.length <= DESCRIPTION_MAX) return plain
  const fitting = tails.map((tail) => `${plain}${tail}`).filter((text) => text.length >= DESCRIPTION_MIN && text.length <= DESCRIPTION_MAX)
  return fitting.at(-1) ?? plain
}

export function descriptionOf(subject: MetaSubject, locale: Locale): string {
  if (!isPage(subject)) return fitDescription(subject.content.description[locale], labelsFor(locale).meta.componentTails)
  return (META_DESCRIPTIONS as Readonly<Record<string, { en: string; ar: string } | undefined>>)[subject.slug]?.[locale] ?? subject.description[locale]
}

/** The app directory segment whose opengraph-image.tsx draws the subject's card. */
function segmentOf(subject: MetaSubject): string {
  if (!isPage(subject)) {
    return (ACTION_ROUTES as readonly string[]).includes(subject.slug) ? `/(site)/[locale]/docs/components/${subject.slug}` : '/(site)/[locale]/docs/components/[slug]'
  }
  return { home: '/(site)/[locale]', guide: '/(site)/[locale]/docs/[page]', catalog: '/(site)/[locale]/docs/components', changelog: '/(site)/[locale]/changelog' }[subject.kind]
}

/** The prerendered path of a page's Open Graph image in a locale. */
export function ogImagePathOf(subject: MetaSubject, locale: Locale): string {
  const params = isPage(subject) ? { locale, page: subject.slug } : { locale, slug: subject.slug }
  return fillMetadataSegment(segmentOf(subject), params, 'opengraph-image', false)
}

/** The page's card, with an alt text of its own: Home's title, or the page's name. */
export function ogImageOf(subject: MetaSubject, locale: Locale) {
  const meta = labelsFor(locale).meta
  const alt = isPage(subject) && subject.kind === 'home' ? meta.homeTitle : meta.ogAlt(nameOf(subject, locale))
  return { url: ogImagePathOf(subject, locale), ...OG_SIZE, alt, type: 'image/png' }
}

/** en, ar and x-default (the English URL), each the same page in that language. */
export function alternatesOf(entry: Pick<PageEntry, 'path'>): Record<string, string> {
  return {
    ...Object.fromEntries(LOCALES.map((locale) => [locale, hrefOf(entry, locale)])),
    'x-default': hrefOf(entry, 'en'),
  }
}

export function createMetadata(subject: MetaSubject, locale: Locale): Metadata {
  const title = titleOf(subject, locale)
  const description = descriptionOf(subject, locale)
  const page = { path: pathOf(subject) }
  const url = hrefOf(page, locale)
  const image = ogImageOf(subject, locale)
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, languages: alternatesOf(page) },
    openGraph: {
      type: isPage(subject) && subject.kind === 'home' ? 'website' : 'article',
      url,
      title,
      description,
      siteName: labelsFor(locale).meta.siteName,
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      alternateLocale: locale === 'ar' ? ['en_US'] : ['ar_SA'],
      images: [image],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  }
}
