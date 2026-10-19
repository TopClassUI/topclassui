import type { BreadcrumbItem } from './types.js'

/** The origin a crumb resolves against, or undefined when `siteUrl` is not an http or https
 * URL, so a typo in an environment variable writes no JSON-LD instead of failing a render. */
export function resolveOrigin(siteUrl: string): string | undefined {
  try {
    const url = new URL(siteUrl)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.origin : undefined
  } catch {
    return undefined
  }
}

/** A crumb's absolute address, and the href as written when the pair does not parse. */
export function resolveHref(href: string, origin: string): string {
  try {
    return new URL(href, origin).href
  } catch {
    return href
  }
}

/** The trail as schema.org reads it, or null without a usable `siteUrl` or a single link: the
 * linked crumbs with absolute URLs, then the current page with no `item`, numbered from 1. */
export function buildBreadcrumbList(items: readonly BreadcrumbItem[], siteUrl: string | undefined) {
  const origin = siteUrl === undefined ? undefined : resolveOrigin(siteUrl)
  if (origin === undefined) return null
  const lastIndex = items.length - 1
  const listed = items.filter((item, index) => item.href !== undefined || index === lastIndex)
  if (!listed.some((item) => item.href !== undefined)) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: listed.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href === undefined ? {} : { item: resolveHref(item.href, origin) }),
    })),
  }
}

/** JSON for a script element. An escaped `<` cannot close the tag or open a comment, and
 * a JSON parser reads `<` back as the same character, so no label is changed. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
