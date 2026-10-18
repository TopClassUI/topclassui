// /llms.txt (S6): prerendered, since a GET route handler is dynamic unless it opts out (rule 4).
import { LIVE_PAGES, hrefOf } from '../../content/pages'
import { labelsFor } from '../../labels/index'
import { pagedComponents } from '../../lib/components'
import { llmsTextOf } from '../../lib/llms'
import { LOCALES } from '../../lib/locales'
import { SITE_NAME, SITE_URL } from '../../lib/site'

export const dynamic = 'force-static'

export function GET() {
  const sections = LOCALES.flatMap((locale) => [
    {
      heading: labelsFor(locale).llms.docs,
      lines: LIVE_PAGES.filter((page) => page.kind !== 'home').map((page) => ({
        title: page.title[locale],
        path: hrefOf(page, locale),
        description: page.description[locale],
      })),
    },
    {
      heading: labelsFor(locale).llms.components,
      lines: pagedComponents().map((entry) => ({
        title: entry.content.title[locale],
        path: `/${locale}/docs/components/${entry.slug}`,
        description: entry.content.description[locale],
      })),
    },
  ])
  return new Response(llmsTextOf(SITE_NAME, labelsFor('en').llms.summary, SITE_URL, sections), { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
