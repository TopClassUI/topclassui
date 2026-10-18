// The import forms the library's own linted source uses. The registry build fails on any
// `#` specifier these do not recognise, so the copy-time rewrite never meets one it misses.
import { posix } from 'node:path'

/** The package.json `imports` aliases, each to its folder inside the copied tree. */
export const ALIASES = { '#shared/': 'shared/', '#icons/': 'icons/', '#components/': 'components/' } as const

/** A specifier position: after `from`, `import` or `import(`; never a string elsewhere, such as '#fff'. */
const LOCAL = /(\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)(["'])((?:#|\.\.?\/)[^"']*)\2/g

/** Static imports and re-exports start a line; `import(` may sit anywhere, `typeof import(...)` included. */
const STATIC = /^(?:import|export)\b[^'"`;]*?\bfrom\s*(["'])([^"'\n]+)\1/gm
const BARE = /^import\s*(["'])([^"'\n]+)\1/gm
const DYNAMIC = /\bimport\s*\(\s*(["'])([^"'\n]+)\1\s*\)/g

export const toPosix = (path: string): string => path.replaceAll('\\', '/')

/** Blanked, not removed, so line numbers and a later import stay where they were. */
export function blankComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\/|(?<![:'"`\w])\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, ' '))
}

/** Every specifier a source file names, type-only imports included, because a copy must type-check. */
export function specifiersOf(source: string): string[] {
  const code = blankComments(source)
  const found = new Set<string>()
  for (const pattern of [STATIC, BARE, DYNAMIC]) {
    for (const match of code.matchAll(pattern)) if (match[2]) found.add(match[2])
  }
  return [...found]
}

/** `zod/mini` and `@base-ui/react/dialog` belong to `zod` and `@base-ui/react`. */
export function packageName(specifier: string): string {
  const parts = specifier.split('/')
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : (parts[0] ?? specifier)
}

export const isLocal = (specifier: string): boolean => specifier.startsWith('#') || specifier.startsWith('.')

/** The tree path an aliased specifier names, such as `#shared/cn.js` to `shared/cn.js`; null for `#test/`. */
export function aliasTarget(specifier: string): string | null {
  const alias = (Object.keys(ALIASES) as (keyof typeof ALIASES)[]).find((a) => specifier.startsWith(a))
  return alias === undefined ? null : ALIASES[alias] + specifier.slice(alias.length)
}

export interface SpecifierOptions {
  /** `bundler` drops the `.js` of every relative specifier; `node16` and `nodenext` keep it. */
  stripJs: boolean
}

/** `components/dialog/client.tsx` + `#shared/cn.js` gives `../../shared/cn`; relative ones only lose `.js`. */
export function rewriteSpecifier(file: string, specifier: string, options: SpecifierOptions): string | null {
  let relative = specifier
  if (specifier.startsWith('#')) {
    const target = aliasTarget(specifier)
    if (target === null) return null
    relative = posix.relative(posix.dirname(toPosix(file)), target)
    if (!relative.startsWith('.')) relative = `./${relative}`
  }
  return options.stripJs ? relative.replace(/\.js$/, '') : relative
}

export interface Rewritten {
  code: string
  /** The `#` specifiers no alias covers; the registry build refuses a file that has one. */
  leftover: string[]
}

/** Rewrites every local specifier of one file, in imports, re-exports and `import()` types alike. */
export function rewriteSpecifiers(file: string, code: string, options: SpecifierOptions): Rewritten {
  const leftover: string[] = []
  const out = code.replace(LOCAL, (match, lead: string, quote: string, specifier: string) => {
    const next = rewriteSpecifier(file, specifier, options)
    if (next === null) {
      leftover.push(specifier)
      return match
    }
    return `${lead}${quote}${next}${quote}`
  })
  return { code: out, leftover }
}
