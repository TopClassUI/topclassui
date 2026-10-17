// A demo's source is what the reader copies, so its imports become the ones a user writes.
export type ExportTarget = string | { types?: string; default?: string }
export type ExportsMap = Readonly<Record<string, ExportTarget>>

export const PACKAGE = 'topclassui'

/** Modules a public entry re-exports: types.ts and skeleton.tsx through index.tsx (R-5.1-2), icon types through icons/index. */
const REEXPORTED: Readonly<Record<string, string>> = {
  '../types.js': '../index.js',
  '../skeleton.js': '../index.js',
  '#icons/types.js': '#icons/index.js',
}

const SPECIFIER = /(\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])([^'"\n]+)\2/g

/** Where a source specifier lands in the package's dist, or null when it is not the library's own. */
export function distPathOf(specifier: string, slug: string): string | null {
  const s = REEXPORTED[specifier] ?? specifier
  if (s.startsWith('../')) return `./dist/components/${slug}/${s.slice(3)}`
  for (const folder of ['components', 'shared', 'icons']) {
    if (s.startsWith(`#${folder}/`)) return `./dist/${folder}/${s.slice(folder.length + 2)}`
  }
  return null
}

const targetOf = (target: ExportTarget) => (typeof target === 'string' ? target : target.default)

/** The public subpath that exports a dist file, read from the exports map; exact keys win over patterns. */
export function publicSubpath(distPath: string, exportsMap: ExportsMap): string | null {
  const entries = Object.entries(exportsMap)
  for (const [key, value] of entries) {
    if (!key.includes('*') && targetOf(value) === distPath) return `${PACKAGE}${key.slice(1)}`
  }
  for (const [key, value] of entries) {
    const target = targetOf(value)
    if (!key.includes('*') || target === undefined) continue
    const [before = '', after = ''] = target.split('*')
    if (!distPath.startsWith(before) || !distPath.endsWith(after) || distPath.length < before.length + after.length) continue
    const middle = distPath.slice(before.length, distPath.length - after.length)
    if (middle !== '' && !middle.includes('/')) return `${PACKAGE}${key.slice(1).replace('*', middle)}`
  }
  return null
}

export interface Rewritten {
  code: string
  /** Every library specifier with no public subpath: the build fails on any. */
  unresolved: string[]
}

/** Rewrites the library's own specifiers in one demo; a package such as `react` is left as written. */
export function rewriteImports(source: string, slug: string, exportsMap: ExportsMap): Rewritten {
  const unresolved: string[] = []
  const code = source.replace(SPECIFIER, (whole, lead: string, quote: string, specifier: string) => {
    if (!specifier.startsWith('#') && !specifier.startsWith('.')) return whole
    const dist = distPathOf(specifier, slug)
    const subpath = dist === null ? null : publicSubpath(dist, exportsMap)
    if (subpath === null) {
      unresolved.push(specifier)
      return whole
    }
    return `${lead}${quote}${subpath}${quote}`
  })
  return { code, unresolved }
}

/** Every module specifier a source imports, in order. */
export function specifiersOf(source: string): string[] {
  return [...source.matchAll(SPECIFIER)].map((match) => match[3] ?? '')
}

/** The package root named bare, in an import or in a string: no such import resolves (no "." export). */
export function namesBareRoot(source: string): boolean {
  return /(['"`])topclassui\1/.test(source)
}
