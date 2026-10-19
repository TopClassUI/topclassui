import { clamp } from '#shared/clamp.js'
import { BREADCRUMB_BOUNDARIES } from './boundaries.js'
import type { BreadcrumbItem } from './types.js'

/** A crumb's address for a crawler: absolute against `baseUrl`, and as written when no
 * base is given or the pair does not parse, so a bad base never fails a render. */
export function resolveHref(href: string | undefined, baseUrl: string | undefined): string | undefined {
  if (href === undefined || baseUrl === undefined) return href
  try {
    return new URL(href, baseUrl).href
  } catch {
    return href
  }
}

/** The trail as schema.org reads it: only the crumbs that link somewhere, numbered from 1
 * with no gap, because a position names a place in this list and not in `items`. */
export function buildBreadcrumbList(items: readonly BreadcrumbItem[], baseUrl?: string) {
  const linked = items.filter((item) => item.href !== undefined)

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: linked.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: resolveHref(item.href, baseUrl),
    })),
  }
}

/** JSON for a script element. An escaped `<` cannot close the tag or open a comment, and
 * a JSON parser reads `<` back as the same character, so no label is changed. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

/** The crumbs to draw, by their index in the trail, with 'gap' where maxItems folds the middle away:
 * the first crumb, then the last maxItems - 1. A trail that fits, or no maxItems, is drawn whole. */
export function collapseTrail(length: number, maxItems: number | undefined): (number | 'gap')[] {
  const all = Array.from({ length }, (_, index) => index)
  if (maxItems === undefined) return all
  const { min, max } = BREADCRUMB_BOUNDARIES.maxItems
  const keep = clamp(Math.floor(maxItems), min, max)
  if (length <= keep) return all
  return [0, 'gap', ...all.slice(length - (keep - 1))]
}
