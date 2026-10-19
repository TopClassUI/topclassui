// The site's JSON-LD (docs-site S6), one builder per page type; BreadcrumbList is the library Breadcrumb's, through siteUrl.
import type { CollectionPage, Organization, SoftwareSourceCode, TechArticle, WebSite, WithContext } from 'schema-dts'

import { hrefOf, type Locale, type PageEntry } from '../content/pages'
import { labelsFor } from '../labels/index'
import type { PagedComponent } from './components'
import { type MetaSubject, descriptionOf, nameOf, ogImagePathOf, pathOf } from './metadata'
import { GITHUB_URL, NEXT_RANGE, NPM_URL, PEERS, SITE_NAME, SITE_URL, VERSION, YOUTUBE_URL, absolute } from './site'

const CONTEXT = 'https://schema.org'
export const ORGANIZATION_ID = `${SITE_URL}/#organization`
/** The 512 px icon (app/icon-512.png): Google asks for a logo of at least 112 px, square. */
export const LOGO_PATH = '/icon-512.png'

const websiteId = (locale: Locale) => `${absolute(`/${locale}`)}#website`
const urlOf = (subject: MetaSubject, locale: Locale) => absolute(hrefOf({ path: pathOf(subject) }, locale))
const publisher = { '@type': 'Organization', '@id': ORGANIZATION_ID, name: SITE_NAME, logo: absolute(LOGO_PATH) } as const

export function organizationData(): WithContext<Organization> {
  const sameAs = [GITHUB_URL, NPM_URL, YOUTUBE_URL].filter((url): url is string => url !== null)
  return {
    '@context': CONTEXT,
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: absolute(LOGO_PATH), width: '512', height: '512' },
    sameAs,
  }
}

export function websiteData(locale: Locale): WithContext<WebSite> {
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    '@id': websiteId(locale),
    name: SITE_NAME,
    url: absolute(`/${locale}`),
    inLanguage: locale,
    publisher: { '@id': ORGANIZATION_ID },
  }
}

export function sourceCodeData(home: PageEntry, locale: Locale): WithContext<SoftwareSourceCode> {
  return {
    '@context': CONTEXT,
    '@type': 'SoftwareSourceCode',
    name: SITE_NAME,
    description: descriptionOf(home, locale),
    url: urlOf(home, locale),
    programmingLanguage: 'TypeScript',
    runtimePlatform: 'React',
    license: 'https://opensource.org/licenses/MIT',
    version: VERSION,
    author: { '@id': ORGANIZATION_ID },
    ...(GITHUB_URL === null ? {} : { codeRepository: GITHUB_URL }),
  }
}

/** A component's page: what it is, in which language, when it last changed, and its card. */
export function componentArticleData(entry: PagedComponent, locale: Locale, modified: string | null): WithContext<TechArticle> {
  const url = urlOf(entry, locale)
  return {
    '@context': CONTEXT,
    '@type': 'TechArticle',
    headline: nameOf(entry, locale),
    description: descriptionOf(entry, locale),
    inLanguage: locale,
    url,
    mainEntityOfPage: url,
    image: absolute(ogImagePathOf(entry, locale)),
    ...(modified === null ? {} : { dateModified: modified }),
    publisher,
    isPartOf: { '@id': websiteId(locale) },
  }
}

/** A guide or the changelog: the component article's fields, plus its author, section, prerequisites and subject. */
export function guideArticleData(entry: PageEntry, locale: Locale, modified: string | null): WithContext<TechArticle> {
  const url = urlOf(entry, locale)
  return {
    '@context': CONTEXT,
    '@type': 'TechArticle',
    headline: nameOf(entry, locale),
    description: descriptionOf(entry, locale),
    inLanguage: locale,
    url,
    mainEntityOfPage: url,
    image: absolute(ogImagePathOf(entry, locale)),
    ...(modified === null ? {} : { dateModified: modified }),
    author: { '@id': ORGANIZATION_ID },
    publisher,
    isPartOf: { '@id': websiteId(locale) },
    articleSection: labelsFor(locale).shell.groups[entry.group],
    dependencies: `React ${PEERS.react}, Tailwind CSS ${PEERS.tailwindcss}, Next.js ${NEXT_RANGE}`,
    about: { '@type': 'SoftwareSourceCode', name: SITE_NAME, ...(GITHUB_URL === null ? {} : { codeRepository: GITHUB_URL }) },
  }
}

/** The catalog: a collection page whose main entity lists every component page in order. */
export function catalogData(entry: PageEntry, locale: Locale, components: readonly PagedComponent[]): WithContext<CollectionPage> {
  const url = urlOf(entry, locale)
  return {
    '@context': CONTEXT,
    '@type': 'CollectionPage',
    name: nameOf(entry, locale),
    description: descriptionOf(entry, locale),
    inLanguage: locale,
    url,
    isPartOf: { '@id': websiteId(locale) },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: components.length,
      itemListElement: components.map((component, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: nameOf(component, locale),
        url: urlOf(component, locale),
      })),
    },
  }
}
