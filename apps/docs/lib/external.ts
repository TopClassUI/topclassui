// Every link that leaves the site carries this rel: no window.opener and no Referer for the other origin.
export const EXTERNAL_REL = 'noopener noreferrer'

/** An absolute http(s) link, which leaves the site. */
export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href)
}
