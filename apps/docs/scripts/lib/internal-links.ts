// Every same-origin link in the built HTML resolves to a built route, a redirect that lands on one or a file the site serves (Search Console reported 28 pages of 404).
export interface BuiltPage {
  /** The route the page is served at, such as /en/docs/components/button. */
  path: string
  html: string
}

export interface BrokenLink {
  href: string
  page: string
}

/** One entry of .next/routes-manifest.json's redirects: `regex` captures the params `source` names, in order. */
export interface Redirect {
  source: string
  destination: string
  regex: string
}

/** The site's origin and the three others that serve it: http, and www on either scheme. */
export function originsOf(siteUrl: string): string[] {
  const { host } = new URL(siteUrl)
  const bare = host.replace(/^www\./, '')
  return [siteUrl, ...[bare, `www.${bare}`].flatMap((name) => [`https://${name}`, `http://${name}`])].filter((origin, index, all) => all.indexOf(origin) === index)
}

/** Every link of `html` a crawler follows: href, a form's action and formaction, and the same props in the inline RSC payload, where a closed overlay's links live. */
export function linksOf(html: string): string[] {
  const attribute = (pattern: RegExp) => [...html.matchAll(pattern)].map((match) => decodeEntities(match[1] ?? match[2] ?? ''))
  const flight = [...html.matchAll(/\\"(?:href|action|formAction)\\":\\"((?:\/|\?|https?:)[^"\\]*)\\"/g)].map((match) => match[1] ?? '')
  return [
    ...attribute(/\shref=(?:"([^"]*)"|'([^']*)')/g),
    ...attribute(/<form\b[^>]*?\saction=(?:"([^"]*)"|'([^']*)')/gi),
    ...attribute(/\sformaction=(?:"([^"]*)"|'([^']*)')/gi),
    ...flight,
  ]
}

function decodeEntities(value: string): string {
  return value.replace(/&(amp|quot|#39|#x27|lt|gt);/g, (_, name: string) => ({ amp: '&', quot: '"', '#39': "'", '#x27': "'", lt: '<', gt: '>' })[name] ?? '')
}

/** The still-encoded path `href` names on one of `origins`, read from `page`; null for a fragment, another origin or a scheme the site does not serve. */
export function sameOriginPath(href: string, page: string, origins: readonly string[]): string | null {
  const trimmed = href.trim()
  if (trimmed === '' || trimmed.startsWith('#')) return null
  let url: URL
  try {
    url = new URL(trimmed, `${origins[0] ?? ''}${page}`)
  } catch {
    return null
  }
  return origins.includes(url.origin) ? url.pathname : null
}

/** Where the first redirect matching `path` sends it, its params substituted; null when none matches. */
export function redirectTarget(path: string, redirects: readonly Redirect[]): string | null {
  for (const redirect of redirects) {
    const match = new RegExp(redirect.regex).exec(path)
    if (match === null) continue
    const names = [...redirect.source.matchAll(/:(\w+)/g)].map((param) => param[1] ?? '')
    const destination = names.reduce<string>((target, name, index) => target.replace(new RegExp(`:${name}(?:\\([^)]*\\))?[+*?]?`), match[index + 1] ?? ''), redirect.destination)
    return new URL(destination, 'https://redirect.invalid').pathname
  }
  return null
}

/** Whether `path` is built, or reaches a built path through at most five redirects. */
function resolves(path: string, isBuilt: (path: string) => boolean, redirects: readonly Redirect[]): boolean {
  let current: string | null = path
  for (let hop = 0; hop <= 5 && current !== null; hop += 1) {
    if (isBuilt(current)) return true
    current = redirectTarget(current, redirects)
  }
  return false
}

/** The same-origin links of `pages` that reach nothing, once per page and link, in page order; a path that does not decode is one of them. */
export function brokenLinks(pages: readonly BuiltPage[], origins: readonly string[], isBuilt: (path: string) => boolean, redirects: readonly Redirect[]): BrokenLink[] {
  const broken: BrokenLink[] = []
  for (const page of pages) {
    const seen = new Set<string>()
    for (const href of linksOf(page.html)) {
      const path = sameOriginPath(href, page.path, origins)
      if (path === null || seen.has(href)) continue
      seen.add(href)
      let decoded: string
      try {
        decoded = decodeURIComponent(path)
      } catch {
        broken.push({ href, page: page.path })
        continue
      }
      if (!resolves(decoded, isBuilt, redirects)) broken.push({ href, page: page.path })
    }
  }
  return broken
}
