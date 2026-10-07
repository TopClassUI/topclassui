// A value-import graph over src/, because a per-file grep cannot see that
// types.ts -> schema.ts -> zod puts zod in the browser (R-8.3-1).
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

/** Read from package.json, or a new subpath silently stops the walk (R-5.12-5). */
export function readSubpaths(root: string): ReadonlyArray<readonly [string, string]> {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
    imports?: Record<string, string>
  }
  return Object.entries(pkg.imports ?? {})
    .filter(([key, value]) => key.endsWith('/*') && value.endsWith('/*'))
    .map(([key, value]) => [key.slice(0, -1), value.slice(2, -1)] as const)
}

/** A specifier no subpath matched, reported rather than treated as a package. */
export const UNKNOWN_SUBPATH = 'unresolved-subpath:'

const QUOTE = String.raw`['"\`]`
const NOT_QUOTE = String.raw`[^'"\`]`

/** Unanchored: `/* c *\/ import`, `;import` and a second import on one line all count. */
const VALUE_IMPORT = [
  new RegExp(String.raw`\bimport\b(?![ \t]+type\b)${NOT_QUOTE}*?(?:from\s*)?(${QUOTE})(${NOT_QUOTE}+)\1`, 'g'),
  new RegExp(String.raw`\bexport\b(?![ \t]+type\b)${NOT_QUOTE}*?from\s*(${QUOTE})(${NOT_QUOTE}+)\1`, 'g'),
  new RegExp(String.raw`\bimport\s*\(\s*(${QUOTE})(${NOT_QUOTE}+)\1\s*\)`, 'g'),
  new RegExp(String.raw`\brequire\s*\(\s*(${QUOTE})(${NOT_QUOTE}+)\1\s*\)`, 'g'),
]

/** Blanked, not removed, so a commented-out import cannot hide a real one behind it. */
export function blankComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, (m) => m.replace(/[^\n]/g, ' '))
}

/** `zod/v4` and `zod?raw` are the same package as `zod`, which a raw compare misses. */
export function packageName(specifier: string): string {
  const clean = specifier.split('?')[0] ?? specifier
  const parts = clean.split('/')
  return clean.startsWith('@') ? parts.slice(0, 2).join('/') : (parts[0] ?? clean)
}

/** The specifiers a file pulls in at runtime; `import type` lines are left out. */
export function valueImports(source: string): string[] {
  const code = blankComments(source)
  const found = new Set<string>()
  for (const pattern of VALUE_IMPORT) {
    for (const match of code.matchAll(pattern)) if (match[2]) found.add(match[2])
  }
  return [...found]
}

/** A source file for a specifier, or null for a bare package such as `zod`. */
export function resolveSpecifier(
  specifier: string,
  from: string,
  root: string,
  subpaths = readSubpaths(root),
): string | null {
  let target: string | null = null
  if (specifier.startsWith('.')) target = resolve(dirname(from), specifier)
  for (const [prefix, folder] of subpaths) {
    if (specifier.startsWith(prefix)) target = join(root, folder, specifier.slice(prefix.length))
  }
  // A new subpath must be taught here, never pass as an external package nobody follows.
  if (target === null) return specifier.startsWith('#') ? UNKNOWN_SUBPATH + specifier : null

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
  /** The bare package names a file pulls in at runtime, transitively. */
  packages: (entry: string) => Set<string>
  /** The bare specifiers as written, so `zod/mini` is not collapsed to `zod`. */
  specifiers: (entry: string) => Set<string>
}

export function buildGraph(files: readonly string[], root: string): Graph {
  const edges = new Map<string, string[]>()
  const bare = new Map<string, string[]>()
  const written = new Map<string, string[]>()
  const subpaths = readSubpaths(root)

  for (const file of files) {
    const local: string[] = []
    const external: string[] = []
    const exact: string[] = []
    for (const specifier of valueImports(readFileSync(file, 'utf8'))) {
      const target = resolveSpecifier(specifier, file, root, subpaths)
      if (target === null) { external.push(packageName(specifier)); exact.push(specifier) }
      else if (target.startsWith(UNKNOWN_SUBPATH)) external.push(target)
      else local.push(target)
    }
    edges.set(file, local)
    bare.set(file, external)
    written.set(file, exact)
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
    specifiers: (entry) => {
      const out = new Set<string>()
      for (const file of walk(entry)) for (const name of written.get(file) ?? []) out.add(name)
      return out
    },
  }
}
