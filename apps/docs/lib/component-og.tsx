// A component page's Open Graph image, shared by [slug] and the pages on a route of their own.
import { notFound } from 'next/navigation'

import { COMPONENT_PAGE_LABELS } from '../labels/component-page'
import { chipOf } from './chip'
import { pagedComponentOf } from './components'
import { ogImage, ogLineOf } from './og'

export function componentOgImage(locale: string, slug: string) {
  const entry = pagedComponentOf(slug)
  if (entry === null) notFound()
  return ogImage({
    name: entry.content.title.en,
    chip: chipOf(entry.rendering, entry.slug, COMPONENT_PAGE_LABELS.en.chip),
    line: ogLineOf(locale, `/${locale}/docs/components/${slug}`, entry.content.description.en),
  })
}
