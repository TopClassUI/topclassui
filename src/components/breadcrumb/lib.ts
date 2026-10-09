import type { BreadcrumbItem } from './types.js'

/** The trail as schema.org reads it: only the crumbs that link somewhere, numbered from 1
 * with no gap, because a position names a place in this list and not in `items`. */
export function buildBreadcrumbList(items: readonly BreadcrumbItem[]) {
  const linked = items.filter((item) => item.href !== undefined)

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: linked.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href,
    })),
  }
}

/** JSON for a script element. An escaped `<` cannot close the tag or open a comment, and
 * a JSON parser reads `<` back as the same character, so no label is changed. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
