// A value-import graph over src/, because a per-file grep cannot see that
// types.ts -> schema.ts -> zod puts zod in the browser (R-8.3-1).
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

/** The subpath prefixes of package.json "imports", which tsc does not rewrite. */
const SUBPATHS: ReadonlyArray<readonly [string, string]> = [
  ['#shared/', 'shared/'],
  ['#icons/', 'icons/'],
  ['#components/', 'components/'],
]

const VALUE_IMPORT = [
  // import x from 'y', import 'y', import { type A, B } from 'y'
  /^[ \t]*import\s+(?!type\s)(?:[^'"]*?from\s*)?['"]([^'"]+)['"]/gm,
  // export { x } from 'y', export * from 'y'
  /^[ \t]*export\s+(?!type\s)[^'"]*?from\s*['"]([^'"]+)['"]/gm,
  // await import('y') and require('y')
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
]

/** The specifiers a file pulls in at runtime; `import type` lines are left out. */
export function valueImports(source: string): string[] {
  const found = new Set<string>()
  for (const pattern of VALUE_IMPORT) {
    for (const match of source.matchAll(pattern)) if (match[1]) found.add(match[1])
  }
  return [...found]
}

/** A source file for a specifier, or null for a bare package such as `zod`. */
export function resolveSpecifier(specifier: string, from: string, src: string): string | null {
  let target: string | null = null
  if (specifier.startsWith('.')) target = resolve(dirname(from), specifier)
  for (const [prefix, folder] of SUBPATHS) {
    if (specifier.startsWith(prefix)) target = join(src, folder, specifier.slice(prefix.length))
  }
  if (target === null) return null

  // Relative imports carry .js (R-5.12-5), so the source beside it is .ts or .tsx.
  const base = target.replace(/\.js$/, '')
  for (const candidate of [`${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), join(base, 'index.tsx')]) {
    if (existsSync(candidate)) return candidate
  }
  return null
}

export interface Graph {
  /** Every file reachable from `entry` through value imports, including itself. */
  reachable: (entry: string) => Set<string>
  /** The bare packages a file pulls in at runtime, transitively. */
  packages: (entry: string) => Set<string>
}

export function buildGraph(files: readonly string[], src: string): Graph {
  const edges = new Map<string, string[]>()
  const bare = new Map<string, string[]>()

  for (const file of files) {
    const specifiers = valueImports(readFileSync(file, 'utf8'))
    const local: string[] = []
    const external: string[] = []
    for (const specifier of specifiers) {
      const target = resolveSpecifier(specifier, file, src)
      if (target === null) external.push(specifier)
      else local.push(target)
    }
    edges.set(file, local)
    bare.set(file, external)
  }

  const walk = (entry: string) => {
    const seen = new Set<string>()
    const queue = [entry]
    while (queue.length > 0) {
      const next = queue.pop()
      if (next === undefined || seen.has(next)) continue
      seen.add(next)
      for (const edge of edges.get(next) ?? []) queue.push(edge)
    }
    return seen
  }

  return {
    reachable: walk,
    packages: (entry) => {
      const out = new Set<string>()
      for (const file of walk(entry)) for (const name of bare.get(file) ?? []) out.add(name)
      return out
    },
  }
}
