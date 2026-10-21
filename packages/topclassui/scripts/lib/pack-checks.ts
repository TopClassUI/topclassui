// The tarball rules of the release plan (R5), as pure functions over the packed paths and contents.

/** The files npm always packs beside dist, and size.json, which pnpm size writes for the site's chips. */
export const ROOT_FILES = new Set(['package.json', 'README.md', 'LICENSE', 'CHANGELOG.md', 'size.json'])

/** The round-8 library packs 3,114,237 bytes unpacked; the budget is that plus about 1 % (DECISIONS 2026-10-19). */
export const SIZE_BUDGET_BYTES = 3_250_000

export const REQUIRED_FILES = ['dist/styles.css', 'dist/tokens.css']

/** Paths that must never ship: demos, tests and source maps. */
export function pathProblems(paths: readonly string[]): string[] {
  const problems: string[] = []
  for (const path of paths) {
    if (!path.startsWith('dist/') && !ROOT_FILES.has(path)) problems.push(`${path}: outside dist/`)
    if (path.includes('/dummy/')) problems.push(`${path}: a demo is packed`)
    if (path.includes('/test/')) problems.push(`${path}: a test folder is packed`)
    if (path.includes('.test.')) problems.push(`${path}: a test file is packed`)
    if (path.endsWith('.map')) problems.push(`${path}: a source map is packed`)
  }
  for (const required of REQUIRED_FILES) {
    if (!paths.includes(required)) problems.push(`${required}: missing from the tarball`)
  }
  return problems
}

/** Every module specifier a .js or .d.ts file names: `from 'x'`, `import 'x'`, `import('x')` and the `import("x").T` of a declaration. */
export function specifiersOf(source: string): string[] {
  const out: string[] = []
  for (const match of source.matchAll(/\bfrom\s*(['"])([^'"\n]+)\1|\bimport\s*(['"])([^'"\n]+)\3|\bimport\s*\(\s*(['"])([^'"\n]+)\5\s*\)/g)) {
    out.push(match[2] ?? match[4] ?? match[6] ?? '')
  }
  return out
}

/** A `#` specifier the build should have rewritten, or a relative one without `.js`, which node16 cannot resolve. */
export function specifierProblems(path: string, source: string): string[] {
  const problems: string[] = []
  for (const specifier of specifiersOf(source)) {
    if (specifier.startsWith('#')) problems.push(`${path}: imports ${specifier}, a # specifier the build did not rewrite`)
    else if ((specifier.startsWith('./') || specifier.startsWith('../')) && !specifier.endsWith('.js')) {
      problems.push(`${path}: imports ${specifier}, a relative specifier without .js`)
    }
  }
  return problems
}

export interface PackedManifest {
  imports?: Record<string, unknown>
  exports?: Record<string, unknown>
}

/** Every string target inside one exports value, through its condition objects. */
export function targetsOf(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(targetsOf)
  if (value !== null && typeof value === 'object') return Object.values(value).flatMap(targetsOf)
  return []
}

const patternOf = (target: string) =>
  new RegExp(`^${target.replace(/^\.\//, '').split('*').map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[^]+')}$`)

/** An imports target outside dist, or an exports target that no packed file matches. */
export function manifestProblems(manifest: PackedManifest, paths: readonly string[]): string[] {
  const problems: string[] = []
  for (const [key, target] of Object.entries(manifest.imports ?? {})) {
    if (typeof target !== 'string' || !target.startsWith('./dist/')) problems.push(`imports ${key}: ${String(target)} is outside dist/`)
  }
  for (const [key, value] of Object.entries(manifest.exports ?? {})) {
    for (const target of targetsOf(value)) {
      const matches = target.includes('*') ? paths.some((path) => patternOf(target).test(path)) : paths.includes(target.replace(/^\.\//, ''))
      if (!matches) problems.push(`exports ${key}: ${target} is not in the tarball`)
    }
  }
  return problems
}

export function sizeProblems(unpackedBytes: number, budget = SIZE_BUDGET_BYTES): string[] {
  return unpackedBytes > budget ? [`unpacked size ${String(unpackedBytes)} bytes is over the ${String(budget)} byte budget`] : []
}
