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
