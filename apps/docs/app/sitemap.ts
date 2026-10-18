import type { MetadataRoute } from 'next'

import { LIVE_PAGES, LOCALES, hrefOf } from '../content/pages'
import { pageDate } from '../lib/data'
import { alternatesOf } from '../lib/metadata'
import { absolute } from '../lib/site'

/** Every live page in both locales, each with its hreflang alternates and its last commit date, never the build clock. */
export default function sitemap(): MetadataRoute.Sitemap {
  return LIVE_PAGES.flatMap((page) => {
    const date = pageDate(page.slug)
    const languages = Object.fromEntries(Object.entries(alternatesOf(page)).map(([lang, path]) => [lang, absolute(path)]))
    return LOCALES.map((locale) => ({
      url: absolute(hrefOf(page, locale)),
      ...(date === null ? {} : { lastModified: date }),
      alternates: { languages },
    }))
  })
}
