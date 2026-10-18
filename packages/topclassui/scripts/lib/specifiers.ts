// The pure half of scripts/build.ts: what dist must look like once tsc has emitted it.
// Every path here is a POSIX path relative to the package folder; a Windows path is
// normalised on the way in, because path.relative alone would write backslashes.
import { posix } from 'node:path'

/** The package.json `imports` aliases the build rewrites, each to its folder under dist. */
export const ALIASES = { '#shared/': 'shared/', '#icons/': 'icons/', '#components/': 'components/' } as const

export const DIST = 'dist'

/** The directive tsc keeps on the first line of a client file. */
export const USE_CLIENT = "'use client'"

export const toPosix = (path: string): string => path.replaceAll('\\', '/')

// A specifier position: after `from`, `import` or `import(`; never a string elsewhere, such as '#fff'.
const SPECIFIER = /(\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)(["'])(#[^"']*)\2/g

/** `dist/components/dialog/client.js` + `#shared/cn.js` gives `../../shared/cn.js`; null for an unknown alias. */
export function rewriteSpecifier(file: string, specifier: string): string | null {
  const alias = (Object.keys(ALIASES) as (keyof typeof ALIASES)[]).find((a) => specifier.startsWith(a))
  if (alias === undefined) return null
  const target = posix.join(DIST, ALIASES[alias], specifier.slice(alias.length))
  const relative = posix.relative(posix.dirname(toPosix(file)), target)
  return relative.startsWith('.') ? relative : `./${relative}`
}

export interface Rewrite {
  code: string
  rewritten: number
  /** The `#` specifiers no alias covers, such as `#test/`, which must never reach dist. */
  leftover: string[]
}

/** Rewrites every aliased specifier in one emitted file, in imports, re-exports and import() types alike. */
export function rewriteSource(file: string, code: string): Rewrite {
  let rewritten = 0
  const leftover: string[] = []
  const out = code.replace(SPECIFIER, (match, lead: string, quote: string, specifier: string) => {
    const relative = rewriteSpecifier(file, specifier)
    if (relative === null) {
      leftover.push(specifier)
      return match
    }
    rewritten += 1
    return `${lead}${quote}${relative}${quote}`
  })
  return { code: out, rewritten, leftover }
}

/** The files tsconfig.build.json compiles: everything under src bar the tests and their helpers. */
export function isCompiledSource(path: string): boolean {
  const p = toPosix(path)
  return /^src\/.*\.tsx?$/.test(p) && !/\.test\.tsx?$/.test(p) && !p.includes('/test/')
}

/** The .js tsc writes for a source file: `src/components/x/client.tsx` gives `dist/components/x/client.js`. */
export function outputFor(source: string): string {
  return toPosix(source).replace(/^src\//, `${DIST}/`).replace(/\.tsx?$/, '.js')
}

/** Whether an emitted or source file still opens with the client directive, in either quote style. */
export function startsWithUseClient(code: string): boolean {
  return /^(['"])use client\1/.test(code)
}

/** The line tsc --watch prints after each pass; the post-processing runs once per such line. */
export function isWatchSummary(line: string): boolean {
  return /Found \d+ errors?\./.test(line)
}

/** The error count in a watch summary line, so the pass is skipped while tsc reports errors. */
export function watchErrors(line: string): number {
  const found = /Found (\d+) errors?\./.exec(line)
  return found === null ? 0 : Number(found[1])
}
