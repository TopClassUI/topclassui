// The four Vitest projects of PLAN 17.1 as data, so a test can prove the
// patterns stay symmetric and no file is run by two projects at once.

export interface Project { name: string; include: string[]; exclude: string[] }

/** One suffix per environment, each excluded from every project that is not its own. */
const SUFFIXES = { dom: 'dom', rsc: 'rsc', ssr: 'ssr' } as const

const not = (...names: Array<keyof typeof SUFFIXES>) =>
  names.map((n) => `src/**/*.${SUFFIXES[n]}.test.{ts,tsx}`)

export const PROJECTS: Project[] = [
  {
    name: 'node',
    include: ['scripts/**/*.test.ts', 'eslint-rules/**/*.test.ts', 'src/**/*.test.ts'],
    exclude: not('dom', 'rsc', 'ssr'),
  },
  { name: 'dom', include: [`src/**/*.${SUFFIXES.dom}.test.{ts,tsx}`], exclude: [] },
  { name: 'rsc', include: [`src/**/*.${SUFFIXES.rsc}.test.{ts,tsx}`], exclude: [] },
  {
    name: 'ssr',
    include: [`src/**/*.${SUFFIXES.ssr}.test.{ts,tsx}`, 'src/**/*.test.tsx'],
    exclude: not('dom', 'rsc'),
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
