// The four Vitest projects of PLAN 17.1 as data, so a test can prove the
// patterns stay symmetric and no file is run by two projects at once.

export interface Project {
  name: string
  /** The filename suffix this project owns, or null for the plain .test.ts default. */
  owns: Suffix | null
  include: string[]
  exclude: string[]
}

/** One suffix per environment. Adding one here reaches every project's exclude. */
export const SUFFIXES = { dom: 'dom', rsc: 'rsc', ssr: 'ssr' } as const
export type Suffix = keyof typeof SUFFIXES

export const patternFor = (suffix: Suffix): string => `src/**/*.${SUFFIXES[suffix]}.test.{ts,tsx}`

/** Every suffix this project does not own, so no file is ever run by two projects. */
const otherSuffixes = (owns: Suffix | null) =>
  (Object.keys(SUFFIXES) as Suffix[]).filter((s) => s !== owns).map(patternFor)

export const PROJECTS: Project[] = [
  {
    name: 'node',
    owns: null,
    include: ['scripts/**/*.test.ts', 'eslint-rules/**/*.test.ts', 'src/**/*.test.ts'],
    exclude: otherSuffixes(null),
  },
  { name: 'dom', owns: 'dom', include: [patternFor('dom')], exclude: otherSuffixes('dom') },
  { name: 'rsc', owns: 'rsc', include: [patternFor('rsc')], exclude: otherSuffixes('rsc') },
  {
    name: 'ssr',
    owns: 'ssr',
    include: [patternFor('ssr'), 'src/**/*.test.tsx'],
    exclude: otherSuffixes('ssr'),
  },
]

/** The subset of glob syntax these patterns use: `**`, `*` and one `{a,b}` list. */
export function globToRegExp(pattern: string): RegExp {
  let out = ''
  for (let i = 0; i < pattern.length; i++) {
    const rest = pattern.slice(i)
    if (rest.startsWith('**/')) { out += '(?:[^/]+/)*'; i += 2; continue }
    if (rest.startsWith('**')) { out += '.*'; i += 1; continue }
    if (rest.startsWith('*')) { out += '[^/]*'; continue }
    if (rest.startsWith('{')) {
      const end = pattern.indexOf('}', i)
      if (end < 0) throw new Error(`unclosed { in ${pattern}`)
      out += `(?:${pattern.slice(i + 1, end).split(',').map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`
      i = end
      continue
    }
    out += rest[0]?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') ?? ''
  }
  return new RegExp(`^${out}$`)
}

const matchesAny = (patterns: readonly string[], file: string) =>
  patterns.some((p) => globToRegExp(p).test(file))

/** The projects that would run `file`, as a repository-relative POSIX path. */
export function projectsFor(file: string): string[] {
  return PROJECTS
    .filter((p) => matchesAny(p.include, file) && !matchesAny(p.exclude, file))
    .map((p) => p.name)
}
