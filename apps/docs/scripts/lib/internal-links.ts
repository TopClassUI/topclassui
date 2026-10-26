// Every same-origin href in the built HTML resolves to a built route, a redirect the site defines or a file it serves (Search Console reported 28 pages of 404).
export interface BuiltPage {
  /** The route the page is served at, such as /en/docs/components/button. */
  path: string
  html: string
}

export interface BrokenLink {
  href: string
  page: string
}

/** Every href attribute value in `html`, entities decoded. */
export function hrefsOf(html: string): string[] {
  return [...html.matchAll(/\shref=(?:"([^"]*)"|'([^']*)')/g)].map((match) => decodeEntities(match[1] ?? match[2] ?? ''))
}

function decodeEntities(value: string): string {
  return value.replace(/&(amp|quot|#39|#x27|lt|gt);/g, (_, name: string) => ({ amp: '&', quot: '"', '#39': "'", '#x27': "'", lt: '<', gt: '>' })[name] ?? '')
}

/** The path `href` names on `origin`, read from `page`; null for a fragment, another origin or a scheme the site does not serve. */
export function sameOriginPath(href: string, page: string, origin: string): string | null {
  const trimmed = href.trim()
  if (trimmed === '' || trimmed.startsWith('#')) return null
  let url: URL
  try {
    url = new URL(trimmed, `${origin}${page}`)
  } catch {
    return null
  }
  if (url.origin !== origin) return null
  return decodeURIComponent(url.pathname)
}

/** The same-origin hrefs of `pages` that `resolves` does not accept, once per page and href, in page order. */
export function brokenLinks(pages: readonly BuiltPage[], origin: string, resolves: (path: string) => boolean): BrokenLink[] {
  const broken: BrokenLink[] = []
  for (const page of pages) {
    const seen = new Set<string>()
    for (const href of hrefsOf(page.html)) {
      const path = sameOriginPath(href, page.path, origin)
      if (path === null || seen.has(href) || resolves(path)) continue
      seen.add(href)
      broken.push({ href, page: page.path })
    }
  }
  return broken
}
