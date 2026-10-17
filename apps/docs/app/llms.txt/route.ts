// /llms.txt (S6): prerendered, since a GET route handler is dynamic unless it opts out (rule 4).
import { CATALOG_LABELS } from '../../labels/catalog'
import { LLMS_LABELS } from '../../labels/llms'
import { pagedComponents } from '../../lib/components'
import { llmsTextOf } from '../../lib/llms'
import { LOCALES } from '../../lib/locales'
import { SITE_NAME, SITE_URL } from '../../lib/site'

export const dynamic = 'force-static'

export function GET() {
  const sections = LOCALES.flatMap((locale) => [
    { heading: LLMS_LABELS[locale].docs, lines: [{ title: CATALOG_LABELS[locale].title, path: `/${locale}/docs/components`, description: CATALOG_LABELS[locale].description }] },
    {
      heading: LLMS_LABELS[locale].components,
      lines: pagedComponents().map((entry) => ({
        title: entry.content.title[locale],
        path: `/${locale}/docs/components/${entry.slug}`,
        description: entry.content.description[locale],
      })),
    },
  ])
  return new Response(llmsTextOf(SITE_NAME, LLMS_LABELS.en.summary, SITE_URL, sections), { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
