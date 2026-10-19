// The one absolute origin every URL on the site is built from (docs-site S6), and the facts read from the package.
import pkg from 'topclassui/package.json' with { type: 'json' }

export const SITE_URL = 'https://topclassui.com'

/** The product's name, the same in both languages. */
export const SITE_NAME = 'TopClass UI'

/** Choice 12: the repository is public, so the navbar, Home and the footer link to it. */
export const GITHUB_URL: string | null = 'https://github.com/TopClassUI/topclassui'

export const YOUTUBE_URL: string | null = 'https://www.youtube.com/@topclassui'

/** Left out until there is a handle: a link to nothing is never drawn (choice 12). */
export const X_URL: string | null = null

/** The one handle Home's Follow us cards print, the same on every network. */
export const HANDLE = '@topclassui'

/** The CLI's line on Home: one component copied into the project. */
export const ADD_LINE = 'npx topclassui add button'

/** PLAN 2: Next.js 14 and older are not supported; the package declares no peer on next. */
export const NEXT_RANGE = '15+'

/** What a server-rendered component adds to the page; a unit, the same in both languages. */
export const ZERO_KB = '0 KB'

export const VERSION: string = pkg.version

/** True while the version carries a prerelease tag, such as 0.1.0-beta.0. */
export const PRERELEASE = VERSION.includes('-')

/** The one install line every page prints (docs-site S8). */
export const INSTALL_LINE = PRERELEASE ? 'npm i topclassui@beta zod' : 'npm i topclassui zod'

/** "^19.0.0" reads "19+", "^4.2.0" reads "4.2+": the floor of a caret range. */
export function floorOf(range: string): string {
  const [major = '0', minor = '0'] = range.replace(/^[\^~>=\s]+/, '').split('.')
  return minor === '0' ? `${major}+` : `${major}.${minor}+`
}

export const PEERS = {
  react: floorOf(pkg.peerDependencies.react),
  tailwindcss: floorOf(pkg.peerDependencies.tailwindcss),
} as const

export function absolute(path: string): string {
  return `${SITE_URL}${path}`
}
