import type { MetadataRoute } from 'next'

import { LIVE_PAGES, LOCALES, hrefOf } from '../content/pages'
import { pagedComponents } from '../lib/components'
import { componentDate, pageDate } from '../lib/data'
import { alternatesOf } from '../lib/metadata'
import { absolute } from '../lib/site'

function entriesOf(path: string, date: string | null): MetadataRoute.Sitemap {
  const page = { path }
  const languages = Object.fromEntries(Object.entries(alternatesOf(page)).map(([lang, href]) => [lang, absolute(href)]))
  return LOCALES.map((locale) => ({
    url: absolute(hrefOf(page, locale)),
    ...(date === null ? {} : { lastModified: date }),
    alternates: { languages },
  }))
}

/** Every live page, then every component page, in both locales, each with its hreflang alternates and its last commit date, never the build clock. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...LIVE_PAGES.flatMap((page) => entriesOf(page.path, pageDate(page.slug))),
    ...pagedComponents().flatMap((entry) => entriesOf(`/docs/components/${entry.slug}`, componentDate(entry.slug))),
  ]
}
